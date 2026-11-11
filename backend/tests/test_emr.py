import asyncio
from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.emr.connector import PATIENT_SEARCH_LIMIT, EmrConnector, PatientNotFound
from app.emr.mock.connector import MockEmrConnector
from app.main import app

client = TestClient(app)


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


def test_an_unknown_patient_has_no_encounters_to_list(connector_and_query):
    emr, _ = connector_and_query
    with pytest.raises(PatientNotFound):
        asyncio.run(emr.list_encounters("no-such-patient"))


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


def test_search_api_answers_in_the_frontends_shape():
    response = client.post("/api/patients/search", json={"query": "00012345"})
    assert response.json() == {
        "patients": [
            {
                "id": "00012345",
                "name": "佐藤 健一",
                "kana": "サトウ ケンイチ",
                "birthDate": "1948-03-02",
                "gender": "male",
                "department": "呼吸器内科",
                "admission": {"ward": "5階東", "room": "501"},
                "hasNamesake": True,
            }
        ],
        "hasMore": False,
    }


def test_encounters_api_lists_the_stays():
    response = client.post("/api/patients/encounters", json={"patientId": "00012345"})
    encounters = response.json()["encounters"]
    assert [encounter["id"] for encounter in encounters] == ["00012345-2", "00012345-1"]
    assert encounters[0]["dischargedOn"] is None
    assert date.fromisoformat(encounters[1]["dischargedOn"]) < date.today()
    assert encounters[0].keys() == {
        "id", "department", "ward", "room", "admittedOn", "dischargedOn",
    }


def test_encounters_api_refuses_an_unknown_patient():
    response = client.post("/api/patients/encounters", json={"patientId": "99999999"})
    assert response.status_code == 404


def test_patient_data_is_never_asked_for_in_a_url():
    assert client.get("/api/patients/search?query=佐藤").status_code == 405
