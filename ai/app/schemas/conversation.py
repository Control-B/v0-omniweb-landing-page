"""
app/schemas/conversation.py
──────────────────────────
Pydantic schemas for conversation and messaging API endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from ..models.conversation import (
    ChannelType,
    ConversationOutcome,
    ConversationStatus,
    MessageType,
)


class MessageBase(BaseModel):
    content: str = Field(..., min_length=1, description="Message content")
    message_type: MessageType


class MessageCreate(MessageBase):
    sequence_number: int = Field(..., ge=1)
    processing_time_ms: int | None = Field(None, ge=0)
    model_used: str | None = Field(None, max_length=100)
    audio_duration_ms: int | None = Field(None, ge=0)
    transcript_confidence: float | None = Field(None, ge=0.0, le=1.0)
    actions_triggered: list[dict[str, Any]] | None = None
    intent_detected: str | None = Field(None, max_length=100)
    entities_extracted: dict[str, Any] | None = None
    error_occurred: bool = False
    error_details: dict[str, Any] | None = None


class MessageResponse(MessageBase):
    id: uuid.UUID
    conversation_id: uuid.UUID
    tenant_id: uuid.UUID
    sequence_number: int
    token_count: int | None
    processing_time_ms: int | None
    model_used: str | None
    audio_duration_ms: int | None
    transcript_confidence: float | None
    actions_triggered: list[dict[str, Any]] | None
    intent_detected: str | None
    entities_extracted: dict[str, Any] | None
    error_occurred: bool
    error_details: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationSessionBase(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=100)
    channel: ChannelType


class ConversationSessionCreate(ConversationSessionBase):
    visitor_id: str | None = Field(None, max_length=255)
    visitor_ip: str | None = Field(None, max_length=45)
    user_agent: str | None = None
    referrer: str | None = Field(None, max_length=500)
    current_page: str | None = Field(None, max_length=500)
    entry_point: str | None = Field(None, max_length=500)
    utm_source: str | None = Field(None, max_length=100)
    utm_campaign: str | None = Field(None, max_length=100)
    language_detected: str | None = Field(None, max_length=10)


class ConversationSessionUpdate(BaseModel):
    status: ConversationStatus | None = None
    outcome: ConversationOutcome | None = None
    current_page: str | None = Field(None, max_length=500)
    duration_seconds: int | None = Field(None, ge=0)
    intent_classification: dict[str, Any] | None = None
    sentiment_score: float | None = Field(None, ge=-1.0, le=1.0)
    qualified_lead: bool | None = None
    lead_score: int | None = Field(None, ge=0, le=100)
    priority_level: str | None = Field(None, max_length=20)
    summary: str | None = None
    key_topics: list[str] | None = None
    action_items: list[str] | None = None


class ConversationSessionResponse(ConversationSessionBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    status: ConversationStatus
    outcome: ConversationOutcome | None
    visitor_id: str | None
    visitor_ip: str | None
    user_agent: str | None
    referrer: str | None
    current_page: str | None
    entry_point: str | None
    utm_source: str | None
    utm_campaign: str | None
    message_count: int
    duration_seconds: int | None
    intent_classification: dict[str, Any] | None
    sentiment_score: float | None
    language_detected: str | None
    qualified_lead: bool
    lead_score: int | None
    priority_level: str | None
    summary: str | None
    key_topics: list[str] | None
    action_items: list[str] | None
    started_at: datetime
    ended_at: datetime | None
    last_activity_at: datetime
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse] | None = None

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"] = Field(..., description="Message role")
    content: str = Field(..., min_length=1, description="Message content")


class AssistantAction(BaseModel):
    type: Literal["navigate", "support", "lead", "escalate", "book"] = Field(..., description="Action type")
    label: str = Field(..., description="Action label for UI")
    href: str | None = Field(None, description="URL for navigation actions")
    service: str | None = Field(None, description="Service identifier")
    intent: str | None = Field(None, description="Detected user intent")
    summary: str | None = Field(None, description="Action summary")
    data: dict[str, Any] | None = Field(None, description="Additional action data")


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, description="Conversation messages")
    session_id: str | None = Field(None, description="Session ID for continuity")
    mode: Literal["text", "voice"] = Field(default="text", description="Interaction mode")
    current_path: str | None = Field(None, description="Current page path")
    visitor_context: dict[str, Any] | None = Field(None, description="Additional visitor context")
    tenant_id: uuid.UUID | None = Field(None, description="Tenant ID")


class ChatResponse(BaseModel):
    content: str = Field(..., description="AI response content")
    actions: list[AssistantAction] = Field(default_factory=list, description="Suggested actions")
    session_id: str = Field(..., description="Session ID")
    intent: str | None = Field(None, description="Detected intent")
    confidence: float | None = Field(None, ge=0.0, le=1.0, description="Response confidence")
    requires_followup: bool = Field(default=False, description="Whether followup is needed")
    lead_captured: bool = Field(default=False, description="Whether lead info was captured")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class VoiceRequest(BaseModel):
    session_id: str = Field(..., description="Voice session ID")
    transcript: str = Field(..., min_length=1, description="Voice transcript")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Transcript confidence")
    audio_duration_ms: int = Field(..., ge=0, description="Audio duration in milliseconds")
    current_path: str | None = Field(None, description="Current page path")
    is_final: bool = Field(default=True, description="Whether this is the final transcript")
    visitor_context: dict[str, Any] | None = Field(None, description="Additional visitor context")
    tenant_id: uuid.UUID | None = Field(None, description="Tenant ID")


class VoiceResponse(BaseModel):
    content: str = Field(..., description="AI response content")
    audio_url: str | None = Field(None, description="Generated audio response URL")
    actions: list[AssistantAction] = Field(default_factory=list, description="Suggested actions")
    session_id: str = Field(..., description="Session ID")
    intent: str | None = Field(None, description="Detected intent")
    should_continue: bool = Field(default=True, description="Whether conversation should continue")
    lead_captured: bool = Field(default=False, description="Whether lead info was captured")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
