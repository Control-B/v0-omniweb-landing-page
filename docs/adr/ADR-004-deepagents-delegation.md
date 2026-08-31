# ADR-004: DeepAgents for Long-Horizon Asynchronous Delegation

## Status
Accepted

## Context
Certain contact center operations (e.g. investigating 12-month billing disputes across invoice tables, reconciling payment gateway logs, analyzing complex diagnostic error traces, generating customized multi-option retention packages) require long-running research that would freeze real-time voice latency.

## Decision
Introduce **DeepAgents** via an explicit `DeepAgentService` adapter. Long-running tasks are spawned asynchronously. The live voice agent naturally acknowledges the request ("I am pulling your complete billing audit now..."), while DeepAgents decomposes the subtasks, collects structured findings, and returns the result back to LangGraph without blocking audio.

## Consequences
- Prevents real-time conversational stalls.
- Provides deep cognitive reasoning for enterprise-grade disputes.

## Risks
- DeepAgents must return strictly typed Pydantic payloads and cannot bypass authorization gates.
