import asyncio

import pytest
from openai.types.chat import ChatCompletionChunk

from app.config import Settings
from app.llm import Llm, LlmMessage, LlmUnavailable
from tests.helpers import make_settings


class StubCompletions:
    """Stands in for the OpenAI client's chat.completions: records the request
    and streams the given chunks."""

    def __init__(self, chunks: list[ChatCompletionChunk]):
        self.chunks = chunks
        self.request: dict = {}

    async def create(self, **request):
        self.request = request
        return StubStream(self.chunks)


class StubStream:
    def __init__(self, chunks: list[ChatCompletionChunk]):
        self.chunks = iter(chunks)

    def __aiter__(self):
        return self

    async def __anext__(self) -> ChatCompletionChunk:
        try:
            return next(self.chunks)
        except StopIteration:
            raise StopAsyncIteration from None

    async def close(self):
        pass


def chunk(content: str, finish_reason: str | None = None) -> ChatCompletionChunk:
    return ChatCompletionChunk.model_validate({
        "id": "chunk",
        "object": "chat.completion.chunk",
        "created": 0,
        "model": "model-a",
        "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": finish_reason}],
    })


def stub_llm(settings: Settings, chunks: list[ChatCompletionChunk]) -> tuple[Llm, StubCompletions]:
    llm = Llm(settings)
    completions = StubCompletions(chunks)
    llm._client = type("StubClient", (), {"chat": type("StubChat", (), {"completions": completions})})
    return llm, completions


async def collect(llm: Llm) -> list[str]:
    return [text async for text in llm.stream([LlmMessage(role="user", content="こんにちは")], "model-a")]


def test_options_are_sent_only_when_set():
    llm, completions = stub_llm(
        make_settings(llm_api_key="test", llm_presence_penalty=1.0, llm_max_tokens=1500),
        [chunk("返答です", "stop")],
    )
    assert asyncio.run(collect(llm)) == ["返答です"]
    assert completions.request["model"] == "model-a"
    assert completions.request["presence_penalty"] == 1.0
    assert completions.request["max_tokens"] == 1500
    assert "reasoning_effort" not in completions.request


def test_a_reply_cut_off_at_max_tokens_fails():
    llm, _ = stub_llm(
        make_settings(llm_api_key="test", llm_max_tokens=2),
        [chunk("返"), chunk("答", "length")],
    )
    with pytest.raises(LlmUnavailable):
        asyncio.run(collect(llm))
