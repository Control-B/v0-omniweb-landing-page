"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navItems, isRouteActive, primaryCtas } from "@/lib/site-navigation"
import { OmniwebLogo } from "@/components/brand-logo"
import { dispatchAssistantOpen } from "@/lib/assistant-events"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenSection(null)
  }, [pathname])

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
        <OmniwebLogo />

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
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isRouteActive(pathname, item.href)
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-foreground/75 hover:bg-white/5 hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180" />
              </Link>

              {/* Desktop Mega Menu Dropdown */}
              <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="w-[620px] rounded-3xl border border-white/15 bg-[#050a12]/95 p-6 shadow-2xl backdrop-blur-2xl">
                  <div className="grid grid-cols-2 gap-3">
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="group/item flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
                      >
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover/item:scale-105", subItem.iconChipClassName)}>
                          <subItem.icon className={cn("h-5 w-5", subItem.iconClassName)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-white group-hover/item:text-cyan-300">
                              {subItem.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {subItem.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Dropdown Footer CTA */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                    <span className="text-slate-400 font-medium">Ready to explore {item.label}?</span>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>Explore all {item.label.toLowerCase()}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full text-foreground/75 hover:bg-white/10 hover:text-foreground"
          >
            <a href="tel:+18666233331">
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

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-foreground/80 transition-colors hover:text-foreground lg:hidden"
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen)
            setOpenSection(null)
          }}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <Menu className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-[#050a12] px-4 py-5 shadow-2xl lg:hidden">
          <nav className="mx-auto max-w-lg space-y-2.5">
            {navItems.map((item) => {
              const isOpen = openSection === item.label
              const hasSubItems = Boolean(item.items && item.items.length > 0)

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] transition overflow-hidden"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.04]"
                    onClick={() => {
                      if (hasSubItems) {
                        setOpenSection(isOpen ? null : item.label)
                      } else {
                        setMobileMenuOpen(false)
                      }
                    }}
                  >
                    <span
                      className={cn(
                        "text-base font-semibold transition-colors",
                        isRouteActive(pathname, item.href) ? "text-cyan-400" : "text-white",
                      )}
                    >
                      {item.label}
                    </span>
                    {hasSubItems && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70">
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180 text-cyan-400" : "rotate-0")} />
                      </div>
                    )}
                  </button>

                  {/* Expanded Submenu on Tap */}
                  {hasSubItems && isOpen && (
                    <div className="border-t border-white/10 bg-black/40 px-3.5 py-3 space-y-2">
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                      >
                        <span>Explore All {item.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {item.items?.map((subItem) => (
                          <Link
                            key={`${subItem.href}-${subItem.label}`}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                          >
                            <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", subItem.iconChipClassName)}>
                              <subItem.icon className={cn("h-4 w-4", subItem.iconClassName)} />
                            </span>
                            <span className="font-medium text-sm text-slate-200">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Clean Mobile Bottom CTAs */}
            <div className="mt-6 border-t border-white/10 pt-5 space-y-3">
              <Button
                size="lg"
                asChild
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-base font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-purple-400 h-12"
              >
                <Link href="/get-started" onClick={() => setMobileMenuOpen(false)}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-11 rounded-xl border-white/15 bg-white/5 text-sm sm:text-base font-semibold text-white hover:bg-white/10"
                >
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-11 rounded-xl border-white/15 bg-white/5 text-sm sm:text-base font-semibold text-white hover:bg-white/10"
                >
                  <a href="tel:+18666233331">Call Us</a>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
