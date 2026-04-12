import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'
import { getLiveKitServerUrl } from '@/lib/platform/config'
import { getSession } from '@/lib/auth/engine'
import { fetchOrchestratorJson, PlatformRequestError } from '@/lib/platform/orchestrator'

export const runtime = 'nodejs'

type OnboardingResponse = {
  tenant: {
    slug: string
    name: string
  }
}

export async function GET() {
  const livekitUrl = getLiveKitServerUrl()
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!livekitUrl || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        configured: false,
        error: 'LiveKit is not fully configured',
        livekitUrl,
      },
      { status: 503 },
    )
  }

  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let room = `omniweb-${session.user.client_id}`
  let tenantSlug: string | null = null

  try {
    const onboarding = await fetchOrchestratorJson<OnboardingResponse>('/api/v1/tenants/onboarding/current')
    tenantSlug = onboarding.tenant.slug
    room = `tenant-${tenantSlug}`
  } catch (error) {
    if (!(error instanceof PlatformRequestError) || error.status !== 404) {
      console.error('[livekit-token]', error)
    }
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: session.user.client_id,
    name: session.user.email || session.user.client_id,
    ttl: '10m',
    metadata: JSON.stringify({
      email: session.user.email,
      tenantSlug,
    }),
  })

  token.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
  })

  return NextResponse.json({
    configured: true,
    livekitUrl,
    room,
    token: await token.toJwt(),
    tenantSlug,
  })
}
