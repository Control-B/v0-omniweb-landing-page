"""Case Management Service for Multi-Tenant Customer Operations.

Implements the complete Case lifecycle state machine:
NEW -> TRIAGED -> IN_PROGRESS -> [AWAITING_APPROVAL | WAITING_ON_CUSTOMER | ESCALATED_TO_HUMAN] -> RESOLVED -> CLOSED
Maintains immutable CaseEvent timeline auditing for full traceability.
"""
from __future__ import annotations

from datetime import datetime, timezone
import uuid
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.models import Case, CaseEvent

logger = get_logger(__name__)

# Valid state machine transitions
ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "NEW": {"TRIAGED", "IN_PROGRESS", "CANCELLED"},
    "TRIAGED": {"IN_PROGRESS", "ESCALATED_TO_HUMAN", "CANCELLED"},
    "IN_PROGRESS": {"AWAITING_APPROVAL", "WAITING_ON_CUSTOMER", "ESCALATED_TO_HUMAN", "RESOLVED", "CANCELLED"},
    "AWAITING_APPROVAL": {"IN_PROGRESS", "RESOLVED", "REJECTED", "ESCALATED_TO_HUMAN"},
    "WAITING_ON_CUSTOMER": {"IN_PROGRESS", "RESOLVED", "CLOSED"},
    "ESCALATED_TO_HUMAN": {"IN_PROGRESS", "RESOLVED", "CLOSED"},
    "RESOLVED": {"CLOSED", "IN_PROGRESS"},
    "CLOSED": {"IN_PROGRESS"},  # Reopened
    "CANCELLED": set(),
}


class InvalidStateTransitionError(Exception):
    """Raised when an illegal case lifecycle state transition is attempted."""
    pass


class CaseService:
    """Manages Case state transitions, event auditing, and multi-channel case history."""

    async def create_case(
        self,
        *,
        tenant_id: str,
        customer_id: str | None = None,
        title: str,
        description: str,
        channel: str = "VOICE",
        priority: str = "MEDIUM",
        category: str = "general_support",
        assigned_agent: str = "receptionist",
        created_by: str = "ai_agent",
        metadata: dict[str, Any] | None = None,
        session: AsyncSession,
    ) -> Case:
        """Create a new Case record and log the initial CASE_CREATED event."""
        tenant_uuid = uuid.UUID(tenant_id)
        cust_uuid = uuid.UUID(customer_id) if customer_id else uuid.uuid4()

        meta = metadata.copy() if metadata else {}
        meta["description"] = description
        meta["channel"] = channel.upper()
        meta["created_by"] = created_by

        case = Case(
            tenant_id=tenant_uuid,
            customer_id=cust_uuid,
            title=title,
            category=category,
            priority=priority.upper(),
            status="NEW",
            assigned_agent=assigned_agent,
            metadata_=meta,
        )
        session.add(case)
        await session.flush()

        # Log creation event
        initial_event = CaseEvent(
            case_id=case.id,
            tenant_id=tenant_uuid,
            event_type="CASE_CREATED",
            actor_type="AI_AGENT" if created_by.startswith("ai") else "HUMAN_OPERATOR",
            actor_id=created_by,
            description=f"Case opened via {channel}: {title}",
            event_payload={
                "title": title,
                "category": category,
                "priority": priority,
                "channel": channel,
                "assigned_agent": assigned_agent,
            },
        )
        session.add(initial_event)
        await session.flush()

        logger.info(f"[CaseService] Created case {case.id} for tenant {tenant_id} (status=NEW)")
        return case

    async def transition_status(
        self,
        *,
        case_id: str,
        new_status: str,
        actor_id: str,
        notes: str | None = None,
        session: AsyncSession,
    ) -> Case:
        """Enforce state machine rules and transition a Case's lifecycle status."""
        case_uuid = uuid.UUID(case_id)
        stmt = select(Case).where(Case.id == case_uuid)
        res = await session.execute(stmt)
        case = res.scalars().first()

        if not case:
            raise ValueError(f"Case '{case_id}' not found.")

        current_status = case.status
        target_status = new_status.upper()

        if target_status not in ALLOWED_TRANSITIONS.get(current_status, set()):
            raise InvalidStateTransitionError(
                f"Cannot transition case {case_id} from '{current_status}' to '{target_status}'."
            )

        case.status = target_status
        meta = dict(case.metadata_ or {})
        if target_status in ("RESOLVED", "CLOSED") and not case.resolved_at:
            case.resolved_at = datetime.now(timezone.utc)
            if notes:
                meta["resolution_summary"] = notes
        case.metadata_ = meta

        # Log event
        event = CaseEvent(
            case_id=case.id,
            tenant_id=case.tenant_id,
            event_type="STATUS_CHANGED",
            actor_type="SYSTEM",
            actor_id=actor_id,
            description=notes or f"Status transitioned from {current_status} to {target_status}.",
            event_payload={"previous_status": current_status, "new_status": target_status},
        )
        session.add(event)
        await session.flush()

        logger.info(f"[CaseService] Case {case_id} status changed: {current_status} -> {target_status}")
        return case

    async def add_event(
        self,
        *,
        case_id: str,
        event_type: str,
        actor_id: str,
        actor_type: str = "AI_AGENT",
        payload: dict[str, Any] | None = None,
        notes: str | None = None,
        session: AsyncSession,
    ) -> CaseEvent:
        """Add an immutable audit event to a case's timeline."""
        case_uuid = uuid.UUID(case_id)
        stmt = select(Case).where(Case.id == case_uuid)
        res = await session.execute(stmt)
        case = res.scalars().first()
        if not case:
            raise ValueError(f"Case '{case_id}' not found.")

        event = CaseEvent(
            case_id=case.id,
            tenant_id=case.tenant_id,
            event_type=event_type,
            actor_type=actor_type,
            actor_id=actor_id,
            description=notes or f"Event {event_type} recorded.",
            event_payload=payload or {},
        )
        session.add(event)
        await session.flush()
        return event

    async def get_case(
        self,
        case_id: str,
        session: AsyncSession,
    ) -> Case | None:
        case_uuid = uuid.UUID(case_id)
        stmt = select(Case).where(Case.id == case_uuid)
        res = await session.execute(stmt)
        return res.scalars().first()

    async def list_cases(
        self,
        *,
        tenant_id: str,
        customer_id: str | None = None,
        status: str | None = None,
        priority: str | None = None,
        limit: int = 50,
        offset: int = 0,
        session: AsyncSession,
    ) -> list[Case]:
        tenant_uuid = uuid.UUID(tenant_id)
        query = select(Case).where(Case.tenant_id == tenant_uuid)

        if customer_id:
            query = query.where(Case.customer_id == uuid.UUID(customer_id))
        if status:
            query = query.where(Case.status == status.upper())
        if priority:
            query = query.where(Case.priority == priority.upper())

        query = query.order_by(desc(Case.created_at)).limit(limit).offset(offset)
        res = await session.execute(query)
        return list(res.scalars().all())

    async def get_case_timeline(
        self,
        case_id: str,
        session: AsyncSession,
    ) -> list[CaseEvent]:
        case_uuid = uuid.UUID(case_id)
        query = select(CaseEvent).where(CaseEvent.case_id == case_uuid).order_by(CaseEvent.created_at.asc())
        res = await session.execute(query)
        return list(res.scalars().all())


_case_service = CaseService()


def get_case_service() -> CaseService:
    """Singleton getter for CaseService."""
    return _case_service
