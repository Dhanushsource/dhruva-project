"""Saved-careers router."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import Career, SavedCareer, User
from ..schemas import CareerResponse

router = APIRouter(tags=["saved-careers"])


@router.get("/saved-careers", response_model=list[CareerResponse])
def get_saved_careers(
    user: User = Depends(current_user),
    database: Session = Depends(get_db),
):
    saved = database.query(SavedCareer).filter(SavedCareer.user_id == user.id).all()
    ids = [s.career_id for s in saved]
    if not ids:
        return []
    return database.query(Career).filter(Career.id.in_(ids)).all()


@router.post("/saved-careers/{career_id}", status_code=201)
def save_career(
    career_id: int,
    user: User = Depends(current_user),
    database: Session = Depends(get_db),
):
    career = database.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found.")
    if database.query(SavedCareer).filter_by(user_id=user.id, career_id=career_id).first():
        return {"saved": True, "message": "Career already saved."}
    database.add(SavedCareer(user_id=user.id, career_id=career_id))
    database.commit()
    return {"saved": True, "message": "Career saved successfully."}


@router.delete("/saved-careers/{career_id}")
def remove_saved_career(
    career_id: int,
    user: User = Depends(current_user),
    database: Session = Depends(get_db),
):
    saved = database.query(SavedCareer).filter_by(user_id=user.id, career_id=career_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved career not found.")
    database.delete(saved)
    database.commit()
    return {"saved": False, "message": "Career removed."}
