import 'server-only'

import { getSession } from '@/lib/auth/engine'
import { getOrchestratorBaseUrl } from '@/lib/platform/config'

export class PlatformRequestError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'PlatformRequestError'
    this.status = status
    this.payload = payload
  }
}

export async function getAuthenticatedSession() {
  const session = await getSession()

  if (!session) {
    throw new PlatformRequestError('Authentication required', 401, null)
  }

  return session
}

export async function fetchOrchestratorJson<T>(path: string, init: RequestInit = {}) {
  const session = await getAuthenticatedSession()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${session.access_token}`)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${getOrchestratorBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  })

  const raw = await response.text()
  const payload = raw
    ? (() => {
        try {
          return JSON.parse(raw)
        } catch {
          return { raw }
        }
      })()
    : null

  if (!response.ok) {
    const message =
      (typeof payload === 'object' && payload && 'detail' in payload && typeof payload.detail === 'string'
        ? payload.detail
        : null) ??
      (typeof payload === 'object' && payload && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : null) ??
      `Platform request failed (${response.status})`

    throw new PlatformRequestError(message, response.status, payload)
  }

  return payload as T
}
