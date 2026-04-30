import { AgentConfigForm } from "@/components/saas/agent-config-form"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

export default async function DashboardAiAgentPage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()
  const agentConfig = snapshot.agentConfig

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">AI Agent</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Configure your default Omniweb AI agent</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">This default config is created during onboarding and powers your workspace until deeper channel-specific setup is added later.</p>
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        {agentConfig ? (
          <AgentConfigForm
            initialConfig={{
              agentName: agentConfig.agentName,
              welcomeMessage: agentConfig.welcomeMessage,
              tone: agentConfig.tone,
              goals: agentConfig.goals,
              active: agentConfig.active,
            }}
          />
        ) : null}
      </section>
    </div>
  )
}
