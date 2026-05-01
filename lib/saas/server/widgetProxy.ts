import "server-only"

import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getEngineToken } from "@/lib/auth/engine"
import { getServerEngineUrl } from "@/lib/engine-url"

const WIDGET_PROXY_TIMEOUT_MS = 10000

export async function proxyWidgetRequest(request: NextRequest, path: string) {
  const { userId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  let token = await getEngineToken()
  if (!token) {
    token = await getToken()
  }

  if (!token) {
    return NextResponse.json({ error: "Unable to acquire session token" }, { status: 401 })
  }

  const target = new URL(`/api/widget${path}`, getServerEngineUrl())
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
  const timeoutId = setTimeout(() => controller.abort(), WIDGET_PROXY_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      signal: controller.signal,
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError"
    return NextResponse.json(
      {
        success: false,
        error: {
          code: timedOut ? "WIDGET_PROXY_TIMEOUT" : "WIDGET_PROXY_ERROR",
          message: timedOut
            ? "The widget service is taking too long to respond. Please try again."
            : "Unable to reach the widget service. Please try again.",
        },
      },
      { status: timedOut ? 504 : 502 },
    )
  } finally {
    clearTimeout(timeoutId)
  }

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  })
}