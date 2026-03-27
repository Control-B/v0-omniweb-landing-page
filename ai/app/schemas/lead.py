"""
app/schemas/lead.py
───────────────────
Pydantic schemas for lead management API endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, EmailStr

from ..models.lead import LeadStatus, LeadPriority, LeadSource


class LeadBase(BaseModel):
    """Base lead schema."""
    name: str | None = Field(None, max_length=255, description="Contact name")
    email: EmailStr | None = Field(None, description="Contact email")
    phone: str | None = Field(None, max_length=50, description="Contact phone")
    company: str | None = Field(None, max_length=255, description="Company name")


class LeadCreate(LeadBase):
    """Schema for creating a new lead."""
    source: LeadSource
    intent: str | None = Field(None, max_length=255, description="Customer intent")
    service_interest: str | None = Field(None, max_length=255, description="Service of interest")
    budget_range: str | None = Field(None, max_length=100, description="Budget range")
    timeline: str | None = Field(None, max_length=100, description="Project timeline")
    lead_score: int = Field(default=0, ge=0, le=100, description="Lead score (0-100)")
    qualification_data: dict[str, Any] | None = Field(None, description="Qualification data")
    extracted_answers: dict[str, Any] | None = Field(None, description="Extracted answers")
    summary: str | None = Field(None, description="Lead summary")
    ai_insights: str | None = Field(None, description="AI-generated insights")
    tags: list[str] | None = Field(None, description="Lead tags")
    location: str | None = Field(None, max_length=500, description="Customer location")
    service_area: str | None = Field(None, max_length=255, description="Service area")
    conversation_id: uuid.UUID = Field(..., description="Associated conversation ID")


class LeadUpdate(BaseModel):
    """Schema for updating a lead."""
    name: str | None = Field(None, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=50)
    company: str | None = Field(None, max_length=255)
    status: LeadStatus | None = None
    priority: LeadPriority | None = None
    intent: str | None = Field(None, max_length=255)
    service_interest: str | None = Field(None, max_length=255)
    budget_range: str | None = Field(None, max_length=100)
    timeline: str | None = Field(None, max_length=100)
    lead_score: int | None = Field(None, ge=0, le=100)
    qualification_data: dict[str, Any] | None = None
    summary: str | None = None
    ai_insights: str | None = None
    tags: list[str] | None = None
    follow_up_required: bool | None = None
    follow_up_date: datetime | None = None
    owner_notes: str | None = None
    assigned_to: str | None = Field(None, max_length=255)
    location: str | None = Field(None, max_length=500)
    service_area: str | None = Field(None, max_length=255)


class LeadResponse(LeadBase):
    """Schema for lead API responses."""
    id: uuid.UUID
    tenant_id: uuid.UUID
    conversation_id: uuid.UUID
    status: LeadStatus
    priority: LeadPriority
    source: LeadSource
    intent: str | None
    service_interest: str | None
    budget_range: str | None
    timeline: str | None
    lead_score: int
    qualification_score: float | None
    readiness_score: float | None
    qualification_data: dict[str, Any] | None
    extracted_answers: dict[str, Any] | None
    summary: str | None
    ai_insights: str | None
    tags: list[str] | None
    follow_up_required: bool
    follow_up_date: datetime | None
    contacted_at: datetime | None
    owner_notes: str | None
    assigned_to: str | None
    location: str | None
    service_area: str | None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QualificationFlowBase(BaseModel):
    """Base qualification flow schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None


class QualificationFlowCreate(QualificationFlowBase):
    """Schema for creating a qualification flow."""
    questions_config: dict[str, Any] = Field(..., description="Questions configuration")
    scoring_rules: dict[str, Any] = Field(..., description="Scoring rules")
    routing_rules: dict[str, Any] = Field(..., description="Routing rules")
    vertical_type: str | None = Field(None, max_length=100)
    service_types: list[str] | None = None
    is_active: bool = True


class QualificationFlowResponse(QualificationFlowBase):
    """Schema for qualification flow API responses."""
    id: uuid.UUID
    tenant_id: uuid.UUID
    questions_config: dict[str, Any]
    scoring_rules: dict[str, Any]
    routing_rules: dict[str, Any]
    vertical_type: str | None
    service_types: list[str] | None
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True