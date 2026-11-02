from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.llm import LlmMessage, LlmUnavailable, get_llm
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
    """Stands in for the model: records what it was sent, never calls out."""

    def __init__(self, reply: str = "返答", fail: bool = False):
        self.reply = reply
        self.fail = fail
        self.sent: list[LlmMessage] = []

    async def complete(self, messages: list[LlmMessage]) -> str:
        self.sent = messages
        if self.fail:
            raise LlmUnavailable("down")
        return self.reply


@pytest.fixture
def llm():
    fake = FakeLlm()
    app.dependency_overrides[get_llm] = lambda: fake
    yield fake
    app.dependency_overrides.clear()


client = TestClient(app)


def test_chat_sends_the_conversation_after_the_system_prompt(llm):
    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "こんにちは"}]},
    )
    assert response.status_code == 200
    assert response.json() == {"reply": "返答"}
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
    assert response.json() == {"draft": "返答"}
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


def test_model_failure_is_a_503_without_details():
    app.dependency_overrides[get_llm] = lambda: FakeLlm(fail=True)
    try:
        response = client.post(
            "/api/chat", json={"messages": [{"role": "user", "content": "こんにちは"}]}
        )
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 503
    assert response.json() == {"detail": "The model is unavailable."}


def test_health_reports_the_model_without_the_key():
    app.dependency_overrides[get_settings] = lambda: Settings(
        llm_api_key="secret", llm_model="test-model"
    )
    try:
        response = client.get("/api/health")
    finally:
        app.dependency_overrides.clear()
    assert response.json() == {"model": "test-model", "configured": True}
    assert "secret" not in response.text


@pytest.mark.parametrize(
    ("today", "age"),
    [(date(2026, 3, 1), 77), (date(2026, 3, 2), 78), (date(2026, 12, 31), 78)],
)
def test_age_turns_on_the_birthday(today, age):
    assert age_on(date(1948, 3, 2), today) == age
