"""The base for request and response shapes: camelCase JSON, as the frontend
writes it."""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

# A generous cap on free text, only to turn away runaway requests.
MAX_TEXT_LENGTH = 20_000


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
