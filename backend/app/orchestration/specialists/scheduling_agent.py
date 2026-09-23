"""Scheduling Specialist Agent.

Responsibilities:
- Query business calendar availability and upcoming appointments.
- Book, reschedule, and cancel appointment slots.
- Enforce business operating hours and buffer times.

Strictly Prohibited:
- Financial transactions, invoice modifications, refund proposals.
"""
from __future__ import annotations

from app.orchestration.langgraph.state import CustomerOperationState
from app.orchestration.specialists.base import (
    ActionProposal,
    AgentExecutionOutput,
    BaseSpecialistAgent,
)


class SchedulingAgent(BaseSpecialistAgent):
    """Specialist agent for appointments and calendar management."""

    def __init__(self):
        super().__init__(
            agent_id="scheduling_agent",
            name="Scheduling Agent",
            allowed_tools={
                "calendar_check_availability",
                "calendar_book_slot",
                "calendar_reschedule_slot",
                "calendar_cancel_slot",
            },
            prohibited_tools={
                "billing_propose_refund",
                "billing_issue_refund",
                "billing_cancel_subscription",
            },
        )

    async def process(self, state: CustomerOperationState) -> AgentExecutionOutput:
        proposals = [
            ActionProposal(
                tool_name="calendar_check_availability",
                parameters={"tenant_id": state.get("tenant_id")},
                reasoning="Check upcoming available time slots for the customer.",
                requires_approval=False,
            )
        ]

        return AgentExecutionOutput(
            agent_id=self.agent_id,
            response_message="I'm checking our calendar for the earliest available appointments. What date or time works best for you?",
            proposed_actions=proposals,
            confidence=0.95,
            updated_context={"scheduling_active": True},
        )
