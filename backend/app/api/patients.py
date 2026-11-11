from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field

from app.emr.connector import EmrConnector, PatientNotFound, get_emr
from app.emr.models import Encounter, PatientSearchResult
from app.schemas import CamelModel

# POST throughout: names and patient IDs stay out of URLs, and so out of logs.
router = APIRouter(prefix="/api/patients")

Emr = Annotated[EmrConnector, Depends(get_emr)]


class PatientSearchRequest(CamelModel):
    query: str = Field(max_length=100)


class EncountersRequest(CamelModel):
    patient_id: str = Field(min_length=1, max_length=64)


class EncountersResponse(CamelModel):
    # Newest first.
    encounters: list[Encounter]


@router.post("/search")
async def search_patients(request: PatientSearchRequest, emr: Emr) -> PatientSearchResult:
    return await emr.search_patients(request.query)


@router.post("/encounters")
async def list_encounters(request: EncountersRequest, emr: Emr) -> EncountersResponse:
    try:
        return EncountersResponse(encounters=await emr.list_encounters(request.patient_id))
    except PatientNotFound:
        raise HTTPException(status_code=404, detail="Unknown patient") from None
