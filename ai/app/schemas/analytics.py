"""
app/schemas/analytics.py
────────────────────────
Pydantic schemas for analytics and reporting API endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime, date
from typing import Any

from pydantic import BaseModel, Field

from ..models.analytics import EventType


class AnalyticsEventBase(BaseModel):
    """Base analytics event schema."""
    event_type: EventType
    event_name: str | None = Field(None, max_length=255)


class AnalyticsEventCreate(AnalyticsEventBase):
    """Schema for creating an analytics event."""
    event_data: dict[str, Any] | None = None
    session_id: str | None = Field(None, max_length=100)
    user_id: str | None = Field(None, max_length=255)
    channel: str | None = Field(None, max_length=50)
    duration_ms: int | None = Field(None, ge=0)
    value: float | None = None
    ip_address: str | None = Field(None, max_length=45)
    user_agent: str | None = Field(None, max_length=500)
    referrer: str | None = Field(None, max_length=500)
    page_path: str | None = Field(None, max_length=500)
    utm_source: str | None = Field(None, max_length=100)
    utm_campaign: str | None = Field(None, max_length=100)
    utm_medium: str | None = Field(None, max_length=100)
    conversation_id: uuid.UUID | None = None


class AnalyticsEventResponse(AnalyticsEventBase):
    """Schema for analytics event API responses."""
    id: uuid.UUID
    tenant_id: uuid.UUID
    event_data: dict[str, Any] | None
    session_id: str | None
    user_id: str | None
    channel: str | None
    duration_ms: int | None
    value: float | None
    ip_address: str | None
    user_agent: str | None
    referrer: str | None
    page_path: str | None
    utm_source: str | None
    utm_campaign: str | None
    utm_medium: str | None
    conversation_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnalyticsQuery(BaseModel):
    """Schema for analytics queries."""
    start_date: date = Field(..., description="Query start date")
    end_date: date = Field(..., description="Query end date")
    event_types: list[EventType] | None = Field(None, description="Filter by event types")
    channels: list[str] | None = Field(None, description="Filter by channels")
    group_by: str | None = Field(None, description="Group results by field")
    limit: int = Field(default=100, ge=1, le=1000, description="Result limit")
    offset: int = Field(default=0, ge=0, description="Result offset")


class AnalyticsSummary(BaseModel):
    """Schema for analytics summary responses."""
    total_events: int = Field(..., description="Total events count")
    unique_sessions: int = Field(..., description="Unique sessions count")
    total_conversations: int = Field(..., description="Total conversations")
    total_leads: int = Field(..., description="Total leads generated")
    conversion_rate: float = Field(..., ge=0.0, le=1.0, description="Lead conversion rate")
    avg_conversation_duration: float | None = Field(None, description="Average conversation duration (seconds)")
    top_intents: list[dict[str, Any]] = Field(default_factory=list, description="Top detected intents")
    channel_breakdown: dict[str, int] = Field(default_factory=dict, description="Events by channel")
    daily_stats: list[dict[str, Any]] = Field(default_factory=list, description="Daily statistics")
    period_start: date = Field(..., description="Summary period start")
    period_end: date = Field(..., description="Summary period end")


class ConversationAnalytics(BaseModel):
    """Schema for conversation-specific analytics."""
    total_conversations: int
    active_conversations: int
    completed_conversations: int
    abandoned_conversations: int
    escalated_conversations: int
    avg_messages_per_conversation: float
    avg_duration_seconds: float
    satisfaction_score: float | None
    top_outcomes: list[dict[str, Any]]
    intent_distribution: dict[str, int]


class LeadAnalytics(BaseModel):
    """Schema for lead-specific analytics."""
    total_leads: int
    qualified_leads: int
    contacted_leads: int
    converted_leads: int
    avg_lead_score: float
    lead_sources: dict[str, int]
    priority_distribution: dict[str, int]
    conversion_funnel: dict[str, int]
    time_to_contact_avg: float | None