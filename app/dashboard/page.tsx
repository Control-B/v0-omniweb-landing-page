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
  Sparkles,
  Wallet,
} from "lucide-react"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

function cardClassName() {
  return "rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)] backdrop-blur"
}

function formatPlan(value: string | null | undefined) {
  if (value === "business") return "Business"
  if (value === "standard") return "Standard"
  return "Starter"
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

  const planLabel = formatPlan(billingStatus?.plan ?? status.plan)
  const subscriptionLabel = formatSubscriptionStatus(status.subscriptionStatus)
  const isTrial = status.subscriptionStatus !== "active"
  const aiAgentReady = Boolean(agentConfig?.active)
  const knowledgeReady = Boolean(status.websiteDomain)
  const telephonyReady = Boolean(telephonyConfig?.aiPhoneNumber)
  const analyticsReady = false
  const widgetReady = Boolean(widgetEmbedCode)

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className={`${cardClassName()} overflow-hidden`}>
          <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                Dashboard overview
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                {status.businessName || "Your Omniweb workspace"}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Keep your AI agent, widget install, knowledge sources, and subscription status in one clean workspace. Start with the highest-impact setup items below.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Plan</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{planLabel}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{subscriptionLabel}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Website</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{status.websiteDomain || "Add domain"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-cyan-200/80 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(99,102,241,0.14))] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Trial runway</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{status.daysLeft ?? 7} days</p>
                <p className="mt-2 text-sm text-slate-600">
                  {isTrial ? "Upgrade before your trial ends to keep every AI feature live." : "Your subscription is active and your workspace is fully unlocked."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next best step</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {knowledgeReady ? "Install your widget on the site" : "Add your main website domain"}
                </p>
                <Link href={knowledgeReady ? "/dashboard/knowledge" : "/dashboard/profile"} className={`${actionLinkClassName()} mt-4`}>
                  {knowledgeReady ? "Review widget setup" : "Complete workspace profile"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardClassName()} flex h-full flex-col`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Subscription snapshot</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{planLabel}</p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClassName(isTrial ? "warning" : "success")}`}>
              {subscriptionLabel}
            </span>
          </div>
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
              <dd className="font-semibold text-slate-900">{status.daysLeft ?? 7}</dd>
            </div>
          </dl>
          <Link href="/dashboard/billing" className={actionLinkClassName()}>
            Manage billing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={`${cardClassName()} flex h-full min-h-[220px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Bot className="h-4 w-4 text-cyan-500" />
            AI Agent
          </div>
          <div className="mt-5 flex items-center gap-2">
            <p className="text-2xl font-semibold text-slate-950">{aiAgentReady ? "Configured" : "Needs setup"}</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClassName(aiAgentReady ? "success" : "warning")}`}>
              {aiAgentReady ? "Ready" : "Action needed"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {agentConfig?.agentName || "Omniweb AI"} is your primary website assistant. Update its welcome message, goals, and behavior here.
          </p>
          <Link href="/dashboard/ai-agent" className={actionLinkClassName()}>
            Edit agent
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex h-full min-h-[220px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Code2 className="h-4 w-4 text-violet-500" />
            Website Widget
          </div>
          <div className="mt-5 flex items-center gap-2">
            <p className="text-2xl font-semibold text-slate-950">{widgetReady ? "Ready to install" : "Install pending"}</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClassName(widgetReady ? "default" : "warning")}`}>
              {widgetReady ? "Code ready" : "Pending"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use your tenant-specific snippet on {status.websiteDomain || "your website"} to launch Omniweb AI for real visitors.
          </p>
          <Link href="/dashboard/knowledge" className={actionLinkClassName()}>
            Review embed setup
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex h-full min-h-[220px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Brain className="h-4 w-4 text-emerald-500" />
            Knowledge
          </div>
          <div className="mt-5 flex items-center gap-2">
            <p className="text-2xl font-semibold text-slate-950">{knowledgeReady ? "Domain connected" : "Needs sources"}</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClassName(knowledgeReady ? "success" : "warning")}`}>
              {knowledgeReady ? "In place" : "Action needed"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {knowledgeReady
              ? `Primary domain set to ${status.websiteDomain}. Add FAQs, service pages, and policies next.`
              : "Start with your main domain and key service pages so the AI can answer accurately."}
          </p>
          <Link href="/dashboard/knowledge" className={actionLinkClassName()}>
            {knowledgeReady ? "Manage knowledge" : "Add knowledge"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex h-full min-h-[220px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            Analytics
          </div>
          <div className="mt-5 flex items-center gap-2">
            <p className="text-2xl font-semibold text-slate-950">0 sessions</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClassName(analyticsReady ? "success" : "default")}`}>
              {analyticsReady ? "Live" : "Waiting for traffic"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Engagement, lead quality, and follow-up insights will appear once the widget or telephony flow starts receiving traffic.
          </p>
          <Link href="/dashboard/analytics" className={actionLinkClassName()}>
            View analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className={`${cardClassName()} flex h-full min-h-[220px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Phone className="h-4 w-4 text-blue-500" />
            AI Telephony
          </div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{telephonyReady ? "Number ready" : "Set up call flow"}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {telephonyReady
              ? `Inbound AI call routing is configured on ${telephonyConfig?.aiPhoneNumber}.`
              : "Connect a phone number and escalation path so leads can call the same Omniweb AI assistant."}
          </p>
          <Link href="/dashboard/ai-telephony" className={actionLinkClassName()}>
            Configure telephony
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex h-full min-h-[220px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Building2 className="h-4 w-4 text-slate-500" />
            Workspace details
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Business</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{status.businessName || "Not set"}</p>
              <p className="mt-1 text-sm text-slate-600">{status.industry || "Industry pending"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Website</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{status.websiteDomain || "Not set"}</p>
              <p className="mt-1 text-sm text-slate-600">Widget target domain</p>
            </div>
          </div>
          <Link href="/dashboard/profile" className={actionLinkClassName()}>
            Update profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardClassName()} flex h-full min-h-[220px] flex-col`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Setup checklist
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${aiAgentReady ? "text-emerald-500" : "text-slate-300"}`} />
              <span>{aiAgentReady ? "AI agent is configured" : "Finish AI agent setup"}</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${knowledgeReady ? "text-emerald-500" : "text-slate-300"}`} />
              <span>{knowledgeReady ? "Primary website domain is connected" : "Add your website domain and sources"}</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${telephonyReady ? "text-emerald-500" : "text-slate-300"}`} />
              <span>{telephonyReady ? "Telephony routing is configured" : "Set up telephony or keep it optional"}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className={cardClassName()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-950">Workspace snapshot</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A concise view of your tenant identity, website destination, and subscription readiness.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
              {planLabel}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Building2 className="h-3.5 w-3.5" />
                Business
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">{status.businessName || "Not set"}</p>
              <p className="mt-2 text-sm text-slate-600">{status.industry || "Industry pending"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Globe className="h-3.5 w-3.5" />
                Website
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">{status.websiteDomain || "Not set"}</p>
              <p className="mt-2 text-sm text-slate-600">Widget target domain</p>
            </div>
          </div>
        </div>

        <div className={cardClassName()}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-950">Widget embed code</p>
              <p className="mt-1 text-sm text-slate-600">
                Use this snippet in your website layout to install Omniweb AI on the frontend.
              </p>
            </div>
            <Link href="/dashboard/billing" className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
              <Wallet className="mr-2 h-4 w-4" />
              Billing
            </Link>
          </div>

          <div className="mt-5 rounded-[1.4rem] bg-slate-950 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <pre className="overflow-x-auto text-xs leading-6 text-cyan-200">{widgetEmbedCode}</pre>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">Tenant-specific snippet</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Use on {status.websiteDomain || "your website"}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
