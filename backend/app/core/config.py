from pathlib import Path

from pydantic_settings import BaseSettings

# Resolve path to backend/.env regardless of which directory uvicorn is launched from
_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    # ------------------------------------------------------------------ Gemini
    # Set this in backend/.env  →  GOOGLE_AI_API_KEY=your_key_here
    google_ai_api_key: str = ""

    # ------------------------------------------------------------------ Auth0
    # Set these in backend/.env after creating an Auth0 application.
    # AUTH0_DOMAIN example: dev-abc123.us.auth0.com  (no https://, no trailing slash)
    # AUTH0_AUDIENCE must match the API identifier you register in Auth0 dashboard.
    auth0_domain: str = ""
    auth0_audience: str = ""

    # ------------------------------------------------------------------ App
    frontend_url: str = "http://localhost:3000"
    port: int = 8000

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
