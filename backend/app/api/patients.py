from fastapi import APIRouter, HTTPException
from pydantic import Field

from app.api.dependencies import EmrDep
from app.emr.connector import PatientNotFound
from app.emr.models import Encounter, PatientSearchResult
from app.schemas import CamelModel

# POST throughout: names and patient IDs stay out of URLs, and so out of logs.
router = APIRouter()


class PatientSearchRequest(CamelModel):
    query: str = Field(max_length=100)


class EncountersRequest(CamelModel):
    patient_id: str = Field(min_length=1, max_length=64)


class EncountersResponse(CamelModel):
    # Newest first.
    encounters: list[Encounter]


@router.post("/api/patients/search")
async def search_patients(request: PatientSearchRequest, emr: EmrDep) -> PatientSearchResult:
    return await emr.search_patients(request.query)


@router.post("/api/patients/encounters")
async def list_encounters(request: EncountersRequest, emr: EmrDep) -> EncountersResponse:
    try:
        return EncountersResponse(encounters=await emr.list_encounters(request.patient_id))
    except PatientNotFound:
        raise HTTPException(status_code=404, detail="Unknown patient") from None
