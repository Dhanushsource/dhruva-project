"""Recommendations and chat router."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user, optional_current_user
from ..models import Career, StudentProfile, User
from ..recommendations import calculate_recommendation
from ..schemas import ChatRequest, RecommendationResponse

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations", response_model=list[RecommendationResponse])
def recommendations(
    user: User = Depends(current_user),
    database: Session = Depends(get_db),
):
    profile = user.profile or StudentProfile(user_id=user.id)
    careers = database.query(Career).all()
    results = [dict(career.__dict__, **calculate_recommendation(profile, career)) for career in careers]
    return sorted(results, key=lambda r: r["fit_score"], reverse=True)[:5]


@router.post("/chat")
def chat(
    payload: ChatRequest,
    user: User | None = Depends(optional_current_user),
    database: Session = Depends(get_db),
):
    question = payload.question.lower()
    careers = database.query(Career).all()
    matched_career = None
    for career in careers:
        if any(word in question for word in career.name.lower().split()):
            matched_career = career
            break

    if "skill" in question and matched_career:
        required = ", ".join(json.loads(matched_career.required_skills).keys())
        answer = (
            f"For {matched_career.name}, key skills include: {required}. "
            "Complete the assessment for a personalised skill-gap analysis."
        )
    elif "skill" in question:
        answer = (
            "Complete your assessment to see a personalised skill-gap report. "
            "Common skills valued across careers: communication, analytical thinking, and problem solving."
        )
    elif any(w in question for w in ["course", "study", "degree", "college"]):
        answer = (
            "After Class 12, common routes include B.Tech (engineering/CS via JEE/KCET), MBBS (via NEET), "
            "B.Sc (science/data), B.Com/BBA (business), B.Des (design via NID/UCEED), B.Arch (via NATA), "
            "and integrated law (via CLAT). Check the 'Courses' and 'Domains' sections for details."
        )
    elif any(w in question for w in ["salary", "pay", "earn", "lpa"]):
        answer = (
            "Salary varies by field and experience. Technology: INR 6–28 LPA; Healthcare: INR 3–30 LPA; "
            "Business: INR 4–25 LPA; Design: INR 5–18 LPA; Law: INR 4–25 LPA. "
            "See 'Salary expectations' for a full breakdown."
        )
    elif any(w in question for w in ["entrance", "exam", "neet", "jee", "kcet", "clat", "cuet"]):
        answer = (
            "Key entrance exams: JEE Main/Advanced (engineering), NEET-UG (medicine/nursing), "
            "CLAT (law at NLUs), CUET (central universities), KCET (Karnataka), "
            "NID DAT / UCEED (design), NATA (architecture), CAT/MAT/CMAT (MBA). "
            "See 'Entrance examinations' for exam dates and eligibility."
        )
    else:
        answer = (
            "I can help you compare careers, understand entrance exams, identify skill gaps, "
            "and plan your next steps. Try asking about a specific career, course, skill, or exam — "
            "for example: 'What skills do I need for Data Science?' or 'Which exam for law?'"
        )

    return {
        "answer": answer,
        "source": "Career Compass knowledge base and your profile",
        "disclaimer": "This is guidance based on current profile data. Always verify details with official sources.",
    }
