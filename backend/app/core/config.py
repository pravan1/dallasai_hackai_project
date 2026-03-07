from pydantic_settings import BaseSettings


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
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow extra env vars without validation errors
        extra = "ignore"


settings = Settings()
