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

export function Footer() {
  return (
    <footer className="h-14 border-t border-white/10">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Left - Brand & Copyright */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground lg:text-sm">
          <span className="font-medium text-foreground">Omniweb</span>
          <span className="hidden sm:inline">{"© 2026"}</span>
          <a 
            href="mailto:support@omniweb.ai" 
            className="hidden items-center gap-1 transition-colors hover:text-foreground sm:flex"
          >
            <Mail className="h-3 w-3" />
            support@omniweb.ai
          </a>
        </div>

        {/* Center - Legal Links */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground lg:text-sm"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground lg:text-sm"
          >
            Terms of Service
          </Link>
        </div>

        {/* Right - Social Icons */}
        <div className="flex items-center gap-1 lg:gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground lg:p-2"
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
