import json

from fastapi.testclient import TestClient

from app.config import Settings
from app.llm import LlmMessage, LlmUnavailable
from app.main import app

client = TestClient(app)

# 佐藤 健一, one of the mock connector's fictional patients.
PATIENT_ID = "00012345"

CHAT = {"messages": [{"role": "user", "content": "こんにちは"}]}
# The least a draft needs.
DRAFT = {"workflowId": "note-summary", "patientId": PATIENT_ID}


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
