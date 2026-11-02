"""Request and response shapes, in camelCase JSON as the frontend writes it."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.prompts import DraftWorkflowId

# Generous caps, only to turn away runaway requests.
MAX_TEXT_LENGTH = 20_000
MAX_MESSAGES = 200


class CamelModel(BaseModel):
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
    """The frontend's Patient; fields the server doesn't need are ignored."""

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
    # Whether a key is set, without revealing it.
    configured: bool


class ModelsResponse(CamelModel):
    # The first is the default.
    models: list[str]
