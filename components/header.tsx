"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  Phone,
  Menu,
  X,
  Briefcase,
  Bot,
  BookOpen,
  Video,
  Wallet,
  LayoutTemplate,
  Building2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavSubItem = {
  label: string
  href: string
  description: string
  icon: LucideIcon
  iconClassName?: string
  iconChipClassName?: string
}

type NavItem = {
  label: string
  href: string
  items: NavSubItem[]
  preview: {
    eyebrow: string
    title: string
    description: string
    href: string
    image?: string
    contentClassName?: string
    mediaClassName?: string
  }
}

const navItems: NavItem[] = [
  {
    label: "Features",
    href: "/features",
    items: [
      {
        label: "AI voice agents",
        href: "/features#voice-agents",
        description: "AI-powered voice agents that answer, qualify, and book while your team focuses on closing.",
        icon: LayoutTemplate,
        iconClassName: "text-fuchsia-200",
        iconChipClassName: "border-fuchsia-500/35 bg-gradient-to-br from-fuchsia-500/22 to-purple-500/18 shadow-[0_12px_30px_rgba(217,70,239,0.18)]",
      },
      {
        label: "AI chat assistants",
        href: "/features#chat-assistants",
        description: "Always-on chat that handles objections, captures context, and routes high-intent buyers instantly.",
        icon: Video,
        iconClassName: "text-pink-200",
        iconChipClassName: "border-pink-500/35 bg-gradient-to-br from-pink-500/22 to-rose-500/18 shadow-[0_12px_30px_rgba(236,72,153,0.18)]",
      },
      {
        label: "Lead automation",
        href: "/features#lead-automation",
        description: "Push qualified leads into your CRM, trigger follow-up, and keep reps focused on real opportunities.",
        icon: Briefcase,
        iconClassName: "text-orange-200",
        iconChipClassName: "border-orange-500/35 bg-gradient-to-br from-orange-500/22 to-amber-500/18 shadow-[0_12px_30px_rgba(249,115,22,0.18)]",
      },
    ],
    preview: {
      eyebrow: "Core platform",
      title: "Sell with voice, chat, qualification, and workflow automation",
      description: "Explore the Omniweb capabilities that turn AI into a revenue engine for your business.",
      href: "/features",
      image: "/images/generated/templates-showcase.png",
    },
  },
  {
    label: "Solutions",
    href: "/solutions",
    items: [
      {
        label: "Vertical playbooks",
        href: "/solutions#industry-solutions",
        description: "Revenue-focused AI journeys for Shopify brands, contractors, clinics, law firms, and service businesses.",
        icon: Briefcase,
        iconClassName: "text-sky-200",
        iconChipClassName: "border-sky-500/35 bg-gradient-to-br from-sky-500/22 to-indigo-500/20 shadow-[0_12px_30px_rgba(56,189,248,0.18)]",
      },
      {
        label: "AI workflows",
        href: "/solutions#how-it-works",
        description: "See how voice, chat, qualification, and automation work together from first contact to booked call.",
        icon: Bot,
        iconClassName: "text-cyan-200",
        iconChipClassName: "border-cyan-500/35 bg-gradient-to-br from-cyan-500/22 to-blue-500/20 shadow-[0_12px_30px_rgba(34,211,238,0.18)]",
      },
      {
        label: "Expected outcomes",
        href: "/solutions#results",
        description: "Explore the pipeline lift, response speed, and revenue outcomes businesses can expect from AI-first systems.",
        icon: ArrowRight,
        iconClassName: "text-violet-200",
        iconChipClassName: "border-violet-500/35 bg-gradient-to-br from-violet-500/22 to-fuchsia-500/20 shadow-[0_12px_30px_rgba(139,92,246,0.2)]",
      },
    ],
    preview: {
      eyebrow: "Featured",
      title: "AI systems tailored to how your business actually sells",
      description: "Explore verticalized service journeys that turn traffic into qualified leads, booked calls, and automated follow-up.",
      href: "/solutions",
      image: "/images/generated/solutions-ecommerce.png",
      contentClassName: "bottom-0 max-w-[88%] -translate-y-4 px-6 pb-2 pt-0",
      mediaClassName: "h-[17rem] w-full aspect-auto",
    },
  },
  {
    label: "Resources",
    href: "/resources",
    items: [
      {
        label: "Demo library",
        href: "/resources#library",
        description: "Browse demo videos, AI playbooks, case studies, and launch resources for revenue-focused deployments.",
        icon: BookOpen,
        iconClassName: "text-purple-200",
        iconChipClassName: "border-purple-500/35 bg-gradient-to-br from-purple-500/22 to-pink-500/18 shadow-[0_12px_30px_rgba(168,85,247,0.18)]",
      },
      {
        label: "Case studies",
        href: "/resources#articles",
        description: "See how AI assistants, qualification flows, and automations improve conversion and response times.",
        icon: Video,
        iconClassName: "text-rose-200",
        iconChipClassName: "border-rose-500/35 bg-gradient-to-br from-rose-500/22 to-orange-500/18 shadow-[0_12px_30px_rgba(244,63,94,0.18)]",
      },
      {
        label: "AI playbooks",
        href: "/resources#videos",
        description: "Get battle-tested scripts, flows, and rollout ideas for AI voice, chat, and onboarding.",
        icon: Bot,
        iconClassName: "text-blue-200",
        iconChipClassName: "border-blue-500/35 bg-gradient-to-br from-blue-500/22 to-cyan-500/18 shadow-[0_12px_30px_rgba(59,130,246,0.18)]",
      },
    ],
    preview: {
      eyebrow: "Spotlight",
      title: "Learn the system before you book a call",
      description: "Use videos, case studies, and playbooks to understand how Omniweb drives sales, lead qualification, and automation.",
      href: "/resources",
      image: "/images/generated/resources-knowledge-hub.png",
    },
  },
  {
    label: "Pricing",
    href: "/pricing",
    items: [
      {
        label: "Starter / Growth / Scale",
        href: "/pricing#plans",
        description: "Compare outcome-driven plans built around AI minutes, active agents, and onboarding support.",
        icon: Wallet,
        iconClassName: "text-emerald-200",
        iconChipClassName: "border-emerald-500/35 bg-gradient-to-br from-emerald-500/22 to-teal-500/18 shadow-[0_12px_30px_rgba(16,185,129,0.18)]",
      },
      {
        label: "Outcome comparison",
        href: "/pricing#plans",
        description: "See which plan best fits lead volume, automation complexity, and sales coverage.",
        icon: Bot,
        iconClassName: "text-indigo-200",
        iconChipClassName: "border-indigo-500/35 bg-gradient-to-br from-indigo-500/22 to-blue-500/18 shadow-[0_12px_30px_rgba(99,102,241,0.18)]",
      },
      {
        label: "Buying questions",
        href: "/pricing#faq",
        description: "Get clear answers around onboarding, usage, agent setup, and subscription growth.",
        icon: BookOpen,
        iconClassName: "text-amber-200",
        iconChipClassName: "border-amber-500/35 bg-gradient-to-br from-amber-500/22 to-orange-500/18 shadow-[0_12px_30px_rgba(245,158,11,0.18)]",
      },
    ],
    preview: {
      eyebrow: "Plan smarter",
      title: "Pricing built around outcomes, not software clutter",
      description: "Position value around qualified leads, handled conversations, and faster follow-up instead of random feature lists.",
      href: "/pricing",
      image: "/images/generated/pricing-growth-dashboard.png",
    },
  },
  {
    label: "Company",
    href: "/company",
    items: [
      {
        label: "Mission",
        href: "/company#mission",
        description: "Understand the company vision behind Omniweb and the market problem it solves.",
        icon: Building2,
        iconClassName: "text-cyan-200",
        iconChipClassName: "border-cyan-500/35 bg-gradient-to-br from-cyan-500/22 to-sky-500/18 shadow-[0_12px_30px_rgba(34,211,238,0.18)]",
      },
      {
        label: "The Team",
        href: "/company#careers",
        description: "Meet the people, culture, and operating principles behind the product.",
        icon: Bot,
        iconClassName: "text-purple-200",
        iconChipClassName: "border-purple-500/35 bg-gradient-to-br from-purple-500/22 to-indigo-500/18 shadow-[0_12px_30px_rgba(168,85,247,0.18)]",
      },
      {
        label: "Contact",
        href: "/company#contact",
        description: "Reach support, sales, partnerships, or press from a single company hub.",
        icon: Phone,
        iconClassName: "text-green-200",
        iconChipClassName: "border-green-500/35 bg-gradient-to-br from-green-500/22 to-emerald-500/18 shadow-[0_12px_30px_rgba(34,197,94,0.18)]",
      },
    ],
    preview: {
      eyebrow: "Behind the product",
      title: "Meet the team building AI systems that drive revenue",
      description: "Learn the vision behind Omniweb and how we help businesses automate conversations, qualification, and follow-up.",
      href: "/company",
      image: "/images/generated/company-innovation-team.png",
    },
  },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const currentSection = useMemo(() => pathname?.split("#")[0] ?? "/", [pathname])
  const isHome = currentSection === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 transition-colors duration-300",
        isHome && !scrolled
          ? "bg-transparent"
          : "bg-[#050a12]/70 backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 6L9 18h6.5L14.5 26 23 14h-6.5L17.5 6z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg>
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Omniweb
          </span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 lg:flex">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="group relative"
            >
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  currentSection === item.href
                    ? "bg-white/10 text-white"
                    : "text-foreground/70 hover:bg-white/5 hover:text-foreground",
                )}
              >
                {item.label}
                {item.items?.length ? <ChevronDown className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" /> : null}
              </Link>
              {item.items?.length ? (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-[52rem] -translate-x-1/2 pt-4 opacity-0 transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
                  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#08101b]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="grid grid-cols-[1.2fr_0.8fr]">
                      <div className="border-r border-white/10 p-3">
                        <div className="grid gap-2 p-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={`${subItem.href}-${subItem.label}`}
                              href={subItem.href}
                              className="group/item flex items-start gap-4 rounded-[1.35rem] px-4 py-4 text-left transition hover:bg-white/5"
                            >
                              <span className={cn(
                                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition group-hover/item:scale-[1.03]",
                                subItem.iconChipClassName,
                              )}>
                                <subItem.icon className={cn("h-5 w-5", subItem.iconClassName)} />
                              </span>
                              <span className="min-w-0">
                                <span className="block bg-gradient-to-r from-blue-200 via-slate-100 to-purple-200 bg-clip-text text-base font-medium text-transparent transition group-hover/item:from-cyan-200 group-hover/item:via-blue-200 group-hover/item:to-purple-200">
                                  {subItem.label}
                                </span>
                                <span className="mt-1 block text-sm leading-6 text-white/45">
                                  {subItem.description}
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="relative flex flex-col justify-between bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_30%)]" />
                        <div className="relative z-10 overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/25 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                          <div className={cn("relative w-full aspect-[4/3]", item.preview.mediaClassName)}>
                            {item.preview.image ? (
                              <Image
                                src={item.preview.image}
                                alt={item.preview.title}
                                fill
                                sizes="24rem"
                                className="object-cover"
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#07111e]/95 via-[#07111e]/25 to-transparent" />
                          </div>
                          <div className={cn("absolute inset-x-0 bottom-0 p-5", item.preview.contentClassName)}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                              {item.preview.eyebrow}
                            </p>
                            <h3 className="mt-2 bg-gradient-to-r from-blue-200 via-slate-100 to-purple-200 bg-clip-text text-xl font-semibold leading-tight text-transparent">
                              {item.preview.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-white/55">
                              {item.preview.description}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 mt-4">
                          <Link
                            href={item.preview.href}
                            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                          >
                            Explore {item.label}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full border-emerald-400/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)] transition-all hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-200 hover:shadow-[0_0_20px_rgba(52,211,153,0.25)]"
          >
            <Link href="/demo" className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span></span>
              Live Demo
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 rounded-full text-foreground/75 hover:bg-white/10 hover:text-foreground"
          >
            <a href="tel:+18664159494">
              Call Us
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full text-foreground/75 hover:bg-white/10 hover:text-foreground"
          >
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-400">
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="rounded-md p-2 text-foreground/80 transition-colors hover:text-foreground lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-border/40 bg-[#050a12]/95 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col px-4 py-4">
            {navItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-transparent transition hover:border-white/10 hover:bg-white/[0.03]">
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    currentSection === item.href ? "bg-white/8 text-white" : "text-foreground/80 hover:text-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.items?.length ? (
                  <div className="space-y-1 px-4 pb-3">
                    {item.items.map((subItem) => (
                      <Link
                        key={`${subItem.href}-${subItem.label}`}
                        href={subItem.href}
                        className="flex items-start gap-3 rounded-lg px-3 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={cn(
                          "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
                          subItem.iconChipClassName,
                        )}>
                          <subItem.icon className={cn("h-4 w-4", subItem.iconClassName)} />
                        </span>
                        <span>
                          <span className="block bg-gradient-to-r from-blue-200 via-slate-100 to-purple-200 bg-clip-text font-medium text-transparent">{subItem.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-white/40">{subItem.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4">
              <Button variant="outline" size="sm" asChild className="justify-start border-emerald-400/50 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20">
                <Link href="/demo" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span></span>
                  Live Demo
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="justify-start gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <a href="tel:+18664159494">
                  Call Us
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-400">
                <Link href="/get-started">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
