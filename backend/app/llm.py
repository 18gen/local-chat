import logging
from collections.abc import AsyncIterator
from functools import lru_cache
from typing import Literal

from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel

from app.config import Settings, get_settings

# Errors are logged by type only: prompts and replies hold chat and patient
# content, which must never reach a log.
logger = logging.getLogger(__name__)


class LlmMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class LlmUnavailable(Exception):
    """The model can't answer: not configured, unreachable or failing."""


class Llm:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._client = (
            AsyncOpenAI(
                api_key=settings.llm_api_key,
                base_url=settings.llm_base_url or None,
                timeout=settings.llm_timeout_seconds,
                max_retries=1,
            )
            if settings.llm_api_key
            else None
        )

    async def stream(self, messages: list[LlmMessage]) -> AsyncIterator[str]:
        """Yields the reply's text as it arrives; raises LlmUnavailable on failure."""
        if self._client is None:
            raise LlmUnavailable("LLM_API_KEY is not set")

        options = {}
        if self._settings.llm_reasoning_effort:
            options["reasoning_effort"] = self._settings.llm_reasoning_effort
        try:
            stream = await self._client.chat.completions.create(
                model=self._settings.llm_model,
                messages=[message.model_dump() for message in messages],
                stream=True,
                store=False,
                **options,
            )
            # Closing the stream when the client leaves also stops generation upstream.
            try:
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        yield delta
            finally:
                await stream.close()
        except OpenAIError as error:
            logger.warning("LLM request failed: %s", type(error).__name__)
            raise LlmUnavailable(type(error).__name__) from error


@lru_cache
def get_llm() -> Llm:
    """Shared, so connections are reused. Tests override it."""
    return Llm(get_settings())
