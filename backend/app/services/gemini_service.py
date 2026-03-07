"""
GeminiService — all Gemini API calls go through here.

Model used: gemini-2.0-flash
  - chat()                     →  conversational Q&A with optional source context
  - generate_recommendations() →  personalised learning recommendations
  - embed()                    →  text embedding vector (for future pgvector RAG)

To swap models (e.g. gemini-1.5-pro), change MODEL_NAME only.
"""

import json
import re
from typing import Optional

from google import genai
from google.genai import types

from ..core.config import settings

MODEL_NAME = "gemini-2.0-flash"
EMBEDDING_MODEL = "text-embedding-004"

SYSTEM_PROMPT = (
    "You are LearnFlow, an expert AI learning assistant. "
    "Help the user understand topics clearly and concisely. "
    "Reference any provided source material when it's relevant. "
    "When suggesting next steps, be specific and actionable."
)


class GeminiService:
    def __init__(self) -> None:
        self._client: Optional[genai.Client] = None

    def _get_client(self) -> genai.Client:
        if self._client is None:
            key = settings.google_ai_api_key
            if not key or key == "your-gemini-api-key-here":
                raise ValueError(
                    "GOOGLE_AI_API_KEY is not set. Add it to backend/.env"
                )
            self._client = genai.Client(api_key=key)
        return self._client

    # ---------------------------------------------------------------------- chat

    def chat(
        self,
        message: str,
        history: list[dict],
        source_context: str = "",
    ) -> dict:
        system = SYSTEM_PROMPT
        if source_context:
            system += f"\n\nRelevant material from the user's sources:\n{source_context}"

        # Build contents list from history
        contents: list[types.ContentDict] = []
        for msg in history[-10:]:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})
        contents.append({"role": "user", "parts": [{"text": message}]})

        response = self._get_client().models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system),
        )
        text = response.text or ""

        return {
            "content": text,
            "metadata": {
                "sourcesCited": [],
                "suggestedQuestions": self._extract_questions(text),
            },
        }

    # --------------------------------------------------------- recommendations

    def generate_recommendations(
        self,
        profile: dict,
        source_context: str = "",
    ) -> list[dict]:
        context_note = (
            f"\nAvailable learning sources:\n{source_context[:600]}"
            if source_context
            else ""
        )
        prompt = f"""Generate 3 personalised learning recommendations for this learner.

Profile:
{json.dumps(profile, indent=2)}
{context_note}

Return ONLY a valid JSON array — no markdown, no explanation:
[
  {{
    "type": "next_topic",
    "title": "Short title",
    "description": "1–2 sentence description",
    "reasoning": "Why this is useful for this learner",
    "difficultyLevel": "easy|medium|hard",
    "estimatedTimeMinutes": 30,
    "priorityScore": 0.85
  }}
]"""

        response = self._get_client().models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        match = re.search(r"\[[\s\S]*?\]", response.text or "")
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return []

    # ------------------------------------------------------------------- embed

    def embed(self, text: str) -> list[float]:
        result = self._get_client().models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
        )
        return result.embeddings[0].values

    # ---------------------------------------------------------------- internal

    def _extract_questions(self, text: str) -> list[str]:
        lines = text.split("\n")
        return [
            line.strip()
            for line in lines
            if "?" in line and 10 < len(line.strip()) < 140
        ][:3]


gemini_service = GeminiService()
