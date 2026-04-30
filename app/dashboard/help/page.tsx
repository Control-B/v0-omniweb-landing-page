import Link from "next/link"
import { CircleHelp, LifeBuoy, Mail } from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
import { requireDashboardAccess } from "@/lib/saas/guards"

const sections = [
  {
    title: "Getting Started",
    body: "Complete onboarding, configure the AI Agent, add knowledge sources, install the widget, test the assistant, and then review Analytics to understand visitor activity.",
  },
  {
    title: "AI Agent",
    body: "Configure the agent name, welcome message, tone, business goals, qualification behavior, and sales or support instructions so responses stay on-brand.",
  },
  {
    title: "AI Telephony",
    body: "Configure the voice agent, call handling behavior, summaries, and future phone workflows so visitors can request or receive AI-powered calls.",
  },
  {
    title: "Test Console",
    body: "Use the Test Console to simulate customer questions, preview greetings, and validate that the assistant is ready before going live.",
  },
  {
    title: "Knowledge",
    body: "Add website URLs, FAQs, products, services, policies, and business details. Better knowledge sources produce more accurate and specific AI answers.",
  },
  {
    title: "Billing",
    body: "Monitor trial status, manage plans, review subscription state, and prepare for later Stripe-powered upgrade or downgrade workflows.",
  },
  {
    title: "Analytics",
    body: "View conversations, Deepgram summaries, lead quality, buying signals, follow-up needs, and owner-directed AI follow-up tasks in one place.",
  },
  {
    title: "Widget Installation",
    body: "Copy the embed code, paste it before the closing </body> tag on your site, test the widget, and sync updates after making configuration changes.",
  },
  {
    title: "Common Issues",
    body: "If the widget isn’t showing, knowledge isn’t syncing, the agent sounds too generic, the trial expired, or authentication isn’t working, start by checking the related dashboard section and billing status.",
  },
]

export default async function DashboardHelpPage() {
  await requireDashboardAccess({ allowExpiredBilling: true })

  return (
    <div className="flex flex-col gap-6">
      <DashboardCard tone="highlight">
        <div className="dashboard-eyebrow inline-flex items-center gap-2"><CircleHelp className="h-4 w-4 text-cyan-500" />Help</div>
        <h2 className="dashboard-page-title mt-3">Help &amp; System Guide</h2>
        <p className="dashboard-body mt-3 max-w-3xl">
          Learn how to set up your AI agent, manage knowledge, review analytics, and use Omniweb to convert more visitors.
        </p>
      </DashboardCard>

      <section className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <DashboardCard key={section.title} className="flex h-full min-h-[200px] flex-col">
            <div className="h-1 w-12 rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.9),rgba(99,102,241,0.85),rgba(139,92,246,0.85))]" />
            <h3 className="dashboard-card-title mt-4">{section.title}</h3>
            <p className="dashboard-body mt-3">{section.body}</p>
          </DashboardCard>
        ))}
      </section>

      <DashboardCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="dashboard-eyebrow inline-flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-violet-500" />Support</div>
            <p className="dashboard-card-title mt-3">Need direct help?</p>
            <p className="dashboard-body mt-2">
              Email <span className="font-semibold text-slate-900">support@omniweb.ai</span> for setup assistance, troubleshooting, or account questions.
            </p>
          </div>
          <Link
            href="mailto:support@omniweb.ai"
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-[14px] font-semibold text-white transition hover:bg-slate-800"
          >
            <Mail className="mr-2 h-4 w-4" />Contact support
          </Link>
        </div>
      </DashboardCard>
    </div>
  )
}