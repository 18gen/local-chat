"""Request and response shapes, in camelCase JSON as the frontend writes it."""

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


class DraftRequest(CamelModel):
    """Names the patient and the stay; the server reads both from the
    hospital's records, so nothing about a patient is taken on trust."""

    workflow_id: DraftWorkflowId
    patient_id: str = Field(min_length=1, max_length=64)
    # The stay whose chart to draft from; without one, only the notes.
    encounter_id: str | None = Field(default=None, min_length=1, max_length=64)
    notes: str = Field(default="", max_length=MAX_TEXT_LENGTH)


class HealthResponse(CamelModel):
    # Whether a model is set up, without revealing the key.
    configured: bool


class ModelsResponse(CamelModel):
    # The first is the default.
    models: list[str]
