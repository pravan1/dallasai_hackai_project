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

from google import generativeai as genai
from google.genai import types

from ..core.config import settings

MODEL_NAME = "gemini-1.5-flash"
EMBEDDING_MODEL = "text-embedding-004"

SYSTEM_PROMPT = (
    "You are LearnFlow, a warm and expert AI learning assistant. "
    "Your job is to help the user understand their uploaded learning materials deeply. "
    "When source material is provided, always ground your answers in it — quote or reference it directly. "
    "If a message is a greeting or small talk (hi, thanks, how are you, etc.), reply briefly and warmly, "
    "then gently redirect to the learning material — e.g. 'What would you like to explore from your sources today?' "
    "If the user asks something not covered by their sources, say so honestly and offer to explain the concept generally. "
    "Never make up facts. Keep answers clear, concise, and encouraging."
)


class GeminiService:
    def __init__(self) -> None:
        self._configured = False

    def _has_key(self) -> bool:
        key = settings.google_ai_api_key
        return bool(key and key != "your-gemini-api-key-here")

    def _configure(self):
        if not self._configured:
            if not self._has_key():
                raise ValueError("GOOGLE_AI_API_KEY is not set. Add it to backend/.env")
            genai.configure(api_key=settings.google_ai_api_key)
            self._configured = True

    def get_model(self, model_name: str = MODEL_NAME):
        self._configure()
        return genai.GenerativeModel(model_name)

    # ---------------------------------------------------------------------- chat

    def chat(
        self,
        message: str,
        history: list[dict],
        source_context: str = "",
    ) -> dict:
        if not self._has_key():
            return {
                "content": "⚠️ AI responses are not available yet — the Gemini API key hasn't been configured. Add `GOOGLE_AI_API_KEY=your_key` to `backend/.env` and restart the backend.",
                "metadata": {"sourcesCited": [], "suggestedQuestions": []},
            }

        self._configure()

        system = SYSTEM_PROMPT
        if source_context:
            system += f"\n\nRelevant material from the user's sources:\n{source_context}"

        model = genai.GenerativeModel(MODEL_NAME, system_instruction=system)

        # Build conversation history
        history_parts = []
        for msg in history[-10:]:
            if msg["role"] == "user":
                history_parts.append(msg["content"])
            else:
                history_parts.append(f"Assistant: {msg['content']}")
        history_parts.append(message)

        full_prompt = "\n".join(history_parts)

        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                max_output_tokens=2048,
            ),
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

        self._configure()
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        match = re.search(r"\[[\s\S]*?\]", response.text or "")
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return []

    # ------------------------------------------------------------------- embed

    def embed(self, text: str) -> list[float]:
        self._configure()
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
        )
        return result['embedding']

    # ---------------------------------------------------------------- internal

    def _extract_questions(self, text: str) -> list[str]:
        lines = text.split("\n")
        return [
            line.strip()
            for line in lines
            if "?" in line and 10 < len(line.strip()) < 140
        ][:3]


gemini_service = GeminiService()
