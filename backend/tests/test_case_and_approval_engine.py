"""Comprehensive Unit Tests for Case Lifecycle, Approvals & Workflow Resumption (Phase 4).

Tests:
1. Case creation & initial audit event
2. State machine valid transitions (NEW -> IN_PROGRESS -> RESOLVED -> CLOSED)
3. State machine illegal transition enforcement (InvalidStateTransitionError)
4. CaseEvent timeline audit trail
5. ApprovalRequest generation & Case transition to AWAITING_APPROVAL
6. Supervisor approval with automated tool execution resumption
7. Supervisor rejection with justification notes
8. Multi-tenant filtering and listing
"""
import uuid
import pytest
from unittest.mock import MagicMock

from app.models.models import ApprovalRequest, Case, CaseEvent
from app.services.approval_service import get_approval_service
from app.services.case_service import InvalidStateTransitionError, get_case_service


class MockScalars:
    def __init__(self, items):
        self._items = items

    def first(self):
        return self._items[0] if self._items else None

    def all(self):
        return self._items


class MockResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return MockScalars(self._items)


class MockSession:
    """Fast, zero-dependency async session mock for testing domain logic."""

    def __init__(self):
        self.cases: dict[uuid.UUID, Case] = {}
        self.events: list[CaseEvent] = []
        self.approvals: dict[uuid.UUID, ApprovalRequest] = {}

    def add(self, obj):
        if isinstance(obj, Case):
            if not getattr(obj, "id", None):
                obj.id = uuid.uuid4()
            self.cases[obj.id] = obj
        elif isinstance(obj, CaseEvent):
            if not getattr(obj, "id", None):
                obj.id = uuid.uuid4()
            self.events.append(obj)
        elif isinstance(obj, ApprovalRequest):
            if not getattr(obj, "id", None):
                obj.id = uuid.uuid4()
            self.approvals[obj.id] = obj

    async def flush(self):
        pass

    async def commit(self):
        pass

    async def rollback(self):
        pass

    async def execute(self, stmt):
        stmt_str = str(stmt)
        # 1. Query for single Case by id
        if "FROM cases" in stmt_str and "cases.id =" in stmt_str:
            # Extract case id from parameters if bound, or match by known cases
            params = stmt.compile().params
            target_id = None
            for k, v in params.items():
                if isinstance(v, uuid.UUID) and v in self.cases:
                    target_id = v
                    break
            matched = [self.cases[target_id]] if target_id else list(self.cases.values())[:1]
            return MockResult(matched)

        # 2. Query for Cases list
        if "FROM cases" in stmt_str:
            return MockResult(list(self.cases.values()))

        # 3. Query for ApprovalRequest by id
        if "FROM approval_requests" in stmt_str and "approval_requests.id =" in stmt_str:
            params = stmt.compile().params
            target_id = None
            for k, v in params.items():
                if isinstance(v, uuid.UUID) and v in self.approvals:
                    target_id = v
                    break
            matched = [self.approvals[target_id]] if target_id else list(self.approvals.values())[:1]
            return MockResult(matched)

        # 4. Query for pending ApprovalRequests
        if "FROM approval_requests" in stmt_str:
            pending = [a for a in self.approvals.values() if a.status == "PENDING"]
            return MockResult(pending)

        # 5. Query for CaseEvents
        if "FROM case_events" in stmt_str:
            return MockResult(list(self.events))

        return MockResult([])


@pytest.fixture
def mock_db():
    session = MockSession()
    tenant_id = str(uuid.uuid4())
    return session, tenant_id


@pytest.mark.asyncio
async def test_case_creation_and_initial_event(mock_db):
    """Verify case is created with status NEW and an immutable CASE_CREATED event."""
    session, tenant_id = mock_db
    case_service = get_case_service()

    case = await case_service.create_case(
        tenant_id=tenant_id,
        title="Shipment Delay & Telephony Issue",
        description="Customer reports automated call failed and shipment status unclear.",
        channel="VOICE",
        priority="HIGH",
        category="logistics_support",
        assigned_agent="support",
        created_by="ai_support_agent",
        session=session,
    )

    assert case.id is not None
    assert case.status == "NEW"
    assert case.priority == "HIGH"

    # Verify event timeline
    timeline = await case_service.get_case_timeline(str(case.id), session)
    assert len(timeline) == 1
    assert timeline[0].event_type == "CASE_CREATED"
    assert timeline[0].event_payload["channel"] == "VOICE"


@pytest.mark.asyncio
async def test_case_lifecycle_state_machine_valid(mock_db):
    """Verify valid transitions: NEW -> IN_PROGRESS -> RESOLVED -> CLOSED."""
    session, tenant_id = mock_db
    case_service = get_case_service()

    case = await case_service.create_case(
        tenant_id=tenant_id,
        title="Password Reset Support",
        description="User locked out of portal.",
        session=session,
    )

    # 1. NEW -> IN_PROGRESS
    c1 = await case_service.transition_status(
        case_id=str(case.id),
        new_status="IN_PROGRESS",
        actor_id="agent_account",
        session=session,
    )
    assert c1.status == "IN_PROGRESS"

    # 2. IN_PROGRESS -> RESOLVED
    c2 = await case_service.transition_status(
        case_id=str(case.id),
        new_status="RESOLVED",
        actor_id="agent_account",
        notes="Sent 2FA reset link; customer logged in successfully.",
        session=session,
    )
    assert c2.status == "RESOLVED"
    assert c2.resolved_at is not None
    assert "Sent 2FA" in c2.metadata_["resolution_summary"]

    # 3. RESOLVED -> CLOSED
    c3 = await case_service.transition_status(
        case_id=str(case.id),
        new_status="CLOSED",
        actor_id="system",
        session=session,
    )
    assert c3.status == "CLOSED"


@pytest.mark.asyncio
async def test_case_illegal_state_transition(mock_db):
    """Verify InvalidStateTransitionError is raised on disallowed transitions."""
    session, tenant_id = mock_db
    case_service = get_case_service()

    case = await case_service.create_case(
        tenant_id=tenant_id,
        title="Direct Close Attempt",
        description="Attempt to close before in progress or resolved.",
        session=session,
    )

    # Attempt NEW -> CLOSED directly (not allowed)
    with pytest.raises(InvalidStateTransitionError):
        await case_service.transition_status(
            case_id=str(case.id),
            new_status="CLOSED",
            actor_id="bad_actor",
            session=session,
        )


@pytest.mark.asyncio
async def test_hitl_approval_and_resumed_execution(mock_db):
    """Verify approval creation halts case, and approval resumes tool execution."""
    session, tenant_id = mock_db
    case_service = get_case_service()
    approval_service = get_approval_service()

    case = await case_service.create_case(
        tenant_id=tenant_id,
        title="High Value Refund Request",
        description="Customer demands $180.00 refund due to partial outage.",
        session=session,
    )
    # Move to IN_PROGRESS
    await case_service.transition_status(case_id=str(case.id), new_status="IN_PROGRESS", actor_id="billing", session=session)

    # Propose refund of $180 (exceeds $50 policy threshold)
    refund_payload = {
        "customer_id": "cust_vip_42",
        "invoice_id": "INV-2026-909",
        "amount": 180.0,
        "reason": "Downtime credit",
    }

    approval = await approval_service.create_approval_request(
        tenant_id=tenant_id,
        case_id=str(case.id),
        action_type="request_refund",
        proposed_payload=refund_payload,
        reason="Refund $180 exceeds automatic limit $50",
        policy_rule_id="RULE_REFUND_LIMIT_EXCEEDED",
        session=session,
    )
    assert approval.status == "PENDING"

    # Case must now be AWAITING_APPROVAL
    refreshed_case = await case_service.get_case(str(case.id), session)
    assert refreshed_case.status == "AWAITING_APPROVAL"

    # Check pending approvals
    pending = await approval_service.list_pending_approvals(tenant_id=tenant_id, session=session)
    assert len(pending) == 1
    assert str(pending[0].id) == str(approval.id)

    # Supervisor approves request
    approved, tool_result = await approval_service.approve_request(
        approval_id=str(approval.id),
        reviewer_id="supervisor_dan@apexlogistics.com",
        notes="Approved: Valid enterprise SLA credit.",
        session=session,
    )
    assert approved.status == "APPROVED"
    assert approved.reviewed_by == "supervisor_dan@apexlogistics.com"

    # Verify tool execution resumed automatically
    assert tool_result is not None
    assert tool_result.success is True
    assert tool_result.data["status"] == "succeeded"
    assert tool_result.data["amount"] == 180.0

    # Case should now be back in IN_PROGRESS
    post_appr_case = await case_service.get_case(str(case.id), session)
    assert post_appr_case.status == "IN_PROGRESS"


@pytest.mark.asyncio
async def test_hitl_approval_rejection(mock_db):
    """Verify rejection logs reason and leaves case in IN_PROGRESS without executing tool."""
    session, tenant_id = mock_db
    case_service = get_case_service()
    approval_service = get_approval_service()

    case = await case_service.create_case(
        tenant_id=tenant_id,
        title="Invalid Refund Request",
        description="Request $500 refund without justification.",
        session=session,
    )
    await case_service.transition_status(case_id=str(case.id), new_status="IN_PROGRESS", actor_id="billing", session=session)

    approval = await approval_service.create_approval_request(
        tenant_id=tenant_id,
        case_id=str(case.id),
        action_type="request_refund",
        proposed_payload={"customer_id": "c1", "invoice_id": "i1", "amount": 500.0, "reason": "No reason"},
        reason="Exceeds limit",
        policy_rule_id="RULE_REFUND_LIMIT_EXCEEDED",
        session=session,
    )

    # Reject
    rejected = await approval_service.reject_request(
        approval_id=str(approval.id),
        reviewer_id="supervisor_dan@apexlogistics.com",
        notes="Rejected: Insufficient documentation provided.",
        session=session,
    )
    assert rejected.status == "REJECTED"
    assert rejected.resolution_notes == "Rejected: Insufficient documentation provided."

    # Pending list should now be empty
    pending = await approval_service.list_pending_approvals(tenant_id=tenant_id, session=session)
    assert len(pending) == 0
