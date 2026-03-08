"""
Sources router — handles PDF upload, URL/YouTube links, and text notes.

Storage: in-memory dict for MVP.
Replace _sources_store with a PostgreSQL table + pgvector in production.

Endpoints:
  GET  /api/sources              — list all sources
  POST /api/sources/upload       — upload a PDF file
  POST /api/sources/url          — add a URL, YouTube link, or text note
  DELETE /api/sources/{id}       — remove a source
"""

import io
import re
import uuid
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from ..core.security import get_current_user

router = APIRouter()

# In-memory store: { source_id: source_dict }
# Each entry has: id, type, title, url, content (extracted text), status, createdAt
_sources_store: dict[str, dict] = {}


# -------------------------------------------------------------------------- GET

@router.get("/api/sources")
def get_sources(user: Optional[dict] = Depends(get_current_user)):
    sources = sorted(_sources_store.values(), key=lambda s: s["createdAt"], reverse=True)
    return {"sources": sources}


# ----------------------------------------------------------------------- UPLOAD

@router.post("/api/sources/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    user: Optional[dict] = Depends(get_current_user),
):
    """Accept a PDF file, extract its text, and store it for use in chat context."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only .pdf files are supported.")

    content_bytes = await file.read()
    text_content = _extract_pdf_text(content_bytes, file.filename)

    source_id = str(uuid.uuid4())
    source = {
        "id": source_id,
        "type": "pdf",
        "title": file.filename,
        "url": None,
        "filePath": None,
        "content": text_content[:8000],  # Store up to 8 000 chars for context
        "status": "ready",
        "errorMessage": None,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    _sources_store[source_id] = source
    return {"source": source}


# ------------------------------------------------------------------------- URL

class URLSourceRequest(BaseModel):
    type: str  # "url" | "youtube" | "note"
    url: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None  # For text/note type


@router.post("/api/sources/url")
async def add_url_source(
    payload: URLSourceRequest,
    user: Optional[dict] = Depends(get_current_user),
):
    """Add a web URL, YouTube link, or pasted text note as a source."""
    if payload.type not in ("url", "youtube", "note"):
        raise HTTPException(status_code=400, detail="type must be url, youtube, or note")

    if payload.type in ("url", "youtube") and not payload.url:
        raise HTTPException(status_code=400, detail="url is required for this type")

    if payload.type == "note" and not payload.content:
        raise HTTPException(status_code=400, detail="content is required for note type")

    source_id = str(uuid.uuid4())
    title = payload.title or payload.url or "Text Note"

    if payload.type == "note":
        content = payload.content or ""
    elif payload.type == "url":
        content = await _fetch_url_content(payload.url)
        if not title or title == payload.url:
            title = _extract_title(content, payload.url)
    else:  # youtube
        content = f"YouTube video: {payload.url}\n\n" + await _fetch_url_content(payload.url)

    source = {
        "id": source_id,
        "type": payload.type,
        "title": title,
        "url": payload.url,
        "filePath": None,
        "content": content[:8000],
        "status": "ready",
        "errorMessage": None,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    _sources_store[source_id] = source
    return {"source": source}


# ---------------------------------------------------------------------- DELETE

@router.delete("/api/sources/{source_id}")
def delete_source(
    source_id: str,
    user: Optional[dict] = Depends(get_current_user),
):
    if source_id not in _sources_store:
        raise HTTPException(status_code=404, detail="Source not found")
    del _sources_store[source_id]
    return {"success": True}


# -------------------------------------------------------------------- internal

async def _fetch_url_content(url: str) -> str:
    """Fetch a URL and return clean text content (HTML tags stripped)."""
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
            html = resp.text
            # Remove script/style blocks
            html = re.sub(r'<script[^>]*>[\s\S]*?</script>', ' ', html, flags=re.IGNORECASE)
            html = re.sub(r'<style[^>]*>[\s\S]*?</style>', ' ', html, flags=re.IGNORECASE)
            # Strip remaining tags
            text = re.sub(r'<[^>]+>', ' ', html)
            text = re.sub(r'\s+', ' ', text).strip()
            return text[:8000]
    except Exception as exc:
        return f"[Could not fetch content from {url}: {exc}]"


def _extract_title(text: str, fallback: str) -> str:
    """Try to extract a page title from stripped text."""
    # First 100 chars of content often has the title
    snippet = text[:200].strip()
    if snippet and len(snippet) > 10:
        return snippet[:80]
    return fallback or "Web Page"


def _extract_pdf_text(content_bytes: bytes, filename: str) -> str:
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
        if not text:
            return f"[{filename}: This PDF appears to be image-based or scanned. Text could not be extracted. Try copying and pasting the text manually using 'Paste Text / Note'.]"
        return text
    except Exception as exc:
        return f"[Could not extract text from {filename}: {exc}]"
