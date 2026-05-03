"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, CheckCircle2, Copy, Loader2, Mic2, Pause, Play, ShieldAlert, Trash2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchAgentConfig, saveAgentConfig } from "@/lib/saas/agentConfigService"
import { fetchWidgetSettings, saveWidgetSettings } from "@/lib/saas/widgetService"
import type { AgentConfigRecord } from "@/lib/saas/types"
import { Switch } from "@/components/ui/switch"
import { resolvePrimaryKnowledgeSiteUrl } from "@/lib/saas/liveWidgetSitePreview"
import {
  knowledgeSourcesStorageKey,
  readPrimaryKnowledgeOriginFromLocalStorage,
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

type WidgetControlState = {
  widgetEnabled: boolean
  textEnabled: boolean
  voiceEnabled: boolean
}

type WidgetStatusState = {
  publicWidgetId: string
  widgetInstalled: boolean
  widgetLastSeenAt: string | null
  widgetPrimaryColor: string
  previewDomain: string | null
  embedCode: string
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

function normalizeSelectedGoals(goals?: string[]) {
  if (!goals?.length) {
    return GOALS
  }

  if (goals.includes("All goals")) {
    return GOALS
  }

  const concreteGoals = GOALS.filter((goal) => goal !== "All goals")
  const hasAllConcreteGoals = concreteGoals.every((goal) => goals.includes(goal))
  return hasAllConcreteGoals ? GOALS : goals
}

export function LegacyAgentSettingsPanel({ initialConfig, websiteDomain, businessName }: LegacyAgentSettingsPanelProps) {
  const configureRef = useRef<HTMLElement | null>(null)
  const [agentName, setAgentName] = useState(initialConfig.agentName || "Omniweb AI")
  const [workspaceName, setWorkspaceName] = useState(initialConfig.businessName || businessName || "")
  const [welcomeMessage, setWelcomeMessage] = useState(initialConfig.welcomeMessage || "Thank you for visiting our website today... it will be my pleasure to help you")
  const [systemInstructions, setSystemInstructions] = useState(initialConfig.customInstructions || "Talk about what is on the website, answer common questions, and guide high-intent visitors toward the next best step.")
  const [responseLength, setResponseLength] = useState("Moderate – balanced detail")
  const role = "All"
  const [selectedGoals, setSelectedGoals] = useState<string[]>(normalizeSelectedGoals(initialConfig.goals))
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(getInitialSelectedLanguages(initialConfig))
  const [voiceVariant, setVoiceVariant] = useState<VoiceVariant>("female")
  const [voiceCloneEnabled, setVoiceCloneEnabled] = useState(false)
  const [voiceCloneName, setVoiceCloneName] = useState("")
  const [voiceCloneSampleName, setVoiceCloneSampleName] = useState("")
  const [voiceCloneAudioUrl, setVoiceCloneAudioUrl] = useState("")
  const [accountKnowledgeSources, setAccountKnowledgeSources] = useState(initialConfig.knowledgeSources ?? [])
  const [saving, setSaving] = useState(false)
  const [widgetLoading, setWidgetLoading] = useState(true)
  const [widgetControls, setWidgetControls] = useState<WidgetControlState>({
    widgetEnabled: true,
    textEnabled: true,
    voiceEnabled: true,
  })
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatusState>({
    publicWidgetId: "",
    widgetInstalled: false,
    widgetLastSeenAt: null,
    widgetPrimaryColor: "#22d3ee",
    previewDomain: websiteDomain,
    embedCode: "",
  })
  const [snippetCopied, setSnippetCopied] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [lsKnowledgeOrigin, setLsKnowledgeOrigin] = useState<string | null>(() =>
    typeof window !== "undefined" ? readPrimaryKnowledgeOriginFromLocalStorage(initialConfig.tenantId) : null,
  )

  useEffect(() => {
    let cancelled = false

    async function loadLatestConfig() {
      try {
        const latestConfig = await fetchAgentConfig()
        if (cancelled || !latestConfig) return
        setAgentName(latestConfig.agentName || "Omniweb AI")
        setWorkspaceName(latestConfig.businessName || businessName || "")
        setWelcomeMessage(latestConfig.welcomeMessage || "Thank you for visiting our website today... it will be my pleasure to help you")
        setSystemInstructions(latestConfig.customInstructions || "Talk about what is on the website, answer common questions, and guide high-intent visitors toward the next best step.")
        setSelectedGoals(normalizeSelectedGoals(latestConfig.goals))
        setSelectedLanguages(getInitialSelectedLanguages(latestConfig))
        setAccountKnowledgeSources(latestConfig.knowledgeSources ?? [])
      } catch {
        return
      }
    }

    void loadLatestConfig()
    return () => {
      cancelled = true
    }
  }, [businessName, initialConfig.tenantId])

  useEffect(() => {
    let cancelled = false

    async function loadWidgetSettings() {
      try {
        setWidgetLoading(true)
        const settings = await fetchWidgetSettings()
        if (cancelled) return
        setWidgetControls({
          widgetEnabled: settings.widgetEnabled,
          textEnabled: settings.textEnabled,
          voiceEnabled: settings.voiceEnabled,
        })
        setWidgetStatus({
          publicWidgetId: settings.publicWidgetId,
          widgetInstalled: settings.widgetInstalled,
          widgetLastSeenAt: settings.widgetLastSeenAt,
          widgetPrimaryColor: settings.widgetPrimaryColor,
          previewDomain: settings.allowedDomains[0] || websiteDomain,
          embedCode: settings.embedCode,
        })
      } catch {
        if (!cancelled) {
          setWidgetControls((current) => ({
            widgetEnabled: current.widgetEnabled,
            textEnabled: current.textEnabled,
            voiceEnabled: true,
          }))
        }
      } finally {
        if (!cancelled) {
          setWidgetLoading(false)
        }
      }
    }

    void loadWidgetSettings()

    return () => {
      cancelled = true
    }
  }, [])

  const previewUrl = useMemo(() => {
    const domain = widgetStatus.previewDomain || websiteDomain
    if (!domain) return null
    return domain.startsWith("http") ? domain : `https://${domain}`
  }, [widgetStatus.previewDomain, websiteDomain])

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
    const resolved = resolvePrimaryKnowledgeSiteUrl({
      knowledgeSources: accountKnowledgeSources,
      tenantId: initialConfig.tenantId,
      websiteDomain,
    })
    if (resolved) {
      return resolved
    }
    return "No indexed sources yet"
  }, [accountKnowledgeSources, websiteDomain, initialConfig.tenantId, lsKnowledgeOrigin])

  const autoSelected = selectedLanguages.includes("auto")
  const selectedVoice = VOICE_OPTIONS.find((voice) => voice.id === voiceVariant) ?? VOICE_OPTIONS[0]
  const voiceLabel = voiceVariant === "clone"
    ? (voiceCloneName ? `Clone: ${voiceCloneName}` : "Cloned voice")
    : selectedVoice.label
  const instructionsComplete = systemInstructions.trim().length > 0
  const voiceComplete = Boolean(voiceVariant)
  const roleComplete = role.trim().toLowerCase() === "all"
  const languagesComplete = selectedLanguages.length > 0
  const mandatoryComplete = instructionsComplete && voiceComplete && roleComplete && languagesComplete

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
    if (!mandatoryComplete) {
      setError("Complete all mandatory sections (Instructions, Voice, Languages) before saving.")
      setMessage("")
      return
    }

    try {
      setSaving(true)
      setError("")
      setMessage("")
      const nextConfig = await saveAgentConfig({
        agentName,
        businessName: workspaceName,
        welcomeMessage,
        customInstructions: systemInstructions,
        goals: selectedGoals.includes("All goals") ? GOALS.filter((goal) => goal !== "All goals") : selectedGoals,
        supportedLanguages: selectedLanguages.includes("auto") ? ["auto"] : selectedLanguages.filter((code) => MANUAL_LANGUAGE_CODES.includes(code)),
        active: true,
      })
      const widgetAfterSave = await saveWidgetSettings({
        widgetEnabled: widgetControls.widgetEnabled,
        textEnabled: widgetControls.textEnabled,
        voiceEnabled: widgetControls.voiceEnabled,
        widgetWelcomeMessage: welcomeMessage,
        allowedDomains: websiteDomain ? [websiteDomain] : undefined,
      })
      setWidgetStatus({
        publicWidgetId: widgetAfterSave.publicWidgetId,
        widgetInstalled: widgetAfterSave.widgetInstalled,
        widgetLastSeenAt: widgetAfterSave.widgetLastSeenAt,
        widgetPrimaryColor: widgetAfterSave.widgetPrimaryColor,
        previewDomain: widgetAfterSave.allowedDomains[0] || websiteDomain,
        embedCode: widgetAfterSave.embedCode,
      })
      setAgentName(nextConfig.agentName || "Omniweb AI")
      setWorkspaceName(nextConfig.businessName || businessName || "")
      setWelcomeMessage(nextConfig.welcomeMessage || "Thank you for visiting our website today... it will be my pleasure to help you")
      setSystemInstructions(nextConfig.customInstructions || "Talk about what is on the website, answer common questions, and guide high-intent visitors toward the next best step.")
      setSelectedGoals(nextConfig.goals?.length ? nextConfig.goals : selectedGoals)
      setSelectedLanguages(getInitialSelectedLanguages(nextConfig))
      setAccountKnowledgeSources(nextConfig.knowledgeSources ?? [])
      setMessage("Configuration saved and widget synced.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save configuration.")
    } finally {
      setSaving(false)
    }
  }

  const handleCopyInstallSnippet = async () => {
    if (!widgetStatus.embedCode) {
      setError("Install snippet is not available yet.")
      setMessage("")
      return
    }

    try {
      await navigator.clipboard.writeText(widgetStatus.embedCode)
      setSnippetCopied(true)
      setError("")
      setMessage("Install snippet copied.")
      window.setTimeout(() => setSnippetCopied(false), 1500)
    } catch {
      setError("Could not copy install snippet.")
      setMessage("")
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
      <section className="grid min-w-0 items-start gap-4 sm:gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="space-y-6">
          <div className="dashboard-card-highlight overflow-hidden rounded-[28px] p-0">
            <div className="border-b border-white/10 bg-slate-950/95 px-4 py-4 text-white sm:px-6 lg:px-8">
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200"><Bot className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-cyan-200">AI Agent Builder</p>
                      <p className="text-xs text-slate-400">Last saved settings sync to your website widget</p>
                    </div>
                  </div>
                </div>
                <div className="dashboard-responsive-tabs lg:justify-end lg:overflow-visible lg:pb-0">
                  {["Conversation", "Voice", "Actions", "Advanced"].map((tab, index) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={scrollToConfiguration}
                      className={`dashboard-responsive-tab rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${index === 0 ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">AI Agent launch</p>
                <h1 className="dashboard-page-title mt-3">Configure, test, and install your widget in one place</h1>
                <p className="dashboard-body mt-3">
                  Configure the agent, choose a voice, and test it live from the preview panel. Everything stays focused on one page.
                </p>
              </div>
            </div>
          </div>

          <div className={cardClassName}>
            <div className="h-1 rounded-full bg-[linear-gradient(90deg,#2563eb,#14b8a6)]" />
            <div className="dashboard-responsive-tabs mt-5 border-b border-slate-200">
              {["Instructions", "Voice", "Roles", "Languages"].map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={scrollToConfiguration}
                  className={`dashboard-responsive-tab rounded-full px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${index === 0 ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
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

          <section id="configure-agent" ref={configureRef} className={cardClassName}>
            <div className="h-1 rounded-full bg-[linear-gradient(90deg,#1d4ed8,#14b8a6)]" />
            <div className="pt-5">
              <p className="text-lg font-semibold text-slate-900">Primary Roles</p>
              <p className="mt-1 text-sm text-slate-500">Choose goals that match your industry and company. Default is All goals.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {GOALS.map((goal) => {
                  const active = selectedGoals.includes(goal)
                  return (
                    <label key={goal} className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition sm:px-4 sm:py-3.5 sm:text-[15px] ${active ? "border-cyan-400/40 bg-[#0f1b35] text-white shadow-[0_12px_26px_rgba(15,27,53,0.18)]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                      <input type="checkbox" checked={active} onChange={() => toggleGoal(goal)} className="h-4 w-4 rounded border-slate-300 text-[#4f46e5] focus:ring-[#4f46e5]" />
                      <span className="min-w-0">{goal}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="min-w-0 2xl:sticky 2xl:top-6 2xl:self-start">
          <LivePreviewPanel
            agentName={agentName}
            businessName={workspaceName || businessName || "Omniweb"}
            knowledgePreview={knowledgePreview}
            voiceLabel={voiceLabel}
            voiceCloneEnabled={voiceCloneEnabled}
            voiceVariant={voiceVariant}
            onSelectVoice={(voiceId) => setVoiceVariant(voiceId)}
            onToggleVoiceClone={() => setVoiceCloneEnabled((current) => !current)}
            voiceCloneName={voiceCloneName}
            onVoiceCloneNameChange={setVoiceCloneName}
            voiceCloneAudioUrl={voiceCloneAudioUrl}
            voiceCloneSampleName={voiceCloneSampleName}
            onVoiceSampleRecorded={(url) => {
              setVoiceCloneAudioUrl(url)
              setVoiceCloneSampleName("Recorded voice sample")
            }}
            onSaveVoiceClone={() => {
              setVoiceCloneEnabled(true)
              setVoiceVariant("clone")
              setVoiceCloneName((current) => current || "Saved clone voice")
              setMessage("Cloned voice saved for testing.")
            }}
            canDeleteClonedVoice={canDeleteClonedVoice}
            onDeleteClonedVoice={handleDeleteClonedVoice}
            widgetControls={widgetControls}
            setWidgetControls={setWidgetControls}
            widgetLoading={widgetLoading}
            mandatoryComplete={mandatoryComplete}
            onSave={handleSave}
            saving={saving}
            widgetInstalled={widgetStatus.widgetInstalled}
            widgetLastSeenAt={widgetStatus.widgetLastSeenAt}
            previewUrl={previewUrl}
            onCopyInstallSnippet={handleCopyInstallSnippet}
            snippetCopied={snippetCopied}
          />
        </div>
      </section>

      {(message || error) ? (
        <div className={`rounded-[24px] border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}>
          {error || message}
        </div>
      ) : null}

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
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <span>{label}</span>
      <span className={`break-words font-semibold sm:max-w-[210px] sm:text-right ${muted ? "text-slate-500" : "text-white"}`}>{value}</span>
    </div>
  )
}

function LivePreviewPanel({
  agentName,
  businessName,
  knowledgePreview,
  voiceLabel,
  voiceCloneEnabled,
  voiceVariant,
  onSelectVoice,
  onToggleVoiceClone,
  voiceCloneName,
  onVoiceCloneNameChange,
  voiceCloneAudioUrl,
  voiceCloneSampleName,
  onVoiceSampleRecorded,
  onSaveVoiceClone,
  canDeleteClonedVoice,
  onDeleteClonedVoice,
  widgetControls,
  setWidgetControls,
  widgetLoading,
  mandatoryComplete,
  onSave,
  saving,
  widgetInstalled,
  widgetLastSeenAt,
  previewUrl,
  onCopyInstallSnippet,
  snippetCopied,
}: {
  agentName: string
  businessName: string
  knowledgePreview: string
  voiceLabel: string
  voiceCloneEnabled: boolean
  voiceVariant: VoiceVariant
  onSelectVoice: (voiceId: (typeof VOICE_OPTIONS)[number]["id"]) => void
  onToggleVoiceClone: () => void
  voiceCloneName: string
  onVoiceCloneNameChange: (value: string) => void
  voiceCloneAudioUrl: string
  voiceCloneSampleName: string
  onVoiceSampleRecorded: (url: string) => void
  onSaveVoiceClone: () => void
  canDeleteClonedVoice: boolean
  onDeleteClonedVoice: () => void
  widgetControls: WidgetControlState
  setWidgetControls: React.Dispatch<React.SetStateAction<WidgetControlState>>
  widgetLoading: boolean
  mandatoryComplete: boolean
  onSave: () => void
  saving: boolean
  widgetInstalled: boolean
  widgetLastSeenAt: string | null
  previewUrl: string | null
  onCopyInstallSnippet: () => void
  snippetCopied: boolean
}) {
  return (
    <aside className="min-w-0 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
      <div className="border-b border-white/10 px-4 py-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Agent configuration</p>
        <p className="mt-1 text-sm text-slate-400">Dashboard setup only. The customer-facing widget lives on the installed website.</p>
      </div>

      <div className="flex min-h-0 flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[420px] sm:px-6 sm:py-10">
        <div className="relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
          <div className="absolute inset-0 rounded-full border border-cyan-300/30" />
          <div className="absolute inset-3 rounded-full border border-violet-400/40" />
          <div className="absolute inset-7 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.35),rgba(99,102,241,0.1),transparent_70%)]" />
          <Mic2 className="relative h-12 w-12 text-cyan-100" />
        </div>

        <h3 className="mt-7 text-xl font-semibold">{agentName || "Omniweb AI"}</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
          Configure {voiceLabel.toLowerCase()} for {businessName}. Test from the installed site widget or AI Telephony test call.
        </p>

        <div className="mt-6 grid w-full min-w-0 gap-3 rounded-2xl border border-white/10 bg-white/3 p-4 text-left text-sm text-slate-300">
          <PreviewDetail label="Knowledge" value={knowledgePreview} />
          <PreviewDetail label="Voice" value={voiceLabel} />
          <PreviewDetail label="Cloning" value={voiceCloneEnabled ? "Saved" : "Off"} muted={!voiceCloneEnabled} />
        </div>

        <div className="mt-7 grid w-full min-w-0 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-left sm:p-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Widget controls</p>
          </div>

          <label className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100">
            <span>Widget enabled</span>
            <Switch
              checked={widgetControls.widgetEnabled}
              onCheckedChange={(checked) => setWidgetControls((current) => ({ ...current, widgetEnabled: checked }))}
              disabled={widgetLoading || saving}
            />
          </label>
          <label className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100">
            <span>Voice enabled</span>
            <Switch
              checked={widgetControls.voiceEnabled}
              onCheckedChange={(checked) => setWidgetControls((current) => ({ ...current, voiceEnabled: checked }))}
              disabled={widgetLoading || saving}
            />
          </label>
          <label className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100">
            <span>Text enabled</span>
            <Switch
              checked={widgetControls.textEnabled}
              onCheckedChange={(checked) => setWidgetControls((current) => ({ ...current, textEnabled: checked }))}
              disabled={widgetLoading || saving}
            />
          </label>

          <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Voice</p>
                <p className="mt-1 text-xs text-slate-400">Choose the voice visitors hear when they test or use the widget.</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {VOICE_OPTIONS.map((voice) => {
                const active = voiceVariant === voice.id
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => onSelectVoice(voice.id)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${active ? "border-cyan-400 bg-[#0f1b35] text-white shadow-[0_12px_24px_rgba(15,27,53,0.22)]" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-white/15 text-cyan-100" : "bg-white/10 text-slate-300"}`}>
                          <Volume2 className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{voice.label}</p>
                          <p className={`mt-1 text-xs ${active ? "text-cyan-100" : "text-slate-400"}`}>Ready for live preview</p>
                        </div>
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-cyan-300" : "bg-slate-500"}`} />
                    </div>
                    <p className={`mt-2 text-xs leading-5 ${active ? "text-slate-200" : "text-slate-400"}`}>{voice.description}</p>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-300/15 text-violet-200">
                    <Mic2 className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Voice cloning</p>
                    <p className="mt-1 text-xs text-slate-400">Record a short sample and save it as your cloned voice.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleVoiceClone}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${voiceCloneEnabled ? "bg-violet-400 text-white" : "bg-white/10 text-slate-200 ring-1 ring-white/15"}`}
                >
                  {voiceCloneEnabled ? "Enabled" : "Enable"}
                </button>
              </div>

              {voiceCloneEnabled ? (
                <div className="mt-3 grid gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Cloned voice name</label>
                    <input
                      value={voiceCloneName}
                      onChange={(event) => onVoiceCloneNameChange(event.target.value)}
                      placeholder="Example: Founder voice, Support voice"
                      className="dashboard-input mt-2"
                    />
                  </div>
                  <VoiceCloneRecorder
                    audioUrl={voiceCloneAudioUrl}
                    sampleName={voiceCloneSampleName}
                    onRecorded={onVoiceSampleRecorded}
                    onSave={onSaveVoiceClone}
                  />
                  {canDeleteClonedVoice ? (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={onDeleteClonedVoice}
                        className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
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

          <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Widget test</p>
              <span className={`rounded-full border border-current/10 px-2.5 py-1 text-[11px] font-semibold ${widgetInstalled ? "text-emerald-300" : "text-amber-300"}`}>
                {widgetInstalled ? "Installed" : "Not installed"}
              </span>
            </div>
            <h4 className="mt-3 text-lg font-semibold text-white">Verify the installed website widget</h4>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-2 h-11 w-full justify-center rounded-2xl border-white/15 bg-white/10 text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCopyInstallSnippet}
            disabled={saving || widgetLoading}
          >
            <Copy className="h-4 w-4" />
            {snippetCopied ? "Snippet copied" : "Install snippet"}
          </Button>

          <Button
            className="h-11 w-full rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            onClick={onSave}
            disabled={saving || widgetLoading || !mandatoryComplete}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save configuration
          </Button>

          {!mandatoryComplete ? (
            <p className="text-xs text-amber-200">Complete mandatory sections: Instructions, Voice, and Languages.</p>
          ) : (
            <p className="text-xs text-slate-300">All required sections complete. You can save and launch now.</p>
          )}
        </div>
      </div>
    </aside>
  )
}

