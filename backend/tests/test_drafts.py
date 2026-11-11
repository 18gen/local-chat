from datetime import date

import pytest

from app.drafts import age_on
from app.llm import get_llm
from app.main import app
from tests.helpers import DRAFT, PATIENT_ID, FakeLlm, client, events, text_of


def test_draft_is_headed_with_the_patient_line_the_model_never_sees(llm):
    response = client.post(
        "/api/drafts",
        json={"workflowId": "discharge-summary", "patientId": PATIENT_ID, "notes": "肺炎で入院"},
    )
    assert response.status_code == 200
    head, body = text_of(events(response)).split("\n")
    assert head.startswith("【患者】佐藤 健一（サトウ ケンイチ）") and head.endswith("ID 00012345")
    assert body == "返答です"
    # The model gets the age and gender, not the name or ID.
    user = llm.sent[1].content
    assert user.startswith("患者：") and "歳　男性" in user.splitlines()[0]
    assert all(secret not in user for secret in ("佐藤", "サトウ", PATIENT_ID))
    assert user.endswith("メモ：\n肺炎で入院")
    # No stay was chosen, so no chart.
    assert "診療記録" not in user
    assert "退院サマリー" in llm.sent[0].content


def test_draft_drops_the_blank_lines_a_model_opens_with():
    app.dependency_overrides[get_llm] = lambda: FakeLlm(reply="\n\n本文")
    head, body = text_of(events(client.post("/api/drafts", json=DRAFT))).split("\n")
    assert head.startswith("【患者】") and body == "本文"


def test_draft_takes_the_patient_from_the_records_not_from_the_request(llm):
    response = client.post(
        "/api/drafts", json={**DRAFT, "patient": {"id": PATIENT_ID, "name": "別人 太郎"}}
    )
    assert response.status_code == 200
    assert "別人" not in llm.sent[1].content


def test_draft_for_a_stay_reads_its_chart(llm):
    response = client.post(
        "/api/drafts",
        json={
            "workflowId": "discharge-summary",
            "patientId": PATIENT_ID,
            "encounterId": "00012345-2",
            "notes": "明日退院",
        },
    )
    assert response.status_code == 200
    user = llm.sent[1].content
    stay = user.splitlines()[1]
    assert stay.startswith("【入院】") and stay.endswith("〜入院中　呼吸器内科　5階東 501号室")
    # Each entry is headed with its date, kind and author, oldest first.
    assert user.index("入院時記録 医師 田村］") < user.index("看護記録 看護師 小野］")
    assert "市中肺炎（肺炎球菌性）" in user
    assert user.endswith("メモ：\n明日退院")


def test_draft_for_a_stay_without_a_chart_says_so(llm):
    client.post("/api/drafts", json={**DRAFT, "encounterId": "00012345-1"})
    assert "診療記録：\n（記録なし）" in llm.sent[1].content


def test_draft_says_whose_it_is_before_any_text():
    response = client.post("/api/drafts", json={**DRAFT, "encounterId": "00012345-2"})
    about = events(response)[0]["messageMetadata"]
    assert about["patientId"] == PATIENT_ID and about["encounterId"] == "00012345-2"
    # Which notes it was made from: the stay's seven, over nine days.
    assert about["noteCount"] == 7
    assert (date.fromisoformat(about["notesTo"]) - date.fromisoformat(about["notesFrom"])).days == 9


def test_draft_from_notes_alone_names_no_chart():
    response = client.post("/api/drafts", json=DRAFT)
    assert events(response)[0]["messageMetadata"] == {
        "patientId": PATIENT_ID,
        "encounterId": None,
        "noteCount": None,
        "notesFrom": None,
        "notesTo": None,
    }


@pytest.mark.parametrize(
    "ids",
    [
        {"patientId": "99999999"},
        {"patientId": "99999999", "encounterId": "00012345-2"},
        # Another patient's stay.
        {"patientId": PATIENT_ID, "encounterId": "00023456-3"},
    ],
)
def test_draft_refuses_an_unknown_patient_or_stay_before_streaming(llm, ids):
    response = client.post("/api/drafts", json={"workflowId": "note-summary", **ids})
    assert response.status_code == 404
    assert llm.sent == []


def test_draft_without_notes_says_so(llm):
    response = client.post("/api/drafts", json=DRAFT)
    assert response.status_code == 200
    assert llm.sent[1].content.endswith("（メモなし）")


def test_draft_rejects_an_unknown_workflow():
    response = client.post("/api/drafts", json={**DRAFT, "workflowId": "manual-search"})
    assert response.status_code == 422


def test_draft_uses_the_chosen_model(llm, two_models):
    client.post("/api/drafts?model=model-b", json=DRAFT)
    assert llm.model == "model-b"


@pytest.mark.parametrize(
    ("today", "age"),
    [(date(2026, 3, 1), 77), (date(2026, 3, 2), 78), (date(2026, 12, 31), 78)],
)
def test_age_turns_on_the_birthday(today, age):
    assert age_on(date(1948, 3, 2), today) == age
