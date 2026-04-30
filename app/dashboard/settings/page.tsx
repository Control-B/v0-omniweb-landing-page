import { Bell, Bot, ShieldAlert, SlidersHorizontal, UserCog } from "lucide-react"
import { requireDashboardAccess } from "@/lib/saas/guards"

const cards = [
  {
    title: "Account settings",
    description: "Profile, login, and personal account controls will live here as the SaaS account area expands.",
    icon: UserCog,
    color: "text-cyan-500",
  },
  {
    title: "Workspace settings",
    description: "Manage shared workspace defaults, branding, and cross-team behavior for your Omniweb environment.",
    icon: SlidersHorizontal,
    color: "text-violet-500",
  },
  {
    title: "Notification preferences",
    description: "Choose which product alerts, lead updates, and billing notices should reach the owner or team.",
    icon: Bell,
    color: "text-emerald-500",
  },
  {
    title: "Agent defaults",
    description: "Future workspace-wide defaults for agent behavior, escalation, follow-up cadence, and handoff logic.",
    icon: Bot,
    color: "text-amber-500",
  },
  {
    title: "Danger zone",
    description: "Reserved for destructive account actions such as workspace reset, export, or full account removal.",
    icon: ShieldAlert,
    color: "text-rose-500",
  },
]

export default async function DashboardSettingsPage() {
  await requireDashboardAccess({ allowExpiredBilling: true })

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(90deg,rgba(99,102,241,0.10),rgba(34,211,238,0.08),rgba(16,185,129,0.06))] p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Settings</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Workspace Settings</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">Manage account settings, workspace controls, notification preferences, agent defaults, and future admin actions.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 shadow-inner">
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-950">{card.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{card.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}