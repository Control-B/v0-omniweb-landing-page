# Proposed Dependency Updates

Following the principle of minimal necessary complexity, we avoid adding unneeded heavy frameworks and only incorporate battle-tested, high-reliability packages.

---

## 1. Backend Python Dependencies (`backend/requirements.txt`)

### Current Active Dependencies (PRESERVED):
- `fastapi`, `uvicorn[standard]`: High-performance async web framework.
- `sqlalchemy[asyncio]`, `asyncpg`, `alembic`: Async ORM and migration engine.
- `pydantic>=2.7.0`: Strict type validation and JSON schemas.
- `redis>=5.0.0`: Checkpoint caching and session storage.
- `langgraph`, `langchain-core`: Agent state machine orchestration.
- `openai`, `google-genai`: LLM model integrations.
- `livekit`, `livekit-api`, `deepgram-sdk`: Real-time voice and telephony.
- `python-jose[cryptography]`, `passlib[bcrypt]`: JWT authentication.

### Proposed Additions:
- `opentelemetry-api`, `opentelemetry-sdk`: OpenTelemetry instrumentation standards.
- `opentelemetry-instrumentation-fastapi`: Automatic span generation for HTTP routes.
- `ragas`: Standardized metrics for RAG retrieval and faithfulness evaluations (dev/eval dependency only).
- `pytest-asyncio`: Async test suite execution.

### Removals / Avoided Dependencies:
- **AVOID Keycloak Client Adapters**: Native JWT/FastAPI auth is simpler, more stable, and eliminates third-party OIDC redirect failure modes.
- **AVOID Celery / Kafka / RabbitMQ**: Existing Redis + async background tasks provide adequate throughput without operational overhead.
- **AVOID Kubernetes / Helm**: Docker Compose on GCP Compute Engine is working, reliable, and zero-maintenance for current scale.

---

## 2. Frontend Node Dependencies (`package.json`)

### Current Active Dependencies (PRESERVED):
- `next: 16.0.0`, `react: 19.0.0`, `react-dom: 19.0.0`: App router core.
- `tailwindcss`, `lucide-react`, `framer-motion`: Styling and animations.
- `@radix-ui/react-*`: Accessible primitives.
- `livekit-client`, `@livekit/components-react`: Telephony streaming components.
- `zustand`: Lightweight client state management.

### Removals / Cleanup:
- Removed `keycloak-js`: Removed to prevent OIDC loops and browser freeze.
