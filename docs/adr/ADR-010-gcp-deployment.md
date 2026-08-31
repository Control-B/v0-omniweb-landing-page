# ADR-010: Google Cloud Platform (GCP) Target Deployment Architecture

## Status
Accepted

## Context
Production readiness requires a resilient, auto-scaling, secure cloud architecture with managed PostgreSQL, Redis, Secret Management, and OpenTelemetry observability.

## Decision
Target Google Cloud Platform (GCP) deployment:
1. **Compute:** Cloud Run for containerized FastAPI backend and Next.js frontend.
2. **Database:** Cloud SQL for PostgreSQL 16 (with `pgvector` extension enabled).
3. **Caching & Queue:** Memorystore for Redis.
4. **AI & Foundation Models:** Vertex AI (Gemini 2.0 Flash / Pro, Gemini Live Multimodal).
5. **Security & Secrets:** GCP Secret Manager with IAM workload identity federation.
6. **Observability:** Cloud Logging, Cloud Monitoring, and Cloud Trace via OpenTelemetry.

## Consequences
- Enterprise scalability, high availability, and SOC 2 / HIPAA compliance capabilities.
