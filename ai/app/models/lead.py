"""
app/models/lead.py
─────────────────
Lead management models for qualification, scoring, and follow-up.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import String, Enum as SQLEnum, Text, JSON, ForeignKey, Integer, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import TenantScopedModel

if TYPE_CHECKING:
    from .tenant import Tenant
    from .conversation import ConversationSession


class LeadStatus(str, Enum):
    """Lead lifecycle status."""
    NEW = "new"
    QUALIFIED = "qualified"
    CONTACTED = "contacted"
    NURTURING = "nurturing"
    CONVERTED = "converted"
    LOST = "lost"
    SPAM = "spam"


class LeadPriority(str, Enum):
    """Lead priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class LeadSource(str, Enum):
    """Lead generation sources."""
    WEB_CHAT = "web_chat"
    WEB_VOICE = "web_voice"
    TELEPHONY = "telephony"
    FORM = "form"
    EMAIL = "email"
    REFERRAL = "referral"


class Lead(TenantScopedModel):
    """
    Qualified lead generated from conversations.
    Contains structured information ready for business owner follow-up.
    """
    
    __tablename__ = "leads"
    
    # Contact information
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Lead metadata
    status: Mapped[LeadStatus] = mapped_column(
        SQLEnum(LeadStatus),
        nullable=False,
        default=LeadStatus.NEW
    )
    
    priority: Mapped[LeadPriority] = mapped_column(
        SQLEnum(LeadPriority),
        nullable=False,
        default=LeadPriority.MEDIUM
    )
    
    source: Mapped[LeadSource] = mapped_column(SQLEnum(LeadSource), nullable=False)
    
    # Business context
    intent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    service_interest: Mapped[str | None] = mapped_column(String(255), nullable=True)
    budget_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timeline: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Scoring and qualification
    lead_score: Mapped[int] = mapped_column(Integer, default=0)
    qualification_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    readiness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Structured data from qualification
    qualification_data: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    extracted_answers: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Summary and notes
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_insights: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # Follow-up tracking
    follow_up_required: Mapped[bool] = mapped_column(Boolean, default=True)
    follow_up_date: Mapped[datetime | None] = mapped_column(nullable=True)
    contacted_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    # Business owner notes
    owner_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Location data (for local businesses)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    service_area: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Relationships
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    
    conversation_id: Mapped[UUID] = mapped_column(
        ForeignKey("conversation_sessions.id", ondelete="CASCADE"),
        nullable=False
    )
    
    tenant: Mapped[Tenant] = relationship("Tenant", back_populates="leads")
    
    conversation: Mapped[ConversationSession] = relationship(
        "ConversationSession",
        back_populates="lead"
    )
    
    qualification_responses: Mapped[list[QualificationResponse]] = relationship(
        "QualificationResponse",
        back_populates="lead",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        name_display = self.name or self.email or "Unknown"
        return f"<Lead(id={self.id}, name='{name_display}', status='{self.status}')>"
        
    @property
    def has_contact_info(self) -> bool:
        """Check if lead has any contact information."""
        return bool(self.email or self.phone)
        
    @property
    def is_hot_lead(self) -> bool:
        """Determine if this is a high-priority lead."""
        return (
            self.priority in [LeadPriority.HIGH, LeadPriority.URGENT] or
            self.lead_score >= 80
        )


class QualificationFlow(TenantScopedModel):
    """
    Configurable qualification flow for different business types.
    """
    
    __tablename__ = "qualification_flows"
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Flow configuration
    questions_config: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    scoring_rules: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    routing_rules: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    # Business context
    vertical_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    service_types: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # Settings
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    
    questions: Mapped[list[QualificationQuestion]] = relationship(
        "QualificationQuestion",
        back_populates="flow",
        cascade="all, delete-orphan",
        order_by="QualificationQuestion.sequence_order"
    )


class QualificationQuestion(TenantScopedModel):
    """
    Individual qualification questions within a flow.
    """
    
    __tablename__ = "qualification_questions"
    
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)  # text, choice, rating, etc.
    
    # Question configuration
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Conditional logic
    show_conditions: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    skip_conditions: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Response options (for choice questions)
    options: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, nullable=True)
    
    # Scoring configuration
    scoring_weight: Mapped[float] = mapped_column(Float, default=1.0)
    scoring_rules: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    flow_id: Mapped[UUID] = mapped_column(
        ForeignKey("qualification_flows.id", ondelete="CASCADE"),
        nullable=False
    )
    
    flow: Mapped[QualificationFlow] = relationship(
        "QualificationFlow",
        back_populates="questions"
    )
    
    responses: Mapped[list[QualificationResponse]] = relationship(
        "QualificationResponse",
        back_populates="question",
        cascade="all, delete-orphan"
    )


class QualificationResponse(TenantScopedModel):
    """
    Customer responses to qualification questions.
    """
    
    __tablename__ = "qualification_responses"
    
    response_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_data: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Response metadata
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    extracted_from_text: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Scoring
    points_awarded: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Relationships
    lead_id: Mapped[UUID] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False
    )
    
    question_id: Mapped[UUID] = mapped_column(
        ForeignKey("qualification_questions.id", ondelete="CASCADE"),
        nullable=False
    )
    
    lead: Mapped[Lead] = relationship("Lead", back_populates="qualification_responses")
    question: Mapped[QualificationQuestion] = relationship("QualificationQuestion", back_populates="responses")