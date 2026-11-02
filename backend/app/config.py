from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Read from the environment or backend/.env (see .env.example)."""

    # The OpenAI API by default, or any OpenAI-compatible server.
    llm_api_key: str = ""
    # The models staff can choose from; the first is the default.
    llm_models: list[str] = Field(default=["gpt-6-luna"], min_length=1)
    llm_base_url: str | None = None
    # Each sent only when set: not every OpenAI-compatible server supports them.
    llm_reasoning_effort: str | None = None
    llm_presence_penalty: float | None = None
    llm_max_tokens: int | None = None
    llm_timeout_seconds: float = 60

    # Empty values count as unset, so .env can list a setting without a value.
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
