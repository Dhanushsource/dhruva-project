from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileInput(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True, from_attributes=True)

    full_name: str = Field(default="", alias="fullName")
    date_of_birth: str = Field(default="", alias="dateOfBirth")
    gender: str = Field(default="")
    phone_number: str = Field(default="", alias="phone")
    education_level: str = Field(default="Class 12 / PUC", alias="educationLevel")
    stream: str = Field(default="Science")
    preferred_stream: str = Field(default="", alias="preferredStream")
    board: str = Field(default="")
    institution: str = Field(default="")
    completion_year: str = Field(default="", alias="completionYear")
    study_location: str = Field(default="", alias="studyLocation")
    location: str = Field(default="")
    subjects: list[str] = Field(default_factory=list)
    career_goal: str = Field(default="", alias="careerGoal")
    math_score: float = Field(default=0, ge=0, le=100)
    science_score: float = Field(default=0, ge=0, le=100)
    english_score: float = Field(default=0, ge=0, le=100)
    interests: list[str] = Field(default_factory=list)
    skills: dict[str, float] = Field(default_factory=dict)
    work_preference: str = Field(default="")


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


class RecommendationResponse(CareerResponse):
    fit_score: float
    factors: dict[str, float]
    explanation: str


class ProfileResponse(ProfileInput):
    id: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class WhatIfRequest(BaseModel):
    overrides: dict[str, float] = {}


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
