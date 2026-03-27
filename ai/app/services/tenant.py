"""
app/services/tenant.py
─────────────────────
Tenant management service for multi-tenant operations.
"""

from __future__ import annotations

import uuid
import logging
from typing import Any, Dict, List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db_session
from app.models.tenant import Tenant, TenantStatus
from app.models.business import BusinessProfile, AssistantConfig
from app.schemas.tenant import TenantCreate, TenantUpdate

logger = logging.getLogger(__name__)


class TenantService:
    """
    Service for managing tenants and their configurations.
    """
    
    async def get_tenant_by_id(self, tenant_id: uuid.UUID) -> Tenant | None:
        """Get tenant by ID."""
        async with get_db_session() as session:
            result = await session.execute(
                select(Tenant)
                .options(selectinload(Tenant.business_profile))
                .where(Tenant.id == tenant_id)
            )
            return result.scalar_one_or_none()
    
    async def get_tenant_by_slug(self, slug: str) -> Tenant | None:
        """Get tenant by URL slug."""
        async with get_db_session() as session:
            result = await session.execute(
                select(Tenant)
                .options(selectinload(Tenant.business_profile))
                .where(Tenant.slug == slug)
            )
            return result.scalar_one_or_none()
    
    async def get_tenant_by_domain(self, domain: str) -> Tenant | None:
        """Get tenant by custom domain."""
        async with get_db_session() as session:
            result = await session.execute(
                select(Tenant)
                .options(selectinload(Tenant.business_profile))
                .where(Tenant.domain == domain)
            )
            return result.scalar_one_or_none()
    
    async def get_tenant_by_user_id(self, user_id: str) -> Tenant | None:
        """
        Get tenant associated with a user ID.
        This could be implemented via user metadata or a separate user_tenants table.
        For now, we'll use a simple approach with app metadata.
        """
        # This would typically query user metadata from Supabase
        # or a user_tenants mapping table
        # For now, return None - implement based on your user-tenant mapping strategy
        return None
    
    async def create_tenant(
        self, 
        tenant_data: TenantCreate,
        user_id: str | None = None
    ) -> Tenant:
        """
        Create a new tenant with basic configuration.
        
        Args:
            tenant_data: Tenant creation data
            user_id: Optional user ID to associate with tenant
            
        Returns:
            Created tenant
        """
        async with get_db_session() as session:
            # Create tenant
            tenant = Tenant(
                name=tenant_data.name,
                slug=tenant_data.slug,
                domain=tenant_data.domain,
                contact_email=tenant_data.contact_email,
                contact_name=tenant_data.contact_name,
                billing_email=tenant_data.billing_email,
                voice_enabled=tenant_data.voice_enabled,
                telephony_enabled=tenant_data.telephony_enabled,
                webhook_url=str(tenant_data.webhook_url) if tenant_data.webhook_url else None,
                notes=tenant_data.notes,
                status=TenantStatus.TRIAL
            )
            
            session.add(tenant)
            await session.flush()  # Get tenant ID
            
            # Create default business profile
            business_profile = BusinessProfile(
                tenant_id=tenant.id,
                business_name=tenant_data.name,
                vertical="custom",  # Default vertical
                description="AI assistant for " + tenant_data.name
            )
            
            session.add(business_profile)
            await session.flush()  # Get business profile ID
            
            # Create default assistant configuration
            assistant_config = AssistantConfig(
                tenant_id=tenant.id,
                business_profile_id=business_profile.id,
                assistant_name="Assistant",
                company_name=tenant_data.name,
                system_prompt=self._get_default_system_prompt(tenant_data.name),
                greeting_message=f"Hello! I'm here to help you with {tenant_data.name}. How can I assist you today?",
                primary_goals=["provide_information", "capture_leads", "answer_questions"],
                conversation_objectives={
                    "primary": "Assist visitors and capture qualified leads",
                    "secondary": "Answer common questions and provide support"
                }
            )
            
            session.add(assistant_config)
            await session.commit()
            
            logger.info(f"Created new tenant: {tenant.slug} ({tenant.id})")
            return tenant
    
    async def update_tenant(
        self, 
        tenant_id: uuid.UUID, 
        tenant_update: TenantUpdate
    ) -> Tenant | None:
        """Update tenant information."""
        async with get_db_session() as session:
            result = await session.execute(
                select(Tenant).where(Tenant.id == tenant_id)
            )
            tenant = result.scalar_one_or_none()
            
            if not tenant:
                return None
            
            # Update fields that are provided
            for field, value in tenant_update.model_dump(exclude_unset=True).items():
                if hasattr(tenant, field):
                    if field == "webhook_url" and value:
                        setattr(tenant, field, str(value))
                    else:
                        setattr(tenant, field, value)
            
            await session.commit()
            logger.info(f"Updated tenant: {tenant.slug} ({tenant.id})")
            return tenant
    
    async def delete_tenant(self, tenant_id: uuid.UUID) -> bool:
        """Delete tenant and all associated data."""
        async with get_db_session() as session:
            result = await session.execute(
                select(Tenant).where(Tenant.id == tenant_id)
            )
            tenant = result.scalar_one_or_none()
            
            if not tenant:
                return False
            
            await session.delete(tenant)
            await session.commit()
            
            logger.info(f"Deleted tenant: {tenant.slug} ({tenant.id})")
            return True
    
    async def list_tenants(
        self, 
        status: TenantStatus | None = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Tenant]:
        """List tenants with optional filtering."""
        async with get_db_session() as session:
            query = select(Tenant).options(selectinload(Tenant.business_profile))
            
            if status:
                query = query.where(Tenant.status == status)
            
            query = query.limit(limit).offset(offset)
            
            result = await session.execute(query)
            return list(result.scalars().all())
    
    async def get_tenant_stats(self, tenant_id: uuid.UUID) -> Dict[str, Any]:
        """Get basic statistics for a tenant."""
        async with get_db_session() as session:
            # Get conversation count
            from app.models.conversation import ConversationSession
            conv_result = await session.execute(
                select(ConversationSession.id).where(
                    ConversationSession.tenant_id == tenant_id
                )
            )
            conversation_count = len(conv_result.all())
            
            # Get lead count
            from app.models.lead import Lead
            lead_result = await session.execute(
                select(Lead.id).where(Lead.tenant_id == tenant_id)
            )
            lead_count = len(lead_result.all())
            
            return {
                "conversation_count": conversation_count,
                "lead_count": lead_count,
            }
    
    def _get_default_system_prompt(self, business_name: str) -> str:
        """Generate default system prompt for new tenants."""
        return f"""You are a helpful AI assistant for {business_name}. Your role is to:

1. Welcome visitors and understand their needs
2. Provide helpful information about {business_name}
3. Answer questions professionally and courteously
4. Identify potential leads and capture their contact information
5. Guide visitors toward appropriate actions or next steps
6. Escalate complex issues to human staff when needed

Always be friendly, professional, and focused on providing value to visitors while helping {business_name} achieve their business goals.

If you need to collect contact information, be natural about it and explain why it's helpful. Ask for name and email at minimum, and phone number when relevant.

If you don't know something, be honest about it and offer to connect them with someone who can help."""