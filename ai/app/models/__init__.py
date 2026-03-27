"""
app/models/__init__.py
──────────────────────
Database models for the multi-tenant AI assistant platform.

This module contains SQLAlchemy models that support:
- Multi-tenant architecture with tenant isolation
- Conversation management across channels (text, voice, telephony)
- Lead qualification and scoring
- Business configuration and vertical templates
- Analytics and reporting
"""

from .tenant import Tenant, TenantStatus
from .business import BusinessProfile, VerticalTemplate, AssistantConfig
from .conversation import ConversationSession, Message, MessageType, ConversationStatus
from .lead import Lead, LeadStatus, LeadPriority, QualificationFlow, QualificationQuestion, QualificationResponse
from .analytics import AnalyticsEvent, EventType
from .integration import ChannelConfig, ChannelType, VoiceSession, TelephonySession

__all__ = [
    # Tenant models
    "Tenant",
    "TenantStatus",
    "BusinessProfile", 
    "VerticalTemplate",
    "AssistantConfig",
    
    # Conversation models
    "ConversationSession",
    "Message", 
    "MessageType",
    "ConversationStatus",
    
    # Lead models
    "Lead",
    "LeadStatus",
    "LeadPriority", 
    "QualificationFlow",
    "QualificationQuestion",
    "QualificationResponse",
    
    # Analytics
    "AnalyticsEvent",
    "EventType",
    
    # Integrations
    "ChannelConfig",
    "ChannelType", 
    "VoiceSession",
    "TelephonySession",
]