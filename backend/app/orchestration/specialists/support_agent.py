"""Technical Support & Knowledge Specialist Agent.

Responsibilities:
- Retrieve tenant-scoped documentation, FAQs, and operating procedures via RAG.
- Provide step-by-step diagnostic and technical troubleshooting guidance.
- Ground all advice strictly in authoritative business knowledge with provenance.

Strictly Prohibited:
- Financial actions, appointment bookings, direct refunds.
"""
from __future__ import annotations

from app.orchestration.langgraph.state import CustomerOperationState
from app.orchestration.specialists.base import (
    ActionProposal,
    AgentExecutionOutput,
    BaseSpecialistAgent,
)


class SupportAgent(BaseSpecialistAgent):
    """Specialist agent for technical support and tenant knowledge retrieval."""

    def __init__(self):
        super().__init__(
            agent_id="support_agent",
            name="Support Agent",
            allowed_tools={
                "knowledge_search_tenant_docs",
                "knowledge_get_article",
                "support_run_diagnostics",
            },
            prohibited_tools={
                "billing_propose_refund",
                "billing_issue_refund",
                "calendar_book_slot",
            },
        )

    async def process(self, state: CustomerOperationState) -> AgentExecutionOutput:
        messages = state.get("messages", [])
        last_msg = messages[-1]["content"] if messages else ""

        proposals = [
            ActionProposal(
                tool_name="knowledge_search_tenant_docs",
                parameters={
                    "tenant_id": state.get("tenant_id"),
                    "query": last_msg,
                },
                reasoning="Search tenant knowledge base to retrieve authoritative technical instructions.",
                requires_approval=False,
            )
        ]

        return AgentExecutionOutput(
            agent_id=self.agent_id,
            response_message="I'm retrieving the relevant documentation and troubleshooting steps for your issue.",
            proposed_actions=proposals,
            confidence=0.92,
            updated_context={"support_diagnostic_active": True},
        )
