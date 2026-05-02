import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { getOrRestoreTenantByClerkUserId } from "@/lib/saas/server/tenant"
import { ensureDefaultAgentConfig, updateAgentConfig } from "@/lib/saas/store"
import type { KnowledgeSourceRecord } from "@/lib/saas/types"

function normalizeSources(value: unknown): KnowledgeSourceRecord[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      id: String(item.id ?? Date.now()),
      url: String(item.url ?? "").trim(),
      details: String(item.details ?? ""),
      status: item.status === "ready" ? "ready" : "indexing",
      addedAt: item.addedAt ? new Date(String(item.addedAt)).toISOString() : new Date().toISOString(),
    }))
    .filter((item) => item.url.length > 0)
}

async function getTenantForRequest() {
  const { userId } = await auth()
  if (!userId) {
    return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) }
  }

  const tenant = await getOrRestoreTenantByClerkUserId(userId)
  if (!tenant) {
    return { error: NextResponse.json({ error: "Workspace not found" }, { status: 404 }) }
  }

  return { tenant }
}

export async function GET() {
  const result = await getTenantForRequest()
  if (result.error) {
    return result.error
  }

  const config = await ensureDefaultAgentConfig(result.tenant.id)
  return NextResponse.json({ sources: config.knowledgeSources ?? [] })
}

export async function PATCH(request: NextRequest) {
  const result = await getTenantForRequest()
  if (result.error) {
    return result.error
  }

  const payload = (await request.json().catch(() => ({}))) as { sources?: unknown }
  const sources = normalizeSources(payload.sources)
  const config = await updateAgentConfig(result.tenant.id, { knowledgeSources: sources })

  return NextResponse.json({ sources: config.knowledgeSources ?? [] })
}
