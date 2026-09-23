"""Human Escalation Specialist Agent.

Responsibilities:
- Synthesize conversation history, detected intent, and actions taken into a concise handoff package.
- Route interaction to human supervisor war room or operator queue.
- Maintain workflow continuity so the AI agent can resume smoothly after human intervention.

Strictly Prohibited:
- Executing unauthorized writes or closing cases without operator consent.
"""
from __future__ import annotations

from app.orchestration.langgraph.state import CustomerOperationState
from app.orchestration.specialists.base import (
    ActionProposal,
    AgentExecutionOutput,
    BaseSpecialistAgent,
)


class HumanEscalationAgent(BaseSpecialistAgent):
    """Specialist agent for human escalation packaging and operator handover."""

    def __init__(self):
        super().__init__(
            agent_id="escalation_agent",
            name="Human Escalation Agent",
            allowed_tools={
                "escalation_notify_human_supervisor",
                "escalation_transfer_call",
                "escalation_create_urgent_task",
            },
            prohibited_tools={
                "billing_issue_refund",
                "billing_cancel_subscription",
                "crm_delete_customer",
            },
        )

    async def process(self, state: CustomerOperationState) -> AgentExecutionOutput:
        messages = state.get("messages", [])
        last_msg = messages[-1]["content"] if messages else ""

        proposals = [
            ActionProposal(
                tool_name="escalation_notify_human_supervisor",
                parameters={
                    "tenant_id": state.get("tenant_id"),
                    "case_id": state.get("case_id"),
                    "reason": f"Customer requested human operator: {last_msg[:100]}",
                    "priority": "HIGH",
                },
                reasoning="Notify supervisor war room and package conversation context for human takeover.",
                requires_approval=False,
            )
        ]

        return AgentExecutionOutput(
            agent_id=self.agent_id,
            response_message="I am connecting you directly with a human supervisor who will have full context of our conversation. One moment please.",
            proposed_actions=proposals,
            escalate_to_human=True,
            escalation_reason="Direct human escalation requested",
            confidence=1.0,
            updated_context={"escalation_status": "REQUESTED"},
        )
