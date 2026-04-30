import Link from "next/link"
import { requireTrialExpiredAccess } from "@/lib/saas/guards"

export default async function TrialExpiredPage() {
  const status = await requireTrialExpiredAccess()

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.12),transparent_35%),linear-gradient(180deg,#fffaf0_0%,#fff7ed_52%,#ffffff_100%)] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(251,191,36,0.12)] backdrop-blur">
        <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Trial expired</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Your free trial has ended.</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Your workspace and AI configuration are safe and ready to resume. Upgrade when you’re ready to unlock AI Agent, Test Console, Knowledge, and Analytics again.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Workspace</p>
            <p className="mt-2 text-sm text-slate-600">{status.businessName || "Omniweb workspace"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Plan</p>
            <p className="mt-2 text-sm text-slate-600">Starter trial</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Status</p>
            <p className="mt-2 text-sm text-slate-600">Expired — upgrade to reactivate</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.25)] transition hover:from-cyan-400 hover:to-purple-400">
            Upgrade plan
          </Link>
          <Link href="/dashboard/billing" className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            Open billing
          </Link>
        </div>
      </div>
    </div>
  )
}
