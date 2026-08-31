# Omniweb AI — Phased Migration Plan

**Date:** 2026-08-30  
**Status:** Approved Roadmap  
**Author:** Principal Agentic AI Architect & Staff Systems Engineer  

---

## 1. Migration Philosophy

We follow an **incremental, non-destructive modernization philosophy**:
`ASSESS ➔ PRESERVE ➔ ISOLATE ➔ ABSTRACT ➔ REFACTOR ➔ INTEGRATE ➔ TEST ➔ MIGRATE ➔ OBSERVE ➔ OPTIMIZE`

Existing functionality (marketing pages, Clerk auth, Stripe billing, existing receptionist widgets) remains functional at all times. All new capabilities are introduced behind configurable feature flags.

---

## 2. Feature Flags

```python
ENABLE_LANGGRAPH = True        # Stateful contact center graph
ENABLE_LIVEKIT = True          # Real-time WebRTC/SIP interaction plane
ENABLE_ADK = True              # Google Agent Development Kit specialists
ENABLE_DEEP_AGENTS = True      # Long-horizon asynchronous delegation
ENABLE_GEMINI_LIVE = True      # Direct multimodal realtime speech
ENABLE_AGENT_MEMORY = True     # Persistent customer memory & semantic store
ENABLE_OUTBOUND = False        # Outbound power dialer (compliance gated)
ENABLE_HUMAN_HANDOFF = True    # Supervisor approval & live agent transfer
```

---

## 3. Implementation Phases

### Phase 0: Discovery & Architecture Baseline (COMPLETED)
- Repository reconnaissance and dependency assessment.
- Current-state architecture (`docs/architecture/current-state.md`).
- Target-state architecture (`docs/architecture/target-state.md`).
- Migration roadmap (`docs/architecture/migration-plan.md`).
- Initial Architecture Decision Records (ADRs 001–010).

---

### Phase 1: Foundation & Core Service Abstractions
- **Goals:** Establish typed configuration, tenant isolation middleware, structured logging with OpenTelemetry correlation IDs, base model router, and Pydantic tool schemas.
- **Changes:**
  - Standardize `backend/app/core/config.py` with feature flags and Gemini/Vertex/LiveKit settings.
  - Implement `backend/app/core/telemetry.py` for correlation ID tracking (`call_id`, `session_id`, `tenant_id`).
  - Implement `backend/app/orchestration/model_router.py` (abstracting Gemini Flash, Pro, and fallback models).
  - Implement base tool interfaces in `backend/app/tools/base.py` and `backend/app/tools/registry.py`.
  - Add foundation test suite validating configuration and tool schemas.

---

### Phase 2: LangGraph State Machine & Orchestration Core
- **Goals:** Implement the durable state machine in LangGraph to replace single-prompt execution.
- **Changes:**
  - Define `ContactCenterState` and state transition schemas.
  - Build `SupervisorRouter` node to classify intent, detect language/sentiment, and route calls.
  - Wrap existing receptionist logic inside the initial LangGraph node.
  - Implement PostgreSQL checkpoint persistence (`AsyncPostgresSaver`).

---

### Phase 3: Specialist Agent Swarm
- **Goals:** Implement strongly bounded specialist agents with constrained toolsets.
- **Changes:**
  - `ReceptionistAgent` (Greeting, discovery, routing)
  - `CustomerAccountAgent` (Identity, profile, status)
  - `BillingAgent` (Invoices, payments, refund proposals)
  - `SalesAgent` (Lead qualification, proposal, CRM)
  - `SchedulingAgent` (Calendar availability, appointments)
  - `SupportAgent` (Troubleshooting, diagnostic scripts, tickets)
  - `RetentionAgent` (Cancellation prevention, approved offers)
  - `EscalationAgent` (Warm human handoff with JSON dossier)

---

### Phase 4: LiveKit Real-Time Voice Plane
- **Goals:** Establish the low-latency WebRTC and SIP interaction layer.
- **Changes:**
  - LiveKit `AgentSession` bridge connecting audio streams to the LangGraph workflow plane.
  - Interruption / barge-in detection with sub-300ms turn turnaround.
  - Voice pipeline selector (Pipeline A: Deepgram/Cartesia vs. Pipeline B: Gemini Multimodal Live).

---

### Phase 5: Enterprise Tool Plane & MCP Integration
- **Goals:** Connect real enterprise services with schema validation and policy checks.
- **Changes:**
  - CRM connectors (HubSpot / Salesforce / PostgreSQL Leads).
  - Calendar integrations (Cal.com / Google Calendar).
  - Ticketing engine (Zendesk / Jira / Internal Ticket Model).
  - Tenant-isolated RAG pipeline using pgvector.

---

### Phase 6: Human-in-the-Loop & Supervisor Console
- **Goals:** Implement approval gates for high-risk mutations.
- **Changes:**
  - Policy Engine evaluating action risk (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`).
  - LangGraph pause/checkpoint and resume upon human decision.
  - Next.js Supervisor War Room UI with real-time approval queues and live listen-in.

---

### Phase 7: DeepAgents Long-Horizon Delegation
- **Goals:** Asynchronous investigation and multi-step research.
- **Changes:**
  - `DeepAgentService` adapter in `backend/app/orchestration/deepagents/`.
  - Historical billing dispute audit agent and diagnostic synthesis workflows.

---

### Phase 8: Google ADK / Gemini Agent Platform Integration
- **Goals:** Integrate Google-native specialist services and multimodal grounding.
- **Changes:**
  - ADK adapter in `backend/app/orchestration/adk/`.
  - Vertex AI Enterprise Search and Gemini document reasoning tools.

---

### Phase 9: Observability, Evaluation & Regression Suite
- **Goals:** Automated evaluation and performance monitoring.
- **Changes:**
  - Tracing and metric dashboards for STT, LLM TTFT, TTS, and tool execution latency.
  - Automated evaluation harness testing intent accuracy, tool selection, and guardrail adherence.

---

### Phase 10: Production GCP Deployment
- **Goals:** Production containerization and deployment scripts.
- **Changes:**
  - Cloud Run service definitions, Cloud SQL PostgreSQL configuration, Secret Manager integration.

---

### Phase 11: Flagship Portfolio Experience & Documentation
- **Goals:** Deliver interactive demo benchmarks, execution visualizer, and architecture diagrams.
- **Changes:**
  - Next.js Live Call Center Studio (`/demo` and `/dashboard/call-center`).
  - Interactive Agent Execution Graph Inspector.
  - Comprehensive portfolio README and architectural diagrams.
