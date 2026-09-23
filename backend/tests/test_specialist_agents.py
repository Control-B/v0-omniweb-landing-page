"""Unit tests for Phase 2: Agent Runtime, Supervisor Router & Specialist Fleet."""
import pytest
import uuid

from app.orchestration.langgraph.state import (
    CustomerOperationState,
    create_customer_operation_state,
)
from app.orchestration.specialists import (
    BillingAgent,
    CustomerAccountAgent,
    HumanEscalationAgent,
    SchedulingAgent,
    SupportAgent,
    SupervisorRouter,
    ToolAccessDeniedError,
)


def test_supervisor_routes_billing_dispute():
    """Verify Supervisor routes duplicate charge message to BillingAgent."""
    router = SupervisorRouter()
    state = create_customer_operation_state(
        tenant_id=str(uuid.uuid4()),
        initial_message="I was charged twice for my order #INV-492",
    )
    decision = router.route(state)
    assert decision.target_agent_id == "billing_agent"
    assert decision.intent == "billing_dispute"
    assert decision.confidence >= 0.9


def test_supervisor_routes_appointment_scheduling():
    """Verify Supervisor routes scheduling inquiries to SchedulingAgent."""
    router = SupervisorRouter()
    state = create_customer_operation_state(
        tenant_id=str(uuid.uuid4()),
        initial_message="Can I schedule an appointment for next Tuesday afternoon?",
    )
    decision = router.route(state)
    assert decision.target_agent_id == "scheduling_agent"
    assert decision.intent == "appointment_booking"


def test_supervisor_routes_technical_support():
    """Verify Supervisor routes technical issues to SupportAgent."""
    router = SupervisorRouter()
    state = create_customer_operation_state(
        tenant_id=str(uuid.uuid4()),
        initial_message="The integration is broken and not working. How do I troubleshoot this error?",
    )
    decision = router.route(state)
    assert decision.target_agent_id == "support_agent"
    assert decision.intent == "technical_support"


def test_supervisor_routes_human_escalation():
    """Verify Supervisor routes explicit human requests to HumanEscalationAgent."""
    router = SupervisorRouter()
    state = create_customer_operation_state(
        tenant_id=str(uuid.uuid4()),
        initial_message="I need to speak to a human supervisor right now.",
    )
    decision = router.route(state)
    assert decision.target_agent_id == "escalation_agent"
    assert decision.intent == "human_escalation"
    assert decision.requires_escalation is True


def test_tool_authorization_boundaries():
    """Verify strict least-privilege boundary enforcement across specialist agents."""
    sched_agent = SchedulingAgent()
    billing_agent = BillingAgent()
    support_agent = SupportAgent()

    # 1. SchedulingAgent can access calendar tools
    assert sched_agent.is_tool_authorized("calendar_book_slot") is True
    assert sched_agent.is_tool_authorized("calendar_check_availability") is True

    # 2. SchedulingAgent is BLOCKED from billing refund tools
    assert sched_agent.is_tool_authorized("billing_issue_refund") is False
    assert sched_agent.is_tool_authorized("billing_propose_refund") is False
    with pytest.raises(ToolAccessDeniedError):
        sched_agent.assert_tool_authorized("billing_issue_refund")

    # 3. BillingAgent is BLOCKED from calendar booking
    assert billing_agent.is_tool_authorized("calendar_book_slot") is False
    with pytest.raises(ToolAccessDeniedError):
        billing_agent.assert_tool_authorized("calendar_book_slot")

    # 4. SupportAgent is BLOCKED from refund and financial tools
    assert support_agent.is_tool_authorized("billing_issue_refund") is False
    with pytest.raises(ToolAccessDeniedError):
        support_agent.assert_tool_authorized("billing_issue_refund")


@pytest.mark.asyncio
async def test_billing_agent_duplicate_charge_proposal():
    """Verify BillingAgent proposes reading transactions when a double charge is reported."""
    billing_agent = BillingAgent()
    state = create_customer_operation_state(
        tenant_id=str(uuid.uuid4()),
        customer_id=str(uuid.uuid4()),
        initial_message="I was charged twice on my card.",
    )
    output = await billing_agent.process(state)

    assert output.agent_id == "billing_agent"
    assert len(output.proposed_actions) > 0
    assert output.proposed_actions[0].tool_name == "billing_get_transactions"
    assert output.proposed_actions[0].parameters["customer_id"] == state["customer_id"]


@pytest.mark.asyncio
async def test_supervisor_turn_execution():
    """Verify end-to-end supervisor execution of a turn."""
    router = SupervisorRouter()
    state = create_customer_operation_state(
        tenant_id=str(uuid.uuid4()),
        initial_message="Can I book a consultation meeting?",
    )
    output = await router.execute_turn(state)

    assert state["active_agent"] == "scheduling_agent"
    assert output.agent_id == "scheduling_agent"
    assert len(output.proposed_actions) > 0
    assert output.proposed_actions[0].tool_name == "calendar_check_availability"
