from typing import Literal

from pydantic import BaseModel

StaffRole = Literal[
    "doctor",
    "nurse",
    "pharmacist",
    "radiological-technologist",
    "laboratory-technologist",
    "physical-therapist",
    "occupational-therapist",
    "speech-therapist",
    "dietitian",
    "social-worker",
    "medical-clerk",
    "office-staff",
]


class User(BaseModel):
    name: str
    role: StaffRole


def get_user() -> User:
    """The staff member using the app: a stand-in until sign-in exists."""
    return User(name="山田 太郎", role="doctor")
