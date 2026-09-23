"""Supervisor / Router Agent.

Core intelligence router responsible for:
1. Intent & context classification.
2. Specialist agent selection and delegation.
3. Policy awareness & pre-execution approval checks.
4. Escalation triggers (frustration, explicit request, high-risk flags).
"""
from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field

from app.core.logging import get_logger
from app.orchestration.langgraph.state import CustomerOperationState
from app.orchestration.specialists.account_agent import CustomerAccountAgent
from app.orchestration.specialists.base import AgentExecutionOutput, BaseSpecialistAgent
from app.orchestration.specialists.billing_agent import BillingAgent
from app.orchestration.specialists.case_agent import CaseManagementAgent
from app.orchestration.specialists.escalation_agent import HumanEscalationAgent
from app.orchestration.specialists.scheduling_agent import SchedulingAgent
from app.orchestration.specialists.support_agent import SupportAgent

logger = get_logger(__name__)


class RoutingDecision(BaseModel):
    """Structured routing outcome produced by Supervisor Router."""
    target_agent_id: str
    intent: str
    confidence: float
    reasoning: str
    requires_approval: bool = False
    requires_escalation: bool = False


class SupervisorRouter:
    """Supervisor Agent that coordinates the specialist fleet."""

    def __init__(self):
        self.specialists: dict[str, BaseSpecialistAgent] = {
            "account_agent": CustomerAccountAgent(),
            "billing_agent": BillingAgent(),
            "scheduling_agent": SchedulingAgent(),
            "support_agent": SupportAgent(),
            "case_agent": CaseManagementAgent(),
            "escalation_agent": HumanEscalationAgent(),
        }

    def route(self, state: CustomerOperationState) -> RoutingDecision:
        """Deterministically route interaction based on intent and safety signals."""
        messages = state.get("messages", [])
        last_message = (messages[-1]["content"] if messages else "").lower()

        # 1. Escalation check (highest priority)
        escalation_keywords = ["human", "agent", "supervisor", "representative", "manager", "speak to someone"]
        if any(k in last_message for k in escalation_keywords):
            return RoutingDecision(
                target_agent_id="escalation_agent",
                intent="human_escalation",
                confidence=1.0,
                reasoning="Customer explicitly requested human intervention.",
                requires_escalation=True,
            )

        # 2. Billing & Dispute check
        billing_keywords = ["charged", "refund", "invoice", "payment", "bill", "subscription", "price", "cost"]
        if any(k in last_message for k in billing_keywords):
            return RoutingDecision(
                target_agent_id="billing_agent",
                intent="billing_dispute" if any(x in last_message for x in ["twice", "double", "wrong", "error"]) else "billing_inquiry",
                confidence=0.95,
                reasoning="Customer message contains billing, transaction, or refund keywords.",
            )

        # 3. Scheduling check
        scheduling_keywords = ["appointment", "schedule", "book", "meeting", "slot", "reschedule", "calendar"]
        if any(k in last_message for k in scheduling_keywords):
            return RoutingDecision(
                target_agent_id="scheduling_agent",
                intent="appointment_booking",
                confidence=0.95,
                reasoning="Customer message contains appointment or scheduling keywords.",
            )

        # 4. Support check
        support_keywords = ["broken", "error", "troubleshoot", "help", "how do i", "not working", "setup", "docs"]
        if any(k in last_message for k in support_keywords):
            return RoutingDecision(
                target_agent_id="support_agent",
                intent="technical_support",
                confidence=0.90,
                reasoning="Customer inquiry requires technical diagnosis or documentation retrieval.",
            )

        # 5. Account check
        account_keywords = ["profile", "email", "phone", "address", "update info", "account"]
        if any(k in last_message for k in account_keywords):
            return RoutingDecision(
                target_agent_id="account_agent",
                intent="account_update",
                confidence=0.90,
                reasoning="Customer message refers to account management.",
            )

        # 6. Default to Case Agent for general inquiry tracking
        return RoutingDecision(
            target_agent_id="case_agent",
            intent="general_inquiry",
            confidence=0.85,
            reasoning="Default general inquiry routed to Case Management Agent for tracking.",
        )

    async def execute_turn(self, state: CustomerOperationState) -> AgentExecutionOutput:
        """Route to target specialist and execute turn."""
        decision = self.route(state)
        logger.info(f"[Supervisor] Routing to agent='{decision.target_agent_id}' intent='{decision.intent}'")

        specialist = self.specialists.get(decision.target_agent_id) or self.specialists["case_agent"]
        state["intent"] = decision.intent
        state["confidence"] = decision.confidence
        state["active_agent"] = decision.target_agent_id

        return await specialist.process(state)
