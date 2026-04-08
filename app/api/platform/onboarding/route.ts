import { NextResponse } from 'next/server'
import { fetchOrchestratorJson, PlatformRequestError } from '@/lib/platform/orchestrator'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const payload = await fetchOrchestratorJson('/api/v1/tenants/onboarding/current')
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof PlatformRequestError) {
      return NextResponse.json(error.payload ?? { error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Failed to load onboarding state' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = await fetchOrchestratorJson('/api/v1/tenants/onboarding', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    if (error instanceof PlatformRequestError) {
      return NextResponse.json(error.payload ?? { error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Failed to provision onboarding' }, { status: 500 })
  }
}
