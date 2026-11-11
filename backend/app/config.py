from functools import lru_cache
from typing import Literal, Self
from urllib.parse import urlsplit

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Staging and production run inside a hospital, where patient data is real.
IN_HOSPITAL = ("staging", "production")


class Settings(BaseSettings):
    """Read from the environment or backend/.env (see .env.example)."""

    app_env: Literal["development", "demo", "staging", "production"] = "development"
    # Only the stand-ins exist so far, so a hospital setup can't start yet.
    emr_connector: Literal["mock"] = "mock"
    auth_provider: Literal["mock"] = "mock"

    # The OpenAI API by default, or any OpenAI-compatible server.
    llm_api_key: str = ""
    # The models staff can choose from; the first is the default.
    llm_models: list[str] = Field(default=["gpt-6-luna"], min_length=1)
    llm_base_url: str | None = None
    # In a hospital, the only hosts LLM_BASE_URL may name.
    llm_allowed_hosts: list[str] = []
    # Each sent only when set: not every OpenAI-compatible server supports them.
    llm_reasoning_effort: str | None = None
    llm_presence_penalty: float | None = None
    llm_max_tokens: int | None = None
    llm_timeout_seconds: float = 60

    # Empty values count as unset. Errors hide the values: one is the API key.
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, hide_input_in_errors=True
    )

    @property
    def llm_configured(self) -> bool:
        """A local server needs no key, only its address."""
        return bool(self.llm_api_key or self.llm_base_url)

    @model_validator(mode="after")
    def refuse_unsafe_setups(self) -> Self:
        """A setup that could leak patient data doesn't start."""
        problems = []
        if self.app_env in IN_HOSPITAL:
            host = urlsplit(self.llm_base_url or "").hostname
            if host is None:
                problems.append("LLM_BASE_URL must name the hospital's own model server")
            elif host not in self.llm_allowed_hosts:
                problems.append("LLM_BASE_URL's host must be listed in LLM_ALLOWED_HOSTS")
            if self.auth_provider == "mock":
                problems.append("AUTH_PROVIDER must not be mock")
        if self.app_env == "production" and self.emr_connector == "mock":
            problems.append("EMR_CONNECTOR must not be mock")
        if self.app_env == "demo" and self.emr_connector != "mock":
            problems.append("EMR_CONNECTOR must be mock")
        if problems:
            raise ValueError(f"Unsafe for APP_ENV={self.app_env}: " + "; ".join(problems))
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
