import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { ensureDefaultAgentConfig, getTenantByClerkUserId, updateAgentConfig } from "@/lib/saas/store"
import type { AgentConfigUpdatePayload } from "@/lib/saas/types"

export async function GET(request: NextRequest) {
  void request

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const tenant = await getTenantByClerkUserId(userId)
  if (!tenant) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  const config = await ensureDefaultAgentConfig(tenant.id)
  return NextResponse.json(config)
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const tenant = await getTenantByClerkUserId(userId)
  if (!tenant) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  const payload = (await request.json().catch(() => ({}))) as AgentConfigUpdatePayload
  const config = await updateAgentConfig(tenant.id, {
    agentName: payload.agentName,
    welcomeMessage: payload.welcomeMessage,
    tone: payload.tone === "professional" ? "professional" : undefined,
    goals: payload.goals,
    supportedLanguages: payload.supportedLanguages,
    active: payload.active,
    businessName: payload.businessName,
    businessType: payload.businessType,
    industry: payload.industry,
    websiteDomain: payload.websiteDomain,
    bookingUrl: payload.bookingUrl,
    agentMode: payload.agentMode,
    enabledChannels: payload.enabledChannels,
    leadCaptureFields: payload.leadCaptureFields,
    enabledFeatures: payload.enabledFeatures,
    qualificationRules: payload.qualificationRules,
    customInstructions: payload.customInstructions,
  })

  return NextResponse.json(config)
}
