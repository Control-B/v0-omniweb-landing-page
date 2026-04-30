"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  BarChart3,
  Bot,
  Brain,
  ChevronUp,
  CircleHelp,
  CreditCard,
  LogOut,
  Phone,
  Settings,
  Sparkles,
  TestTube2,
  UserRound,
  Wallet,
} from "lucide-react"
import type { TenantStatus } from "@/lib/saas/types"

const DESKTOP_SIDEBAR_WIDTH = 285

const navItems = [
  { href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot, aliases: [] },
  { href: "/dashboard/ai-telephony", label: "AI Telephony", icon: Phone, aliases: [] },
  { href: "/dashboard/test-console", label: "Test Console", icon: TestTube2, aliases: [] },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: Brain, aliases: [] },
  { href: "/dashboard/billing", label: "Billing", icon: Wallet, aliases: ["/dashboard/pricing"] },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, aliases: [] },
] as const

const accountMenuItems = [
  { href: "/dashboard/billing", label: "Upgrade plan", icon: Sparkles },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help", icon: CircleHelp },
] as const

type DashboardShellProps = {
  status: TenantStatus
  children: React.ReactNode
}

function deriveInitials(value: string | null | undefined) {
  if (!value) return "OW"

  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("")

  return initials || value.slice(0, 2).toUpperCase() || "OW"
}

function getPlanLabel(status: TenantStatus) {
  if (!status.subscriptionStatus) return "Free trial"
  if (status.subscriptionStatus === "expired") return "Expired"
  if (status.subscriptionStatus === "canceled") return "Canceled"
  if (status.subscriptionStatus === "trialing") {
    return status.daysLeft !== null ? `Trial · ${status.daysLeft}d left` : "Trial"
  }
  if (status.plan === "business") return "Business"
  if (status.plan === "standard") return "Standard"
  return "Starter"
}

function isPathActive(pathname: string, href: string, aliases: readonly string[] = []) {
  if (pathname === href) return true
  if (href !== "/dashboard" && pathname.startsWith(`${href}/`)) return true
  return aliases.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`))
}

export function DashboardShell({ status, children }: DashboardShellProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountContainerRef = useRef<HTMLDivElement | null>(null)

  const displayName = useMemo(() => {
    return user?.fullName || user?.username || user?.firstName || status.firstName || status.email?.split("@")[0] || "Omniweb user"
  }, [status.email, status.firstName, user?.firstName, user?.fullName, user?.username])

  const email = user?.primaryEmailAddress?.emailAddress || status.email || "No email available"
  const avatarUrl = user?.imageUrl || null
  const initials = deriveInitials(displayName)
  const planLabel = getPlanLabel(status)
  const accountMenuId = "dashboard-account-menu"

  useEffect(() => {
    setAccountMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!accountMenuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (target && accountContainerRef.current && !accountContainerRef.current.contains(target)) {
        setAccountMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [accountMenuOpen])

  const handleLogout = async () => {
    setAccountMenuOpen(false)
    fetch("/auth/signout", { method: "POST", redirect: "manual" }).catch(() => {})
    await signOut({ redirectUrl: "/" })
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_52%,#f8fbff_100%)] text-slate-900 lg:h-screen lg:overflow-hidden">
      <aside
        className="border-b border-slate-200/80 bg-white/80 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:h-screen lg:border-b-0 lg:border-r lg:overflow-y-auto"
        style={{ width: `min(100vw, ${DESKTOP_SIDEBAR_WIDTH}px)` }}
      >
        <div className="flex min-h-full flex-col px-4 py-5 lg:px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-3xl px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#2563eb] to-[#22d3ee] text-white shadow-[0_14px_36px_rgba(79,70,229,0.28)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Omniweb</p>
              <p className="text-xs text-slate-500">{status.businessName || email || "Workspace"}</p>
            </div>
          </Link>

          <nav className="mt-6 flex flex-1 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const active = isPathActive(pathname, item.href, item.aliases)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${active ? "bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-sky-500"}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200/80 pt-4">
            <div ref={accountContainerRef} className="relative">
              <div
                id={accountMenuId}
                role="menu"
                aria-hidden={!accountMenuOpen}
                className={`absolute inset-x-0 bottom-full mb-3 origin-bottom rounded-[1.6rem] border border-slate-200/80 bg-white/96 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur transition duration-200 ${accountMenuOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"}`}
              >
                <div className="mb-2 rounded-[1.2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(240,249,255,0.98),rgba(238,242,255,0.98))] px-3 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">{email}</p>
                  <p className="mt-2 inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">{planLabel}</p>
                </div>

                <div className="space-y-1.5">
                  {accountMenuItems.map((item) => {
                    const active = isPathActive(pathname, item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        tabIndex={accountMenuOpen ? 0 : -1}
                        onClick={() => setAccountMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
                      >
                        <item.icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-sky-500"}`} />
                        <span>{item.label}</span>
                        {item.href === "/dashboard/billing" ? <CreditCard className="ml-auto h-4 w-4 opacity-70" /> : null}
                      </Link>
                    )
                  })}
                </div>

                <div className="my-2 h-px bg-slate-200" />

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={accountMenuOpen ? 0 : -1}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>

              <button
                type="button"
                aria-expanded={accountMenuOpen}
                aria-controls={accountMenuId}
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="flex w-full items-center gap-3 rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(240,249,255,0.92),rgba(238,242,255,0.92))] px-3 py-3 text-left shadow-[0_10px_22px_rgba(148,163,184,0.12)] transition hover:border-cyan-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#2563eb] to-[#22d3ee] text-sm font-semibold text-white shadow-[0_10px_22px_rgba(79,70,229,0.22)]">
                  {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">{email}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{planLabel}</p>
                </div>
                <ChevronUp className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${accountMenuOpen ? "rotate-0" : "rotate-180"}`} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-dvh lg:ml-[285px] lg:h-screen lg:overflow-y-auto">
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-6xl space-y-5">
            <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/75 px-5 py-5 shadow-[0_18px_44px_rgba(148,163,184,0.14)] backdrop-blur sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div>
                <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Omniweb SaaS</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{status.businessName || "Your AI workspace"}</h1>
                <p className="mt-2 text-sm text-slate-600">Manage onboarding, trial access, AI setup, and the website widget from one place.</p>
              </div>
              <div className="flex items-center gap-3 self-start">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right text-sm">
                  <p className="font-medium text-slate-900">
                    {status.subscriptionStatus === "active"
                      ? "Active plan"
                      : status.subscriptionStatus === "expired"
                        ? "Billing required"
                        : "Free trial"}
                  </p>
                  <p className="text-slate-500">
                    {status.subscriptionStatus === "active"
                      ? status.subscriptionEndsAt
                        ? `Renews ${new Date(status.subscriptionEndsAt).toLocaleDateString()}`
                        : "Subscription active"
                      : status.daysLeft !== null
                        ? `${status.daysLeft} day${status.daysLeft === 1 ? "" : "s"} left`
                        : "Complete onboarding"}
                  </p>
                </div>
              </div>
            </header>

            {status.subscriptionStatus === "trialing" ? (
              <div className="flex flex-col gap-3 rounded-[1.75rem] border border-cyan-200 bg-[linear-gradient(90deg,rgba(14,165,233,0.12),rgba(99,102,241,0.12))] px-5 py-4 shadow-[0_16px_32px_rgba(125,211,252,0.14)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Your 7-day free trial is active</p>
                  <p className="text-sm text-slate-600">You have {status.daysLeft ?? 7} day{status.daysLeft === 1 ? "" : "s"} left in your free trial.</p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.25)] transition hover:from-cyan-400 hover:to-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
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
                <Link
                  href="/dashboard/billing"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50"
                >
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
