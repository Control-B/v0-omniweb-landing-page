"""
app/schemas/tenant.py
────────────────────
Pydantic schemas for tenant management API endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, EmailStr, HttpUrl

from ..models.tenant import TenantStatus
from ..models.business import VerticalType


class TenantBase(BaseModel):
    """Base tenant schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255, description="Business name")
    slug: str = Field(..., min_length=1, max_length=100, description="URL-friendly identifier")
    domain: str | None = Field(None, max_length=255, description="Business website domain")
    contact_email: EmailStr = Field(..., description="Primary contact email")
    contact_name: str | None = Field(None, max_length=255, description="Primary contact name")


class TenantCreate(TenantBase):
    """Schema for creating a new tenant."""
    billing_email: EmailStr | None = None
    voice_enabled: bool = True
    telephony_enabled: bool = False
    webhook_url: HttpUrl | None = None
    notes: str | None = Field(None, description="Internal notes about the tenant")


class TenantUpdate(BaseModel):
    """Schema for updating an existing tenant."""
    name: str | None = Field(None, min_length=1, max_length=255)
    domain: str | None = Field(None, max_length=255)
    contact_email: EmailStr | None = None
    contact_name: str | None = Field(None, max_length=255)
    status: TenantStatus | None = None
    billing_email: EmailStr | None = None
    voice_enabled: bool | None = None
    telephony_enabled: bool | None = None
    webhook_url: HttpUrl | None = None
    webhook_secret: str | None = None
    notes: str | None = None


class TenantResponse(TenantBase):
    """Schema for tenant API responses."""
    id: uuid.UUID
    status: TenantStatus
    trial_ends_at: datetime | None
    voice_enabled: bool
    telephony_enabled: bool
    analytics_enabled: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BusinessProfileBase(BaseModel):
    """Base business profile schema."""
    business_name: str = Field(..., min_length=1, max_length=255)
    vertical: VerticalType
    description: str | None = Field(None, description="Business description")
    website_url: HttpUrl | None = None
    phone: str | None = Field(None, max_length=50)
    email: EmailStr | None = None
    address: str | None = None


class BusinessProfileCreate(BusinessProfileBase):
    """Schema for creating a business profile."""
    business_hours: dict[str, Any] | None = Field(
        None,
        description="Business hours in JSON format",
        example={
            "monday": {"open": "09:00", "close": "17:00"},
            "tuesday": {"open": "09:00", "close": "17:00"}
        }
    )
    service_areas: list[str] | None = Field(None, description="Service coverage areas")
    offerings: dict[str, Any] | None = Field(None, description="Products/services catalog")
    faqs: dict[str, Any] | None = Field(None, description="Frequently asked questions")
    knowledge_base_urls: list[str] | None = Field(None, description="Knowledge base URLs")


class BusinessProfileUpdate(BaseModel):
    """Schema for updating a business profile."""
    business_name: str | None = Field(None, min_length=1, max_length=255)
    vertical: VerticalType | None = None
    description: str | None = None
    website_url: HttpUrl | None = None
    phone: str | None = Field(None, max_length=50)
    email: EmailStr | None = None
    address: str | None = None
    business_hours: dict[str, Any] | None = None
    service_areas: list[str] | None = None
    offerings: dict[str, Any] | None = None
    faqs: dict[str, Any] | None = None
    knowledge_base_urls: list[str] | None = None


class BusinessProfileResponse(BusinessProfileBase):
    """Schema for business profile API responses."""
    id: uuid.UUID
    tenant_id: uuid.UUID
    business_hours: dict[str, Any] | None
    service_areas: list[str] | None
    offerings: dict[str, Any] | None
    faqs: dict[str, Any] | None
    knowledge_base_urls: list[str] | None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AssistantConfigBase(BaseModel):
    """Base assistant configuration schema."""
    assistant_name: str = Field(default="Assistant", max_length=100)
    company_name: str = Field(..., max_length=255)
    tone: str = Field(default="professional", max_length=50)
    system_prompt: str = Field(..., description="AI system prompt")
    greeting_message: str = Field(..., description="Initial greeting message")


class AssistantConfigCreate(AssistantConfigBase):
    """Schema for creating assistant configuration."""
    personality_traits: list[str] | None = Field(None, description="AI personality traits")
    primary_goals: list[str] = Field(..., description="Primary conversation goals")
    conversation_objectives: dict[str, Any] = Field(..., description="Detailed objectives")
    lead_capture_enabled: bool = True
    required_lead_fields: list[str] = Field(default=["name", "email"])
    optional_lead_fields: list[str] = Field(default=["phone"])
    voice_enabled: bool = True
    voice_model: str | None = Field(None, max_length=100)
    voice_speed: float = Field(default=1.0, ge=0.5, le=2.0)
    escalation_enabled: bool = True
    escalation_triggers: list[str] = Field(default=["human_request", "complex_issue"])
    escalation_message: str | None = None
    webhook_events: list[str] | None = None
    max_conversation_length: int = Field(default=50, ge=1, le=200)


class AssistantConfigUpdate(BaseModel):
    """Schema for updating assistant configuration."""
    assistant_name: str | None = Field(None, max_length=100)
    company_name: str | None = Field(None, max_length=255)
    tone: str | None = Field(None, max_length=50)
    system_prompt: str | None = None
    greeting_message: str | None = None
    personality_traits: list[str] | None = None
    primary_goals: list[str] | None = None
    conversation_objectives: dict[str, Any] | None = None
    lead_capture_enabled: bool | None = None
    required_lead_fields: list[str] | None = None
    optional_lead_fields: list[str] | None = None
    voice_enabled: bool | None = None
    voice_model: str | None = None
    voice_speed: float | None = Field(None, ge=0.5, le=2.0)
    escalation_enabled: bool | None = None
    escalation_triggers: list[str] | None = None
    escalation_message: str | None = None
    webhook_events: list[str] | None = None
    max_conversation_length: int | None = Field(None, ge=1, le=200)


class AssistantConfigResponse(AssistantConfigBase):
    """Schema for assistant configuration API responses."""
    id: uuid.UUID
    tenant_id: uuid.UUID
    business_profile_id: uuid.UUID
    personality_traits: list[str] | None
    primary_goals: list[str]
    conversation_objectives: dict[str, Any]
    lead_capture_enabled: bool
    required_lead_fields: list[str]
    optional_lead_fields: list[str]
    voice_enabled: bool
    voice_model: str | None
    voice_speed: float
    escalation_enabled: bool
    escalation_triggers: list[str]
    escalation_message: str | None
    webhook_events: list[str] | None
    max_conversation_length: int
    template_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True