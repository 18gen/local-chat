"""What every hospital's records are turned into, whatever system they come
from. Shaped after JP Core (HL7 FHIR), in camelCase JSON for the frontend."""

from datetime import date
from typing import Literal

from app.schemas import CamelModel


class Admission(CamelModel):
    ward: str
    room: str


class Patient(CamelModel):
    id: str
    # Family and given name, separated by a space.
    name: str
    kana: str
    birth_date: date
    gender: Literal["male", "female", "other", "unknown"]
    department: str
    # Where the patient is now; None for outpatients.
    admission: Admission | None
    # Another patient has the same name.
    has_namesake: bool


class Encounter(CamelModel):
    """One hospital stay."""

    id: str
    department: str
    ward: str
    room: str
    admitted_on: date
    # None while the patient is still in hospital.
    discharged_on: date | None


NoteKind = Literal["admission", "progress", "nursing", "operation"]


class Note(CamelModel):
    """One entry in the chart, as free text."""

    id: str
    recorded_on: date
    kind: NoteKind
    author: str
    text: str


class ClinicalRecord(CamelModel):
    """What the chart holds about one hospital stay."""

    patient: Patient
    encounter: Encounter
    # Oldest first.
    notes: list[Note]


class PatientSearchResult(CamelModel):
    patients: list[Patient]
    # More matched than came back.
    has_more: bool
