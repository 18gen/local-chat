from collections.abc import AsyncIterable, AsyncIterator
from contextlib import asynccontextmanager
from datetime import date
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.sse import EventSourceResponse, ServerSentEvent

from app.api import patients
from app.config import Settings, get_settings
from app.llm import Llm, LlmMessage, get_llm
from app.prompts import CHAT_SYSTEM_PROMPT, DRAFT_SYSTEM_PROMPTS, patient_line
from app.schemas import ChatRequest, DraftRequest, HealthResponse, ModelsResponse
from app.streaming import EventStreamHeaders, ui_message_stream

# Stateless: every request carries what it needs, and nothing it carries is
# stored or logged. The frontend reaches it through Next.js rewrites at /api.


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Reading the settings refuses an unsafe setup now, not at the first request.
    get_settings()
    yield


app = FastAPI(title="LocalChat API", lifespan=lifespan)
app.add_middleware(EventStreamHeaders)
app.include_router(patients.router)


def chosen_model(
    settings: Annotated[Settings, Depends(get_settings)], model: str | None = None
) -> str:
    """The ?model= query, which must be one on offer; the default without it.
    A dependency, so a bad one is refused before the stream starts."""
    if model is None:
        return settings.llm_models[0]
    if model not in settings.llm_models:
        raise HTTPException(status_code=422, detail="Unknown model")
    return model


@app.get("/api/health")
async def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(configured=settings.llm_configured)


@app.get("/api/models")
async def models(settings: Annotated[Settings, Depends(get_settings)]) -> ModelsResponse:
    return ModelsResponse(models=settings.llm_models)


@app.post("/api/chat", response_class=EventSourceResponse)
async def chat(
    request: ChatRequest,
    model: Annotated[str, Depends(chosen_model)],
    llm: Annotated[Llm, Depends(get_llm)],
) -> AsyncIterable[ServerSentEvent]:
    messages = [
        LlmMessage(role="system", content=CHAT_SYSTEM_PROMPT),
        *(LlmMessage(role=message.role, content=message.content) for message in request.messages),
    ]
    async for event in ui_message_stream(llm.stream(messages, model)):
        yield event


@app.post("/api/drafts", response_class=EventSourceResponse)
async def create_draft(
    request: DraftRequest,
    model: Annotated[str, Depends(chosen_model)],
    llm: Annotated[Llm, Depends(get_llm)],
) -> AsyncIterable[ServerSentEvent]:
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
    async for event in ui_message_stream(llm.stream(messages, model)):
        yield event
