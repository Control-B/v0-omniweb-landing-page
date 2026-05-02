"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
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

function WidgetSitePreviewInner() {
  const searchParams = useSearchParams()
  const siteParam = searchParams.get("site")

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

  const siteOrigin = useMemo(() => {
    if (!siteParam?.trim()) return null
    try {
      const u = new URL(siteParam)
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return null
      }
      return u.origin
    } catch {
      return null
    }
  }, [siteParam])

  const widgetParts = useMemo(() => (hashSegment ? parseWidgetRoute(hashSegment) : null), [hashSegment])

  if (!hashSegment || !widgetParts) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center">
        <p className="text-lg font-semibold text-white">Preview link incomplete</p>
        <p className="max-w-md text-sm text-slate-400">
          Open &quot;One-click live widget preview&quot; from the AI Agent page after configuring your widget.
        </p>
      </div>
    )
  }

  if (!siteOrigin) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 bg-slate-950 px-6 text-center">
        <p className="text-lg font-semibold text-white">No website URL for preview</p>
        <p className="max-w-md text-sm text-slate-400">
          Add a knowledge source URL (or connect your domain) in the dashboard, then try the preview again.
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] w-full bg-white">
      <iframe title="Website preview" src={siteOrigin} className="absolute inset-0 h-full w-full border-0" />
      <SiteAiWidget agentId={widgetParts.agentId} accentColor={widgetParts.accentColor} defaultOpen={widgetParts.defaultOpen} embed />
    </div>
  )
}

export default function WidgetSitePreviewPage() {
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
