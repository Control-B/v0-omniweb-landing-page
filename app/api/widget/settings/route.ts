import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { ensureDefaultAgentConfig, getTenantByClerkUserId, updateAgentConfig } from "@/lib/saas/store"
import { buildWidgetEmbedScriptTag, resolveWidgetScriptOrigin } from "@/lib/saas/widgetEmbed"
import type { WidgetSettingsRecord, WidgetSettingsUpdatePayload } from "@/lib/saas/types"

export async function PATCH(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: { message: "Authentication required" } }, { status: 401 })
  }

  const tenant = await getTenantByClerkUserId(userId)
  if (!tenant) {
    return NextResponse.json({ success: false, error: { message: "Workspace not found" } }, { status: 404 })
  }

  const payload = (await request.json().catch(() => ({}))) as WidgetSettingsUpdatePayload
  const existing = await ensureDefaultAgentConfig(tenant.id)
  const config = await updateAgentConfig(tenant.id, {
    active: payload.widgetEnabled ?? existing.active,
    welcomeMessage: payload.widgetWelcomeMessage ?? existing.welcomeMessage,
    enabledChannels: payload.voiceEnabled === undefined
      ? existing.enabledChannels
      : payload.voiceEnabled
        ? Array.from(new Set([...(existing.enabledChannels ?? ["website_chat"]), "ai_voice_call"]))
        : (existing.enabledChannels ?? ["website_chat"]).filter((channel) => channel !== "ai_voice_call"),
  })

  const websiteDomain = config.websiteDomain || tenant.websiteDomain || payload.allowedDomains?.[0] || null
  const scriptOrigin = resolveWidgetScriptOrigin({
    publicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    websiteDomain,
  })
  const scriptUrl = `${scriptOrigin.replace(/\/$/, "")}/widget.js`
  const embedCode = buildWidgetEmbedScriptTag(tenant.id, scriptOrigin)
  const domain = websiteDomain?.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "")

  const data: WidgetSettingsRecord = {
    publicWidgetId: tenant.id,
    embedCode,
    scriptUrl,
    allowedDomains: payload.allowedDomains?.length ? payload.allowedDomains : (domain ? [domain] : []),
    widgetEnabled: config.active,
    widgetInstalled: false,
    widgetLastSeenAt: null,
    widgetPrimaryColor: payload.widgetPrimaryColor || "#22d3ee",
    widgetPosition: payload.widgetPosition || "bottom-right",
    widgetWelcomeMessage: config.welcomeMessage,
    voiceEnabled: Boolean(config.enabledChannels?.includes("ai_voice_call")),
    businessName: config.businessName || tenant.businessName || "Omniweb",
    agentMode: config.agentMode || "general_lead_gen",
  }

  return NextResponse.json({ success: true, data })
}