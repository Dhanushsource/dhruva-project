"""Auth router: register, login, refresh, logout."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import RefreshToken, StudentProfile, User
from ..schemas import LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, TokenResponse
from ..security import (
    create_access_token,
    generate_refresh_token,
    get_user_id,
    hash_password,
    hash_refresh_token,
    refresh_token_expiry,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


def _make_token_response(user: User, database: Session) -> TokenResponse:
    """Create access + refresh tokens, persist refresh token hash, return response."""
    raw_refresh = generate_refresh_token()
    db_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(raw_refresh),
        expires_at=refresh_token_expiry(),
    )
    database.add(db_token)
    database.commit()
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=raw_refresh,
        user={"id": user.id, "name": user.name, "email": user.email},
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, database: Session = Depends(get_db)):
    if database.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    user.profile = StudentProfile()
    database.add(user)
    database.commit()
    database.refresh(user)
    return _make_token_response(user, database)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, database: Session = Depends(get_db)):
    user = database.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return _make_token_response(user, database)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, database: Session = Depends(get_db)):
    token_hash = hash_refresh_token(payload.refresh_token)
    db_token = (
        database.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )
    if not db_token or db_token.revoked:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")
    if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token has expired. Please sign in again.")
    # Rotate: revoke old, issue new
    db_token.revoked = True
    database.commit()
    return _make_token_response(db_token.user, database)


@router.post("/logout", status_code=204)
def logout(payload: LogoutRequest, database: Session = Depends(get_db)):
    token_hash = hash_refresh_token(payload.refresh_token)
    db_token = database.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if db_token:
        db_token.revoked = True
        database.commit()
    # Always 204 — don't reveal whether token existed
