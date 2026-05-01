import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { ensureDefaultAgentConfig, getTenantByClerkUserId } from "@/lib/saas/store"
import { buildWidgetEmbedScriptTag, resolveWidgetScriptOrigin } from "@/lib/saas/widgetEmbed"
import type { WidgetSettingsRecord } from "@/lib/saas/types"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: { message: "Authentication required" } }, { status: 401 })
  }

  const tenant = await getTenantByClerkUserId(userId)
  if (!tenant) {
    return NextResponse.json({ success: false, error: { message: "Workspace not found" } }, { status: 404 })
  }

  const config = await ensureDefaultAgentConfig(tenant.id)
  const savedWidgetSettings = config.widgetSettings ?? {}
  const websiteDomain = config.websiteDomain || tenant.websiteDomain || savedWidgetSettings.allowedDomains?.[0] || null
  const scriptOrigin = resolveWidgetScriptOrigin({
    publicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    websiteDomain,
  })
  const scriptUrl = `${scriptOrigin.replace(/\/$/, "")}/widget.js`
  const embedCode = buildWidgetEmbedScriptTag(tenant.id, scriptOrigin)
  const domain = websiteDomain?.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "")
  const allowedDomains = savedWidgetSettings.allowedDomains?.length ? savedWidgetSettings.allowedDomains : (domain ? [domain] : [])

  const data: WidgetSettingsRecord = {
    publicWidgetId: tenant.id,
    embedCode,
    scriptUrl,
    allowedDomains,
    widgetEnabled: config.active,
    widgetInstalled: false,
    widgetLastSeenAt: null,
    widgetPrimaryColor: savedWidgetSettings.widgetPrimaryColor || "#22d3ee",
    widgetPosition: savedWidgetSettings.widgetPosition || "bottom-right",
    widgetWelcomeMessage: config.welcomeMessage,
    voiceEnabled: Boolean(config.enabledChannels?.includes("ai_voice_call")),
    businessName: config.businessName || tenant.businessName || "Omniweb",
    agentMode: config.agentMode || "general_lead_gen",
  }

  return NextResponse.json({ success: true, data })
}
