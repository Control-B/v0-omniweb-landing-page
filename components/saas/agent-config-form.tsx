"use client"

import { useEffect, useMemo, useState } from "react"
import { Bot, Layers3, PlayCircle, Save, ShieldAlert, Sparkles } from "lucide-react"

import {
  applyAgentTemplate,
  buildAgentPrompt,
  fetchAgentConfig,
  fetchAgentTemplates,
  saveAgentConfig,
  testAgent,
} from "@/lib/saas/agentConfigService"
import { channelLabelMap, fieldLabelMap, getModeTone } from "@/lib/saas/agentModes"
import { getTemplateSummary } from "@/lib/saas/agentTemplates"
import { splitPromptSections } from "@/lib/saas/promptBuilder"
import type { AgentConfigRecord, AgentConfigUpdatePayload, AgentTemplateRecord, AgentTestResponse } from "@/lib/saas/types"

const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
const textareaClassName = "mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
const sectionClassName = "rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 shadow-[0_10px_25px_rgba(148,163,184,0.08)]"

const checkboxCardClass = "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition"

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean)
}

function joinLines(values: string[] | undefined) {
  return (values || []).join("\n")
}

function buildPayload(config: AgentConfigRecord): AgentConfigUpdatePayload {
  return {
    agentName: config.agentName,
    welcomeMessage: config.welcomeMessage,
    tone: config.tone,
    businessName: config.businessName,
    businessType: config.businessType ?? undefined,
    industry: config.industry ?? undefined,
    websiteDomain: config.websiteDomain ?? undefined,
    bookingUrl: config.bookingUrl ?? undefined,
    agentMode: config.agentMode,
    goals: config.goals,
    enabledChannels: config.enabledChannels,
    leadCaptureFields: config.leadCaptureFields,
    enabledFeatures: config.enabledFeatures,
    qualificationRules: config.qualificationRules,
    channel: config.enabledChannels?.[0] ?? "website_chat",
    customInstructions: config.customInstructions ?? undefined,
    active: config.active,
  }
}

export function AgentConfigForm() {
  const [config, setConfig] = useState<AgentConfigRecord | null>(null)
  const [templates, setTemplates] = useState<AgentTemplateRecord[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [testChannel, setTestChannel] = useState("website_chat")
  const [testMessage, setTestMessage] = useState("Can you help me understand the next best step and what information you need from me?")
  const [testResult, setTestResult] = useState<AgentTestResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshingPrompt, setRefreshingPrompt] = useState(false)
  const [runningTest, setRunningTest] = useState(false)
  const [applyingTemplate, setApplyingTemplate] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError("")
        const [nextConfig, templatePayload] = await Promise.all([
          fetchAgentConfig(),
          fetchAgentTemplates(),
        ])
        if (cancelled) return
        setConfig(nextConfig)
        setTemplates(templatePayload.templates)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load your AI agent settings.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const modeDefinitions = config?.availableModes ?? []
  const selectedMode = useMemo(() => modeDefinitions.find((mode) => mode.key === config?.agentMode) ?? null, [config?.agentMode, modeDefinitions])
  const promptSections = splitPromptSections(config?.promptPreview ?? "")
  const channelProfiles = config?.channelBehaviorProfiles ?? []

  const updateConfig = (updater: (current: AgentConfigRecord) => AgentConfigRecord) => {
    setConfig((current) => current ? updater(current) : current)
    setMessage("")
    setError("")
  }

  const refreshTemplates = async (agentMode?: string) => {
    const templatePayload = await fetchAgentTemplates(agentMode)
    setTemplates(templatePayload.templates)
  }

  const selectMode = async (modeKey: string) => {
    if (!config) return
    const definition = modeDefinitions.find((mode) => mode.key === modeKey)
    if (!definition) return
    updateConfig((current) => ({
      ...current,
      agentMode: definition.key,
      goals: definition.defaultGoals,
      enabledChannels: definition.defaultChannels,
      leadCaptureFields: definition.defaultLeadCaptureFields,
      enabledFeatures: definition.defaultEnabledFeatures,
      qualificationRules: {
        requiredFields: definition.defaultLeadCaptureFields.filter((field) => ["name", "email", "phone"].includes(field)).slice(0, 2),
        handoffTriggers: current.qualificationRules?.handoffTriggers ?? [],
        disqualifiers: current.qualificationRules?.disqualifiers ?? [],
        conversionSignals: current.qualificationRules?.conversionSignals ?? ["pricing", "demo", "quote", "book", "buy"],
      },
    }))
    await refreshTemplates(modeKey)
  }

  const toggleItem = (values: string[] | undefined, value: string) => {
    const current = values ?? []
    return current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  }

  const refreshPrompt = async () => {
    if (!config) return
    try {
      setRefreshingPrompt(true)
      const prompt = await buildAgentPrompt(buildPayload(config))
      updateConfig((current) => ({ ...current, promptPreview: prompt.promptPreview }))
    } catch (promptError) {
      setError(promptError instanceof Error ? promptError.message : "Unable to build prompt preview.")
    } finally {
      setRefreshingPrompt(false)
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId) return
    try {
      setApplyingTemplate(true)
      const payload = await applyAgentTemplate(selectedTemplateId)
      setConfig(payload.config)
      setMessage(`Applied template: ${payload.template.name}`)
      setSelectedTemplateId("")
      await refreshTemplates(payload.config.agentMode)
    } catch (templateError) {
      setError(templateError instanceof Error ? templateError.message : "Unable to apply template.")
    } finally {
      setApplyingTemplate(false)
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!config) return
    try {
      setSaving(true)
      const nextConfig = await saveAgentConfig(buildPayload(config))
      setConfig(nextConfig)
      setMessage("Universal AI agent saved and synced.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save your AI agent right now.")
    } finally {
      setSaving(false)
    }
  }

  const handleRunTest = async () => {
    if (!config) return
    try {
      setRunningTest(true)
      const result = await testAgent({ ...buildPayload(config), channel: testChannel, message: testMessage })
      setTestResult(result)
      updateConfig((current) => ({ ...current, promptPreview: result.promptPreview }))
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Unable to run test conversation.")
    } finally {
      setRunningTest(false)
    }
  }

  if (loading) {
    return <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">Loading your AI agent workspace…</div>
  }

  if (!config) {
    return <div className="rounded-[1.75rem] border border-red-200 bg-red-50 px-5 py-8 text-sm text-red-700">{error || "Unable to load your AI agent configuration."}</div>
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Bot className="h-4 w-4 text-blue-600" />Current mode</div>
          <p className="mt-3 text-lg font-semibold text-slate-950">{selectedMode?.label ?? config.agentMode}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{selectedMode?.conversionObjective ?? "Tune the conversion objective for this workspace."}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Layers3 className="h-4 w-4 text-violet-600" />Channels</div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{config.enabledChannels?.length ?? 0}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{(config.enabledChannels || []).map((channel) => channelLabelMap[channel] ?? channel).join(" · ") || "No channels selected"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Sparkles className="h-4 w-4 text-emerald-600" />Lead fields</div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{config.leadCaptureFields?.length ?? 0}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Capture only the fields needed for the next best conversion step.</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><ShieldAlert className="h-4 w-4 text-amber-600" />Status</div>
          <p className="mt-3 text-lg font-semibold text-slate-950">{config.active ? "Live and active" : "Paused"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Prompt preview length: {(config.promptPreview || "").length.toLocaleString()} characters</p>
        </div>
      </div>

      <div className={sectionClassName}>
        <p className="text-lg font-semibold text-slate-900">Agent mode</p>
        <p className="mt-1 text-sm text-slate-500">Choose the universal brain that best matches this tenant’s revenue motion.</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {modeDefinitions.map((mode) => {
            const active = config.agentMode === mode.key
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => void selectMode(mode.key)}
                className={`rounded-[1.5rem] border px-5 py-4 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white shadow-[0_18px_35px_rgba(15,23,42,0.18)]" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-base font-semibold ${active ? "text-white" : "text-slate-950"}`}>{mode.label}</p>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${active ? "border-white/20 bg-white/10 text-white" : getModeTone(mode.key)}`}>{mode.key.replaceAll("_", " ")}</span>
                </div>
                <p className={`mt-2 text-sm leading-6 ${active ? "text-slate-100" : "text-slate-600"}`}>{mode.description}</p>
                <p className={`mt-3 text-xs font-medium uppercase tracking-[0.18em] ${active ? "text-slate-300" : "text-slate-500"}`}>{mode.conversionObjective}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className={sectionClassName}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Templates</p>
            <p className="mt-1 text-sm text-slate-500">Apply a proven starter pack, then fine-tune the details below.</p>
          </div>
          <div className="flex w-full gap-3 lg:max-w-xl">
            <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)} className={`${inputClassName} mt-0`}>
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{getTemplateSummary(template)}</option>
              ))}
            </select>
            <button type="button" onClick={() => void handleApplyTemplate()} disabled={!selectedTemplateId || applyingTemplate} className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {applyingTemplate ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {templates.slice(0, 4).map((template) => (
            <div key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">{template.name}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <div className={sectionClassName}>
            <p className="text-lg font-semibold text-slate-900">Agent identity</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Agent name</label>
                <input value={config.agentName} onChange={(event) => updateConfig((current) => ({ ...current, agentName: event.target.value }))} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tone</label>
                <input value={config.tone} onChange={(event) => updateConfig((current) => ({ ...current, tone: event.target.value as AgentConfigRecord["tone"] }))} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Business name</label>
                <input value={config.businessName ?? ""} onChange={(event) => updateConfig((current) => ({ ...current, businessName: event.target.value }))} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Industry</label>
                <input value={config.industry ?? ""} onChange={(event) => updateConfig((current) => ({ ...current, industry: event.target.value }))} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Website domain</label>
                <input value={config.websiteDomain ?? ""} onChange={(event) => updateConfig((current) => ({ ...current, websiteDomain: event.target.value }))} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Booking URL</label>
                <input value={config.bookingUrl ?? ""} onChange={(event) => updateConfig((current) => ({ ...current, bookingUrl: event.target.value }))} className={inputClassName} placeholder="https://..." />
              </div>
            </div>
            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Welcome message</label>
              <textarea value={config.welcomeMessage} onChange={(event) => updateConfig((current) => ({ ...current, welcomeMessage: event.target.value }))} className={textareaClassName} />
            </div>
            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Custom instructions</label>
              <textarea value={config.customInstructions ?? ""} onChange={(event) => updateConfig((current) => ({ ...current, customInstructions: event.target.value }))} className={textareaClassName} placeholder="Add vertical-specific selling rules, compliance notes, or escalation guidance." />
            </div>
          </div>

          <div className={sectionClassName}>
            <p className="text-lg font-semibold text-slate-900">Unified channel behavior</p>
            <p className="mt-1 text-sm text-slate-500">This is one universal Omniweb brain. Text chat gets richer written guidance, while the website voice widget and AI telephony share the same voice-optimized delivery profile.</p>
            <div className="mt-5 space-y-3">
              {channelProfiles.map((profile) => (
                <div key={profile.key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{profile.label}</p>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{profile.channels.join(" · ")}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{profile.description}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {profile.behaviorRules.map((rule) => <li key={rule}>{rule}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className={sectionClassName}>
            <p className="text-lg font-semibold text-slate-900">Goals and qualification</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Goals (one per line)</label>
                <textarea value={joinLines(config.goals)} onChange={(event) => updateConfig((current) => ({ ...current, goals: splitLines(event.target.value) }))} className={textareaClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Conversion signals (one per line)</label>
                <textarea value={joinLines(config.qualificationRules?.conversionSignals)} onChange={(event) => updateConfig((current) => ({ ...current, qualificationRules: { ...current.qualificationRules, conversionSignals: splitLines(event.target.value) } }))} className={textareaClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Handoff triggers (one per line)</label>
                <textarea value={joinLines(config.qualificationRules?.handoffTriggers)} onChange={(event) => updateConfig((current) => ({ ...current, qualificationRules: { ...current.qualificationRules, handoffTriggers: splitLines(event.target.value) } }))} className={textareaClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Disqualifiers (one per line)</label>
                <textarea value={joinLines(config.qualificationRules?.disqualifiers)} onChange={(event) => updateConfig((current) => ({ ...current, qualificationRules: { ...current.qualificationRules, disqualifiers: splitLines(event.target.value) } }))} className={textareaClassName} />
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm font-medium text-slate-700">Required lead fields</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(config.leadCaptureFields || []).map((field) => {
                  const checked = config.qualificationRules?.requiredFields?.includes(field) ?? false
                  return (
                    <label key={field} className={`${checkboxCardClass} ${checked ? "border-blue-200 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => updateConfig((current) => ({
                          ...current,
                          qualificationRules: {
                            ...current.qualificationRules,
                            requiredFields: toggleItem(current.qualificationRules?.requiredFields, field),
                          },
                        }))}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{fieldLabelMap[field] ?? field}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <div className={sectionClassName}>
            <p className="text-lg font-semibold text-slate-900">Channels and capture fields</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Enabled channels</p>
                <div className="mt-3 grid gap-3">
                  {Object.entries(channelLabelMap).map(([value, label]) => {
                    const checked = config.enabledChannels?.includes(value) ?? false
                    return (
                      <label key={value} className={`${checkboxCardClass} ${checked ? "border-violet-200 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                        <input type="checkbox" checked={checked} onChange={() => updateConfig((current) => ({ ...current, enabledChannels: toggleItem(current.enabledChannels, value) }))} className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                        <span>{label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Lead capture fields</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {Object.entries(fieldLabelMap).map(([value, label]) => {
                    const checked = config.leadCaptureFields?.includes(value) ?? false
                    return (
                      <label key={value} className={`${checkboxCardClass} ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                        <input type="checkbox" checked={checked} onChange={() => updateConfig((current) => ({ ...current, leadCaptureFields: toggleItem(current.leadCaptureFields, value) }))} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span>{label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-amber-200 bg-white shadow-[0_10px_25px_rgba(148,163,184,0.08)]">
            <div className="border-b border-amber-200 bg-amber-400/95 px-4 py-3 text-sm font-semibold text-amber-950">
              <ShieldAlert className="mr-2 inline h-4 w-4" />Financial transaction and compliance guardrail
            </div>
            <div className="p-4 text-sm text-slate-700">
              <p className="mb-3">This workspace stays conversion-focused, but the agent must never cross into payment handling, unsafe advice, or unauthorized commitments.</p>
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                <li>Drive visitors toward the next best action, not direct financial processing</li>
                <li>Escalate pricing exceptions, refunds, legal, medical, and safety-sensitive issues</li>
                <li>Capture only the lead fields needed for qualification and follow-up</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={sectionClassName}>
            <p className="text-lg font-semibold text-slate-900">Feature toggles</p>
            <div className="mt-5 grid gap-3">
              {Object.entries(config.enabledFeatures || {}).map(([feature, enabled]) => (
                <label key={feature} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <div>
                    <p className="font-medium text-slate-900">{feature.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}</p>
                    <p className="text-xs text-slate-500">Controls mode-aware capability access inside the prompt and analytics tags.</p>
                  </div>
                  <input type="checkbox" checked={enabled} onChange={(event) => updateConfig((current) => ({ ...current, enabledFeatures: { ...current.enabledFeatures, [feature]: event.target.checked } }))} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
                </label>
              ))}
            </div>
          </div>

          <div className={sectionClassName}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">Prompt preview</p>
                <p className="mt-1 text-sm text-slate-500">Review the exact behavior bundle the agent will use.</p>
              </div>
              <button type="button" onClick={() => void refreshPrompt()} disabled={refreshingPrompt} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                {refreshingPrompt ? "Refreshing..." : "Refresh preview"}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {promptSections.map((section, index) => (
                <div key={`${index}-${section.slice(0, 24)}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{section}</pre>
                </div>
              ))}
            </div>
          </div>

          <div className={sectionClassName}>
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><PlayCircle className="h-5 w-5 text-slate-900" />Test console</div>
            <p className="mt-1 text-sm text-slate-500">Run the same universal brain against a text or voice channel and inspect the behavior profile plus analytics tags.</p>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">Test channel</label>
              <select value={testChannel} onChange={(event) => setTestChannel(event.target.value)} className={inputClassName}>
                <option value="website_chat">Text chat widget</option>
                <option value="ai_voice_call">Website voice widget</option>
                <option value="ai_telephony">Phone / AI telephony</option>
                <option value="shopify_storefront">Storefront text chat</option>
              </select>
            </div>
            <textarea value={testMessage} onChange={(event) => setTestMessage(event.target.value)} className={`${textareaClassName} mt-4`} />
            <button type="button" onClick={() => void handleRunTest()} disabled={runningTest} className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {runningTest ? "Testing..." : "Run test"}
            </button>

            {testResult ? (
              <div className="mt-5 space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getModeTone(testResult.agentMode)}`}>{testResult.agentMode.replaceAll("_", " ")}</span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{testResult.effectiveChannelProfile.label}</span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{testResult.conversionStage.replaceAll("_", " ")}</span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">Next field: {fieldLabelMap[testResult.suggestedNextField || ""] ?? testResult.suggestedNextField ?? "—"}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Suggested response</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{testResult.response}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Channel behavior rules</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {testResult.effectiveChannelProfile.behaviorRules.map((rule) => <li key={rule}>{rule}</li>)}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={config.active} onChange={(event) => updateConfig((current) => ({ ...current, active: event.target.checked }))} />
        Keep this universal AI agent active for your workspace
      </label>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <button type="submit" disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
        <Save className="h-4 w-4" />{saving ? "Saving..." : "Save universal agent"}
      </button>
    </form>
  )
}
