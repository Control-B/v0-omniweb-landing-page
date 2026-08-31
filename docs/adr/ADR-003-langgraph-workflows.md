# ADR-003: LangGraph for Durable Stateful Workflows

## Status
Accepted

## Context
Contact center conversations require structured state (customer identity, verification level, intent, active agent, pending actions, tool outputs, and approval status) and must survive unexpected network disconnections or multi-step human-in-the-loop pauses.

## Decision
Use **LangGraph** as the principal application-level state machine. State is represented via the typed `ContactCenterState` dictionary. Graph transitions are deterministic, and all state mutations are persisted to PostgreSQL checkpoints via `AsyncPostgresSaver`.

## Consequences
- Guaranteed conversation resumability if a caller is disconnected or placed on hold.
- Full auditability of every state node transition.

## Risks
- Graph definition complexity must be minimized; routing logic should avoid unnecessary multi-hop latency.
