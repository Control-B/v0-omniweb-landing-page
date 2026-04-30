import "server-only"

import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { getServerEngineUrl } from "@/lib/engine-url"

export async function proxyWidgetRequest(request: NextRequest, path: string) {
  const { userId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const token = await getToken()
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

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  })

  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  })
}