"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveAgentConfig } from "@/lib/saas/agentConfigService"
import type { AgentConfigRecord } from "@/lib/saas/types"

const GOALS = [
  "All goals",
  "Product Recommendations",
  "Customer Support & FAQs",
  "Cart Management & Reminders",
  "Lead Capture",
  "Appointment Booking",
  "Order Tracking & Status",
  "Multilingual Support",
]

const LANGUAGE_OPTIONS = [
  { code: "auto", label: "Auto (detect language)", flag: "🌐" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "nl", label: "Dutch", flag: "🇳🇱" },
  { code: "sv", label: "Swedish", flag: "🇸🇪" },
  { code: "ro", label: "Romanian", flag: "🇷🇴" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "uk", label: "Ukrainian", flag: "🇺🇦" },
  { code: "pl", label: "Polish", flag: "🇵🇱" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", flag: "🇧🇩" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "id", label: "Indonesian", flag: "🇮🇩" },
  { code: "vi", label: "Vietnamese", flag: "🇻🇳" },
  { code: "fil", label: "Filipino", flag: "🇵🇭" },
  { code: "sw", label: "Swahili", flag: "🇰🇪" },
]

const ALL_LANGUAGE_CODES = LANGUAGE_OPTIONS.map((language) => language.code)
const MANUAL_LANGUAGE_CODES = LANGUAGE_OPTIONS.filter((language) => language.code !== "auto").map((language) => language.code)

const cardClassName = "rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
const textareaClassName = "mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
const localDraftKey = (tenantId: string) => `omniweb-agent-page-draft:${tenantId}`

type LegacyAgentSettingsPanelProps = {
  initialConfig: AgentConfigRecord
  websiteDomain: string | null
  businessName: string | null
}

function getInitialSelectedLanguages(initialConfig: AgentConfigRecord) {
  if (initialConfig.supportedLanguages?.length) {
    return initialConfig.supportedLanguages
  }

  return ALL_LANGUAGE_CODES
}

export function LegacyAgentSettingsPanel({ initialConfig, websiteDomain, businessName }: LegacyAgentSettingsPanelProps) {
  const autoCheckboxRef = useRef<HTMLInputElement | null>(null)
  const [agentName, setAgentName] = useState(initialConfig.agentName || "Omniweb AI")
  const [workspaceName, setWorkspaceName] = useState(initialConfig.businessName || businessName || "")
  const [welcomeMessage, setWelcomeMessage] = useState(initialConfig.welcomeMessage || "Thank you for visiting our website today... it will be my pleasure to help you")
  const [systemInstructions, setSystemInstructions] = useState(initialConfig.customInstructions || "Talk about what is on the website, answer common questions, and guide high-intent visitors toward the next best step.")
  const [responseLength, setResponseLength] = useState("Moderate – balanced detail")
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialConfig.goals?.length ? initialConfig.goals : ["Product Recommendations", "Customer Support & FAQs", "Cart Management & Reminders", "Lead Capture"])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(getInitialSelectedLanguages(initialConfig))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(localDraftKey(initialConfig.tenantId))
      if (!raw) return
      const draft = JSON.parse(raw) as { workspaceName?: string; systemInstructions?: string; responseLength?: string }
      if (draft.workspaceName) setWorkspaceName(draft.workspaceName)
      if (draft.systemInstructions) setSystemInstructions(draft.systemInstructions)
      if (draft.responseLength) setResponseLength(draft.responseLength)
    } catch {
      return
    }
  }, [initialConfig.tenantId])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(localDraftKey(initialConfig.tenantId), JSON.stringify({ workspaceName, systemInstructions, responseLength }))
  }, [initialConfig.tenantId, responseLength, systemInstructions, workspaceName])

  const knowledgePreview = useMemo(() => {
    if (websiteDomain) {
      return websiteDomain.startsWith("http") ? websiteDomain : `https://${websiteDomain}`
    }
    return "No indexed sources yet"
  }, [websiteDomain])

  const selectedManualLanguageCount = useMemo(
    () => selectedLanguages.filter((code) => MANUAL_LANGUAGE_CODES.includes(code)).length,
    [selectedLanguages],
  )
  const autoSelected = selectedLanguages.includes("auto")
  const autoIndeterminate = autoSelected && selectedManualLanguageCount < MANUAL_LANGUAGE_CODES.length

  useEffect(() => {
    if (autoCheckboxRef.current) {
      autoCheckboxRef.current.indeterminate = autoIndeterminate
    }
  }, [autoIndeterminate])

  const toggleGoal = (goal: string) => {
    if (goal === "All goals") {
      setSelectedGoals((current) => current.includes("All goals") ? [] : GOALS)
      return
    }

    setSelectedGoals((current) => {
      const next = current.includes(goal)
        ? current.filter((item) => item !== goal && item !== "All goals")
        : [...current.filter((item) => item !== "All goals"), goal]
      return next.length === GOALS.length - 1 ? GOALS : next
    })
  }

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((current) => {
      if (code === "auto") {
        return current.includes("auto") ? current.filter((item) => item !== "auto") : ALL_LANGUAGE_CODES
      }

      if (current.includes(code)) {
        return current.filter((item) => item !== code)
      }

      return [...current, code]
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")
      setMessage("")
      await saveAgentConfig({
        agentName,
        businessName: workspaceName,
        welcomeMessage,
        customInstructions: systemInstructions,
        goals: selectedGoals.includes("All goals") ? GOALS.filter((goal) => goal !== "All goals") : selectedGoals,
        supportedLanguages: selectedLanguages.filter((code) => MANUAL_LANGUAGE_CODES.includes(code)),
        active: true,
      })
      setMessage("AI agent saved and synced.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save AI agent settings.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {(message || error) ? (
        <div className={`rounded-[24px] border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}>
          {error || message}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(238,242,255,0.85),rgba(240,249,255,0.9),rgba(236,253,245,0.75))] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-900">AI Agent Settings</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Shape how your AI agent sells and supports. Set the welcome message, goals, languages, and operating rules that sync to your storefront widget.</p>
          </div>
          <Link href="/dashboard/test-console">
            <Button variant="outline" className="rounded-xl border-white/80 bg-white/90 text-slate-700 hover:bg-white">Test after save</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <div className={cardClassName}>
          <div className="h-1 rounded-full bg-[linear-gradient(90deg,#2563eb,#14b8a6)]" />
          <div className="grid gap-4 pt-5 md:grid-cols-2">
            <Field label="Agent name" helper="The name shoppers will see in the chat widget">
              <input value={agentName} onChange={(event) => setAgentName(event.target.value)} className={inputClassName} />
            </Field>
            <Field label="Business name" helper="Used throughout the agent experience and system context">
              <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} className={inputClassName} />
            </Field>
            <Field label="Welcome message" helper="The first message shoppers see when they open the chat" className="md:col-span-2">
              <input value={welcomeMessage} onChange={(event) => setWelcomeMessage(event.target.value)} className={inputClassName} />
            </Field>
            <Field label="System instructions" helper="Describe your business, products, policies, and how the agent should behave" className="md:col-span-2">
              <textarea value={systemInstructions} onChange={(event) => setSystemInstructions(event.target.value)} rows={5} className={textareaClassName} />
            </Field>
            <Field label="Response length">
              <select value={responseLength} onChange={(event) => setResponseLength(event.target.value)} className={inputClassName}>
                <option>Short – concise replies</option>
                <option>Moderate – balanced detail</option>
                <option>Detailed – high context</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="space-y-6">
          <InfoCard title="Engine sync" body="Settings sync to the Omniweb AI engine on save. The widget uses the saved config for voice, text, multilingual replies, and navigation." />
          <InfoCard title="Knowledge base context" actionLabel="Edit KB" actionHref="/dashboard/knowledge" body="These sources and subscriber details are included when the agent syncs.">
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{knowledgePreview}</div>
          </InfoCard>
          <InfoCard title="Test your agent" body="Save first, then test your agent’s voice, language switching, and greeting before shoppers see it.">
            <div className="mt-4 border-t border-slate-200 pt-4">
              <Link href="/dashboard/test-console">
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white">Open test console</Button>
              </Link>
            </div>
          </InfoCard>
        </div>
      </section>

      <section className={cardClassName}>
        <div className="h-1 rounded-full bg-[linear-gradient(90deg,#1d4ed8,#14b8a6)]" />
        <div className="pt-5">
          <p className="text-lg font-semibold text-slate-900">Primary Goals</p>
          <p className="mt-1 text-sm text-slate-500">Select what your AI agent should help shoppers accomplish</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {GOALS.map((goal) => {
              const active = selectedGoals.includes(goal)
              return (
                <label key={goal} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${active ? "border-[#4f46e5]/25 bg-[#eef2ff] text-slate-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                  <input type="checkbox" checked={active} onChange={() => toggleGoal(goal)} className="h-4 w-4 rounded border-slate-300 text-[#4f46e5] focus:ring-[#4f46e5]" />
                  {goal}
                </label>
              )
            })}
          </div>
        </div>
      </section>

      <section className={cardClassName}>
        <div className="h-1 rounded-full bg-[linear-gradient(90deg,#1d4ed8,#14b8a6)]" />
        <div className="pt-5">
          <p className="text-lg font-semibold text-slate-900">Supported Languages</p>
          <p className="mt-1 text-sm text-slate-500">The widget will show a language picker to shoppers. Your agent will respond in the chosen language.</p>
          <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {LANGUAGE_OPTIONS.map((language) => (
              <label key={language.code} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <input
                  ref={language.code === "auto" ? autoCheckboxRef : undefined}
                  type="checkbox"
                  checked={language.code === "auto" ? autoSelected : selectedLanguages.includes(language.code)}
                  onChange={() => toggleLanguage(language.code)}
                  className="h-4 w-4 rounded border-slate-300 text-[#4f46e5] focus:ring-[#4f46e5]"
                />
                <span>{language.flag}</span>
                <span>{language.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-amber-200 bg-amber-400/95 px-4 py-3 text-sm font-semibold text-amber-950"><ShieldAlert className="mr-2 inline h-4 w-4" />Financial Transaction Policy — Required</div>
        <div className="p-6 text-sm text-slate-700">
          <p className="mb-3">By saving, you agree that the Omniweb AI agent will:</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-600">
            <li>Add products to the shopper&apos;s cart</li>
            <li>Send cart abandonment reminders</li>
            <li>NOT process checkouts or complete payments</li>
            <li>NOT issue refunds or access billing information</li>
            <li>NOT handle any financial transactions</li>
          </ul>
          <p className="mt-3 text-slate-500">Any financial request from a shopper will be immediately escalated to a human representative.</p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link href="/dashboard/test-console">
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white">Test in console</Button>
        </Link>
        <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save and sync agent
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  helper,
  children,
  className,
}: {
  label: string
  helper?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  )
}

function InfoCard({
  title,
  body,
  children,
  actionLabel,
  actionHref,
}: {
  title: string
  body: string
  children?: React.ReactNode
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className={cardClassName}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
        </div>
        {actionLabel && actionHref ? (
          <Link href={actionHref}>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white">{actionLabel}</Button>
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  )
}
