from app.auth import User, get_user
from app.llm import get_llm
from app.main import app
from tests.helpers import CHAT, FakeLlm, client, events, text_of


def test_chat_sends_the_conversation_after_the_system_prompt(llm):
    response = client.post("/api/chat", json=CHAT)
    assert response.status_code == 200
    assert text_of(events(response)) == "返答です"
    assert [m.role for m in llm.sent] == ["system", "user"]
    assert "病院の職員を支援する" in llm.sent[0].content


def test_chat_tells_the_model_the_users_role(llm):
    app.dependency_overrides[get_user] = lambda: User(name="看護 花子", role="nurse")
    client.post("/api/chat", json=CHAT)
    assert "利用者は看護師です" in llm.sent[0].content
    # Only the role: not who they are.
    assert "看護 花子" not in llm.sent[0].content


def test_chat_rejects_an_empty_conversation():
    assert client.post("/api/chat", json={"messages": []}).status_code == 422


def test_reply_streams_as_an_ai_sdk_ui_message_stream():
    response = client.post("/api/chat", json=CHAT)
    assert response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["x-vercel-ai-ui-message-stream"] == "v1"
    # Next.js would otherwise gzip the stream and hold it back until it ends.
    assert "no-transform" in response.headers["cache-control"]
    assert [e if e == "[DONE]" else e["type"] for e in events(response)] == [
        "start", "text-start", "text-delta", "text-delta", "text-end", "finish", "[DONE]",
    ]


def test_model_failure_midway_ends_with_an_error_without_details():
    app.dependency_overrides[get_llm] = lambda: FakeLlm(fail_midway=True)
    stream = events(client.post("/api/chat", json=CHAT))
    assert stream[-1] == {"type": "error", "errorText": "The model is unavailable."}
    assert not any(isinstance(e, dict) and e["type"] == "finish" for e in stream)


def test_models_lists_the_choices_default_first(two_models):
    assert client.get("/api/models").json() == {"models": ["model-a", "model-b"]}


def test_chat_uses_the_chosen_model_or_the_first(llm, two_models):
    client.post("/api/chat", json=CHAT)
    assert llm.model == "model-a"
    client.post("/api/chat?model=model-b", json=CHAT)
    assert llm.model == "model-b"


def test_a_model_not_on_offer_is_refused_before_streaming(llm, two_models):
    response = client.post("/api/chat?model=model-c", json=CHAT)
    assert response.status_code == 422
    assert llm.model is None
