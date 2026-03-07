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
    user: Optional[dict] = Depends(get_current_user),
):
    profile = profile_module._profiles.get(userId, {
        "experienceLevel": "intermediate",
        "role": "Professional",
        "goals": [],
    })

    source_context = "\n".join(
        s.get("content", "")[:300]
        for s in sources_module._sources_store.values()
        if s.get("content")
    )[:1500]

    recommendations = gemini_service.generate_recommendations(profile, source_context)
    return {"recommendations": recommendations}
