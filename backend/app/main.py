from collections.abc import AsyncIterable, AsyncIterator
from datetime import date
from typing import Annotated, Literal

from fastapi import Depends, FastAPI
from fastapi.sse import EventSourceResponse, ServerSentEvent
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

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


class EventStreamHeaders:
    """Marks event streams as AI SDK UI message streams and keeps proxies from
    transforming them: Next.js gzips proxied responses, which holds a stream
    back until it ends. A pure ASGI middleware, so a client's disconnect still
    reaches the stream and stops generation."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                if headers.get("content-type", "").startswith("text/event-stream"):
                    headers["Cache-Control"] = "no-cache, no-transform"
                    headers["x-vercel-ai-ui-message-stream"] = "v1"
            await send(message)

        if scope["type"] == "http":
            await self.app(scope, receive, send_with_headers)
        else:
            await self.app(scope, receive, send)


app.add_middleware(EventStreamHeaders)

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


class HealthResponse(CamelModel):
    model: str
    # Whether a key is set, without revealing it.
    configured: bool


# The reply is one text part; its id only has to be unique in the message.
TEXT_ID = "text"


async def ui_message_stream(text: AsyncIterator[str]) -> AsyncIterator[ServerSentEvent]:
    """The reply in AI SDK's UI message stream format. The response has
    already started, so a failure is an error event rather than a status code;
    the frontend also treats a stream that ends without "finish" as failed."""
    yield ServerSentEvent(data={"type": "start"})
    yield ServerSentEvent(data={"type": "text-start", "id": TEXT_ID})
    try:
        async for delta in text:
            yield ServerSentEvent(data={"type": "text-delta", "id": TEXT_ID, "delta": delta})
    except LlmUnavailable:
        yield ServerSentEvent(data={"type": "error", "errorText": "The model is unavailable."})
        return
    yield ServerSentEvent(data={"type": "text-end", "id": TEXT_ID})
    yield ServerSentEvent(data={"type": "finish"})
    yield ServerSentEvent(raw_data="[DONE]")


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
