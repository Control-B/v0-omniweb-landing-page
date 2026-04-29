# Omniweb Landing App

Customer-facing Next.js app for **omniweb.ai**. It runs as its **own** deployment and talks to the **[Omniweb-AI-Engine](https://github.com/Control-B/Omniweb-AI-Engine)** FastAPI service over the network (not the same git repo).

## What is wired

- **Clerk** — Sign-in, sign-up (`/get-started`), and `/dashboard` use Clerk. You must use the **same Clerk application** as the engine so tokens validate on the backend.
- **Engine JWT** — Server-side code exchanges the Clerk session for an engine-issued JWT via `POST {ENGINE_URL}/api/auth/clerk-session`, then stores it in an httpOnly cookie for `/api/engine/*` proxy calls (`lib/auth/engine.ts`).
- **Engine proxy** — `GET|POST|… /api/engine/[...path]` forwards to `{ENGINE_URL}/api/{path}` with the Bearer token (`app/api/engine/[...path]/route.ts`).
- **LiveKit / Shopify / widget** — Optional; see `.env.production.example`.

## Required environment variables

Copy `.env.production.example` to `.env.production` (or `.env.local` from `.env.local.example` for dev).

**Critical:**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same Clerk app as engine dashboard |
| `CLERK_SECRET_KEY` | Clerk backend API key |
| `NEXT_PUBLIC_OMNIWEB_ENGINE_URL` | Engine URL exposed to the browser (bootstrap, widget helpers) |
| `OMNIWEB_ENGINE_URL` | Server-side engine URL (auth exchange, API proxy) |

Align these with **Omniweb-AI-Engine** env: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the deployed API base URL.

## Local development

1. Run **Omniweb-AI-Engine** on `http://localhost:8000`.
2. Copy `.env.local.example` → `.env.local` and fill Clerk + engine URLs.
3. Run this app:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Sign-up flows hit the engine’s `clerk-session` endpoint when you access dashboard features.

## Deploy

Configure production env in Vercel / DigitalOcean / etc. Point `OMNIWEB_ENGINE_URL` at your live engine (e.g. `https://omniweb-engine-rs6fr.ondigitalocean.app` or `https://api.omniweb.ai`). In the **Clerk dashboard**, add your production omniweb.ai origin and redirect URLs.

For DigitalOcean, see `.do/app.yaml` in this repo.
