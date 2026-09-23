"""Approval Service for Human-in-the-Loop Governance and Workflow Resumption.

Manages the lifecycle of sensitive action approvals:
- Generation of approval requests triggered by policy engine / high-risk tools
- Transitioning associated Case to AWAITING_APPROVAL
- Supervisor review: approve or reject with resolution notes
- Automated resumption and tool execution upon approval
"""
from __future__ import annotations

from datetime import datetime, timezone
import uuid
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.models import ApprovalRequest, Case
from app.services.case_service import get_case_service
from app.tools.base import ToolResult
from app.tools.registry import get_tool_registry

logger = get_logger(__name__)


class ApprovalService:
    """Coordinates HITL approval requests and automated post-approval tool resumption."""

    def __init__(self):
        self.case_service = get_case_service()

    async def create_approval_request(
        self,
        *,
        tenant_id: str,
        case_id: str,
        action_type: str,
        proposed_payload: dict[str, Any],
        reason: str,
        policy_rule_id: str,
        workflow_checkpoint_id: str | None = None,
        session: AsyncSession,
    ) -> ApprovalRequest:
        """Create an ApprovalRequest and transition case into AWAITING_APPROVAL."""
        tenant_uuid = uuid.UUID(tenant_id)
        case_uuid = uuid.UUID(case_id)

        approval = ApprovalRequest(
            tenant_id=tenant_uuid,
            case_id=case_uuid,
            action_type=action_type,
            proposed_payload=proposed_payload,
            reason=reason,
            policy_rule_id=policy_rule_id,
            workflow_checkpoint_id=workflow_checkpoint_id,
            status="PENDING",
        )
        session.add(approval)
        await session.flush()

        # Update case status
        await self.case_service.transition_status(
            case_id=case_id,
            new_status="AWAITING_APPROVAL",
            actor_id="policy_engine",
            notes=f"Action '{action_type}' paused for supervisor approval: {reason}",
            session=session,
        )

        # Log event
        await self.case_service.add_event(
            case_id=case_id,
            event_type="APPROVAL_REQUESTED",
            actor_id="policy_engine",
            actor_type="SYSTEM",
            payload={
                "approval_id": str(approval.id),
                "action_type": action_type,
                "reason": reason,
                "rule_id": policy_rule_id,
            },
            notes=f"Supervisor sign-off required for {action_type}.",
            session=session,
        )

        logger.warning(
            f"[ApprovalService] Created approval request {approval.id} for case {case_id} ({action_type})"
        )
        return approval

    async def approve_request(
        self,
        *,
        approval_id: str,
        reviewer_id: str,
        notes: str | None = None,
        session: AsyncSession,
    ) -> tuple[ApprovalRequest, ToolResult | None]:
        """Approve a pending request and resume/execute the tool mutation with authorization."""
        appr_uuid = uuid.UUID(approval_id)
        stmt = select(ApprovalRequest).where(ApprovalRequest.id == appr_uuid)
        res = await session.execute(stmt)
        approval = res.scalars().first()

        if not approval:
            raise ValueError(f"ApprovalRequest '{approval_id}' not found.")

        if approval.status != "PENDING":
            raise ValueError(f"ApprovalRequest '{approval_id}' is already {approval.status}.")

        now = datetime.now(timezone.utc)
        approval.status = "APPROVED"
        approval.reviewed_by = reviewer_id
        approval.reviewed_at = now
        approval.resolution_notes = notes or "Approved by supervisor."
        await session.flush()

        # Transition Case back to IN_PROGRESS
        case_id = str(approval.case_id)
        await self.case_service.transition_status(
            case_id=case_id,
            new_status="IN_PROGRESS",
            actor_id=reviewer_id,
            notes=f"Action '{approval.action_type}' approved by {reviewer_id}.",
            session=session,
        )

        await self.case_service.add_event(
            case_id=case_id,
            event_type="APPROVAL_RESOLVED",
            actor_id=reviewer_id,
            actor_type="HUMAN_AGENT",
            payload={
                "approval_id": approval_id,
                "decision": "APPROVED",
                "notes": approval.resolution_notes,
            },
            notes=f"Approved by {reviewer_id}.",
            session=session,
        )

        # Automated resumption: Execute the proposed tool action with pre_approved context
        registry = get_tool_registry()
        execution_result: ToolResult | None = None
        tool = registry.get(approval.action_type)

        if tool:
            logger.info(
                f"[ApprovalService] Automatically resuming tool execution '{approval.action_type}'"
            )
            execution_result = await registry.execute_tool(
                approval.action_type,
                approval.proposed_payload,
                tenant_id=str(approval.tenant_id),
                agent_name="billing" if "refund" in approval.action_type else "supervisor",
                context={
                    "pre_approved": True,
                    "approved_by": reviewer_id,
                    "approval_id": approval_id,
                },
                session=session,
            )

        return approval, execution_result

    async def reject_request(
        self,
        *,
        approval_id: str,
        reviewer_id: str,
        notes: str | None = None,
        session: AsyncSession,
    ) -> ApprovalRequest:
        """Reject a pending request with supervisor justification."""
        appr_uuid = uuid.UUID(approval_id)
        stmt = select(ApprovalRequest).where(ApprovalRequest.id == appr_uuid)
        res = await session.execute(stmt)
        approval = res.scalars().first()

        if not approval:
            raise ValueError(f"ApprovalRequest '{approval_id}' not found.")

        if approval.status != "PENDING":
            raise ValueError(f"ApprovalRequest '{approval_id}' is already {approval.status}.")

        now = datetime.now(timezone.utc)
        approval.status = "REJECTED"
        approval.reviewed_by = reviewer_id
        approval.reviewed_at = now
        approval.resolution_notes = notes or "Rejected by supervisor."
        await session.flush()

        case_id = str(approval.case_id)
        await self.case_service.transition_status(
            case_id=case_id,
            new_status="IN_PROGRESS",
            actor_id=reviewer_id,
            notes=f"Action '{approval.action_type}' rejected by supervisor: {approval.resolution_notes}",
            session=session,
        )

        await self.case_service.add_event(
            case_id=case_id,
            event_type="APPROVAL_REJECTED",
            actor_id=reviewer_id,
            actor_type="HUMAN_AGENT",
            payload={
                "approval_id": approval_id,
                "decision": "REJECTED",
                "notes": approval.resolution_notes,
            },
            notes=f"Rejected by {reviewer_id}.",
            session=session,
        )

        logger.info(f"[ApprovalService] Approval request {approval_id} rejected by {reviewer_id}")
        return approval

    async def list_pending_approvals(
        self,
        *,
        tenant_id: str,
        session: AsyncSession,
    ) -> list[ApprovalRequest]:
        tenant_uuid = uuid.UUID(tenant_id)
        stmt = (
            select(ApprovalRequest)
            .where(
                ApprovalRequest.tenant_id == tenant_uuid,
                ApprovalRequest.status == "PENDING",
            )
            .order_by(desc(ApprovalRequest.created_at))
        )
        res = await session.execute(stmt)
        return list(res.scalars().all())


_approval_service = ApprovalService()


def get_approval_service() -> ApprovalService:
    """Singleton getter for ApprovalService."""
    return _approval_service
