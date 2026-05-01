import "server-only"

import { NextRequest, NextResponse } from "next/server"
import { getEngineToken } from "@/lib/auth/engine"
import { getServerEngineUrl } from "@/lib/engine-url"

const ENGINE_PROXY_TIMEOUT_MS = 15000

export async function proxyEngineRequest(request: NextRequest, path: string) {
  const token = await getEngineToken()
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const target = new URL(path, getServerEngineUrl())
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value)
  })

  const headers = new Headers()
  headers.set("Authorization", `Bearer ${token}`)
  headers.set("Accept", "application/json")

  const hasBody = !["GET", "HEAD"].includes(request.method)
  if (hasBody) {
    headers.set("Content-Type", request.headers.get("content-type") || "application/json")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ENGINE_PROXY_TIMEOUT_MS)

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      signal: controller.signal,
    })
    const text = await response.text()
    return new NextResponse(text, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError"
    return NextResponse.json(
      { error: timedOut ? "AI Telephony service timed out." : "Unable to reach AI Telephony service." },
      { status: timedOut ? 504 : 502 },
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
