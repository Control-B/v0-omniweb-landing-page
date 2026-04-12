import { NextResponse } from 'next/server'

/**
 * Legacy OAuth callback — no longer used since we removed external auth.
 * If someone hits this URL, just redirect them to signin.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/signin`)
}
