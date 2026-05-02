import "server-only"

import { getServerEngineUrl } from "@/lib/engine-url"
import type { WidgetSettingsRecord } from "@/lib/saas/types"

type EngineEnvelope<T> = { success?: boolean; data?: T }

function pickRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as EngineEnvelope<unknown>
  if (o.data !== undefined && typeof o.data === "object" && o.data !== null) {
    return o.data as Record<string, unknown>
  }
  return raw as Record<string, unknown>
}

/** Maps Omniweb Engine `/api/widget/*` payload to dashboard widget settings. */
export function mapEngineWidgetPayloadToRecord(
  raw: unknown,
  textEnabledFallback: boolean,
): WidgetSettingsRecord | null {
  const d = pickRecord(raw)
  if (!d) return null
  const publicWidgetId = d.publicWidgetId
  const embedCode = d.embedCode
  if (typeof publicWidgetId !== "string" || typeof embedCode !== "string") {
    return null
  }
  return {
    publicWidgetId,
    embedCode,
    scriptUrl: typeof d.scriptUrl === "string" ? d.scriptUrl : "",
    allowedDomains: Array.isArray(d.allowedDomains) ? (d.allowedDomains as string[]) : [],
    widgetEnabled: Boolean(d.widgetEnabled),
    textEnabled: typeof d.textEnabled === "boolean" ? d.textEnabled : textEnabledFallback,
    widgetInstalled: Boolean(d.widgetInstalled),
    widgetLastSeenAt: typeof d.widgetLastSeenAt === "string" || d.widgetLastSeenAt === null ? (d.widgetLastSeenAt as string | null) : null,
    widgetPrimaryColor: typeof d.widgetPrimaryColor === "string" ? d.widgetPrimaryColor : "#22d3ee",
    widgetPosition: d.widgetPosition === "bottom-left" ? "bottom-left" : "bottom-right",
    widgetWelcomeMessage: typeof d.widgetWelcomeMessage === "string" ? d.widgetWelcomeMessage : "",
    voiceEnabled: Boolean(d.voiceEnabled),
    businessName: typeof d.businessName === "string" ? d.businessName : "Omniweb",
    agentMode: typeof d.agentMode === "string" ? d.agentMode : "general_lead_gen",
  }
}

export async function fetchEngineWidgetSettings(accessToken: string): Promise<WidgetSettingsRecord | null> {
  const target = new URL("/api/widget/embed-code", getServerEngineUrl())
  const response = await fetch(target, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })
  if (!response.ok) {
    return null
  }
  const json = await response.json().catch(() => null)
  return mapEngineWidgetPayloadToRecord(json, true)
}

export async function patchEngineWidgetSettings(
  accessToken: string,
  body: Record<string, unknown>,
): Promise<WidgetSettingsRecord | null> {
  const target = new URL("/api/widget/settings", getServerEngineUrl())
  const response = await fetch(target, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  if (!response.ok) {
    return null
  }
  const json = await response.json().catch(() => null)
  return mapEngineWidgetPayloadToRecord(json, true)
}
