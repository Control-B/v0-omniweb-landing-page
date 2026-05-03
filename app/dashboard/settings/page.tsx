import { Bell, Bot, ShieldAlert, SlidersHorizontal, UserCog } from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
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
    <div className="flex flex-col gap-6">
      <DashboardCard tone="highlight">
        <p className="dashboard-eyebrow">Settings</p>
        <h2 className="dashboard-page-title mt-3">Workspace Settings</h2>
        <p className="dashboard-body mt-3 max-w-3xl">
          Manage account settings, workspace controls, notification preferences, agent defaults, and future admin actions.
        </p>
      </DashboardCard>

      <section className="grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {cards.map((card) => (
          <DashboardCard key={card.title} className="flex h-full min-h-0 flex-col sm:min-h-[200px]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <h3 className="dashboard-card-title mt-5">{card.title}</h3>
            <p className="dashboard-body mt-2">{card.description}</p>
          </DashboardCard>
        ))}
      </section>
    </div>
  )
}