"""Customer Account Specialist Agent.

Responsibilities:
- Retrieve customer account profile and verified contact details.
- Update communication preferences and notification channels.
- Identity resolution confirmation.

Strictly Prohibited:
- Consequential financial actions (refunds, subscription cancellations).
"""
from __future__ import annotations

from app.orchestration.langgraph.state import CustomerOperationState
from app.orchestration.specialists.base import (
    ActionProposal,
    AgentExecutionOutput,
    BaseSpecialistAgent,
)


class CustomerAccountAgent(BaseSpecialistAgent):
    """Specialist agent for account management and customer details."""

    def __init__(self):
        super().__init__(
            agent_id="account_agent",
            name="Customer Account Agent",
            allowed_tools={
                "crm_lookup_customer",
                "crm_update_customer",
                "crm_get_contact_history",
                "crm_verify_identity",
            },
            prohibited_tools={
                "billing_issue_refund",
                "billing_cancel_subscription",
                "calendar_delete_event",
            },
        )

    async def process(self, state: CustomerOperationState) -> AgentExecutionOutput:
        customer_ctx = state.get("customer_context", {})
        customer_name = customer_ctx.get("name", "valued customer")
        customer_email = customer_ctx.get("email")

        # Propose reading customer history if not loaded
        proposals: list[ActionProposal] = []
        if not customer_ctx.get("history_loaded") and state.get("customer_id"):
            proposals.append(
                ActionProposal(
                    tool_name="crm_get_contact_history",
                    parameters={"customer_id": state["customer_id"]},
                    reasoning="Retrieve historical customer interactions to provide tailored assistance.",
                    requires_approval=False,
                )
            )

        return AgentExecutionOutput(
            agent_id=self.agent_id,
            response_message=f"I have accessed your account details, {customer_name}. How can I assist with your profile or preferences today?",
            proposed_actions=proposals,
            confidence=0.95,
            updated_context={"active_specialist": self.agent_id},
        )
