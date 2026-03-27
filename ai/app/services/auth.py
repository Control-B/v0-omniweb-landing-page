"""
app/services/auth.py
───────────────────
Authentication service using Supabase Auth.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

import httpx
from supabase import create_client, Client

from app.config import get_settings

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication service using Supabase Auth.
    Handles token verification and user management.
    """
    
    def __init__(self):
        settings = get_settings()
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key
        )
        self.service_role_key = settings.supabase_service_role_key
    
    async def verify_token(self, token: str) -> Dict[str, Any] | None:
        """
        Verify JWT token and return user information.
        
        Args:
            token: JWT token from Authorization header
            
        Returns:
            User information dict or None if invalid
        """
        try:
            # Verify token with Supabase
            user = self.supabase.auth.get_user(token)
            
            if user and user.user:
                return {
                    "user_id": user.user.id,
                    "email": user.user.email,
                    "user_metadata": user.user.user_metadata,
                    "app_metadata": user.user.app_metadata,
                }
            
            return None
            
        except Exception as e:
            logger.warning(f"Token verification failed: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Dict[str, Any] | None:
        """
        Get user information by user ID (admin operation).
        
        Args:
            user_id: Supabase user ID
            
        Returns:
            User information dict or None if not found
        """
        try:
            # Use service role key for admin operations
            admin_client = create_client(
                get_settings().supabase_url,
                self.service_role_key
            )
            
            response = admin_client.auth.admin.get_user_by_id(user_id)
            
            if response and response.user:
                return {
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "user_metadata": response.user.user_metadata,
                    "app_metadata": response.user.app_metadata,
                    "created_at": response.user.created_at,
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get user {user_id}: {e}")
            return None
    
    async def create_user(
        self, 
        email: str, 
        password: str, 
        user_metadata: Dict[str, Any] | None = None
    ) -> Dict[str, Any] | None:
        """
        Create a new user account (admin operation).
        
        Args:
            email: User email
            password: User password
            user_metadata: Additional user metadata
            
        Returns:
            Created user information or None if failed
        """
        try:
            # Use service role key for admin operations
            admin_client = create_client(
                get_settings().supabase_url,
                self.service_role_key
            )
            
            response = admin_client.auth.admin.create_user({
                "email": email,
                "password": password,
                "user_metadata": user_metadata or {},
                "email_confirm": True,  # Auto-confirm for admin created users
            })
            
            if response and response.user:
                return {
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "user_metadata": response.user.user_metadata,
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to create user {email}: {e}")
            return None
    
    async def update_user_metadata(
        self, 
        user_id: str, 
        user_metadata: Dict[str, Any] | None = None,
        app_metadata: Dict[str, Any] | None = None
    ) -> bool:
        """
        Update user metadata (admin operation).
        
        Args:
            user_id: User ID
            user_metadata: User metadata to update
            app_metadata: App metadata to update
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Use service role key for admin operations
            admin_client = create_client(
                get_settings().supabase_url,
                self.service_role_key
            )
            
            update_data = {}
            if user_metadata is not None:
                update_data["user_metadata"] = user_metadata
            if app_metadata is not None:
                update_data["app_metadata"] = app_metadata
            
            response = admin_client.auth.admin.update_user_by_id(
                user_id, 
                update_data
            )
            
            return response and response.user is not None
            
        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {e}")
            return False
    
    async def delete_user(self, user_id: str) -> bool:
        """
        Delete user account (admin operation).
        
        Args:
            user_id: User ID to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Use service role key for admin operations
            admin_client = create_client(
                get_settings().supabase_url,
                self.service_role_key
            )
            
            response = admin_client.auth.admin.delete_user(user_id)
            return True  # Supabase doesn't return meaningful response for deletion
            
        except Exception as e:
            logger.error(f"Failed to delete user {user_id}: {e}")
            return False
    
    async def assign_user_to_tenant(self, user_id: str, tenant_id: str) -> bool:
        """
        Assign user to a tenant by updating app metadata.
        
        Args:
            user_id: User ID
            tenant_id: Tenant ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get current user metadata
            user_info = await self.get_user_by_id(user_id)
            if not user_info:
                return False
            
            # Update app metadata with tenant assignment
            app_metadata = user_info.get("app_metadata", {})
            app_metadata["tenant_id"] = tenant_id
            
            return await self.update_user_metadata(
                user_id, 
                app_metadata=app_metadata
            )
            
        except Exception as e:
            logger.error(f"Failed to assign user {user_id} to tenant {tenant_id}: {e}")
            return False