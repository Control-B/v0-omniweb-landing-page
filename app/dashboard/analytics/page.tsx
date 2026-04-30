import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

export default async function DashboardAnalyticsPage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Analytics</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Placeholder reporting until live usage starts</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">These cards are intentionally ready before Stripe and channel usage data are connected, so the dashboard structure doesn’t need to change later.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Conversations", "0"],
          ["Qualified leads", "0"],
          ["Widget installs", snapshot.widgetEmbedCode ? "1" : "0"],
          ["Trial days left", String(snapshot.status.daysLeft ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
