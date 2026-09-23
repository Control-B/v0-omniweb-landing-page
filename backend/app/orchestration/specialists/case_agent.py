"""Case Management Specialist Agent.

Responsibilities:
- Create first-class customer operations cases.
- Update case status, priority, and assigned owner.
- Record structured case events on the immutable timeline.

Strictly Prohibited:
- Executing payments or issuing refunds directly.
"""
from __future__ import annotations

from app.orchestration.langgraph.state import CustomerOperationState
from app.orchestration.specialists.base import (
    ActionProposal,
    AgentExecutionOutput,
    BaseSpecialistAgent,
)


class CaseManagementAgent(BaseSpecialistAgent):
    """Specialist agent for case lifecycle management."""

    def __init__(self):
        super().__init__(
            agent_id="case_agent",
            name="Case Management Agent",
            allowed_tools={
                "case_create_ticket",
                "case_update_status",
                "case_add_event",
                "case_assign_agent",
                "case_get_details",
            },
            prohibited_tools={
                "billing_issue_refund",
                "billing_cancel_subscription",
                "calendar_cancel_slot",
            },
        )

    async def process(self, state: CustomerOperationState) -> AgentExecutionOutput:
        case_id = state.get("case_id")
        proposals: list[ActionProposal] = []

        if not case_id:
            # Create a case for this conversation
            proposals.append(
                ActionProposal(
                    tool_name="case_create_ticket",
                    parameters={
                        "tenant_id": state.get("tenant_id"),
                        "customer_id": state.get("customer_id"),
                        "title": f"Inquiry: {state.get('intent', 'General')}",
                        "category": state.get("intent", "GENERAL"),
                        "priority": "MEDIUM",
                    },
                    reasoning="Create a trackable operations case for this customer interaction.",
                    requires_approval=False,
                )
            )
            msg = "I've created an official operations case to track and resolve your request."
        else:
            proposals.append(
                ActionProposal(
                    tool_name="case_get_details",
                    parameters={"case_id": case_id},
                    reasoning="Fetch current case status and timeline events.",
                    requires_approval=False,
                )
            )
            msg = f"I'm tracking your open case ({case_id}) and updating the timeline."

        return AgentExecutionOutput(
            agent_id=self.agent_id,
            response_message=msg,
            proposed_actions=proposals,
            confidence=0.96,
            updated_context={"case_management_active": True},
        )
