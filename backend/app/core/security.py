"""
Auth0 JWT verification for FastAPI.

How it works:
  1. Frontend sends Auth0 access token in  Authorization: Bearer <token>
  2. This module fetches Auth0's public JWKS (cached after first fetch)
  3. Decodes + verifies the JWT against the JWKS
  4. Returns the payload (contains sub, email, etc.)

Dev mode: if AUTH0_DOMAIN or AUTH0_AUDIENCE is empty in .env,
          verification is skipped and a fake dev user is returned.
          Never leave this empty in production.
"""

from typing import Optional

from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
import httpx
from .config import settings

_bearer = HTTPBearer(auto_error=False)
_jwks_cache: Optional[dict] = None


def _fetch_jwks() -> dict:
    """Fetch Auth0 JWKS once and cache it for the lifetime of the process."""
    global _jwks_cache
    if _jwks_cache is None:
        url = f"https://{settings.auth0_domain}/.well-known/jwks.json"
        with httpx.Client(timeout=10) as client:
            resp = client.get(url)
            resp.raise_for_status()
            _jwks_cache = resp.json()
    return _jwks_cache


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_bearer),
) -> Optional[dict]:
    """
    FastAPI dependency — call as:  user: dict | None = Depends(get_current_user)

    Returns:
      - dict with Auth0 payload  (sub, email, name, …) if valid token
      - None                     if no token was sent
      - Raises HTTP 401          if token is present but invalid
    """
    if credentials is None:
        return None

    # Dev mode: skip verification when Auth0 is not configured
    if not settings.auth0_domain or not settings.auth0_audience:
        return {"sub": "dev-user", "email": "dev@learnflow.ai", "name": "Dev User"}

    try:
        jwks = _fetch_jwks()
        payload = jwt.decode(
            credentials.credentials,
            jwks,
            algorithms=["RS256"],
            audience=settings.auth0_audience,
            issuer=f"https://{settings.auth0_domain}/",
        )
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
