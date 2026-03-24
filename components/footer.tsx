import Link from "next/link"
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react"

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Twitter, href: "https://x.com", label: "X" },
]

export function Footer() {
  return (
    <footer className="h-14 border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Left - Brand & Copyright */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground lg:text-sm">
          <span className="font-medium text-foreground">Omniweb</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{"© 2026"}</span>
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
