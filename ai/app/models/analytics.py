"""
app/models/analytics.py
───────────────────────
Analytics and event tracking models for business intelligence.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import String, Enum as SQLEnum, JSON, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import TenantScopedModel

if TYPE_CHECKING:
    from .tenant import Tenant
    from .conversation import ConversationSession


class EventType(str, Enum):
    """Types of analytics events to track."""
    CONVERSATION_STARTED = "conversation_started"
    CONVERSATION_ENDED = "conversation_ended"
    LEAD_GENERATED = "lead_generated"
    LEAD_QUALIFIED = "lead_qualified"
    INTENT_DETECTED = "intent_detected"
    ESCALATION_TRIGGERED = "escalation_triggered"
    ERROR_OCCURRED = "error_occurred"
    VOICE_SESSION_STARTED = "voice_session_started"
    TELEPHONY_CALL_RECEIVED = "telephony_call_received"
    WEBHOOK_SENT = "webhook_sent"
    USER_FEEDBACK = "user_feedback"


class AnalyticsEvent(TenantScopedModel):
    """
    Analytics events for tracking business performance and AI effectiveness.
    """
    
    __tablename__ = "analytics_events"
    
    # Event identification
    event_type: Mapped[EventType] = mapped_column(SQLEnum(EventType), nullable=False)
    event_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Event data
    event_data: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Context
    session_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    user_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    channel: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Metrics
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    value: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Geographic and technical context
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    referrer: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Business context
    page_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    utm_source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Relationships
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    
    conversation_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("conversation_sessions.id", ondelete="CASCADE"),
        nullable=True
    )
    
    tenant: Mapped[Tenant] = relationship("Tenant")
    conversation: Mapped[ConversationSession | None] = relationship("ConversationSession")
    
    def __repr__(self) -> str:
        return f"<AnalyticsEvent(id={self.id}, type='{self.event_type}', tenant_id={self.tenant_id})>"