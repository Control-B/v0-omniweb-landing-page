import { Globe2, Code2 } from "lucide-react"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

export default async function DashboardKnowledgePage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><Globe2 className="h-4 w-4 text-emerald-500" />Knowledge</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Website and knowledge source placeholder</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Your onboarding domain is already saved. This page is ready to evolve into source management without changing the authenticated flow again.</p>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Primary website domain</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">{snapshot.status.websiteDomain || "Not set"}</p>
          <p className="mt-2 text-sm text-slate-600">Start with your homepage, FAQ, pricing, and service pages when source ingestion is enabled.</p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Code2 className="h-4 w-4 text-violet-500" />Widget embed code</div>
        <p className="mt-2 text-sm text-slate-600">Use this placeholder snippet to install the Omniweb website widget.</p>
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-cyan-200">{snapshot.widgetEmbedCode}</pre>
      </section>
    </div>
  )
}
