import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Eye, Zap } from "lucide-react"
import Link from "next/link"

const templates = [
  {
    name: "Commerce Pro",
    category: "E-Commerce",
    description: "A modern e-commerce template with product showcases, cart, and checkout.",
    image: "/templates/commerce-pro.jpg",
    previewUrl: "/templates/preview/commerce-pro",
  },
  {
    name: "Consultant",
    category: "Professional Services",
    description: "Clean and professional template for consultants and advisors.",
    image: "/templates/consultant.jpg",
    previewUrl: "/templates/preview/consultant",
  },
  {
    name: "Portfolio Studio",
    category: "Agencies",
    description: "Showcase your creative work with this stunning portfolio template.",
    image: "/templates/portfolio-studio.jpg",
    previewUrl: "/templates/preview/portfolio-studio",
  },
  {
    name: "Local Pro",
    category: "Contractors",
    description: "Perfect for local service businesses with quote forms and galleries.",
    image: "/templates/local-pro.jpg",
    previewUrl: "/templates/preview/local-pro",
  },
  {
    name: "SaaS Launch",
    category: "Technology",
    description: "Launch your SaaS product with this conversion-optimized template.",
    image: "/templates/saas-launch.jpg",
    previewUrl: "/templates/preview/saas-launch",
  },
  {
    name: "Restaurant",
    category: "Food & Beverage",
    description: "Menu displays, reservations, and online ordering in one template.",
    image: "/templates/restaurant.jpg",
    previewUrl: "/templates/preview/restaurant",
  },
]

const categories = ["All", "E-Commerce", "Professional Services", "Agencies", "Contractors", "Technology", "Food & Beverage"]

export default function TemplatesPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="border-b border-white/10 px-4 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Templates
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Start with a Beautiful Template
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Choose from our collection of professionally designed, AI-optimized templates. Customize anything to match your brand.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-white/10 px-4 py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === "All"
                    ? "bg-cyan-500 text-white"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.name}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-card/50 transition-colors hover:border-white/20"
              >
                {/* Template Preview Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/20">{template.name[0]}</span>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="sm" variant="outline" asChild className="border-white/20">
                      <Link href={template.previewUrl}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="bg-cyan-500 hover:bg-cyan-600">
                      <Link href={`/get-started?template=${template.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Zap className="mr-2 h-4 w-4" />
                        Use
                      </Link>
                    </Button>
                  </div>
                </div>
                {/* Template Info */}
                <div className="p-6">
                  <span className="mb-2 inline-block text-xs font-medium text-cyan-400">
                    {template.category}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold">{template.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Template CTA */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Need Something Custom?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Our team can create a completely custom template tailored to your brand and business needs.
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
