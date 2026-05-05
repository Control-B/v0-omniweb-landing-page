import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { footerGroups, primaryCtas } from "@/lib/site-navigation"

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
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xs font-semibold text-cyan-100">
              O
            </span>
            <span className="text-sm font-semibold text-white">Omniweb</span>
          </div>

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
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_1.9fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-sm font-semibold text-cyan-100">
              O
            </span>
            <span className="text-lg font-semibold text-white">Omniweb</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
            AI voice agents, chat assistants, lead qualification, workflow automation, and multi-tenant deployments designed to help businesses close more revenue with less manual work.
          </p>
          <a href="mailto:support@omniweb.ai" className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
            <Mail className="site-icon-accent h-4 w-4" />
            support@omniweb.ai
          </a>

          <div className="mt-6 flex flex-wrap gap-3">
            {primaryCtas.map((cta) => (
              <Button key={cta.label} asChild variant={cta.label === "Get Started" ? "default" : "outline"} className="h-10 rounded-full border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
          {footerGroups.map((group) => (
            <div key={group.label}>
              <Link href={group.href} className="text-sm font-semibold uppercase tracking-[0.22em] text-white">
                {group.label}
              </Link>
              <ul className="mt-4 space-y-3 text-sm text-white/55">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-white">
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

      <div className="mt-10 border-t border-white/10 pt-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4 text-sm text-white/45">
            <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-white">Terms</Link>
            <Link href="/sms-consent" className="transition hover:text-white">SMS Consent</Link>
            <Link href="/company/status" className="transition hover:text-white">System Status</Link>
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
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Omniweb. All rights reserved.</span>
          <span>Built for businesses that want AI to answer, qualify, book, and follow up at scale.</span>
        </div>
      </div>
    </footer>
  )
}
