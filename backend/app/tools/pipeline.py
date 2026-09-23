"""9-Stage Enterprise Tool Execution Pipeline.

Enforces deterministic invariants across all agent tool calls:
Stage 1: Schema Validation (Pydantic models)
Stage 2: Tenant Isolation & Authentication
Stage 3: Agent Capability / RBAC Authorization
Stage 4: Deterministic Policy Engine Evaluation
Stage 5: Risk Classification
Stage 6: Human-in-the-Loop Approval Gating
Stage 7: Deterministic Idempotency Enforcement
Stage 8: Adapter / Service Execution with Latency Tracking
Stage 9: Result Grounding, Immutable Audit Logging & Idempotency State Commit
"""
from __future__ import annotations

import time
from typing import Any
import uuid

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.core.telemetry import MetricTracker, get_current_correlation
from app.models.models import AuditEvent
from app.policies.engine import PolicyDecision, get_policy_engine
from app.tools.base import BaseTool, ToolResult, ToolRiskLevel
from app.tools.idempotency import (
    IdempotencyStatus,
    generate_idempotency_key,
    get_idempotency_engine,
)

logger = get_logger(__name__)


class PipelineExecutionError(Exception):
    """Raised when a terminal pipeline check rejects execution."""
    pass


class ToolExecutionPipeline:
    """Orchestrates the deterministic 9-stage pipeline for tool execution."""

    def __init__(self):
        self.policy_engine = get_policy_engine()
        self.idempotency_engine = get_idempotency_engine()

    async def execute(
        self,
        tool: BaseTool,
        raw_params: dict[str, Any],
        *,
        tenant_id: str,
        agent_name: str,
        caller_id: str | None = None,
        customer_id: str | None = None,
        context: dict[str, Any] | None = None,
        session: AsyncSession | None = None,
    ) -> ToolResult:
        start_time = time.perf_counter()
        ctx = context or {}
        corr = get_current_correlation()

        # ── STAGE 1: Schema Validation ────────────────────────────────────────
        try:
            validated_params = tool.input_schema.model_validate(raw_params)
        except ValidationError as val_err:
            duration_ms = (time.perf_counter() - start_time) * 1000
            err_msg = f"Validation failed for tool '{tool.name}': {val_err.errors()}"
            logger.warning(err_msg, extra={"tenant_id": tenant_id, "tool": tool.name})
            return ToolResult(
                success=False,
                error=err_msg,
                execution_time_ms=duration_ms,
            )

        # ── STAGE 2: Tenant Isolation & Authentication ────────────────────────
        if not tenant_id or not str(tenant_id).strip():
            duration_ms = (time.perf_counter() - start_time) * 1000
            err_msg = f"Tenant isolation violation: missing tenant_id for tool '{tool.name}'"
            logger.error(err_msg)
            return ToolResult(success=False, error=err_msg, execution_time_ms=duration_ms)

        # ── STAGE 3: Agent Capability / RBAC Authorization ────────────────────
        if tool.allowed_agents and agent_name not in tool.allowed_agents and "all" not in tool.allowed_agents:
            duration_ms = (time.perf_counter() - start_time) * 1000
            err_msg = (
                f"Agent '{agent_name}' is not authorized to invoke tool '{tool.name}'. "
                f"Allowed agents: {tool.allowed_agents}"
            )
            logger.error(err_msg, extra={"tenant_id": tenant_id, "agent": agent_name, "tool": tool.name})

            # Record denied audit event
            await self._record_audit_event(
                tenant_id=tenant_id,
                actor_id=agent_name,
                action=tool.name,
                auth_result="DENIED",
                session=session,
            )
            return ToolResult(success=False, error=err_msg, execution_time_ms=duration_ms)

        # ── STAGE 4: Deterministic Policy Engine Evaluation ───────────────────
        policy_result = self.policy_engine.evaluate_action(
            action=tool.name,
            params=validated_params.model_dump(),
            tenant_id=tenant_id,
            actor=agent_name,
        )

        if policy_result.decision == PolicyDecision.DENY:
            duration_ms = (time.perf_counter() - start_time) * 1000
            err_msg = f"Policy violation ({policy_result.rule_id}): {policy_result.reason}"
            logger.warning(err_msg, extra={"tenant_id": tenant_id, "tool": tool.name})
            await self._record_audit_event(
                tenant_id=tenant_id,
                actor_id=agent_name,
                action=tool.name,
                auth_result="POLICY_DENIED",
                session=session,
            )
            return ToolResult(success=False, error=err_msg, execution_time_ms=duration_ms)

        # ── STAGE 5: Risk Classification ──────────────────────────────────────
        is_high_risk = (
            tool.risk_level in (ToolRiskLevel.HIGH_RISK, ToolRiskLevel.CRITICAL)
            or policy_result.decision == PolicyDecision.REQUIRE_APPROVAL
        )

        # ── STAGE 6: Human-in-the-Loop Approval Gating ────────────────────────
        pre_approved = ctx.get("pre_approved", False) or ctx.get("approved_by") is not None
        if is_high_risk and not pre_approved:
            duration_ms = (time.perf_counter() - start_time) * 1000
            approval_id = ctx.get("approval_id") or f"appr_{uuid.uuid4().hex[:10]}"
            reason = policy_result.reason if policy_result.decision == PolicyDecision.REQUIRE_APPROVAL else (
                f"Action '{tool.name}' is classified as {tool.risk_level.value} risk."
            )
            logger.warning(
                f"[HITL Gate] Pausing execution for human approval: {approval_id} ({reason})",
                extra={"tenant_id": tenant_id, "approval_id": approval_id, "tool": tool.name},
            )
            return ToolResult(
                success=True,
                requires_approval=True,
                approval_id=approval_id,
                execution_time_ms=duration_ms,
                data={
                    "status": "pending_human_approval",
                    "approval_status": "AWAITING_APPROVAL",
                    "approval_id": approval_id,
                    "tool": tool.name,
                    "reason": reason,
                    "rule_id": policy_result.rule_id,
                    "proposed_params": validated_params.model_dump(),
                    "message": f"This action requires supervisor authorization before completion: {reason}",
                },
            )

        # ── STAGE 7: Idempotency Enforcement ──────────────────────────────────
        idem_key = ctx.get("idempotency_key")
        is_mutating = tool.risk_level != ToolRiskLevel.READ_ONLY

        if is_mutating:
            if not idem_key:
                idem_key = generate_idempotency_key(
                    tenant_id=tenant_id,
                    customer_id=customer_id or caller_id,
                    operation_type=tool.name,
                    params=validated_params.model_dump(),
                )

            idem_status, cached_result = await self.idempotency_engine.check_or_acquire(
                tenant_id=tenant_id,
                idempotency_key=idem_key,
                operation_type=tool.name,
                session=session,
            )

            if idem_status == IdempotencyStatus.COMPLETED and cached_result is not None:
                duration_ms = (time.perf_counter() - start_time) * 1000
                logger.info(f"[Pipeline] Returned cached idempotent response for key={idem_key}")
                return ToolResult(
                    success=True,
                    data=cached_result,
                    idempotency_key=idem_key,
                    execution_time_ms=duration_ms,
                )
            elif idem_status == IdempotencyStatus.IN_PROGRESS:
                duration_ms = (time.perf_counter() - start_time) * 1000
                return ToolResult(
                    success=False,
                    error="Operation with identical parameters is currently being processed.",
                    idempotency_key=idem_key,
                    execution_time_ms=duration_ms,
                )

        # ── STAGE 8: Adapter / Service Execution ──────────────────────────────
        try:
            result = await tool.execute(
                validated_params,
                tenant_id=tenant_id,
                caller_id=caller_id,
                agent_name=agent_name,
                context=ctx,
            )
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            err_msg = f"Tool execution failure in '{tool.name}': {str(exc)}"
            logger.error(err_msg, exc_info=True)

            if is_mutating and idem_key:
                await self.idempotency_engine.record_failure(
                    idempotency_key=idem_key,
                    error_payload={"error": err_msg},
                    session=session,
                )

            await self._record_audit_event(
                tenant_id=tenant_id,
                actor_id=agent_name,
                action=tool.name,
                auth_result="ERROR",
                idempotency_key=idem_key,
                session=session,
            )
            return ToolResult(success=False, error=err_msg, execution_time_ms=duration_ms)

        duration_ms = (time.perf_counter() - start_time) * 1000
        result.execution_time_ms = duration_ms
        if idem_key:
            result.idempotency_key = idem_key

        # ── STAGE 9: Result Grounding, Audit Logging & Idempotency Commit ─────
        if is_mutating and idem_key and result.success:
            await self.idempotency_engine.record_completion(
                idempotency_key=idem_key,
                result_payload=result.data,
                session=session,
            )

        await self._record_audit_event(
            tenant_id=tenant_id,
            actor_id=agent_name,
            action=tool.name,
            auth_result="ALLOWED",
            idempotency_key=idem_key,
            session=session,
        )

        MetricTracker.record_turn_latency(
            stage=f"pipeline_tool_{tool.name}",
            duration_ms=duration_ms,
            agent=agent_name,
            tenant_id=tenant_id,
        )

        return result

    async def _record_audit_event(
        self,
        *,
        tenant_id: str,
        actor_id: str,
        action: str,
        auth_result: str,
        idempotency_key: str | None = None,
        session: AsyncSession | None = None,
    ) -> None:
        """Write immutable audit event to PostgreSQL."""
        if not session:
            return
        try:
            tenant_uuid = uuid.UUID(tenant_id)
            audit = AuditEvent(
                tenant_id=tenant_uuid,
                actor_type="AI_AGENT",
                actor_id=actor_id,
                action=action,
                resource_type="TOOL",
                resource_id=action,
                authorization_result=auth_result,
                idempotency_key=idempotency_key,
            )
            session.add(audit)
            await session.flush()
        except Exception as exc:
            logger.warning(f"Failed to persist AuditEvent to DB: {exc}")


_pipeline = ToolExecutionPipeline()


def get_tool_pipeline() -> ToolExecutionPipeline:
    """Singleton getter for the global tool execution pipeline."""
    return _pipeline
