import type { WidgetSettingsRecord, WidgetSettingsUpdatePayload } from "@/lib/saas/types"

const WIDGET_REQUEST_TIMEOUT_MS = 12000

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), WIDGET_REQUEST_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Widget service timed out. Please try again.")
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function parseWidgetResponse(response: Response): Promise<WidgetSettingsRecord> {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.success || !payload?.data) {
    throw new Error(payload?.error?.message || payload?.error || "Unable to load widget settings.")
  }
  return payload.data as WidgetSettingsRecord
}

export async function fetchWidgetSettings(): Promise<WidgetSettingsRecord> {
  const response = await fetchWithTimeout("/api/widget/embed-code", {
    method: "GET",
    cache: "no-store",
  })
  return parseWidgetResponse(response)
}

export async function saveWidgetSettings(payload: WidgetSettingsUpdatePayload): Promise<WidgetSettingsRecord> {
  const response = await fetchWithTimeout("/api/widget/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  return parseWidgetResponse(response)
}