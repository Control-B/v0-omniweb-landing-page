# Omniweb Landing App

This Next.js app now acts as the customer-facing frontend for the wider `omniweb-ai-platform` stack.

## What is wired

- `Supabase Auth`: Sign-in and dashboard protection use the local `@supabase/ssr` client.
- `Orchestrator`: Dashboard onboarding and Shopify status now call the FastAPI orchestrator with the authenticated Supabase bearer token.
- `LiveKit`: `/api/livekit/token` now mints short-lived room tokens for the signed-in merchant when LiveKit env vars are present.
- `Shopify`: The dashboard surfaces install status and install links from the orchestrator's Shopify flow.
- `DigitalOcean App Platform`: `.do/app.yaml` now targets a DO-first web deployment instead of the old mixed Vercel/App Platform layout.

## Required environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OMNIWEB_ORCHESTRATOR_URL=http://127.0.0.1:8000
FASTAPI_ASSISTANT_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SHOPIFY_APP_URL=http://localhost:8787
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
OMNIWEB_PUBLIC_TENANT_SLUG=
LIVEKIT_AGENT_NAME=
NEXT_PUBLIC_VOICE_TRANSPORT=livekit
NEXT_PUBLIC_CDN_ORIGIN=https://cdn.omniweb.ai
```

## Local development

Run this app on `http://localhost:3000`, then run the orchestrator from the sibling `omniweb-ai-platform` repository on `http://localhost:8000`.

```bash
pnpm install
pnpm dev
```

Once signed in, open `/dashboard` to provision the tenant record, generate Shopify install links, and test LiveKit token issuance.

For the public website voice assistant, set `OMNIWEB_PUBLIC_TENANT_SLUG` to the tenant slug that should own the site assistant, set `LIVEKIT_AGENT_NAME` to the LiveKit Cloud agent dispatch name, and set `NEXT_PUBLIC_VOICE_TRANSPORT=livekit` so the chatbot uses LiveKit instead of the legacy Deepgram websocket path.

To deploy on DigitalOcean App Platform, use `./.do/app.yaml` in this repo for the website and point its API env vars at `https://omniweb-engine-rs6fr.ondigitalocean.app`.
