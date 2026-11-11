"""Careers router: list, detail, skill-gap, what-if."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import Career, StudentProfile, User
from ..recommendations import calculate_recommendation
from ..schemas import CareerResponse, RecommendationResponse, WhatIfRequest

router = APIRouter(tags=["careers"])


@router.get("/careers", response_model=list[CareerResponse])
def list_careers(
    domain: str | None = None,
    search: str | None = None,
    database: Session = Depends(get_db),
):
    query = database.query(Career)
    if domain:
        query = query.filter(Career.domain.ilike(f"%{domain}%"))
    if search:
        query = query.filter(
            Career.name.ilike(f"%{search}%")
            | Career.domain.ilike(f"%{search}%")
            | Career.description.ilike(f"%{search}%")
        )
    return query.order_by(Career.market_demand.desc()).all()


@router.get("/careers/{career_id}", response_model=CareerResponse)
def career_details(career_id: int, database: Session = Depends(get_db)):
    career = database.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found.")
    return career


@router.get("/skill-gap/{career_id}")
def skill_gap(
    career_id: int,
    user: User = Depends(current_user),
    database: Session = Depends(get_db),
):
    career = database.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found.")
    current_skills = json.loads(user.profile.skills or "{}")
    required = json.loads(career.required_skills or "{}")
    gaps = [
        {
            "skill": skill,
            "current": round(float(current_skills.get(skill, 0))),
            "required": req,
            "gap": max(0, round(req - float(current_skills.get(skill, 0)))),
        }
        for skill, req in required.items()
    ]
    return {"career": career.name, "skills": sorted(gaps, key=lambda g: g["gap"], reverse=True)}


@router.post("/what-if", response_model=list[RecommendationResponse])
def what_if(
    payload: WhatIfRequest,
    user: User = Depends(current_user),
    database: Session = Depends(get_db),
):
    profile = StudentProfile(
        **{
            col.name: getattr(user.profile, col.name)
            for col in StudentProfile.__table__.columns
            if col.name != "id"
        }
    )
    for field, value in payload.overrides.items():
        if hasattr(profile, field) and isinstance(value, (int, float)):
            setattr(profile, field, max(0, min(100, value)))
    careers = database.query(Career).all()
    results = [dict(career.__dict__, **calculate_recommendation(profile, career)) for career in careers]
    return sorted(results, key=lambda r: r["fit_score"], reverse=True)[:5]
