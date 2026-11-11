from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import chat, drafts, patients
from app.api.dependencies import SettingsDep
from app.config import get_settings
from app.schemas import CamelModel
from app.streaming import EventStreamHeaders

# Stateless: every request carries what it needs, and nothing it carries is
# stored or logged. The browser reaches it at /api on the frontend's origin.


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Reading the settings refuses an unsafe setup now, not at the first request.
    get_settings()
    yield


app = FastAPI(title="LocalChat API", lifespan=lifespan)
app.add_middleware(EventStreamHeaders)
for routes in (chat, drafts, patients):
    app.include_router(routes.router)


class HealthResponse(CamelModel):
    # Whether a model is set up, without revealing the key.
    configured: bool


class ModelsResponse(CamelModel):
    # The first is the default.
    models: list[str]


@app.get("/api/health")
async def health(settings: SettingsDep) -> HealthResponse:
    return HealthResponse(configured=settings.llm_configured)


@app.get("/api/models")
async def models(settings: SettingsDep) -> ModelsResponse:
    return ModelsResponse(models=settings.llm_models)
