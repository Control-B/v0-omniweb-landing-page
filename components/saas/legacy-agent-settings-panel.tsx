"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, Loader2, Mic2, ShieldAlert, UploadCloud, Volume2 } from "lucide-react"
import { SiteAiWidget } from "@/components/site-ai-widget"
import { Button } from "@/components/ui/button"
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

const VOICE_OPTIONS = [
  {
    id: "female",
    label: "Female voice",
    provider: "ElevenLabs",
    description: "Warmer assistant voice for website conversations.",
  },
  {
    id: "male",
    label: "Male voice",
    provider: "Deepgram",
    description: "Default low-latency voice for fast live previews.",
  },
] as const

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
  const [agentName, setAgentName] = useState(initialConfig.agentName || "Omniweb AI")
  const [workspaceName, setWorkspaceName] = useState(initialConfig.businessName || businessName || "")
  const [welcomeMessage, setWelcomeMessage] = useState(initialConfig.welcomeMessage || "Thank you for visiting our website today... it will be my pleasure to help you")
  const [systemInstructions, setSystemInstructions] = useState(initialConfig.customInstructions || "Talk about what is on the website, answer common questions, and guide high-intent visitors toward the next best step.")
  const [responseLength, setResponseLength] = useState("Moderate – balanced detail")
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialConfig.goals?.length ? initialConfig.goals : ["Product Recommendations", "Customer Support & FAQs", "Cart Management & Reminders", "Lead Capture"])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(getInitialSelectedLanguages(initialConfig))
  const [voiceVariant, setVoiceVariant] = useState<(typeof VOICE_OPTIONS)[number]["id"]>("female")
  const [voiceCloneEnabled, setVoiceCloneEnabled] = useState(false)
  const [voiceCloneName, setVoiceCloneName] = useState("")
  const [voiceCloneSampleName, setVoiceCloneSampleName] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(localDraftKey(initialConfig.tenantId))
      if (!raw) return
      const draft = JSON.parse(raw) as {
        workspaceName?: string
        systemInstructions?: string
        responseLength?: string
        voiceVariant?: (typeof VOICE_OPTIONS)[number]["id"]
        voiceCloneEnabled?: boolean
        voiceCloneName?: string
        voiceCloneSampleName?: string
      }
      if (draft.workspaceName) setWorkspaceName(draft.workspaceName)
      if (draft.systemInstructions) setSystemInstructions(draft.systemInstructions)
      if (draft.responseLength) setResponseLength(draft.responseLength)
      if (draft.voiceVariant) setVoiceVariant(draft.voiceVariant)
      if (typeof draft.voiceCloneEnabled === "boolean") setVoiceCloneEnabled(draft.voiceCloneEnabled)
      if (draft.voiceCloneName) setVoiceCloneName(draft.voiceCloneName)
      if (draft.voiceCloneSampleName) setVoiceCloneSampleName(draft.voiceCloneSampleName)
    } catch {
      return
    }
  }, [initialConfig.tenantId])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(localDraftKey(initialConfig.tenantId), JSON.stringify({ workspaceName, systemInstructions, responseLength, voiceVariant, voiceCloneEnabled, voiceCloneName, voiceCloneSampleName }))
  }, [initialConfig.tenantId, responseLength, systemInstructions, voiceCloneEnabled, voiceCloneName, voiceCloneSampleName, voiceVariant, workspaceName])

  const knowledgePreview = useMemo(() => {
    if (websiteDomain) {
      return websiteDomain.startsWith("http") ? websiteDomain : `https://${websiteDomain}`
    }
    return "No indexed sources yet"
  }, [websiteDomain])

  const autoSelected = selectedLanguages.includes("auto")
  const selectedVoice = VOICE_OPTIONS.find((voice) => voice.id === voiceVariant) ?? VOICE_OPTIONS[0]

  const scrollToConfiguration = () => {
    window.setTimeout(() => {
      configureRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
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

      <section className="dashboard-card-highlight overflow-hidden rounded-[28px] p-0">
        <div className="border-b border-white/10 bg-slate-950/95 px-6 py-4 text-white lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200"><Bot className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-cyan-200">AI Agent Builder</p>
                  <p className="text-xs text-slate-400">Last saved settings sync to your website widget</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Conversation", "Models & Voice", "Actions", "Advanced"].map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={scrollToConfiguration}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${index === 0 ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
              <Button className="dashboard-primary-button rounded-full px-5 text-white" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Deploy agent
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">AI Agent launch</p>
            <h1 className="dashboard-page-title mt-3">Configure, test, and install your widget in one place</h1>
            <p className="dashboard-body mt-3">
              Configure the agent, choose a voice, and test it live from the preview panel. Everything stays focused on one page.
            </p>
          </div>
          <Button className="dashboard-primary-button rounded-2xl px-5 text-white" onClick={scrollToConfiguration}>
            Start configuring
          </Button>
          </div>
        </div>
      </section>

      {(message || error) ? (
        <div className={`rounded-[24px] border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}>
          {error || message}
        </div>
      ) : null}

      <section id="configure-agent" ref={configureRef} className="grid scroll-mt-6 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
        <div className={cardClassName}>
          <div className="h-1 rounded-full bg-[linear-gradient(90deg,#2563eb,#14b8a6)]" />
          <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {["Instructions", "Voice", "Goals", "Languages"].map((tab, index) => (
              <button
                key={tab}
                type="button"
                onClick={scrollToConfiguration}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${index === 0 ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>
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

        <section className={cardClassName}>
          <div className="h-1 rounded-full bg-[linear-gradient(90deg,#2563eb,#14b8a6)]" />
          <div className="pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">Models &amp; Voice</p>
                <p className="mt-1 text-sm text-slate-500">Choose the voice visitors hear when they test or use the widget.</p>
              </div>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">Live preview ready</span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {VOICE_OPTIONS.map((voice) => {
                const active = voiceVariant === voice.id
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setVoiceVariant(voice.id)}
                    className={`rounded-2xl border p-4 text-left transition ${active ? "border-cyan-400 bg-[#0f1b35] text-white shadow-[0_14px_30px_rgba(15,27,53,0.2)]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-white/15 text-cyan-100" : "bg-slate-100 text-slate-600"}`}>
                          <Volume2 className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-semibold">{voice.label}</p>
                          <p className={`mt-1 text-xs ${active ? "text-cyan-100" : "text-slate-500"}`}>{voice.provider}</p>
                        </div>
                      </div>
                      <span className={`h-3 w-3 rounded-full ${active ? "bg-cyan-300" : "bg-slate-300"}`} />
                    </div>
                    <p className={`mt-3 text-sm leading-6 ${active ? "text-slate-200" : "text-slate-500"}`}>{voice.description}</p>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <UploadCloud className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Voice cloning</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Upload a sample later to create a brand voice. For now, this stores the preferred cloned voice name for setup.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceCloneEnabled((current) => !current)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${voiceCloneEnabled ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                >
                  {voiceCloneEnabled ? "Cloning on" : "Enable cloning"}
                </button>
              </div>
              {voiceCloneEnabled ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Cloned voice name</label>
                    <input value={voiceCloneName} onChange={(event) => setVoiceCloneName(event.target.value)} placeholder="Example: Founder voice, Support voice" className={inputClassName} />
                  </div>
                  <label className="block rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Upload voice sample</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">MP3, WAV, or M4A sample for cloning setup.</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                      onChange={(event) => setVoiceCloneSampleName(event.target.files?.[0]?.name ?? "")}
                    />
                    {voiceCloneSampleName ? <span className="mt-2 block text-xs font-semibold text-cyan-700">{voiceCloneSampleName}</span> : null}
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <LivePreviewPanel
            agentName={agentName}
            businessName={workspaceName || businessName || "Omniweb"}
            knowledgePreview={knowledgePreview}
            selectedVoice={selectedVoice}
            voiceCloneEnabled={voiceCloneEnabled}
            onSave={handleSave}
            onAsk={() => dispatchAssistantOpen("select", { clientId: initialConfig.tenantId })}
            saving={saving}
          />
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

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button className="dashboard-primary-button rounded-xl text-white hover:opacity-95" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save and test
        </Button>
      </div>

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

function LivePreviewPanel({
  agentName,
  businessName,
  knowledgePreview,
  selectedVoice,
  voiceCloneEnabled,
  onSave,
  onAsk,
  saving,
}: {
  agentName: string
  businessName: string
  knowledgePreview: string
  selectedVoice: (typeof VOICE_OPTIONS)[number]
  voiceCloneEnabled: boolean
  onSave: () => void
  onAsk: () => void
  saving: boolean
}) {
  return (
    <aside className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
      <div className="grid grid-cols-2 border-b border-white/10 text-center text-sm font-semibold">
        <button type="button" className="border-b-2 border-cyan-400 bg-cyan-400/10 px-4 py-3 text-cyan-200">Live preview</button>
        <button type="button" className="px-4 py-3 text-slate-400">Install</button>
      </div>

      <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-300/30" />
          <div className="absolute inset-3 rounded-full border border-violet-400/40" />
          <div className="absolute inset-7 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.35),rgba(99,102,241,0.1),transparent_70%)]" />
          <Mic2 className="relative h-12 w-12 text-cyan-100" />
        </div>

        <h3 className="mt-7 text-xl font-semibold">{agentName || "Omniweb AI"}</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
          Preview the {selectedVoice.label.toLowerCase()} powered by {selectedVoice.provider} for {businessName}.
        </p>

        <div className="mt-6 grid w-full gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-slate-300">
          <div className="flex items-center justify-between gap-3">
            <span>Voice</span>
            <span className="font-semibold text-white">{selectedVoice.provider}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Cloning</span>
            <span className={voiceCloneEnabled ? "font-semibold text-cyan-200" : "font-semibold text-slate-500"}>{voiceCloneEnabled ? "Enabled" : "Off"}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Knowledge</span>
            <span className="max-w-[190px] text-right font-semibold text-white">{knowledgePreview}</span>
          </div>
        </div>

        <div className="mt-7 flex w-full flex-col gap-3">
          <Button type="button" className="dashboard-primary-button h-12 rounded-2xl text-white" onClick={onAsk}>
            <Mic2 className="h-4 w-4" />
            Talk to your agent
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save and deploy
          </Button>
        </div>
      </div>
    </aside>
  )
}

