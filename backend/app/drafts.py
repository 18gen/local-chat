"""What the model is given to write a draft from."""

from datetime import date

from app.emr.models import ClinicalRecord, Encounter, NoteKind, Patient
from app.prompts import patient_line

NOTE_KIND_LABELS: dict[NoteKind, str] = {
    "admission": "入院時記録",
    "progress": "経過記録",
    "nursing": "看護記録",
    "operation": "手術記録",
}


def stay_line(encounter: Encounter) -> str:
    until = encounter.discharged_on.isoformat() if encounter.discharged_on else "入院中"
    return (
        f"【入院】{encounter.admitted_on.isoformat()}〜{until}　"
        f"{encounter.department}　{encounter.ward} {encounter.room}号室"
    )


def draft_input(
    patient: Patient, record: ClinicalRecord | None, notes: str, today: date
) -> str:
    """The patient, the chosen stay's chart if any, then the notes staff typed."""
    parts = [
        patient_line(
            name=patient.name,
            kana=patient.kana,
            birth_date=patient.birth_date,
            gender=patient.gender,
            patient_id=patient.id,
            today=today,
        )
    ]
    if record is not None:
        entries = [
            f"［{note.recorded_on.isoformat()} {NOTE_KIND_LABELS[note.kind]} {note.author}］\n{note.text}"
            for note in record.notes
        ]
        parts[0] += "\n" + stay_line(record.encounter)
        parts.append("診療記録：\n" + ("\n\n".join(entries) or "（記録なし）"))
    parts.append("メモ：\n" + (notes.strip() or "（メモなし）"))
    return "\n\n".join(parts)
