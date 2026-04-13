"use client"

import { useEffect, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { adminGetClients } from "@/lib/admin-api"
import { cn } from "@/lib/utils"
import { Search, Loader2, AlertCircle, Eye, ChevronLeft, ChevronRight, Users } from "lucide-react"

interface Client {
  id: string; name: string; email: string;
  business_name: string | null; business_type: string | null;
  plan: string; role: string; is_active: boolean; created_at: string
}

interface AdminClientsProps { onViewClient: (clientId: string) => void }

const PAGE_SIZE = 20

export function AdminClients({ onViewClient }: AdminClientsProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("")
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchClients = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const res = await adminGetClients({ search: search || undefined, plan: planFilter || undefined, limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      setClients(res.clients || res)
      setTotal(res.total ?? (res.clients?.length || res.length || 0))
    } catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [search, planFilter, page])

  useEffect(() => { fetchClients() }, [fetchClients])

  const [searchInput, setSearchInput] = useState("")
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const planColors: Record<string, string> = {
    starter: "bg-slate-500/20 text-slate-300", growth: "bg-indigo-500/20 text-indigo-300",
    pro: "bg-emerald-500/20 text-emerald-300", agency: "bg-amber-500/20 text-amber-300",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Clients</h1>
          <p className="text-sm text-slate-400 mt-1">Manage all tenant accounts</p>
        </div>
        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-400">{total} total</span></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search by name or email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
        </div>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(0) }} className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
          <option value="">All Plans</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="pro">Pro</option>
          <option value="agency">Agency</option>
        </select>
      </div>

      {error && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">No clients found.</div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Client", "Business", "Plan", "Role", "Status", "Joined", ""].map((h) => (
                    <th key={h} className={cn("text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider", !h && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3"><div className="font-medium text-white">{c.name}</div><div className="text-xs text-slate-400">{c.email}</div></td>
                    <td className="px-4 py-3 text-slate-400">{c.business_name || "—"}</td>
                    <td className="px-4 py-3"><span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", planColors[c.plan] || "bg-white/10 text-white")}>{c.plan}</span></td>
                    <td className="px-4 py-3"><Badge variant={c.role === "admin" ? "default" : "outline"} className={cn(c.role === "admin" && "bg-amber-500/80")}>{c.role}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={c.is_active ? "default" : "destructive"} className={cn("text-[9px]", c.is_active && "bg-emerald-500/80")}>{c.is_active ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onViewClient(c.id)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="View details"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</p>
          <div className="flex items-center gap-1">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
