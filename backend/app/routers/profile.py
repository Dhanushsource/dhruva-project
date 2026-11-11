"""Profile router: GET and PUT /profile."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import StudentProfile, User
from ..schemas import ProfileInput, ProfileResponse

router = APIRouter(tags=["profile"])

_ALIASES: dict[str, str] = {
    "fullName": "full_name",
    "dateOfBirth": "date_of_birth",
    "phone": "phone_number",
    "educationLevel": "education_level",
    "preferredStream": "preferred_stream",
    "completionYear": "completion_year",
    "studyLocation": "study_location",
    "careerGoal": "career_goal",
}

_JSON_FIELDS = {"interests", "skills", "subjects"}


def _serialize_profile(profile: StudentProfile) -> dict:
    data = {col.name: getattr(profile, col.name) for col in StudentProfile.__table__.columns}
    for field in _JSON_FIELDS:
        raw = data.get(field)
        default: list | dict = {} if field == "skills" else []
        if isinstance(raw, str):
            try:
                data[field] = json.loads(raw)
            except (TypeError, ValueError):
                data[field] = default
        elif not isinstance(raw, (list, dict)):
            data[field] = default
    for alias, col_name in _ALIASES.items():
        if col_name in data:
            data[alias] = data[col_name]
    return data


def _normalize(incoming: dict) -> dict:
    return {_ALIASES.get(k, k): v for k, v in incoming.items()}


@router.get("/profile", response_model=ProfileResponse)
def get_profile(user: User = Depends(current_user)):
    if not user.profile:
        user.profile = StudentProfile(user_id=user.id)
    return _serialize_profile(user.profile)


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    payload: ProfileInput,
    user: User = Depends(current_user),
    database: Session = Depends(get_db),
):
    profile = user.profile or StudentProfile(user_id=user.id)
    incoming = _normalize(payload.model_dump(exclude_unset=True, by_alias=True))
    for field, value in incoming.items():
        if hasattr(profile, field):
            if field in _JSON_FIELDS:
                setattr(profile, field, json.dumps(value))
            else:
                setattr(profile, field, value)
    database.add(profile)
    database.commit()
    database.refresh(profile)
    return _serialize_profile(profile)
