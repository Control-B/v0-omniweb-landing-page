"""
app/schemas/__init__.py
──────────────────────
Pydantic schemas for API request/response validation and serialization.
"""

from .tenant import (
    TenantCreate, 
    TenantResponse, 
    TenantUpdate,
    BusinessProfileCreate,
    BusinessProfileResponse,
    AssistantConfigCreate,
    AssistantConfigResponse,
)

from .conversation import (
    ConversationSessionCreate,
    ConversationSessionResponse,
    MessageCreate,
    MessageResponse,
    ChatRequest,
    ChatResponse,
    VoiceRequest,
)

from .lead import (
    LeadCreate,
    LeadResponse,
    LeadUpdate,
    QualificationFlowCreate,
    QualificationFlowResponse,
)

from .analytics import (
    AnalyticsEventCreate,
    AnalyticsEventResponse,
    AnalyticsQuery,
    AnalyticsSummary,
)

__all__ = [
    # Tenant schemas
    "TenantCreate",
    "TenantResponse", 
    "TenantUpdate",
    "BusinessProfileCreate",
    "BusinessProfileResponse",
    "AssistantConfigCreate",
    "AssistantConfigResponse",
    
    # Conversation schemas
    "ConversationSessionCreate",
    "ConversationSessionResponse",
    "MessageCreate",
    "MessageResponse", 
    "ChatRequest",
    "ChatResponse",
    "VoiceRequest",
    
    # Lead schemas
    "LeadCreate",
    "LeadResponse",
    "LeadUpdate",
    "QualificationFlowCreate",
    "QualificationFlowResponse",
    
    # Analytics schemas
    "AnalyticsEventCreate",
    "AnalyticsEventResponse",
    "AnalyticsQuery",
    "AnalyticsSummary",
]