"""
GeminiService — all Gemini API calls go through here.

Model used: gemini-2.0-flash-exp
  - chat()                  →  conversational Q&A with optional source context
  - generate_recommendations() →  personalised learning recommendations
  - embed()                 →  text embedding vector (for future pgvector RAG)

To swap models (e.g. gemini-1.5-pro), change MODEL_NAME only.
"""

import json
import re

import google.generativeai as genai

from ..core.config import settings

MODEL_NAME = "gemini-2.0-flash-exp"
EMBEDDING_MODEL = "models/text-embedding-004"

SYSTEM_PROMPT = (
    "You are LearnFlow, an expert AI learning assistant. "
    "Help the user understand topics clearly and concisely. "
    "Reference any provided source material when it's relevant. "
    "When suggesting next steps, be specific and actionable."
)


class GeminiService:
    def __init__(self) -> None:
        if settings.google_ai_api_key:
            genai.configure(api_key=settings.google_ai_api_key)
        self._model = genai.GenerativeModel(MODEL_NAME)

    # ---------------------------------------------------------------------- chat

    def chat(
        self,
        message: str,
        history: list[dict],
        source_context: str = "",
    ) -> dict:
        """
        Send a message and return { content, metadata }.

        history  — list of {"role": "user"|"assistant", "content": "..."}
        source_context — raw text extracted from uploaded sources (for RAG)
        """
        system = SYSTEM_PROMPT
        if source_context:
            system += f"\n\nRelevant material from the user's sources:\n{source_context}"

        # Build the prompt as a single string so we can use the simple API
        parts: list[str] = [system, ""]
        for msg in history[-10:]:  # last 10 messages to stay within token limits
            role_label = "User" if msg["role"] == "user" else "Assistant"
            parts.append(f"{role_label}: {msg['content']}")
        parts.append(f"User: {message}")
        parts.append("Assistant:")

        response = self._model.generate_content("\n".join(parts))
        text = response.text

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
        """Return a list of personalised learning recommendation dicts."""
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

        response = self._model.generate_content(prompt)
        match = re.search(r"\[[\s\S]*?\]", response.text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return []

    # ------------------------------------------------------------------- embed

    def embed(self, text: str) -> list[float]:
        """Return a 768-dimensional embedding vector (for pgvector RAG)."""
        result = genai.embed_content(model=EMBEDDING_MODEL, content=text)
        return result["embedding"]

    # ---------------------------------------------------------------- internal

    def _extract_questions(self, text: str) -> list[str]:
        lines = text.split("\n")
        return [
            line.strip()
            for line in lines
            if "?" in line and 10 < len(line.strip()) < 140
        ][:3]


gemini_service = GeminiService()
