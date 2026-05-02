import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getEngineToken } from "@/lib/auth/engine"
import { fetchEngineWidgetSettings, patchEngineWidgetSettings } from "@/lib/saas/server/engineWidgetSnippet"
import { getOrRestoreTenantByClerkUserId } from "@/lib/saas/server/tenant"
import { ensureDefaultAgentConfig, updateAgentConfig } from "@/lib/saas/store"
import { buildWidgetEmbedScriptTag, resolveWidgetScriptOrigin } from "@/lib/saas/widgetEmbed"
import type { WidgetSettingsRecord, WidgetSettingsUpdatePayload } from "@/lib/saas/types"

function normalizeDomains(value: string[] | undefined) {
  return (value ?? []).map((domain) => domain.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "")).filter(Boolean)
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: { message: "Authentication required" } }, { status: 401 })
  }

  const tenant = await getOrRestoreTenantByClerkUserId(userId)
  if (!tenant) {
    return NextResponse.json({ success: false, error: { message: "Workspace not found" } }, { status: 404 })
  }

  const payload = (await request.json().catch(() => ({}))) as WidgetSettingsUpdatePayload

  const engineBody: Record<string, unknown> = {}
  if (payload.widgetEnabled !== undefined) engineBody.widgetEnabled = payload.widgetEnabled
  if (payload.allowedDomains !== undefined) engineBody.allowedDomains = payload.allowedDomains
  if (payload.widgetPrimaryColor !== undefined) engineBody.widgetPrimaryColor = payload.widgetPrimaryColor
  if (payload.widgetPosition !== undefined) engineBody.widgetPosition = payload.widgetPosition
  if (payload.widgetWelcomeMessage !== undefined) engineBody.widgetWelcomeMessage = payload.widgetWelcomeMessage
  if (payload.voiceEnabled !== undefined) engineBody.voiceEnabled = payload.voiceEnabled

  const engineToken = await getEngineToken()

  const existing = await ensureDefaultAgentConfig(tenant.id)
  const existingWidgetSettings = existing.widgetSettings ?? {}
  const allowedDomains = payload.allowedDomains === undefined ? existingWidgetSettings.allowedDomains ?? [] : normalizeDomains(payload.allowedDomains)
  const nextChannels = new Set(existing.enabledChannels ?? ["website_chat", "ai_voice_call"])

  if (payload.voiceEnabled !== undefined) {
    if (payload.voiceEnabled) {
      nextChannels.add("ai_voice_call")
    } else {
      nextChannels.delete("ai_voice_call")
    }
  }

  if (payload.textEnabled !== undefined) {
    if (payload.textEnabled) {
      nextChannels.add("website_chat")
    } else {
      nextChannels.delete("website_chat")
    }
  }

  const config = await updateAgentConfig(tenant.id, {
    active: payload.widgetEnabled ?? existing.active,
    welcomeMessage: payload.widgetWelcomeMessage ?? existing.welcomeMessage,
    enabledChannels: Array.from(nextChannels),
    widgetSettings: {
      ...existingWidgetSettings,
      allowedDomains,
      widgetPrimaryColor: payload.widgetPrimaryColor ?? existingWidgetSettings.widgetPrimaryColor ?? "#22d3ee",
      widgetPosition: payload.widgetPosition ?? existingWidgetSettings.widgetPosition ?? "bottom-right",
    },
  })

  const websiteDomain = config.websiteDomain || tenant.websiteDomain || allowedDomains[0] || null
  const scriptOrigin = resolveWidgetScriptOrigin({
    publicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    websiteDomain,
  })
  const scriptUrl = `${scriptOrigin.replace(/\/$/, "")}/widget.js`
  const embedCode = buildWidgetEmbedScriptTag(tenant.id, scriptOrigin)
  const domain = websiteDomain?.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "")
  const savedWidgetSettings = config.widgetSettings ?? {}

  let data: WidgetSettingsRecord = {
    publicWidgetId: tenant.id,
    embedCode,
    scriptUrl,
    allowedDomains: savedWidgetSettings.allowedDomains?.length ? savedWidgetSettings.allowedDomains : (domain ? [domain] : []),
    widgetEnabled: config.active,
    textEnabled: Boolean((config.enabledChannels ?? ["website_chat"]).includes("website_chat")),
    widgetInstalled: false,
    widgetLastSeenAt: null,
    widgetPrimaryColor: savedWidgetSettings.widgetPrimaryColor || "#22d3ee",
    widgetPosition: savedWidgetSettings.widgetPosition || "bottom-right",
    widgetWelcomeMessage: config.welcomeMessage,
    voiceEnabled: Boolean((config.enabledChannels ?? ["website_chat", "ai_voice_call"]).includes("ai_voice_call")),
    businessName: config.businessName || tenant.businessName || "Omniweb",
    agentMode: config.agentMode || "general_lead_gen",
  }

  if (engineToken && Object.keys(engineBody).length > 0) {
    const fromEngine = await patchEngineWidgetSettings(engineToken, engineBody)
    if (fromEngine) {
      data = {
        ...data,
        publicWidgetId: fromEngine.publicWidgetId,
        embedCode: fromEngine.embedCode,
        scriptUrl: fromEngine.scriptUrl,
        widgetInstalled: fromEngine.widgetInstalled,
        widgetLastSeenAt: fromEngine.widgetLastSeenAt,
        widgetPrimaryColor: fromEngine.widgetPrimaryColor,
        widgetPosition: fromEngine.widgetPosition,
        widgetWelcomeMessage: fromEngine.widgetWelcomeMessage,
        allowedDomains: fromEngine.allowedDomains.length ? fromEngine.allowedDomains : data.allowedDomains,
        voiceEnabled: fromEngine.voiceEnabled,
        businessName: fromEngine.businessName,
        agentMode: fromEngine.agentMode,
        widgetEnabled: fromEngine.widgetEnabled,
        textEnabled: data.textEnabled,
      }
    } else {
      const fallbackSnippet = await fetchEngineWidgetSettings(engineToken)
      if (fallbackSnippet) {
        data = {
          ...data,
          publicWidgetId: fallbackSnippet.publicWidgetId,
          embedCode: fallbackSnippet.embedCode,
          scriptUrl: fallbackSnippet.scriptUrl,
          widgetInstalled: fallbackSnippet.widgetInstalled,
          widgetLastSeenAt: fallbackSnippet.widgetLastSeenAt,
        }
      }
    }
  }

  return NextResponse.json({ success: true, data })
}
