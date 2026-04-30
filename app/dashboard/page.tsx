import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Building2,
  CheckCircle2,
  Code2,
  Globe,
  Phone,
  Wallet,
} from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
import { getDisplayPlanName, getPlanDetails, getPricingContent } from "@/lib/saas/billing"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

function formatSubscriptionStatus(value: string | null | undefined) {
  if (!value) return "Trialing"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function statusBadgeClassName(tone: "default" | "success" | "warning") {
  if (tone === "success") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
  }
  if (tone === "warning") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
}

function actionLinkClassName() {
  return "mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-semibold text-blue-600 transition hover:text-blue-500"
}

export default async function DashboardPage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()
  const { status, billingStatus, agentConfig, telephonyConfig, widgetEmbedCode } = snapshot

  const pricingContent = getPricingContent(status.industry)
  const planDetails = getPlanDetails(billingStatus?.plan ?? status.plan, status.industry)
  const planLabel = getDisplayPlanName(billingStatus?.plan ?? status.plan, status.industry)
  const subscriptionLabel = formatSubscriptionStatus(status.subscriptionStatus)
  const isTrial = status.subscriptionStatus !== "active"
  const aiAgentReady = Boolean(agentConfig?.active)
  const knowledgeReady = Boolean(status.websiteDomain)
  const telephonyReady = Boolean(telephonyConfig?.aiPhoneNumber)
  const analyticsReady = false
  const widgetReady = Boolean(widgetEmbedCode)
  const setupItems = [aiAgentReady, knowledgeReady, widgetReady, telephonyReady]
  const setupCompleted = setupItems.filter(Boolean).length
  const setupProgress = Math.round((setupCompleted / setupItems.length) * 100)

  const nextStep = !knowledgeReady
    ? {
        title: "Add your main website domain",
        description: "Connect the primary domain first so Omniweb can anchor knowledge, widget setup, and conversion context around a real destination.",
        href: "/dashboard/profile",
        cta: "Complete workspace profile",
      }
    : !aiAgentReady
      ? {
          title: "Finish your AI agent setup",
          description: "Set the welcome message, goals, and mode so the assistant is conversion-ready before visitors start engaging.",
          href: "/dashboard/ai-agent",
          cta: "Configure AI agent",
        }
      : !widgetReady
        ? {
            title: "Install the website widget",
            description: "Your tenant-specific snippet is ready. Add it to the site to start capturing real conversations and leads.",
            href: "/dashboard/ai-agent",
            cta: "Review widget install",
          }
        : !telephonyReady
          ? {
              title: "Turn on AI telephony",
              description: "Extend the same Omniweb agent to voice calls with a phone number and escalation path for higher-intent conversations.",
              href: "/dashboard/ai-telephony",
              cta: "Configure telephony",
            }
          : {
              title: "Review live performance",
              description: "Your core setup is in place. Track engagement quality, lead flow, and conversion signals as traffic comes in.",
              href: "/dashboard/analytics",
              cta: "Open analytics",
            }

  const featureCards = [
    {
      icon: Bot,
      iconClass: "text-cyan-500",
      label: "AI Agent",
      stat: aiAgentReady ? "Configured" : "Needs setup",
      body: "Keep one shared Omniweb brain aligned across website chat and voice workflows.",
      href: "/dashboard/ai-agent",
      cta: "Open AI agent",
    },
    {
      icon: Code2,
      iconClass: "text-violet-500",
      label: "Website Widget",
      stat: widgetReady ? "Install ready" : "Setup pending",
      body: "Deploy the widget snippet on your site and start turning traffic into tracked conversations.",
      href: "/dashboard/ai-agent",
      cta: "Review install",
    },
    {
      icon: Brain,
      iconClass: "text-emerald-500",
      label: "Knowledge",
      stat: knowledgeReady ? "Domain connected" : "Needs sources",
      body: knowledgeReady
        ? `Primary domain set to ${status.websiteDomain}. Keep adding pages, FAQs, and proof points.`
        : "Add your main site and source content so the agent can answer with confidence.",
      href: "/dashboard/knowledge",
      cta: "Manage knowledge",
    },
    {
      icon: BarChart3,
      iconClass: "text-amber-500",
      label: "Analytics",
      stat: "0 sessions",
      body: analyticsReady
        ? "Live engagement and conversion insights are flowing in now."
        : "Traffic-driven analytics will populate after chat or telephony sessions begin.",
      href: "/dashboard/analytics",
      cta: "View analytics",
    },
    {
      icon: Phone,
      iconClass: "text-sky-500",
      label: "AI Telephony",
      stat: telephonyReady ? "Configured" : "Needs setup",
      body: "Extend the shared Omniweb agent to live phone calls with routing, escalation, and concise voice handling.",
      href: "/dashboard/ai-telephony",
      cta: "Open telephony",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <DashboardCard tone="highlight" className="flex min-h-[280px] flex-col gap-7">
          <div>
            <p className="dashboard-eyebrow">Workspace launch posture</p>
            <h2 className="dashboard-page-title mt-3">Your workspace launch posture</h2>
            <p className="dashboard-body mt-3 max-w-2xl">
              Keep agent readiness, site coverage, widget status, billing readiness, and telephony setup in one spacious command surface so the next action is always obvious.
            </p>
          </div>

          <div className="mt-auto grid gap-4 sm:grid-cols-2">
            <div className="dashboard-card-muted rounded-2xl p-5">
              <p className="dashboard-eyebrow">Business</p>
              <p className="dashboard-card-title mt-3">{status.businessName || "Not set"}</p>
              <p className="dashboard-body mt-2">{status.industry || "Industry pending"}</p>
            </div>
            <div className="dashboard-card-muted rounded-2xl p-5">
              <p className="dashboard-eyebrow">Website</p>
              <p className="dashboard-card-title mt-3">{status.websiteDomain || "Add your domain"}</p>
              <p className="dashboard-body mt-2">{setupProgress}% setup completion</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="flex min-h-[280px] flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <p className="dashboard-section-title">Setup checklist</p>
            <span className="text-[15px] font-semibold text-slate-900">{setupProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200/70">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#0ea5e9,#4f46e5,#8b5cf6)]" style={{ width: `${setupProgress}%` }} />
          </div>
          <ul className="space-y-2.5 text-[15px] text-slate-600">
            <li className="dashboard-card-muted flex items-center justify-between gap-3 rounded-xl px-4 py-3">
              <span>AI agent configured</span>
              <span className={aiAgentReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{aiAgentReady ? "Ready" : "Pending"}</span>
            </li>
            <li className="dashboard-card-muted flex items-center justify-between gap-3 rounded-xl px-4 py-3">
              <span>Knowledge source connected</span>
              <span className={knowledgeReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{knowledgeReady ? "Ready" : "Pending"}</span>
            </li>
            <li className="dashboard-card-muted flex items-center justify-between gap-3 rounded-xl px-4 py-3">
              <span>Widget snippet available</span>
              <span className={widgetReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{widgetReady ? "Ready" : "Pending"}</span>
            </li>
            <li className="dashboard-card-muted flex items-center justify-between gap-3 rounded-xl px-4 py-3">
              <span>Telephony routing configured</span>
              <span className={telephonyReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{telephonyReady ? "Ready" : "Optional"}</span>
            </li>
          </ul>
        </DashboardCard>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard className="flex min-h-[260px] flex-col">
          <div className="flex items-center gap-2 text-[14px] font-medium text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Next best step
          </div>
          <p className="dashboard-stat mt-4">{nextStep.title}</p>
          <p className="dashboard-body mt-3">{nextStep.description}</p>
          <Link href={nextStep.href} className={actionLinkClassName()}>
            {nextStep.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DashboardCard>

        <DashboardCard className="flex min-h-[260px] flex-col">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[14px] font-medium text-slate-500">
              <Wallet className="h-4 w-4 text-blue-500" />
              Subscription snapshot
            </div>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClassName(isTrial ? "warning" : "success")}`}>
              {subscriptionLabel}
            </span>
          </div>
          <p className="dashboard-stat mt-4">{planLabel}</p>
          <p className="dashboard-body mt-3">Current pricing is framed for {pricingContent.label.toLowerCase()} teams and tracks value using {planDetails.metricLabel.toLowerCase()}.</p>
          <dl className="mt-4 space-y-2.5 text-[14px] text-slate-600">
            <div className="dashboard-card-muted flex items-center justify-between gap-4 rounded-xl px-4 py-2.5">
              <dt>Current plan</dt>
              <dd className="font-semibold text-slate-900">{planLabel}</dd>
            </div>
            <div className="dashboard-card-muted flex items-center justify-between gap-4 rounded-xl px-4 py-2.5">
              <dt>Billing status</dt>
              <dd className="font-semibold text-slate-900">{subscriptionLabel}</dd>
            </div>
            <div className="dashboard-card-muted flex items-center justify-between gap-4 rounded-xl px-4 py-2.5">
              <dt>{planDetails.metricLabel}</dt>
              <dd className="font-semibold text-slate-900">{planDetails.conversationsPerMonth.toLocaleString()}</dd>
            </div>
          </dl>
          <Link href="/dashboard/billing" className={actionLinkClassName()}>
            Open billing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DashboardCard>

        <DashboardCard className="flex min-h-[260px] flex-col">
          <p className="dashboard-section-title">Quick actions</p>
          <div className="mt-5 space-y-2.5">
            <Link href="/dashboard/profile" className="dashboard-card-muted flex items-center justify-between rounded-xl px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
              <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /> Update workspace details</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/dashboard/knowledge" className="dashboard-card-muted flex items-center justify-between rounded-xl px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
              <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4 text-slate-500" /> Manage knowledge and widget</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/dashboard/ai-telephony" className="dashboard-card-muted flex items-center justify-between rounded-xl px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
              <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" /> Configure AI telephony</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </DashboardCard>
      </section>

      <section className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((card) => (
          <DashboardCard key={card.label} className="flex h-full min-h-[220px] flex-col">
            <div className="flex items-center gap-2 text-[14px] font-medium text-slate-500">
              <card.icon className={`h-4 w-4 ${card.iconClass}`} />
              {card.label}
            </div>
            <p className="dashboard-stat mt-4">{card.stat}</p>
            <p className="dashboard-body mt-3">{card.body}</p>
            <Link href={card.href} className={actionLinkClassName()}>
              {card.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </DashboardCard>
        ))}
      </section>
    </div>
  )
}
