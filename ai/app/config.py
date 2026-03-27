"""
app/config.py
─────────────
Central settings loaded once at startup via pydantic-settings.
All secrets come from environment variables / .env.local files.
Never import settings at module level outside this file — always
call get_settings() so tests can override via monkeypatching.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve service root so we can load .env.local from multiple repository layouts
_HERE = Path(__file__).resolve().parent
_SVC_ROOT = _HERE.parent
_ENV_FILES = [
    str(_SVC_ROOT / ".env.local"),
    str(_SVC_ROOT.parent / ".env.local"),
    str(_SVC_ROOT.parent.parent / ".env.local"),
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILES,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ───────────────────────────────────────────────────────────────
    app_name: str = "Omniweb AI Platform"
    app_version: str = "0.2.0"
    debug: bool = False
    port: int = Field(default=8000, alias="PORT")
    frontend_origin: str = Field(default="http://localhost:3000", alias="FRONTEND_ORIGIN")

    # ── Supabase ──────────────────────────────────────────────────────────
    supabase_url: str = Field(default="", alias="NEXT_PUBLIC_SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="NEXT_PUBLIC_SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_db_url: str = Field(default="", alias="SUPABASE_DB_URL")
    # Supabase Postgres direct connection (for SQLAlchemy / Alembic)
    database_url: str = Field(default="", alias="DATABASE_URL")

    # ── DigitalOcean AI ───────────────────────────────────────────────────
    do_api_key: str = Field(default="", alias="DIGITALOCEAN_API_KEY")
    
    # ── OpenAI ────────────────────────────────────────────────────────────
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    
    # ── Deepgram ──────────────────────────────────────────────────────────
    deepgram_api_key: str = Field(default="", alias="DEEPGRAM_API_KEY")
    
    # ── LiveKit ───────────────────────────────────────────────────────────
    livekit_api_key: str = Field(default="", alias="LIVEKIT_API_KEY")
    livekit_api_secret: str = Field(default="", alias="LIVEKIT_API_SECRET")
    do_agent_id: str = Field(default="", alias="DIGITALOCEAN_AGENT_ID")
    do_genai_endpoint: str = Field(
        default="https://inference.do-ai.run/v1",
        alias="DIGITALOCEAN_GENAI_ENDPOINT",
    )

    # ── OpenAI fallback ───────────────────────────────────────────────────
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    llm_model: str = Field(default="openai/gpt-4o-mini", alias="OMNIWEB_LLM_MODEL")
    llm_max_tokens: int = 500
    llm_temperature: float = 0.6

    # ── Deepgram ──────────────────────────────────────────────────────────
    deepgram_api_key: str = Field(default="", alias="DEEPGRAM_API_KEY")
    deepgram_stt_model: str = Field(default="nova-3", alias="DEEPGRAM_STT_MODEL")
    deepgram_tts_voice: str = Field(default="aura-2-thalia-en", alias="DEEPGRAM_TTS_VOICE")

    # ── LiveKit ───────────────────────────────────────────────────────────
    livekit_url: str = Field(default="wss://localhost:7880", alias="LIVEKIT_URL")
    livekit_api_key: str = Field(default="", alias="LIVEKIT_API_KEY")
    livekit_api_secret: str = Field(default="", alias="LIVEKIT_API_SECRET")

    # ── Security ──────────────────────────────────────────────────────────
    webhook_secret: str = Field(default="", alias="WEBHOOK_SECRET")
    # Internal service-to-service API key (set on DO App Platform)
    internal_api_key: str = Field(default="", alias="INTERNAL_API_KEY")

    # ── Derived helpers ───────────────────────────────────────────────────
    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_anon_key and self.supabase_service_role_key)

    @property
    def db_configured(self) -> bool:
        """True when a real Postgres URL is available (Supabase direct or local)."""
        return bool(self.database_url or self.supabase_db_url)

    @property
    def effective_db_url(self) -> str:
        """Prefer explicit DATABASE_URL, fall back to SUPABASE_DB_URL."""
        return self.database_url or self.supabase_db_url

    @property
    def do_configured(self) -> bool:
        return bool(self.do_api_key)

    @property
    def llm_base_url(self) -> str:
        """Resolve the LLM endpoint to use at runtime."""
        if self.do_api_key and self.do_agent_id:
            return f"https://{self.do_agent_id}.agents.digitalocean.com/api/v1"
        if self.do_api_key:
            return self.do_genai_endpoint
        return "https://api.openai.com/v1"

    @property
    def llm_api_key(self) -> str:
        return self.do_api_key or self.openai_api_key


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached Settings singleton. Tests override by clearing the cache."""
    return Settings()
