import { NextResponse } from 'next/server'
import { getAuthenticatedSession, PlatformRequestError } from '@/lib/platform/orchestrator'
import { getServerEngineUrl } from '@/lib/engine-url'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getAuthenticatedSession()
    const response = await fetch(
      `${getServerEngineUrl()}/api/shopify/install-status/${session.user.client_id}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      },
    )
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status })
    }
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof PlatformRequestError) {
      return NextResponse.json(error.payload ?? { error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Failed to load Shopify status' }, { status: 500 })
  }
}
