"""
app/services/conversation.py
──────────────────────────
Conversation orchestration service with AI integration and intent classification.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List

import httpx
import openai
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db_session
from app.models.conversation import (
    ConversationSession, 
    Message, 
    ConversationStatus, 
    ConversationOutcome,
    MessageType,
    ChannelType
)
from app.models.tenant import Tenant
from app.models.business import BusinessProfile, AssistantConfig
from app.models.lead import Lead, LeadSource
from app.schemas.conversation import ChatRequest, ChatResponse, VoiceRequest, VoiceResponse, AssistantAction
from app.services.lead import LeadService

logger = logging.getLogger(__name__)


class ConversationService:
    """
    Service for orchestrating AI conversations across multiple channels.
    Handles intent classification, context management, and business logic.
    """
    
    def __init__(self):
        settings = get_settings()
        self.openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        self.lead_service = LeadService()
    
    async def process_chat_message(
        self,
        request: ChatRequest,
        tenant: Tenant,
        session: AsyncSession
    ) -> ChatResponse:
        """
        Process a text chat message and generate AI response.
        
        Args:
            request: Chat request with messages and context
            tenant: Current tenant context
            session: Database session
            
        Returns:
            Chat response with AI content and actions
        """
        try:
            # Get or create conversation session
            conversation = await self._get_or_create_conversation(
                session_id=request.session_id,
                tenant=tenant,
                channel=ChannelType.WEB_TEXT,
                current_path=request.current_path,
                visitor_context=request.visitor_context,
                session=session
            )
            
            # Get business configuration
            business_profile, assistant_config = await self._get_tenant_config(tenant.id, session)
            
            # Save user message
            user_message = await self._save_message(
                conversation=conversation,
                content=request.messages[-1].content,
                message_type=MessageType.USER,
                session=session
            )
            
            # Generate AI response
            ai_response = await self._generate_ai_response(
                messages=request.messages,
                assistant_config=assistant_config,
                business_profile=business_profile,
                conversation=conversation
            )
            
            # Process intent and extract actions
            intent_result = await self._classify_intent(
                message=request.messages[-1].content,
                assistant_config=assistant_config,
                business_profile=business_profile
            )
            
            # Save AI response message
            assistant_message = await self._save_message(
                conversation=conversation,
                content=ai_response["content"],
                message_type=MessageType.ASSISTANT,
                intent_detected=intent_result.get("intent"),
                entities_extracted=intent_result.get("entities"),
                actions_triggered=ai_response.get("actions", []),
                session=session
            )
            
            # Check for lead capture opportunity
            lead_captured = False
            if intent_result.get("capture_lead", False):
                lead_data = intent_result.get("lead_data", {})
                if lead_data:
                    await self._capture_lead(
                        conversation=conversation,
                        lead_data=lead_data,
                        intent=intent_result.get("intent"),
                        session=session
                    )
                    lead_captured = True
            
            # Update conversation context
            await self._update_conversation_context(
                conversation=conversation,
                intent=intent_result.get("intent"),
                session=session
            )
            
            return ChatResponse(
                content=ai_response["content"],
                actions=ai_response.get("actions", []),
                session_id=conversation.session_id,
                intent=intent_result.get("intent"),
                confidence=ai_response.get("confidence"),
                requires_followup=ai_response.get("requires_followup", False),
                lead_captured=lead_captured,
                metadata={
                    "conversation_id": str(conversation.id),
                    "message_count": conversation.message_count,
                    "processing_time": ai_response.get("processing_time"),
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing chat message: {e}")
            # Return a fallback response
            return ChatResponse(
                content="I apologize, but I'm having trouble processing your message right now. Please try again or contact us directly for assistance.",
                actions=[],
                session_id=request.session_id or str(uuid.uuid4()),
                metadata={"error": str(e)}
            )
    
    async def process_voice_message(
        self,
        request: VoiceRequest,
        tenant: Tenant,
        session: AsyncSession
    ) -> VoiceResponse:
        """
        Process a voice message transcript and generate AI response.
        
        Args:
            request: Voice request with transcript and metadata
            tenant: Current tenant context
            session: Database session
            
        Returns:
            Voice response with AI content and audio
        """
        try:
            # Convert voice request to chat format for processing
            chat_request = ChatRequest(
                messages=[{"role": "user", "content": request.transcript}],
                session_id=request.session_id,
                mode="voice",
                current_path=request.current_path,
                visitor_context=request.visitor_context
            )
            
            # Process as chat message
            chat_response = await self.process_chat_message(chat_request, tenant, session)
            
            # Generate audio response if voice is enabled
            audio_url = None
            if tenant.voice_enabled:
                audio_url = await self._generate_voice_audio(
                    text=chat_response.content,
                    tenant_id=tenant.id
                )
            
            return VoiceResponse(
                content=chat_response.content,
                audio_url=audio_url,
                actions=chat_response.actions,
                session_id=chat_response.session_id,
                intent=chat_response.intent,
                should_continue=not chat_response.requires_followup,
                lead_captured=chat_response.lead_captured,
                metadata=chat_response.metadata
            )
            
        except Exception as e:
            logger.error(f"Error processing voice message: {e}")
            return VoiceResponse(
                content="I'm having trouble understanding you right now. Could you please try again?",
                actions=[],
                session_id=request.session_id,
                should_continue=True,
                metadata={"error": str(e)}
            )
    
    async def _get_or_create_conversation(
        self,
        session_id: str | None,
        tenant: Tenant,
        channel: ChannelType,
        current_path: str | None,
        visitor_context: Dict[str, Any] | None,
        session: AsyncSession
    ) -> ConversationSession:
        """Get existing conversation or create a new one."""
        
        if session_id:
            # Try to find existing conversation
            result = await session.execute(
                select(ConversationSession)
                .where(
                    ConversationSession.session_id == session_id,
                    ConversationSession.tenant_id == tenant.id
                )
            )
            conversation = result.scalar_one_or_none()
            
            if conversation and conversation.status == ConversationStatus.ACTIVE:
                # Update last activity
                conversation.last_activity_at = datetime.utcnow()
                if current_path:
                    conversation.current_page = current_path
                return conversation
        
        # Create new conversation
        conversation = ConversationSession(
            session_id=session_id or str(uuid.uuid4()),
            tenant_id=tenant.id,
            channel=channel,
            current_page=current_path,
            entry_point=current_path,
            visitor_context=visitor_context,
            started_at=datetime.utcnow(),
            last_activity_at=datetime.utcnow()
        )
        
        # Extract visitor info from context if available
        if visitor_context:
            conversation.visitor_ip = visitor_context.get("ip_address")
            conversation.user_agent = visitor_context.get("user_agent")
            conversation.referrer = visitor_context.get("referrer")
            conversation.utm_source = visitor_context.get("utm_source")
            conversation.utm_campaign = visitor_context.get("utm_campaign")
        
        session.add(conversation)
        await session.flush()
        return conversation
    
    async def _get_tenant_config(
        self,
        tenant_id: uuid.UUID,
        session: AsyncSession
    ) -> tuple[BusinessProfile, AssistantConfig]:
        """Get tenant business profile and assistant configuration."""
        
        # Get business profile
        profile_result = await session.execute(
            select(BusinessProfile).where(BusinessProfile.tenant_id == tenant_id)
        )
        business_profile = profile_result.scalar_one_or_none()
        
        if not business_profile:
            raise ValueError(f"No business profile found for tenant {tenant_id}")
        
        # Get assistant config
        config_result = await session.execute(
            select(AssistantConfig).where(AssistantConfig.tenant_id == tenant_id)
        )
        assistant_config = config_result.scalar_one_or_none()
        
        if not assistant_config:
            raise ValueError(f"No assistant config found for tenant {tenant_id}")
        
        return business_profile, assistant_config
    
    async def _generate_ai_response(
        self,
        messages: List[Dict[str, str]],
        assistant_config: AssistantConfig,
        business_profile: BusinessProfile,
        conversation: ConversationSession
    ) -> Dict[str, Any]:
        """Generate AI response using OpenAI."""
        
        try:
            # Build system prompt with context
            system_prompt = self._build_system_prompt(
                assistant_config, business_profile, conversation
            )
            
            # Prepare messages for OpenAI
            openai_messages = [{"role": "system", "content": system_prompt}]
            openai_messages.extend(messages)
            
            # Call OpenAI
            start_time = datetime.utcnow()
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=openai_messages,
                temperature=0.7,
                max_tokens=500
            )
            
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            content = response.choices[0].message.content
            
            # Extract actions from response if any
            actions = self._extract_actions_from_response(content, business_profile)
            
            return {
                "content": content,
                "actions": actions,
                "confidence": 0.9,  # Could implement confidence scoring
                "processing_time": processing_time,
                "model_used": "gpt-4"
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return {
                "content": f"I apologize, but I'm having trouble generating a response right now. How can I help you with {business_profile.business_name}?",
                "actions": [],
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def _classify_intent(
        self,
        message: str,
        assistant_config: AssistantConfig,
        business_profile: BusinessProfile
    ) -> Dict[str, Any]:
        """Classify user intent and extract entities."""
        
        # This is a simplified intent classifier
        # In production, you might use a more sophisticated NLP model
        
        message_lower = message.lower()
        
        # E-commerce intents
        if business_profile.vertical.value == "ecommerce":
            if any(word in message_lower for word in ["buy", "purchase", "order", "cart"]):
                return {"intent": "purchase_intent", "confidence": 0.8}
            elif any(word in message_lower for word in ["size", "fit", "sizing"]):
                return {"intent": "sizing_question", "confidence": 0.9}
            elif any(word in message_lower for word in ["return", "exchange", "refund"]):
                return {"intent": "return_inquiry", "confidence": 0.9}
        
        # Contractor intents  
        elif business_profile.vertical.value == "contractor":
            if any(word in message_lower for word in ["emergency", "urgent", "broken", "not working"]):
                return {"intent": "emergency_service", "confidence": 0.9, "priority": "high"}
            elif any(word in message_lower for word in ["quote", "estimate", "price", "cost"]):
                return {"intent": "quote_request", "confidence": 0.8, "capture_lead": True}
            elif any(word in message_lower for word in ["install", "installation", "new"]):
                return {"intent": "installation_request", "confidence": 0.8, "capture_lead": True}
        
        # Professional services intents
        elif business_profile.vertical.value == "professional_services":
            if any(word in message_lower for word in ["consultation", "appointment", "meeting"]):
                return {"intent": "consultation_request", "confidence": 0.9, "capture_lead": True}
            elif any(word in message_lower for word in ["case", "legal", "help with"]):
                return {"intent": "case_inquiry", "confidence": 0.8, "capture_lead": True}
        
        # General intents
        if any(word in message_lower for word in ["contact", "call", "phone", "email"]):
            return {"intent": "contact_request", "confidence": 0.7, "capture_lead": True}
        elif any(word in message_lower for word in ["hours", "open", "when", "time"]):
            return {"intent": "hours_inquiry", "confidence": 0.8}
        
        # Extract contact info if present
        lead_data = self._extract_lead_data(message)
        if lead_data:
            return {
                "intent": "lead_qualification", 
                "confidence": 0.9, 
                "capture_lead": True,
                "lead_data": lead_data
            }
        
        return {"intent": "general_inquiry", "confidence": 0.5}
    
    async def _save_message(
        self,
        conversation: ConversationSession,
        content: str,
        message_type: MessageType,
        session: AsyncSession,
        intent_detected: str | None = None,
        entities_extracted: Dict[str, Any] | None = None,
        actions_triggered: List[Dict[str, Any]] | None = None,
        processing_time_ms: int | None = None
    ) -> Message:
        """Save message to database."""
        
        message = Message(
            tenant_id=conversation.tenant_id,
            conversation_id=conversation.id,
            content=content,
            message_type=message_type,
            sequence_number=conversation.message_count + 1,
            intent_detected=intent_detected,
            entities_extracted=entities_extracted,
            actions_triggered=actions_triggered,
            processing_time_ms=processing_time_ms
        )
        
        session.add(message)
        
        # Update conversation message count
        conversation.message_count += 1
        conversation.last_activity_at = datetime.utcnow()
        
        await session.flush()
        return message
    
    async def _capture_lead(
        self,
        conversation: ConversationSession,
        lead_data: Dict[str, Any],
        intent: str | None,
        session: AsyncSession
    ):
        """Capture lead information."""
        
        lead = Lead(
            tenant_id=conversation.tenant_id,
            conversation_id=conversation.id,
            source=LeadSource.WEB_CHAT,
            intent=intent,
            **lead_data
        )
        
        session.add(lead)
        
        # Mark conversation as having qualified lead
        conversation.qualified_lead = True
        conversation.lead_score = 75  # Default score, could be calculated
        
        await session.flush()
    
    def _build_system_prompt(
        self,
        assistant_config: AssistantConfig,
        business_profile: BusinessProfile,
        conversation: ConversationSession
    ) -> str:
        """Build context-aware system prompt."""
        
        base_prompt = assistant_config.system_prompt
        
        # Add business context
        context_additions = []
        
        if business_profile.business_hours:
            context_additions.append(f"Business hours: {business_profile.business_hours}")
        
        if business_profile.service_areas:
            context_additions.append(f"Service areas: {', '.join(business_profile.service_areas)}")
        
        if business_profile.offerings:
            context_additions.append(f"Our offerings: {business_profile.offerings}")
        
        # Add conversation context
        if conversation.current_page:
            context_additions.append(f"Customer is currently viewing: {conversation.current_page}")
        
        if context_additions:
            base_prompt += "\n\nCurrent context:\n" + "\n".join(context_additions)
        
        return base_prompt
    
    def _extract_actions_from_response(
        self,
        content: str,
        business_profile: BusinessProfile
    ) -> List[AssistantAction]:
        """Extract suggested actions from AI response."""
        
        actions = []
        content_lower = content.lower()
        
        # Common actions based on content
        if "contact" in content_lower or "call" in content_lower:
            actions.append(AssistantAction(
                type="support",
                label="Contact Us",
                href=f"tel:{business_profile.phone}" if business_profile.phone else f"mailto:{business_profile.email}",
                intent="contact_request"
            ))
        
        if "visit" in content_lower or "location" in content_lower:
            actions.append(AssistantAction(
                type="navigate",
                label="Visit Us",
                href="/contact",
                intent="location_inquiry"
            ))
        
        return actions
    
    def _extract_lead_data(self, message: str) -> Dict[str, Any] | None:
        """Extract potential lead data from message."""
        
        import re
        
        lead_data = {}
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, message)
        if emails:
            lead_data["email"] = emails[0]
        
        # Extract phone (simple pattern)
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        phones = re.findall(phone_pattern, message)
        if phones:
            lead_data["phone"] = phones[0]
        
        # Extract name (if "my name is" or "I'm" appears)
        name_patterns = [
            r"my name is ([A-Za-z\s]+)",
            r"I'm ([A-Za-z\s]+)",
            r"This is ([A-Za-z\s]+)"
        ]
        for pattern in name_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                lead_data["name"] = match.group(1).strip()
                break
        
        return lead_data if lead_data else None
    
    async def _generate_voice_audio(
        self,
        text: str,
        tenant_id: uuid.UUID
    ) -> str | None:
        """Generate voice audio for response (placeholder)."""
        
        # This would integrate with a TTS service like ElevenLabs or Deepgram
        # For now, return None to indicate text-only response
        return None
    
    async def _update_conversation_context(
        self,
        conversation: ConversationSession,
        intent: str | None,
        session: AsyncSession
    ):
        """Update conversation context and classification."""
        
        if intent:
            # Update intent classification
            if not conversation.intent_classification:
                conversation.intent_classification = {}
            
            conversation.intent_classification[intent] = conversation.intent_classification.get(intent, 0) + 1
        
        await session.flush()