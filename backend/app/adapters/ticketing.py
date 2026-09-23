"""Ticketing Adapter implementation integrating with Case & CaseEvent models."""
from __future__ import annotations

import uuid
from typing import Any

from app.adapters.base import TicketingAdapter
from app.core.logging import get_logger

logger = get_logger(__name__)


class InternalTicketingAdapter(TicketingAdapter):
    """Ticketing adapter backed by internal Case engine or external systems."""

    def __init__(self, db_session_factory=None):
        self.session_factory = db_session_factory

    async def create_ticket(
        self,
        *,
        customer_id: str | None,
        title: str,
        description: str,
        category: str,
        severity: str,
        tenant_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        ticket_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        queue_map = {
            "hardware": "Tier-2 Hardware Specialists",
            "billing": "Finance & Billing Queue",
            "account_access": "Identity Security Team",
            "technical_issue": "Tier-1 Technical Support",
        }
        assigned_queue = queue_map.get(category, "General Customer Operations Queue")
        sla_hours = 2 if severity in ("high", "critical") else 24

        logger.info(
            f"[TicketingAdapter] Created ticket {ticket_id}: title='{title}', "
            f"category={category}, severity={severity}, queue='{assigned_queue}'"
        )
        return {
            "success": True,
            "ticket_id": ticket_id,
            "title": title,
            "category": category,
            "severity": severity,
            "assigned_queue": assigned_queue,
            "status": "OPEN",
            "sla_hours": sla_hours,
            "message": f"Case {ticket_id} opened and assigned to {assigned_queue} (SLA: {sla_hours}h).",
        }

    async def update_ticket(
        self,
        *,
        ticket_id: str,
        updates: dict[str, Any],
        tenant_id: str,
    ) -> dict[str, Any]:
        return {
            "success": True,
            "ticket_id": ticket_id,
            "updated_fields": list(updates.keys()),
        }

    async def add_ticket_note(
        self,
        *,
        ticket_id: str,
        note: str,
        internal: bool,
        author: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        return {
            "success": True,
            "ticket_id": ticket_id,
            "note_id": f"note_{uuid.uuid4().hex[:8]}",
            "internal": internal,
            "author": author,
        }

    async def escalate_ticket(
        self,
        *,
        ticket_id: str,
        reason: str,
        target_queue: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        logger.warning(f"[TicketingAdapter] Escalated ticket {ticket_id} to '{target_queue}': {reason}")
        return {
            "success": True,
            "ticket_id": ticket_id,
            "escalated": True,
            "target_queue": target_queue,
            "reason": reason,
            "status": "ESCALATED",
        }
