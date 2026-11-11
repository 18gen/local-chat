import pytest

from app.config import get_settings
from app.main import app
from tests.helpers import client, make_settings


def test_health_says_whether_a_key_is_set_without_revealing_it():
    app.dependency_overrides[get_settings] = lambda: make_settings(llm_api_key="secret")
    response = client.get("/api/health")
    assert response.json() == {"configured": True}
    assert "secret" not in response.text


def test_health_counts_a_local_server_without_a_key_as_set_up():
    app.dependency_overrides[get_settings] = lambda: make_settings(
        llm_base_url="http://127.0.0.1:11434/v1"
    )
    assert client.get("/api/health").json() == {"configured": True}
    app.dependency_overrides[get_settings] = lambda: make_settings()
    assert client.get("/api/health").json() == {"configured": False}


HOSPITAL_LLM = {"llm_base_url": "http://vllm:8000/v1", "llm_allowed_hosts": ["vllm"]}


@pytest.mark.parametrize(
    ("values", "problem"),
    [
        # No address means the OpenAI API, outside the hospital.
        ({"app_env": "production"}, "LLM_BASE_URL must name"),
        (
            {"app_env": "staging", "llm_base_url": "https://api.openai.com/v1"},
            "LLM_ALLOWED_HOSTS",
        ),
        (
            {
                "app_env": "production",
                "llm_base_url": "https://api.openai.com/v1",
                "llm_allowed_hosts": ["vllm"],
            },
            "LLM_ALLOWED_HOSTS",
        ),
        ({"app_env": "staging", **HOSPITAL_LLM}, "AUTH_PROVIDER must not be mock"),
        ({"app_env": "production", **HOSPITAL_LLM}, "EMR_CONNECTOR must not be mock"),
    ],
)
def test_a_hospital_setup_that_could_leak_patient_data_does_not_start(values, problem):
    with pytest.raises(ValueError, match=problem):
        make_settings(**values)


def test_a_refused_setup_does_not_show_the_key():
    with pytest.raises(ValueError) as refused:
        make_settings(app_env="production", llm_api_key="secret")
    assert "secret" not in str(refused.value)


@pytest.mark.parametrize("app_env", ["development", "demo"])
def test_setups_without_patient_data_may_use_any_model(app_env):
    assert make_settings(app_env=app_env).llm_base_url is None
