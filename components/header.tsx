"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navItems, isRouteActive, primaryCtas } from "@/lib/site-navigation"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(navItems[0]?.label ?? null)
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
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-sm font-semibold text-cyan-200">
            O
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
                  isRouteActive(pathname, item.href)
                    ? "bg-white/10 text-white"
                    : "text-foreground/70 hover:bg-white/5 hover:text-foreground",
                )}
              >
                {item.label}
                {item.items?.length ? <ChevronDown className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" /> : null}
              </Link>
              {item.items?.length ? (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-[64rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-4 opacity-0 transition group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
                  <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#08101b]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="grid grid-cols-[1.2fr_0.8fr]">
                      <div className="border-r border-white/10 p-3">
                        <div className="grid max-h-[32rem] gap-2 overflow-y-auto p-1 lg:grid-cols-2">
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
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 rounded-full text-foreground/75 hover:bg-white/10 hover:text-foreground"
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
        <div className="absolute left-0 right-0 top-16 border-b border-border/40 bg-[#050a12]/95 backdrop-blur-xl lg:hidden">
          <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-4">
            {navItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.02] transition hover:bg-white/[0.04]">
                <div className="flex items-center gap-2 px-4 py-3">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex-1 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors",
                      isRouteActive(pathname, item.href) ? "bg-white/8 text-white" : "text-foreground/80 hover:text-foreground",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                    onClick={() => setOpenSection((current) => (current === item.label ? null : item.label))}
                    aria-label={`Toggle ${item.label} submenu`}
                  >
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openSection === item.label ? "rotate-180" : "rotate-0")} />
                  </button>
                </div>
                {item.items?.length && openSection === item.label ? (
                  <div className="space-y-1 px-4 pb-4">
                    {item.items.map((subItem) => (
                      <Link
                        key={`${subItem.href}-${subItem.label}`}
                        href={subItem.href}
                        className="flex items-start gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={cn("mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border", subItem.iconChipClassName)}>
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
            <div className="mt-4 border-t border-border/40 pt-4">
              <div className="grid grid-cols-2 gap-2">
                {primaryCtas.map((cta) => (
                  <Button key={cta.label} variant="outline" size="sm" asChild className="justify-center border-white/15 bg-white/5 text-white hover:bg-white/10">
                    <Link href={cta.href} onClick={() => setMobileMenuOpen(false)}>
                      {cta.label}
                    </Link>
                  </Button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild className="justify-center border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="justify-center border-white/15 bg-white/5 text-white hover:bg-white/10">
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
