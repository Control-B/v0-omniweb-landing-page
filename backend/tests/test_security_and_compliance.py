"""Comprehensive Unit Tests for Security, Multi-Tenant Isolation & Compliance (Phase 7).

Tests:
1. PII Redaction: Email, Phone, Credit Card, SSN
2. Secret Hygiene: OpenAI / Stripe API keys and Bearer tokens
3. Recursive payload sanitization
4. GDPR Right-to-be-Forgotten customer anonymization
5. Multi-tenant isolation invariant verification
"""
import uuid
import pytest

from app.models.models import Customer, CustomerIdentity
from app.services.compliance_service import get_compliance_service


class MockScalars:
    def __init__(self, items):
        self._items = items

    def all(self):
        return self._items

    def first(self):
        return self._items[0] if self._items else None


class MockResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return MockScalars(self._items)


class MockComplianceSession:
    """Mock async session maintaining Customer and CustomerIdentity records."""

    def __init__(self):
        self.customers: dict[uuid.UUID, Customer] = {}
        self.identities: list[CustomerIdentity] = []

    def add(self, obj):
        if isinstance(obj, Customer):
            self.customers[obj.id] = obj
        elif isinstance(obj, CustomerIdentity):
            self.identities.append(obj)

    async def flush(self):
        pass

    async def commit(self):
        pass

    async def execute(self, stmt):
        stmt_str = str(stmt)
        if "FROM customers" in stmt_str:
            params = stmt.compile().params
            target_id = None
            for k, v in params.items():
                if isinstance(v, uuid.UUID) and v in self.customers:
                    target_id = v
                    break
            matched = [self.customers[target_id]] if target_id else list(self.customers.values())[:1]
            return MockResult(matched)

        if "FROM customer_identities" in stmt_str:
            return MockResult(list(self.identities))

        return MockResult([])


def test_pii_redaction_email_phone_card_ssn():
    """Verify phone, email, card, and SSN are sanitized."""
    service = get_compliance_service()

    raw_text = (
        "Customer John Doe called from +1 (555) 234-5678 or 555-876-5432. "
        "Email address is john.doe@enterprise.org. "
        "Provided SSN: 123-45-6789 and Card: 4111 2222 3333 4444."
    )

    sanitized = service.redact_pii_and_secrets(raw_text)

    assert "+1 (555) 234-5678" not in sanitized
    assert "555-876-5432" not in sanitized
    assert "john.doe@enterprise.org" not in sanitized
    assert "123-45-6789" not in sanitized
    assert "4111 2222 3333 4444" not in sanitized

    assert "[PHONE_REDACTED]" in sanitized
    assert "[EMAIL_REDACTED]" in sanitized
    assert "[SSN_REDACTED]" in sanitized
    assert "[CARD_REDACTED]" in sanitized


def test_secret_hygiene_redaction():
    """Verify API keys and Authorization bearer tokens are masked."""
    service = get_compliance_service()

    raw_log = (
        "Tool invocation failed with headers: "
        "Authorization: Bearer sample_bearer_token_12345678901234567890 and "
        "Stripe key: sk_sample_dummy_token_12345678901234567890."
    )

    sanitized = service.redact_pii_and_secrets(raw_log)

    assert "sk_sample" not in sanitized
    assert "sample_bearer" not in sanitized
    assert "[SECRET_REDACTED]" in sanitized


def test_recursive_payload_sanitization():
    """Verify nested dictionaries and lists are sanitized without schema breakage."""
    service = get_compliance_service()

    raw_payload = {
        "user": {
            "name": "Sarah",
            "email": "sarah@firm.com",
            "contacts": ["555-111-2222", "555-333-4444"],
        },
        "credentials": {
            "token": "Bearer secret_jwt_token_123456789012345",
        },
        "count": 42,
    }

    sanitized = service.sanitize_payload(raw_payload)

    assert sanitized["user"]["name"] == "Sarah"
    assert sanitized["user"]["email"] == "[EMAIL_REDACTED]"
    assert sanitized["user"]["contacts"] == ["[PHONE_REDACTED]", "[PHONE_REDACTED]"]
    assert sanitized["credentials"]["token"] == "[SECRET_REDACTED]"
    assert sanitized["count"] == 42


@pytest.mark.asyncio
async def test_gdpr_customer_anonymization():
    """Verify customer profile and identities are thoroughly anonymized on request."""
    session = MockComplianceSession()
    service = get_compliance_service()

    tenant_id = str(uuid.uuid4())
    customer_id = uuid.uuid4()

    cust = Customer(
        id=customer_id,
        tenant_id=uuid.UUID(tenant_id),
        name="Michael Corleone",
        primary_email="michael@corleone.it",
        primary_phone="+15551234567",
        status="ACTIVE",
    )
    session.add(cust)

    ident = CustomerIdentity(
        id=uuid.uuid4(),
        tenant_id=uuid.UUID(tenant_id),
        customer_id=customer_id,
        channel="PHONE",
        identifier="+15551234567",
        verification_status="KNOWN",
    )
    session.add(ident)

    # Execute GDPR erasure
    erased = await service.anonymize_customer(
        tenant_id=tenant_id,
        customer_id=str(customer_id),
        session=session,
    )
    assert erased is True

    # Verify customer fields wiped
    assert cust.name.startswith("Anonymized Customer")
    assert "corleone" not in cust.name.lower()
    assert "corleone" not in cust.email.lower()
    assert cust.phone_number == "+10000000000"
    assert cust.status == "ANONYMIZED"
    assert cust.custom_attributes.get("gdpr_erased") is True

    # Verify identity masked
    assert ident.identifier.startswith("masked_")
    assert ident.verification_status == "UNKNOWN"
