"""
app/routers/health.py
─────────────────────
Liveness and readiness probes.
Docker / DO App Platform healthcheck hits GET /health.
"""

from __future__ import annotations

import os

from fastapi import APIRouter

from app.config import get_settings
from app.database import is_db_available

router = APIRouter()


@router.get("/health", summary="Liveness probe")
async def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "version": settings.app_version,
        "services": {
            "database": {
                "configured": settings.db_configured,
                "connected": is_db_available(),
            },
            "supabase": {
                "configured": settings.supabase_configured,
                "urlConfigured": bool(settings.supabase_url),
                "anonKeyConfigured": bool(settings.supabase_anon_key),
                "serviceRoleConfigured": bool(settings.supabase_service_role_key),
            },
            "llm": {
                "provider": "digitalocean" if settings.do_configured else "openai",
                "configured": bool(settings.llm_api_key),
                "endpoint": settings.llm_base_url,
            },
            "deepgram": {
                "configured": bool(settings.deepgram_api_key),
            },
            "livekit": {
                "configured": bool(settings.livekit_api_key and settings.livekit_api_secret),
            },
        },
    }
