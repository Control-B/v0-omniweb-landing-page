import { AgentConfigForm } from "@/components/saas/agent-config-form"
import { WidgetInstallCard } from "@/components/saas/widget-install-card"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardAiAgentPage() {
  await requireDashboardAccess()

  return (
    <div className="space-y-5">
      <WidgetInstallCard />

      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">AI Agent</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Configure Omniweb’s universal revenue agent</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Choose the vertical brain, apply a conversion-focused template, tune qualification logic, preview the final system prompt, and test responses before you save.</p>
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <AgentConfigForm />
      </section>
    </div>
  )
}
