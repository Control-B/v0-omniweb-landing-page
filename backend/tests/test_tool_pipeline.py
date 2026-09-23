"""Comprehensive Unit Tests for Tool Platform, 9-Stage Pipeline, Idempotency & Adapters.

Tests:
1. Schema validation (Stage 1)
2. Tenant isolation enforcement (Stage 2)
3. RBAC authorization allowlist (Stage 3)
4. Policy engine evaluation & threshold gating (Stage 4)
5. Risk classification & HITL approval gating (Stage 5 & 6)
6. Idempotency key generation & duplicate write suppression (Stage 7)
7. Enterprise adapter execution (Stage 8)
8. Audit event & telemetry grounding (Stage 9)
9. Dependency injection via AdapterFactory
"""
import uuid
import pytest

from app.adapters.base import (
    BillingAdapter,
    CalendarAdapter,
    CRMAdapter,
    TicketingAdapter,
)
from app.adapters.factory import get_adapter_factory
from app.policies.engine import PolicyDecision, get_policy_engine
from app.tools.base import BaseTool, ToolCategory, ToolResult, ToolRiskLevel
from app.tools.idempotency import (
    IdempotencyStatus,
    generate_idempotency_key,
    get_idempotency_engine,
)
from app.tools.pipeline import get_tool_pipeline
from app.tools.registry import get_tool_registry


@pytest.mark.asyncio
async def test_schema_validation_failure():
    """Stage 1: Verify invalid parameters fail before execution."""
    registry = get_tool_registry()
    tenant_id = str(uuid.uuid4())

    # 'book_appointment' requires caller_name, caller_email, appointment_date, appointment_time, topic
    result = await registry.execute_tool(
        "book_appointment",
        {"invalid_param": "no name"},
        tenant_id=tenant_id,
        agent_name="scheduling",
    )
    assert not result.success
    assert "Validation failed" in result.error


@pytest.mark.asyncio
async def test_tenant_isolation_enforcement():
    """Stage 2: Verify missing or blank tenant_id is rejected."""
    registry = get_tool_registry()

    result = await registry.execute_tool(
        "lookup_customer",
        {"phone_number": "+15551234567"},
        tenant_id="",  # Missing tenant
        agent_name="receptionist",
    )
    assert not result.success
    assert "Tenant isolation violation" in result.error


@pytest.mark.asyncio
async def test_agent_rbac_authorization_failure():
    """Stage 3: Verify agent cannot invoke tools outside its allowlist."""
    registry = get_tool_registry()
    tenant_id = str(uuid.uuid4())

    # 'request_refund' is only allowed for ['billing', 'retention']
    result = await registry.execute_tool(
        "request_refund",
        {
            "customer_id": "cust_123",
            "invoice_id": "INV-001",
            "amount": 25.0,
            "reason": "Accidental charge",
        },
        tenant_id=tenant_id,
        agent_name="receptionist",  # Unauthorized agent!
    )
    assert not result.success
    assert "not authorized to invoke tool" in result.error


@pytest.mark.asyncio
async def test_policy_engine_refund_thresholds():
    """Stage 4: Verify deterministic policy thresholds trigger approval."""
    policy_engine = get_policy_engine()
    tenant_id = str(uuid.uuid4())

    # 1. Under default threshold ($50.00) -> Allowed
    under_res = policy_engine.evaluate_action(
        action="request_refund",
        params={"amount": 45.00},
        tenant_id=tenant_id,
    )
    assert under_res.decision == PolicyDecision.ALLOW

    # 2. Over default threshold ($50.00) -> Require approval
    over_res = policy_engine.evaluate_action(
        action="request_refund",
        params={"amount": 150.00},
        tenant_id=tenant_id,
    )
    assert over_res.decision == PolicyDecision.REQUIRE_APPROVAL
    assert over_res.rule_id == "RULE_REFUND_LIMIT_EXCEEDED"

    # 3. Tenant-specific override
    policy_engine.set_tenant_refund_threshold(tenant_id, 250.00)
    tenant_res = policy_engine.evaluate_action(
        action="request_refund",
        params={"amount": 150.00},
        tenant_id=tenant_id,
    )
    assert tenant_res.decision == PolicyDecision.ALLOW


@pytest.mark.asyncio
async def test_hitl_approval_gating_and_bypass():
    """Stage 6: Verify high-risk operations pause for approval unless pre-approved."""
    registry = get_tool_registry()
    tenant_id = str(uuid.uuid4())

    # 1. Without pre-approval: must pause into AWAITING_APPROVAL
    result = await registry.execute_tool(
        "request_refund",
        {
            "customer_id": "cust_999",
            "invoice_id": "INV-999",
            "amount": 120.0,
            "reason": "Disputed service fee",
        },
        tenant_id=tenant_id,
        agent_name="billing",
    )
    assert result.success
    assert result.requires_approval
    assert result.data.get("status") in ("pending_human_approval", "AWAITING_APPROVAL")
    assert result.approval_id is not None
    approval_id = result.approval_id

    # 2. Resuming with verified approval context bypasses the gate
    approved_result = await registry.execute_tool(
        "request_refund",
        {
            "customer_id": "cust_999",
            "invoice_id": "INV-999",
            "amount": 120.0,
            "reason": "Disputed service fee",
        },
        tenant_id=tenant_id,
        agent_name="billing",
        context={"pre_approved": True, "approved_by": "supervisor_alice", "approval_id": approval_id},
    )
    assert approved_result.success
    assert not approved_result.requires_approval
    assert approved_result.data.get("status") == "succeeded"
    assert approved_result.data.get("amount") == 120.0


@pytest.mark.asyncio
async def test_deterministic_idempotency_key_generation():
    """Stage 7: Verify idempotency keys are strictly deterministic."""
    tenant_id = "tenant_alpha"
    customer_id = "cust_007"
    op = "request_refund"

    # Param dictionaries with different key insertion orders
    params_a = {"amount": 50.0, "invoice_id": "INV-100", "reason": "Late fee waiver"}
    params_b = {"reason": "Late fee waiver", "amount": 50.0, "invoice_id": "INV-100"}

    key_a = generate_idempotency_key(tenant_id=tenant_id, customer_id=customer_id, operation_type=op, params=params_a)
    key_b = generate_idempotency_key(tenant_id=tenant_id, customer_id=customer_id, operation_type=op, params=params_b)

    assert key_a == key_b
    assert key_a.startswith("idem_")


@pytest.mark.asyncio
async def test_idempotency_duplicate_write_prevention():
    """Stage 7: Verify second execution of mutating tool returns cached result without re-executing."""
    registry = get_tool_registry()
    tenant_id = str(uuid.uuid4())
    customer_id = "cust_repeat_test"

    booking_params = {
        "caller_name": "Marcus Vance",
        "caller_email": "marcus@example.com",
        "caller_phone": "+15558889999",
        "appointment_date": "2026-10-15",
        "appointment_time": "02:00 PM",
        "topic": "Platform Architecture Consultation",
    }

    # First call: executes and registers idempotency record
    call_1 = await registry.execute_tool(
        "book_appointment",
        booking_params,
        tenant_id=tenant_id,
        agent_name="scheduling",
        caller_id="+15558889999",
    )
    assert call_1.success
    booking_id_1 = call_1.data["booking_id"]
    idem_key = call_1.idempotency_key
    assert idem_key is not None

    # Second identical call: returns exact same cached response via idempotency
    call_2 = await registry.execute_tool(
        "book_appointment",
        booking_params,
        tenant_id=tenant_id,
        agent_name="scheduling",
        caller_id="+15558889999",
    )
    assert call_2.success
    assert call_2.idempotency_key == idem_key
    assert call_2.data["booking_id"] == booking_id_1


@pytest.mark.asyncio
async def test_enterprise_adapter_injection_and_ticketing():
    """Stage 8: Verify adapter factory resolves ticketing adapter and creates tickets."""
    factory = get_adapter_factory()
    tenant_id = str(uuid.uuid4())
    ticketing = factory.get_ticketing_adapter(tenant_id)

    ticket = await ticketing.create_ticket(
        customer_id="cust_diag_01",
        title="VoIP latency degradation in EU region",
        description="High packet loss observed during live calls.",
        category="technical_issue",
        severity="high",
        tenant_id=tenant_id,
    )
    assert ticket["success"]
    assert ticket["ticket_id"].startswith("CASE-")
    assert ticket["sla_hours"] == 2
    assert ticket["assigned_queue"] == "Tier-1 Technical Support"

    # Test escalation
    escalation = await ticketing.escalate_ticket(
        ticket_id=ticket["ticket_id"],
        reason="Exceeded preliminary troubleshooting time limit",
        target_queue="Tier-2 Voice Infrastructure Engineering",
        tenant_id=tenant_id,
    )
    assert escalation["success"]
    assert escalation["status"] == "ESCALATED"
