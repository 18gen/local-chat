"""Replies streamed to the frontend as AI SDK UI message streams (SSE)."""

from collections.abc import AsyncIterator

from fastapi.sse import ServerSentEvent
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.llm import LlmUnavailable

# The reply is one text part; its id only has to be unique in the message.
TEXT_ID = "text"


async def ui_message_stream(
    text: AsyncIterator[str], metadata: dict[str, str | None] | None = None
) -> AsyncIterator[ServerSentEvent]:
    """The response has already started, so a failure is an error event, not a
    status code; the frontend also treats a stream without "finish" as failed.
    `metadata` opens the stream, e.g. whose draft this is."""
    start = {"type": "start"} if metadata is None else {"type": "start", "messageMetadata": metadata}
    yield ServerSentEvent(data=start)
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


class EventStreamHeaders:
    """Adds no-transform to event streams: Next.js gzips proxied responses,
    which holds a stream back until it ends. Pure ASGI, so a client's
    disconnect still reaches the stream and stops generation."""

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
