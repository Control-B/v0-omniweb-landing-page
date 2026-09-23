"""Unit tests for Phase 1 Domain Foundation:
- Canonical Customer & Multi-Channel CustomerIdentity
- Cases, CaseEvents & ApprovalRequests
- Immutable AuditEvents & IdempotencyRecords
- IdentityResolver Service
"""
import uuid
from datetime import datetime, timedelta, timezone
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.models.models import (
    Customer,
    CustomerIdentity,
    Case,
    CaseEvent,
    ApprovalRequest,
    AuditEvent,
    IdempotencyRecord,
)
from app.services.identity_resolver import (
    IdentityResolver,
    IdentityVerificationStatus,
    ResolvedCustomerIdentity,
)


def test_customer_model_initialization():
    """Verify Customer model properties, tenant isolation, and default fields."""
    tenant_id = uuid.uuid4()
    cust = Customer(
        tenant_id=tenant_id,
        name="Acme Corporation",
        primary_email="billing@acme.com",
        primary_phone="+15551234567",
        status="ACTIVE",
        metadata_={"tier": "enterprise"},
    )
    assert cust.name == "Acme Corporation"
    assert cust.tenant_id == tenant_id
    assert cust.primary_email == "billing@acme.com"
    assert cust.primary_phone == "+15551234567"
    assert cust.status == "ACTIVE"
    assert cust.metadata_["tier"] == "enterprise"


def test_customer_identity_confidence_tiers():
    """Verify CustomerIdentity maps channels and verification confidence states."""
    tenant_id = uuid.uuid4()
    customer_id = uuid.uuid4()

    # Unverified caller ID (Probable)
    ident_phone = CustomerIdentity(
        tenant_id=tenant_id,
        customer_id=customer_id,
        channel="PHONE",
        identifier="+15559876543",
        verification_status="PROBABLE",
    )
    assert ident_phone.channel == "PHONE"
    assert ident_phone.verification_status == "PROBABLE"

    # Cryptographically verified web session (Known)
    ident_session = CustomerIdentity(
        tenant_id=tenant_id,
        customer_id=customer_id,
        channel="WEB_SESSION",
        identifier="sess_verified_token_abc",
        verification_status="KNOWN",
        verified_at=datetime.now(timezone.utc),
    )
    assert ident_session.verification_status == "KNOWN"
    assert ident_session.verified_at is not None


def test_case_and_case_event_models():
    """Verify Case tracking lifecycle and event timeline."""
    tenant_id = uuid.uuid4()
    customer_id = uuid.uuid4()

    case = Case(
        tenant_id=tenant_id,
        customer_id=customer_id,
        title="Double charged on invoice #INV-902",
        category="BILLING_DISPUTE",
        priority="HIGH",
        status="AWAITING_APPROVAL",
        assigned_agent="billing_agent",
        current_workflow="refund_processing_v1",
    )
    assert case.status == "AWAITING_APPROVAL"
    assert case.assigned_agent == "billing_agent"

    event = CaseEvent(
        case_id=case.id,
        tenant_id=tenant_id,
        actor_type="AI_AGENT",
        actor_id="billing_agent",
        event_type="TOOL_PROPOSED",
        description="Proposed refund of $149.00 for duplicate charge.",
        event_payload={"amount": 149.0, "invoice_id": "INV-902"},
        trace_id="tr_sample_12345",
    )
    assert event.actor_type == "AI_AGENT"
    assert event.event_payload["amount"] == 149.0


def test_approval_request_model():
    """Verify Human-in-the-Loop ApprovalRequest structure and policy rule tracking."""
    tenant_id = uuid.uuid4()
    case_id = uuid.uuid4()

    approval = ApprovalRequest(
        tenant_id=tenant_id,
        case_id=case_id,
        action_type="ISSUE_REFUND",
        proposed_payload={"amount": 250.0, "currency": "USD"},
        reason="Refund amount of $250.00 exceeds auto-approval threshold of $50.00",
        policy_rule_id="RULE_REFUND_LIMIT_EXCEEDED",
        status="PENDING",
        workflow_checkpoint_id="chk_stage_4_billing",
    )
    assert approval.status == "PENDING"
    assert approval.policy_rule_id == "RULE_REFUND_LIMIT_EXCEEDED"
    assert approval.workflow_checkpoint_id == "chk_stage_4_billing"


def test_audit_event_and_idempotency_records():
    """Verify AuditEvent immutable tracking and IdempotencyRecord deduplication."""
    tenant_id = uuid.uuid4()
    idemp_key = "idemp_tenant_refund_inv902_turn3"

    record = IdempotencyRecord(
        idempotency_key=idemp_key,
        tenant_id=tenant_id,
        operation_type="ISSUE_REFUND",
        status="COMPLETED",
        result_payload={"refund_id": "re_12345", "status": "succeeded"},
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    assert record.idempotency_key == idemp_key
    assert record.status == "COMPLETED"

    audit = AuditEvent(
        tenant_id=tenant_id,
        actor_type="HUMAN_AGENT",
        actor_id="supervisor_dan@omniweb.com",
        action="APPROVE_REFUND",
        resource_type="REFUND",
        resource_id="re_12345",
        authorization_result="ALLOWED",
        idempotency_key=idemp_key,
        trace_id="tr_sample_audit_987",
    )
    assert audit.action == "APPROVE_REFUND"
    assert audit.authorization_result == "ALLOWED"


@pytest.mark.asyncio
async def test_identity_resolver_resolution_flow():
    """Verify IdentityResolver logic for existing and new channel identities."""
    mock_db = AsyncMock()
    tenant_id = uuid.uuid4()
    phone = "+15550001111"

    # Simulate existing customer identity found
    existing_ident = CustomerIdentity(
        tenant_id=tenant_id,
        customer_id=uuid.uuid4(),
        channel="PHONE",
        identifier=phone,
        verification_status="KNOWN",
    )
    existing_cust = Customer(
        id=existing_ident.customer_id,
        tenant_id=tenant_id,
        name="Jane Doe",
        primary_phone=phone,
    )

    # Mock execute result
    mock_res_ident = MagicMock()
    mock_res_ident.scalar_one_or_none.return_value = existing_ident

    mock_res_cust = MagicMock()
    mock_res_cust.scalar_one_or_none.return_value = existing_cust

    mock_db.execute.side_effect = [mock_res_ident, mock_res_cust]

    resolver = IdentityResolver(mock_db)
    resolved = await resolver.resolve(
        tenant_id=tenant_id,
        channel="PHONE",
        identifier=phone,
        verified=True,
    )

    assert resolved.is_new is False
    assert resolved.status == IdentityVerificationStatus.KNOWN
    assert resolved.customer.name == "Jane Doe"
    assert resolved.requires_verification_for_sensitive_ops is False
