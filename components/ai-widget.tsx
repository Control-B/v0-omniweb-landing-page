"use client"

import Link from "next/link"
import { Bot, Mic, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dispatchAssistantOpen, type AssistantOpenMode } from "@/lib/assistant-events"

type AIWidgetProps = {
  title?: string
  description?: string
  primaryLabel?: string
  secondaryLabel?: string
  primaryMode?: AssistantOpenMode
  secondaryMode?: AssistantOpenMode
  ctaHref?: string
  className?: string
}

export function AIWidget({
  title = "Let AI qualify, answer, and book for you",
  description = "Open voice or chat to see how Omniweb captures intent, qualifies leads, and routes buyers into your pipeline without adding headcount.",
  primaryLabel = "Talk to AI",
  secondaryLabel = "Start Your Setup",
  primaryMode = "voice",
  secondaryMode = "text",
  ctaHref = "/get-started",
  className,
}: AIWidgetProps) {
  return (
    <div className={[
      "rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(8,15,31,0.92),rgba(7,12,25,0.88))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:p-8",
      className,
    ].filter(Boolean).join(" ")}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
            <Bot className="h-3.5 w-3.5" />
            AI Concierge
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-white lg:text-3xl">{title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200/90 lg:text-base">{description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-400"
            onClick={() => dispatchAssistantOpen(primaryMode)}
          >
            <Mic className="mr-2 h-4 w-4" />
            {primaryLabel}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => dispatchAssistantOpen(secondaryMode)}
          >
            <Bot className="mr-2 h-4 w-4" />
            Chat with AI
          </Button>
          <Button size="lg" asChild className="rounded-full bg-blue-600 text-white hover:bg-blue-500">
            <Link href={ctaHref}>
              {secondaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
