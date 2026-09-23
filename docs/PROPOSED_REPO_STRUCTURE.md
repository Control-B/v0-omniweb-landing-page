# Proposed Target Repository Structure

Following the **Modular Monolith** principle, the target structure organizes the codebase into high-cohesion, low-coupling domain packages while preserving all existing functioning services.

```text
v0-omniweb-landing-page/
├── app/                                 # Next.js 16 App Router Frontend
│   ├── (marketing)/                     # Preserved public landing & marketing pages
│   │   ├── page.tsx                     # Landing page with customer service showcase
│   │   ├── features/                    # Feature deep-dives
│   │   ├── solutions/                   # Industry solutions
│   │   ├── pricing/                     # Pricing matrices
│   │   └── demo/                        # Interactive demo & telephony tester
│   ├── console/                         # [NEW] Customer Operations Console
│   │   ├── overview/                    # Real-time metrics & active workflows
│   │   ├── cases/                       # Case management & timeline inspector
│   │   ├── approvals/                   # Human-in-the-loop approval queue
│   │   ├── traces/                      # OpenTelemetry & AI trace visualizer
│   │   ├── evals/                       # Automated evaluation results dashboard
│   │   └── audit/                       # Searchable immutable audit logs
│   └── api/                             # Frontend proxy routes
│
├── components/                          # React components
│   ├── ui/                              # Radix UI / Tailwind primitives
│   ├── marketing/                       # Preserved hero, video player, showcases
│   ├── call-center/                     # Preserved LiveKit simulator & agent inspector
│   └── console/                         # [NEW] Operations console components
│       ├── case-timeline.tsx            # Visual chronological audit & action trail
│       ├── approval-modal.tsx           # Human review & action authorization
│       ├── workflow-visualizer.tsx      # Live LangGraph step-by-step state tracker
│       └── metrics-overview.tsx         # AI resolution & escalation rate cards
│
├── backend/                             # Python 3.11+ FastAPI Application
│   ├── app/
│   │   ├── main.py                      # FastAPI entrypoint, middleware & telemetry setup
│   │   ├── core/                        # Configuration, database engine, logging, security
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── logging.py
│   │   │   └── telemetry.py             # OpenTelemetry tracing & metrics
│   │   ├── models/                      # SQLAlchemy 2.0 / SQLModel ORM models
│   │   │   ├── tenant.py                # Client & Tenant models
│   │   │   ├── customer.py              # [NEW] Customer & CustomerIdentity models
│   │   │   ├── case.py                  # [NEW] Case & CaseEvent models
│   │   │   ├── approval.py              # [NEW] ApprovalRequest model
│   │   │   ├── audit.py                 # [NEW] Immutable AuditEvent model
│   │   │   └── telephony.py             # Preserved Call, Transcript & Voice models
│   │   ├── orchestration/               # Multi-agent LangGraph state machine
│   │   │   ├── langgraph/
│   │   │   │   ├── state.py             # CustomerOperationState
│   │   │   │   ├── supervisor.py        # Supervisor router & intent detector
│   │   │   │   ├── graph.py             # Compiled StateGraph with checkpointing
│   │   │   │   └── checkpointer.py      # Redis session & state persistence
│   │   │   └── specialists/             # [NEW] Explicit specialist agent definitions
│   │   │       ├── account_agent.py     # Customer details & preferences
│   │   │       ├── billing_agent.py     # Invoices, transactions, refund proposals
│   │   │       ├── scheduling_agent.py  # Appointments & calendar operations
│   │   │       ├── support_agent.py     # Knowledge base RAG & diagnostics
│   │   │       ├── case_agent.py        # Case lifecycle & status updates
│   │   │       └── escalation_agent.py  # Human handoff packager
│   │   ├── tools/                       # Tool platform & registry
│   │   │   ├── base.py                  # BaseTool with risk & idempotency metadata
│   │   │   ├── registry.py              # Tool registry & permission validator
│   │   │   ├── pipeline.py              # [NEW] 9-stage deterministic execution pipeline
│   │   │   └── idempotency.py           # [NEW] Deterministic idempotency engine
│   │   ├── adapters/                    # [NEW] Enterprise adapter abstraction layer
│   │   │   ├── base.py                  # Abstract adapter interfaces
│   │   │   ├── crm.py                   # CRMAdapter (Internal Postgres, HubSpot, Salesforce)
│   │   │   ├── billing.py               # BillingAdapter (Stripe, Shopify, Mock)
│   │   │   ├── ticketing.py             # TicketingAdapter (Internal, Zendesk, Jira)
│   │   │   └── calendar.py              # CalendarAdapter (Google Calendar, Cal.com)
│   │   ├── policies/                    # Deterministic governance & guardrails
│   │   │   ├── engine.py                # PolicyEngine with business rules
│   │   │   ├── input_guards.py          # [NEW] Prompt injection & PII filters
│   │   │   └── output_guards.py         # [NEW] Groundedness & policy consistency checks
│   │   ├── memory/                      # 4-tier memory architecture
│   │   │   ├── working.py               # Redis-backed LangGraph checkpoint state
│   │   │   ├── session.py               # Conversational short-term context
│   │   │   └── semantic.py              # pgvector semantic customer memory
│   │   ├── rag/                         # Tenant-isolated knowledge retrieval
│   │   │   ├── retriever.py             # Vector search with tenant isolation & provenance
│   │   │   └── ingestion.py             # Document parser & chunker
│   │   └── api/routes/                  # REST endpoints
│   │       ├── auth.py                  # Multi-tenant auth & RBAC
│   │       ├── console.py               # [NEW] Operations console API (cases, approvals)
│   │       ├── cases.py                 # [NEW] Case management API
│   │       ├── approvals.py             # [NEW] Approval action review & resume API
│   │       ├── chat.py                  # Conversational streaming endpoint
│   │       ├── livekit.py               # Preserved WebRTC voice token endpoint
│   │       └── evals.py                 # [NEW] Evaluation telemetry & trigger API
│   │
│   ├── alembic/                         # Database migration scripts
│   └── tests/                           # Comprehensive test suite
│       ├── unit/                        # Unit tests for policies, tools, adapters
│       ├── integration/                 # Integration tests for database & state machine
│       └── evals/                       # [NEW] AI evaluation regression suite
│           ├── datasets/                # 100+ evaluation scenarios (adversarial, normal)
│           └── runner.py                # Automated evaluator for routing & safety
│
├── agent/                               # Preserved LiveKit telephony voice worker
│   └── agent.py
├── infra/                               # Infrastructure as Code
│   ├── caddy/                           # Production Caddy reverse proxy config
│   └── docker/                          # Multi-stage production Dockerfiles
├── docs/                                # Enterprise architecture documentation
│   ├── CURRENT_ARCHITECTURE.md
│   ├── TARGET_ARCHITECTURE.md
│   ├── MIGRATION_PLAN.md
│   ├── PROPOSED_REPO_STRUCTURE.md
│   ├── PROPOSED_DATABASE_CHANGES.md
│   ├── PROPOSED_DEPENDENCIES.md
│   └── AUDIT_AND_FINDINGS.md
└── docker-compose.gcp.yml               # Production deployment stack
```
