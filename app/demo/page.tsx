"use client"

import Link from "next/link"
import { ArrowRight, Bot, CheckCircle2, Headphones, Layers, Mic, RadioTower, Sparkles, TimerReset, Zap } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { LiveCallCenterSimulator } from "@/components/call-center/live-call-center-simulator"
import { AgentExecutionInspector } from "@/components/call-center/agent-execution-inspector"
import { CallCenterRoiCalculator } from "@/components/call-center/call-center-roi-calculator"
import { Button } from "@/components/ui/button"

const proofPoints = [
  {
    title: "Sub-250ms Realtime Voice Swarms",
    description: "LiveKit WebRTC + Deepgram Nova-3 + Gemini 2.0 streaming pipeline eliminates latency and unnatural pauses.",
    icon: Zap,
  },
  {
    title: "Durable LangGraph State Machine",
    description: "Multi-agent specialist routing, deterministic policy checks, and checkpointing for long-running workflows.",
    icon: Layers,
  },
  {
    title: "Human-in-the-Loop Governance",
    description: "Automated risk evaluation gates high-value refunds, discounts, and cancellations directly to supervisor approval.",
    icon: Headphones,
  },
]

export default function DemoPage() {
  return (
    <PageLayout>
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl space-y-16">
          {/* Header */}
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              <RadioTower className="h-4 w-4 animate-pulse text-cyan-400" />
              INTERACTIVE AGENTIC LAB
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Experience the Autonomous <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">AI Contact Center</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Test real-time conversational voice turns, dual-channel speaker diarization, deterministic tool executions, and supervisor intervention in a live sandbox.
            </p>
          </div>

          {/* Interactive Live Simulator */}
          <LiveCallCenterSimulator />

          {/* Value Proof Points */}
          <div className="grid gap-6 md:grid-cols-3">
            {proofPoints.map((point) => (
              <div key={point.title} className="kling-panel rounded-[2rem] p-6 border border-white/10 bg-slate-950/80">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
                  <point.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">{point.title}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-white/60">{point.description}</p>
              </div>
            ))}
          </div>

          {/* Deep Agent Execution Graph Inspector */}
          <AgentExecutionInspector />

          {/* Seat Replacement ROI Calculator */}
          <CallCenterRoiCalculator />

          {/* Bottom CTA */}
          <div className="rounded-[2.5rem] border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-950/90 to-purple-950/40 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to deploy your enterprise agent swarm?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Connect your Twilio SIP trunks, CRM endpoints, and pgvector knowledge base in under 15 minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl bg-cyan-500 font-bold text-black hover:bg-cyan-400">
                <Link href="/get-started">
                  Deploy Autonomous Swarm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/pricing">View Enterprise Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
