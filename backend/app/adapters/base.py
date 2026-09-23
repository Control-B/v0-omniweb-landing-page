"""Enterprise System Adapters Base Protocols & Interfaces.

Provides strongly-typed, abstract interfaces for interacting with external
and internal enterprise systems: CRM, Billing, Ticketing, and Calendar.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class CRMAdapter(ABC):
    """Abstract interface for CRM operations (HubSpot, Salesforce, PostgreSQL)."""

    @abstractmethod
    async def lookup_customer(
        self,
        *,
        phone: str | None = None,
        email: str | None = None,
        customer_id: str | None = None,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Find customer record by phone, email, or internal UUID."""
        pass

    @abstractmethod
    async def update_customer(
        self,
        *,
        customer_id: str,
        updates: dict[str, Any],
        tenant_id: str,
    ) -> dict[str, Any]:
        """Update customer attributes or contact details."""
        pass

    @abstractmethod
    async def get_interaction_timeline(
        self,
        *,
        customer_id: str,
        tenant_id: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Retrieve recent customer touchpoints, calls, cases, and notes."""
        pass

    @abstractmethod
    async def tag_customer(
        self,
        *,
        customer_id: str,
        tags: list[str],
        tenant_id: str,
    ) -> list[str]:
        """Add metadata/intent tags to a customer profile."""
        pass


class BillingAdapter(ABC):
    """Abstract interface for Billing & Payment systems (Stripe, QuickBooks, Mock)."""

    @abstractmethod
    async def get_invoices(
        self,
        *,
        customer_id: str | None = None,
        phone: str | None = None,
        tenant_id: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """Retrieve recent invoices and payment statuses."""
        pass

    @abstractmethod
    async def get_balance(
        self,
        *,
        customer_id: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Retrieve account balance, credit limit, and payment standing."""
        pass

    @abstractmethod
    async def issue_refund(
        self,
        *,
        customer_id: str,
        invoice_id: str,
        amount: float,
        reason: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Issue credit or refund against an invoice."""
        pass

    @abstractmethod
    async def update_payment_method(
        self,
        *,
        customer_id: str,
        payment_token: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Update default payment instrument."""
        pass


class TicketingAdapter(ABC):
    """Abstract interface for Helpdesk / Case tracking (Zendesk, Jira, Internal)."""

    @abstractmethod
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
        """Create a new support ticket or incident case."""
        pass

    @abstractmethod
    async def update_ticket(
        self,
        *,
        ticket_id: str,
        updates: dict[str, Any],
        tenant_id: str,
    ) -> dict[str, Any]:
        """Update ticket state, priority, or assignment."""
        pass

    @abstractmethod
    async def add_ticket_note(
        self,
        *,
        ticket_id: str,
        note: str,
        internal: bool,
        author: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Append internal or public timeline entry."""
        pass

    @abstractmethod
    async def escalate_ticket(
        self,
        *,
        ticket_id: str,
        reason: str,
        target_queue: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Escalate ticket to specialist or tier-2 human queue."""
        pass


class CalendarAdapter(ABC):
    """Abstract interface for Calendar & Scheduling (Cal.com, Google Calendar)."""

    @abstractmethod
    async def check_availability(
        self,
        *,
        date_str: str,
        service_type: str | None,
        duration_minutes: int,
        tenant_id: str,
    ) -> list[str]:
        """Return available time slots for a given date."""
        pass

    @abstractmethod
    async def book_appointment(
        self,
        *,
        attendee_name: str,
        attendee_email: str,
        attendee_phone: str | None,
        appointment_date: str,
        appointment_time: str,
        topic: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Confirm booking and schedule invites."""
        pass

    @abstractmethod
    async def reschedule_appointment(
        self,
        *,
        booking_id: str,
        new_date: str,
        new_time: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Reschedule an existing appointment."""
        pass

    @abstractmethod
    async def cancel_appointment(
        self,
        *,
        booking_id: str,
        reason: str,
        tenant_id: str,
    ) -> dict[str, Any]:
        """Cancel an appointment booking."""
        pass
