import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"

const quickLinks = [
  { label: "Features", href: "/features" },
  { label: "Solutions", href: "/solutions" },
  { label: "Resources", href: "/resources" },
  { label: "Pricing", href: "/pricing" },
  { label: "Company", href: "/company" },
  { label: "Demo", href: "/demo" },
]

export default function NotFound() {
  return (
    <PageLayout>
      <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.32em] text-cyan-400">404 — Page Not Found</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            The page you were looking for is not here.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Use the links below to get back to the main Omniweb experience or jump straight to the live demo.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild className="h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-6 text-white hover:from-cyan-400 hover:to-purple-400">
              <Link href="/demo">Open the Demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10">
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="kling-panel rounded-[1.4rem] px-5 py-4 text-left transition hover:border-cyan-500/20 hover:bg-white/[0.06]">
                <div className="text-sm font-semibold text-white">{link.label}</div>
                <div className="mt-1 text-sm text-white/50">Go to {link.href}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
