"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { BigFooter } from "@/components/big-footer"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ShoppingCart,
  Briefcase,
  Building2,
  Wrench,
  CheckCircle2,
  Zap,
  BarChart3,
  Globe,
  Bot,
  Layers,
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react"

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = []
    const colors = ["#22d3ee", "#818cf8", "#a855f7", "#3b82f6"]

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener("resize", resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = "#22d3ee"; ctx.globalAlpha = (1 - dist / 120) * 0.12
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: 0.7 }} />
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const step = (ts: number) => { if (!start) start = ts; const p = Math.min((ts - start) / 2000, 1); setCount(Math.floor(p * target)); if (p < 1) requestAnimationFrame(step) }
        requestAnimationFrame(step); observer.disconnect()
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

const solutions = [
  { icon: ShoppingCart, title: "E-Commerce Brands", description: "AI-powered storefronts that showcase your products beautifully and convert browsers into buyers with intelligent recommendations.", features: ["Smart product recommendations", "Conversion-optimized layouts", "Integrated inventory management", "Multi-channel selling"], gradient: "from-orange-500/20 to-pink-500/20", accent: "text-orange-400", border: "hover:border-orange-500/40" },
  { icon: Briefcase, title: "Professional Services", description: "Websites that establish credibility, capture leads, and automate client intake for consultants, lawyers, and service providers.", features: ["Lead qualification forms", "Appointment scheduling", "Client portals", "Case study showcases"], gradient: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400", border: "hover:border-blue-500/40" },
  { icon: Building2, title: "Agencies & Studios", description: "Portfolio websites that win clients with stunning case studies, streamlined project inquiries, and automated proposal generation.", features: ["Dynamic portfolios", "Project inquiry forms", "Team showcases", "Client testimonials"], gradient: "from-purple-500/20 to-violet-500/20", accent: "text-purple-400", border: "hover:border-purple-500/40" },
  { icon: Wrench, title: "Contractors & Trades", description: "Local business websites that generate leads, showcase completed projects, and make it easy for customers to request quotes.", features: ["Quote request forms", "Project galleries", "Service area maps", "Review integration"], gradient: "from-cyan-500/20 to-teal-500/20", accent: "text-cyan-400", border: "hover:border-cyan-500/40" },
]

const features = [
  { icon: Bot, title: "AI Copywriting", description: "Automatically generate and A/B test headlines, descriptions, and CTAs that convert." },
  { icon: BarChart3, title: "Conversion Analytics", description: "Real-time insights into what's working, what's not, and how to improve your results." },
  { icon: Zap, title: "Instant Deployment", description: "Go from idea to live website in minutes with our AI-assisted build pipeline." },
  { icon: Globe, title: "Global CDN", description: "Blazing-fast load times worldwide with our enterprise-grade content delivery network." },
  { icon: Layers, title: "No-Code Customization", description: "Drag-and-drop everything. No developer needed for day-to-day updates." },
  { icon: TrendingUp, title: "SEO Optimization", description: "Built-in SEO tools that automatically keep your site optimized for search engines." },
]

const howItWorks = [
  { step: "01", title: "Choose Your Industry", description: "Select the solution that matches your business type and we will pre-configure everything for you." },
  { step: "02", title: "Customize with AI", description: "Our AI learns your brand voice and generates copy, images, and layouts tailored to your audience." },
  { step: "03", title: "Launch & Optimize", description: "Go live in minutes. Our AI continuously monitors and optimizes your site for better conversions." },
]

const stats = [
  { value: 5000, suffix: "+", label: "Websites Built" },
  { value: 340, suffix: "%", label: "Average Conversion Lift" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 48, suffix: "hrs", label: "Average Launch Time" },
]

const testimonials = [
  { name: "Jordan Lee", role: "Owner, Lee Contracting", quote: "Omniweb doubled our quote requests within 30 days. The AI just gets our customers.", stars: 5 },
  { name: "Priya Sharma", role: "Founder, Sharma Law Group", quote: "We went from 2 leads/week to 15. The automated intake forms save us hours every day.", stars: 5 },
  { name: "Carlos Rivera", role: "CEO, Pixel Agency", quote: "Our portfolio site now brings in 3x more client inquiries. Worth every penny.", stars: 5 },
]

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="flex min-h-dvh flex-col bg-[#050a12]">
      <Header />
      <main className="flex-1 pt-16">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="solutions-overview" className="relative flex min-h-[92vh] items-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
            <div className="absolute right-1/4 top-2/3 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-purple-600/15 blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[100px]" />
            <ParticleCanvas />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050a12]/60 via-transparent to-[#050a12]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 backdrop-blur-sm" style={{ animation: "fadeInUp 0.8s ease both" }}>
                <Zap className="h-3.5 w-3.5" />
                AI-Powered Solutions
              </div>
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent" style={{ animation: "fadeInUp 0.8s ease both" }}>The Right Solution</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent" style={{ animation: "fadeInUp 0.8s 0.2s ease both" }}>For Every Business</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl" style={{ animation: "fadeInUp 0.8s 0.4s ease both" }}>
                Every industry has unique challenges. Our AI-powered website systems are purpose-built for your business, not a generic template everyone else uses.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animation: "fadeInUp 0.8s 0.6s ease both" }}>
                <Button size="lg" asChild className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-semibold hover:from-blue-700 hover:to-purple-700">
                  <Link href="/get-started">Start Building Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 border-white/20 px-8 text-base backdrop-blur-sm hover:bg-white/10">
                  <Link href="/templates">View Templates</Link>
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40" style={{ animation: "fadeInUp 0.8s 0.8s ease both" }}>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" />No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" />Live in 48 hours</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" />Cancel anytime</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 pt-1.5">
              <div className="h-2 w-1 animate-pulse rounded-full bg-white/50" />
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-1 text-4xl font-bold text-white lg:text-5xl">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Solution Tabs ──────────────────────────────────────────── */}
        <section id="industry-solutions" className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Built for Your Industry</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-5xl">Choose Your Solution</h2>
              <p className="mx-auto max-w-xl text-white/50">Pre-configured for your specific industry needs — so you start with everything already tuned for maximum performance.</p>
            </div>
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              {solutions.map((s, i) => (
                <button key={s.title} onClick={() => setActiveTab(i)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeTab === i ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20" : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"}`}>
                  <s.icon className="h-4 w-4" />{s.title}
                </button>
              ))}
            </div>
            {solutions.map((solution, i) => (
              <div key={solution.title} className={`overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${solution.gradient} p-8 transition-all lg:p-12 ${solution.border} ${activeTab === i ? "block" : "hidden"}`}>
                <div className="grid items-center gap-12 lg:grid-cols-2">
                  <div>
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                      <solution.icon className={`h-7 w-7 ${solution.accent}`} />
                    </div>
                    <h3 className="mb-4 text-3xl font-bold">{solution.title}</h3>
                    <p className="mb-8 text-lg leading-relaxed text-white/60">{solution.description}</p>
                    <ul className="mb-10 grid grid-cols-2 gap-3">
                      {solution.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${solution.accent}`} />{feat}
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" asChild className="bg-white text-black hover:bg-white/90">
                      <Link href="/get-started">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[#050a12]/80">
                    <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                      <span className="h-3 w-3 rounded-full bg-red-500/60" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                      <span className="h-3 w-3 rounded-full bg-green-500/60" />
                      <div className="ml-2 flex-1 rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/30">omniweb.ai/your-site</div>
                    </div>
                    <div className="p-4">
                      <div className={`mb-3 h-40 rounded-xl bg-gradient-to-br ${solution.gradient} animate-pulse`} />
                      <div className="space-y-2">
                        <div className="h-3 w-3/4 rounded bg-white/10" />
                        <div className="h-3 w-1/2 rounded bg-white/10" />
                        <div className="mt-4 h-8 w-32 rounded-lg bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────── */}
        <section id="features" className="border-t border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Powered by AI</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Everything You Need to Win Online</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                    <feature.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────────── */}
        <section id="how-it-works" className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Simple Process</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">From Zero to Live in 3 Steps</h2>
            </div>
            <div className="relative grid gap-8 lg:grid-cols-3">
              <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent lg:block" />
              {howItWorks.map((step) => (
                <div key={step.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm">
                    <span className="text-2xl font-bold text-cyan-400">{step.step}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────────────── */}
        <section id="testimonials" className="border-t border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Customer Stories</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Real Results from Real Businesses</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-sm font-bold text-cyan-400">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-white/40">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 px-8 py-16">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold lg:text-5xl">Not sure which solution fits?</h2>
                <p className="mb-10 text-lg text-white/60">Talk to our team and we will help you find the perfect solution for your business — for free.</p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild className="h-14 bg-white px-8 text-base font-semibold text-black hover:bg-white/90">
                    <Link href="/get-started">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-14 border-white/20 px-8 text-base backdrop-blur-sm hover:bg-white/10">
                    <Link href="/company#contact">Talk to Sales <ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
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
