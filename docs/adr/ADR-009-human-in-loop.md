# ADR-009: Human-in-the-Loop Policy Engine & Approval Gates

## Status
Accepted

## Context
Autonomous AI agents executing financial credits, subscription cancellations, or contract updates without deterministic guardrails pose severe operational and compliance risks.

## Decision
Implement a deterministic **Policy Engine** that evaluates proposed tool actions prior to execution:
- Actions marked `HIGH_RISK` (e.g. credits > $50, custom discounts > 15%, cancellations) trigger a `REQUIRE_APPROVAL` state.
- LangGraph checkpoints the conversation state and emits an event to the supervisor queue.
- Supervisors approve, reject, or modify the action via the Supervisor War Room UI, resuming the workflow.

## Consequences
- Guaranteed business safety while maintaining conversational flow.
