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
import { getDisplayPlanName, getPlanDetails, getPricingContent } from "@/lib/saas/billing"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

function cardClassName() {
  return "rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
}

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
  return "mt-auto inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-500"
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

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <section className={cardClassName()}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Setup overview</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Your workspace launch posture</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Keep agent readiness, site coverage, widget status, and telephony setup in one clean control surface so the next action is always obvious.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Business</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{status.businessName || "Not set"}</p>
                  <p className="mt-1 text-sm text-slate-600">{status.industry || "Industry pending"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Website</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{status.websiteDomain || "Add your domain"}</p>
                  <p className="mt-1 text-sm text-slate-600">{setupProgress}% setup completion</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className={`${cardClassName()} flex min-h-[260px] flex-col`}>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Next best step
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{nextStep.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{nextStep.description}</p>
              <Link href={nextStep.href} className={actionLinkClassName()}>
                {nextStep.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className={`${cardClassName()} flex min-h-[260px] flex-col`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Wallet className="h-4 w-4 text-blue-500" />
                  Subscription snapshot
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClassName(isTrial ? "warning" : "success")}`}>
                  {subscriptionLabel}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{planLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Current pricing is framed for {pricingContent.label.toLowerCase()} teams and tracks value using {planDetails.metricLabel.toLowerCase()}.</p>
              <dl className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>Current plan</dt>
                  <dd className="font-semibold text-slate-900">{planLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>Billing status</dt>
                  <dd className="font-semibold text-slate-900">{subscriptionLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>Days remaining</dt>
                  <dd className="font-semibold text-slate-900">{billingStatus?.daysLeft ?? status.daysLeft ?? 7}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <dt>{planDetails.metricLabel}</dt>
                  <dd className="font-semibold text-slate-900">{planDetails.conversationsPerMonth.toLocaleString()}</dd>
                </div>
              </dl>
              <Link href="/dashboard/billing" className={actionLinkClassName()}>
                Open billing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className={`${cardClassName()} flex min-h-[260px] flex-col`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">Setup checklist</p>
              <span className="text-sm font-semibold text-slate-900">{setupProgress}%</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#0ea5e9,#4f46e5)]" style={{ width: `${setupProgress}%` }} />
            </div>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span>AI agent configured</span>
                <span className={aiAgentReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{aiAgentReady ? "Ready" : "Pending"}</span>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span>Knowledge source connected</span>
                <span className={knowledgeReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{knowledgeReady ? "Ready" : "Pending"}</span>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span>Widget snippet available</span>
                <span className={widgetReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{widgetReady ? "Ready" : "Pending"}</span>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span>Telephony routing configured</span>
                <span className={telephonyReady ? "font-semibold text-emerald-600" : "font-semibold text-slate-400"}>{telephonyReady ? "Ready" : "Optional"}</span>
              </li>
            </ul>
          </section>

          <section className={`${cardClassName()} flex min-h-[260px] flex-col`}>
            <p className="text-sm font-medium text-slate-500">Quick actions</p>
            <div className="mt-5 space-y-3">
              <Link href="/dashboard/profile" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
                <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /> Update workspace details</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link href="/dashboard/knowledge" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
                <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4 text-slate-500" /> Manage knowledge and widget</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link href="/dashboard/ai-telephony" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
                <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" /> Configure AI telephony</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className={`${cardClassName()} flex min-h-[224px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Bot className="h-4 w-4 text-cyan-500" />
            AI Agent
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{aiAgentReady ? "Configured" : "Needs setup"}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Keep one shared Omniweb brain aligned across website chat and voice workflows.
          </p>
          <Link href="/dashboard/ai-agent" className={actionLinkClassName()}>
            Open AI agent
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex min-h-[224px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Code2 className="h-4 w-4 text-violet-500" />
            Website Widget
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{widgetReady ? "Install ready" : "Setup pending"}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Deploy the widget snippet on your site and start turning traffic into tracked conversations.
          </p>
          <Link href="/dashboard/ai-agent" className={actionLinkClassName()}>
            Review install
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex min-h-[224px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Brain className="h-4 w-4 text-emerald-500" />
            Knowledge
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{knowledgeReady ? "Domain connected" : "Needs sources"}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {knowledgeReady
              ? `Primary domain set to ${status.websiteDomain}. Keep adding pages, FAQs, and proof points.`
              : "Add your main site and source content so the agent can answer with confidence."}
          </p>
          <Link href="/dashboard/knowledge" className={actionLinkClassName()}>
            Manage knowledge
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex min-h-[224px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            Analytics
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">0 sessions</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {analyticsReady
              ? "Live engagement and conversion insights are flowing in now."
              : "Traffic-driven analytics will populate after chat or telephony sessions begin."}
          </p>
          <Link href="/dashboard/analytics" className={actionLinkClassName()}>
            View analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex min-h-[224px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Phone className="h-4 w-4 text-sky-500" />
            AI Telephony
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{telephonyReady ? "Configured" : "Needs setup"}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Extend the shared Omniweb agent to live phone calls with routing, escalation, and concise voice handling.
          </p>
          <Link href="/dashboard/ai-telephony" className={actionLinkClassName()}>
            Open telephony
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
