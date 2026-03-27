"""
app/models/conversation.py
─────────────────────────
Conversation and message models for multi-channel communication.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import String, Enum as SQLEnum, Text, JSON, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import TenantScopedModel

if TYPE_CHECKING:
    from .tenant import Tenant
    from .lead import Lead


class ConversationStatus(str, Enum):
    """Conversation lifecycle status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    ESCALATED = "escalated"
    ERROR = "error"


class ChannelType(str, Enum):
    """Communication channel types."""
    WEB_TEXT = "web_text"
    WEB_VOICE = "web_voice" 
    TELEPHONY = "telephony"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    EMAIL = "email"


class MessageType(str, Enum):
    """Message types within conversations."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    ACTION = "action"
    VOICE_TRANSCRIPT = "voice_transcript"


class ConversationOutcome(str, Enum):
    """Structured conversation outcomes for analytics."""
    ANSWERED_QUESTION = "answered_question"
    QUALIFIED_LEAD = "qualified_lead"
    BOOKED_REQUEST = "booked_request"
    CALLBACK_REQUESTED = "callback_requested"
    PRODUCT_RECOMMENDATION = "product_recommendation"
    ESCALATION_TO_HUMAN = "escalation_to_human"
    SUPPORT_CASE_STARTED = "support_case_started"
    NO_FIT = "no_fit"
    ABANDONED_SESSION = "abandoned_session"


class ConversationSession(TenantScopedModel):
    """
    Conversation session across any channel (text, voice, telephony).
    Each session represents one complete interaction with a visitor/customer.
    """
    
    __tablename__ = "conversation_sessions"
    
    # Session identification
    session_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    channel: Mapped[ChannelType] = mapped_column(SQLEnum(ChannelType), nullable=False)
    
    # Session status and lifecycle
    status: Mapped[ConversationStatus] = mapped_column(
        SQLEnum(ConversationStatus),
        nullable=False,
        default=ConversationStatus.ACTIVE
    )
    
    outcome: Mapped[ConversationOutcome | None] = mapped_column(
        SQLEnum(ConversationOutcome),
        nullable=True
    )
    
    # Visitor information
    visitor_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    visitor_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv6 compatible
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Context information
    current_page: Mapped[str | None] = mapped_column(String(500), nullable=True)
    entry_point: Mapped[str | None] = mapped_column(String(500), nullable=True)
    utm_source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Session metrics
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # AI processing metadata
    intent_classification: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    sentiment_score: Mapped[float | None] = mapped_column(nullable=True)
    language_detected: Mapped[str | None] = mapped_column(String(10), nullable=True)
    
    # Business context
    qualified_lead: Mapped[bool] = mapped_column(Boolean, default=False)
    lead_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    priority_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # Session summary
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_topics: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    action_items: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    started_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(nullable=True)
    last_activity_at: Mapped[datetime] = mapped_column(nullable=False, default=datetime.utcnow)
    
    # Relationships
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    
    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="conversations")
    
    messages: Mapped[list[Message]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )
    
    lead: Mapped[Lead | None] = relationship(
        "Lead",
        back_populates="conversation",
        uselist=False
    )
    
    def __repr__(self) -> str:
        return f"<ConversationSession(id={self.id}, session_id='{self.session_id}', channel='{self.channel}')>"
        
    @property
    def is_active(self) -> bool:
        """Check if conversation is still active."""
        return self.status == ConversationStatus.ACTIVE


class Message(TenantScopedModel):
    """
    Individual message within a conversation session.
    """
    
    __tablename__ = "messages"
    
    # Message content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[MessageType] = mapped_column(SQLEnum(MessageType), nullable=False)
    
    # Message metadata
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=False)
    token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Processing metadata
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Voice-specific fields
    audio_duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    transcript_confidence: Mapped[float | None] = mapped_column(nullable=True)
    
    # Action/response metadata
    actions_triggered: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, nullable=True)
    intent_detected: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entities_extracted: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Error handling
    error_occurred: Mapped[bool] = mapped_column(Boolean, default=False)
    error_details: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    conversation_id: Mapped[UUID] = mapped_column(
        ForeignKey("conversation_sessions.id", ondelete="CASCADE"),
        nullable=False
    )
    
    conversation: Mapped[ConversationSession] = relationship(
        "ConversationSession",
        back_populates="messages"
    )
    
    def __repr__(self) -> str:
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"<Message(id={self.id}, type='{self.message_type}', content='{content_preview}')>"