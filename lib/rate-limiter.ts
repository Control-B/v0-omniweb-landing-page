import { NextRequest, NextResponse } from "next/server"

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (keyed by prefix + IP)
const ipStore = new Map<string, RateLimitRecord>()

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of ipStore.entries()) {
      if (value.resetTime <= now) {
        ipStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  return "127.0.0.1"
}

export interface RateLimitOptions {
  limit: number
  windowMs: number
  prefix?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  const ip = getClientIp(request)
  const key = `${options.prefix || "global"}:${ip}`
  const now = Date.now()

  let record = ipStore.get(key)

  if (!record || record.resetTime <= now) {
    record = {
      count: 1,
      resetTime: now + options.windowMs,
    }
    ipStore.set(key, record)
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetTime: record.resetTime,
    }
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count += 1
  ipStore.set(key, record)

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    resetTime: record.resetTime,
  }
}

export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSeconds = Math.ceil((result.resetTime - Date.now()) / 1000)
  return NextResponse.json(
    {
      error: "Too many requests",
      message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
        "Retry-After": String(retryAfterSeconds),
      },
    }
  )
}
