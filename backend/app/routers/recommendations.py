"""
Recommendations router — personalised learning recommendations via Gemini.

GET /api/recommendations?userId=<id>

For MVP, recommendations are generated fresh each time using the user's
profile and any source content they have uploaded.
"""

from typing import Optional

from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..services.gemini_service import gemini_service
from . import sources as sources_module
from . import profile as profile_module

router = APIRouter()


@router.get("/api/recommendations")
def get_recommendations(
    userId: str,
    role: Optional[str] = None,
    experienceLevel: Optional[str] = None,
    topic: Optional[str] = None,
    goals: Optional[str] = None,
    studyStyle: Optional[str] = None,
    user: Optional[dict] = Depends(get_current_user),
):
    saved = profile_module._profiles.get(userId, {})
    profile = {
        "experienceLevel": experienceLevel or saved.get("experienceLevel") or "intermediate",
        "role": role or saved.get("role") or "Professional",
        "topic": topic or "",
        "goals": goals or "",
        "studyStyle": studyStyle or "",
    }

    source_context = "\n".join(
        s.get("content", "")[:400]
        for s in sources_module._sources_store.values()
        if s.get("content")
    )[:4000]

    recommendations = gemini_service.generate_recommendations(profile, source_context)
    return {"recommendations": recommendations}
