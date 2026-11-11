"""Pydantic schemas for Career Compass AI."""
from __future__ import annotations

import re
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one digit.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class ProfileInput(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True, from_attributes=True)

    full_name: str = Field(default="", alias="fullName", max_length=120)
    date_of_birth: str = Field(default="", alias="dateOfBirth", max_length=30)
    gender: str = Field(default="", max_length=30)
    phone_number: str = Field(default="", alias="phone", max_length=30)
    education_level: str = Field(default="Class 12 / PUC", alias="educationLevel", max_length=50)
    stream: str = Field(default="Science", max_length=50)
    preferred_stream: str = Field(default="", alias="preferredStream", max_length=50)
    board: str = Field(default="", max_length=80)
    institution: str = Field(default="", max_length=160)
    completion_year: str = Field(default="", alias="completionYear", max_length=20)
    study_location: str = Field(default="", alias="studyLocation", max_length=120)
    location: str = Field(default="", max_length=100)
    subjects: list[str] = Field(default_factory=list)
    career_goal: str = Field(default="", alias="careerGoal", max_length=200)
    math_score: float = Field(default=0, ge=0, le=100)
    science_score: float = Field(default=0, ge=0, le=100)
    english_score: float = Field(default=0, ge=0, le=100)
    interests: list[str] = Field(default_factory=list)
    skills: dict[str, float] = Field(default_factory=dict)
    work_preference: str = Field(default="", max_length=100)


class ProfileResponse(ProfileInput):
    id: int
    user_id: int


# ---------------------------------------------------------------------------
# Careers
# ---------------------------------------------------------------------------

class CareerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    domain: str
    description: str
    education_duration: str
    salary_range: str
    market_demand: float
    growth_rate: float
    eligibility: str


class RecommendationResponse(CareerResponse):
    fit_score: float
    factors: dict[str, float]
    explanation: str


# ---------------------------------------------------------------------------
# Misc
# ---------------------------------------------------------------------------

class WhatIfRequest(BaseModel):
    overrides: dict[str, float] = {}


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
