import pytest

from app.config import get_settings
from app.emr.connector import get_emr
from app.emr.mock.connector import MockEmrConnector
from app.llm import get_llm
from app.main import app
from tests.helpers import FakeLlm, make_settings


@pytest.fixture
def llm() -> FakeLlm:
    return FakeLlm()


@pytest.fixture(autouse=True)
def stand_ins(llm):
    """Every test runs on stand-ins: none reads backend/.env, which holds the
    real key, and none can call a model."""
    app.dependency_overrides[get_settings] = lambda: make_settings()
    app.dependency_overrides[get_emr] = lambda: MockEmrConnector()
    app.dependency_overrides[get_llm] = lambda: llm
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def two_models():
    app.dependency_overrides[get_settings] = lambda: make_settings(
        llm_models=["model-a", "model-b"]
    )
