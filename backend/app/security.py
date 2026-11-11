"""Security utilities: password hashing, JWT access/refresh tokens."""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return password_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# Access token (short-lived JWT)
# ---------------------------------------------------------------------------

def create_access_token(user_id: int) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": str(user_id), "exp": expiry, "type": "access"},
        settings.jwt_secret,
        algorithm="HS256",
    )


def get_user_id(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise ValueError("Not an access token")
        return int(payload["sub"])
    except (JWTError, KeyError, TypeError, ValueError) as error:
        raise ValueError("Invalid authentication token") from error


# ---------------------------------------------------------------------------
# Refresh token (opaque random string, stored as hash in DB)
# ---------------------------------------------------------------------------

def generate_refresh_token() -> str:
    """Return a 64-byte URL-safe random string."""
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
