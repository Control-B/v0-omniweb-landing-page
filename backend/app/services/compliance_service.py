"""Compliance, PII Anonymization & Secret Hygiene Service.

Provides deterministic PII sanitization and GDPR/CCPA data privacy invariants:
1. PII Redaction across conversation transcripts and audit events:
   - Phone numbers -> [PHONE_REDACTED]
   - Email addresses -> [EMAIL_REDACTED]
   - Credit card / PAN numbers -> [CARD_REDACTED]
   - SSN / Tax IDs -> [SSN_REDACTED]
   - API keys and Bearer tokens -> [SECRET_REDACTED]
2. GDPR "Right to be Forgotten" Customer Anonymization
3. Tenant isolation verification checks
"""
from __future__ import annotations

import re
from typing import Any
import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.models import Customer, CustomerIdentity

logger = get_logger(__name__)

# Regular expressions for PII detection
EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")
PHONE_REGEX = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
CARD_REGEX = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
SSN_REGEX = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
SECRET_REGEX = re.compile(r"\b(?:sk_[a-zA-Z0-9_]{20,}|whsec_[a-zA-Z0-9]{20,}|Bearer\s+[a-zA-Z0-9_\-\.]{20,})\b")


class ComplianceService:
    """Enterprise compliance coordinator for data privacy and secret hygiene."""

    @staticmethod
    def redact_pii_and_secrets(text: str) -> str:
        """Sanitize text by replacing sensitive PII and secrets with safe markers."""
        if not text:
            return ""

        # Redact secrets first
        sanitized = SECRET_REGEX.sub("[SECRET_REDACTED]", text)
        # Redact SSN
        sanitized = SSN_REGEX.sub("[SSN_REDACTED]", sanitized)
        # Redact credit card numbers
        sanitized = CARD_REGEX.sub("[CARD_REDACTED]", sanitized)
        # Redact emails
        sanitized = EMAIL_REGEX.sub("[EMAIL_REDACTED]", sanitized)
        # Redact phone numbers
        sanitized = PHONE_REGEX.sub("[PHONE_REDACTED]", sanitized)

        return sanitized

    @staticmethod
    def sanitize_payload(payload: dict[str, Any]) -> dict[str, Any]:
        """Recursively redact sensitive values within arbitrary dictionaries."""
        sanitized = {}
        for k, v in payload.items():
            if isinstance(v, str):
                sanitized[k] = ComplianceService.redact_pii_and_secrets(v)
            elif isinstance(v, dict):
                sanitized[k] = ComplianceService.sanitize_payload(v)
            elif isinstance(v, list):
                sanitized[k] = [
                    ComplianceService.redact_pii_and_secrets(x) if isinstance(x, str) else x
                    for x in v
                ]
            else:
                sanitized[k] = v
        return sanitized

    async def anonymize_customer(
        self,
        *,
        tenant_id: str,
        customer_id: str,
        session: AsyncSession,
    ) -> bool:
        """Execute GDPR Right-to-be-Forgotten: wipe personal attributes and detach identities."""
        tenant_uuid = uuid.UUID(tenant_id)
        cust_uuid = uuid.UUID(customer_id)

        # 1. Fetch customer
        stmt = select(Customer).where(
            Customer.id == cust_uuid,
            Customer.tenant_id == tenant_uuid,
        )
        res = await session.execute(stmt)
        cust = res.scalars().first()

        if not cust:
            return False

        # Anonymize profile
        cust.name = f"Anonymized Customer {str(cust_uuid)[:8]}"
        cust.email = f"anonymized_{str(cust_uuid)[:8]}@privacy.local"
        cust.phone_number = "+10000000000"
        cust.custom_attributes = {"gdpr_erased": True}
        cust.status = "ANONYMIZED"

        # Anonymize linked identities
        ident_stmt = select(CustomerIdentity).where(
            CustomerIdentity.customer_id == cust_uuid,
            CustomerIdentity.tenant_id == tenant_uuid,
        )
        ident_res = await session.execute(ident_stmt)
        for ident in ident_res.scalars().all():
            ident.identifier = f"masked_{ident.id}"
            ident.verification_status = "UNKNOWN"

        await session.flush()
        logger.warning(
            f"[ComplianceService] GDPR erasure executed for customer {customer_id} in tenant {tenant_id}"
        )
        return True


_compliance_service = ComplianceService()


def get_compliance_service() -> ComplianceService:
    """Singleton getter for ComplianceService."""
    return _compliance_service
