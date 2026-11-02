from datetime import date
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.config import Settings, get_settings
from app.llm import Llm, LlmMessage, LlmUnavailable, get_llm
from app.prompts import (
    CHAT_SYSTEM_PROMPT,
    DRAFT_SYSTEM_PROMPTS,
    DraftWorkflowId,
    patient_line,
)

# Stateless: every request carries what it needs, and nothing it carries is
# stored or logged. The frontend reaches it through Next.js rewrites at /api.
app = FastAPI(title="LocalChat API")

# Generous caps, only to turn away runaway requests.
MAX_TEXT_LENGTH = 20_000
MAX_MESSAGES = 200


class CamelModel(BaseModel):
    """JSON in camelCase, as the frontend writes it."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)


class ChatRequest(CamelModel):
    """The whole conversation so far, so the server keeps no history."""

    messages: list[ChatMessage] = Field(min_length=1, max_length=MAX_MESSAGES)


class ChatResponse(CamelModel):
    reply: str


class Admission(CamelModel):
    ward: str
    room: str


class Patient(CamelModel):
    """The frontend's Patient (JP Core shaped); extra fields are ignored."""

    id: str
    name: str
    kana: str
    birth_date: date
    gender: Literal["male", "female", "other", "unknown"]
    department: str
    admission: Admission | None = None


class DraftRequest(CamelModel):
    workflow_id: DraftWorkflowId
    patient: Patient
    notes: str = Field(default="", max_length=MAX_TEXT_LENGTH)


class DraftResponse(CamelModel):
    draft: str


class HealthResponse(CamelModel):
    model: str
    # Whether a key is set, without revealing it.
    configured: bool


def model_unavailable() -> HTTPException:
    return HTTPException(status_code=503, detail="The model is unavailable.")


@app.get("/api/health")
async def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(model=settings.llm_model, configured=bool(settings.llm_api_key))


@app.post("/api/chat")
async def chat(request: ChatRequest, llm: Annotated[Llm, Depends(get_llm)]) -> ChatResponse:
    messages = [
        LlmMessage(role="system", content=CHAT_SYSTEM_PROMPT),
        *(LlmMessage(role=message.role, content=message.content) for message in request.messages),
    ]
    try:
        return ChatResponse(reply=await llm.complete(messages))
    except LlmUnavailable as error:
        raise model_unavailable() from error


@app.post("/api/drafts")
async def create_draft(
    request: DraftRequest, llm: Annotated[Llm, Depends(get_llm)]
) -> DraftResponse:
    patient = request.patient
    header = patient_line(
        name=patient.name,
        kana=patient.kana,
        birth_date=patient.birth_date,
        gender=patient.gender,
        patient_id=patient.id,
        today=date.today(),
    )
    # Notes are optional; the model then marks every section as not recorded.
    notes = request.notes.strip() or "（メモなし）"
    messages = [
        LlmMessage(role="system", content=DRAFT_SYSTEM_PROMPTS[request.workflow_id]),
        LlmMessage(role="user", content=f"{header}\n\nメモ：\n{notes}"),
    ]
    try:
        return DraftResponse(draft=await llm.complete(messages))
    except LlmUnavailable as error:
        raise model_unavailable() from error
