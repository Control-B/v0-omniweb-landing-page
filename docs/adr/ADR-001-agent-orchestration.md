# ADR-001: Layered Agent Orchestration Architecture

## Status
Accepted

## Context
Omniweb AI originally relied on a single monolithic system prompt concatenated in Python and passed to an external LLM endpoint. As we upgrade the platform to a contact center handling diverse workflows (billing, scheduling, technical support, sales, retention, escalations), a single prompt model causes tool conflicts, context window bloat, poor deterministic reliability, and high error rates.

## Decision
We establish a **four-tier architectural separation of concerns**:
1. **Real-Time Interaction Plane:** LiveKit handles audio streaming, WebRTC, SIP, VAD, and interruptions.
2. **Durable Workflow Plane:** LangGraph manages conversation state, business rules, routing, checkpoints, and human approval gates.
3. **Long-Horizon Delegation Plane:** DeepAgents executes multi-step asynchronous research and investigation without blocking live conversations.
4. **Google-Native Specialist Plane:** Google ADK and Gemini models provide multimodal analysis, enterprise grounding, and model routing.

## Consequences
- **Positive:** Clear boundaries, predictable debugging, no single point of cognitive failure, and low voice latency.
- **Negative:** Requires disciplined adapter interfaces between LiveKit, LangGraph, DeepAgents, and ADK.

## Risks
- Nesting complexity if boundaries are blurred. Enforced via linting and strict service contracts.
