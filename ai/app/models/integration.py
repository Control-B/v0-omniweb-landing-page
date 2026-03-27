"""
app/models/integration.py
────────────────────────
Integration models for external services (Deepgram, LiveKit, etc.).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import String, Enum as SQLEnum, JSON, ForeignKey, Integer, Boolean, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import TenantScopedModel

if TYPE_CHECKING:
    from .tenant import Tenant
    from .conversation import ConversationSession


class ChannelType(str, Enum):
    """Communication channel types."""
    WEB_TEXT = "web_text"
    WEB_VOICE = "web_voice" 
    TELEPHONY = "telephony"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    EMAIL = "email"


class IntegrationStatus(str, Enum):
    """Integration configuration status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    CONFIGURING = "configuring"
    ERROR = "error"


class ChannelConfig(TenantScopedModel):
    """
    Channel-specific configuration for each tenant.
    """
    
    __tablename__ = "channel_configs"
    
    channel_type: Mapped[ChannelType] = mapped_column(SQLEnum(ChannelType), nullable=False)
    
    # Configuration
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[IntegrationStatus] = mapped_column(
        SQLEnum(IntegrationStatus),
        nullable=False,
        default=IntegrationStatus.ACTIVE
    )
    
    # Channel-specific settings
    config_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    # API credentials (encrypted)
    api_credentials: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Rate limiting
    rate_limit_per_hour: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rate_limit_per_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Usage tracking
    usage_count_today: Mapped[int] = mapped_column(Integer, default=0)
    usage_count_month: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    # Error tracking
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    last_error_at: Mapped[datetime | None] = mapped_column(nullable=True)
    last_error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Relationships
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    
    tenant: Mapped[Tenant] = relationship("Tenant")


class VoiceSession(TenantScopedModel):
    """
    Voice session tracking for Deepgram integration.
    """
    
    __tablename__ = "voice_sessions"
    
    # Session identification
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    deepgram_session_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Session status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Audio configuration
    sample_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    encoding: Mapped[str | None] = mapped_column(String(50), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en")
    
    # Session metrics
    audio_duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    transcript_word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    average_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Processing results
    final_transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_language: Mapped[str | None] = mapped_column(String(10), nullable=True)
    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Technical metrics
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    processing_errors: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    started_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    # Relationships
    conversation_id: Mapped[UUID] = mapped_column(
        ForeignKey("conversation_sessions.id", ondelete="CASCADE"),
        nullable=False
    )
    
    conversation: Mapped[ConversationSession] = relationship("ConversationSession")


class TelephonySession(TenantScopedModel):
    """
    Telephony session tracking for LiveKit integration.
    """
    
    __tablename__ = "telephony_sessions"
    
    # Session identification
    call_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    livekit_room_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Call details
    caller_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    called_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    call_direction: Mapped[str] = mapped_column(String(20), nullable=False)  # inbound/outbound
    
    # Call status
    call_status: Mapped[str] = mapped_column(String(50), nullable=False)  # ringing, active, ended
    end_reason: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Call metrics
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    audio_quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Geographic context
    caller_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    carrier_info: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Recording and transcription
    recording_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    transcript_available: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    call_started_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    call_ended_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    # Relationships
    conversation_id: Mapped[UUID] = mapped_column(
        ForeignKey("conversation_sessions.id", ondelete="CASCADE"),
        nullable=False
    )
    
    conversation: Mapped[ConversationSession] = relationship("ConversationSession")