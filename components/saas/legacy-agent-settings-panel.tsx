"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, CheckCircle2, Loader2, Mic2, Pause, Play, ShieldAlert, Trash2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WidgetInstallCard } from "@/components/saas/widget-install-card"
import { saveAgentConfig } from "@/lib/saas/agentConfigService"
import type { AgentConfigRecord } from "@/lib/saas/types"
import {
  knowledgeSourcesStorageKey,
  readPrimaryKnowledgeOriginFromLocalStorage,
  readPrimaryKnowledgePageUrlFromLocalStorage,
} from "@/lib/saas/widgetEmbed"

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
    description: "Warmer assistant voice for website conversations.",
  },
  {
    id: "male",
    label: "Male voice",
    description: "Clear default voice for fast live previews.",
  },
] as const

type VoiceVariant = (typeof VOICE_OPTIONS)[number]["id"] | "clone"

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
  const [voiceVariant, setVoiceVariant] = useState<VoiceVariant>("female")
  const [voiceCloneEnabled, setVoiceCloneEnabled] = useState(false)
  const [voiceCloneName, setVoiceCloneName] = useState("")
  const [voiceCloneSampleName, setVoiceCloneSampleName] = useState("")
  const [voiceCloneAudioUrl, setVoiceCloneAudioUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [lsKnowledgeOrigin, setLsKnowledgeOrigin] = useState<string | null>(() =>
    typeof window !== "undefined" ? readPrimaryKnowledgeOriginFromLocalStorage(initialConfig.tenantId) : null,
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(localDraftKey(initialConfig.tenantId))
      if (!raw) return
      const draft = JSON.parse(raw) as {
        workspaceName?: string
        systemInstructions?: string
        responseLength?: string
        voiceVariant?: VoiceVariant
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

  useEffect(() => {
    if (typeof window === "undefined") return

    function refreshKnowledgeFromStorage() {
      setLsKnowledgeOrigin(readPrimaryKnowledgeOriginFromLocalStorage(initialConfig.tenantId))
    }
    refreshKnowledgeFromStorage()

    function onStorage(event: StorageEvent) {
      if (event.key === knowledgeSourcesStorageKey(initialConfig.tenantId)) {
        refreshKnowledgeFromStorage()
      }
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("omniweb:knowledge-sources-updated", refreshKnowledgeFromStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("omniweb:knowledge-sources-updated", refreshKnowledgeFromStorage)
    }
  }, [initialConfig.tenantId])

  const knowledgePreview = useMemo(() => {
    if (typeof window !== "undefined") {
      const pageUrl = readPrimaryKnowledgePageUrlFromLocalStorage(initialConfig.tenantId)
      if (pageUrl) {
        return pageUrl
      }
    }
    if (websiteDomain) {
      return websiteDomain.startsWith("http") ? websiteDomain : `https://${websiteDomain}`
    }
    return "No indexed sources yet"
  }, [websiteDomain, initialConfig.tenantId, lsKnowledgeOrigin])

  const autoSelected = selectedLanguages.includes("auto")
  const selectedVoice = VOICE_OPTIONS.find((voice) => voice.id === voiceVariant) ?? VOICE_OPTIONS[0]
  const voiceLabel = voiceVariant === "clone"
    ? (voiceCloneName ? `Clone: ${voiceCloneName}` : "Cloned voice")
    : selectedVoice.label

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
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save AI agent settings.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClonedVoice = () => {
    if (voiceCloneAudioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(voiceCloneAudioUrl)
    }
    setVoiceCloneAudioUrl("")
    setVoiceCloneSampleName("")
    setVoiceCloneName("")
    setVoiceCloneEnabled(false)
    if (voiceVariant === "clone") {
      setVoiceVariant("female")
    }
    setMessage("Removed saved cloned voice.")
  }

  const canDeleteClonedVoice = Boolean(voiceCloneAudioUrl) || voiceVariant === "clone"

  return (
    <div className="space-y-6">
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
            <Field label="Agent name" helper="The name visitors will see in the chat widget">
              <input value={agentName} onChange={(event) => setAgentName(event.target.value)} className={inputClassName} />
            </Field>
            <Field label="Business name" helper="Used throughout the agent experience and system context">
              <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} className={inputClassName} />
            </Field>
            <Field label="Welcome message" helper="The first message visitors see when they open the chat" className="md:col-span-2">
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
                          <p className={`mt-1 text-xs ${active ? "text-cyan-100" : "text-slate-500"}`}>Ready for live preview</p>
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
                    <Mic2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Voice cloning</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Record a short sample, listen back, and save it as the cloned voice for testing.</p>
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
                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Cloned voice name</label>
                    <input value={voiceCloneName} onChange={(event) => setVoiceCloneName(event.target.value)} placeholder="Example: Founder voice, Support voice" className={inputClassName} />
                  </div>
                  <VoiceCloneRecorder
                    audioUrl={voiceCloneAudioUrl}
                    sampleName={voiceCloneSampleName}
                    onRecorded={(url) => {
                      setVoiceCloneAudioUrl(url)
                      setVoiceCloneSampleName("Recorded voice sample")
                    }}
                    onSave={() => {
                      setVoiceCloneEnabled(true)
                      setVoiceVariant("clone")
                      setVoiceCloneName((current) => current || "Saved clone voice")
                      setMessage("Cloned voice saved for testing.")
                    }}
                  />
                  {canDeleteClonedVoice ? (
                    <div className="flex justify-end pt-1 md:col-span-2">
                      <button
                        type="button"
                        onClick={handleDeleteClonedVoice}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete saved voice
                      </button>
                    </div>
                  ) : null}
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
            voiceLabel={voiceLabel}
            voiceCloneEnabled={voiceCloneEnabled}
            onSave={handleSave}
            saving={saving}
          />
        </div>
      </section>

      <section className={cardClassName}>
        <div className="h-1 rounded-full bg-[linear-gradient(90deg,#1d4ed8,#14b8a6)]" />
        <div className="pt-5">
          <p className="text-lg font-semibold text-slate-900">Primary Goals</p>
          <p className="mt-1 text-sm text-slate-500">Select what your AI agent should help visitors accomplish across your industry</p>
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
          <p className="mt-1 text-sm text-slate-500">When multiple languages are enabled, visitors can choose one and your agent will respond in that language.</p>
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

      <WidgetInstallCard />

      <section className="overflow-hidden rounded-[24px] border border-amber-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-amber-200 bg-amber-400/95 px-4 py-3 text-sm font-semibold text-amber-950"><ShieldAlert className="mr-2 inline h-4 w-4" />Payments &amp; commerce — acknowledgment</div>
        <div className="p-6 text-[15px] leading-7 text-slate-700">
          <p className="mb-4">Omniweb works across many industries. By saving, you confirm you understand how the AI agent may act depending on your use case:</p>
          <p className="mb-2 font-semibold text-slate-900">E-commerce / online store</p>
          <ul className="mb-5 list-disc space-y-1 pl-5 text-slate-600">
            <li>When your site is configured for it, the agent may help visitors add items to a cart and send cart or follow-up reminders.</li>
            <li>The agent does <strong>not</strong> complete checkouts, charge cards, process payments, issue refunds, access your billing systems, or handle any financial transaction end to end.</li>
          </ul>
          <p className="mb-2 font-semibold text-slate-900">Other industries (services, professional firms, bookings, lead capture, support, and similar)</p>
          <ul className="mb-5 list-disc space-y-1 pl-5 text-slate-600">
            <li>The agent answers questions, captures leads, and guides visitors toward contact or appointments — according to how you configured it.</li>
            <li>The agent does <strong>not</strong> collect or process payments, refunds, invoicing, or any financial transaction.</li>
          </ul>
          <p className="mt-1 text-slate-500"><strong>For every business:</strong> any request involving money, refunds, billing, or sensitive financial decisions must be escalated to a person on your team.</p>
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

function VoiceCloneRecorder({
  audioUrl,
  sampleName,
  onRecorded,
  onSave,
}: {
  audioUrl: string
  sampleName: string
  onRecorded: (url: string) => void
  onSave: () => void
}) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [recording, setRecording] = useState(false)
  const [recordError, setRecordError] = useState("")

  const startRecording = async () => {
    try {
      setRecordError("")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
        onRecorded(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }
      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      setRecordError("Microphone access was blocked. Allow microphone access and try again.")
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
      <p className="font-semibold text-slate-900">Record voice sample</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">Speak naturally for 10 to 20 seconds, listen back, then save when satisfied.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${recording ? "bg-red-600 text-white" : "bg-slate-950 text-white"}`}
        >
          {recording ? <Pause className="h-4 w-4" /> : <Mic2 className="h-4 w-4" />}
          {recording ? "Stop recording" : "Record sample"}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!audioUrl}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <CheckCircle2 className="h-4 w-4" />
          Save clone
        </button>
      </div>
      {audioUrl ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Play className="h-3.5 w-3.5" />
            {sampleName || "Recorded sample"}
          </div>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      ) : null}
      {recordError ? <p className="mt-3 text-xs font-semibold text-red-600">{recordError}</p> : null}
    </div>
  )
}

function PreviewDetail({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span>{label}</span>
      <span className={`max-w-[210px] text-right font-semibold ${muted ? "text-slate-500" : "text-white"}`}>{value}</span>
    </div>
  )
}

function LivePreviewPanel({
  agentName,
  businessName,
  knowledgePreview,
  voiceLabel,
  voiceCloneEnabled,
  onSave,
  saving,
}: {
  agentName: string
  businessName: string
  knowledgePreview: string
  voiceLabel: string
  voiceCloneEnabled: boolean
  onSave: () => void
  saving: boolean
}) {
  return (
    <aside className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
      <div className="border-b border-white/10 px-6 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Agent configuration</p>
        <p className="mt-1 text-sm text-slate-400">Dashboard setup only. The customer-facing widget lives on the installed website.</p>
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
          Configure {voiceLabel.toLowerCase()} for {businessName}. Test from the installed site widget or AI Telephony test call.
        </p>

        <div className="mt-6 grid w-full gap-3 rounded-2xl border border-white/10 bg-white/3 p-4 text-left text-sm text-slate-300">
          <PreviewDetail label="Knowledge" value={knowledgePreview} />
          <PreviewDetail label="Voice" value={voiceLabel} />
          <PreviewDetail label="Cloning" value={voiceCloneEnabled ? "Saved" : "Off"} muted={!voiceCloneEnabled} />
        </div>

        <div className="mt-7 flex w-full flex-col gap-3">
          <Button type="button" className="dashboard-primary-button h-12 rounded-2xl text-white" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save agent configuration
          </Button>
          <p className="text-xs leading-5 text-slate-500">No customer-facing widget is mounted inside the dashboard.</p>
        </div>
      </div>
    </aside>
  )
}

