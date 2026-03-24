import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingCart, Briefcase, Building2, Wrench } from "lucide-react"
import Link from "next/link"

const solutions = [
  {
    icon: ShoppingCart,
    title: "E-Commerce Brands",
    description: "AI-powered storefronts that showcase your products beautifully and convert browsers into buyers with intelligent recommendations and seamless checkout experiences.",
    features: ["Smart product recommendations", "Conversion-optimized layouts", "Integrated inventory management", "Multi-channel selling"],
    href: "/solutions/ecommerce",
  },
  {
    icon: Briefcase,
    title: "Professional Services",
    description: "Websites that establish credibility, capture leads, and automate client intake for consultants, lawyers, accountants, and other service providers.",
    features: ["Lead qualification forms", "Appointment scheduling", "Client portals", "Case study showcases"],
    href: "/solutions/professional-services",
  },
  {
    icon: Building2,
    title: "Agencies & Studios",
    description: "Portfolio websites that win clients with stunning case studies, streamlined project inquiries, and automated proposal generation.",
    features: ["Dynamic portfolios", "Project inquiry forms", "Team showcases", "Client testimonials"],
    href: "/solutions/agencies",
  },
  {
    icon: Wrench,
    title: "Contractors & Trades",
    description: "Local business websites that generate leads, showcase completed projects, and make it easy for customers to request quotes.",
    features: ["Quote request forms", "Project galleries", "Service area maps", "Review integration"],
    href: "/solutions/contractors",
  },
]

export default function SolutionsPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="border-b border-white/10 px-4 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Solutions
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Built for Your Industry
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every business is unique. Our AI-powered website systems are tailored to the specific needs of your industry, helping you stand out and convert more customers.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {solutions.map((solution) => (
              <div
                key={solution.title}
                className="group rounded-2xl border border-white/10 bg-card/50 p-8 transition-colors hover:border-white/20"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  <solution.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold">{solution.title}</h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {solution.description}
                </p>
                <ul className="mb-8 space-y-2">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={solution.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Not Sure Which Solution Fits?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Talk to our team and we will help you find the perfect solution for your business.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/get-started">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/20 hover:bg-white/10">
              <Link href="/company">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
