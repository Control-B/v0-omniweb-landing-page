"""Customer Identity Resolution Service.

Resolves multi-channel touchpoints (phone, SMS, email, web sessions, CRM IDs)
into canonical Customer entities with explicit confidence tiers:
- KNOWN: Cryptographically verified session, OTP-verified phone, or authenticated portal login.
- PROBABLE: Matched on single unverified attribute (e.g. caller ID matching an email).
- UNKNOWN: Anonymous caller or first-time web visitor.

Architecture Principle: Never merge customer identities based on probabilistic LLM guesses.
Deterministic resolution only.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.models import Customer, CustomerIdentity

logger = get_logger(__name__)


class IdentityVerificationStatus(str, Enum):
    KNOWN = "KNOWN"
    PROBABLE = "PROBABLE"
    UNKNOWN = "UNKNOWN"


@dataclass
class ResolvedCustomerIdentity:
    customer: Customer | None
    identity: CustomerIdentity | None
    status: IdentityVerificationStatus
    is_new: bool
    requires_verification_for_sensitive_ops: bool


class IdentityResolver:
    """Deterministic Multi-Tenant Customer Identity Resolution Engine."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def resolve(
        self,
        *,
        tenant_id: uuid.UUID,
        channel: str,
        identifier: str,
        caller_name: str | None = None,
        verified: bool = False,
    ) -> ResolvedCustomerIdentity:
        """Resolve an incoming channel identifier to a canonical Customer.
        
        Args:
            tenant_id: The tenant/client ID.
            channel: 'PHONE', 'EMAIL', 'WEB_SESSION', 'STRIPE_CUSTOMER', etc.
            identifier: Normalized E.164 phone number, lowercase email, or session token.
            caller_name: Optional name provided by caller/web client.
            verified: True if the channel was cryptographically or OTP verified.
        """
        normalized_channel = channel.upper()
        normalized_identifier = identifier.strip()
        if normalized_channel == "EMAIL":
            normalized_identifier = normalized_identifier.lower()

        logger.info(
            f"[IdentityResolver] Resolving tenant={tenant_id} channel={normalized_channel} "
            f"id={normalized_identifier[:4]}*** verified={verified}"
        )

        # 1. Check existing identity mapping
        stmt = (
            select(CustomerIdentity)
            .where(
                CustomerIdentity.tenant_id == tenant_id,
                CustomerIdentity.channel == normalized_channel,
                CustomerIdentity.identifier == normalized_identifier,
            )
        )
        res = await self.db.execute(stmt)
        existing_identity = res.scalar_one_or_none()

        if existing_identity:
            # Fetch customer
            customer_stmt = select(Customer).where(Customer.id == existing_identity.customer_id)
            c_res = await self.db.execute(customer_stmt)
            customer = c_res.scalar_one_or_none()

            # Upgrade status if now verified
            if verified and existing_identity.verification_status != IdentityVerificationStatus.KNOWN.value:
                existing_identity.verification_status = IdentityVerificationStatus.KNOWN.value
                existing_identity.verified_at = datetime.now(timezone.utc)
                await self.db.flush()

            status = IdentityVerificationStatus(existing_identity.verification_status)
            return ResolvedCustomerIdentity(
                customer=customer,
                identity=existing_identity,
                status=status,
                is_new=False,
                requires_verification_for_sensitive_ops=(status != IdentityVerificationStatus.KNOWN),
            )

        # 2. Check if primary email/phone directly matches an existing Customer record
        matched_customer: Customer | None = None
        if normalized_channel == "PHONE":
            match_stmt = select(Customer).where(
                Customer.tenant_id == tenant_id,
                Customer.primary_phone == normalized_identifier,
            )
            matched_customer = (await self.db.execute(match_stmt)).scalar_one_or_none()
        elif normalized_channel == "EMAIL":
            match_stmt = select(Customer).where(
                Customer.tenant_id == tenant_id,
                Customer.primary_email == normalized_identifier,
            )
            matched_customer = (await self.db.execute(match_stmt)).scalar_one_or_none()

        confidence = (
            IdentityVerificationStatus.KNOWN if verified
            else IdentityVerificationStatus.PROBABLE if matched_customer
            else IdentityVerificationStatus.UNKNOWN
        )

        # 3. Create or link customer
        if not matched_customer:
            matched_customer = Customer(
                tenant_id=tenant_id,
                name=caller_name or f"Customer ({normalized_identifier[-4:] if len(normalized_identifier) >= 4 else 'New'})",
                primary_phone=normalized_identifier if normalized_channel == "PHONE" else None,
                primary_email=normalized_identifier if normalized_channel == "EMAIL" else None,
                status="ACTIVE",
                metadata_={"source_channel": normalized_channel},
            )
            self.db.add(matched_customer)
            await self.db.flush()

        # 4. Record new CustomerIdentity
        new_identity = CustomerIdentity(
            tenant_id=tenant_id,
            customer_id=matched_customer.id,
            channel=normalized_channel,
            identifier=normalized_identifier,
            verification_status=confidence.value,
            verified_at=datetime.now(timezone.utc) if verified else None,
        )
        self.db.add(new_identity)
        await self.db.flush()

        return ResolvedCustomerIdentity(
            customer=matched_customer,
            identity=new_identity,
            status=confidence,
            is_new=True,
            requires_verification_for_sensitive_ops=(confidence != IdentityVerificationStatus.KNOWN),
        )
