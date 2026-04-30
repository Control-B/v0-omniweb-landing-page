import Link from "next/link"
import { BarChart3, Bot, Brain, Code2, Wallet } from "lucide-react"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

function cardClassName() {
  return "rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]"
}

export default async function DashboardPage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()
  const { status, billingStatus, agentConfig, widgetEmbedCode } = snapshot

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-5">
        <div className={cardClassName()}>
          <p className="text-sm font-medium text-slate-500">Subscription</p>
          <p className="mt-4 text-2xl font-semibold text-slate-950">{billingStatus?.plan === "standard" ? "Standard" : billingStatus?.plan === "business" ? "Business" : "Starter"}</p>
          <p className="mt-2 text-sm text-slate-600">Status: {status.subscriptionStatus ?? "trialing"}</p>
          <p className="mt-1 text-sm text-slate-600">Plan: {billingStatus?.plan === "standard" ? "Standard" : billingStatus?.plan === "business" ? "Business" : "Starter"}</p>
          <p className="mt-1 text-sm text-slate-600">Days left: {status.daysLeft ?? 7}</p>
          <Link href="/dashboard/billing" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500">Manage billing</Link>
        </div>

        <div className={cardClassName()}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Bot className="h-4 w-4 text-cyan-500" />AI Agent</div>
          <p className="mt-4 text-2xl font-semibold text-slate-950">{agentConfig?.active ? "Configured" : "Needs setup"}</p>
          <p className="mt-2 text-sm text-slate-600">{agentConfig?.agentName || "Omniweb AI"}</p>
          <Link href="/dashboard/ai-agent" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500">Edit agent</Link>
        </div>

        <div className={cardClassName()}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Code2 className="h-4 w-4 text-violet-500" />Website Widget</div>
          <p className="mt-4 text-2xl font-semibold text-slate-950">Needs install</p>
          <p className="mt-2 text-sm text-slate-600">Use your tenant-specific embed code on {status.websiteDomain || "your site"}.</p>
          <Link href="/dashboard/knowledge" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500">Get embed code</Link>
        </div>

        <div className={cardClassName()}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Brain className="h-4 w-4 text-emerald-500" />Knowledge</div>
          <p className="mt-4 text-2xl font-semibold text-slate-950">Needs sources</p>
          <p className="mt-2 text-sm text-slate-600">Start with your main domain and service pages.</p>
          <Link href="/dashboard/knowledge" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500">Add knowledge</Link>
        </div>

        <div className={cardClassName()}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><BarChart3 className="h-4 w-4 text-amber-500" />Analytics</div>
          <p className="mt-4 text-2xl font-semibold text-slate-950">0</p>
          <p className="mt-2 text-sm text-slate-600">Placeholder stats until your AI workspace starts receiving traffic.</p>
          <Link href="/dashboard/analytics" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500">View analytics</Link>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className={cardClassName()}>
          <p className="text-lg font-semibold text-slate-950">Workspace snapshot</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Business</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{status.businessName || "Not set"}</p>
              <p className="mt-2 text-sm text-slate-600">{status.industry || "Industry pending"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Website</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{status.websiteDomain || "Not set"}</p>
              <p className="mt-2 text-sm text-slate-600">Widget target domain</p>
            </div>
          </div>
        </div>

        <div className={cardClassName()}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-950">Widget embed code</p>
              <p className="mt-1 text-sm text-slate-600">Placeholder snippet for your website install.</p>
            </div>
            <Link href="/dashboard/billing" className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
              <Wallet className="mr-2 h-4 w-4" />
              Billing
            </Link>
          </div>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-cyan-200">{widgetEmbedCode}</pre>
        </div>
      </section>
    </div>
  )
}
