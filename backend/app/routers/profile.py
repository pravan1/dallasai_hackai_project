"""
Profile router — user profile CRUD.

Storage: in-memory dict for MVP. Replace with PostgreSQL in production.

Endpoints:
  GET   /api/profile/{user_id}   — fetch profile
  PATCH /api/profile/{user_id}   — update profile fields
"""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..core.security import get_current_user

router = APIRouter()

_profiles: dict[str, dict] = {}


def _default_profile(user_id: str, auth_user: dict | None) -> dict:
    return {
        "id": user_id,
        "email": (auth_user or {}).get("email", ""),
        "name": (auth_user or {}).get("name", ""),
        "role": None,
        "industry": None,
        "experienceLevel": "intermediate",
        "learningStyle": "visual",
        "availableStudyHoursPerWeek": None,
        "goals": [],
        "settings": {
            "voiceRepliesEnabled": True,
            "autoListenAfterGreeting": True,
            "gestureNavigationEnabled": False,
            "preferredSTTProvider": "web-speech",
            "preferredTTSProvider": "web-speech",
        },
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }


@router.get("/api/profile/{user_id}")
def get_profile(user_id: str, user: dict | None = Depends(get_current_user)):
    profile = _profiles.get(user_id) or _default_profile(user_id, user)
    _profiles[user_id] = profile
    return {"user": profile}


@router.patch("/api/profile/{user_id}")
def update_profile(
    user_id: str,
    data: dict[str, Any],
    user: dict | None = Depends(get_current_user),
):
    profile = _profiles.get(user_id) or _default_profile(user_id, user)
    profile.update(data)
    profile["updatedAt"] = datetime.utcnow().isoformat()
    _profiles[user_id] = profile
    return {"user": profile}
