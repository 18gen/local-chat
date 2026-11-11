from datetime import date

from tests.helpers import PATIENT_ID, client


def test_search_api_answers_in_the_frontends_shape():
    response = client.post("/api/patients/search", json={"query": PATIENT_ID})
    assert response.json() == {
        "patients": [
            {
                "id": PATIENT_ID,
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
    response = client.post("/api/patients/encounters", json={"patientId": PATIENT_ID})
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
