import asyncio
from datetime import date

import pytest

from app.emr.connector import (
    PATIENT_SEARCH_LIMIT,
    EmrConnector,
    EncounterNotFound,
    PatientNotFound,
)
from app.emr.mock.connector import MockEmrConnector
from app.emr.mock.notes import MOCK_NOTES


# The contract: what every connector must do, whatever records are behind it.
# A hospital's connector joins this list, with a query its records answer.
@pytest.fixture(params=[(MockEmrConnector, "佐藤")], ids=["mock"])
def connector_and_query(request) -> tuple[EmrConnector, str]:
    make, query = request.param
    return make(), query


def test_a_search_returns_whole_patients_within_the_limit(connector_and_query):
    emr, query = connector_and_query
    result = asyncio.run(emr.search_patients(query))
    assert 0 < len(result.patients) <= PATIENT_SEARCH_LIMIT
    ids = [patient.id for patient in result.patients]
    assert len(set(ids)) == len(ids)


def test_an_empty_search_finds_no_one(connector_and_query):
    emr, _ = connector_and_query
    result = asyncio.run(emr.search_patients("  "))
    assert result.patients == [] and result.has_more is False


def test_encounters_come_newest_first_and_only_the_newest_can_be_open(connector_and_query):
    emr, query = connector_and_query
    for patient in asyncio.run(emr.search_patients(query)).patients:
        encounters = asyncio.run(emr.list_encounters(patient.id))
        admitted = [encounter.admitted_on for encounter in encounters]
        assert admitted == sorted(admitted, reverse=True)
        assert all(encounter.discharged_on is not None for encounter in encounters[1:])
        assert len({encounter.id for encounter in encounters}) == len(encounters)
        # Shown as in hospital exactly when a stay is still open.
        open_stay = bool(encounters) and encounters[0].discharged_on is None
        assert (patient.admission is not None) == open_stay


def test_an_unknown_patient_has_nothing_to_read(connector_and_query):
    emr, _ = connector_and_query
    for read in (emr.list_encounters, emr.get_patient):
        with pytest.raises(PatientNotFound):
            asyncio.run(read("no-such-patient"))
    with pytest.raises(PatientNotFound):
        asyncio.run(emr.get_record("no-such-patient", "no-such-stay"))


def test_a_record_is_for_the_patient_and_stay_asked_for(connector_and_query):
    emr, query = connector_and_query
    for patient in asyncio.run(emr.search_patients(query)).patients:
        assert asyncio.run(emr.get_patient(patient.id)) == patient
        for encounter in asyncio.run(emr.list_encounters(patient.id)):
            record = asyncio.run(emr.get_record(patient.id, encounter.id))
            assert record.patient == patient
            assert record.encounter == encounter
            recorded = [note.recorded_on for note in record.notes]
            assert recorded == sorted(recorded)
            assert len({note.id for note in record.notes}) == len(record.notes)


def test_a_stay_is_read_only_through_its_own_patient(connector_and_query):
    emr, query = connector_and_query
    first, second = asyncio.run(emr.search_patients(query)).patients[:2]
    theirs = asyncio.run(emr.list_encounters(second.id))[0]
    with pytest.raises(EncounterNotFound):
        asyncio.run(emr.get_record(first.id, theirs.id))


def test_mock_notes_fall_within_their_stays():
    emr = MockEmrConnector()
    for encounter_id in MOCK_NOTES:
        patient_id = encounter_id.split("-")[0]
        record = asyncio.run(emr.get_record(patient_id, encounter_id))
        assert record.notes
        last_day = record.encounter.discharged_on or date.today()
        assert all(
            record.encounter.admitted_on <= note.recorded_on <= last_day for note in record.notes
        )


# The mock's own search rules, which the patient picker was designed around.
def found(query: str) -> list[str]:
    return [p.id for p in asyncio.run(MockEmrConnector().search_patients(query)).patients]


@pytest.mark.parametrize(
    ("query", "ids"),
    [
        ("00012345", ["00012345"]),
        # Without the leading zeros, and in full-width digits.
        ("12345", ["00012345", "00123456"]),
        ("１２３４５", ["00012345", "00123456"]),
        # IDs match from the start only: not 00012345.
        ("2345", ["00023456", "00234567"]),
        ("佐藤 健一", ["00012345", "00098765"]),
        ("佐藤健一", ["00012345", "00098765"]),
        # Hiragana, katakana and half-width katakana read the same.
        ("さいとう", ["00078901", "00089012"]),
        ("サイトウ", ["00078901", "00089012"]),
        ("ｻｲﾄｳ", ["00078901", "00089012"]),
        ("該当なし", []),
    ],
)
def test_mock_search_matches_ids_names_and_kana(query, ids):
    assert found(query) == ids


def test_mock_search_flags_namesakes():
    patients = asyncio.run(MockEmrConnector().search_patients("サトウ")).patients
    assert [patient.has_namesake for patient in patients] == [True, True]
    assert asyncio.run(MockEmrConnector().search_patients("高橋")).patients[0].has_namesake is False
