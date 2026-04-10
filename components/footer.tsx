import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail } from "lucide-react"

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
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.4fr_1fr_auto] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-sm font-semibold text-cyan-100">
              O
            </span>
            <span className="text-lg font-semibold text-white">Omniweb</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
            AI voice agents, chat assistants, lead qualification, and workflow automation designed to help businesses close more revenue with less manual work.
          </p>
          <a href="mailto:support@omniweb.ai" className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
            <Mail className="site-icon-accent h-4 w-4" />
            support@omniweb.ai
          </a>
        </div>

        <div className="grid gap-3 text-sm text-white/55 sm:grid-cols-2 lg:grid-cols-1">
          <Link href="/features" className="transition hover:text-white">Features</Link>
          <Link href="/solutions" className="transition hover:text-white">Solutions</Link>
          <Link href="/resources" className="transition hover:text-white">Resources</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
          <Link href="/company" className="transition hover:text-white">Company</Link>
          <Link href="/get-started" className="transition hover:text-white">Get Started</Link>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
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
          <div className="flex flex-wrap gap-4 text-sm text-white/45 lg:justify-end">
            <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-white">Terms</Link>
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
