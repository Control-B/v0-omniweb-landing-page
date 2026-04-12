import { NextResponse } from 'next/server'
import { engineSignup, setSessionCookie } from '@/lib/auth/engine'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { name, email, password, business_name, business_type } = body as {
    name?: string
    email?: string
    password?: string
    business_name?: string
    business_type?: string
  }

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Name, email, and password are required' },
      { status: 400 },
    )
  }

  const result = await engineSignup({ name, email, password, business_name, business_type })

  if (!result.ok || !result.data) {
    return NextResponse.json(
      { error: result.error ?? 'Signup failed' },
      { status: result.error?.includes('already registered') ? 409 : 400 },
    )
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
