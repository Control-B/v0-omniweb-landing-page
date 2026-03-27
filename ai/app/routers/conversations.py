"""
app/routers/conversations.py
───────────────────────────
Conversation API endpoints for text chat and voice interaction.
"""

from __future__ import annotations

import logging
import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.dependencies import CurrentTenant, TenantScopedSession, OptionalTenant
from app.services.conversation import ConversationService
from app.schemas.conversation import (
    ChatRequest, 
    ChatResponse, 
    VoiceRequest, 
    VoiceResponse,
    ConversationSessionResponse,
    MessageResponse
)
from app.models.conversation import ConversationSession, Message
from app.models.tenant import Tenant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/conversations", tags=["conversations"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    tenant: CurrentTenant,
    session: TenantScopedSession,
    conversation_service: ConversationService = Depends()
) -> ChatResponse:
    """
    Process a text chat message and return AI response.
    
    This is the main endpoint for website text chat integration.
    """
    try:
        # Add tenant context to request if not present
        if not request.tenant_id:
            request.tenant_id = tenant.id
        
        response = await conversation_service.process_chat_message(
            request=request,
            tenant=tenant,
            session=session
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message"
        )


@router.post("/voice", response_model=VoiceResponse)
async def voice_endpoint(
    request: VoiceRequest,
    tenant: CurrentTenant,
    session: TenantScopedSession,
    conversation_service: ConversationService = Depends()
) -> VoiceResponse:
    """
    Process a voice message transcript and return AI response with optional audio.
    
    This endpoint handles voice transcripts from Deepgram or similar services.
    """
    try:
        # Add tenant context to request if not present
        if not request.tenant_id:
            request.tenant_id = tenant.id
        
        response = await conversation_service.process_voice_message(
            request=request,
            tenant=tenant,
            session=session
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Voice endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process voice message"
        )


@router.get("/", response_model=List[ConversationSessionResponse])
async def list_conversations(
    tenant: CurrentTenant,
    session: TenantScopedSession,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0
) -> List[ConversationSessionResponse]:
    """
    List conversations for the current tenant.
    
    Useful for tenant dashboard and conversation history.
    """
    try:
        query = select(ConversationSession).where(
            ConversationSession.tenant_id == tenant.id
        )
        
        if status:
            from app.models.conversation import ConversationStatus
            try:
                status_enum = ConversationStatus(status)
                query = query.where(ConversationSession.status == status_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status}"
                )
        
        query = query.order_by(ConversationSession.created_at.desc())
        query = query.limit(limit).offset(offset)
        
        result = await session.execute(query)
        conversations = list(result.scalars().all())
        
        return [
            ConversationSessionResponse.model_validate(conv) 
            for conv in conversations
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"List conversations error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list conversations"
        )


@router.get("/{conversation_id}", response_model=ConversationSessionResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    tenant: CurrentTenant,
    session: TenantScopedSession,
    include_messages: bool = True
) -> ConversationSessionResponse:
    """
    Get a specific conversation with optional messages.
    
    Args:
        conversation_id: The conversation ID
        tenant: Current tenant (injected)
        session: Database session (injected)
        include_messages: Whether to include conversation messages
    """
    try:
        query = select(ConversationSession).where(
            ConversationSession.id == conversation_id,
            ConversationSession.tenant_id == tenant.id
        )
        
        result = await session.execute(query)
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Convert to response model
        conv_response = ConversationSessionResponse.model_validate(conversation)
        
        # Optionally include messages
        if include_messages:
            messages_query = select(Message).where(
                Message.conversation_id == conversation_id
            ).order_by(Message.sequence_number)
            
            messages_result = await session.execute(messages_query)
            messages = list(messages_result.scalars().all())
            
            conv_response.messages = [
                MessageResponse.model_validate(msg) for msg in messages
            ]
        
        return conv_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get conversation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get conversation"
        )


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    tenant: CurrentTenant,
    session: TenantScopedSession,
    limit: int = 100,
    offset: int = 0
) -> List[MessageResponse]:
    """
    Get messages for a specific conversation.
    
    Args:
        conversation_id: The conversation ID
        tenant: Current tenant (injected)
        session: Database session (injected) 
        limit: Maximum number of messages to return
        offset: Number of messages to skip
    """
    try:
        # Verify conversation belongs to tenant
        conv_query = select(ConversationSession).where(
            ConversationSession.id == conversation_id,
            ConversationSession.tenant_id == tenant.id
        )
        conv_result = await session.execute(conv_query)
        conversation = conv_result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Get messages
        messages_query = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.sequence_number).limit(limit).offset(offset)
        
        messages_result = await session.execute(messages_query)
        messages = list(messages_result.scalars().all())
        
        return [MessageResponse.model_validate(msg) for msg in messages]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get conversation messages error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get conversation messages"
        )


@router.post("/session", response_model=dict[str, str])
async def create_session(
    tenant: OptionalTenant,
    visitor_context: dict[str, str] | None = None
) -> dict[str, str]:
    """
    Create a new conversation session ID for anonymous visitors.
    
    This endpoint can be called without full tenant context to generate
    a session ID that can be used in subsequent chat/voice calls.
    """
    try:
        session_id = str(uuid.uuid4())
        
        return {
            "session_id": session_id,
            "message": "Session created successfully"
        }
        
    except Exception as e:
        logger.error(f"Create session error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )
