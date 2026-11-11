from collections.abc import AsyncIterable
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.sse import EventSourceResponse, ServerSentEvent
from pydantic import Field

from app.api.dependencies import ChosenModel, EmrDep, LlmDep
from app.drafts import draft_input, headed, patient_line
from app.emr.connector import EncounterNotFound, PatientNotFound
from app.emr.models import ClinicalRecord, Patient
from app.llm import LlmMessage
from app.prompts import DRAFT_SYSTEM_PROMPTS, DraftWorkflowId
from app.schemas import MAX_TEXT_LENGTH, CamelModel
from app.streaming import ui_message_stream

router = APIRouter()


class DraftRequest(CamelModel):
    """Only IDs: the server reads the patient and the chart itself."""

    workflow_id: DraftWorkflowId
    patient_id: str = Field(min_length=1, max_length=64)
    # Without a stay, the draft is from the notes alone.
    encounter_id: str | None = Field(default=None, min_length=1, max_length=64)
    notes: str = Field(default="", max_length=MAX_TEXT_LENGTH)


async def draft_source(
    request: DraftRequest, emr: EmrDep
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


@router.post("/api/drafts", response_class=EventSourceResponse)
async def create_draft(
    request: DraftRequest,
    source: Annotated[tuple[Patient, ClinicalRecord | None], Depends(draft_source)],
    model: ChosenModel,
    llm: LlmDep,
) -> AsyncIterable[ServerSentEvent]:
    patient, record = source
    today = date.today()
    messages = [
        LlmMessage(role="system", content=DRAFT_SYSTEM_PROMPTS[request.workflow_id]),
        LlmMessage(role="user", content=draft_input(patient, record, request.notes, today)),
    ]
    text = headed(patient_line(patient, today), llm.stream(messages, model))
    # Whose draft this is, and which notes it was made from.
    notes = record.notes if record else []
    about = {
        "patientId": patient.id,
        "encounterId": request.encounter_id,
        "noteCount": len(notes) if record else None,
        "notesFrom": notes[0].recorded_on.isoformat() if notes else None,
        "notesTo": notes[-1].recorded_on.isoformat() if notes else None,
    }
    async for event in ui_message_stream(text, about):
        yield event
