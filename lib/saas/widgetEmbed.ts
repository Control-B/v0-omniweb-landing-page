/**
 * Widget embed snippet helpers (safe for client + server).
 */

export function normalizeSiteOrigin(input: string | null | undefined): string | null {
  if (!input?.trim()) {
    return null
  }
  try {
    const raw = input.trim()
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const parsed = new URL(withProtocol)
    if (!parsed.hostname) {
      return null
    }
    return parsed.origin
  } catch {
    return null
  }
}

export function primaryKnowledgeOriginFromSources(sources: unknown): string | null {
  if (!Array.isArray(sources)) {
    return null
  }
  for (const item of sources) {
    if (!item || typeof item !== "object") {
      continue
    }
    const url = (item as { url?: string }).url
    if (!url || typeof url !== "string") {
      continue
    }
    const origin = normalizeSiteOrigin(url)
    if (origin) {
      return origin
    }
  }
  return null
}

export function primaryKnowledgePageUrlFromSources(sources: unknown): string | null {
  if (!Array.isArray(sources)) {
    return null
  }
  for (const item of sources) {
    if (!item || typeof item !== "object") {
      continue
    }
    const url = (item as { url?: string }).url
    if (!url || typeof url !== "string" || !url.trim()) {
      continue
    }
    const raw = url.trim()
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  }
  return null
}

export function resolveWidgetScriptOrigin(options: {
  publicAppUrl?: string | null
  knowledgeOrigin?: string | null
  websiteDomain?: string | null
}): string {
  const fromEnv = options.publicAppUrl?.trim().replace(/\/$/, "")
  if (fromEnv) {
    return fromEnv
  }
  const fromKnowledge = options.knowledgeOrigin?.trim().replace(/\/$/, "")
  if (fromKnowledge) {
    return fromKnowledge
  }
  const fromTenant = normalizeSiteOrigin(options.websiteDomain ?? null)
  if (fromTenant) {
    return fromTenant
  }
  return "https://YOUR_DOMAIN"
}

export function buildWidgetEmbedScriptTag(tenantId: string, scriptOrigin: string) {
  const origin = scriptOrigin.replace(/\/$/, "")
  return `<script src="${origin}/widget.js" data-tenant-id="${tenantId}" async></script>`
}

export function knowledgeSourcesStorageKey(tenantId: string): string {
  return `omniweb-dashboard:${tenantId}:knowledge`
}

export function readPrimaryKnowledgeOriginFromLocalStorage(tenantId: string): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const raw = window.localStorage.getItem(knowledgeSourcesStorageKey(tenantId))
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as unknown
    return primaryKnowledgeOriginFromSources(parsed)
  } catch {
    return null
  }
}

export function readPrimaryKnowledgePageUrlFromLocalStorage(tenantId: string): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const raw = window.localStorage.getItem(knowledgeSourcesStorageKey(tenantId))
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as unknown
    return primaryKnowledgePageUrlFromSources(parsed)
  } catch {
    return null
  }
}
