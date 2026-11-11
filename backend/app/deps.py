"""Shared FastAPI dependencies to avoid circular imports."""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import get_user_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def current_user(
    token: str = Depends(oauth2_scheme),
    database: Session = Depends(get_db),
) -> User:
    try:
        user_id = get_user_id(token)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)
        ) from error
    user = database.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found."
        )
    return user


def optional_current_user(
    token: str | None = Depends(oauth2_scheme_optional),
    database: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    try:
        user_id = get_user_id(token)
        return database.get(User, user_id)
    except Exception:
        return None
