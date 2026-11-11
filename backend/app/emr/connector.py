from functools import lru_cache
from typing import Protocol

from app.config import get_settings
from app.emr.models import Encounter, PatientSearchResult

# At most this many patients come back from a search.
PATIENT_SEARCH_LIMIT = 20


class PatientNotFound(Exception):
    pass


class EmrConnector(Protocol):
    """How the app reads a hospital's records: one implementation per kind of
    record system. It only reads; there is deliberately nothing to write with."""

    async def search_patients(self, query: str) -> PatientSearchResult:
        """By patient ID, name or kana; at most PATIENT_SEARCH_LIMIT patients."""
        ...

    async def list_encounters(self, patient_id: str) -> list[Encounter]:
        """The patient's hospital stays, newest first. Raises PatientNotFound."""
        ...


@lru_cache
def get_emr() -> EmrConnector:
    """The connector EMR_CONNECTOR names. Tests override it."""
    # Imported here, so a hospital's connector loads only where it is used.
    match get_settings().emr_connector:
        case "mock":
            from app.emr.mock.connector import MockEmrConnector

            return MockEmrConnector()
