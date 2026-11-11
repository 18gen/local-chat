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
                # The client insists on a key; local servers ignore it.
                api_key=settings.llm_api_key or "unused",
                base_url=settings.llm_base_url or None,
                timeout=settings.llm_timeout_seconds,
                max_retries=1,
            )
            if settings.llm_configured
            else None
        )

    async def stream(self, messages: list[LlmMessage], model: str) -> AsyncIterator[str]:
        """Yields the reply's text as it arrives; raises LlmUnavailable on failure,
        including a reply cut off at max_tokens, which must not pass for a whole one."""
        if self._client is None:
            raise LlmUnavailable("No model is configured")

        settings = self._settings
        options = {
            name: value
            for name, value in {
                "reasoning_effort": settings.llm_reasoning_effort,
                "presence_penalty": settings.llm_presence_penalty,
                "max_tokens": settings.llm_max_tokens,
            }.items()
            if value is not None
        }
        try:
            stream = await self._client.chat.completions.create(
                model=model,
                messages=[message.model_dump() for message in messages],
                stream=True,
                store=False,
                **options,
            )
            # Closing the stream when the client leaves also stops generation upstream.
            try:
                async for chunk in stream:
                    if not chunk.choices:
                        continue
                    choice = chunk.choices[0]
                    if choice.delta.content:
                        yield choice.delta.content
                    if choice.finish_reason == "length":
                        logger.warning("LLM reply cut off at max_tokens")
                        raise LlmUnavailable("The reply reached max_tokens")
            finally:
                await stream.close()
        except OpenAIError as error:
            logger.warning("LLM request failed: %s", type(error).__name__)
            raise LlmUnavailable(type(error).__name__) from error


@lru_cache
def get_llm() -> Llm:
    """Shared, so connections are reused. Tests override it."""
    return Llm(get_settings())
