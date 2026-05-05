"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, MessageSquareText, Mic, Sparkles, TimerReset } from "lucide-react"
import { AIWidget } from "@/components/ai-widget"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/page-layout"
import { dispatchAssistantOpen } from "@/lib/assistant-events"

const proofPoints = [
  { title: "Voice + Text", description: "Start a voice conversation or switch to text at any time.", icon: Mic },
  { title: "Instant Qualification", description: "Capture lead intent, budget, and next-step readiness.", icon: CheckCircle2 },
  { title: "Fast Setup", description: "Install the agent on your site with a single script.", icon: TimerReset },
]

const workflow = [
  "The widget loads globally from the site layout, so every page can launch the same experience.",
  "Click Talk to AI or Chat with AI to open the live assistant in voice or text mode.",
  "Use the buttons in the widget to qualify leads, capture context, and route the next step.",
]

export default function DemoPage() {
  useEffect(() => {
    dispatchAssistantOpen("select")
  }, [])

  return (
    <PageLayout>
      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.32em] text-cyan-400">LIVE WIDGET DEMO</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              See the Omniweb AI widget answer in voice or text.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
              This page is the real interactive demo. The same widget script that powers the site is loaded globally,
              and the buttons below open the live voice or text experience.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-6 text-white hover:from-cyan-400 hover:to-purple-400"
                onClick={() => dispatchAssistantOpen("voice")}
              >
                <Mic className="mr-2 h-4 w-4" />
                Talk to AI
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"
                onClick={() => dispatchAssistantOpen("text")}
              >
                <MessageSquareText className="mr-2 h-4 w-4" />
                Chat with AI
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {proofPoints.map((point) => (
              <div key={point.title} className="kling-panel rounded-[1.5rem] p-6">
                <div className="site-icon-chip inline-flex h-12 w-12">
                  <point.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">{point.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/60">{point.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-6">
              <div className="kling-panel-strong rounded-[2rem] p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">What the widget does</p>
                <div className="mt-4 space-y-4 text-sm leading-8 text-white/65 sm:text-base">
                  {workflow.map((step) => (
                    <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <Sparkles className="mt-1 h-4 w-4 text-cyan-300" />
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/pricing" className="kling-panel rounded-[1.5rem] p-6 transition hover:border-cyan-500/20 hover:bg-white/[0.06]">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Pricing</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">See what plan fits your use case</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">Compare voice, chat, telephony, and bundle options.</p>
                </Link>
                <Link href="/features" className="kling-panel rounded-[1.5rem] p-6 transition hover:border-cyan-500/20 hover:bg-white/[0.06]">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Features</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">Explore the full AI system</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">Voice, chat, workflows, scheduling, and more.</p>
                </Link>
              </div>
            </div>

            <div>
              <AIWidget
                title="Open the live assistant from here"
                description="Click the buttons below to launch voice or text mode in the real Omniweb widget."
                primaryLabel="Talk to AI"
                secondaryLabel="Start Your Setup"
                primaryMode="voice"
                secondaryMode="text"
                ctaHref="/get-started"
              />

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/50">Try the live assistant</p>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Open voice or chat mode to see how the widget qualifies visitors, captures context, and routes the next step.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400"
                    onClick={() => dispatchAssistantOpen("voice")}
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Talk to AI
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => dispatchAssistantOpen("text")}
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    Chat with AI
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
