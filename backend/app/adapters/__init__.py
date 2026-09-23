"""Enterprise Adapter Layer for Omniweb Agent Platform."""
from app.adapters.base import (
    BillingAdapter,
    CalendarAdapter,
    CRMAdapter,
    TicketingAdapter,
)
from app.adapters.billing import StripeBillingAdapter
from app.adapters.calendar import CalComCalendarAdapter
from app.adapters.crm import PostgresCRMAdapter
from app.adapters.factory import AdapterFactory, get_adapter_factory
from app.adapters.ticketing import InternalTicketingAdapter

__all__ = [
    "CRMAdapter",
    "BillingAdapter",
    "TicketingAdapter",
    "CalendarAdapter",
    "PostgresCRMAdapter",
    "StripeBillingAdapter",
    "InternalTicketingAdapter",
    "CalComCalendarAdapter",
    "AdapterFactory",
    "get_adapter_factory",
]
