from collections.abc import AsyncIterable, AsyncIterator
from contextlib import asynccontextmanager
from datetime import date
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.sse import EventSourceResponse, ServerSentEvent

from app.api import patients
from app.config import Settings, get_settings
from app.drafts import draft_input
from app.emr.connector import EmrConnector, EncounterNotFound, PatientNotFound, get_emr
from app.emr.models import ClinicalRecord, Patient
from app.llm import Llm, LlmMessage, get_llm
from app.prompts import CHAT_SYSTEM_PROMPT, DRAFT_SYSTEM_PROMPTS
from app.schemas import ChatRequest, DraftRequest, HealthResponse, ModelsResponse
from app.streaming import EventStreamHeaders, ui_message_stream

# Stateless: every request carries what it needs, and nothing it carries is
# stored or logged. The frontend reaches it through Next.js rewrites at /api.


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Reading the settings refuses an unsafe setup now, not at the first request.
    get_settings()
    yield


app = FastAPI(title="LocalChat API", lifespan=lifespan)
app.add_middleware(EventStreamHeaders)
app.include_router(patients.router)


def chosen_model(
    settings: Annotated[Settings, Depends(get_settings)], model: str | None = None
) -> str:
    """The ?model= query, which must be one on offer; the default without it.
    A dependency, so a bad one is refused before the stream starts."""
    if model is None:
        return settings.llm_models[0]
    if model not in settings.llm_models:
        raise HTTPException(status_code=422, detail="Unknown model")
    return model


@app.get("/api/health")
async def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(configured=settings.llm_configured)


@app.get("/api/models")
async def models(settings: Annotated[Settings, Depends(get_settings)]) -> ModelsResponse:
    return ModelsResponse(models=settings.llm_models)


@app.post("/api/chat", response_class=EventSourceResponse)
async def chat(
    request: ChatRequest,
    model: Annotated[str, Depends(chosen_model)],
    llm: Annotated[Llm, Depends(get_llm)],
) -> AsyncIterable[ServerSentEvent]:
    messages = [
        LlmMessage(role="system", content=CHAT_SYSTEM_PROMPT),
        *(LlmMessage(role=message.role, content=message.content) for message in request.messages),
    ]
    async for event in ui_message_stream(llm.stream(messages, model)):
        yield event


async def draft_source(
    request: DraftRequest, emr: Annotated[EmrConnector, Depends(get_emr)]
) -> tuple[Patient, ClinicalRecord | None]:
    """Read from the records, never from the request. A dependency, so an
    unknown patient or stay is refused before the stream starts."""
    try:
        if request.encounter_id is None:
            return await emr.get_patient(request.patient_id), None
        record = await emr.get_record(request.patient_id, request.encounter_id)
        return record.patient, record
    except PatientNotFound:
        raise HTTPException(status_code=404, detail="Unknown patient") from None
    except EncounterNotFound:
        raise HTTPException(status_code=404, detail="Unknown encounter") from None


@app.post("/api/drafts", response_class=EventSourceResponse)
async def create_draft(
    request: DraftRequest,
    source: Annotated[tuple[Patient, ClinicalRecord | None], Depends(draft_source)],
    model: Annotated[str, Depends(chosen_model)],
    llm: Annotated[Llm, Depends(get_llm)],
) -> AsyncIterable[ServerSentEvent]:
    patient, record = source
    messages = [
        LlmMessage(role="system", content=DRAFT_SYSTEM_PROMPTS[request.workflow_id]),
        LlmMessage(
            role="user", content=draft_input(patient, record, request.notes, date.today())
        ),
    ]
    whose = {"patientId": patient.id, "encounterId": request.encounter_id}
    async for event in ui_message_stream(llm.stream(messages, model), whose):
        yield event
