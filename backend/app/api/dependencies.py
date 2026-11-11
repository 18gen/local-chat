"""What routes ask for, each named once."""

from typing import Annotated

from fastapi import Depends, HTTPException

from app.auth import User, get_user
from app.config import Settings, get_settings
from app.emr.connector import EmrConnector, get_emr
from app.llm import Llm, get_llm

SettingsDep = Annotated[Settings, Depends(get_settings)]
LlmDep = Annotated[Llm, Depends(get_llm)]
EmrDep = Annotated[EmrConnector, Depends(get_emr)]
CurrentUser = Annotated[User, Depends(get_user)]


def chosen_model(settings: SettingsDep, model: str | None = None) -> str:
    """The ?model= query, which must be one on offer; the default without it.
    A dependency, so a bad one is refused before the stream starts."""
    if model is None:
        return settings.llm_models[0]
    if model not in settings.llm_models:
        raise HTTPException(status_code=422, detail="Unknown model")
    return model


ChosenModel = Annotated[str, Depends(chosen_model)]
