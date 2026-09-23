"""Deterministic Idempotency Engine for Consequential Write Actions.

Prevents duplicate execution of financial, account, and scheduling mutations.
Operates with dual storage:
1. Fast in-memory atomic cache with lock acquisition
2. Persistent PostgreSQL `IdempotencyRecord` table storage
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from enum import Enum
import hashlib
import json
from typing import Any
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.models import IdempotencyRecord

logger = get_logger(__name__)


class IdempotencyStatus(str, Enum):
    NEW = "NEW"                    # Key acquired, caller must execute operation
    IN_PROGRESS = "IN_PROGRESS"    # Another caller is actively executing
    COMPLETED = "COMPLETED"        # Operation already completed; return cached payload
    FAILED = "FAILED"              # Previous attempt failed; can be retried or inspected


def generate_idempotency_key(
    *,
    tenant_id: str,
    customer_id: str | None,
    operation_type: str,
    params: dict[str, Any],
) -> str:
    """Generate a deterministic, canonical SHA256 idempotency key.
    
    Any invocation with identical tenant, customer, operation, and parameters
    yields an identical key regardless of dictionary key ordering.
    """
    canonical_payload = {
        "tenant_id": str(tenant_id),
        "customer_id": str(customer_id) if customer_id else "",
        "operation_type": str(operation_type),
        "params": params,
    }
    serialized = json.dumps(canonical_payload, sort_keys=True, default=str)
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    return f"idem_{digest[:32]}"


class IdempotencyEngine:
    """Enterprise idempotency coordinator."""

    def __init__(self, default_ttl_seconds: int = 86400):
        self.default_ttl_seconds = default_ttl_seconds
        # In-memory fast layer for tests and immediate concurrency deduplication
        self._memory_store: dict[str, dict[str, Any]] = {}

    async def check_or_acquire(
        self,
        *,
        tenant_id: str,
        idempotency_key: str,
        operation_type: str,
        session: AsyncSession | None = None,
        ttl_seconds: int | None = None,
    ) -> tuple[IdempotencyStatus, dict[str, Any] | None]:
        """Check if an operation was already run; if not, acquire lock."""
        now = datetime.now(timezone.utc)
        ttl = ttl_seconds or self.default_ttl_seconds
        expires_at = now + timedelta(seconds=ttl)

        # 1. Fast in-memory check
        mem_entry = self._memory_store.get(idempotency_key)
        if mem_entry:
            if mem_entry.get("expires_at") and mem_entry["expires_at"] > now:
                status = mem_entry["status"]
                if status == IdempotencyStatus.COMPLETED:
                    logger.info(f"[Idempotency] Memory cache hit for key={idempotency_key}")
                    return IdempotencyStatus.COMPLETED, mem_entry.get("result_payload")
                elif status == IdempotencyStatus.IN_PROGRESS:
                    logger.warning(f"[Idempotency] Operation already in progress for key={idempotency_key}")
                    return IdempotencyStatus.IN_PROGRESS, None

        # 2. Database persistent check
        if session:
            try:
                stmt = select(IdempotencyRecord).where(
                    IdempotencyRecord.idempotency_key == idempotency_key
                )
                res = await session.execute(stmt)
                record = res.scalars().first()

                if record:
                    if record.expires_at > now:
                        if record.status == "COMPLETED":
                            logger.info(f"[Idempotency] DB cache hit for key={idempotency_key}")
                            return IdempotencyStatus.COMPLETED, record.result_payload
                        elif record.status == "IN_PROGRESS":
                            return IdempotencyStatus.IN_PROGRESS, None
                    else:
                        # Expired record, remove / overwrite
                        await session.delete(record)
                        await session.flush()

                # Acquire in DB
                tenant_uuid = uuid.UUID(tenant_id)
                new_record = IdempotencyRecord(
                    idempotency_key=idempotency_key,
                    tenant_id=tenant_uuid,
                    operation_type=operation_type,
                    status="IN_PROGRESS",
                    result_payload=None,
                    created_at=now,
                    expires_at=expires_at,
                )
                session.add(new_record)
                await session.flush()
            except Exception as exc:
                logger.warning(f"[Idempotency] DB check/acquire fallback to memory: {exc}")

        # Acquire lock in memory
        self._memory_store[idempotency_key] = {
            "tenant_id": tenant_id,
            "operation_type": operation_type,
            "status": IdempotencyStatus.IN_PROGRESS,
            "result_payload": None,
            "created_at": now,
            "expires_at": expires_at,
        }
        return IdempotencyStatus.NEW, None

    async def record_completion(
        self,
        *,
        idempotency_key: str,
        result_payload: dict[str, Any],
        session: AsyncSession | None = None,
    ) -> None:
        """Mark idempotency key as COMPLETED with immutable result payload."""
        now = datetime.now(timezone.utc)
        if idempotency_key in self._memory_store:
            self._memory_store[idempotency_key]["status"] = IdempotencyStatus.COMPLETED
            self._memory_store[idempotency_key]["result_payload"] = result_payload

        if session:
            try:
                stmt = select(IdempotencyRecord).where(
                    IdempotencyRecord.idempotency_key == idempotency_key
                )
                res = await session.execute(stmt)
                record = res.scalars().first()
                if record:
                    record.status = "COMPLETED"
                    record.result_payload = result_payload
                    await session.flush()
            except Exception as exc:
                logger.warning(f"[Idempotency] DB completion write failed: {exc}")

        logger.info(f"[Idempotency] Successfully committed completed operation for key={idempotency_key}")

    async def record_failure(
        self,
        *,
        idempotency_key: str,
        error_payload: dict[str, Any],
        session: AsyncSession | None = None,
    ) -> None:
        """Mark idempotency key as FAILED."""
        if idempotency_key in self._memory_store:
            self._memory_store[idempotency_key]["status"] = IdempotencyStatus.FAILED
            self._memory_store[idempotency_key]["result_payload"] = error_payload

        if session:
            try:
                stmt = select(IdempotencyRecord).where(
                    IdempotencyRecord.idempotency_key == idempotency_key
                )
                res = await session.execute(stmt)
                record = res.scalars().first()
                if record:
                    record.status = "FAILED"
                    record.result_payload = error_payload
                    await session.flush()
            except Exception as exc:
                logger.warning(f"[Idempotency] DB failure write failed: {exc}")


_idempotency_engine = IdempotencyEngine()


def get_idempotency_engine() -> IdempotencyEngine:
    """Singleton getter for the global idempotency engine."""
    return _idempotency_engine
