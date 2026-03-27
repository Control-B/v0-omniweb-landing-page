"""
app/database.py
───────────────
Async SQLAlchemy engine + session factory wired to Supabase Postgres.

When DATABASE_URL / SUPABASE_DB_URL is not set (local dev without a DB),
the engine is None and all DB-dependent routes will gracefully return 503.

Pattern used throughout the app:
    async with get_db_session() as session:
        result = await session.execute(...)
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

logger = logging.getLogger(__name__)

# ── Import all models to ensure they're registered with SQLAlchemy ───────────
# Import all model classes so they're registered with the Base metadata
from app.models.tenant import Tenant
from app.models.business import BusinessProfile, VerticalTemplate, AssistantConfig
from app.models.conversation import ConversationSession, Message
from app.models.lead import Lead, QualificationFlow, QualificationQuestion, QualificationResponse
from app.models.analytics import AnalyticsEvent
from app.models.integration import ChannelConfig, VoiceSession, TelephonySession
from app.models.base import Base

# Make sure all models are imported for Alembic auto-generation
__all__ = [
    "Tenant",
    "BusinessProfile", 
    "VerticalTemplate",
    "AssistantConfig",
    "ConversationSession",
    "Message",
    "Lead",
    "QualificationFlow", 
    "QualificationQuestion",
    "QualificationResponse",
    "AnalyticsEvent",
    "ChannelConfig",
    "VoiceSession", 
    "TelephonySession",
    "Base",
]


# ── Module-level singletons (initialised in lifespan) ────────────────────────
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def init_db() -> None:
    """
    Called once during FastAPI lifespan startup.
    Creates the async engine from the Supabase Postgres URL.
    Uses asyncpg driver (postgresql+asyncpg://...).
    """
    global _engine, _session_factory

    settings = get_settings()
    raw_url = settings.effective_db_url

    if not raw_url:
        logger.warning(
            "No DATABASE_URL or SUPABASE_DB_URL configured — "
            "database features will be unavailable."
        )
        return

    # Supabase gives postgresql:// — we need postgresql+asyncpg://
    async_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1).replace(
        "postgres://", "postgresql+asyncpg://", 1
    )

    _engine = create_async_engine(
        async_url,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        echo=settings.debug,
    )

    _session_factory = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    logger.info("Database engine initialised (asyncpg)")


async def close_db() -> None:
    """Called during FastAPI lifespan shutdown."""
    global _engine
    if _engine:
        await _engine.dispose()
        logger.info("Database engine disposed")


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async context manager yielding a transactional DB session.
    Rolls back on exception, commits on clean exit.
    """
    if _session_factory is None:
        raise RuntimeError("Database not initialised — check DATABASE_URL env var.")
    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def is_db_available() -> bool:
    return _engine is not None
