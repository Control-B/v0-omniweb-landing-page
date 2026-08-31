# ADR-005: Google ADK and Gemini Agent Platform Integration

## Status
Accepted

## Context
Google Agent Development Kit (ADK) and Gemini models provide native support for multimodal reasoning, Vertex AI grounding, and Google ecosystem connectors (Google Workspace, Drive, BigQuery).

## Decision
Integrate Google ADK via a clean `ADKAdapter` service. ADK agents operate as specialist services called from LangGraph rather than being tightly nested inside core state machines. Gemini models on Vertex AI serve as the primary model family.

## Consequences
- Clean interoperability with Google Cloud and Vertex AI Agent Platform.
- Prevents vendor lock-in by keeping ADK behind an explicit service adapter.
