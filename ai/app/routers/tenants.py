"""
app/routers/tenants.py
─────────────────────
Tenant management API endpoints.
"""

from __future__ import annotations

import uuid
import logging
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.dependencies import CurrentTenantId, OptionalTenant
from app.services.tenant import TenantService
from app.schemas.tenant import (
    TenantCreate, 
    TenantResponse, 
    TenantUpdate,
    BusinessProfileCreate,
    BusinessProfileResponse,
    BusinessProfileUpdate,
    AssistantConfigCreate,
    AssistantConfigResponse,
    AssistantConfigUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/tenants", tags=["tenants"])


@router.post("/", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    tenant_service: TenantService = Depends()
) -> TenantResponse:
    """
    Create a new tenant with default configuration.
    This endpoint is typically used by admin/onboarding flows.
    """
    try:
        # Check if slug is already taken
        existing = await tenant_service.get_tenant_by_slug(tenant_data.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tenant slug '{tenant_data.slug}' is already taken"
            )
        
        # Create tenant
        tenant = await tenant_service.create_tenant(tenant_data)
        return TenantResponse.model_validate(tenant)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create tenant: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tenant"
        )


@router.get("/current", response_model=TenantResponse)
async def get_current_tenant(
    tenant: OptionalTenant
) -> TenantResponse:
    """Get information about the current tenant."""
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No tenant context available"
        )
    
    return TenantResponse.model_validate(tenant)


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: uuid.UUID,
    tenant_service: TenantService = Depends()
) -> TenantResponse:
    """Get tenant information by ID (admin endpoint)."""
    tenant = await tenant_service.get_tenant_by_id(tenant_id)
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return TenantResponse.model_validate(tenant)


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: uuid.UUID,
    tenant_update: TenantUpdate,
    tenant_service: TenantService = Depends()
) -> TenantResponse:
    """Update tenant information (admin endpoint)."""
    tenant = await tenant_service.update_tenant(tenant_id, tenant_update)
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return TenantResponse.model_validate(tenant)


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: uuid.UUID,
    tenant_service: TenantService = Depends()
):
    """Delete tenant and all associated data (admin endpoint)."""
    success = await tenant_service.delete_tenant(tenant_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )


@router.get("/", response_model=List[TenantResponse])
async def list_tenants(
    limit: int = 100,
    offset: int = 0,
    tenant_service: TenantService = Depends()
) -> List[TenantResponse]:
    """List all tenants (admin endpoint)."""
    tenants = await tenant_service.list_tenants(limit=limit, offset=offset)
    return [TenantResponse.model_validate(tenant) for tenant in tenants]


# ── Business Profile Endpoints ───────────────────────────────────────────────

@router.get("/current/business-profile", response_model=BusinessProfileResponse)
async def get_current_business_profile(
    tenant_id: CurrentTenantId,
    session: AsyncSession = Depends(get_db_session)
) -> BusinessProfileResponse:
    """Get business profile for current tenant."""
    from sqlalchemy import select
    from app.models.business import BusinessProfile
    
    result = await session.execute(
        select(BusinessProfile).where(BusinessProfile.tenant_id == tenant_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
    return BusinessProfileResponse.model_validate(profile)


@router.put("/current/business-profile", response_model=BusinessProfileResponse)
async def update_current_business_profile(
    profile_update: BusinessProfileUpdate,
    tenant_id: CurrentTenantId,
    session: AsyncSession = Depends(get_db_session)
) -> BusinessProfileResponse:
    """Update business profile for current tenant."""
    from sqlalchemy import select
    from app.models.business import BusinessProfile
    
    result = await session.execute(
        select(BusinessProfile).where(BusinessProfile.tenant_id == tenant_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
    # Update fields that are provided
    for field, value in profile_update.model_dump(exclude_unset=True).items():
        if hasattr(profile, field):
            if field == "website_url" and value:
                setattr(profile, field, str(value))
            else:
                setattr(profile, field, value)
    
    await session.commit()
    return BusinessProfileResponse.model_validate(profile)


# ── Assistant Configuration Endpoints ────────────────────────────────────────

@router.get("/current/assistant-config", response_model=AssistantConfigResponse)
async def get_current_assistant_config(
    tenant_id: CurrentTenantId,
    session: AsyncSession = Depends(get_db_session)
) -> AssistantConfigResponse:
    """Get assistant configuration for current tenant."""
    from sqlalchemy import select
    from app.models.business import AssistantConfig
    
    result = await session.execute(
        select(AssistantConfig).where(AssistantConfig.tenant_id == tenant_id)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant configuration not found"
        )
    
    return AssistantConfigResponse.model_validate(config)


@router.put("/current/assistant-config", response_model=AssistantConfigResponse)
async def update_current_assistant_config(
    config_update: AssistantConfigUpdate,
    tenant_id: CurrentTenantId,
    session: AsyncSession = Depends(get_db_session)
) -> AssistantConfigResponse:
    """Update assistant configuration for current tenant."""
    from sqlalchemy import select
    from app.models.business import AssistantConfig
    
    result = await session.execute(
        select(AssistantConfig).where(AssistantConfig.tenant_id == tenant_id)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant configuration not found"
        )
    
    # Update fields that are provided
    for field, value in config_update.model_dump(exclude_unset=True).items():
        if hasattr(config, field):
            setattr(config, field, value)
    
    await session.commit()
    return AssistantConfigResponse.model_validate(config)
