import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_NAME = 'omniweb_token'

/**
 * Lightweight middleware — no Supabase, no DB calls.
 *
 * Checks whether the `omniweb_token` cookie exists and is a
 * non-expired JWT (we only inspect the exp claim, NOT the signature —
 * the engine validates the signature on every API call).
 *
 * Protected paths (currently /dashboard) are redirected to /signin
 * when there is no valid token.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect specific paths
  const protectedPaths = ['/dashboard']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Quick expiry check (no signature verification — engine does that)
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('bad jwt')

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    )

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired — clear cookie and redirect
      const response = NextResponse.redirect(new URL('/signin', request.url))
      response.cookies.delete(COOKIE_NAME)
      return response
    }
  } catch {
    const response = NextResponse.redirect(new URL('/signin', request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
