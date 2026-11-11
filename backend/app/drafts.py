"""What the model is given to write a draft from, and how the draft is headed."""

from collections.abc import AsyncIterator
from datetime import date

from app.emr.models import ClinicalRecord, Encounter, NoteKind, Patient

GENDER_LABELS = {"male": "男性", "female": "女性", "other": "その他", "unknown": "不明"}

NOTE_KIND_LABELS: dict[NoteKind, str] = {
    "admission": "入院時記録",
    "progress": "経過記録",
    "nursing": "看護記録",
    "operation": "手術記録",
}


def age_on(birth_date: date, today: date) -> int:
    had_birthday = (today.month, today.day) >= (birth_date.month, birth_date.day)
    return today.year - birth_date.year - (0 if had_birthday else 1)


def patient_line(patient: Patient, today: date) -> str:
    """Heads the draft. Written here, so the model never sees the name or ID."""
    age = age_on(patient.birth_date, today)
    return (
        f"【患者】{patient.name}（{patient.kana}）　{age}歳　"
        f"{GENDER_LABELS[patient.gender]}　ID {patient.id}"
    )


def stay_line(encounter: Encounter) -> str:
    until = encounter.discharged_on.isoformat() if encounter.discharged_on else "入院中"
    return (
        f"【入院】{encounter.admitted_on.isoformat()}〜{until}　"
        f"{encounter.department}　{encounter.ward} {encounter.room}号室"
    )


def draft_input(
    patient: Patient, record: ClinicalRecord | None, notes: str, today: date
) -> str:
    """Age and gender, the chosen stay's chart if any, then the notes staff typed."""
    age = age_on(patient.birth_date, today)
    parts = [f"患者：{age}歳　{GENDER_LABELS[patient.gender]}"]
    if record is not None:
        entries = [
            f"［{note.recorded_on.isoformat()} {NOTE_KIND_LABELS[note.kind]} {note.author}］\n{note.text}"
            for note in record.notes
        ]
        parts[0] += "\n" + stay_line(record.encounter)
        parts.append("診療記録：\n" + ("\n\n".join(entries) or "（記録なし）"))
    parts.append("メモ：\n" + (notes.strip() or "（メモなし）"))
    return "\n\n".join(parts)


async def headed(header: str, text: AsyncIterator[str]) -> AsyncIterator[str]:
    yield header + "\n"
    async for piece in text:
        yield piece
