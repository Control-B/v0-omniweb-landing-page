import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { COOKIE_NAME } from "@/lib/auth/engine"
import { getServerEngineUrl } from "@/lib/engine-url"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ path: string[] }>
}

async function proxyEngineRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const token = (await cookies()).get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 })
  }

  const target = new URL(`/api/${path.join("/")}`, getServerEngineUrl())
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value)
  })

  const headers = new Headers(request.headers)
  headers.set("Authorization", `Bearer ${token}`)
  headers.set("Accept", "application/json")
  headers.delete("host")
  headers.delete("cookie")
  headers.delete("content-length")

  const hasBody = !["GET", "HEAD"].includes(request.method)
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete("content-encoding")
  responseHeaders.delete("transfer-encoding")

  return new NextResponse(await response.text(), {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export const GET = proxyEngineRequest
export const POST = proxyEngineRequest
export const PUT = proxyEngineRequest
export const PATCH = proxyEngineRequest
export const DELETE = proxyEngineRequest
