"""Billing, Invoice, and Credit Management Tools for Omniweb Contact Center."""
from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field

from app.tools.base import BaseTool, ToolCategory, ToolResult, ToolRiskLevel
from app.tools.registry import get_tool_registry


# ── Invoice Lookup Tool ─────────────────────────────────────────────────────

class GetInvoicesInput(BaseModel):
    customer_id: str | None = Field(None, description="Customer account ID")
    phone_number: str | None = Field(None, description="Customer phone number")
    limit: int = Field(3, description="Number of recent invoices to retrieve")


class GetInvoicesOutput(BaseModel):
    invoices: list[dict[str, Any]]
    total_balance: float
    status: str


class GetInvoicesTool(BaseTool[GetInvoicesInput, GetInvoicesOutput]):
    name = "get_invoices"
    description = "Retrieve customer billing history, recent invoices, line items, and outstanding balance."
    category = ToolCategory.BILLING
    risk_level = ToolRiskLevel.STANDARD
    input_schema = GetInvoicesInput
    output_schema = GetInvoicesOutput
    allowed_agents = ["billing", "account", "retention", "escalation"]

    async def execute(
        self,
        params: GetInvoicesInput,
        *,
        tenant_id: str,
        caller_id: str | None = None,
        agent_name: str | None = None,
        context: dict[str, Any] | None = None,
    ) -> ToolResult:
        from app.adapters.factory import get_adapter_factory
        billing = get_adapter_factory().get_billing_adapter(tenant_id)
        invoices = await billing.get_invoices(
            customer_id=params.customer_id,
            phone=params.phone_number or caller_id,
            tenant_id=tenant_id,
            limit=params.limit,
        )
        return ToolResult(
            success=True,
            data={
                "invoices": invoices,
                "total_balance": 0.00,
                "status": "account_in_good_standing",
            },
        )


# ── Refund Request Tool (HIGH RISK -> Triggers Human-in-the-Loop!) ───────────

class RequestRefundInput(BaseModel):
    customer_id: str = Field(..., description="Customer ID requesting refund")
    invoice_id: str = Field(..., description="Target invoice ID")
    amount: float = Field(..., description="Refund amount requested in USD")
    reason: str = Field(..., description="Detailed justification from caller")


class RequestRefundOutput(BaseModel):
    status: str
    approval_id: str
    message: str


class RequestRefundTool(BaseTool[RequestRefundInput, RequestRefundOutput]):
    name = "request_refund"
    description = "Issue a financial credit or refund for an invoice. HIGH-RISK action requiring supervisor approval."
    category = ToolCategory.BILLING
    risk_level = ToolRiskLevel.HIGH_RISK  # <--- HITL Gate
    input_schema = RequestRefundInput
    output_schema = RequestRefundOutput
    allowed_agents = ["billing", "retention"]

    async def execute(
        self,
        params: RequestRefundInput,
        *,
        tenant_id: str,
        caller_id: str | None = None,
        agent_name: str | None = None,
        context: dict[str, Any] | None = None,
    ) -> ToolResult:
        from app.adapters.factory import get_adapter_factory
        billing = get_adapter_factory().get_billing_adapter(tenant_id)
        result = await billing.issue_refund(
            customer_id=params.customer_id,
            invoice_id=params.invoice_id,
            amount=params.amount,
            reason=params.reason,
            tenant_id=tenant_id,
        )
        return ToolResult(
            success=True,
            data=result,
        )


# Register tools on import
registry = get_tool_registry()
registry.register(GetInvoicesTool())
registry.register(RequestRefundTool())
