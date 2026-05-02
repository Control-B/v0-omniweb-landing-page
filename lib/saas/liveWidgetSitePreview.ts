/**
 * Builds a dashboard URL that shows a knowledge-source website behind the live widget preview.
 * The hash carries the widget path; the query carries the site URL (hash length limits).
 */

import {
  primaryKnowledgePageUrlFromSources,
  readPrimaryKnowledgePageUrlFromLocalStorage,
} from "@/lib/saas/widgetEmbed"

const HASH_PREFIX = "omniweb-preview"

/** Same URL priority as the AI Agent “indexed sources” preview line, or null if none. */
export function resolvePrimaryKnowledgeSiteUrl(options: {
  knowledgeSources: unknown
  tenantId: string
  websiteDomain: string | null
}): string | null {
  const fromAccount = primaryKnowledgePageUrlFromSources(options.knowledgeSources)
  if (fromAccount) {
    return fromAccount
  }
  if (typeof window !== "undefined") {
    const fromStorage = readPrimaryKnowledgePageUrlFromLocalStorage(options.tenantId)
    if (fromStorage) {
      return fromStorage
    }
  }
  if (options.websiteDomain?.trim()) {
    const d = options.websiteDomain.trim()
    return d.startsWith("http") ? d : `https://${d}`
  }
  return null
}

export function isAllowedWidgetPreviewPath(pathWithQuery: string): boolean {
  const normalized = pathWithQuery.trim()
  if (!normalized.startsWith("/widget/")) {
    return false
  }
  try {
    const parsed = new URL(normalized, "https://placeholder.invalid")
    return parsed.pathname.startsWith("/widget/")
  } catch {
    return false
  }
}

export function buildLiveWidgetSitePreviewUrl(options: { siteUrl: string; widgetPath: string }): string | null {
  const site = options.siteUrl.trim()
  if (!site) {
    return null
  }
  let origin: string
  try {
    const withProtocol = /^https?:\/\//i.test(site) ? site : `https://${site}`
    const u = new URL(withProtocol)
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return null
    }
    origin = u.origin
  } catch {
    return null
  }

  const widgetPath = options.widgetPath.trim()
  if (!widgetPath.startsWith("/")) {
    return null
  }
  if (!isAllowedWidgetPreviewPath(widgetPath)) {
    return null
  }

  const base = `/dashboard/widget-site-preview?site=${encodeURIComponent(origin)}`
  return `${base}#${HASH_PREFIX}${widgetPath}`
}

export const liveWidgetSitePreviewHashPrefix = HASH_PREFIX
