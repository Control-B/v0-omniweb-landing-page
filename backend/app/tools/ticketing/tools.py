"""Support Ticketing & Diagnostics Tools for Omniweb Contact Center."""
from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field

from app.tools.base import BaseTool, ToolCategory, ToolResult, ToolRiskLevel
from app.tools.registry import get_tool_registry


class CreateTicketInput(BaseModel):
    customer_id: str | None = Field(None, description="Customer ID if verified")
    caller_name: str = Field(..., description="Name of the person opening the ticket")
    caller_phone: str | None = Field(None, description="Callback phone number")
    caller_email: str | None = Field(None, description="Contact email")
    category: str = Field("technical_issue", description="Category: hardware, billing, account_access, general_inquiry")
    severity: str = Field("medium", description="Severity level: low, medium, high, critical")
    issue_summary: str = Field(..., description="Concise summary of the problem")
    troubleshooting_steps_attempted: list[str] = Field(default_factory=list, description="Steps already completed")


class CreateTicketOutput(BaseModel):
    ticket_id: str
    status: str
    assigned_queue: str
    sla_hours: int


class CreateTicketTool(BaseTool[CreateTicketInput, CreateTicketOutput]):
    name = "create_ticket"
    description = "Create a customer support ticket in Zendesk/Jira or the internal ticketing engine."
    category = ToolCategory.TICKETING
    risk_level = ToolRiskLevel.STANDARD
    input_schema = CreateTicketInput
    output_schema = CreateTicketOutput
    allowed_agents = ["support", "receptionist", "escalation"]

    async def execute(
        self,
        params: CreateTicketInput,
        *,
        tenant_id: str,
        caller_id: str | None = None,
        agent_name: str | None = None,
        context: dict[str, Any] | None = None,
    ) -> ToolResult:
        from app.adapters.factory import get_adapter_factory
        ticketing = get_adapter_factory().get_ticketing_adapter(tenant_id)
        result = await ticketing.create_ticket(
            customer_id=params.customer_id,
            title=params.issue_summary,
            description=f"Caller: {params.caller_name} ({params.caller_phone or caller_id}). Steps attempted: {params.troubleshooting_steps_attempted}",
            category=params.category,
            severity=params.severity,
            tenant_id=tenant_id,
        )
        return ToolResult(
            success=True,
            data=result,
        )


# Register tools on import
registry = get_tool_registry()
registry.register(CreateTicketTool())
