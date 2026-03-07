"""
Chat router — conversational AI powered by Gemini.

Endpoints match the contract expected by the frontend's useChat hook
and assistantApiClient:
  POST /api/chat                                  — for useVoiceAssistant
  GET  /api/conversations/{id}/messages           — load history
  POST /api/conversations/{id}/messages           — send a message

Conversation history and source context are kept in memory for MVP.
Replace with PostgreSQL in production.
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..core.security import get_current_user
from ..services.gemini_service import gemini_service
from . import sources as sources_module  # share the in-memory source store

router = APIRouter()

# { conversation_id: [ {role, content}, ... ] }
_conversations: dict[str, list[dict]] = {}


# -------------------------------------------------------------------------- helpers

def _build_source_context() -> str:
    """Concatenate stored source content to inject into Gemini as RAG context."""
    snippets = [
        s.get("content", "")[:500]
        for s in sources_module._sources_store.values()
        if s.get("content")
    ]
    return "\n\n".join(snippets)[:3000]


def _make_message(conversation_id: str | None, role: str, content: str, input_mode: str, metadata: dict) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "conversationId": conversation_id,
        "role": role,
        "content": content,
        "inputMode": input_mode,
        "metadata": metadata,
        "createdAt": datetime.utcnow().isoformat(),
    }


# ----------------------------------------------------------------- POST /api/chat

class ChatRequest(BaseModel):
    message: str
    conversationId: str | None = None
    userId: str
    inputMode: str = "voice"


@router.post("/api/chat")
def chat(payload: ChatRequest, user: dict | None = Depends(get_current_user)):
    """Used by useVoiceAssistant after speech recognition finishes."""
    history = _conversations.get(payload.conversationId or "", [])
    result = gemini_service.chat(payload.message, history, _build_source_context())

    user_msg = _make_message(payload.conversationId, "user", payload.message, payload.inputMode, {})
    asst_msg = _make_message(payload.conversationId, "assistant", result["content"], "text", result["metadata"])

    if payload.conversationId:
        history = history + [
            {"role": "user", "content": payload.message},
            {"role": "assistant", "content": result["content"]},
        ]
        _conversations[payload.conversationId] = history[-20:]

    return {"userMessage": user_msg, "assistantMessage": asst_msg}


# ---- GET /api/conversations/{id}/messages

@router.get("/api/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str, user: dict | None = Depends(get_current_user)):
    history = _conversations.get(conversation_id, [])
    messages = [
        _make_message(conversation_id, msg["role"], msg["content"], "text", {})
        for msg in history
    ]
    return {"messages": messages}


# ---- POST /api/conversations/{id}/messages

class SendMessageRequest(BaseModel):
    content: str
    inputMode: str = "text"


@router.post("/api/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: str,
    payload: SendMessageRequest,
    user: dict | None = Depends(get_current_user),
):
    """Used by the frontend chat input (text mode)."""
    history = _conversations.get(conversation_id, [])
    result = gemini_service.chat(payload.content, history, _build_source_context())

    user_msg = _make_message(conversation_id, "user", payload.content, payload.inputMode, {})
    asst_msg = _make_message(conversation_id, "assistant", result["content"], "text", result["metadata"])

    history = history + [
        {"role": "user", "content": payload.content},
        {"role": "assistant", "content": result["content"]},
    ]
    _conversations[conversation_id] = history[-20:]

    return {"userMessage": user_msg, "assistantMessage": asst_msg}
