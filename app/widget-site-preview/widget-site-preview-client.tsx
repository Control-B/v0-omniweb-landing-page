"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { SiteAiWidget } from "@/components/site-ai-widget"
import { liveWidgetSitePreviewHashPrefix } from "@/lib/saas/liveWidgetSitePreview"

function parseWidgetSegmentFromHash(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash
  if (!raw.startsWith(liveWidgetSitePreviewHashPrefix)) {
    return null
  }
  const rest = raw.slice(liveWidgetSitePreviewHashPrefix.length)
  if (!rest.startsWith("/widget/")) {
    return null
  }
  try {
    return decodeURIComponent(rest)
  } catch {
    return rest
  }
}

function parseWidgetRoute(segment: string): { agentId: string; accentColor: string; defaultOpen: boolean } | null {
  try {
    const u = new URL(segment, typeof window !== "undefined" ? window.location.origin : "https://placeholder.invalid")
    const match = u.pathname.match(/^\/widget\/([^/]+)/)
    const agentId = match?.[1]
    if (!agentId) {
      return null
    }
    const accentColor = u.searchParams.get("color") || "#4f46e5"
    const defaultOpen = u.searchParams.get("open") === "1" || u.searchParams.get("panel") === "1"
    return { agentId, accentColor, defaultOpen }
  } catch {
    return null
  }
}

function normalizeEmbeddedPageUrl(raw: string | null): string | null {
  if (!raw?.trim()) {
    return null
  }
  const trimmed = raw.trim()
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const u = new URL(withProtocol)
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return null
    }
    return u.toString()
  } catch {
    return null
  }
}

function WidgetSitePreviewInner() {
  const searchParams = useSearchParams()
  const pageParam = searchParams.get("page")

  const [hashSegment, setHashSegment] = useState<string | null>(() =>
    typeof window !== "undefined" ? parseWidgetSegmentFromHash(window.location.hash) : null,
  )

  useEffect(() => {
    const sync = () => {
      setHashSegment(parseWidgetSegmentFromHash(window.location.hash))
    }
    sync()
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])

  const iframeSrc = useMemo(() => normalizeEmbeddedPageUrl(pageParam), [pageParam])
  const widgetParts = useMemo(() => (hashSegment ? parseWidgetRoute(hashSegment) : null), [hashSegment])

  if (!hashSegment || !widgetParts) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center">
        <p className="text-lg font-semibold text-white">Preview link incomplete</p>
        <p className="max-w-md text-sm text-slate-400">
          Open &quot;One-click live widget preview&quot; from the AI Agent page after configuring your widget.
        </p>
        <Link href="/dashboard/ai-agent" className="mt-4 text-sm font-medium text-cyan-400 hover:text-cyan-300">
          Back to AI Agent
        </Link>
      </div>
    )
  }

  if (!iframeSrc) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center">
        <p className="text-lg font-semibold text-white">No website URL for preview</p>
        <p className="max-w-md text-sm text-slate-400">
          Add a knowledge source URL (or connect your domain) in the dashboard, then try the preview again.
        </p>
        <Link href="/dashboard/knowledge" className="mt-4 text-sm font-medium text-cyan-400 hover:text-cyan-300">
          Knowledge sources
        </Link>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <iframe
        title="Website preview"
        src={iframeSrc}
        className="absolute inset-0 h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <SiteAiWidget agentId={widgetParts.agentId} accentColor={widgetParts.accentColor} defaultOpen={widgetParts.defaultOpen} embed />
      <Link
        href="/dashboard/ai-agent"
        className="fixed left-4 top-4 z-[10001] inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/85 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>
    </div>
  )
}

export function WidgetSitePreviewClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 text-sm text-slate-400">Loading preview…</div>
      }
    >
      <WidgetSitePreviewInner />
    </Suspense>
  )
}
