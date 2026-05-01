"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Bot,
  Copy,
  Filter,
  Globe,
  Loader2,
  MessageSquareText,
  Phone,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type {
  AnalyticsSummaryMetrics,
  EngagementChannel,
  EngagementIntent,
  EngagementLeadStatus,
  EngagementRecord,
  FollowUpChannel,
  FollowUpTaskRecord,
} from "@/lib/saas/types"

const channelLabels: Record<EngagementChannel, string> = {
  website_chat: "Website chat",
  ai_voice_call: "AI voice call",
  ai_telephony: "AI telephony",
  shopify_storefront: "Shopify storefront",
}

const intentLabels: Record<EngagementIntent, string> = {
  product_question: "Product question",
  pricing_question: "Pricing question",
  service_inquiry: "Service inquiry",
  support_request: "Support request",
  booking_request_quote: "Booking/request quote",
  complaint: "Complaint",
  other: "Other",
}

const leadStatusLabels: Record<EngagementLeadStatus, string> = {
  new: "New",
  qualified: "Qualified",
  needs_follow_up: "Needs follow-up",
  not_qualified: "Not qualified",
  resolved: "Resolved",
}

const followUpChannelLabels: Record<FollowUpChannel, string> = {
  email: "Email",
  sms: "SMS",
  voice_call: "Voice call",
  website_chat: "Website chat",
}

type EngagementDetailResponse = {
  engagement: EngagementRecord
  followUpTasks: FollowUpTaskRecord[]
}

type EngagementListResponse = {
  engagements: EngagementRecord[]
}

type FiltersState = {
  dateFrom: string
  dateTo: string
  channel: string
  leadStatus: string
  intent: string
  followUpNeeded: string
  contactCaptured: string
  search: string
}

const DEFAULT_FILTERS: FiltersState = {
  dateFrom: "",
  dateTo: "",
  channel: "all",
  leadStatus: "all",
  intent: "all",
  followUpNeeded: "all",
  contactCaptured: "all",
  search: "",
}

type DetailTab = "summary" | "transcript"

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function shortSession(value: string) {
  return value.length > 18 ? `${value.slice(0, 18)}…` : value
}

function getChannelIcon(channel: EngagementChannel) {
  if (channel === "website_chat") return MessageSquareText
  if (channel === "ai_voice_call") return Phone
  if (channel === "ai_telephony") return Bot
  return Globe
}

function getLeadStatusClasses(status: EngagementLeadStatus) {
  if (status === "qualified") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_follow_up") return "border-amber-200 bg-amber-50 text-amber-800"
  if (status === "resolved") return "border-sky-200 bg-sky-50 text-sky-700"
  if (status === "not_qualified") return "border-slate-200 bg-slate-100 text-slate-600"
  return "border-violet-200 bg-violet-50 text-violet-700"
}

function buildQueryString(filters: FiltersState) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === "all") {
      return
    }

    params.set(key, value)
  })

  const query = params.toString()
  return query ? `?${query}` : ""
}

async function fetchJson<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed")
  }

  return payload as T
}

function MetricCard({ title, value, description, trend }: { title: string; value: string; description: string; trend: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
      <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.9),rgba(99,102,241,0.85),rgba(16,185,129,0.8))]" />
      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{trend}</p>
    </div>
  )
}

export function AnalyticsCommandCenter() {
  const [filters, setFilters] = useState<FiltersState>({ ...DEFAULT_FILTERS })
  const [summary, setSummary] = useState<AnalyticsSummaryMetrics | null>(null)
  const [engagements, setEngagements] = useState<EngagementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [detailData, setDetailData] = useState<EngagementDetailResponse | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>("summary")
  const [ownerNotesDraft, setOwnerNotesDraft] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false)
  const [refreshingSummary, setRefreshingSummary] = useState(false)
  const [followUpForm, setFollowUpForm] = useState({
    engagementId: "",
    instruction: "",
    channel: "email" as FollowUpChannel,
    timing: "now" as "now" | "later",
    scheduledFor: "",
    internalNote: "",
  })

  const queryString = useMemo(() => buildQueryString(filters), [filters])

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const [summaryPayload, engagementPayload] = await Promise.all([
        fetchJson<AnalyticsSummaryMetrics>(`/api/analytics/summary${queryString}`),
        fetchJson<EngagementListResponse>(`/api/analytics/engagements${queryString}`),
      ])

      setSummary(summaryPayload)
      setEngagements(engagementPayload.engagements)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load analytics right now.")
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  useEffect(() => {
    setOwnerNotesDraft(detailData?.engagement.ownerNotes ?? "")
  }, [detailData?.engagement.id, detailData?.engagement.ownerNotes])

  const openDetail = async (engagementId: string, nextTab: DetailTab) => {
    setDetailOpen(true)
    setDetailTab(nextTab)
    setDetailLoading(true)
    setDetailError("")
    setActionMessage("")

    try {
      const payload = await fetchJson<EngagementDetailResponse>(`/api/analytics/engagements/${engagementId}`)
      setDetailData(payload)
    } catch (loadError) {
      setDetailError(loadError instanceof Error ? loadError.message : "Unable to load engagement details.")
    } finally {
      setDetailLoading(false)
    }
  }

  const syncEngagementIntoList = (engagement: EngagementRecord) => {
    setEngagements((current) => current.map((item) => item.id === engagement.id ? engagement : item))
    setDetailData((current) => current ? { ...current, engagement } : current)
  }

  const patchEngagement = async (engagementId: string, payload: Record<string, unknown>, successMessage: string) => {
    const response = await fetchJson<{ engagement: EngagementRecord }>(`/api/analytics/engagements/${engagementId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })

    syncEngagementIntoList(response.engagement)
    setActionMessage(successMessage)
    await loadAnalytics()
  }

  const saveOwnerNotes = async () => {
    if (!detailData) return

    setSavingNotes(true)
    try {
      await patchEngagement(detailData.engagement.id, { ownerNotes: ownerNotesDraft }, "Owner notes saved.")
    } catch (saveError) {
      setDetailError(saveError instanceof Error ? saveError.message : "Unable to save owner notes.")
    } finally {
      setSavingNotes(false)
    }
  }

  const handleSummarize = async () => {
    if (!detailData) return

    setRefreshingSummary(true)
    setDetailError("")

    try {
      const payload = await fetchJson<{ engagement: EngagementRecord }>(`/api/analytics/engagements/${detailData.engagement.id}/summarize`, {
        method: "POST",
        body: JSON.stringify({}),
      })
      syncEngagementIntoList(payload.engagement)
      setActionMessage(payload.engagement.summarySource === "deepgram" ? "Deepgram summary refreshed." : "Mock summary generated because Deepgram is unavailable.")
      await loadAnalytics()
    } catch (summarizeError) {
      setDetailError(summarizeError instanceof Error ? summarizeError.message : "Unable to summarize engagement.")
    } finally {
      setRefreshingSummary(false)
    }
  }

  const handleCopySummary = async () => {
    if (!detailData?.engagement.summaryFull) return

    try {
      await navigator.clipboard.writeText(detailData.engagement.summaryFull)
      setActionMessage("Summary copied.")
    } catch {
      setDetailError("Unable to copy summary.")
    }
  }

  const openFollowUpModal = (engagement: EngagementRecord) => {
    setFollowUpForm({
      engagementId: engagement.id,
      instruction: engagement.recommendedNextAction ?? `Follow up on ${leadStatusLabels[engagement.leadStatus].toLowerCase()} ${intentLabels[engagement.intent].toLowerCase()} engagement.`,
      channel: engagement.visitorPhone ? "voice_call" : engagement.visitorEmail ? "email" : "website_chat",
      timing: "now",
      scheduledFor: "",
      internalNote: "",
    })
    setFollowUpOpen(true)
  }

  const submitFollowUpTask = async () => {
    setFollowUpSubmitting(true)
    setDetailError("")

    try {
      await fetchJson<{ task: FollowUpTaskRecord }>("/api/follow-ups", {
        method: "POST",
        body: JSON.stringify({
          engagementId: followUpForm.engagementId,
          instruction: followUpForm.instruction,
          channel: followUpForm.channel,
          timing: followUpForm.timing,
          scheduledFor: followUpForm.timing === "later" && followUpForm.scheduledFor
            ? new Date(followUpForm.scheduledFor).toISOString()
            : null,
          internalNote: followUpForm.internalNote || null,
        }),
      })

      if (detailData?.engagement.id === followUpForm.engagementId) {
        await openDetail(followUpForm.engagementId, detailTab)
      }

      await loadAnalytics()
      setActionMessage("AI follow-up task saved as pending.")
      setFollowUpOpen(false)
    } catch (submitError) {
      setDetailError(submitError instanceof Error ? submitError.message : "Unable to create follow-up task.")
    } finally {
      setFollowUpSubmitting(false)
    }
  }

  const metrics = summary ?? {
    totalConversations: 0,
    qualifiedLeads: 0,
    followUpNeeded: 0,
    contactInfoCaptured: 0,
    avgMessagesPerSession: 0,
    conversionRate: 0,
  }

  return (
    <>
      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(90deg,rgba(99,102,241,0.10),rgba(34,211,238,0.08),rgba(16,185,129,0.08))] p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {loading ? "Refreshing" : "Live data"}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">AI Engagement Intelligence</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Review conversations, captured leads, summaries, intent, and follow-up opportunities.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_12px_28px_rgba(148,163,184,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Owner action queue</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.followUpNeeded}</p>
              <p className="mt-1 text-sm text-slate-600">conversations currently flagged for follow-up</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard title="Total conversations" value={String(metrics.totalConversations)} description="All website, voice, telephony, and storefront engagements in the selected window." trend="Live trend placeholder" />
          <MetricCard title="Qualified leads" value={String(metrics.qualifiedLeads)} description="Sessions marked qualified based on intent, captured contact info, and buying signals." trend="Lead scoring active" />
          <MetricCard title="Follow-up needed" value={String(metrics.followUpNeeded)} description="Conversations the owner or AI should revisit with an outbound action." trend="Priority queue" />
          <MetricCard title="Contact info captured" value={String(metrics.contactInfoCaptured)} description="Engagements where the AI captured a name, email, or phone number." trend="Capture readiness" />
          <MetricCard title="Avg. messages/session" value={metrics.avgMessagesPerSession.toFixed(1)} description="Average interaction depth per engagement across the active filters." trend="Session depth placeholder" />
          <MetricCard title="Conversion rate placeholder" value={`${metrics.conversionRate.toFixed(1)}%`} description="Qualified leads divided by total conversations — ready for fuller funnel attribution later." trend="Funnel placeholder" />
        </section>

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><Filter className="h-4 w-4 text-cyan-500" />Filters</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Date from</span>
              <input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Date to</span>
              <input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Channel</span>
              <select value={filters.channel} onChange={(event) => setFilters((current) => ({ ...current, channel: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                <option value="all">All channels</option>
                {Object.entries(channelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Lead status</span>
              <select value={filters.leadStatus} onChange={(event) => setFilters((current) => ({ ...current, leadStatus: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                <option value="all">All statuses</option>
                {Object.entries(leadStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Intent</span>
              <select value={filters.intent} onChange={(event) => setFilters((current) => ({ ...current, intent: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                <option value="all">All intents</option>
                {Object.entries(intentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Follow-up needed</span>
              <select value={filters.followUpNeeded} onChange={(event) => setFilters((current) => ({ ...current, followUpNeeded: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Contact captured</span>
              <select value={filters.contactCaptured} onChange={(event) => setFilters((current) => ({ ...current, contactCaptured: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="md:col-span-2 xl:col-span-2 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Search by name, email, phone, or session</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Sarah, sarah@example.com, +1..., sess_..." className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={() => setFilters({ ...DEFAULT_FILTERS })} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Clear filters
            </button>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><BarChart3 className="h-4 w-4 text-violet-500" />Engagement summary feed</div>
              <p className="mt-2 text-sm text-slate-600">Review who interacted with the AI, what they asked, and whether follow-up is needed.</p>
            </div>
            <div className="text-sm text-slate-500">{engagements.length} result{engagements.length === 1 ? "" : "s"}</div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          {engagements.length === 0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No AI engagements yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Once visitors interact with your AI assistant, summaries and lead insights will appear here.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {engagements.map((engagement) => {
                const ChannelIcon = getChannelIcon(engagement.channel)
                return (
                  <article key={engagement.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                            <ChannelIcon className="h-3.5 w-3.5" />{channelLabels[engagement.channel]}
                          </span>
                          <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", getLeadStatusClasses(engagement.leadStatus))}>{leadStatusLabels[engagement.leadStatus]}</span>
                          <span className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{intentLabels[engagement.intent]}</span>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{engagement.language.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-slate-950">{engagement.visitorName || shortSession(engagement.sessionId)}</p>
                          <p className="mt-1 text-sm text-slate-500">Session {engagement.sessionId} · {formatDate(engagement.createdAt)}</p>
                        </div>
                        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-900">Source:</span> {engagement.sourceUrl || "—"}</div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-900">Name:</span> {engagement.visitorName || "—"}</div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-900">Email:</span> {engagement.visitorEmail || "—"}</div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-900">Phone:</span> {engagement.visitorPhone || "—"}</div>
                        </div>
                        <p className="text-sm leading-6 text-slate-700">{engagement.summaryShort || "No summary yet. Open the drawer to generate or review transcript details."}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:max-w-[320px] xl:justify-end">
                        <button type="button" onClick={() => void openDetail(engagement.id, "summary")} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">View summary</button>
                        <button type="button" onClick={() => void openDetail(engagement.id, "transcript")} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">View transcript</button>
                        <button type="button" onClick={() => void patchEngagement(engagement.id, { followUpNeeded: true, leadStatus: "needs_follow_up" }, "Engagement marked for follow-up.")} className="inline-flex h-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100">Mark follow-up</button>
                        <button type="button" onClick={() => openFollowUpModal(engagement)} className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">Ask agent to follow up</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Drawer open={detailOpen} onOpenChange={setDetailOpen} direction="right" shouldScaleBackground={false}>
        <DrawerContent className="border-l border-slate-200 bg-white data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-[760px]">
          <DrawerHeader className="border-b border-slate-200 px-6 py-5 text-left">
            <DrawerTitle className="text-2xl font-semibold tracking-tight text-slate-950">Engagement detail</DrawerTitle>
            <DrawerDescription className="text-sm leading-6 text-slate-600">Review the AI summary, transcript, qualification, and owner follow-up actions.</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : detailError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{detailError}</div>
            ) : detailData ? (
              <div className="space-y-5">
                <section className="rounded-[1.5rem] border border-white/70 bg-[linear-gradient(90deg,rgba(99,102,241,0.08),rgba(34,211,238,0.08),rgba(16,185,129,0.06))] p-5 shadow-[0_12px_28px_rgba(148,163,184,0.12)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", getLeadStatusClasses(detailData.engagement.leadStatus))}>{leadStatusLabels[detailData.engagement.leadStatus]}</span>
                        <span className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{intentLabels[detailData.engagement.intent]}</span>
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{channelLabels[detailData.engagement.channel]}</span>
                      </div>
                      <p className="mt-3 text-xl font-semibold text-slate-950">{detailData.engagement.visitorName || detailData.engagement.sessionId}</p>
                      <p className="mt-1 text-sm text-slate-600">{formatDate(detailData.engagement.createdAt)} · {detailData.engagement.sourceUrl || "No source URL"}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lead score</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{detailData.engagement.leadScore ?? "—"}</p>
                    </div>
                  </div>
                </section>

                {actionMessage ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionMessage}</div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setDetailTab("summary")} className={cn("inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition", detailTab === "summary" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>Summary</button>
                  <button type="button" onClick={() => setDetailTab("transcript")} className={cn("inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition", detailTab === "transcript" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>Transcript</button>
                </div>

                {detailTab === "summary" ? (
                  <div className="space-y-5">
                    <section className="rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">AI-generated summary</p>
                          <p className="mt-2 text-base leading-7 text-slate-800">{detailData.engagement.summaryFull || detailData.engagement.summaryShort || "No summary available yet."}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => void handleSummarize()} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50" disabled={refreshingSummary}>
                            {refreshingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="mr-2 h-4 w-4" />Generate latest summary</>}
                          </button>
                          <button type="button" onClick={() => void handleCopySummary()} className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                            <Copy className="mr-2 h-4 w-4" />Copy summary
                          </button>
                        </div>
                      </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Key questions asked</p>
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                          {detailData.engagement.keyQuestions.length > 0 ? detailData.engagement.keyQuestions.map((question) => <li key={question} className="rounded-2xl bg-slate-50 px-4 py-3">{question}</li>) : <li className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">No key questions extracted yet.</li>}
                        </ul>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Products/services discussed</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {detailData.engagement.productsOrServices.length > 0 ? detailData.engagement.productsOrServices.map((item) => <span key={item} className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">{item}</span>) : <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-500">No products/services extracted</span>}
                        </div>
                      </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                      <InfoListCard title="Pain points detected" items={detailData.engagement.painPoints} emptyLabel="No pain points detected." />
                      <InfoListCard title="Buying signals" items={detailData.engagement.buyingSignals} emptyLabel="No buying signals detected." />
                      <InfoListCard title="Objections" items={detailData.engagement.objections} emptyLabel="No objections detected." />
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended next action</p>
                        <p className="mt-4 text-sm leading-7 text-slate-700">{detailData.engagement.recommendedNextAction || "No recommendation generated yet."}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contact details</p>
                        <dl className="mt-4 space-y-3 text-sm text-slate-700">
                          <div className="flex items-center justify-between gap-3"><dt>Name</dt><dd className="font-medium text-slate-900">{detailData.engagement.visitorName || "—"}</dd></div>
                          <div className="flex items-center justify-between gap-3"><dt>Email</dt><dd className="font-medium text-slate-900">{detailData.engagement.visitorEmail || "—"}</dd></div>
                          <div className="flex items-center justify-between gap-3"><dt>Phone</dt><dd className="font-medium text-slate-900">{detailData.engagement.visitorPhone || "—"}</dd></div>
                        </dl>
                      </div>
                    </section>
                  </div>
                ) : (
                  <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Full transcript</p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{detailData.engagement.messageCount} messages</span>
                    </div>
                    <pre className="mt-4 overflow-x-auto rounded-[1.25rem] bg-slate-950 p-4 text-sm leading-7 text-slate-100 whitespace-pre-wrap">{detailData.engagement.transcript || "No transcript available yet."}</pre>
                  </section>
                )}

                <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Owner notes</p>
                  <textarea value={ownerNotesDraft} onChange={(event) => setOwnerNotesDraft(event.target.value)} rows={4} placeholder="Add internal notes, next steps, or context for the team." className="mt-4 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  <div className="mt-4 flex justify-end">
                    <button type="button" onClick={() => void saveOwnerNotes()} disabled={savingNotes} className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                      {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save notes"}
                    </button>
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Pending and past follow-ups</p>
                  <div className="mt-4 space-y-3">
                    {detailData.followUpTasks.length > 0 ? detailData.followUpTasks.map((task) => (
                      <div key={task.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-semibold text-slate-900">{followUpChannelLabels[task.channel]}</span>
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{task.status}</span>
                        </div>
                        <p className="mt-2 leading-6">{task.instruction}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{task.scheduledFor ? `Scheduled ${formatDate(task.scheduledFor)}` : `Created ${formatDate(task.createdAt)}`}</p>
                      </div>
                    )) : <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">No follow-up tasks created yet.</p>}
                  </div>
                </section>
              </div>
            ) : null}
          </div>

          {detailData ? (
            <DrawerFooter className="border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void patchEngagement(detailData.engagement.id, { resolved: true }, "Engagement marked as resolved.")} className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Mark as resolved</button>
                <button type="button" onClick={() => void patchEngagement(detailData.engagement.id, { leadStatus: "needs_follow_up", followUpNeeded: true }, "Engagement marked for follow-up.")} className="inline-flex h-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100">Mark follow-up needed</button>
              </div>
              <button type="button" onClick={() => openFollowUpModal(detailData.engagement)} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">Instruct AI to follow up</button>
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </Drawer>

      <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border border-white/70 bg-white p-0 shadow-[0_24px_60px_rgba(148,163,184,0.2)]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Tell the AI how to follow up</DialogTitle>
              <DialogDescription>Save a pending outbound task for the AI to execute once the delivery workflow is connected.</DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-4">
              <label className="text-sm text-slate-600">
                <span className="mb-2 block font-medium text-slate-700">Follow-up instruction</span>
                <textarea value={followUpForm.instruction} onChange={(event) => setFollowUpForm((current) => ({ ...current, instruction: event.target.value }))} rows={4} className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-600">
                  <span className="mb-2 block font-medium text-slate-700">Preferred channel</span>
                  <select value={followUpForm.channel} onChange={(event) => setFollowUpForm((current) => ({ ...current, channel: event.target.value as FollowUpChannel }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                    {Object.entries(followUpChannelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm text-slate-600">
                  <span className="mb-2 block font-medium text-slate-700">Timing</span>
                  <select value={followUpForm.timing} onChange={(event) => setFollowUpForm((current) => ({ ...current, timing: event.target.value as "now" | "later" }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                    <option value="now">Now</option>
                    <option value="later">Later</option>
                  </select>
                </label>
              </div>

              {followUpForm.timing === "later" ? (
                <label className="text-sm text-slate-600">
                  <span className="mb-2 block font-medium text-slate-700">Schedule for</span>
                  <input type="datetime-local" value={followUpForm.scheduledFor} onChange={(event) => setFollowUpForm((current) => ({ ...current, scheduledFor: event.target.value }))} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                </label>
              ) : null}

              <label className="text-sm text-slate-600">
                <span className="mb-2 block font-medium text-slate-700">Internal note</span>
                <textarea value={followUpForm.internalNote} onChange={(event) => setFollowUpForm((current) => ({ ...current, internalNote: event.target.value }))} rows={3} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="Optional context for the owner or future outbound workflow." />
              </label>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 px-6 py-5">
            <button type="button" onClick={() => setFollowUpOpen(false)} className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => void submitFollowUpTask()} disabled={followUpSubmitting || followUpForm.instruction.trim().length < 8 || (followUpForm.timing === "later" && !followUpForm.scheduledFor)} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {followUpSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save follow-up task"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function InfoListCard({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        {items.length > 0 ? items.map((item) => <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</div>) : <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-500">{emptyLabel}</div>}
      </div>
    </div>
  )
}
