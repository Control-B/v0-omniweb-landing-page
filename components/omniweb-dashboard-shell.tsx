"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  BarChart3,
  Bot,
  Brain,
  Check,
  Circle,
  Loader2,
  LogOut,
  Phone,
  ShieldAlert,
  Sparkles,
  TestTube2,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { OmniwebLogo } from "@/components/brand-logo"
import { dispatchAssistantOpen } from "@/lib/assistant-events"
import { getPublicEngineUrl } from "@/lib/engine-url"

const ENGINE_URL = getPublicEngineUrl()

type DashboardTab = "overview" | "agent" | "telephony" | "test" | "knowledge" | "pricing" | "analytics"

type OmniwebDashboardShellProps = {
  email: string
  plan: string
  clientId: string
  isTrial?: boolean
  trialLabel?: string
  firstName?: string
  engineToken?: string
}

type AgentConfig = {
  agent_name?: string
  agent_greeting?: string
  business_name?: string
  business_type?: string
  industry?: string
  agent_mode?: string
  website_domain?: string
  system_prompt?: string
  supported_languages?: string[]
  primary_goals?: string[]
}

type SubStatus = {
  status: string
  plan: string
  trial_ends_at: string | null
  minutes_used: number
}

type EmbedInfo = {
  embed_code: string
  snippet: string
  domain: string | null
  expires_at: string | null
}

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  score: number
  status: string
  created_at: string
}

type KnowledgeSource = {
  id: string
  url: string
  details: string
  status: "indexing" | "ready"
  addedAt: string
}

type TelephonySettings = {
  omniwebPhoneAgentId: string
  aiPhoneNumber: string
  escalationPhone: string
  escalationEmail: string
  escalationMessage: string
}

const NAV_ITEMS: Array<{ key: DashboardTab; label: string; icon: typeof Bot }> = [
  { key: "overview", label: "Overview", icon: Sparkles },
  { key: "agent", label: "AI Agent", icon: Bot },
  { key: "telephony", label: "AI Telephony", icon: Phone },
  { key: "test", label: "Test Console", icon: TestTube2 },
  { key: "knowledge", label: "Knowledge", icon: Brain },
  { key: "pricing", label: "Pricing", icon: Wallet },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
]

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
  { code: "auto", label: "Auto (detect speaker language)", flag: "🌐" },
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

const DEFAULT_TELEPHONY: TelephonySettings = {
  omniwebPhoneAgentId: "agent_xxxxxxxxxx",
  aiPhoneNumber: "+15551234567",
  escalationPhone: "+15557654321",
  escalationEmail: "owner@example.com",
  escalationMessage: "Let me connect you with a human who can help with this directly.",
}

function storageKey(clientId: string, suffix: string) {
  return `omniweb-dashboard:${clientId}:${suffix}`
}

function formatPlan(value: string | null | undefined) {
  if (!value) return "Starter"
  return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase())
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "just now"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function defaultGoals(config: AgentConfig | null) {
  if (Array.isArray(config?.primary_goals) && config.primary_goals.length > 0) return config.primary_goals
  return ["Product Recommendations", "Customer Support & FAQs", "Cart Management & Reminders", "Lead Capture"]
}

function defaultLanguages(config: AgentConfig | null) {
  return Array.isArray(config?.supported_languages) && config.supported_languages.length > 0
    ? config.supported_languages
    : ["en"]
}

export function OmniwebDashboardShell({ email, plan, clientId, isTrial, trialLabel, firstName, engineToken }: OmniwebDashboardShellProps) {
  const { getToken, signOut } = useAuth()
  const [tab, setTab] = useState<DashboardTab>("overview")
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null)
  const [embedInfo, setEmbedInfo] = useState<EmbedInfo | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [saveError, setSaveError] = useState("")
  const [copied, setCopied] = useState(false)

  const [agentName, setAgentName] = useState("Omniweb AI")
  const [businessName, setBusinessName] = useState("")
  const [welcomeMessage, setWelcomeMessage] = useState("Thank you for visiting our website today... it will be my pleasure to help you")
  const [systemInstructions, setSystemInstructions] = useState("Talk about what is on the website, answer common questions, and guide high-intent visitors toward the next best step.")
  const [responseLength, setResponseLength] = useState("Moderate – balanced detail")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [telephony, setTelephony] = useState<TelephonySettings>(DEFAULT_TELEPHONY)
  const [knowledgeUrl, setKnowledgeUrl] = useState("")
  const [knowledgeDetails, setKnowledgeDetails] = useState("")
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [voiceVariant, setVoiceVariant] = useState<"Female" | "Male">("Female")

  const displayName = firstName || email.split("@")[0] || "there"

  const getFreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const clerkToken = await getToken()
      if (clerkToken) return clerkToken
    } catch {
      return engineToken ?? null
    }
    return engineToken ?? null
  }, [engineToken, getToken])

  const authFetch = useCallback(async (url: string, opts: RequestInit = {}) => {
    const token = await getFreshToken()
    const headers = new Headers(opts.headers)
    if (token) headers.set("Authorization", `Bearer ${token}`)
    if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json")
    return fetch(url, { ...opts, headers })
  }, [getFreshToken])

  useEffect(() => {
    ;(async () => {
      try {
        const [configRes, subRes, leadsRes] = await Promise.all([
          authFetch(`${ENGINE_URL}/api/agent-config/${clientId}`),
          authFetch(`${ENGINE_URL}/api/subscribe/status`),
          authFetch(`${ENGINE_URL}/api/leads?limit=50`),
        ])

        if (configRes.ok) {
          const configData = await configRes.json()
          setConfig(configData)
          setAgentName(configData.agent_name || "Omniweb AI")
          setBusinessName(configData.business_name || "")
          setWelcomeMessage(configData.agent_greeting || "Thank you for visiting our website today... it will be my pleasure to help you")
          setSystemInstructions(configData.system_prompt || "Talk about what is on the website, answer common questions, and guide high-intent visitors toward the next best step.")
          setSelectedGoals(defaultGoals(configData))
          setSelectedLanguages(defaultLanguages(configData))
          if (configData.website_domain) {
            setKnowledgeUrl(`https://${String(configData.website_domain).replace(/^https?:\/\//, "")}`)
          }
        } else {
          setSelectedGoals(defaultGoals(null))
          setSelectedLanguages(defaultLanguages(null))
        }

        if (subRes.ok) setSubStatus(await subRes.json())
        if (leadsRes.ok) {
          const data = await leadsRes.json()
          setLeads(Array.isArray(data) ? data : data.leads || [])
        }
      } catch {
        setSelectedGoals(defaultGoals(null))
        setSelectedLanguages(defaultLanguages(null))
      } finally {
        setLoading(false)
      }
    })()
  }, [authFetch, clientId])

  useEffect(() => {
    if (tab !== "overview" && tab !== "knowledge") return
    ;(async () => {
      try {
        const res = await authFetch(`${ENGINE_URL}/api/embed/snippet`)
        if (res.ok) setEmbedInfo(await res.json())
      } catch {
        return
      }
    })()
  }, [authFetch, tab])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const savedTelephony = window.localStorage.getItem(storageKey(clientId, "telephony"))
      if (savedTelephony) setTelephony(JSON.parse(savedTelephony))

      const savedKnowledge = window.localStorage.getItem(storageKey(clientId, "knowledge"))
      if (savedKnowledge) {
        setKnowledgeSources(JSON.parse(savedKnowledge))
      } else if (config?.website_domain) {
        setKnowledgeSources([
          {
            id: "default-source",
            url: `https://${String(config.website_domain).replace(/^https?:\/\//, "")}`,
            details: "",
            status: "indexing",
            addedAt: new Date().toISOString(),
          },
        ])
      }
    } catch {
      return
    }
  }, [clientId, config?.website_domain])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(storageKey(clientId, "telephony"), JSON.stringify(telephony))
  }, [clientId, telephony])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(storageKey(clientId, "knowledge"), JSON.stringify(knowledgeSources))
  }, [clientId, knowledgeSources])

  const trialDaysLeft = subStatus?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subStatus.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 14

  const qualifiedLeads = useMemo(() => leads.filter((lead) => lead.score >= 60).length, [leads])
  const avgLeadScore = useMemo(() => {
    if (leads.length === 0) return 0
    return Math.round(leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length)
  }, [leads])
  const recentSessions = useMemo(() => leads.slice(0, 6), [leads])
  const setupState = config?.business_name && config?.website_domain ? "Configured" : "Setup in progress"

  const showToast = (message: string, isError = false) => {
    if (isError) {
      setSaveError(message)
      setTimeout(() => setSaveError(""), 3500)
    } else {
      setSaveMsg(message)
      setTimeout(() => setSaveMsg(""), 3500)
    }
  }

  const handleSaveAgent = async () => {
    setSaving(true)
    try {
      const body = {
        agent_name: agentName,
        business_name: businessName,
        agent_greeting: welcomeMessage,
        system_prompt: systemInstructions,
        supported_languages: selectedLanguages.filter((value) => value !== "auto"),
        primary_goals: selectedGoals.includes("All goals") ? GOALS.filter((goal) => goal !== "All goals") : selectedGoals,
      }
      const method = config ? "PATCH" : "PUT"
      const res = await authFetch(`${ENGINE_URL}/api/agent-config/${clientId}`, {
        method,
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        showToast("Could not save AI agent settings.", true)
        return
      }
      const updated = await res.json().catch(() => null)
      if (updated) setConfig(updated)
      showToast("AI agent saved and synced.")
    } catch {
      showToast("Network error while saving AI agent.", true)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTelephony = () => showToast("AI Telephony settings saved.")

  const handleAddKnowledge = () => {
    if (!knowledgeUrl.trim()) return
    const next: KnowledgeSource = {
      id: String(Date.now()),
      url: knowledgeUrl.trim(),
      details: knowledgeDetails.trim(),
      status: "indexing",
      addedAt: new Date().toISOString(),
    }
    setKnowledgeSources((current) => [next, ...current])
    setKnowledgeUrl("")
    setKnowledgeDetails("")
    showToast("Knowledge source added.")
    window.setTimeout(() => {
      setKnowledgeSources((current) => current.map((item) => item.id === next.id ? { ...item, status: "ready" } : item))
    }, 1400)
  }

  const handleSaveKnowledgeDetails = (id: string, details: string) => {
    setKnowledgeSources((current) => current.map((item) => item.id === id ? { ...item, details } : item))
    showToast("Knowledge details saved.")
  }

  const handleRemoveKnowledge = (id: string) => {
    setKnowledgeSources((current) => current.filter((item) => item.id !== id))
    showToast("Knowledge source removed.")
  }

  const handleSubscribe = async (selectedPlan: string) => {
    try {
      const res = await authFetch(`${ENGINE_URL}/api/subscribe/checkout`, {
        method: "POST",
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.checkout_url) {
        window.location.href = data.checkout_url
        return
      }
      showToast("Subscription checkout is not configured yet.", true)
    } catch {
      showToast("Subscription checkout is not configured yet.", true)
    }
  }

  const handleSignOut = async () => {
    try {
      fetch("/auth/signout", { method: "POST", redirect: "manual" }).catch(() => {})
      await signOut({ redirectUrl: "/" })
    } catch {
      window.location.href = "/"
    }
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
      if (current.includes(code)) {
        if (code === "en") return current
        return current.filter((item) => item !== code)
      }
      return [...current, code]
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#eef4ff]">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#3b82f6]" />
          Loading your Omniweb dashboard
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_48%,#f8fbff_100%)] text-slate-800">
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <aside className="w-full border-b border-white/60 bg-white/75 backdrop-blur lg:min-h-dvh lg:w-[270px] lg:border-b-0 lg:border-r lg:sticky lg:top-0">
          <div className="flex items-center gap-3 px-5 py-5">
            <OmniwebLogo href="/dashboard" textClassName="text-2xl font-semibold tracking-tight text-slate-900" sublabel={email} sublabelClassName="text-xs text-slate-500" />
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${tab === item.key ? "bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)]" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
              >
                <item.icon className={`h-4 w-4 ${tab === item.key ? "text-cyan-300" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden px-4 pb-5 lg:block">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto max-w-7xl space-y-5">
            {(saveMsg || saveError) && (
              <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${saveError ? "border-red-200 bg-red-50 text-red-700" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}>
                {saveError || saveMsg}
              </div>
            )}

            <header className="rounded-[2rem] border border-white/70 bg-[linear-gradient(90deg,rgba(99,102,241,0.10),rgba(34,211,238,0.08),rgba(99,102,241,0.08))] px-5 py-5 shadow-[0_18px_40px_rgba(148,163,184,0.12)] sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4f46e5] shadow-sm">
                    <Circle className="h-2.5 w-2.5 fill-current text-cyan-400" />
                    {setupState}
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {tab === "overview" && `Turn visitors into helped shoppers, ${displayName}.`}
                    {tab === "agent" && "Shape how your AI agent sells and supports."}
                    {tab === "telephony" && "Add a Call Us AI phone widget."}
                    {tab === "test" && "Test your Omniweb AI before shoppers see it."}
                    {tab === "knowledge" && "Give your AI the knowledge it needs to answer accurately."}
                    {tab === "pricing" && "Manage your subscription and usage."}
                    {tab === "analytics" && "Track storefront activity and lead quality at a glance."}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">
                    {tab === "overview" && "Configure your agent, add knowledge, and keep the storefront widget synced from one Omniweb workspace."}
                    {tab === "agent" && "Set the welcome message, goals, languages, and operating rules that sync to your storefront widget."}
                    {tab === "telephony" && "Let shoppers request a call with the same Omniweb AI agent and human escalation path."}
                    {tab === "test" && "Save first, then validate your voice, greeting, language switching, and cart guidance flow."}
                    {tab === "knowledge" && "Add URLs the AI agent should learn from — FAQ pages, policies, product pages, and more."}
                    {tab === "pricing" && "See your plan, usage, trial status, and upgrade options in one place."}
                    {tab === "analytics" && "Review conversation volume, qualified leads, and the most recent visitor sessions."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {tab === "overview" && (
                    <>
                      <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => setTab("agent")}>Configure agent</Button>
                      <Button variant="outline" className="rounded-xl border-white/80 bg-white/80" onClick={() => setTab("knowledge")}>Add knowledge</Button>
                    </>
                  )}
                  {tab === "agent" && (
                    <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={handleSaveAgent} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save and sync agent
                    </Button>
                  )}
                  {tab === "test" && (
                    <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => dispatchAssistantOpen("text")}>Ask AI</Button>
                  )}
                </div>
              </div>
            </header>

            {tab === "overview" && (
              <div className="space-y-5">
                <section className="grid gap-4 xl:grid-cols-3">
                  <StatusCard title="Subscription" badge={subStatus?.status === "active" ? "Active" : isTrial || subStatus?.status === "trial" ? "Free trial" : "Needs plan"} badgeTone={subStatus?.status === "active" ? "success" : "info"} value={`Plan: ${formatPlan(subStatus?.plan || plan)}`} note={trialLabel || ((isTrial || subStatus?.status === "trial") ? `${trialDaysLeft} days remaining` : "Billing and plan controls")} action="Manage plan" onAction={() => setTab("pricing")} />
                  <StatusCard title="AI Agent" badge={config?.agent_name ? "Configured" : "Needs setup"} badgeTone={config?.agent_name ? "success" : "warning"} value={config?.agent_name ? `“${config.agent_name}” — ${Math.max(1, selectedLanguages.length)} language active` : "Add your agent name, greeting, and rules"} note={config?.business_name || "Agent settings sync to your storefront widget"} action="Edit agent" onAction={() => setTab("agent")} />
                  <StatusCard title="Storefront Widget" badge={embedInfo ? "Ready" : "Needs sync"} badgeTone={embedInfo ? "success" : "warning"} value={embedInfo ? "Embed snippet active" : "Generate and install your embed snippet"} note={embedInfo?.domain ? `Locked to ${embedInfo.domain}` : "Engine sync is required before shoppers can use it"} action="Open theme editor" onAction={() => setTab("knowledge")} />
                </section>

                <section className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
                  <p className="mb-4 text-sm font-semibold text-slate-900">Quick actions</p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <QuickAction title="Agent settings" onClick={() => setTab("agent")} />
                    <QuickAction title="Knowledge base" onClick={() => setTab("knowledge")} />
                    <QuickAction title="View analytics" onClick={() => setTab("analytics")} />
                    <QuickAction title="Test live widget" onClick={() => setTab("test")} />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
                  <p className="mb-5 text-sm font-semibold text-slate-900">Getting started</p>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <ChecklistCard index={1} title="Configure your agent" body="Set your agent name, greeting, goals, and the languages you want it to support." done={Boolean(config?.agent_name)} />
                    <ChecklistCard index={2} title="Add knowledge sources" body="Paste URLs of your FAQ pages, policies, or product info so the agent can answer accurately." done={knowledgeSources.length > 0} />
                    <ChecklistCard index={3} title="Enable storefront widget" body="Generate your embed snippet and toggle the Omniweb widget on your store or website." done={Boolean(embedInfo)} />
                  </div>
                </section>
              </div>
            )}

            {tab === "agent" && (
              <div className="space-y-5">
                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_360px]">
                  <Card>
                    <SectionBar />
                    <div className="grid gap-4 pt-4 md:grid-cols-2">
                      <Field label="Agent name" helper="The name shoppers will see in the chat widget"><input value={agentName} onChange={(event) => setAgentName(event.target.value)} className={inputClass} /></Field>
                      <Field label="Business name" helper="Used throughout the agent experience and system context"><input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className={inputClass} /></Field>
                      <Field label="Welcome message" helper="The first message shoppers see when they open the chat" className="md:col-span-2"><input value={welcomeMessage} onChange={(event) => setWelcomeMessage(event.target.value)} className={inputClass} /></Field>
                      <Field label="System instructions" helper="Describe your business, products, policies, and how the agent should behave" className="md:col-span-2"><textarea value={systemInstructions} onChange={(event) => setSystemInstructions(event.target.value)} rows={5} className={textareaClass} /></Field>
                      <Field label="Response length"><select value={responseLength} onChange={(event) => setResponseLength(event.target.value)} className={inputClass}><option>Short – concise replies</option><option>Moderate – balanced detail</option><option>Detailed – high context</option></select></Field>
                    </div>
                  </Card>

                  <div className="space-y-5">
                    <InfoCard title="Engine sync" body="Settings sync to the Omniweb AI engine on save. The widget uses the saved config for voice, text, multilingual replies, and navigation." />
                    <InfoCard title="Knowledge base context" actionLabel="Edit KB" onAction={() => setTab("knowledge")} body="These sources and subscriber details are included when the agent syncs.">
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{knowledgeSources[0]?.url || (config?.website_domain ? `https://${config.website_domain}` : "No indexed sources yet")}</div>
                    </InfoCard>
                    <InfoCard title="Test your agent" body="Save first, then test your agent’s voice, language switching, and greeting before shoppers see it.">
                      <div className="mt-4 border-t border-slate-200 pt-4"><Button variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={() => setTab("test")}>Open test console</Button></div>
                    </InfoCard>
                  </div>
                </section>

                <Card>
                  <SectionBar />
                  <div className="pt-4">
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
                </Card>

                <Card>
                  <SectionBar />
                  <div className="pt-4">
                    <p className="text-lg font-semibold text-slate-900">Supported Languages</p>
                    <p className="mt-1 text-sm text-slate-500">The widget will show a language picker to shoppers. Your agent will respond in the chosen language.</p>
                    <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {LANGUAGE_OPTIONS.map((language) => (
                        <label key={language.code} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <input type="checkbox" checked={selectedLanguages.includes(language.code)} onChange={() => toggleLanguage(language.code)} className="h-4 w-4 rounded border-slate-300 text-[#4f46e5] focus:ring-[#4f46e5]" />
                          <span>{language.flag}</span>
                          <span>{language.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="border-b border-amber-200 bg-amber-400/95 px-4 py-3 text-sm font-semibold text-amber-950"><ShieldAlert className="mr-2 inline h-4 w-4" />Financial Transaction Policy — Required</div>
                  <div className="p-4 text-sm text-slate-700">
                    <p className="mb-3">By saving, you agree that the Omniweb AI agent will:</p>
                    <ul className="list-disc space-y-1 pl-5 text-slate-600">
                      <li>Add products to the shopper&apos;s cart</li>
                      <li>Send cart abandonment reminders</li>
                      <li>Not process checkouts or complete payments</li>
                      <li>Not issue refunds or access billing information</li>
                      <li>Not handle any financial transactions</li>
                    </ul>
                    <p className="mt-3 text-slate-500">Any financial request from a shopper will be immediately escalated to a human representative.</p>
                  </div>
                </Card>

                <div className="flex justify-end"><Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={handleSaveAgent} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save and sync agent</Button></div>
              </div>
            )}

            {tab === "telephony" && (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]">
                <Card>
                  <SectionBar />
                  <div className="grid gap-4 pt-4 md:grid-cols-2">
                    <Field label="Omniweb AI phone agent ID" helper="Use the same AI brain as the Omniweb voice experience" className="md:col-span-2"><input value={telephony.omniwebPhoneAgentId} onChange={(event) => setTelephony((current) => ({ ...current, omniwebPhoneAgentId: event.target.value }))} className={inputClass} /></Field>
                    <Field label="AI telephone number" helper="The Omniweb AI phone number customers receive calls from."><input value={telephony.aiPhoneNumber} onChange={(event) => setTelephony((current) => ({ ...current, aiPhoneNumber: event.target.value }))} className={inputClass} /></Field>
                    <Field label="Human escalation phone" helper="Owner or team number for human transfer/escalation."><input value={telephony.escalationPhone} onChange={(event) => setTelephony((current) => ({ ...current, escalationPhone: event.target.value }))} className={inputClass} /></Field>
                    <Field label="Escalation email fallback" className="md:col-span-2"><input value={telephony.escalationEmail} onChange={(event) => setTelephony((current) => ({ ...current, escalationEmail: event.target.value }))} className={inputClass} /></Field>
                    <Field label="Escalation message" className="md:col-span-2"><textarea value={telephony.escalationMessage} onChange={(event) => setTelephony((current) => ({ ...current, escalationMessage: event.target.value }))} rows={3} className={textareaClass} /></Field>
                  </div>
                  <div className="mt-5 flex justify-end"><Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={handleSaveTelephony}>Save AI Telephony</Button></div>
                </Card>

                <InfoCard title="Call Us widget behavior" body="This is separate from Ask AI. It appears as a Call Us option, collects the shopper phone number, and starts an Omniweb AI phone conversation.">
                  <p className="mt-4 text-sm text-slate-600">If the AI cannot resolve the request, it uses the human escalation phone and fallback email you set here.</p>
                </InfoCard>
              </div>
            )}

            {tab === "test" && (
              <div className="space-y-5">
                <Card>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-500">Voice:</span>
                      <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                        {(["Female", "Male"] as const).map((option) => (
                          <button key={option} onClick={() => setVoiceVariant(option)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${voiceVariant === option ? "bg-[#10b981] text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>{option}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => dispatchAssistantOpen("text")} className="inline-flex items-center gap-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,#4f46e5_55%,#4338ca)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.3)]"><span className="h-6 w-6 rounded-full bg-white/20 shadow-inner" />Ask AI</button>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-emerald-500"><p className="text-sm text-slate-500">Opening message:</p><p className="mt-1 text-base text-slate-800">“{welcomeMessage}”</p></Card>

                <Card className="border-dashed">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{config?.agent_name ? "Agent ready to test" : "Agent not synced yet"}</p>
                      <p className="mt-1 text-sm text-slate-600">{config?.agent_name ? "Open the test window and validate the greeting, product answers, and language switching." : "Go to AI Agent Settings, fill in your details, and click Save and sync agent. Then come back here to test."}</p>
                    </div>
                    <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => setTab("agent")}>Go to Agent Settings</Button>
                  </div>
                </Card>

                <div className="grid gap-3 xl:grid-cols-5">
                  {[
                    ["Welcome message", "Does the agent open with your custom greeting?"],
                    ["Product questions", "Ask about a product — does it answer from your knowledge base?"],
                    ["Language switching", "Try a different language if you have multiple enabled."],
                    ["Cart actions", "Ask to add something to cart — does it confirm?"],
                    ["Voice quality", "Is the voice clear and natural at the chosen gender?"],
                  ].map(([title, description], index) => (
                    <Card key={title} className="p-4"><div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">{index + 1}</div><p className="font-semibold text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-600">{description}</p></Card>
                  ))}
                </div>
              </div>
            )}

            {tab === "knowledge" && (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]">
                <div className="space-y-5">
                  <Card>
                    <p className="text-lg font-semibold text-slate-900">Add a knowledge URL</p>
                    <p className="mt-1 text-sm text-slate-500">Paste a page URL, then add the extra product, service, policy, or brand details that may not be fully written on the page.</p>
                    <div className="mt-5 space-y-4">
                      <Field label="Website or page URL" helper="The agent will crawl and index its content for answering shoppers.">
                        <div className="flex gap-3"><input value={knowledgeUrl} onChange={(event) => setKnowledgeUrl(event.target.value)} placeholder="yourstore.com/pages/faq" className={`${inputClass} flex-1`} /><Button onClick={handleAddKnowledge} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">Add URL</Button></div>
                      </Field>
                      <Field label="Extra details for this source" helper="Add the details shoppers should hear even if they are not obvious on the URL. This becomes part of the AI agent’s knowledge."><textarea value={knowledgeDetails} onChange={(event) => setKnowledgeDetails(event.target.value)} rows={4} placeholder="Example: These products are best for sensitive skin. Mention the 30-day exchange policy..." className={textareaClass} /></Field>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between"><p className="text-lg font-semibold text-slate-900">Indexed sources</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{knowledgeSources.length}</span></div>
                    <div className="mt-5 space-y-5">
                      {knowledgeSources.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No knowledge sources added yet.</p>}
                      {knowledgeSources.map((source) => (
                        <KnowledgeSourceCard key={source.id} source={source} onRemove={() => handleRemoveKnowledge(source.id)} onSaveDetails={(details) => handleSaveKnowledgeDetails(source.id, details)} />
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="space-y-5">
                  <InfoCard title="What to add first" body="Start with pages shoppers ask about most: FAQs, shipping, returns, product care, sizing, and warranty policies.">
                    <p className="mt-3 text-sm text-slate-600">Use public storefront URLs. Password-protected admin links cannot be indexed.</p>
                    <p className="mt-3 text-sm text-slate-600">Add subscriber details for product benefits, service rules, sales guidance, and answers that are missing from the page.</p>
                  </InfoCard>
                  <Card className="overflow-hidden p-0"><div className="border-b border-sky-200 bg-sky-200/80 px-4 py-3 text-sm font-semibold text-sky-950">Tips for better answers</div><div className="p-4 text-sm text-slate-700"><ul className="space-y-2"><li>Add one focused page per source.</li><li>Write details like you are training a new sales associate.</li><li>Keep policy pages updated before re-indexing.</li><li>Add product pages for richer recommendations.</li></ul></div></Card>
                </div>
              </div>
            )}

            {tab === "pricing" && (
              <div className="space-y-5">
                <section className="grid gap-4 lg:grid-cols-3">
                  <StatusCard title="Current plan" badge={subStatus?.status === "active" ? "Active" : "Trial"} badgeTone={subStatus?.status === "active" ? "success" : "info"} value={`Plan: ${formatPlan(subStatus?.plan || plan)}`} note={subStatus?.status === "trial" ? `${trialDaysLeft} days remaining` : "Billing managed through Omniweb"} />
                  <StatusCard title="AI usage" badge="Live" badgeTone="success" value={`${subStatus?.minutes_used ?? 0} minutes used`} note="Minutes update as calls and conversations are processed" />
                  <StatusCard title="Support" badge="Included" badgeTone="info" value="Priority setup assistance" note="Need a custom deployment? Talk to the Omniweb team." action="Email sales" onAction={() => window.open("mailto:sales@omniweb.ai")} />
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                  {[
                    { name: "Starter", price: "$497/mo", value: "starter", description: "Ideal for launch-stage stores", bullets: ["500 AI minutes", "Storefront widget", "Knowledge sources"] },
                    { name: "Growth", price: "$1,497/mo", value: "growth", popular: true, description: "Best for scaling brands", bullets: ["2,500 AI minutes", "Multilingual support", "Advanced reporting"] },
                    { name: "Scale", price: "Custom", value: "pro", description: "For enterprise rollouts", bullets: ["Unlimited usage", "Priority support", "Custom integrations"] },
                  ].map((tier) => (
                    <Card key={tier.value} className={`${tier.popular ? "ring-2 ring-cyan-200" : ""}`}>
                      {tier.popular && <span className="inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-800">Most popular</span>}
                      <p className="mt-3 text-xl font-semibold text-slate-900">{tier.name}</p>
                      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{tier.price}</p>
                      <p className="mt-2 text-sm text-slate-500">{tier.description}</p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-700">{tier.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-500" />{bullet}</li>)}</ul>
                      <Button className={`mt-6 w-full rounded-xl ${tier.popular ? "bg-slate-900 text-white hover:bg-slate-800" : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}`} variant={tier.popular ? "default" : "outline"} onClick={() => tier.value !== "pro" ? handleSubscribe(tier.value) : window.open("mailto:sales@omniweb.ai")}>{tier.value === "pro" ? "Contact sales" : `Choose ${tier.name}`}</Button>
                    </Card>
                  ))}
                </section>
              </div>
            )}

            {tab === "analytics" && (
              <div className="space-y-5">
                <section className="grid gap-4 lg:grid-cols-4">
                  <MetricCard title="Total conversations" value={String(leads.length)} subtitle={`${Math.min(153, Math.max(leads.length, 0))} active right now`} />
                  <MetricCard title="Qualified leads" value={String(qualifiedLeads)} subtitle={`${qualifiedLeads} emails captured`} />
                  <MetricCard title="Avg. lead score" value={String(avgLeadScore)} subtitle="Quality of recent sessions" />
                  <MetricCard title="Avg. messages / session" value={leads.length ? String(Math.max(2, Math.round(avgLeadScore / 18))) : "0"} subtitle="Last 10 sessions" />
                </section>

                <Card>
                  <div className="flex items-center justify-between"><p className="text-lg font-semibold text-slate-900">Recent sessions</p><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live data</span></div>
                  <div className="mt-5 divide-y divide-slate-200">
                    {recentSessions.length === 0 ? <div className="py-10 text-sm text-slate-500">No sessions yet. Once shoppers talk to your Omniweb AI agent, they will appear here.</div> : recentSessions.map((session) => (
                      <div key={session.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">Storefront conversation</span><span>EN</span></div>
                          <p className="mt-2 text-sm text-slate-800">{session.name || session.email || "Homepage visitor"} · {session.score || 0} lead score</p>
                          <p className="mt-1 text-sm text-slate-500">{session.status || "new"} · {session.email || "No email captured"}</p>
                        </div>
                        <p className="text-sm text-slate-400">{timeAgo(session.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function StatusCard({ title, badge, badgeTone = "info", value, note, action, onAction }: { title: string; badge: string; badgeTone?: "info" | "success" | "warning"; value: string; note: string; action?: string; onAction?: () => void }) {
  return <Card><SectionBar /><div className="pt-4"><div className="flex items-start justify-between gap-3"><p className="text-base font-semibold text-slate-900">{title}</p><Badge tone={badgeTone}>{badge}</Badge></div><p className="mt-4 text-base text-slate-700">{value}</p><p className="mt-2 text-sm text-slate-500">{note}</p>{action && onAction && <Button variant="outline" className="mt-4 w-full rounded-xl border-slate-200 bg-white" onClick={onAction}>{action}</Button>}</div></Card>
}

function QuickAction({ title, onClick }: { title: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900">{title}</button>
}

function ChecklistCard({ index, title, body, done }: { index: number; title: string; body: string; done?: boolean }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-3"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${done ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>{done ? <Check className="h-4 w-4" /> : index}</div><p className="font-semibold text-slate-900">{title}</p></div><p className="mt-3 text-sm text-slate-600">{body}</p></div>
}

function MetricCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return <Card><SectionBar /><div className="pt-4"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{value}</p><p className="mt-2 text-sm text-slate-500">{subtitle}</p></div></Card>
}

function KnowledgeSourceCard({ source, onRemove, onSaveDetails }: { source: KnowledgeSource; onRemove: () => void; onSaveDetails: (details: string) => void }) {
  const [draft, setDraft] = useState(source.details)

  useEffect(() => {
    setDraft(source.details)
  }, [source.details])

  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-slate-900">{source.url}</p><p className="mt-1 text-sm text-slate-500">Added {new Date(source.addedAt).toLocaleDateString()}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${source.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>{source.status === "ready" ? "Added" : "Added — indexing"}</span><button onClick={onRemove} className="text-sm text-rose-500 hover:text-rose-600">Remove</button></div></div><div className="mt-4"><label className="mb-2 block text-sm font-medium text-slate-700">Subscriber details</label><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} className={textareaClass} placeholder="Add product/service notes, recommendations, caveats, policies, and sales guidance for this URL." /></div><div className="mt-4 flex justify-end"><Button variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={() => onSaveDetails(draft)}>Save details</Button></div></div>
}

function InfoCard({ title, body, actionLabel, onAction, children }: { title: string; body: string; actionLabel?: string; onAction?: () => void; children?: React.ReactNode }) {
  return <Card><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold text-slate-900">{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>{actionLabel && onAction && <Button variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={onAction}>{actionLabel}</Button>}</div>{children}</Card>
}

function Badge({ tone, children }: { tone: "info" | "success" | "warning"; children: React.ReactNode }) {
  const classes = tone === "success" ? "bg-emerald-100 text-emerald-700" : tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{children}</span>
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)] ${className}`}>{children}</section>
}

function SectionBar() {
  return <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#06b6d4_100%)]" />
}

function Field({ label, helper, className = "", children }: { label: string; helper?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>{children}{helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}</div>
}

const inputClass = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
const textareaClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
