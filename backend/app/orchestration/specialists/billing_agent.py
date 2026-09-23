"""Billing Specialist Agent.

Responsibilities:
- Retrieve invoices, payment history, and subscription status.
- Analyze duplicate charges and transaction disputes.
- Propose refunds bounded by deterministic policy thresholds.

Strictly Prohibited:
- Deleting customer records, modifying appointments, executing direct unauthorized credits.
"""
from __future__ import annotations

from app.core.config import get_settings
from app.orchestration.langgraph.state import CustomerOperationState
from app.orchestration.specialists.base import (
    ActionProposal,
    AgentExecutionOutput,
    BaseSpecialistAgent,
)

settings = get_settings()


class BillingAgent(BaseSpecialistAgent):
    """Specialist agent for invoices, payments, dispute analysis, and refund proposals."""

    def __init__(self):
        super().__init__(
            agent_id="billing_agent",
            name="Billing Agent",
            allowed_tools={
                "billing_get_invoice",
                "billing_get_transactions",
                "billing_propose_refund",
                "billing_check_policy",
                "billing_get_subscription",
            },
            prohibited_tools={
                "calendar_book_slot",
                "crm_delete_customer",
                "case_close_unresolved",
            },
        )

    async def process(self, state: CustomerOperationState) -> AgentExecutionOutput:
        messages = state.get("messages", [])
        last_msg = messages[-1]["content"] if messages else ""
        proposals: list[ActionProposal] = []

        # Check for duplicate charge dispute
        is_dispute = any(k in last_msg.lower() for k in ["charged twice", "double charge", "duplicate charge", "refund"])

        if is_dispute:
            proposals.append(
                ActionProposal(
                    tool_name="billing_get_transactions",
                    parameters={"customer_id": state.get("customer_id") or "cust_unknown"},
                    reasoning="Retrieve recent transaction receipts to check for duplicate billing charges.",
                    requires_approval=False,
                )
            )
            response_text = (
                "I am checking your recent billing transactions right now to verify if a duplicate charge occurred."
            )
        else:
            proposals.append(
                ActionProposal(
                    tool_name="billing_get_invoice",
                    parameters={"customer_id": state.get("customer_id") or "cust_unknown"},
                    reasoning="Retrieve customer latest invoice statement.",
                    requires_approval=False,
                )
            )
            response_text = "I've pulled up your billing history. What invoice or charge can I help you review?"

        return AgentExecutionOutput(
            agent_id=self.agent_id,
            response_message=response_text,
            proposed_actions=proposals,
            confidence=0.98,
            updated_context={"billing_workflow_active": True},
        )
