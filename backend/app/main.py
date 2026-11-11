import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Career, SavedCareer, StudentProfile, User
from .recommendations import calculate_recommendation
from .schemas import CareerResponse, ChatRequest, LoginRequest, ProfileInput, ProfileResponse, RecommendationResponse, RegisterRequest, TokenResponse, WhatIfRequest
from .security import create_access_token, get_user_id, hash_password, verify_password
from .seed import seed_careers
from .config import settings


Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    """Run startup tasks (seed DB) and cleanly shut down."""
    database = next(get_db())
    try:
        seed_careers(database)
    finally:
        database.close()
    yield


app = FastAPI(title="Career Compass AI API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def current_user(token: str = Depends(oauth2_scheme), database: Session = Depends(get_db)) -> User:
    try:
        user_id = get_user_id(token)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    user = database.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "career-compass-api"}


@app.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, database: Session = Depends(get_db)):
    if database.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    user.profile = StudentProfile()
    database.add(user)
    database.commit()
    database.refresh(user)
    return {"access_token": create_access_token(user.id), "user": {"id": user.id, "name": user.name, "email": user.email}}


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, database: Session = Depends(get_db)):
    user = database.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_access_token(user.id), "user": {"id": user.id, "name": user.name, "email": user.email}}


def _normalize_profile_data(data: dict[str, object]) -> dict[str, object]:
    aliases = {
        "fullName": "full_name",
        "dateOfBirth": "date_of_birth",
        "phone": "phone_number",
        "educationLevel": "education_level",
        "preferredStream": "preferred_stream",
        "completionYear": "completion_year",
        "studyLocation": "study_location",
        "careerGoal": "career_goal",
    }
    normalized: dict[str, object] = {}
    for key, value in data.items():
        field_name = aliases.get(key, key)
        normalized[field_name] = value
    return normalized


def _decode_json_field(value: object, default: list | dict) -> list | dict:
    expected_type = type(default)
    for _ in range(2):
        if isinstance(value, expected_type):
            return value
        if not isinstance(value, str):
            break
        try:
            value = json.loads(value)
        except (TypeError, ValueError):
            break
    return default


def _serialize_profile(profile: StudentProfile) -> dict[str, object]:
    data = {column.name: getattr(profile, column.name) for column in StudentProfile.__table__.columns}
    data["interests"] = _decode_json_field(data.get("interests"), [])
    data["skills"] = _decode_json_field(data.get("skills"), {})
    data["subjects"] = _decode_json_field(data.get("subjects"), [])
    return data


@app.get("/profile", response_model=ProfileResponse)
def get_profile(user: User = Depends(current_user)):
    if not user.profile:
        user.profile = StudentProfile(user_id=user.id)
    return _serialize_profile(user.profile)


@app.put("/profile", response_model=ProfileResponse)
def update_profile(payload: ProfileInput, user: User = Depends(current_user), database: Session = Depends(get_db)):
    profile = user.profile or StudentProfile(user_id=user.id)
    incoming = _normalize_profile_data(payload.model_dump(exclude_unset=True, by_alias=True))

    for field, value in incoming.items():
        if hasattr(profile, field):
            if field in {"interests", "skills", "subjects"}:
                setattr(profile, field, json.dumps(value))
            else:
                setattr(profile, field, value)

    database.add(profile)
    database.commit()
    database.refresh(profile)
    return _serialize_profile(profile)


@app.get("/careers", response_model=list[CareerResponse])
def list_careers(domain: str | None = None, search: str | None = None, database: Session = Depends(get_db)):
    query = database.query(Career)
    if domain:
        query = query.filter(Career.domain.ilike(f"%{domain}%"))
    if search:
        query = query.filter(Career.name.ilike(f"%{search}%") | Career.domain.ilike(f"%{search}%") | Career.description.ilike(f"%{search}%"))
    return query.order_by(Career.market_demand.desc()).all()


@app.get("/careers/{career_id}", response_model=CareerResponse)
def career_details(career_id: int, database: Session = Depends(get_db)):
    career = database.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    return career


@app.get("/recommendations", response_model=list[RecommendationResponse])
def recommendations(user: User = Depends(current_user), database: Session = Depends(get_db)):
    profile = user.profile or StudentProfile(user_id=user.id)
    careers = database.query(Career).all()
    results = [dict(career.__dict__, **calculate_recommendation(profile, career)) for career in careers]
    return sorted(results, key=lambda result: result["fit_score"], reverse=True)[:5]


@app.get("/saved-careers", response_model=list[CareerResponse])
def get_saved_careers(user: User = Depends(current_user), database: Session = Depends(get_db)):
    saved = database.query(SavedCareer).filter(SavedCareer.user_id == user.id).all()
    career_ids = [item.career_id for item in saved]
    if not career_ids:
        return []
    return database.query(Career).filter(Career.id.in_(career_ids)).all()


@app.post("/saved-careers/{career_id}", status_code=201)
def save_career(career_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)):
    career = database.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    existing = database.query(SavedCareer).filter_by(user_id=user.id, career_id=career_id).first()
    if existing:
        return {"saved": True, "message": "Career already saved"}
    database.add(SavedCareer(user_id=user.id, career_id=career_id))
    database.commit()
    return {"saved": True, "message": "Career saved successfully"}


@app.delete("/saved-careers/{career_id}")
def remove_saved_career(career_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)):
    saved = database.query(SavedCareer).filter_by(user_id=user.id, career_id=career_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved career not found")
    database.delete(saved)
    database.commit()
    return {"saved": False, "message": "Career removed from saved list"}


@app.get("/skill-gap/{career_id}")
def skill_gap(career_id: int, user: User = Depends(current_user), database: Session = Depends(get_db)):
    career = database.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    current = json.loads(user.profile.skills or "{}")
    required = json.loads(career.required_skills or "{}")
    gaps = [{"skill": skill, "current": round(float(current.get(skill, 0))), "required": requirement, "gap": max(0, round(requirement - float(current.get(skill, 0))))} for skill, requirement in required.items()]
    return {"career": career.name, "skills": sorted(gaps, key=lambda item: item["gap"], reverse=True)}


@app.post("/what-if", response_model=list[RecommendationResponse])
def what_if(payload: WhatIfRequest, user: User = Depends(current_user), database: Session = Depends(get_db)):
    profile = StudentProfile(**{column.name: getattr(user.profile, column.name) for column in StudentProfile.__table__.columns if column.name != "id"})
    for field, value in payload.overrides.items():
        if hasattr(profile, field) and isinstance(value, (int, float)):
            setattr(profile, field, max(0, min(100, value)))
    careers = database.query(Career).all()
    results = [dict(career.__dict__, **calculate_recommendation(profile, career)) for career in careers]
    return sorted(results, key=lambda result: result["fit_score"], reverse=True)[:5]


@app.post("/chat")
def chat(payload: ChatRequest, user: User = Depends(current_user), database: Session = Depends(get_db)):
    question = payload.question.lower()
    career = database.query(Career).filter(Career.name.ilike("%data scientist%")).first()
    if "skill" in question and career:
        required = ", ".join(json.loads(career.required_skills).keys())
        answer = f"For {career.name}, start with {required}. Your profile can be refined through the assessment, and the recommendations are guidance based on your current information."
    elif "course" in question:
        answer = "After Class 12, compare a B.Tech in AI and Data Science, B.Tech CSE, B.Sc Data Science, or B.Sc Statistics against your subjects, budget, and preferred learning style."
    else:
        answer = "I can help you compare careers, identify skill gaps, and plan next steps. Try asking about a career, course, or skill you are considering."
    return {"answer": answer, "source": "career database and student profile", "disclaimer": "This is guidance based on your current profile, not a guaranteed prediction."}


project_root = Path(__file__).resolve().parents[2]
app.mount("/", StaticFiles(directory=str(project_root), html=True), name="frontend")
