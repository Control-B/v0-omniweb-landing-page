"""
app/main.py
───────────
FastAPI application factory and lifespan.

Startup order:
  1. Load settings (already cached by get_settings())
  2. Initialise database engine (asyncpg → Supabase Postgres)
  3. Mount all routers
  4. Apply CORS

Teardown:
  1. Dispose DB connection pool
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import close_db, init_db
from app.middleware import TenantMiddleware, RequireTenantMiddleware, TenantIsolationMiddleware
from app.services.tenant import TenantService

# ── Routers ───────────────────────────────────────────────────────────────────
# Imported here so they register against the app instance created below.
# Add new routers as the platform grows.
from app.routers import (
    analytics,
    conversations,
    health,
    leads,
    tenants,
    voice,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    logger.info("Starting %s v%s", settings.app_name, settings.app_version)

    # ── Startup ──────────────────────────────────────────────────────────
    init_db()

    yield

    # ── Shutdown ─────────────────────────────────────────────────────────
    await close_db()
    logger.info("Shutdown complete")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Multi-tenant AI assistant platform — "
            "voice, text, telephony, lead qualification, and analytics."
        ),
        lifespan=lifespan,
        # Disable docs in production unless explicitly enabled
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # ── CORS ─────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin, "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Multi-tenant middleware ───────────────────────────────────────────
    # Order matters: TenantMiddleware first to resolve tenant context,
    # then RequireTenantMiddleware to enforce tenant requirements,
    # then TenantIsolationMiddleware for data isolation
    tenant_service = TenantService()
    app.add_middleware(TenantIsolationMiddleware)
    app.add_middleware(RequireTenantMiddleware)
    app.add_middleware(TenantMiddleware, tenant_service=tenant_service)

    # ── Routers ───────────────────────────────────────────────────────────
    # Note: tenant router already includes its prefix in the router definition
    app.include_router(health.router)
    app.include_router(tenants.router)
    app.include_router(conversations.router)
    app.include_router(leads.router)
    app.include_router(voice.router)
    app.include_router(analytics.router)

    # ── Legacy compatibility routes ───────────────────────────────────────
    # The existing Node backend calls /assistant/respond and /assistant/automate.
    # Keep them alive while we migrate.
    from app.routers import legacy  # noqa: PLC0415
    app.include_router(legacy.router, tags=["Legacy"])

    return app


# Module-level app instance (used by uvicorn and start.py)
app = create_app()
