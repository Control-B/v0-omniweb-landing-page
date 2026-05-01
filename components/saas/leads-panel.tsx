"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronRight, ExternalLink, Filter, Loader2, Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardCard } from "./dashboard-card"
import type { EngagementRecord } from "@/lib/saas/types"

type LeadsListResponse = {
  engagements: EngagementRecord[]
}

const leadStatusColors: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  qualified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  needs_follow_up: "bg-amber-50 text-amber-700 ring-amber-200",
  not_qualified: "bg-slate-50 text-slate-700 ring-slate-200",
  resolved: "bg-slate-100 text-slate-700 ring-slate-300",
}

export function LeadsPanel() {
  const [leads, setLeads] = useState<EngagementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/analytics/engagements?contactCaptured=true", {
        cache: "no-store",
      })
      if (!response.ok) throw new Error("Failed to fetch leads")
      const data = (await response.json()) as LeadsListResponse
      setLeads(data.engagements || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [fetchLeads])

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return leads
    const lower = searchTerm.toLowerCase()
    return leads.filter(
      (lead) =>
        lead.visitorName?.toLowerCase().includes(lower) ||
        lead.visitorEmail?.toLowerCase().includes(lower) ||
        lead.visitorPhone?.includes(searchTerm),
    )
  }, [leads, searchTerm])

  const grouped = useMemo(() => {
    const groups: Record<string, EngagementRecord[]> = {
      qualified: [],
      needs_follow_up: [],
      new: [],
      not_qualified: [],
      resolved: [],
    }
    filtered.forEach((lead) => {
      const status = (lead.leadStatus || "new") as keyof typeof groups
      if (groups[status]) groups[status].push(lead)
    })
    return groups
  }, [filtered])

  const totals = {
    qualified: grouped.qualified.length,
    needs_follow_up: grouped.needs_follow_up.length,
    new: grouped.new.length,
  }

  return (
    <div className="space-y-6">
      <DashboardCard className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="dashboard-eyebrow">Lead Pipeline</p>
            <h3 className="dashboard-section-title mt-2">Captured Leads</h3>
          </div>
          <Button onClick={fetchLeads} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </DashboardCard>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard>
          <p className="text-sm font-medium text-slate-500">Qualified</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{totals.qualified}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm font-medium text-slate-500">Follow-up Needed</p>
          <p className="mt-3 text-3xl font-bold text-amber-600">{totals.needs_follow_up}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm font-medium text-slate-500">New</p>
          <p className="mt-3 text-3xl font-bold text-blue-600">{totals.new}</p>
        </DashboardCard>
      </div>

      {/* Search */}
      <DashboardCard>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent placeholder:text-slate-400"
          />
          <Filter className="h-4 w-4 text-slate-400" />
        </div>
      </DashboardCard>

      {/* Status Groups */}
      {error && (
        <DashboardCard className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </DashboardCard>
      )}

      {loading && !leads.length ? (
        <DashboardCard>
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            <p className="text-slate-500">Loading leads...</p>
          </div>
        </DashboardCard>
      ) : leads.length === 0 ? (
        <DashboardCard>
          <div className="text-center py-12">
            <Phone className="mx-auto h-12 w-12 text-slate-200" />
            <p className="mt-4 text-slate-600">No leads captured yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Leads will appear here as visitors engage with your widget or phone agents.
            </p>
          </div>
        </DashboardCard>
      ) : (
        Object.entries(grouped).map(([status, statusLeads]) => (
          statusLeads.length > 0 && (
            <div key={status}>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className={`inline-block h-3 w-3 rounded-full ${leadStatusColors[status] || ""}`} />
                {status.replace(/_/g, " ").charAt(0).toUpperCase() + status.replace(/_/g, " ").slice(1)}
              </h4>
              <div className="space-y-2">
                {statusLeads.map((lead) => (
                  <DashboardCard key={lead.id} className="cursor-pointer hover:border-slate-300 transition">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {lead.visitorName || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {lead.visitorEmail || lead.visitorPhone || "No contact"}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {lead.intent || "No intent"} · {lead.channel || "unknown"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${leadStatusColors[status] || ""}`}>
                          {status.replace(/_/g, " ")}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </DashboardCard>
                ))}
              </div>
            </div>
          )
        ))
      )}
    </div>
  )
}
