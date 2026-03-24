import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { BookOpen, Video, FileText, Newspaper, ArrowRight } from "lucide-react"
import Link from "next/link"

const resourceCategories = [
  {
    icon: BookOpen,
    title: "Guides & Tutorials",
    description: "Step-by-step guides to help you get the most out of your Omniweb website.",
    count: 24,
    href: "/resources/guides",
  },
  {
    icon: Video,
    title: "Video Library",
    description: "Watch tutorials, product demos, and customer success stories.",
    count: 18,
    href: "/resources/videos",
  },
  {
    icon: FileText,
    title: "Case Studies",
    description: "See how businesses like yours achieved success with Omniweb.",
    count: 12,
    href: "/resources/case-studies",
  },
  {
    icon: Newspaper,
    title: "Blog",
    description: "Insights on web design, AI, conversion optimization, and more.",
    count: 45,
    href: "/resources/blog",
  },
]

const featuredArticles = [
  {
    category: "Guide",
    title: "How to Optimize Your Website for Conversions",
    description: "Learn the key principles of conversion-focused web design and how AI can help automate the process.",
    readTime: "8 min read",
    href: "/resources/guides/conversion-optimization",
  },
  {
    category: "Case Study",
    title: "How Acme Corp Increased Leads by 340%",
    description: "A deep dive into the strategies and AI features that transformed their website performance.",
    readTime: "5 min read",
    href: "/resources/case-studies/acme-corp",
  },
  {
    category: "Blog",
    title: "The Future of AI-Powered Websites",
    description: "Exploring emerging trends in artificial intelligence and how they will shape web experiences.",
    readTime: "6 min read",
    href: "/resources/blog/future-of-ai-websites",
  },
]

export default function ResourcesPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="border-b border-white/10 px-4 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Resources
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
            Learn, Grow, Succeed
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Everything you need to build, optimize, and scale your online presence. From beginner guides to advanced strategies.
          </p>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-bold">Browse by Category</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {resourceCategories.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group rounded-2xl border border-white/10 bg-card/50 p-6 transition-colors hover:border-white/20"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  <category.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="mb-2 font-semibold">{category.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
                <span className="text-xs text-muted-foreground">{category.count} resources</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Articles</h2>
            <Link
              href="/resources/blog"
              className="flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {featuredArticles.map((article) => (
              <Link
                key={article.title}
                href={article.href}
                className="group rounded-2xl border border-white/10 bg-card/50 p-6 transition-colors hover:border-white/20"
              >
                <span className="mb-3 inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                  {article.category}
                </span>
                <h3 className="mb-3 text-lg font-semibold leading-tight group-hover:text-cyan-400">
                  {article.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {article.description}
                </p>
                <span className="text-xs text-muted-foreground">{article.readTime}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-white/10 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Stay Updated</h2>
          <p className="mb-8 text-muted-foreground">
            Get the latest guides, tips, and insights delivered to your inbox.
          </p>
          <form className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
          </form>
        </div>
      </section>
    </PageLayout>
  )
}
