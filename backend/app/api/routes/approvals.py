"""Human-in-the-Loop Approvals API for Omniweb Customer Operations Platform."""
from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.core.auth import get_current_client
from app.core.logging import get_logger
from app.services.approval_service import get_approval_service

logger = get_logger(__name__)
router = APIRouter(prefix="/approvals", tags=["approvals"])


class ReviewApprovalRequest(BaseModel):
    notes: Optional[str] = Field(None, description="Supervisor decision notes or justification")


@router.get("")
async def list_pending_approvals(
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """List pending Human-in-the-Loop approvals for the authenticated tenant."""
    tenant_id = current_client["client_id"]
    service = get_approval_service()
    approvals = await service.list_pending_approvals(tenant_id=tenant_id, session=db)

    return {
        "approvals": [
            {
                "id": str(a.id),
                "case_id": str(a.case_id),
                "action_type": a.action_type,
                "proposed_payload": a.proposed_payload,
                "reason": a.reason,
                "policy_rule_id": a.policy_rule_id,
                "status": a.status,
                "workflow_checkpoint_id": a.workflow_checkpoint_id,
                "created_at": a.created_at.isoformat(),
            }
            for a in approvals
        ],
        "count": len(approvals),
    }


@router.post("/{approval_id}/approve")
async def approve_request(
    approval_id: str,
    payload: ReviewApprovalRequest,
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Approve a pending action and immediately trigger authorized tool execution."""
    service = get_approval_service()
    try:
        approval, tool_result = await service.approve_request(
            approval_id=approval_id,
            reviewer_id=current_client["email"],
            notes=payload.notes,
            session=db,
        )
        await db.commit()

        response_data: dict[str, Any] = {
            "success": True,
            "approval_id": str(approval.id),
            "status": approval.status,
            "reviewed_by": approval.reviewed_by,
            "reviewed_at": approval.reviewed_at.isoformat() if approval.reviewed_at else None,
        }

        if tool_result:
            response_data["resumed_execution"] = {
                "tool_success": tool_result.success,
                "data": tool_result.data,
                "idempotency_key": tool_result.idempotency_key,
                "execution_time_ms": tool_result.execution_time_ms,
            }

        return response_data
    except ValueError as err:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(err))


@router.post("/{approval_id}/reject")
async def reject_request(
    approval_id: str,
    payload: ReviewApprovalRequest,
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Reject a pending action with supervisor justification."""
    service = get_approval_service()
    try:
        approval = await service.reject_request(
            approval_id=approval_id,
            reviewer_id=current_client["email"],
            notes=payload.notes,
            session=db,
        )
        await db.commit()
        return {
            "success": True,
            "approval_id": str(approval.id),
            "status": approval.status,
            "reviewed_by": approval.reviewed_by,
            "reviewed_at": approval.reviewed_at.isoformat() if approval.reviewed_at else None,
            "resolution_notes": approval.resolution_notes,
        }
    except ValueError as err:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(err))
