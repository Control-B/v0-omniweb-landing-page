const CANONICAL_ENGINE_URL = "https://omniweb-engine-rs6fr.ondigitalocean.app"

const LEGACY_ENGINE_HOSTS = new Set(["api.omniweb.ai"])

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "")
}

export function normalizeEngineUrl(value?: string | null): string {
  const candidate = value?.trim()
  if (!candidate) {
    return CANONICAL_ENGINE_URL
  }

  try {
    const parsed = new URL(candidate)
    if (LEGACY_ENGINE_HOSTS.has(parsed.host)) {
      return CANONICAL_ENGINE_URL
    }

    return trimTrailingSlash(parsed.toString())
  } catch {
    return trimTrailingSlash(candidate)
  }
}

export function getPublicEngineUrl(): string {
  return normalizeEngineUrl(
    process.env.NEXT_PUBLIC_OMNIWEB_ENGINE_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      CANONICAL_ENGINE_URL,
  )
}

export function getServerEngineUrl(): string {
  return normalizeEngineUrl(
    process.env.OMNIWEB_ENGINE_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_OMNIWEB_ENGINE_URL ??
      process.env.OMNIWEB_ORCHESTRATOR_URL ??
      CANONICAL_ENGINE_URL,
  )
}

export { CANONICAL_ENGINE_URL }