"""
app/middleware/tenant.py
───────────────────────
Tenant-aware middleware for multi-tenant SaaS architecture.
Integrates with Supabase auth and provides tenant context throughout the request lifecycle.
"""

from __future__ import annotations

import logging
import uuid
from typing import Callable, Any

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.tenant import TenantService
from app.services.auth import AuthService

logger = logging.getLogger(__name__)


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware that identifies and validates tenant context for each request.
    
    Tenant identification strategies (in order of priority):
    1. X-Tenant-ID header (for API clients)
    2. tenant_id query parameter 
    3. Subdomain extraction (subdomain.domain.com)
    4. Domain mapping (custom domains)
    5. Supabase auth user -> tenant mapping
    """
    
    def __init__(self, app, tenant_service: TenantService):
        super().__init__(app)
        self.tenant_service = tenant_service
        self.auth_service = AuthService()
        
        # Paths that don't require tenant context
        self.public_paths = {
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/admin",  # Admin endpoints use different auth
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Any:
        """Process request with tenant context."""
        
        # Skip tenant resolution for public paths
        if any(request.url.path.startswith(path) for path in self.public_paths):
            return await call_next(request)
        
        try:
            # Extract tenant information
            tenant_info = await self._resolve_tenant(request)
            
            if tenant_info:
                # Add tenant context to request state
                request.state.tenant_id = tenant_info["tenant_id"]
                request.state.tenant = tenant_info["tenant"]
                request.state.user_id = tenant_info.get("user_id")
                
                logger.debug(f"Tenant resolved: {tenant_info['tenant'].slug} ({tenant_info['tenant_id']})")
            else:
                # No tenant context - might be acceptable for some endpoints
                request.state.tenant_id = None
                request.state.tenant = None
                request.state.user_id = None
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Tenant middleware error: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "Internal server error during tenant resolution"}
            )
        
        return await call_next(request)
    
    async def _resolve_tenant(self, request: Request) -> dict[str, Any] | None:
        """Resolve tenant context from request."""
        
        # Strategy 1: X-Tenant-ID header
        tenant_id_header = request.headers.get("x-tenant-id")
        if tenant_id_header:
            try:
                tenant_id = uuid.UUID(tenant_id_header)
                tenant = await self.tenant_service.get_tenant_by_id(tenant_id)
                if tenant and tenant.is_active:
                    return {
                        "tenant_id": tenant_id,
                        "tenant": tenant,
                        "user_id": None
                    }
            except (ValueError, Exception) as e:
                logger.warning(f"Invalid tenant ID in header: {tenant_id_header} - {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid tenant ID format"
                )
        
        # Strategy 2: tenant_id query parameter
        tenant_id_param = request.query_params.get("tenant_id")
        if tenant_id_param:
            try:
                tenant_id = uuid.UUID(tenant_id_param)
                tenant = await self.tenant_service.get_tenant_by_id(tenant_id)
                if tenant and tenant.is_active:
                    return {
                        "tenant_id": tenant_id,
                        "tenant": tenant,
                        "user_id": None
                    }
            except (ValueError, Exception) as e:
                logger.warning(f"Invalid tenant ID in query: {tenant_id_param} - {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid tenant ID format"
                )
        
        # Strategy 3: Subdomain extraction
        host = request.headers.get("host", "")
        if "." in host:
            subdomain = host.split(".")[0]
            if subdomain and subdomain != "www" and subdomain != "api":
                tenant = await self.tenant_service.get_tenant_by_slug(subdomain)
                if tenant and tenant.is_active:
                    return {
                        "tenant_id": tenant.id,
                        "tenant": tenant,
                        "user_id": None
                    }
        
        # Strategy 4: Domain mapping
        if host:
            tenant = await self.tenant_service.get_tenant_by_domain(host)
            if tenant and tenant.is_active:
                return {
                    "tenant_id": tenant.id,
                    "tenant": tenant,
                    "user_id": None
                }
        
        # Strategy 5: Supabase auth user -> tenant mapping
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                user_info = await self.auth_service.verify_token(token)
                if user_info:
                    # Find tenant associated with this user
                    tenant = await self.tenant_service.get_tenant_by_user_id(user_info["user_id"])
                    if tenant and tenant.is_active:
                        return {
                            "tenant_id": tenant.id,
                            "tenant": tenant,
                            "user_id": user_info["user_id"]
                        }
            except Exception as e:
                logger.warning(f"Auth token verification failed: {e}")
                # Don't raise here - might be an unauthenticated request
        
        # No tenant context found
        return None


class RequireTenantMiddleware(BaseHTTPMiddleware):
    """
    Secondary middleware that ensures tenant context exists for protected endpoints.
    Should be applied after TenantMiddleware.
    """
    
    def __init__(self, app):
        super().__init__(app)
        
        # Paths that require tenant context
        self.protected_patterns = [
            "/api/v1/chat",
            "/api/v1/voice", 
            "/api/v1/conversations",
            "/api/v1/leads",
            "/api/v1/analytics",
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Any:
        """Ensure tenant context for protected endpoints."""
        
        # Check if this endpoint requires tenant context
        requires_tenant = any(
            request.url.path.startswith(pattern) 
            for pattern in self.protected_patterns
        )
        
        if requires_tenant and not getattr(request.state, "tenant_id", None):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "Tenant context required",
                    "detail": "This endpoint requires tenant identification. Please provide tenant ID via header, query parameter, or subdomain."
                }
            )
        
        return await call_next(request)


class TenantIsolationMiddleware(BaseHTTPMiddleware):
    """
    Middleware that ensures data isolation between tenants.
    Adds tenant-scoped database session to request state.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Any:
        """Add tenant-scoped database context."""
        
        tenant_id = getattr(request.state, "tenant_id", None)
        
        if tenant_id:
            # Add tenant context for database queries
            request.state.tenant_filter = {"tenant_id": tenant_id}
            
            # Log tenant access for audit trail
            logger.info(f"Request from tenant {tenant_id}: {request.method} {request.url.path}")
        
        return await call_next(request)