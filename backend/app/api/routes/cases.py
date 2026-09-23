"""Case Management API Routes for Omniweb Customer Operations Platform."""
from __future__ import annotations

from typing import Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.core.auth import get_current_client
from app.core.logging import get_logger
from app.services.case_service import InvalidStateTransitionError, get_case_service

logger = get_logger(__name__)
router = APIRouter(prefix="/cases", tags=["cases"])


def _resolve_tenant_id(current_client: dict, tenant_id: str | None) -> str:
    if tenant_id and current_client.get("role") == "admin":
        return tenant_id
    return current_client["client_id"]


class CreateCaseRequest(BaseModel):
    title: str = Field(..., description="Short title or subject of the case")
    description: str = Field(..., description="Full context or problem description")
    customer_id: Optional[str] = Field(None, description="Associated customer UUID")
    channel: str = Field("VOICE", description="Source channel: VOICE, WEB, EMAIL, SMS")
    priority: str = Field("MEDIUM", description="LOW, MEDIUM, HIGH, CRITICAL")
    category: str = Field("general_support", description="Classification category")
    assigned_agent: Optional[str] = Field("receptionist", description="Initial specialist agent")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Custom context attributes")


class UpdateCaseStatusRequest(BaseModel):
    status: str = Field(..., description="Target status (e.g. IN_PROGRESS, RESOLVED, CLOSED)")
    notes: Optional[str] = Field(None, description="Resolution or transition notes")


class AddCaseEventRequest(BaseModel):
    event_type: str = Field(..., description="Event classification (e.g. NOTE_ADDED, SPECIALIST_ASSIGNED)")
    notes: Optional[str] = Field(None, description="Event summary or note body")
    payload: dict[str, Any] = Field(default_factory=dict, description="Structured event metadata")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_case(
    payload: CreateCaseRequest,
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Create a new case with initial audit event."""
    tenant_id = current_client["client_id"]
    service = get_case_service()
    case = await service.create_case(
        tenant_id=tenant_id,
        customer_id=payload.customer_id,
        title=payload.title,
        description=payload.description,
        channel=payload.channel,
        priority=payload.priority,
        category=payload.category,
        assigned_agent=payload.assigned_agent,
        created_by=f"client_{tenant_id[:8]}",
        metadata=payload.metadata,
        session=db,
    )
    await db.commit()
    return {
        "success": True,
        "case_id": str(case.id),
        "status": case.status,
        "priority": case.priority,
        "title": case.title,
        "created_at": case.created_at.isoformat(),
    }


@router.get("")
async def list_cases(
    status: Optional[str] = Query(None, description="Filter by status (NEW, IN_PROGRESS, etc.)"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    customer_id: Optional[str] = Query(None, description="Filter by customer UUID"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """List cases for the authenticated tenant."""
    tenant_id = current_client["client_id"]
    service = get_case_service()
    cases = await service.list_cases(
        tenant_id=tenant_id,
        customer_id=customer_id,
        status=status,
        priority=priority,
        limit=limit,
        offset=offset,
        session=db,
    )
    return {
        "cases": [
            {
                "id": str(c.id),
                "title": c.title,
                "status": c.status,
                "priority": c.priority,
                "channel": c.channel,
                "category": c.category,
                "assigned_agent": c.assigned_agent,
                "customer_id": str(c.customer_id) if c.customer_id else None,
                "created_at": c.created_at.isoformat(),
                "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None,
            }
            for c in cases
        ],
        "count": len(cases),
        "limit": limit,
        "offset": offset,
    }


@router.get("/{case_id}")
async def get_case(
    case_id: str,
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Retrieve full case details."""
    service = get_case_service()
    case = await service.get_case(case_id, db)
    if not case or str(case.tenant_id) != current_client["client_id"]:
        raise HTTPException(status_code=404, detail="Case not found")

    return {
        "id": str(case.id),
        "tenant_id": str(case.tenant_id),
        "customer_id": str(case.customer_id) if case.customer_id else None,
        "title": case.title,
        "description": case.description,
        "channel": case.channel,
        "status": case.status,
        "priority": case.priority,
        "category": case.category,
        "assigned_agent": case.assigned_agent,
        "created_at": case.created_at.isoformat(),
        "resolved_at": case.resolved_at.isoformat() if case.resolved_at else None,
        "resolution_summary": case.resolution_summary,
        "custom_fields": case.custom_fields,
    }


@router.patch("/{case_id}/status")
async def update_case_status(
    case_id: str,
    payload: UpdateCaseStatusRequest,
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Transition a case's lifecycle status."""
    service = get_case_service()
    case = await service.get_case(case_id, db)
    if not case or str(case.tenant_id) != current_client["client_id"]:
        raise HTTPException(status_code=404, detail="Case not found")

    try:
        updated_case = await service.transition_status(
            case_id=case_id,
            new_status=payload.status,
            actor_id=current_client["email"],
            notes=payload.notes,
            session=db,
        )
        await db.commit()
        return {
            "success": True,
            "case_id": str(updated_case.id),
            "status": updated_case.status,
        }
    except InvalidStateTransitionError as err:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(err))


@router.get("/{case_id}/events")
async def get_case_timeline(
    case_id: str,
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Get the immutable event audit timeline for a case."""
    service = get_case_service()
    case = await service.get_case(case_id, db)
    if not case or str(case.tenant_id) != current_client["client_id"]:
        raise HTTPException(status_code=404, detail="Case not found")

    events = await service.get_case_timeline(case_id, db)
    return {
        "case_id": case_id,
        "events": [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "actor_type": e.actor_type,
                "actor_id": e.actor_id,
                "notes": e.notes,
                "payload": e.payload,
                "created_at": e.created_at.isoformat(),
            }
            for e in events
        ],
    }


@router.post("/{case_id}/events", status_code=status.HTTP_201_CREATED)
async def add_case_event(
    case_id: str,
    payload: AddCaseEventRequest,
    current_client: dict = Depends(get_current_client),
    db: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Append a manual note or event to the case timeline."""
    service = get_case_service()
    case = await service.get_case(case_id, db)
    if not case or str(case.tenant_id) != current_client["client_id"]:
        raise HTTPException(status_code=404, detail="Case not found")

    event = await service.add_event(
        case_id=case_id,
        event_type=payload.event_type,
        actor_id=current_client["email"],
        actor_type="HUMAN_AGENT",
        payload=payload.payload,
        notes=payload.notes,
        session=db,
    )
    await db.commit()
    return {
        "success": True,
        "event_id": str(event.id),
        "case_id": case_id,
        "event_type": event.event_type,
        "created_at": event.created_at.isoformat(),
    }
