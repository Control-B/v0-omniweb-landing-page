"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { SiteAiWidget } from "@/components/site-ai-widget"

function EmbeddableWidget() {
  const params = useParams()
  const searchParams = useSearchParams()
  const agentId = params.agentId as string
  const accentColor = searchParams.get("color") || "#4f46e5"
  const defaultOpen = searchParams.get("panel") === "1" || searchParams.get("open") === "1"

  return (
    <SiteAiWidget
      agentId={agentId}
      accentColor={accentColor}
      defaultOpen={defaultOpen}
      embed
    />
  )
}

export default function WidgetPage() {
  return (
    <Suspense fallback={null}>
      <EmbeddableWidget />
    </Suspense>
  )
}
