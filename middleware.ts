import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_NAME = 'omniweb_token'

/**
 * Lightweight middleware — no external auth, no DB calls.
 *
 * Checks whether the `omniweb_token` cookie exists and is a
 * non-expired JWT (we only inspect the exp claim, NOT the signature —
 * the engine validates the signature on every API call).
 *
 * Protected paths: /dashboard, /demo, /admin/dashboard
 * Public admin path: /admin (login/signup page)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin is the public login page — don't protect it
  // /admin/dashboard/* is protected
  const protectedPaths = ['/dashboard', '/demo', '/admin/dashboard']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  // Exact /admin path (login page) — if user is already authed as admin, redirect to dashboard
  if (pathname === '/admin' || pathname === '/admin/') {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf-8'),
          )
          if (payload.exp && payload.exp * 1000 > Date.now() && payload.role === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          }
        }
      } catch {
        // ignore — let them see login page
      }
    }
    return NextResponse.next()
  }

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  // /demo is special — it auto-creates a token, so let unauthenticated users through
  if (!token && pathname.startsWith('/demo')) {
    return NextResponse.next()
  }

  if (!token) {
    // Redirect to admin login for admin paths, regular signin for others
    const redirectTo = pathname.startsWith('/admin') ? '/admin' : '/signin'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // Quick expiry check (no signature verification — engine does that)
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('bad jwt')

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    )

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL('/signin', request.url))
      response.cookies.delete(COOKIE_NAME)
      return response
    }

    // Admin dashboard — only allow admin role
    if (pathname.startsWith('/admin/dashboard') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch {
    // /demo can work without auth — the page auto-creates a demo token
    if (pathname.startsWith('/demo')) {
      return NextResponse.next()
    }
    const redirectTo = pathname.startsWith('/admin') ? '/admin' : '/signin'
    const response = NextResponse.redirect(new URL(redirectTo, request.url))
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
