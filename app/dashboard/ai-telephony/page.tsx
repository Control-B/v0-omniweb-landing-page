import { Phone, ShieldCheck, Sparkles } from "lucide-react"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardTelephonyPage() {
  await requireDashboardAccess()

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><Phone className="h-4 w-4 text-cyan-500" />AI Telephony</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Voice routing placeholder</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">This is ready for the next step: assigning a phone number, escalation target, and call workflows. The page is live now so the dashboard route structure is stable before Stripe and telephony provisioning are added.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Phone number</p>
            <p className="mt-2 text-sm text-slate-600">Not assigned yet</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Escalation</p>
            <p className="mt-2 text-sm text-slate-600">Will route to human fallback later</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="h-4 w-4 text-emerald-500" />What’s coming next</div>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Provision AI phone number</li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Transfer logic and voicemail fallback</li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Call analytics and recordings</li>
        </ul>
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-4 py-4 text-sm font-medium text-white shadow-[0_14px_32px_rgba(59,130,246,0.25)]">
          <Sparkles className="mr-2 inline h-4 w-4" />Telephony hooks can plug into this workspace after the core SaaS trial flow is stable.
        </div>
      </section>
    </div>
  )
}
