from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="student")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    profile: Mapped["StudentProfile | None"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    saved_careers: Mapped[list["SavedCareer"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    full_name: Mapped[str] = mapped_column(String(120), default="")
    date_of_birth: Mapped[str] = mapped_column(String(30), default="")
    gender: Mapped[str] = mapped_column(String(30), default="")
    phone_number: Mapped[str] = mapped_column(String(30), default="")
    education_level: Mapped[str] = mapped_column(String(50), default="Class 12 / PUC")
    stream: Mapped[str] = mapped_column(String(50), default="Science")
    preferred_stream: Mapped[str] = mapped_column(String(50), default="")
    board: Mapped[str] = mapped_column(String(80), default="")
    institution: Mapped[str] = mapped_column(String(160), default="")
    completion_year: Mapped[str] = mapped_column(String(20), default="")
    study_location: Mapped[str] = mapped_column(String(120), default="")
    subjects: Mapped[str] = mapped_column(Text, default="[]")
    career_goal: Mapped[str] = mapped_column(String(200), default="")
    math_score: Mapped[float] = mapped_column(Float, default=0)
    science_score: Mapped[float] = mapped_column(Float, default=0)
    english_score: Mapped[float] = mapped_column(Float, default=0)
    interests: Mapped[str] = mapped_column(Text, default="[]")
    skills: Mapped[str] = mapped_column(Text, default="{}")
    work_preference: Mapped[str] = mapped_column(String(100), default="")
    location: Mapped[str] = mapped_column(String(100), default="")
    user: Mapped[User] = relationship(back_populates="profile")


class Career(Base):
    __tablename__ = "careers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    domain: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    required_skills: Mapped[str] = mapped_column(Text, default="{}")
    preferred_subjects: Mapped[str] = mapped_column(Text, default="[]")
    education_duration: Mapped[str] = mapped_column(String(40), default="4 years")
    salary_range: Mapped[str] = mapped_column(String(50), default="Varies")
    market_demand: Mapped[float] = mapped_column(Float, default=70)
    growth_rate: Mapped[float] = mapped_column(Float, default=10)
    eligibility: Mapped[str] = mapped_column(Text, default="Relevant undergraduate degree")


class SavedCareer(Base):
    __tablename__ = "saved_careers"
    __table_args__ = (UniqueConstraint("user_id", "career_id", name="uq_saved_career_user"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    career_id: Mapped[int] = mapped_column(ForeignKey("careers.id"), index=True)
    user: Mapped[User] = relationship(back_populates="saved_careers")
    career: Mapped[Career] = relationship()
