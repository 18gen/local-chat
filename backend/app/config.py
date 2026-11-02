from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Read from the environment or backend/.env (see .env.example)."""

    # The OpenAI API by default, or any OpenAI-compatible server.
    llm_api_key: str = ""
    llm_model: str = "gpt-6-luna"
    llm_base_url: str | None = None
    # Sent only when set: not every OpenAI-compatible server supports it.
    llm_reasoning_effort: str | None = None
    llm_timeout_seconds: float = 60

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings() -> Settings:
    return Settings()
