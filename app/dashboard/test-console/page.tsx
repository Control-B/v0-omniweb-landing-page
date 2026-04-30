import { Bot, MessageSquareText } from "lucide-react"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

export default async function DashboardTestConsolePage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><MessageSquareText className="h-4 w-4 text-violet-500" />Test Console</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Preview the current workspace experience</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use this placeholder console to confirm your workspace details, trial status, and AI configuration before deeper testing tools are connected.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Bot className="h-4 w-4 text-cyan-500" />Active agent</div>
          <p className="mt-4 text-2xl font-semibold text-slate-950">{snapshot.agentConfig?.agentName || "Omniweb AI"}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{snapshot.agentConfig?.welcomeMessage}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <p className="text-sm font-semibold text-slate-900">Suggested checks</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Welcome message feels on-brand</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Goals match your lead and support priorities</li>
            <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Widget embed code is ready for install</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
