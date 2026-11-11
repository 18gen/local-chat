import unicodedata
from datetime import date, timedelta

from app.emr.connector import PATIENT_SEARCH_LIMIT, EncounterNotFound, PatientNotFound
from app.emr.mock.notes import MOCK_NOTES
from app.emr.mock.patients import MOCK_PATIENTS, MockPatient
from app.emr.models import (
    Admission,
    ClinicalRecord,
    Encounter,
    Note,
    Patient,
    PatientSearchResult,
)

HIRAGANA_TO_KATAKANA = {code: code + 0x60 for code in range(ord("ぁ"), ord("ゖ") + 1)}


def normalize(text: str) -> str:
    """Folds width, hiragana/katakana and spaces."""
    folded = unicodedata.normalize("NFKC", text)
    return "".join(folded.split()).translate(HIRAGANA_TO_KATAKANA)


def matches(patient: MockPatient, key: str) -> bool:
    """IDs match from the start, with or without leading zeros; names anywhere."""
    return (
        patient.id.startswith(key)
        or patient.id.lstrip("0").startswith(key)
        or key in normalize(patient.name)
        or key in normalize(patient.kana)
    )


class MockEmrConnector:
    """Stands in for a hospital's records with fictional patients."""

    async def search_patients(self, query: str) -> PatientSearchResult:
        key = normalize(query)
        found = [patient for patient in MOCK_PATIENTS if matches(patient, key)] if key else []
        return PatientSearchResult(
            patients=[to_patient(patient) for patient in found[:PATIENT_SEARCH_LIMIT]],
            has_more=len(found) > PATIENT_SEARCH_LIMIT,
        )

    async def get_patient(self, patient_id: str) -> Patient:
        return to_patient(find(patient_id))

    async def list_encounters(self, patient_id: str) -> list[Encounter]:
        return encounters_of(find(patient_id))

    async def get_record(self, patient_id: str, encounter_id: str) -> ClinicalRecord:
        patient = find(patient_id)
        encounter = next((e for e in encounters_of(patient) if e.id == encounter_id), None)
        if encounter is None:
            raise EncounterNotFound
        return ClinicalRecord(
            patient=to_patient(patient),
            encounter=encounter,
            notes=[
                Note(
                    id=f"{encounter_id}-N{number}",
                    recorded_on=encounter.admitted_on + timedelta(days=note.day),
                    kind=note.kind,
                    author=note.author,
                    text=note.text,
                )
                for number, note in enumerate(MOCK_NOTES.get(encounter_id, ()), start=1)
            ],
        )


def find(patient_id: str) -> MockPatient:
    patient = next((p for p in MOCK_PATIENTS if p.id == patient_id), None)
    if patient is None:
        raise PatientNotFound
    return patient


def encounters_of(patient: MockPatient) -> list[Encounter]:
    today = date.today()
    return [
        Encounter(
            # Counted from the oldest stay, so an ID stays with its stay.
            id=f"{patient.id}-{len(patient.stays) - index}",
            department=stay.department or patient.department,
            ward=stay.ward,
            room=stay.room,
            admitted_on=today - timedelta(days=stay.admitted_days_ago),
            discharged_on=(
                None
                if stay.discharged_days_ago is None
                else today - timedelta(days=stay.discharged_days_ago)
            ),
        )
        for index, stay in enumerate(patient.stays)
    ]


def to_patient(patient: MockPatient) -> Patient:
    current = next((stay for stay in patient.stays if stay.discharged_days_ago is None), None)
    return Patient(
        id=patient.id,
        name=patient.name,
        kana=patient.kana,
        birth_date=date.fromisoformat(patient.birth_date),
        gender=patient.gender,
        department=patient.department,
        admission=Admission(ward=current.ward, room=current.room) if current else None,
        has_namesake=any(
            other is not patient and other.name == patient.name for other in MOCK_PATIENTS
        ),
    )
