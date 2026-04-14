"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  Bot, BarChart3, Code2, Copy, Check, Mic, MessageSquare,
  Phone, Settings, Sparkles, Users, Palette, Globe, LogOut,
  CreditCard, Shield, AlertTriangle, ChevronRight, Zap,
  Building2, ArrowRight, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { dispatchAssistantOpen } from "@/lib/assistant-events"

const ENGINE_URL = process.env.NEXT_PUBLIC_OMNIWEB_ENGINE_URL || "https://omniweb-engine-rs6fr.ondigitalocean.app"

type Tab = "overview" | "widget" | "embed" | "leads" | "settings"

type DashboardShellProps = {
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
  widget_config?: Record<string, unknown>
  elevenlabs_agent_id?: string
  industry?: string
  agent_mode?: string
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

type Industry = {
  slug: string
  name: string
  description?: string
}

type Template = {
  id: string
  name: string
  description: string
  industry: string
  agent_name: string
  is_default: boolean
}

export function DashboardShell({ email, plan, clientId, isTrial, trialLabel, firstName, engineToken }: DashboardShellProps) {
  const { getToken } = useAuth()
  const [tab, setTab] = useState<Tab>("overview")
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const [subStatus, setSubStatus] = useState<SubStatus | null>(null)
  const [embedInfo, setEmbedInfo] = useState<EmbedInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [embedPhone, setEmbedPhone] = useState("")
  const [embedDomain, setEmbedDomain] = useState("")
  const [saveMsg, setSaveMsg] = useState("")

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [obBusinessName, setObBusinessName] = useState("")
  const [obIndustry, setObIndustry] = useState("general")
  const [obBusinessType, setObBusinessType] = useState("")
  const [industries, setIndustries] = useState<Industry[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [onboardingSaving, setOnboardingSaving] = useState(false)

  // Widget customization state
  const [widgetColor, setWidgetColor] = useState("#6366f1")
  const [widgetPosition, setWidgetPosition] = useState<"right" | "left">("right")
  const [widgetGreeting, setWidgetGreeting] = useState("")

  const displayName = firstName || email.split("@")[0] || "there"

  /**
   * Get a fresh Bearer token — prefers Clerk client-side token,
   * falls back to the server-rendered engineToken prop.
   */
  const getFreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const clerkToken = await getToken()
      if (clerkToken) return clerkToken
    } catch {
      // Clerk not available — fall back
    }
    return engineToken ?? null
  }, [getToken, engineToken])

  /**
   * Authenticated fetch wrapper — adds Authorization header automatically.
   */
  const authFetch = useCallback(async (url: string, opts: RequestInit = {}): Promise<Response> => {
    const token = await getFreshToken()
    const headers = new Headers(opts.headers)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    if (!headers.has("Content-Type") && opts.body) {
      headers.set("Content-Type", "application/json")
    }
    return fetch(url, { ...opts, headers })
  }, [getFreshToken])

  // Load agent config and subscription status
  useEffect(() => {
    ;(async () => {
      try {
        const [configRes, subRes] = await Promise.all([
          authFetch(`${ENGINE_URL}/api/agent-config/${clientId}`),
          authFetch(`${ENGINE_URL}/api/subscribe/status`),
        ])
        if (configRes.ok) {
          const data = await configRes.json()
          setConfig(data)
          setWidgetGreeting(data.agent_greeting || "")
          if (data.widget_config?.color) setWidgetColor(data.widget_config.color as string)
          if (data.widget_config?.position) setWidgetPosition(data.widget_config.position as "right" | "left")
        } else if (configRes.status === 404) {
          // No agent config — show onboarding
          setShowOnboarding(true)
          // Load industries and templates for onboarding
          try {
            const [indRes, tplRes] = await Promise.all([
              authFetch(`${ENGINE_URL}/api/agent-config/meta/industries`),
              authFetch(`${ENGINE_URL}/api/templates`),
            ])
            if (indRes.ok) setIndustries(await indRes.json())
            if (tplRes.ok) {
              const tplData = await tplRes.json()
              setTemplates(tplData.templates || [])
            }
          } catch { /* non-critical */ }
        }
        if (subRes.ok) setSubStatus(await subRes.json())
      } catch {
        // Non-critical — dashboard still usable
      } finally {
        setLoading(false)
      }
    })()
  }, [clientId, authFetch])

  // Load embed info
  useEffect(() => {
    if (tab !== "embed") return
    ;(async () => {
      try {
        const res = await authFetch(`${ENGINE_URL}/api/embed/snippet`)
        if (res.ok) setEmbedInfo(await res.json())
      } catch { /* not generated yet */ }
    })()
  }, [tab, authFetch])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateEmbed = async () => {
    if (!embedPhone) return
    setSaving(true)
    try {
      const res = await authFetch(`${ENGINE_URL}/api/embed/generate`, {
        method: "POST",
        body: JSON.stringify({ phone: embedPhone, domain: embedDomain || null }),
      })
      if (res.ok) {
        const snippetRes = await authFetch(`${ENGINE_URL}/api/embed/snippet`)
        if (snippetRes.ok) setEmbedInfo(await snippetRes.json())
        setSaveMsg("Embed code generated!")
      }
    } catch { setSaveMsg("Failed to generate") }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000) }
  }

  const handleSaveWidget = async () => {
    setSaving(true)
    try {
      const res = await authFetch(`${ENGINE_URL}/api/agent-config/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify({
          agent_greeting: widgetGreeting,
          widget_config: { color: widgetColor, position: widgetPosition },
        }),
      })
      if (res.ok) setSaveMsg("Widget settings saved!")
      else setSaveMsg("Failed to save")
    } catch { setSaveMsg("Network error") }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000) }
  }

  const handleSubscribe = async (selectedPlan: string) => {
    try {
      const res = await authFetch(`${ENGINE_URL}/api/subscribe/checkout`, {
        method: "POST",
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch {
      setSaveMsg("Stripe is not configured yet")
      setTimeout(() => setSaveMsg(""), 3000)
    }
  }

  const handleOnboardingComplete = async () => {
    setOnboardingSaving(true)
    try {
      const res = await authFetch(`${ENGINE_URL}/api/agent-config/${clientId}`, {
        method: "PUT",
        body: JSON.stringify({
          business_name: obBusinessName,
          business_type: obBusinessType || undefined,
          industry: obIndustry,
          agent_mode: "lead_qualifier",
          use_prompt_engine: true,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        // Reload config
        const configRes = await authFetch(`${ENGINE_URL}/api/agent-config/${clientId}`)
        if (configRes.ok) {
          const configData = await configRes.json()
          setConfig(configData)
          setWidgetGreeting(configData.agent_greeting || "")
        }
        setShowOnboarding(false)
        setSaveMsg("Your AI agent is ready! 🎉")
        setTimeout(() => setSaveMsg(""), 4000)
      } else {
        setSaveMsg("Failed to set up agent. Please try again.")
        setTimeout(() => setSaveMsg(""), 3000)
      }
    } catch {
      setSaveMsg("Network error. Please try again.")
      setTimeout(() => setSaveMsg(""), 3000)
    } finally {
      setOnboardingSaving(false)
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof Bot }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "widget", label: "Widget", icon: Palette },
    { key: "embed", label: "Embed Code", icon: Code2 },
    { key: "leads", label: "Leads", icon: Users },
    { key: "settings", label: "Settings", icon: Settings },
  ]

  const trialDaysLeft = subStatus?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subStatus.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 14

  // ─── Onboarding Wizard ───
  if (showOnboarding && !loading) {
    return (
      <div className="min-h-dvh bg-[#050a12] text-white">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-16">
          <div className="mb-8 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
              <Sparkles className="h-7 w-7" />
            </span>
            <h1 className="text-3xl font-bold">Welcome to Omniweb, {displayName}!</h1>
            <p className="mt-2 text-slate-400">Let&apos;s set up your AI agent in under a minute.</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8 flex w-full items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= onboardingStep ? "bg-cyan-500" : "bg-white/10"}`} />
            ))}
          </div>

          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            {onboardingStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                    What&apos;s your business called?
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">This helps us personalize your AI agent.</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Business name *</label>
                  <input
                    type="text"
                    value={obBusinessName}
                    onChange={(e) => setObBusinessName(e.target.value)}
                    placeholder="e.g. Acme Roofing"
                    className="w-full rounded-xl border border-white/10 bg-[#0f1a2e] px-4 py-3 text-sm placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Business type (optional)</label>
                  <input
                    type="text"
                    value={obBusinessType}
                    onChange={(e) => setObBusinessType(e.target.value)}
                    placeholder="e.g. Residential roofing contractor"
                    className="w-full rounded-xl border border-white/10 bg-[#0f1a2e] px-4 py-3 text-sm placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                  />
                </div>
                <Button
                  onClick={() => setOnboardingStep(1)}
                  disabled={!obBusinessName.trim()}
                  className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-cyan-400" />
                    What industry are you in?
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">We&apos;ll pre-configure your agent for your industry.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(industries.length > 0 ? industries : [
                    { slug: "general", name: "General Business" },
                    { slug: "roofing", name: "Roofing & Contracting" },
                    { slug: "legal", name: "Legal Services" },
                    { slug: "medical", name: "Medical / Healthcare" },
                    { slug: "ecommerce", name: "E-commerce" },
                    { slug: "real_estate", name: "Real Estate" },
                    { slug: "automotive", name: "Automotive" },
                    { slug: "restaurant", name: "Restaurant / Food" },
                  ]).map((ind) => (
                    <button
                      key={ind.slug}
                      onClick={() => setObIndustry(ind.slug)}
                      className={`rounded-xl border p-4 text-left text-sm font-medium transition-all ${
                        obIndustry === ind.slug
                          ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      {ind.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setOnboardingStep(0)}
                    className="flex-1 rounded-full text-slate-400"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setOnboardingStep(2)}
                    className="flex-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    Ready to launch!
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    We&apos;ll create your AI agent with industry-optimized settings.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Business</span>
                    <span className="font-medium">{obBusinessName}</span>
                  </div>
                  {obBusinessType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Type</span>
                      <span className="font-medium">{obBusinessType}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Industry</span>
                    <span className="font-medium capitalize">{obIndustry.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Agent Mode</span>
                    <span className="font-medium">Lead Qualifier</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Prompt Engine</span>
                    <span className="font-medium text-emerald-400">Enabled</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setOnboardingStep(1)}
                    className="flex-1 rounded-full text-slate-400"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleOnboardingComplete}
                    disabled={onboardingSaving}
                    className="flex-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  >
                    {onboardingSaving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating agent...</>
                    ) : (
                      <>Launch my AI agent <Sparkles className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowOnboarding(false)}
            className="mt-6 text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            Skip for now — I&apos;ll set up later
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#050a12] text-white">
      {/* Trial / Demo banner */}
      {(isTrial || subStatus?.status === "trial") && (
        <div className="bg-gradient-to-r from-amber-600/90 to-orange-600/90 px-4 py-2.5 text-center text-sm font-medium">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {trialLabel || `Free trial — ${trialDaysLeft} days remaining`}
          {!isTrial && (
            <Button
              size="sm"
              className="ml-4 rounded-full bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => setTab("settings")}
            >
              Subscribe now
            </Button>
          )}
        </div>
      )}

      {/* Trial expired banner */}
      {subStatus?.status === "trial_expired" && (
        <div className="bg-gradient-to-r from-red-600/90 to-pink-600/90 px-4 py-2.5 text-center text-sm font-medium">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          Your free trial has expired. Subscribe to keep your AI assistant running.
          <Button
            size="sm"
            className="ml-4 rounded-full bg-white text-slate-900 hover:bg-slate-100"
            onClick={() => setTab("settings")}
          >
            Subscribe now
          </Button>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-b border-white/10 lg:w-64 lg:min-h-dvh lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{config?.business_name || "My Business"}</p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:p-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="hidden px-4 pb-4 lg:block mt-auto">
            <form action="/auth/signout" method="post">
              <button className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {saveMsg && (
            <div className="mb-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 text-sm text-cyan-300">
              {saveMsg}
            </div>
          )}

          {/* ─── Overview ─── */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Here&apos;s your AI assistant performance at a glance.
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Bot, title: "AI Agent", value: config?.agent_name || "AI Assistant", note: config?.agent_mode || "lead_qualifier" },
                  { icon: Phone, title: "Calls handled", value: "—", note: "Connect to see data" },
                  { icon: Users, title: "Leads captured", value: "—", note: "Connect to see data" },
                  { icon: BarChart3, title: "Minutes used", value: String(subStatus?.minutes_used ?? 0), note: `${plan} plan` },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <item.icon className="h-5 w-5 text-cyan-300" />
                    <p className="mt-4 text-sm text-slate-400">{item.title}</p>
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => dispatchAssistantOpen("voice")}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:bg-white/[0.06]"
                >
                  <Mic className="h-8 w-8 shrink-0 text-cyan-400" />
                  <div className="min-w-0">
                    <p className="font-semibold">Test voice agent</p>
                    <p className="text-sm text-slate-400">Talk to your AI live</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-slate-500 group-hover:text-white transition-colors" />
                </button>
                <button
                  onClick={() => dispatchAssistantOpen("text")}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:bg-white/[0.06]"
                >
                  <MessageSquare className="h-8 w-8 shrink-0 text-purple-400" />
                  <div className="min-w-0">
                    <p className="font-semibold">Test text chat</p>
                    <p className="text-sm text-slate-400">Chat with your AI</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-slate-500 group-hover:text-white transition-colors" />
                </button>
                <button
                  onClick={() => setTab("embed")}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:bg-white/[0.06]"
                >
                  <Code2 className="h-8 w-8 shrink-0 text-emerald-400" />
                  <div className="min-w-0">
                    <p className="font-semibold">Get embed code</p>
                    <p className="text-sm text-slate-400">Add AI to your website</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Industry & mode info */}
              {config && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-lg font-semibold mb-4">Agent Configuration</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Industry</p>
                      <p className="mt-1 capitalize">{config.industry || "general"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Agent Mode</p>
                      <p className="mt-1 capitalize">{(config.agent_mode || "lead_qualifier").replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Business Name</p>
                      <p className="mt-1">{config.business_name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Business Type</p>
                      <p className="mt-1 capitalize">{config.business_type || "Not set"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Widget Customizer ─── */}
          {tab === "widget" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Widget Customizer</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Customize how your AI assistant looks and behaves on your website.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Settings */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4 text-cyan-400" /> Appearance</h3>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Accent color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={widgetColor} onChange={(e) => setWidgetColor(e.target.value)}
                          className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                        <input type="text" value={widgetColor} onChange={(e) => setWidgetColor(e.target.value)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm w-28" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Position</label>
                      <div className="flex gap-2">
                        {(["right", "left"] as const).map((pos) => (
                          <button key={pos} onClick={() => setWidgetPosition(pos)}
                            className={`rounded-lg px-4 py-2 text-sm capitalize ${widgetPosition === pos ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"}`}>
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-purple-400" /> Greeting</h3>
                    <textarea
                      value={widgetGreeting}
                      onChange={(e) => setWidgetGreeting(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-slate-500"
                      placeholder="Hello! How can I help you today?"
                    />
                  </div>

                  <Button onClick={handleSaveWidget} disabled={saving}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    {saving ? "Saving…" : "Save widget settings"}
                  </Button>

                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                    <p className="text-xs text-slate-500">
                      <Shield className="inline mr-1 h-3 w-3" />
                      Advanced customization (custom CSS, multi-language, voice selection) is available on Growth and Scale plans.
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="font-semibold mb-4">Preview</h3>
                  <div className="relative rounded-2xl border border-white/10 bg-slate-950 h-80 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                      Your website preview
                    </div>
                    <div className={`absolute bottom-4 ${widgetPosition === "right" ? "right-4" : "left-4"}`}>
                      <div className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
                        style={{ background: `conic-gradient(from 0deg, ${widgetColor}, #2792DC, #9ce6e6, #fff, ${widgetColor})` }}>
                        <Mic className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Embed Code ─── */}
          {tab === "embed" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Embed Code</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Add the AI assistant to your website with a single script tag. The code is tied to your account and cannot be transferred.
                </p>
              </div>

              {!embedInfo ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                  <h3 className="font-semibold">Generate your embed authorization code</h3>
                  <p className="text-sm text-slate-400">
                    Your embed code is tied to your email ({email}) and phone number. It cannot be duplicated or transferred and expires when your subscription ends.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Phone number *</label>
                      <input type="tel" value={embedPhone} onChange={(e) => setEmbedPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567" required
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Website domain (optional)</label>
                      <input type="text" value={embedDomain} onChange={(e) => setEmbedDomain(e.target.value)}
                        placeholder="yourbusiness.com"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-slate-500" />
                    </div>
                  </div>
                  <Button onClick={handleGenerateEmbed} disabled={saving || !embedPhone}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    {saving ? "Generating…" : "Generate embed code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold text-emerald-300">Embed code active</h3>
                    </div>
                    {embedInfo.domain && <p className="text-sm text-slate-400">Locked to domain: <strong className="text-white">{embedInfo.domain}</strong></p>}
                    {embedInfo.expires_at && <p className="text-sm text-slate-400">Expires: {new Date(embedInfo.expires_at).toLocaleDateString()}</p>}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-semibold">Installation snippet</h3>
                      <Button size="sm" variant="ghost" onClick={() => handleCopy(embedInfo.snippet)}
                        className="gap-2 text-cyan-400 hover:text-cyan-300">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <pre className="overflow-x-auto rounded-xl bg-slate-950 border border-white/10 p-4 text-xs text-slate-300 leading-relaxed">
                      {embedInfo.snippet}
                    </pre>
                    <p className="text-xs text-slate-500">
                      Paste this snippet just before the closing <code className="text-slate-400">&lt;/body&gt;</code> tag on your website.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-sm text-amber-300">
                      <Shield className="inline mr-1 h-4 w-4" />
                      <strong>Security notice:</strong> This code is uniquely tied to your email and phone number. Sharing or transferring it violates our terms of service. The code will stop working at the end of your subscription.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Leads ─── */}
          {tab === "leads" && (
            <LeadsTab onNavigateEmbed={() => setTab("embed")} clientId={clientId} authFetch={authFetch} />
          )}

          {/* ─── Settings ─── */}
          {tab === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="mt-1 text-sm text-slate-400">Manage your account and subscription.</p>
              </div>

              {/* Account */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
                <h3 className="font-semibold">Account</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
                    <p className="mt-1 text-sm">{email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Plan</p>
                    <p className="mt-1 text-sm capitalize">{subStatus?.plan || plan}</p>
                  </div>
                </div>
              </div>

              {/* Subscription */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  Subscription
                </h3>
                {subStatus?.status === "active" ? (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                    <span className="text-sm capitalize text-slate-300">{subStatus.plan} plan</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                      {subStatus?.status === "trial"
                        ? `Your trial expires in ${trialDaysLeft} days. Subscribe to keep your AI assistant running.`
                        : subStatus?.status === "trial_expired"
                        ? "Your trial has expired. Subscribe to reactivate your AI assistant."
                        : "Subscribe to unlock the full platform."}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { name: "Starter", price: "$497/mo", value: "starter", desc: "500 AI minutes" },
                        { name: "Growth", price: "$1,497/mo", value: "growth", popular: true, desc: "2,500 AI minutes" },
                        { name: "Scale", price: "Custom", value: "pro", desc: "Unlimited minutes" },
                      ].map((p) => (
                        <button key={p.value} onClick={() => p.value !== "pro" ? handleSubscribe(p.value) : window.open("mailto:sales@omniweb.ai")}
                          className={`rounded-2xl border p-4 text-left transition hover:bg-white/5 ${
                            p.popular ? "border-cyan-500/30 bg-cyan-500/5" : "border-white/10 bg-white/[0.03]"
                          }`}>
                          {p.popular && <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Most popular</span>}
                          <p className="text-lg font-bold mt-1">{p.name}</p>
                          <p className="text-sm text-slate-400">{p.price}</p>
                          <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-6 space-y-3">
                <h3 className="font-semibold text-red-400">Danger zone</h3>
                <p className="text-sm text-slate-400">
                  Contact support to delete your account and all associated data.
                </p>
                <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" asChild>
                  <a href="mailto:support@omniweb.ai">Contact support</a>
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ─── Leads sub-component ─── */

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  score: number
  status: string
  created_at: string
}

function LeadsTab({ onNavigateEmbed, clientId, authFetch }: {
  onNavigateEmbed: () => void
  clientId: string
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>
}) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await authFetch(`${ENGINE_URL}/api/leads?limit=50`)
        if (res.ok) {
          const data = await res.json()
          setLeads(Array.isArray(data) ? data : data.leads || [])
        }
      } catch { /* empty */ }
      finally { setLoading(false) }
    })()
  }, [clientId, authFetch])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="mt-1 text-sm text-slate-400">Leads captured and qualified by your AI assistant.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-lg font-semibold text-slate-400">No leads yet</p>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Once your AI assistant is embedded on your website and starts talking to visitors, qualified leads will appear here automatically.
          </p>
          <Button onClick={onNavigateEmbed} className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            Set up embed code
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="mt-1 text-sm text-slate-400">{leads.length} leads captured</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-medium">{lead.name || "—"}</td>
                <td className="px-4 py-3 text-slate-400">{lead.email || "—"}</td>
                <td className="px-4 py-3 text-slate-400">{lead.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    lead.score >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                    lead.score >= 50 ? "bg-amber-500/10 text-amber-400" :
                    "bg-slate-500/10 text-slate-400"
                  }`}>
                    {lead.score}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-slate-400">{(lead.status || "new").replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(lead.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
