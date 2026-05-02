import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getEngineToken } from "@/lib/auth/engine"
import { getServerEngineUrl } from "@/lib/engine-url"
import { getOrRestoreTenantByClerkUserId } from "@/lib/saas/server/tenant"
import { ensureDefaultAgentConfig, updateAgentConfig } from "@/lib/saas/store"
import type { AgentConfigUpdatePayload } from "@/lib/saas/types"

async function syncAgentConfigToEngine(tenantId: string, payload: AgentConfigUpdatePayload, token: string | null) {
  if (!token) return

  const target = new URL(`/api/agent-config/${tenantId}`, getServerEngineUrl())
  const instructions = payload.customInstructions?.trim()
  const response = await fetch(target, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_name: payload.agentName,
      agent_greeting: payload.welcomeMessage,
      system_prompt: instructions,
      business_name: payload.businessName,
      business_type: payload.businessType,
      industry: payload.industry,
      website_domain: payload.websiteDomain,
      booking_url: payload.bookingUrl,
      agent_mode: payload.agentMode,
      goals: payload.goals,
      supported_languages: payload.supportedLanguages,
      enabled_channels: payload.enabledChannels,
      lead_capture_fields: payload.leadCaptureFields,
      enabled_features: payload.enabledFeatures,
      qualification_rules: payload.qualificationRules,
      custom_instructions: instructions,
      custom_context: instructions,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? body?.error ?? "Unable to sync agent configuration.")
  }
}

export async function GET(request: NextRequest) {
  void request

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const tenant = await getOrRestoreTenantByClerkUserId(userId)
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

  const tenant = await getOrRestoreTenantByClerkUserId(userId)
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

  await syncAgentConfigToEngine(tenant.id, payload, await getEngineToken()).catch((syncError) => {
    console.warn(
      "Agent settings saved locally but backend sync failed:",
      syncError instanceof Error ? syncError.message : syncError,
    )
  })

  return NextResponse.json(config)
}
