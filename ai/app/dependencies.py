"""
app/dependencies.py
──────────────────
FastAPI dependency providers for tenant-aware operations.
Integrates with Supabase auth and provides clean dependency injection.
"""

from __future__ import annotations

import uuid
from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.models.tenant import Tenant
from app.models.business import BusinessProfile, AssistantConfig
from app.services.tenant import TenantService
from app.services.auth import AuthService


async def get_tenant_service() -> TenantService:
    """Dependency to get TenantService instance."""
    return TenantService()


async def get_auth_service() -> AuthService:
    """Dependency to get AuthService instance."""
    return AuthService()


async def get_current_tenant_id(request: Request) -> uuid.UUID:
    """
    Extract current tenant ID from request state.
    Raises HTTPException if no tenant context is available.
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant context not available. Please provide tenant identification."
        )
    return tenant_id


async def get_current_tenant(request: Request) -> Tenant:
    """
    Extract current tenant from request state.
    Raises HTTPException if no tenant context is available.
    """
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant context not available. Please provide tenant identification."
        )
    return tenant


async def get_optional_tenant_id(request: Request) -> uuid.UUID | None:
    """
    Extract current tenant ID from request state.
    Returns None if no tenant context (for optional tenant endpoints).
    """
    return getattr(request.state, "tenant_id", None)


async def get_optional_tenant(request: Request) -> Tenant | None:
    """
    Extract current tenant from request state.
    Returns None if no tenant context (for optional tenant endpoints).
    """
    return getattr(request.state, "tenant", None)


async def get_current_user_id(request: Request) -> str | None:
    """
    Extract current user ID from request state (from Supabase auth).
    Returns None if no authenticated user.
    """
    return getattr(request.state, "user_id", None)


async def require_authenticated_user(request: Request) -> str:
    """
    Require authenticated user and return user ID.
    Raises HTTPException if no user is authenticated.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return user_id


async def get_tenant_scoped_session(
    request: Request,
    session: AsyncSession = Depends(get_db_session)
) -> AsyncGenerator[AsyncSession, None]:
    """
    Provide database session with tenant context for automatic row-level security.
    This works with Supabase RLS policies.
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    user_id = getattr(request.state, "user_id", None)
    
    # Set session variables for Supabase RLS
    if tenant_id:
        await session.execute(
            "SELECT set_config('app.tenant_id', :tenant_id, true)",
            {"tenant_id": str(tenant_id)}
        )
    
    if user_id:
        await session.execute(
            "SELECT set_config('app.user_id', :user_id, true)", 
            {"user_id": user_id}
        )
    
    try:
        yield session
    finally:
        # Clean up session variables
        await session.execute("SELECT set_config('app.tenant_id', '', true)")
        await session.execute("SELECT set_config('app.user_id', '', true)")


async def get_business_profile(
    tenant: Annotated[Tenant, Depends(get_current_tenant)],
    session: AsyncSession = Depends(get_db_session)
) -> BusinessProfile:
    """
    Get business profile for current tenant.
    Raises HTTPException if no profile is configured.
    """
    from sqlalchemy import select
    
    result = await session.execute(
        select(BusinessProfile).where(BusinessProfile.tenant_id == tenant.id)
    )
    business_profile = result.scalar_one_or_none()
    
    if not business_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not configured for this tenant"
        )
    
    return business_profile


async def get_assistant_config(
    business_profile: Annotated[BusinessProfile, Depends(get_business_profile)],
    session: AsyncSession = Depends(get_db_session)
) -> AssistantConfig:
    """
    Get assistant configuration for current tenant.
    Raises HTTPException if no configuration exists.
    """
    from sqlalchemy import select
    
    result = await session.execute(
        select(AssistantConfig).where(
            AssistantConfig.business_profile_id == business_profile.id
        )
    )
    assistant_config = result.scalar_one_or_none()
    
    if not assistant_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant configuration not found for this tenant"
        )
    
    return assistant_config


async def get_optional_business_profile(
    tenant: Annotated[Tenant | None, Depends(get_optional_tenant)],
    session: AsyncSession = Depends(get_db_session)
) -> BusinessProfile | None:
    """
    Get business profile for current tenant (optional).
    Returns None if no tenant context or no profile configured.
    """
    if not tenant:
        return None
        
    from sqlalchemy import select
    
    result = await session.execute(
        select(BusinessProfile).where(BusinessProfile.tenant_id == tenant.id)
    )
    return result.scalar_one_or_none()


# Type aliases for common dependencies
CurrentTenantId = Annotated[uuid.UUID, Depends(get_current_tenant_id)]
CurrentTenant = Annotated[Tenant, Depends(get_current_tenant)]
OptionalTenantId = Annotated[uuid.UUID | None, Depends(get_optional_tenant_id)]
OptionalTenant = Annotated[Tenant | None, Depends(get_optional_tenant)]
CurrentUserId = Annotated[str | None, Depends(get_current_user_id)]
AuthenticatedUserId = Annotated[str, Depends(require_authenticated_user)]
TenantScopedSession = Annotated[AsyncSession, Depends(get_tenant_scoped_session)]
BusinessProfileDep = Annotated[BusinessProfile, Depends(get_business_profile)]
AssistantConfigDep = Annotated[AssistantConfig, Depends(get_assistant_config)]