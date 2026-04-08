import { NextResponse } from 'next/server'
import { fetchOrchestratorJson, PlatformRequestError } from '@/lib/platform/orchestrator'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const payload = await fetchOrchestratorJson('/api/v1/tenants/current/shopify')
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof PlatformRequestError) {
      return NextResponse.json(error.payload ?? { error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Failed to load Shopify status' }, { status: 500 })
  }
}
