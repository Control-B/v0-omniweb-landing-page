"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, TestTube2 } from "lucide-react"
import { dispatchAssistantOpen } from "@/lib/assistant-events"

type TestConsolePanelProps = {
  welcomeMessage: string
  agentReady: boolean
}

const checklistItems = [
  ["Welcome message", "Does the agent open with your custom greeting?"],
  ["Product questions", "Ask about a product — does it answer from your knowledge base?"],
  ["Language switching", "Try a different language if you have multiple enabled."],
  ["Cart actions", "Ask to add something to cart — does it confirm?"],
  ["Voice quality", "Is the voice clear and natural at the chosen gender?"],
] as const

export function TestConsolePanel({ welcomeMessage, agentReady }: TestConsolePanelProps) {
  const [voiceVariant, setVoiceVariant] = useState<"Female" | "Male">("Female")

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(90deg,rgba(99,102,241,0.10),rgba(34,211,238,0.08),rgba(99,102,241,0.08))] p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><TestTube2 className="h-4 w-4 text-violet-500" />Test Console</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Agent Test Console</h2>
        <p className="mt-2 text-sm text-slate-600">“Omniweb AI” — test voice and text before shoppers see it.</p>
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Voice:</span>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              {(["Female", "Male"] as const).map((option) => {
                const active = voiceVariant === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVoiceVariant(option)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${active ? "bg-[#059669] text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-white/90" : "bg-sky-300"}`} />
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => dispatchAssistantOpen("text")}
              className="inline-flex items-center gap-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,#4f46e5_55%,#4338ca)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.3)]"
            >
              <span className="h-6 w-6 rounded-full bg-white/20 shadow-inner" />
              Ask AI
            </button>
            <span className="text-sm text-slate-500">Opens your storefront</span>
          </div>
        </div>
      </section>

      <section className="rounded-[1.2rem] border border-white/70 border-l-4 border-l-emerald-500 bg-white/80 px-5 py-4 shadow-[0_16px_35px_rgba(148,163,184,0.08)]">
        <p className="text-sm text-slate-500">Opening message:</p>
        <p className="mt-1 text-base text-slate-800">“{welcomeMessage}”</p>
      </section>

      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-50 p-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{agentReady ? "Agent ready to test" : "Agent not synced yet"}</p>
              <p className="mt-1 text-sm text-slate-600">
                {agentReady
                  ? "Open the test window and validate the greeting, product answers, and language switching."
                  : "Go to Agent Settings, fill in your details, and click Save and sync agent. Then come back here to test."}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/ai-agent"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
          >
            Go to Agent Settings
          </Link>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-5">
        {checklistItems.map(([title, description], index) => (
          <div key={title} className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4 shadow-[0_16px_35px_rgba(148,163,184,0.08)]">
            <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">{index + 1}</div>
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
