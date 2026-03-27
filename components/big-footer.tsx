import Link from "next/link"
import { Facebook, Instagram, Mail, Youtube } from "lucide-react"

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
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

const productLinks = [
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Templates" },
  { href: "/resources", label: "Resources" },
]

const companyLinks = [
  { href: "/company", label: "Company" },
  { href: "/get-started", label: "Get Started" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
]

export function BigFooter() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-6">
          <div>
            <p className="text-2xl font-semibold tracking-tight">Omniweb</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
              AI-powered websites, automation, and customer conversations built for modern businesses.
            </p>
          </div>
          <a
            href="mailto:support@omniweb.ai"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4" />
            support@omniweb.ai
          </a>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="rounded-full border border-white/10 p-2 text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Product</h3>
          <div className="mt-5 space-y-3">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-white/70 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Company</h3>
          <div className="mt-5 space-y-3">
            {companyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-white/70 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 Omniweb. All rights reserved.</p>
          <p>Built for teams selling with AI.</p>
        </div>
      </div>
    </footer>
  )
}