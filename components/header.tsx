"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Menu, X } from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
  { label: "Templates", href: "#templates" },
  { label: "Company", href: "#company" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Omniweb
          </span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 text-foreground/80 hover:bg-white/10 hover:text-foreground"
          >
            <a href="tel:+1234567890">
              <Phone className="h-4 w-4" />
              Call Us
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-foreground/80 hover:bg-white/10 hover:text-foreground"
          >
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="bg-blue-600 text-white hover:bg-blue-700">
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
        <div className="absolute left-0 right-0 top-16 border-b border-border/40 bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="justify-start gap-2"
              >
                <a href="tel:+1234567890">
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/get-started">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
