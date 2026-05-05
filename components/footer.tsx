import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { footerGroups } from "@/lib/site-navigation"
import { OmniwebLogo } from "@/components/brand-logo"
import { AssistantOpenButton } from "@/components/assistant-open-button"

// Custom X icon (formerly Twitter)
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: XIcon, href: "https://x.com", label: "X" },
]

interface FooterProps {
  variant?: "default" | "compact"
}

export function Footer({ variant = "default" }: FooterProps) {
  if (variant === "compact") {
    return (
      <footer className="border-t border-white/10 bg-[#050a12]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <OmniwebLogo className="gap-3" textClassName="text-sm font-semibold text-cyan-200" />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-white/40">© 2026 Omniweb</span>
            <a href="mailto:support@omniweb.ai" className="inline-flex items-center gap-2 transition hover:text-white">
              <Mail className="site-icon-accent h-4 w-4" />
              support@omniweb.ai
            </a>
            <Link href="/terms" className="transition hover:text-white">Terms of Use</Link>
            <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="/sms-consent" className="transition hover:text-white">SMS Consent</Link>
          </div>

          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-social-icon rounded-full p-2"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-white/10 bg-[#050a12]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        {/* Main grid: brand column + nav columns */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <OmniwebLogo textClassName="text-lg font-semibold text-cyan-200" />

            <p className="max-w-sm text-sm leading-7 text-white/55">
              AI voice agents, chat assistants, lead qualification, and workflow automation — built to help businesses close more revenue with less manual work.
            </p>

            <a href="mailto:support@omniweb.ai" className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-white">
              <Mail className="site-icon-accent h-4 w-4 shrink-0" />
              support@omniweb.ai
            </a>

            <div className="flex flex-wrap gap-2.5">
              <Button asChild size="sm" className="h-9 rounded-full px-5 text-sm">
                <Link href="/get-started">Get Started</Link>
              </Button>
              <AssistantOpenButton size="sm" variant="outline" className="h-9 rounded-full border-white/10 bg-white/5 px-5 text-sm text-white hover:bg-white/10">
                Try Live Demo
              </AssistantOpenButton>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-social-icon rounded-full p-2"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:grid-cols-5">
            {footerGroups.map((group) => (
              <div key={group.label}>
                <Link
                  href={group.href}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
                >
                  {group.label}
                </Link>
                <ul className="mt-4 space-y-2.5 text-sm text-white/50">
                  {group.links.slice(1).map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition hover:text-white/90">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm lg:px-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-white/35">© 2026 Omniweb. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/40">
            <Link href="/privacy" className="transition hover:text-white/80">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-white/80">Terms of Use</Link>
            <Link href="/sms-consent" className="transition hover:text-white/80">SMS Consent</Link>
            <Link href="/company/status" className="transition hover:text-white/80">System Status</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
