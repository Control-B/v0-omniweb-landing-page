import Link from "next/link"
import { ArrowRight, Home, MessageSquareText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const recoveryLinks = [
  { label: "Explore features", href: "/features" },
  { label: "View pricing", href: "/pricing" },
  { label: "Read docs", href: "/resources/docs" },
  { label: "Contact support", href: "/company/contact" },
]

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-[#050a12] px-4 py-24 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[70dvh] max-w-5xl flex-col items-center justify-center text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 shadow-[0_18px_60px_rgba(34,211,238,0.14)]">
          <Search className="h-7 w-7" />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">Page Not Found</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          This page moved, but the Omniweb platform is still ready.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
          Use one of the verified routes below to continue exploring AI voice, chat, automation, pricing, and support.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href="/demo">
              <MessageSquareText className="mr-2 h-4 w-4" />
              Try live demo
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
          {recoveryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left text-sm font-medium text-white/72 transition hover:border-cyan-400/30 hover:bg-white/[0.07] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {link.label}
              <ArrowRight className="h-4 w-4 text-cyan-300 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
