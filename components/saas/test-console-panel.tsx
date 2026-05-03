"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, TestTube2 } from "lucide-react"

type TestConsolePanelProps = {
  welcomeMessage: string
  agentReady: boolean
  tenantId: string | null
}

const checklistItems = [
  ["Welcome message", "Does the agent open with your custom greeting?"],
  ["Product questions", "Ask about a product — does it answer from your knowledge base?"],
  ["Language switching", "Try a different language if you have multiple enabled."],
  ["Cart actions", "Ask to add something to cart — does it confirm?"],
  ["Voice quality", "Is the voice clear and natural at the chosen gender?"],
] as const

export function TestConsolePanel({ welcomeMessage, agentReady, tenantId }: TestConsolePanelProps) {
  const [voiceVariant, setVoiceVariant] = useState<"Female" | "Male">("Female")

  return (
    <div className="space-y-6">
      <section className="dashboard-card-highlight rounded-[24px] p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><TestTube2 className="h-4 w-4 text-violet-500" />Test Console</div>
        <h2 className="dashboard-page-title mt-4">Agent Test Console</h2>
        <p className="dashboard-body mt-3">Validate the voice experience, greeting, and guided responses before Omniweb goes live to visitors.</p>
      </section>

      <section className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="dashboard-card-surface min-w-0 rounded-[24px] p-4 sm:p-6 lg:p-7">
          <p className="text-sm font-medium text-slate-500">Voice selector</p>
          <div className="mt-5 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-slate-500">Voice:</span>
            <div className="inline-flex w-full rounded-full border border-slate-200 bg-slate-50 p-1 sm:w-auto">
              {(["Female", "Male"] as const).map((option) => {
                const active = voiceVariant === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVoiceVariant(option)}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition sm:flex-none sm:px-4 ${active ? "bg-[#059669] text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-white/90" : "bg-sky-300"}`} />
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="self-end rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 lg:self-auto">
            Test live calls and chats from the installed website widget, not inside the dashboard.
          </div>
        </div>
        </div>

        <section className="dashboard-card-surface min-w-0 rounded-[24px] p-4 sm:p-6 lg:p-7">
          <p className="text-sm font-medium text-slate-500">Opening message</p>
          <p className="mt-4 text-base leading-7 text-slate-800">“{welcomeMessage}”</p>
        </section>
      </section>

      <section className={`rounded-[24px] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-7 ${agentReady ? "border border-emerald-200 bg-emerald-50/70" : "border border-dashed border-slate-300 bg-white/70"}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-2 ${agentReady ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
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
            className="dashboard-primary-button inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition hover:opacity-95 sm:h-12 sm:w-auto sm:px-5 sm:text-[15px]"
          >
            Go to Agent Settings
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {checklistItems.map(([title, description], index) => (
          <div key={title} className="dashboard-card-surface flex min-h-[180px] flex-col rounded-[24px] p-5 lg:p-6">
            <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">{index + 1}</div>
            <p className="dashboard-card-title">{title}</p>
            <p className="dashboard-body mt-2">{description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
