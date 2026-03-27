"""
app/models/business.py
─────────────────────
Business profile and configuration models for vertical-specific AI assistants.
"""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import String, Enum as SQLEnum, Text, JSON, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import TimestampedModel, TenantScopedModel

if TYPE_CHECKING:
    from .tenant import Tenant


class VerticalType(str, Enum):
    """Supported business verticals."""
    ECOMMERCE = "ecommerce"
    CONTRACTOR = "contractor" 
    PROFESSIONAL_SERVICES = "professional_services"
    HEALTHCARE = "healthcare"
    RESTAURANT = "restaurant"
    REAL_ESTATE = "real_estate"
    AUTOMOTIVE = "automotive"
    CUSTOM = "custom"


class BusinessProfile(TenantScopedModel):
    """
    Business profile containing industry-specific information and configuration.
    """
    
    __tablename__ = "business_profiles"
    
    # Basic business info
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    vertical: Mapped[VerticalType] = mapped_column(
        SQLEnum(VerticalType), 
        nullable=False
    )
    
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Contact details
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Business hours (JSON format: {"monday": {"open": "09:00", "close": "17:00"}, ...})
    business_hours: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Service areas or coverage (for contractors, delivery, etc.)
    service_areas: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # Products/services catalog (flexible JSON structure)
    offerings: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # FAQ and knowledge base
    faqs: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    knowledge_base_urls: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    tenant_id: Mapped[UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False
    )
    
    tenant: Mapped[Tenant] = relationship(
        "Tenant", 
        back_populates="business_profile"
    )
    
    assistant_config: Mapped[AssistantConfig] = relationship(
        "AssistantConfig",
        back_populates="business_profile",
        uselist=False,
        cascade="all, delete-orphan"
    )


class VerticalTemplate(TimestampedModel):
    """
    Templates for different business verticals with pre-configured workflows.
    """
    
    __tablename__ = "vertical_templates"
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    vertical: Mapped[VerticalType] = mapped_column(
        SQLEnum(VerticalType),
        nullable=False
    )
    
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Template configuration
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    conversation_goals: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    qualification_questions: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    # Conversation flow configuration
    intent_patterns: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    response_templates: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    escalation_rules: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    # Default settings
    default_tone: Mapped[str] = mapped_column(String(50), default="professional")
    default_voice_enabled: Mapped[bool] = mapped_column(default=True)
    
    is_active: Mapped[bool] = mapped_column(default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)


class AssistantConfig(TenantScopedModel):
    """
    AI assistant configuration for each tenant.
    """
    
    __tablename__ = "assistant_configs"
    
    # Assistant identity
    assistant_name: Mapped[str] = mapped_column(String(100), default="Assistant")
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Personality and tone
    tone: Mapped[str] = mapped_column(String(50), default="professional")
    personality_traits: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    
    # System prompts and instructions
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    greeting_message: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Conversation goals and objectives
    primary_goals: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    conversation_objectives: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    # Lead capture configuration
    lead_capture_enabled: Mapped[bool] = mapped_column(default=True)
    required_lead_fields: Mapped[list[str]] = mapped_column(JSON, default=["name", "email"])
    optional_lead_fields: Mapped[list[str]] = mapped_column(JSON, default=["phone"])
    
    # Voice settings
    voice_enabled: Mapped[bool] = mapped_column(default=True)
    voice_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    voice_speed: Mapped[float] = mapped_column(default=1.0)
    
    # Escalation settings
    escalation_enabled: Mapped[bool] = mapped_column(default=True)
    escalation_triggers: Mapped[list[str]] = mapped_column(JSON, default=["human_request", "complex_issue"])
    escalation_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Integration settings
    webhook_events: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    max_conversation_length: Mapped[int] = mapped_column(Integer, default=50)
    
    # Template reference (optional)
    template_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("vertical_templates.id"),
        nullable=True
    )
    
    # Relationships
    business_profile_id: Mapped[UUID] = mapped_column(
        ForeignKey("business_profiles.id", ondelete="CASCADE"),
        nullable=False
    )
    
    business_profile: Mapped[BusinessProfile] = relationship(
        "BusinessProfile",
        back_populates="assistant_config"
    )
    
    template: Mapped[VerticalTemplate | None] = relationship("VerticalTemplate")