"""
app/models/tenant.py
───────────────────
Tenant model for multi-tenant SaaS architecture.
Each tenant represents a business client using the AI assistant platform.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import String, Enum as SQLEnum, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import TimestampedModel

if TYPE_CHECKING:
    from .business import BusinessProfile
    from .conversation import ConversationSession
    from .lead import Lead


class TenantStatus(str, Enum):
    """Tenant account status."""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    CANCELLED = "cancelled"


class Tenant(TimestampedModel):
    """
    Tenant represents a business client using the AI platform.
    
    Each tenant gets isolated data and can have multiple channels
    (website text chat, voice assistant, telephony).
    """
    
    __tablename__ = "tenants"
    
    # Basic tenant info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Account status and billing
    status: Mapped[TenantStatus] = mapped_column(
        SQLEnum(TenantStatus), 
        nullable=False, 
        default=TenantStatus.TRIAL
    )
    
    # Contact information
    contact_email: Mapped[str] = mapped_column(String(320), nullable=False)
    contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Trial and billing
    trial_ends_at: Mapped[datetime | None] = mapped_column(nullable=True)
    billing_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    
    # Feature flags
    voice_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    telephony_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    analytics_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # API configuration
    webhook_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    webhook_secret: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    # Internal notes
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Relationships
    business_profile: Mapped[BusinessProfile] = relationship(
        "BusinessProfile", 
        back_populates="tenant", 
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    conversations: Mapped[list[ConversationSession]] = relationship(
        "ConversationSession",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )
    
    leads: Mapped[list[Lead]] = relationship(
        "Lead",
        back_populates="tenant", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Tenant(id={self.id}, slug='{self.slug}', name='{self.name}')>"
        
    @property
    def is_active(self) -> bool:
        """Check if tenant is in active status."""
        return self.status == TenantStatus.ACTIVE
        
    @property
    def is_trial(self) -> bool:
        """Check if tenant is in trial status."""
        return self.status == TenantStatus.TRIAL
        
    @property
    def trial_expired(self) -> bool:
        """Check if trial period has expired."""
        if not self.trial_ends_at:
            return False
        return datetime.utcnow() > self.trial_ends_at