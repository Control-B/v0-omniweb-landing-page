import { NextResponse } from 'next/server'
import { engineLogin, setSessionCookie } from '@/lib/auth/engine'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const result = await engineLogin(email, password)

  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.error ?? 'Login failed' }, { status: 401 })
  }

  // Store the engine JWT in an httpOnly cookie
  await setSessionCookie(result.data.access_token)

  return NextResponse.json({
    client_id: result.data.client_id,
    email: result.data.email,
    plan: result.data.plan,
    role: result.data.role,
  })
}
