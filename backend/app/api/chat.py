from collections.abc import AsyncIterable
from typing import Literal

from fastapi import APIRouter
from fastapi.sse import EventSourceResponse, ServerSentEvent
from pydantic import Field

from app.api.dependencies import ChosenModel, CurrentUser, LlmDep
from app.llm import LlmMessage
from app.prompts import chat_system_prompt
from app.schemas import MAX_TEXT_LENGTH, CamelModel
from app.streaming import ui_message_stream

router = APIRouter()

# A generous cap, only to turn away runaway requests.
MAX_MESSAGES = 200


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)


class ChatRequest(CamelModel):
    """The whole conversation so far, so the server keeps no history."""

    messages: list[ChatMessage] = Field(min_length=1, max_length=MAX_MESSAGES)


@router.post("/api/chat", response_class=EventSourceResponse)
async def chat(
    request: ChatRequest, model: ChosenModel, llm: LlmDep, user: CurrentUser
) -> AsyncIterable[ServerSentEvent]:
    messages = [
        LlmMessage(role="system", content=chat_system_prompt(user.role)),
        *(LlmMessage(role=message.role, content=message.content) for message in request.messages),
    ]
    async for event in ui_message_stream(llm.stream(messages, model)):
        yield event
