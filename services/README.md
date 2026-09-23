# Services Directory

This repository contains the following micro‑services, each under the `services/` folder:

- `frontend/` – Next.js application (the UI).
- `backend/` – FastAPI core API.
- `keycloak/` – Authentication service (Keycloak OSS) deployed via Helm.
- `traefik/` – API‑gateway and ingress controller.
- `weaviate/` – Vector database for RAG.
- `kafka/` – Apache Kafka (Strimzi operator) for event‑driven architecture.
- `livekit/` – Real‑time media server.
- `monitoring/` – Prometheus, Grafana, Jaeger, Loki stack.

Each service includes a Helm chart under its `helm/` sub‑folder, which can be installed onto the local Kind/k3s cluster.
