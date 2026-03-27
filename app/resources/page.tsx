"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { BigFooter } from "@/components/big-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Newspaper,
  Clock,
  Play,
  Search,
  Rss,
  Download,
  Headphones,
  ChevronRight,
  TrendingUp,
  Zap,
} from "lucide-react"

function GlowOrb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full blur-[120px] ${className}`} />
}

const resourceCategories = [
  { icon: BookOpen, title: "Guides & Tutorials", description: "Step-by-step guides to get the most out of Omniweb.", count: 24, color: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Video, title: "Video Library", description: "Product demos, walkthroughs, and customer success stories.", count: 18, color: "from-purple-500/20 to-violet-500/20", accent: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: FileText, title: "Case Studies", description: "See how businesses like yours achieved real results.", count: 12, color: "from-orange-500/20 to-pink-500/20", accent: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Newspaper, title: "Blog", description: "Insights on web design, AI, conversion optimization, and more.", count: 45, color: "from-cyan-500/20 to-teal-500/20", accent: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Headphones, title: "Podcast", description: "Weekly conversations with growth-focused business owners.", count: 32, color: "from-pink-500/20 to-rose-500/20", accent: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: Download, title: "Free Templates", description: "Download ready-to-use resources, checklists and frameworks.", count: 9, color: "from-emerald-500/20 to-green-500/20", accent: "text-emerald-400", bg: "bg-emerald-500/10" },
]

const featuredArticles = [
  { category: "Guide", title: "How to Optimize Your Website for Conversions", description: "Learn the key principles of conversion-focused web design and how AI automates the process.", readTime: "8 min read", badge: "bg-blue-500/20 text-blue-400" },
  { category: "Case Study", title: "How Acme Corp Increased Leads by 340%", description: "A deep dive into the strategies and AI features that transformed their website performance.", readTime: "5 min read", badge: "bg-orange-500/20 text-orange-400" },
  { category: "Blog", title: "The Future of AI-Powered Websites in 2026", description: "Exploring emerging trends in artificial intelligence and how they are shaping the web.", readTime: "6 min read", badge: "bg-cyan-500/20 text-cyan-400" },
  { category: "Podcast", title: "Growing a Local Business to $1M with Omniweb", description: "Owner Marcus shares exactly how he used AI and smart design to triple revenue.", readTime: "42 min listen", badge: "bg-pink-500/20 text-pink-400" },
  { category: "Guide", title: "SEO in the Age of AI: What Actually Works", description: "The new playbook for ranking your AI-powered website in 2026 and beyond.", readTime: "10 min read", badge: "bg-blue-500/20 text-blue-400" },
  { category: "Case Study", title: "From 0 to 500 Monthly Leads: A Contractor Story", description: "How a small plumbing company completely transformed its online presence.", readTime: "7 min read", badge: "bg-orange-500/20 text-orange-400" },
]

const videoHighlights = [
  { title: "Omniweb Platform Overview", duration: "4:32", thumbnail: "from-blue-600/30 to-purple-600/30" },
  { title: "AI Copywriting in Action", duration: "6:18", thumbnail: "from-cyan-600/30 to-blue-600/30" },
  { title: "Building a Lead Gen Machine", duration: "12:05", thumbnail: "from-purple-600/30 to-pink-600/30" },
]

const trending = [
  "AI website builders", "conversion optimization", "lead generation 2026", "no-code websites", "local SEO tips",
]

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div className="flex min-h-dvh flex-col bg-[#050a12]">
      <Header />
      <main className="flex-1 pt-16">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="resources-overview" className="relative flex min-h-[90vh] items-center overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0">
            <GlowOrb className="left-0 top-0 h-[700px] w-[700px] -translate-x-1/3 -translate-y-1/3 bg-blue-600/12" />
            <GlowOrb className="right-0 bottom-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 bg-purple-600/12" />
            <GlowOrb className="left-1/2 top-1/2 h-[400px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-cyan-600/8" />
            {/* Animated dots grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            {/* Horizontal scan lines */}
            <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 40px)" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050a12]/80 via-transparent to-[#050a12]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400" style={{ animation: "fadeInUp 0.7s ease both" }}>
                <Rss className="h-3.5 w-3.5" />
                Knowledge Hub
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl" style={{ animation: "fadeInUp 0.7s 0.1s ease both" }}>
                <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">Learn, Grow,</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Dominate Your Market</span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl" style={{ animation: "fadeInUp 0.7s 0.2s ease both" }}>
                Everything you need to build, optimize, and scale your online presence. Guides, videos, case studies, and actionable insights — all free.
              </p>

              {/* Search bar */}
              <div className="relative mx-auto mb-6 max-w-xl" style={{ animation: "fadeInUp 0.7s 0.3s ease both" }}>
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides, videos, case studies..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm backdrop-blur-sm placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm hover:from-purple-700 hover:to-blue-700">
                  Search
                </Button>
              </div>

              {/* Trending */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/40" style={{ animation: "fadeInUp 0.7s 0.4s ease both" }}>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span className="mr-1 text-white/30">Trending:</span>
                {trending.map((t) => (
                  <button key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50 transition-colors hover:border-white/20 hover:text-white">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 pt-1.5">
              <div className="h-2 w-1 animate-pulse rounded-full bg-white/50" />
            </div>
          </div>
        </section>

        {/* ── Category Cards ─────────────────────────────────────────── */}
        <section id="library" className="border-y border-white/10 bg-white/[0.015] px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-purple-400">Explore by Type</p>
              <h2 className="text-3xl font-bold lg:text-4xl">Browse the Library</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resourceCategories.map((cat) => (
                <div key={cat.title} className={`group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${cat.color} p-6 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-black/30`}>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}>
                    <cat.icon className={`h-6 w-6 ${cat.accent}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{cat.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-white/50">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${cat.accent}`}>{cat.count} resources</span>
                    <ChevronRight className={`h-4 w-4 ${cat.accent} transition-transform group-hover:translate-x-1`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Articles ──────────────────────────────────────── */}
        <section id="articles" className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-purple-400">Fresh Content</p>
                <h2 className="text-3xl font-bold">Featured Articles</h2>
              </div>
              <Button variant="outline" asChild className="border-white/20 hover:bg-white/10">
                <Link href="/resources/blog">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <div key={article.title} className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/[0.08]">
                  <span className={`mb-4 inline-block self-start rounded-full px-3 py-1 text-xs font-medium ${article.badge}`}>
                    {article.category}
                  </span>
                  <h3 className="mb-3 flex-1 text-lg font-semibold leading-tight transition-colors group-hover:text-cyan-400">
                    {article.title}
                  </h3>
                  <p className="mb-5 text-sm leading-relaxed text-white/50">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-white/30">
                      <Clock className="h-3.5 w-3.5" />{article.readTime}
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-cyan-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Video Highlights ───────────────────────────────────────── */}
        <section id="videos" className="border-t border-white/10 bg-white/[0.015] px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-purple-400">Watch & Learn</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Popular Videos</h2>
              <p className="text-white/50">See the platform in action before you sign up.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {videoHighlights.map((video) => (
                <div key={video.title} className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-white/20">
                  <div className={`relative aspect-video bg-gradient-to-br ${video.thumbnail} flex items-center justify-center`}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-white/10">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white/70 backdrop-blur-sm">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium transition-colors group-hover:text-cyan-400">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button variant="outline" asChild className="border-white/20 hover:bg-white/10">
                <Link href="/resources/videos">View Full Video Library <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Newsletter CTA ─────────────────────────────────────────── */}
        <section id="newsletter" className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-cyan-600/20 px-8 py-16 text-center">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
              <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/20">
                  <Zap className="h-8 w-8 text-purple-400" />
                </div>
                <h2 className="mb-3 text-3xl font-bold lg:text-4xl">Stay Ahead of the Curve</h2>
                <p className="mx-auto mb-8 max-w-xl text-white/60">
                  Get the latest AI web insights, tutorials, and case studies delivered every week. Join 12,000+ business owners who already subscribed.
                </p>
                <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                  <Input type="email" placeholder="Enter your email address" className="border-white/10 bg-white/5 placeholder:text-white/30 focus-visible:ring-purple-500" />
                  <Button className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 font-semibold hover:from-purple-700 hover:to-blue-700">
                    Subscribe Free
                  </Button>
                </form>
                <p className="mt-4 text-xs text-white/30">No spam. Unsubscribe anytime. We respect your privacy.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BigFooter />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
