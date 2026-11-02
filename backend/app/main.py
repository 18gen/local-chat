from collections.abc import AsyncIterable
from datetime import date
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.sse import EventSourceResponse, ServerSentEvent

from app.config import Settings, get_settings
from app.llm import Llm, LlmMessage, get_llm
from app.prompts import CHAT_SYSTEM_PROMPT, DRAFT_SYSTEM_PROMPTS, patient_line
from app.schemas import ChatRequest, DraftRequest, HealthResponse
from app.streaming import EventStreamHeaders, ui_message_stream

# Stateless: every request carries what it needs, and nothing it carries is
# stored or logged. The frontend reaches it through Next.js rewrites at /api.
app = FastAPI(title="LocalChat API")
app.add_middleware(EventStreamHeaders)


@app.get("/api/health")
async def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(model=settings.llm_model, configured=bool(settings.llm_api_key))


@app.post("/api/chat", response_class=EventSourceResponse)
async def chat(
    request: ChatRequest, llm: Annotated[Llm, Depends(get_llm)]
) -> AsyncIterable[ServerSentEvent]:
    messages = [
        LlmMessage(role="system", content=CHAT_SYSTEM_PROMPT),
        *(LlmMessage(role=message.role, content=message.content) for message in request.messages),
    ]
    async for event in ui_message_stream(llm.stream(messages)):
        yield event


@app.post("/api/drafts", response_class=EventSourceResponse)
async def create_draft(
    request: DraftRequest, llm: Annotated[Llm, Depends(get_llm)]
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
    async for event in ui_message_stream(llm.stream(messages)):
        yield event
