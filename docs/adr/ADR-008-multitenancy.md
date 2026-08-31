# ADR-008: Multi-Tenancy & Data Isolation

## Status
Accepted

## Context
Omniweb AI is a multi-tenant SaaS platform. Cross-tenant data leakage (prompts, customer records, knowledge vectors, phone routing) is an existential security risk.

## Decision
Enforce multi-tenancy at every layer:
1. **API / Middleware:** Extract and validate `tenant_id` from verified auth tokens (Clerk JWT or API keys).
2. **Database Queries:** Mandatory `client_id` / `tenant_id` WHERE predicates on all SQLAlchemy queries.
3. **Vector Search:** Metadata filtering by `tenant_id` on all pgvector RAG queries.
4. **Tool Execution:** Tool parameters are checked against tenant ownership and permissions before execution.

## Consequences
- Strict compliance with enterprise data privacy standards.
