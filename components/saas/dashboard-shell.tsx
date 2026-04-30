"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton, UserButton } from "@clerk/nextjs"
import { BarChart3, Bot, Brain, CircleHelp, LogOut, Phone, Settings, Sparkles, TestTube2, UserRound, Wallet } from "lucide-react"
import type { TenantStatus } from "@/lib/saas/types"

const navItems = [
  { href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot },
  { href: "/dashboard/ai-telephony", label: "AI Telephony", icon: Phone },
  { href: "/dashboard/test-console", label: "Test Console", icon: TestTube2 },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: Brain },
  { href: "/dashboard/billing", label: "Billing", icon: Wallet },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
]

const bottomNavItems = [
  { href: "/dashboard/help", label: "Help", icon: CircleHelp },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

type DashboardShellProps = {
  status: TenantStatus
  children: React.ReactNode
}

export function DashboardShell({ status, children }: DashboardShellProps) {
  const pathname = usePathname()
  const profileLabel = status.firstName || status.email || "Omniweb user"
  const initials = profileLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("") || "OW"
  const planLabel = status.subscriptionStatus === "expired"
    ? "Expired"
    : status.subscriptionStatus === "trialing"
      ? "Trial"
      : status.plan === "business"
        ? "Business"
        : status.plan === "standard"
          ? "Standard"
          : "Starter"
  const isBottomActive = (href: string) => pathname === href
  const isMainActive = (href: string) => pathname === href

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_52%,#f8fbff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="flex flex-col border-b border-slate-200/80 bg-white/75 px-4 py-5 backdrop-blur lg:min-h-dvh lg:w-[285px] lg:border-b-0 lg:border-r lg:px-5">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-3xl px-2 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#2563eb] to-[#22d3ee] text-white shadow-[0_14px_36px_rgba(79,70,229,0.28)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Omniweb</p>
              <p className="text-xs text-slate-500">{status.businessName || status.email || "Workspace"}</p>
            </div>
          </Link>

          <nav className="mt-6 flex flex-1 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const active = isMainActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-400"}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-slate-200/80 pt-4">
            <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(240,249,255,0.92),rgba(238,242,255,0.92))] px-3 py-3 shadow-[0_10px_22px_rgba(148,163,184,0.12)] transition hover:border-cyan-200 hover:bg-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#2563eb] to-[#22d3ee] text-sm font-semibold text-white shadow-[0_10px_22px_rgba(79,70,229,0.22)]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{profileLabel}</p>
                <p className="truncate text-xs text-slate-500">{status.email || "No email available"}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{planLabel}</p>
              </div>
            </Link>

            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {bottomNavItems.map((item) => {
                const active = isBottomActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-400"}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</p>
                <p className="mt-1 text-sm text-slate-700">Manage profile, settings, and workspace access.</p>
              </div>
              <UserButton />
            </div>

            <SignOutButton>
              <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900">
                <LogOut className="h-4 w-4 text-slate-400" />
                <span>Logout</span>
              </button>
            </SignOutButton>
          </div>
        </aside>

        <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-6xl space-y-5">
            <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/75 px-5 py-5 shadow-[0_18px_44px_rgba(148,163,184,0.14)] backdrop-blur sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div>
                <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Omniweb SaaS</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{status.businessName || "Your AI workspace"}</h1>
                <p className="mt-2 text-sm text-slate-600">Manage onboarding, trial access, AI setup, and the website widget from one place.</p>
              </div>
              <div className="flex items-center gap-3 self-start">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right text-sm">
                  <p className="font-medium text-slate-900">{status.subscriptionStatus === "active" ? "Active plan" : status.subscriptionStatus === "expired" ? "Billing required" : "Free trial"}</p>
                  <p className="text-slate-500">{status.subscriptionStatus === "active" ? (status.subscriptionEndsAt ? `Renews ${new Date(status.subscriptionEndsAt).toLocaleDateString()}` : "Subscription active") : status.daysLeft !== null ? `${status.daysLeft} day${status.daysLeft === 1 ? "" : "s"} left` : "Complete onboarding"}</p>
                </div>
                <UserButton />
              </div>
            </header>

            {status.subscriptionStatus === "trialing" ? (
              <div className="flex flex-col gap-3 rounded-[1.75rem] border border-cyan-200 bg-[linear-gradient(90deg,rgba(14,165,233,0.12),rgba(99,102,241,0.12))] px-5 py-4 shadow-[0_16px_32px_rgba(125,211,252,0.14)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Your 7-day free trial is active</p>
                  <p className="text-sm text-slate-600">You have {status.daysLeft ?? 7} day{status.daysLeft === 1 ? "" : "s"} left in your free trial.</p>
                </div>
                <Link href="/dashboard/billing" className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.25)] transition hover:from-cyan-400 hover:to-purple-400">
                  Upgrade plan
                </Link>
              </div>
            ) : null}

            {status.subscriptionStatus === "expired" ? (
              <div className="flex flex-col gap-3 rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-[0_12px_24px_rgba(245,158,11,0.12)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Trial expired</p>
                  <p className="text-amber-800/80">Your data is safe, but AI features stay locked until you upgrade.</p>
                </div>
                <Link href="/dashboard/billing" className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 font-semibold text-white transition hover:bg-slate-800">
                  Open billing
                </Link>
              </div>
            ) : null}

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
