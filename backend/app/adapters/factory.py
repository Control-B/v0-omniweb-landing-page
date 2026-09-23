"""Enterprise Adapter Factory for resolving tenant-scoped integrations."""
from __future__ import annotations

from typing import Any

from app.adapters.base import (
    BillingAdapter,
    CalendarAdapter,
    CRMAdapter,
    TicketingAdapter,
)
from app.adapters.billing import StripeBillingAdapter
from app.adapters.calendar import CalComCalendarAdapter
from app.adapters.crm import PostgresCRMAdapter
from app.adapters.ticketing import InternalTicketingAdapter


class AdapterFactory:
    """Resolves enterprise system adapters per tenant with dependency injection."""

    def __init__(self):
        self._crm_override: CRMAdapter | None = None
        self._billing_override: BillingAdapter | None = None
        self._ticketing_override: TicketingAdapter | None = None
        self._calendar_override: CalendarAdapter | None = None

    def get_crm_adapter(self, tenant_id: str) -> CRMAdapter:
        if self._crm_override:
            return self._crm_override
        return PostgresCRMAdapter()

    def get_billing_adapter(self, tenant_id: str) -> BillingAdapter:
        if self._billing_override:
            return self._billing_override
        return StripeBillingAdapter()

    def get_ticketing_adapter(self, tenant_id: str) -> TicketingAdapter:
        if self._ticketing_override:
            return self._ticketing_override
        return InternalTicketingAdapter()

    def get_calendar_adapter(self, tenant_id: str) -> CalendarAdapter:
        if self._calendar_override:
            return self._calendar_override
        return CalComCalendarAdapter()

    # Helpers for testing / mock injection
    def set_crm_adapter(self, adapter: CRMAdapter | None) -> None:
        self._crm_override = adapter

    def set_billing_adapter(self, adapter: BillingAdapter | None) -> None:
        self._billing_override = adapter

    def set_ticketing_adapter(self, adapter: TicketingAdapter | None) -> None:
        self._ticketing_override = adapter

    def set_calendar_adapter(self, adapter: CalendarAdapter | None) -> None:
        self._calendar_override = adapter


_adapter_factory = AdapterFactory()


def get_adapter_factory() -> AdapterFactory:
    """Singleton getter for the global adapter factory."""
    return _adapter_factory
