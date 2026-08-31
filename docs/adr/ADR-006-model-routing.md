# ADR-006: Dynamic Model Routing and Abstraction

## Status
Accepted

## Context
Hardcoding a single LLM model (e.g. `gpt-4o`) across all contact center tasks leads to excessive latency and cost for simple classification, while lacking multimodal depth for complex tasks.

## Decision
Implement a configurable `ModelRouter` supporting categorized model profiles:
1. **Ultra-Fast Classification:** `gemini-2.0-flash` / `gpt-4o-mini` for intent detection (< 200ms TTFT).
2. **Primary Conversational Intelligence:** `gemini-2.0-flash` / `gpt-4o` for specialist agents.
3. **High-Reasoning & Long Context:** `gemini-1.5-pro` / `o3-mini` for DeepAgents investigations.
4. **Multimodal Realtime Voice:** Gemini 2.0 Multimodal Live for direct audio streaming.

## Consequences
- Cost efficiency and sub-second response times for turn-taking.
- Easy swap of foundation models without altering application code.
