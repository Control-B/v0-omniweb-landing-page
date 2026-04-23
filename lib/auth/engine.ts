/**
 * Server-side auth helpers for the Omniweb Engine.
 *
 * Supports TWO auth strategies:
 *
 * 1. **Clerk** (primary) — Clerk manages sign-in/sign-up. We get the Clerk
 *    session token and pass it as a Bearer token to the engine. The engine
 *    verifies the Clerk JWT via JWKS and resolves/creates the Client record.
 *
 * 2. **Legacy JWT** (fallback) — The engine issues JWTs stored in an
 *    httpOnly cookie named `omniweb_token`. Kept for API key auth and admin
 *    access until Clerk admin is fully migrated.
 */
import 'server-only'

import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { getServerEngineUrl } from '@/lib/engine-url'

// Resolve the engine base URL
const ENGINE_BASE_URL = getServerEngineUrl()

export const COOKIE_NAME = 'omniweb_token'

export type EngineUser = {
  client_id: string
  email: string
  plan: string
  role: string
}

export type EngineSession = {
  access_token: string
  user: EngineUser
}

/**
 * Get the current session — tries Clerk first, then falls back to legacy JWT cookie.
 */
export async function getSession(): Promise<EngineSession | null> {
  // 1. Try Clerk session
  const clerkSession = await getClerkSession()
  if (clerkSession) return clerkSession

  // 2. Fallback to legacy JWT cookie
  return getLegacySession()
}

/**
 * Get a Bearer token for API calls to the engine.
 * Prefers Clerk token, falls back to legacy cookie.
 */
export async function getEngineToken(): Promise<string | null> {
  // Try Clerk first
  const { getToken } = await auth()
  const clerkToken = await getToken()
  if (clerkToken) return clerkToken

  // Fallback to legacy cookie
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}

/**
 * Get session from Clerk auth.
 */
async function getClerkSession(): Promise<EngineSession | null> {
  try {
    const { userId, getToken } = await auth()
    if (!userId) return null

    const token = await getToken()
    if (!token) return null

    // Decode Clerk JWT payload to extract user info
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    )

    return {
      access_token: token,
      user: {
        client_id: payload.sub ?? userId,
        email: payload.email ?? payload.primary_email_address ?? '',
        plan: payload.plan ?? 'starter',
        role: payload.role ?? 'client',
      },
    }
  } catch {
    return null
  }
}

/**
 * Get session for the admin portal — only checks the legacy JWT cookie,
 * intentionally ignoring any Clerk session so that a Clerk-signed-in client
 * cannot accidentally access the admin dashboard.
 */
export async function getAdminSession(): Promise<EngineSession | null> {
  return getLegacySession()
}

/**
 * Get session from legacy JWT cookie.
 */
async function getLegacySession(): Promise<EngineSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    )

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    return {
      access_token: token,
      user: {
        client_id: payload.sub,
        email: payload.email ?? '',
        plan: payload.plan ?? 'starter',
        role: payload.role ?? 'client',
      },
    }
  } catch {
    return null
  }
}

/**
 * Store the engine JWT in an httpOnly cookie (legacy flow).
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()

  let maxAge = 60 * 60 * 24 // default 24h
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'),
    )
    if (payload.exp) {
      maxAge = Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
    }
  } catch {
    // use default
  }

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

/**
 * Clear the session cookie (legacy flow).
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Call the engine's login endpoint (legacy flow — kept for admin login).
 */
export async function engineLogin(
  email: string,
  password: string,
  portal: 'client' | 'admin' = 'client',
): Promise<{
  ok: boolean
  data?: { access_token: string; client_id: string; email: string; plan: string; role: string }
  error?: string
}> {
  const url = `${ENGINE_BASE_URL}/api/auth/login`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, portal }),
      cache: 'no-store',
    })

    const payload = await res.json().catch(() => ({}))

    if (!res.ok) {
      return { ok: false, error: payload.detail ?? payload.error ?? 'Login failed' }
    }

    return { ok: true, data: payload }
  } catch (err) {
    console.error(`[engine.ts] Login fetch failed → ${url}`, err)
    return { ok: false, error: 'Unable to reach authentication server. Please try again.' }
  }
}

/**
 * Call the engine's signup endpoint (legacy flow — kept for compatibility).
 */
export async function engineSignup(body: {
  name: string
  email: string
  password: string
  business_name?: string
  business_type?: string
}): Promise<{
  ok: boolean
  data?: { access_token: string; client_id: string; email: string; plan: string; role: string }
  error?: string
}> {
  const url = `${ENGINE_BASE_URL}/api/auth/signup`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const payload = await res.json().catch(() => ({}))

    if (!res.ok) {
      return { ok: false, error: payload.detail ?? payload.error ?? 'Signup failed' }
    }

    return { ok: true, data: payload }
  } catch (err) {
    console.error(`[engine.ts] Signup fetch failed → ${url}`, err)
    return { ok: false, error: 'Unable to reach authentication server. Please try again.' }
  }
}

/**
 * Call the engine's token refresh endpoint (legacy flow).
 */
export async function engineRefresh(
  currentToken: string,
): Promise<{ ok: boolean; data?: { access_token: string }; error?: string }> {
  const url = `${ENGINE_BASE_URL}/api/auth/refresh`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      cache: 'no-store',
    })

    const payload = await res.json().catch(() => ({}))

    if (!res.ok) {
      return { ok: false, error: payload.detail ?? 'Refresh failed' }
    }

    return { ok: true, data: payload }
  } catch (err) {
    console.error(`[engine.ts] Refresh fetch failed → ${url}`, err)
    return { ok: false, error: 'Network error' }
  }
}
