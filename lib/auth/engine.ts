/**
 * Server-side auth helpers for the Omniweb Engine JWT.
 *
 * The engine issues JWTs on POST /api/auth/login and POST /api/auth/signup.
 * We store the token in an httpOnly cookie named `omniweb_token` so it
 * travels automatically on every request and cannot be read by client JS.
 */
import 'server-only'

import { cookies } from 'next/headers'

// Resolve the engine base URL.
// NEXT_PUBLIC_OMNIWEB_ENGINE_URL is the canonical var shared with client code.
// OMNIWEB_ENGINE_URL is a server-only override (e.g. internal network URL).
// FASTAPI_ASSISTANT_URL is legacy / local-dev only — deprioritised because
// it is commonly set to http://127.0.0.1:8000 which breaks in production.
const ENGINE_BASE_URL = (
  process.env.OMNIWEB_ENGINE_URL ??
  process.env.NEXT_PUBLIC_OMNIWEB_ENGINE_URL ??
  process.env.OMNIWEB_ORCHESTRATOR_URL ??
  'https://omniweb-engine-rs6fr.ondigitalocean.app'
).replace(/\/$/, '')

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
 * Read the JWT from the httpOnly cookie and decode the payload (base64).
 * This does NOT verify the signature — the engine does that on every API call.
 * We only parse it to display user info on the frontend.
 */
export async function getSession(): Promise<EngineSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    )

    // Check expiry
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
 * Store the engine JWT in an httpOnly cookie.
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()

  // Parse expiry from JWT to set cookie max-age
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
 * Clear the session cookie.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Call the engine's login endpoint.
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
 * Call the engine's signup endpoint.
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
 * Call the engine's token refresh endpoint.
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
