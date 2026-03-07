"""
Studio router — AI-generated practice questions and concept map from uploaded sources.

Endpoints:
  GET /api/practice-questions   — generate 3 MCQs from sources
  GET /api/concept-map          — extract key concepts + relationships from sources
"""

import json
import re
from typing import Optional

from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..services.gemini_service import gemini_service, MODEL_NAME
from . import sources as sources_module

router = APIRouter()


def _get_source_text() -> str:
    """Concatenate all uploaded source content."""
    snippets = [
        s.get("content", "")
        for s in sources_module._sources_store.values()
        if s.get("content")
    ]
    return "\n\n---\n\n".join(snippets)[:6000]


# ---------------------------------------------------------------- practice questions

@router.get("/api/practice-questions")
def get_practice_questions(user: Optional[dict] = Depends(get_current_user)):
    source_text = _get_source_text()

    if not source_text.strip():
        return {"questions": [], "noSources": True}

    prompt = f"""You are a learning assessment expert. Based ONLY on the following source material, generate 3 multiple-choice practice questions.

Source material:
{source_text}

Return ONLY a valid JSON array — no markdown, no explanation:
[
  {{
    "id": "1",
    "type": "multiple_choice",
    "concept": "Short concept name from the source",
    "question": "Clear question based on the source material?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation referencing the source"
  }}
]

Rules:
- Questions must be directly answerable from the source text provided
- The "correct" field is the 0-based index of the correct option
- Make distractors plausible but clearly wrong based on the source
- Keep questions focused and unambiguous"""

    try:
        response = gemini_service._get_client().models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        raw = response.text or ""
        match = re.search(r"\[[\s\S]*?\]", raw)
        if match:
            questions = json.loads(match.group())
            return {"questions": questions, "noSources": False}
    except Exception as exc:
        return {"questions": [], "error": str(exc), "noSources": False}

    return {"questions": [], "noSources": False}


# ---------------------------------------------------------------- concept map

@router.get("/api/concept-map")
def get_concept_map(user: Optional[dict] = Depends(get_current_user)):
    source_text = _get_source_text()

    if not source_text.strip():
        return {"concepts": [], "relationships": [], "noSources": True}

    prompt = f"""You are a knowledge graph expert. Based ONLY on the following source material, extract the key concepts and their relationships.

Source material:
{source_text}

Return ONLY a valid JSON object — no markdown, no explanation:
{{
  "concepts": [
    {{
      "id": "c1",
      "label": "Concept Name",
      "description": "One sentence from the source",
      "importance": "high|medium|low"
    }}
  ],
  "relationships": [
    {{
      "from": "c1",
      "to": "c2",
      "type": "prerequisite|related|part_of",
      "label": "optional short label"
    }}
  ]
}}

Rules:
- Extract 5-10 concepts from the source
- Only include concepts explicitly mentioned in the source
- Relationships must reflect actual connections described in the source"""

    try:
        response = gemini_service._get_client().models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        raw = response.text or ""
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            data = json.loads(match.group())
            return {
                "concepts": data.get("concepts", []),
                "relationships": data.get("relationships", []),
                "noSources": False,
            }
    except Exception as exc:
        return {"concepts": [], "relationships": [], "error": str(exc), "noSources": False}

    return {"concepts": [], "relationships": [], "noSources": False}
