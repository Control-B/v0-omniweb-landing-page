import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/engine'

export async function POST(request: Request) {
  await clearSessionCookie()
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/signin`, { status: 303 })
}
