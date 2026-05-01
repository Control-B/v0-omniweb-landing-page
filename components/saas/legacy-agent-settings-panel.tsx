"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, CheckCircle2, Loader2, ShieldAlert, TestTube2 } from "lucide-react"
import { SiteAiWidget } from "@/components/site-ai-widget"
import { Button } from "@/components/ui/button"
import { WidgetInstallCard } from "@/components/saas/widget-install-card"
import { dispatchAssistantOpen } from "@/lib/assistant-events"
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

const MANUAL_LANGUAGE_CODES = LANGUAGE_OPTIONS.filter((language) => language.code !== "auto").map((language) => language.code)

const cardClassName = "dashboard-card-surface rounded-[24px] p-6 lg:p-7"
const inputClassName = "dashboard-input mt-2"
const textareaClassName = "dashboard-textarea mt-2"
const localDraftKey = (tenantId: string) => `omniweb-agent-page-draft:${tenantId}`
const stepClassName = "rounded-[22px] border p-5 transition"

type LegacyAgentSettingsPanelProps = {
  initialConfig: AgentConfigRecord
  websiteDomain: string | null
  businessName: string | null
}

function getInitialSelectedLanguages(initialConfig: AgentConfigRecord) {
  if (initialConfig.supportedLanguages?.length) {
    if (initialConfig.supportedLanguages.length === 1 && initialConfig.supportedLanguages[0] === "en") {
      return ["auto"]
    }

    return initialConfig.supportedLanguages
  }

  return ["auto"]
}

export function LegacyAgentSettingsPanel({ initialConfig, websiteDomain, businessName }: LegacyAgentSettingsPanelProps) {
  const configureRef = useRef<HTMLElement | null>(null)
  const testRef = useRef<HTMLElement | null>(null)
  const installRef = useRef<HTMLElement | null>(null)
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
  const [activeStep, setActiveStep] = useState<"configure" | "test" | "install">("configure")

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

  const autoSelected = selectedLanguages.includes("auto")

  const scrollTo = (target: "configure" | "test" | "install") => {
    setActiveStep(target)
    const ref = target === "configure" ? configureRef : target === "test" ? testRef : installRef
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
  }

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
        return current.includes("auto") ? [] : ["auto"]
      }

      if (current.includes(code)) {
        return current.filter((item) => item !== code)
      }

      return [...current.filter((item) => item !== "auto"), code]
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
        supportedLanguages: selectedLanguages.includes("auto") ? ["auto"] : selectedLanguages.filter((code) => MANUAL_LANGUAGE_CODES.includes(code)),
        active: true,
      })
      setMessage("AI agent saved and synced.")
      scrollTo("test")
      window.setTimeout(() => {
        dispatchAssistantOpen("select", { clientId: initialConfig.tenantId })
      }, 500)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save AI agent settings.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <SiteAiWidget agentId={initialConfig.tenantId} />

      <section className="dashboard-card-highlight rounded-[28px] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">AI Agent launch</p>
            <h1 className="dashboard-page-title mt-3">Configure, test, and install your widget in one place</h1>
            <p className="dashboard-body mt-3">
              Start here, save your agent, test the live widget, then copy the install script. No separate pages needed.
            </p>
          </div>
          <Button className="dashboard-primary-button rounded-2xl px-5 text-white" onClick={() => scrollTo("configure")}>
            Start setup
          </Button>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <LaunchStep
            active={activeStep === "configure"}
            complete={activeStep !== "configure"}
            number="1"
            title="Configure"
            body="Set the greeting, goals, languages, and operating rules."
            onClick={() => scrollTo("configure")}
          />
          <LaunchStep
            active={activeStep === "test"}
            complete={activeStep === "install"}
            number="2"
            title="Test"
            body="Save opens the live Ask AI widget so you can verify the experience."
            onClick={() => scrollTo("test")}
          />
          <LaunchStep
            active={activeStep === "install"}
            complete={false}
            number="3"
            title="Install"
            body="Copy one script, paste it before your website closing body tag, and verify."
            onClick={() => scrollTo("install")}
          />
        </div>
      </section>

      {(message || error) ? (
        <div className={`rounded-[24px] border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}>
          {error || message}
        </div>
      ) : null}

      <section id="configure-agent" ref={configureRef} className="dashboard-card-highlight scroll-mt-6 rounded-[28px] p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="dashboard-page-title">1. Configure your AI agent</p>
            <p className="dashboard-body mt-3 max-w-3xl">Shape how your AI agent sells and supports. Set the welcome message, goals, languages, and operating rules that sync to your storefront widget.</p>
          </div>
          <Button className="dashboard-primary-button rounded-xl text-white hover:opacity-95" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save and test
          </Button>
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
              <select value={responseLength} onChange={(event) => setResponseLength(event.target.value)} className={`${inputClassName} dashboard-select`}>
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
          <InfoCard title="Test your agent" body="Save first, then this page opens your live widget so you can test voice, language switching, and greeting before shoppers see it.">
            <div className="mt-4 border-t border-slate-200 pt-4">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={() => scrollTo("test")}>Jump to test</Button>
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
                <label key={goal} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-[15px] transition ${active ? "border-cyan-400/40 bg-[#0f1b35] text-white shadow-[0_12px_26px_rgba(15,27,53,0.18)]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
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
              <label key={language.code} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-slate-700 hover:bg-slate-50">
                <input
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

      <section className="overflow-hidden rounded-[24px] border border-amber-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-amber-200 bg-amber-400/95 px-4 py-3 text-sm font-semibold text-amber-950"><ShieldAlert className="mr-2 inline h-4 w-4" />Financial Transaction Policy — Required</div>
        <div className="p-6 text-[15px] leading-7 text-slate-700">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end lg:pr-72">
        <Button className="dashboard-primary-button rounded-xl text-white hover:opacity-95" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save and test
        </Button>
      </div>

      <section id="test-agent" ref={testRef} className="dashboard-card-surface scroll-mt-6 rounded-[28px] p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              <TestTube2 className="h-4 w-4 text-violet-500" />
              Step 2
            </div>
            <h2 className="dashboard-section-title mt-3">Test your AI agent</h2>
            <p className="dashboard-body mt-2">
              Click Ask AI, test the greeting, ask a real customer question, try a language, and check that the answer feels right.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => dispatchAssistantOpen("select", { clientId: initialConfig.tenantId })}
              className="dashboard-primary-button rounded-2xl px-5 text-white"
            >
              <Bot className="h-4 w-4" />
              Ask AI
            </Button>
            <Button type="button" variant="outline" className="dashboard-secondary-button rounded-2xl" onClick={() => scrollTo("install")}>
              Finish testing and install
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Greeting", "Does it open with your saved welcome message?"],
            ["Real answer", "Ask about your products, services, pricing, or policies."],
            ["Next step", "Confirm it guides visitors toward booking, buying, or contacting you."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="install-widget" ref={installRef} className="scroll-mt-6 space-y-4">
        <div className="dashboard-card-highlight rounded-[28px] p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Step 3</p>
              <h2 className="dashboard-section-title mt-3">Install your website widget</h2>
              <p className="dashboard-body mt-2 max-w-3xl">
                Copy the script below and paste it before your website&apos;s closing body tag. After it is installed, use Verify install to confirm Omniweb can see it.
              </p>
            </div>
          </div>
        </div>
        <WidgetInstallCard />
      </section>
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

function LaunchStep({
  active,
  complete,
  number,
  title,
  body,
  onClick,
}: {
  active: boolean
  complete: boolean
  number: string
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${stepClassName} text-left ${
        active
          ? "border-cyan-300 bg-white shadow-[0_18px_40px_rgba(14,165,233,0.14)]"
          : complete
            ? "border-emerald-200 bg-emerald-50/80"
            : "border-slate-200 bg-white/70 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
          complete ? "bg-emerald-600 text-white" : active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"
        }`}>
          {complete ? <CheckCircle2 className="h-5 w-5" /> : number}
        </span>
        <span className="text-base font-semibold text-slate-950">{title}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </button>
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
