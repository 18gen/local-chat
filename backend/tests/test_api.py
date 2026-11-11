import asyncio
import json
from datetime import date

import pytest
from fastapi.testclient import TestClient
from openai.types.chat import ChatCompletionChunk

from app.config import Settings, get_settings
from app.llm import Llm, LlmMessage, LlmUnavailable, get_llm
from app.main import app
from app.prompts import CHAT_SYSTEM_PROMPT, age_on

PATIENT = {
    "id": "00012345",
    "name": "佐藤 健一",
    "kana": "サトウ ケンイチ",
    "birthDate": "1948-03-02",
    "gender": "male",
    "department": "呼吸器内科",
    "admission": {"ward": "5階東", "room": "501"},
    "hasNamesake": True,
}


class FakeLlm:
    """Stands in for the model: records what it was sent, never calls out.
    Streams the reply in two pieces, and can fail after the first."""

    def __init__(self, reply: str = "返答です", fail_midway: bool = False):
        self.reply = reply
        self.fail_midway = fail_midway
        self.sent: list[LlmMessage] = []
        self.model: str | None = None

    async def stream(self, messages: list[LlmMessage], model: str):
        self.sent = messages
        self.model = model
        half = len(self.reply) // 2
        yield self.reply[:half]
        if self.fail_midway:
            raise LlmUnavailable("down")
        yield self.reply[half:]


def events(response) -> list:
    """The SSE data lines, JSON-decoded; [DONE] stays a string."""
    lines = [line[len("data: "):] for line in response.text.splitlines() if line.startswith("data: ")]
    return [line if line == "[DONE]" else json.loads(line) for line in lines]


def text_of(stream: list) -> str:
    return "".join(e["delta"] for e in stream if isinstance(e, dict) and e["type"] == "text-delta")


def make_settings(**values) -> Settings:
    """Never from backend/.env, which holds the real API key."""
    return Settings(_env_file=None, **values)


@pytest.fixture(autouse=True)
def settings():
    app.dependency_overrides[get_settings] = lambda: make_settings()
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def llm():
    fake = FakeLlm()
    app.dependency_overrides[get_llm] = lambda: fake
    return fake


client = TestClient(app)


def test_chat_sends_the_conversation_after_the_system_prompt(llm):
    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "こんにちは"}]},
    )
    assert response.status_code == 200
    assert text_of(events(response)) == "返答です"
    assert [m.role for m in llm.sent] == ["system", "user"]
    assert llm.sent[0].content == CHAT_SYSTEM_PROMPT


def test_chat_rejects_an_empty_conversation(llm):
    assert client.post("/api/chat", json={"messages": []}).status_code == 422


def test_draft_heads_the_notes_with_the_patient_line(llm):
    response = client.post(
        "/api/drafts",
        json={"workflowId": "discharge-summary", "patient": PATIENT, "notes": "肺炎で入院"},
    )
    assert response.status_code == 200
    assert text_of(events(response)) == "返答です"
    user = llm.sent[1].content
    assert user.startswith("【患者】佐藤 健一（サトウ ケンイチ）")
    assert "ID 00012345" in user
    assert user.endswith("肺炎で入院")
    assert "退院サマリー" in llm.sent[0].content


def test_draft_without_notes_says_so(llm):
    response = client.post(
        "/api/drafts",
        json={"workflowId": "note-summary", "patient": PATIENT},
    )
    assert response.status_code == 200
    assert llm.sent[1].content.endswith("（メモなし）")


def test_draft_rejects_an_unknown_workflow(llm):
    response = client.post(
        "/api/drafts",
        json={"workflowId": "manual-search", "patient": PATIENT},
    )
    assert response.status_code == 422


def test_reply_streams_as_an_ai_sdk_ui_message_stream(llm):
    response = client.post(
        "/api/chat", json={"messages": [{"role": "user", "content": "こんにちは"}]}
    )
    assert response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["x-vercel-ai-ui-message-stream"] == "v1"
    # Next.js would otherwise gzip the stream and hold it back until it ends.
    assert "no-transform" in response.headers["cache-control"]
    assert [e if e == "[DONE]" else e["type"] for e in events(response)] == [
        "start", "text-start", "text-delta", "text-delta", "text-end", "finish", "[DONE]",
    ]


def test_model_failure_midway_ends_with_an_error_without_details():
    app.dependency_overrides[get_llm] = lambda: FakeLlm(fail_midway=True)
    response = client.post(
        "/api/chat", json={"messages": [{"role": "user", "content": "こんにちは"}]}
    )
    stream = events(response)
    assert stream[-1] == {"type": "error", "errorText": "The model is unavailable."}
    assert not any(isinstance(e, dict) and e["type"] == "finish" for e in stream)


def test_health_says_whether_a_key_is_set_without_revealing_it():
    app.dependency_overrides[get_settings] = lambda: make_settings(llm_api_key="secret")
    response = client.get("/api/health")
    assert response.json() == {"configured": True}
    assert "secret" not in response.text


def test_health_counts_a_local_server_without_a_key_as_set_up():
    app.dependency_overrides[get_settings] = lambda: make_settings(
        llm_base_url="http://127.0.0.1:11434/v1"
    )
    assert client.get("/api/health").json() == {"configured": True}
    app.dependency_overrides[get_settings] = lambda: make_settings()
    assert client.get("/api/health").json() == {"configured": False}


HOSPITAL_LLM = {"llm_base_url": "http://vllm:8000/v1", "llm_allowed_hosts": ["vllm"]}


@pytest.mark.parametrize(
    ("values", "problem"),
    [
        # No address means the OpenAI API, outside the hospital.
        ({"app_env": "production"}, "LLM_BASE_URL must name"),
        (
            {"app_env": "staging", "llm_base_url": "https://api.openai.com/v1"},
            "LLM_ALLOWED_HOSTS",
        ),
        (
            {
                "app_env": "production",
                "llm_base_url": "https://api.openai.com/v1",
                "llm_allowed_hosts": ["vllm"],
            },
            "LLM_ALLOWED_HOSTS",
        ),
        ({"app_env": "staging", **HOSPITAL_LLM}, "AUTH_PROVIDER must not be mock"),
        ({"app_env": "production", **HOSPITAL_LLM}, "EMR_CONNECTOR must not be mock"),
    ],
)
def test_a_hospital_setup_that_could_leak_patient_data_does_not_start(values, problem):
    with pytest.raises(ValueError, match=problem):
        make_settings(**values)


def test_a_refused_setup_does_not_show_the_key():
    with pytest.raises(ValueError) as refused:
        make_settings(app_env="production", llm_api_key="secret")
    assert "secret" not in str(refused.value)


@pytest.mark.parametrize("app_env", ["development", "demo"])
def test_setups_without_patient_data_may_use_any_model(app_env):
    assert make_settings(app_env=app_env).llm_base_url is None


@pytest.fixture
def two_models():
    app.dependency_overrides[get_settings] = lambda: make_settings(
        llm_models=["model-a", "model-b"]
    )


CHAT = {"messages": [{"role": "user", "content": "こんにちは"}]}


def test_models_lists_the_choices_default_first(two_models):
    assert client.get("/api/models").json() == {"models": ["model-a", "model-b"]}


def test_chat_uses_the_chosen_model_or_the_first(llm, two_models):
    client.post("/api/chat", json=CHAT)
    assert llm.model == "model-a"
    client.post("/api/chat?model=model-b", json=CHAT)
    assert llm.model == "model-b"


def test_draft_uses_the_chosen_model(llm, two_models):
    client.post(
        "/api/drafts?model=model-b",
        json={"workflowId": "note-summary", "patient": PATIENT},
    )
    assert llm.model == "model-b"


def test_a_model_not_on_offer_is_refused_before_streaming(llm, two_models):
    response = client.post("/api/chat?model=model-c", json=CHAT)
    assert response.status_code == 422
    assert llm.model is None


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


@pytest.mark.parametrize(
    ("today", "age"),
    [(date(2026, 3, 1), 77), (date(2026, 3, 2), 78), (date(2026, 12, 31), 78)],
)
def test_age_turns_on_the_birthday(today, age):
    assert age_on(date(1948, 3, 2), today) == age
