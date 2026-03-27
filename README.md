# Omniweb Microservices

This repository is now split into three service directories so frontend, backend, and AI logic can evolve independently.

## Services

- `frontend/`: Next.js UI, pages, components, and browser-side assistant experience.
- `backend/`: Node/Express API service for browser-facing routes like chat, assistant actions, Deepgram token issuance, upload, and file serving.
- `ai/`: FastAPI service for Omniweb-owned assistant reasoning and automation.

## Local Structure

```text
frontend/  -> Next.js app container
backend/   -> Node API container
ai/        -> FastAPI AI container
```

## Run with Docker

```bash
docker compose up --build
```

Frontend runs at `http://localhost:3000`.

## Service Notes

- The frontend proxies `/api/*` requests to the backend service via `frontend/next.config.mjs` rewrites.
- The backend proxies assistant reasoning requests to the AI service.
- Shared secrets are currently read from the root `.env.local` through `docker-compose.yml`.

## Why this split

This layout reduces cross-impact when changing one layer:

- UI and conversation UX changes stay in `frontend/`
- API and integration changes stay in `backend/`
- AI logic and automation changes stay in `ai/`

The next step after this structure is to turn shared assistant rules into a dedicated shared config/package so frontend and backend do not duplicate navigation definitions.
