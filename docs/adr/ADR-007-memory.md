# ADR-007: Tiered Memory & Context Architecture

## Status
Accepted

## Context
Dumping complete raw conversation histories into system prompts causes token bloat, high costs, and context confusion across recurring customer calls.

## Decision
Implement a **4-tier memory architecture**:
1. **Working Memory:** Active conversational buffer in `ContactCenterState`.
2. **Workflow Memory:** Step progress and entity state in LangGraph checkpoints.
3. **Customer Memory:** Structured customer profile, past interaction summaries, and sentiment trends in PostgreSQL.
4. **Organizational Memory:** Tenant-specific knowledge, FAQs, and policies indexed in `pgvector`.

## Consequences
- Concise prompt context, fast time-to-first-token, and persistent customer recognition across calls.
