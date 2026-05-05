"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  BarChart3,
  Bot,
  Brain,
  Code2,
  ChevronUp,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Phone,
  Settings,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react"
import { DashboardThemeToggle } from "@/components/saas/dashboard-theme-toggle"
import { OmniwebLogo } from "@/components/brand-logo"
import type { TenantStatus } from "@/lib/saas/types"

const DESKTOP_SIDEBAR_WIDTH = 240

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, aliases: [] },
  { href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot, aliases: [] },
  { href: "/dashboard/widget-install", label: "Widget Install", icon: Code2, aliases: [] },
  { href: "/dashboard/ai-telephony", label: "AI Telephony", icon: Phone, aliases: [] },
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

function getPageDescription(pathname: string) {
  if (pathname === "/dashboard") return "See launch readiness, workspace health, and the next highest-impact actions in one place."
  if (pathname.startsWith("/dashboard/ai-agent")) return "Configure, test, and install your AI widget from one guided setup flow."
  if (pathname.startsWith("/dashboard/widget-install")) return "Copy your tenant script, verify allowed domains, and validate live install status for omniweb.ai."
  if (pathname.startsWith("/dashboard/ai-telephony")) return "Manage voice routing, escalation paths, and call experience settings for AI telephony."
  if (pathname.startsWith("/dashboard/knowledge")) return "Control website sources, widget readiness, and the content the assistant can use."
  if (pathname.startsWith("/dashboard/billing") || pathname.startsWith("/dashboard/pricing")) return "Track plan status, trial timing, and subscription controls for the workspace."
  if (pathname.startsWith("/dashboard/analytics")) return "Review engagement performance, lead quality, and conversion signals as traffic arrives."
  if (pathname.startsWith("/dashboard/profile")) return "Update workspace identity, business details, and the website tied to this tenant."
  if (pathname.startsWith("/dashboard/settings")) return "Manage account-level preferences and operational controls for the dashboard."
  return "Manage your Omniweb workspace from one consistent control surface."
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
  const activeNavItem = useMemo(
    () => navItems.find((item) => isPathActive(pathname, item.href, item.aliases)) ?? navItems[0],
    [pathname],
  )
  const pageDescription = useMemo(() => getPageDescription(pathname), [pathname])

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
    <div className="dashboard-theme min-h-dvh lg:h-screen lg:overflow-hidden">
      <aside
        className="dashboard-sidebar-surface border-b backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r"
        style={{ width: `min(100vw, ${DESKTOP_SIDEBAR_WIDTH}px)` }}
      >
        <div className="flex min-h-full flex-col px-4 py-4 lg:px-5 lg:py-6">
          <OmniwebLogo
            href="/dashboard"
            className="rounded-2xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
            textClassName="text-[17px] font-semibold tracking-tight text-cyan-200"
            sublabel="AI Assistant"
            sublabelClassName="dashboard-meta mt-0.5 truncate"
          />

          <nav className="mt-7 flex flex-1 gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const active = isPathActive(pathname, item.href, item.aliases)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${active ? "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]" : "text-slate-600 hover:bg-[#0f1b35] hover:text-white"}`}
                >
                  <item.icon className={`h-[18px] w-[18px] ${active ? "text-cyan-300" : "text-slate-500"}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200/70 pt-4">
            <div ref={accountContainerRef} className="relative">
              <div
                id={accountMenuId}
                role="menu"
                aria-hidden={!accountMenuOpen}
                className={`absolute inset-x-0 bottom-full mb-3 origin-bottom rounded-2xl border border-slate-200/80 bg-white/98 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur transition duration-200 ${accountMenuOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"}`}
              >
                <div className="dashboard-card-muted mb-2 rounded-xl px-3 py-3">
                  <p className="truncate text-[14px] font-semibold text-slate-900">{displayName}</p>
                  <p className="dashboard-meta truncate">{email}</p>
                  <p className="mt-2 inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">{planLabel}</p>
                </div>

                <div className="space-y-1">
                  {accountMenuItems.map((item) => {
                    const active = isPathActive(pathname, item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        tabIndex={accountMenuOpen ? 0 : -1}
                        onClick={() => setAccountMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
                      >
                        <item.icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                        {item.href === "/dashboard/billing" ? <CreditCard className="ml-auto h-4 w-4 opacity-60" /> : null}
                      </Link>
                    )
                  })}
                </div>

                <div className="my-2">
                  <DashboardThemeToggle />
                </div>

                <div className="my-2 h-px bg-slate-200" />

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={accountMenuOpen ? 0 : -1}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2.5 text-left shadow-[0_8px_18px_rgba(148,163,184,0.10)] transition hover:border-cyan-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#4f46e5] via-[#2563eb] to-[#22d3ee] text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]">
                  {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-slate-900">{displayName}</p>
                  <p className="dashboard-meta truncate">{email}</p>
                </div>
                <ChevronUp className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${accountMenuOpen ? "rotate-0" : "rotate-180"}`} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-dvh lg:ml-[240px] lg:h-screen lg:overflow-y-auto">
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="dashboard-eyebrow">{activeNavItem.label}</p>
                <h1 className="dashboard-page-title mt-3">{status.businessName || "Your Omniweb workspace"}</h1>
                <p className="dashboard-body mt-2 max-w-3xl">{pageDescription}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 self-start sm:self-end sm:justify-end">
                <Link
                  href="/dashboard/billing"
                  className="dashboard-secondary-button inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-semibold transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
                >
                  Billing
                </Link>
              </div>
            </header>

            {status.subscriptionStatus === "trialing" ? (
              <div className="dashboard-card-highlight flex flex-col gap-4 rounded-[20px] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">
                <div className="min-w-0">
                  <p className="dashboard-card-title">Your 7-day free trial is active</p>
                  <p className="dashboard-body mt-1">You have {status.daysLeft ?? 7} day{status.daysLeft === 1 ? "" : "s"} left in your free trial.</p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="dashboard-primary-button inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-semibold transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
                >
                  Upgrade plan
                </Link>
              </div>
            ) : null}

            {status.subscriptionStatus === "expired" ? (
              <div className="flex flex-col gap-4 rounded-[20px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900 shadow-[0_8px_24px_rgba(245,158,11,0.10)] sm:flex-row sm:items-center sm:justify-between lg:px-7">
                <div>
                  <p className="dashboard-card-title text-amber-950">Trial expired</p>
                  <p className="dashboard-body text-amber-900/80">Your data is safe, but AI features stay locked until you upgrade.</p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-[14px] font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50"
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
