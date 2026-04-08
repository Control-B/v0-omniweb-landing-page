import { NextRequest, NextResponse } from 'next/server'
import { getOrchestratorBaseUrl } from '@/lib/platform/config'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const tenantSlug = process.env.OMNIWEB_PUBLIC_TENANT_SLUG?.trim()

  if (!tenantSlug) {
    return NextResponse.json(
      { error: 'OMNIWEB_PUBLIC_TENANT_SLUG is not configured' },
      { status: 503 },
    )
  }

  const body = await request.json().catch(() => ({}))

  const response = await fetch(`${getOrchestratorBaseUrl()}/api/v1/providers/livekit/bootstrap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-tenant-slug': tenantSlug,
    },
    body: JSON.stringify({
      session_id: body.sessionId ?? null,
      current_path: body.currentPath ?? null,
      visitor_context: body.visitorContext ?? {},
      session_config: {
        surface: 'landing-page',
        participant_name: 'Website Visitor',
        ...(process.env.LIVEKIT_AGENT_NAME ? { agent_name: process.env.LIVEKIT_AGENT_NAME } : {}),
      },
      ttl_seconds: 600,
      external_session_id: body.externalSessionId ?? null,
    }),
    cache: 'no-store',
  })

  const raw = await response.text()
  const payload = raw
    ? (() => {
        try {
          return JSON.parse(raw)
        } catch {
          return { raw }
        }
      })()
    : null

  if (!response.ok) {
    return NextResponse.json(
      payload ?? { error: 'Failed to bootstrap LiveKit session' },
      { status: response.status },
    )
  }

  return NextResponse.json(payload)
}