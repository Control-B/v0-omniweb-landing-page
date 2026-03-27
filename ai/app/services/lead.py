"""
app/services/lead.py
───────────────────
Lead qualification and scoring service.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import (
    Lead, 
    LeadStatus, 
    LeadPriority,
    QualificationFlow, 
    QualificationQuestion, 
    QualificationResponse
)
from app.models.conversation import ConversationSession
from app.schemas.lead import LeadCreate, LeadUpdate

logger = logging.getLogger(__name__)


class LeadService:
    """
    Service for lead qualification, scoring, and management.
    """
    
    async def create_lead(
        self,
        lead_data: LeadCreate,
        tenant_id: uuid.UUID,
        session: AsyncSession
    ) -> Lead:
        """Create a new lead."""
        
        lead = Lead(
            tenant_id=tenant_id,
            **lead_data.model_dump()
        )
        
        session.add(lead)
        await session.flush()
        
        # Calculate initial lead score
        await self._calculate_lead_score(lead, session)
        
        logger.info(f"Created new lead: {lead.id} for tenant {tenant_id}")
        return lead
    
    async def update_lead(
        self,
        lead_id: uuid.UUID,
        lead_update: LeadUpdate,
        session: AsyncSession
    ) -> Lead | None:
        """Update an existing lead."""
        
        result = await session.execute(
            select(Lead).where(Lead.id == lead_id)
        )
        lead = result.scalar_one_or_none()
        
        if not lead:
            return None
        
        # Update fields
        for field, value in lead_update.model_dump(exclude_unset=True).items():
            if hasattr(lead, field):
                setattr(lead, field, value)
        
        # Recalculate score if relevant fields changed
        if any(field in lead_update.model_dump(exclude_unset=True) for field in 
               ['intent', 'service_interest', 'budget_range', 'timeline']):
            await self._calculate_lead_score(lead, session)
        
        await session.flush()
        return lead
    
    async def qualify_lead_from_conversation(
        self,
        conversation: ConversationSession,
        extracted_data: Dict[str, Any],
        session: AsyncSession
    ) -> Lead | None:
        """
        Automatically qualify a lead from conversation data.
        
        Args:
            conversation: The conversation session
            extracted_data: Data extracted from conversation
            session: Database session
            
        Returns:
            Created lead or None if not qualified
        """
        
        # Check if lead already exists for this conversation
        existing_result = await session.execute(
            select(Lead).where(Lead.conversation_id == conversation.id)
        )
        existing_lead = existing_result.scalar_one_or_none()
        
        if existing_lead:
            # Update existing lead with new data
            for key, value in extracted_data.items():
                if hasattr(existing_lead, key) and value:
                    setattr(existing_lead, key, value)
            
            await self._calculate_lead_score(existing_lead, session)
            return existing_lead
        
        # Determine lead source based on conversation channel
        from app.models.lead import LeadSource
        source_mapping = {
            "web_text": LeadSource.WEB_CHAT,
            "web_voice": LeadSource.WEB_VOICE,
            "telephony": LeadSource.TELEPHONY
        }
        source = source_mapping.get(conversation.channel.value, LeadSource.WEB_CHAT)
        
        # Create new lead
        lead = Lead(
            tenant_id=conversation.tenant_id,
            conversation_id=conversation.id,
            source=source,
            **extracted_data
        )
        
        session.add(lead)
        await session.flush()
        
        # Calculate lead score
        await self._calculate_lead_score(lead, session)
        
        # Update conversation
        conversation.qualified_lead = True
        conversation.lead_score = lead.lead_score
        
        logger.info(f"Qualified new lead {lead.id} from conversation {conversation.id}")
        return lead
    
    async def score_lead(
        self,
        lead: Lead,
        qualification_responses: List[QualificationResponse] | None = None,
        session: AsyncSession | None = None
    ) -> int:
        """
        Calculate lead score based on qualification criteria.
        
        Args:
            lead: The lead to score
            qualification_responses: Optional qualification responses
            session: Database session
            
        Returns:
            Lead score (0-100)
        """
        
        score = 0
        max_score = 100
        
        # Base scoring criteria
        scoring_factors = {
            "has_contact_info": {"weight": 20, "condition": lead.has_contact_info},
            "has_name": {"weight": 10, "condition": bool(lead.name)},
            "has_email": {"weight": 15, "condition": bool(lead.email)},
            "has_phone": {"weight": 15, "condition": bool(lead.phone)},
            "specific_intent": {"weight": 15, "condition": bool(lead.intent)},
            "service_interest": {"weight": 10, "condition": bool(lead.service_interest)},
            "budget_specified": {"weight": 10, "condition": bool(lead.budget_range)},
            "timeline_specified": {"weight": 5, "condition": bool(lead.timeline)}
        }
        
        # Apply base scoring
        for factor, config in scoring_factors.items():
            if config["condition"]:
                score += config["weight"]
        
        # Vertical-specific scoring adjustments
        if session:
            score = await self._apply_vertical_scoring(lead, score, session)
        
        # Urgency multipliers
        urgency_multipliers = {
            "emergency": 1.5,
            "urgent": 1.3,
            "soon": 1.1,
            "planning": 1.0
        }
        
        if lead.timeline and lead.timeline.lower() in urgency_multipliers:
            score *= urgency_multipliers[lead.timeline.lower()]
        
        # Apply qualification response scoring if available
        if qualification_responses:
            response_score = await self._score_qualification_responses(
                qualification_responses, session
            )
            score += response_score * 0.3  # 30% weight to qualification responses
        
        # Normalize to 0-100 range
        final_score = min(int(score), max_score)
        
        return final_score
    
    async def _calculate_lead_score(
        self,
        lead: Lead,
        session: AsyncSession
    ):
        """Calculate and update lead score."""
        
        # Get qualification responses if any
        responses_result = await session.execute(
            select(QualificationResponse).where(QualificationResponse.lead_id == lead.id)
        )
        responses = list(responses_result.scalars().all())
        
        # Calculate score
        score = await self.score_lead(lead, responses, session)
        lead.lead_score = score
        
        # Set priority based on score
        if score >= 80:
            lead.priority = LeadPriority.URGENT
        elif score >= 60:
            lead.priority = LeadPriority.HIGH
        elif score >= 40:
            lead.priority = LeadPriority.MEDIUM
        else:
            lead.priority = LeadPriority.LOW
        
        # Set qualification scores
        lead.qualification_score = score / 100.0
        lead.readiness_score = self._calculate_readiness_score(lead)
        
        await session.flush()
    
    async def _apply_vertical_scoring(
        self,
        lead: Lead,
        base_score: int,
        session: AsyncSession
    ) -> int:
        """Apply vertical-specific scoring adjustments."""
        
        # Get business profile to determine vertical
        from app.models.business import BusinessProfile
        profile_result = await session.execute(
            select(BusinessProfile).where(BusinessProfile.tenant_id == lead.tenant_id)
        )
        business_profile = profile_result.scalar_one_or_none()
        
        if not business_profile:
            return base_score
        
        vertical = business_profile.vertical.value
        score_adjustment = 0
        
        # E-commerce specific scoring
        if vertical == "ecommerce":
            if lead.intent in ["purchase_intent", "product_inquiry"]:
                score_adjustment += 20
            if lead.budget_range and any(price in lead.budget_range.lower() 
                                       for price in ["$100", "$200", "$300"]):
                score_adjustment += 15
        
        # Contractor specific scoring
        elif vertical == "contractor":
            if lead.intent in ["emergency_service", "urgent_repair"]:
                score_adjustment += 25
            if lead.location and lead.service_area:
                score_adjustment += 10  # Location match bonus
            if lead.timeline and "immediate" in lead.timeline.lower():
                score_adjustment += 20
        
        # Professional services specific scoring
        elif vertical == "professional_services":
            if lead.intent in ["consultation_request", "case_inquiry"]:
                score_adjustment += 20
            if lead.timeline and any(timeframe in lead.timeline.lower() 
                                   for timeframe in ["this week", "urgent", "asap"]):
                score_adjustment += 15
            if lead.company:  # Business clients often higher value
                score_adjustment += 10
        
        return base_score + score_adjustment
    
    def _calculate_readiness_score(self, lead: Lead) -> float:
        """Calculate how ready the lead is to convert."""
        
        readiness_factors = []
        
        # Contact completeness
        contact_completeness = 0
        if lead.name:
            contact_completeness += 0.33
        if lead.email:
            contact_completeness += 0.33
        if lead.phone:
            contact_completeness += 0.34
        readiness_factors.append(contact_completeness)
        
        # Intent clarity
        intent_clarity = 0.5  # Default
        if lead.intent:
            high_intent_keywords = ["buy", "purchase", "hire", "need", "emergency", "urgent"]
            if any(keyword in lead.intent.lower() for keyword in high_intent_keywords):
                intent_clarity = 0.9
            else:
                intent_clarity = 0.7
        readiness_factors.append(intent_clarity)
        
        # Timeline urgency
        timeline_urgency = 0.5  # Default
        if lead.timeline:
            urgency_keywords = {
                "immediate": 1.0,
                "today": 1.0,
                "this week": 0.9,
                "soon": 0.7,
                "next week": 0.6,
                "this month": 0.5,
                "future": 0.3
            }
            timeline_lower = lead.timeline.lower()
            for keyword, score in urgency_keywords.items():
                if keyword in timeline_lower:
                    timeline_urgency = score
                    break
        readiness_factors.append(timeline_urgency)
        
        # Budget indication
        budget_readiness = 0.5  # Default
        if lead.budget_range:
            if any(indicator in lead.budget_range.lower() 
                  for indicator in ["$", "budget", "price", "cost"]):
                budget_readiness = 0.8
        readiness_factors.append(budget_readiness)
        
        # Calculate weighted average
        weights = [0.3, 0.3, 0.3, 0.1]  # Contact, intent, timeline, budget
        readiness_score = sum(factor * weight for factor, weight in zip(readiness_factors, weights))
        
        return min(readiness_score, 1.0)
    
    async def _score_qualification_responses(
        self,
        responses: List[QualificationResponse],
        session: AsyncSession
    ) -> float:
        """Score qualification responses."""
        
        if not responses:
            return 0.0
        
        total_score = 0.0
        total_weight = 0.0
        
        for response in responses:
            if response.points_awarded:
                # Get question to determine weight
                question_result = await session.execute(
                    select(QualificationQuestion).where(
                        QualificationQuestion.id == response.question_id
                    )
                )
                question = question_result.scalar_one_or_none()
                
                if question:
                    weight = question.scoring_weight or 1.0
                    total_score += response.points_awarded * weight
                    total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0.0
    
    async def get_leads_by_tenant(
        self,
        tenant_id: uuid.UUID,
        status: LeadStatus | None = None,
        priority: LeadPriority | None = None,
        limit: int = 100,
        offset: int = 0,
        session: AsyncSession | None = None
    ) -> List[Lead]:
        """Get leads for a tenant with optional filtering."""
        
        if not session:
            from app.database import get_db_session
            async with get_db_session() as session:
                return await self.get_leads_by_tenant(
                    tenant_id, status, priority, limit, offset, session
                )
        
        query = select(Lead).where(Lead.tenant_id == tenant_id)
        
        if status:
            query = query.where(Lead.status == status)
        if priority:
            query = query.where(Lead.priority == priority)
        
        query = query.order_by(Lead.created_at.desc()).limit(limit).offset(offset)
        
        result = await session.execute(query)
        return list(result.scalars().all())
    
    async def get_lead_analytics(
        self,
        tenant_id: uuid.UUID,
        session: AsyncSession
    ) -> Dict[str, Any]:
        """Get lead analytics for a tenant."""
        
        # Get all leads for tenant
        all_leads_result = await session.execute(
            select(Lead).where(Lead.tenant_id == tenant_id)
        )
        all_leads = list(all_leads_result.scalars().all())
        
        if not all_leads:
            return {
                "total_leads": 0,
                "qualified_leads": 0,
                "conversion_rate": 0.0,
                "avg_lead_score": 0.0,
                "lead_sources": {},
                "priority_distribution": {},
                "status_distribution": {}
            }
        
        # Calculate metrics
        total_leads = len(all_leads)
        qualified_leads = sum(1 for lead in all_leads if lead.lead_score >= 60)
        avg_lead_score = sum(lead.lead_score for lead in all_leads) / total_leads
        
        # Count by source
        source_counts = {}
        for lead in all_leads:
            source = lead.source.value
            source_counts[source] = source_counts.get(source, 0) + 1
        
        # Count by priority
        priority_counts = {}
        for lead in all_leads:
            priority = lead.priority.value
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
        
        # Count by status
        status_counts = {}
        for lead in all_leads:
            status = lead.status.value
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "total_leads": total_leads,
            "qualified_leads": qualified_leads,
            "conversion_rate": qualified_leads / total_leads if total_leads > 0 else 0.0,
            "avg_lead_score": avg_lead_score,
            "lead_sources": source_counts,
            "priority_distribution": priority_counts,
            "status_distribution": status_counts
        }