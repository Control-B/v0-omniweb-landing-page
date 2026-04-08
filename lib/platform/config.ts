export function getOrchestratorBaseUrl() {
  return (
    process.env.OMNIWEB_ORCHESTRATOR_URL ??
    process.env.FASTAPI_ASSISTANT_URL ??
    process.env.NEXT_PUBLIC_OMNIWEB_ORCHESTRATOR_URL ??
    'http://127.0.0.1:8000'
  ).replace(/\/$/, '')
}

export function getLiveKitServerUrl() {
  return process.env.NEXT_PUBLIC_LIVEKIT_URL ?? process.env.LIVEKIT_URL ?? ''
}

export function getShopifyAppUrl() {
  return (
    process.env.NEXT_PUBLIC_SHOPIFY_APP_URL ??
    process.env.SHOPIFY_APP_PUBLIC_URL ??
    'http://localhost:8787'
  ).replace(/\/$/, '')
}
