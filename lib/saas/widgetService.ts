import type { WidgetSettingsRecord, WidgetSettingsUpdatePayload } from "@/lib/saas/types"

async function parseWidgetResponse(response: Response): Promise<WidgetSettingsRecord> {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.success || !payload?.data) {
    throw new Error(payload?.error?.message || payload?.error || "Unable to load widget settings.")
  }
  return payload.data as WidgetSettingsRecord
}

export async function fetchWidgetSettings(): Promise<WidgetSettingsRecord> {
  const response = await fetch("/api/widget/embed-code", {
    method: "GET",
    cache: "no-store",
  })
  return parseWidgetResponse(response)
}

export async function saveWidgetSettings(payload: WidgetSettingsUpdatePayload): Promise<WidgetSettingsRecord> {
  const response = await fetch("/api/widget/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  return parseWidgetResponse(response)
}