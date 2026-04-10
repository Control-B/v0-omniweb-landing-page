"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { BigFooter } from "@/components/big-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Target,
  Heart,
  Lightbulb,
  Shield,
  Users,
  Globe,
  Rocket,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Send,
  Building,
  Clock,
  Zap,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react"

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

const values = [
  { icon: Lightbulb, title: "Innovation First", description: "We push the boundaries of what's possible with AI and web technology to deliver cutting-edge solutions that never existed before.", color: "from-yellow-500/20 to-orange-500/20", accent: "text-yellow-400", image: "/images/generated/company-value-innovation.png" },
  { icon: Heart, title: "Customer Success", description: "Your success is our success. We measure every decision by the real results our customers achieve with their websites.", color: "from-pink-500/20 to-rose-500/20", accent: "text-pink-400", image: "/images/generated/company-value-customer-success.png" },
  { icon: Shield, title: "Radical Transparency", description: "No hidden fees, no surprises. We are upfront about our pricing, processes, timelines, and limitations.", color: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400", image: "/images/generated/company-value-transparency.png" },
  { icon: Target, title: "Simplicity", description: "Powerful technology should feel simple. We obsess over removing friction from every interaction our customers have.", color: "from-purple-500/20 to-violet-500/20", accent: "text-purple-400", image: "/images/generated/company-value-simplicity.png" },
]


const stats = [
  { value: 5000, suffix: "+", label: "Websites Built" },
  { value: 50, suffix: "+", label: "Team Members" },
  { value: 12, suffix: "", label: "Countries Served" },
  { value: 98, suffix: "%", label: "Customer Retention" },
]

const milestones = [
  { year: "2024", title: "Founded", description: "Omniweb is born from a simple idea: every business deserves an AI-powered website that actually works." },
  { year: "2024", title: "First 100 Customers", description: "Hit 100 paying customers in the first 90 days, validating product-market fit ahead of schedule." },
  { year: "2025", title: "Series A Raised", description: "Closed a $8M Series A to accelerate product development and expand our team." },
  { year: "2025", title: "1,000 Websites Live", description: "Crossed the milestone of 1,000 active websites built on the platform." },
  { year: "2026", title: "5,000+ Customers", description: "Now serving over 5,000 businesses across 12 countries with AI-powered web solutions." },
]

const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com"

export default function CompanyPage() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" })
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const postPlayerMessage = (payload: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), YOUTUBE_ORIGIN)
  }

  const syncPlayerState = () => {
    postPlayerMessage({ event: "listening" })
    postPlayerMessage({
      event: "command",
      func: isMuted ? "mute" : "unMute",
      args: [],
    })
    postPlayerMessage({
      event: "command",
      func: isPlaying ? "playVideo" : "pauseVideo",
      args: [],
    })
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_ORIGIN && event.origin !== "https://www.youtube.com") return
      
      try {
        const data = JSON.parse(event.data)
        
        // YouTube API infoDelivery sends playerState changes
        // playerState 0 = ended
        if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
          postPlayerMessage({ event: "command", func: "seekTo", args: [0, true] })
          postPlayerMessage({ event: "command", func: "playVideo", args: [] })
        }
      } catch (e) {
        // Ignore unparseable messages
      }
    }

    window.addEventListener("message", handleMessage)

    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Control YouTube via the postMessage API instead of remounting the iframe key
  useEffect(() => {
    postPlayerMessage({
      event: "command",
      func: isPlaying ? "playVideo" : "pauseVideo",
      args: [],
    })
  }, [isPlaying])

  useEffect(() => {
    postPlayerMessage({
      event: "command",
      func: isMuted ? "mute" : "unMute",
      args: [],
    })
  }, [isMuted])

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#050a12]">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />
      <Header />
      <main className="relative flex-1 pt-16">

        {/* ── Hero (Landing-page style) ──────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute right-0 top-1/2 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-600/8 blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050a12]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400" style={{ animation: "fadeInUp 0.7s ease both" }}>
                  <Building className="h-3.5 w-3.5" />
                  About Omniweb
                </div>
                <h2 className="site-h2 mb-6" style={{ animation: "fadeInUp 0.7s 0.1s ease both" }}>
                  <span className="site-display-tone-dark">Building the</span>
                  <br />
                  <span className="site-display-accent">Future of the Web</span>
                </h2>
                <h3 className="site-h3 mb-8 max-w-xl" style={{ animation: "fadeInUp 0.7s 0.2s ease both" }}>
                  Omniweb is on a mission to democratize AI-powered web experiences. We help businesses of all sizes — from solo contractors to enterprise brands — create websites that truly work for them.
                </h3>
                <div className="flex flex-col items-start gap-4 sm:flex-row" style={{ animation: "fadeInUp 0.7s 0.3s ease both" }}>
                  <Button size="lg" asChild className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-semibold hover:from-blue-700 hover:to-purple-700">
                    <Link href="/get-started">Start Building Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-14 border-white/20 px-8 text-base hover:bg-white/10">
                    <a href="#contact">Get in Touch</a>
                  </Button>
                </div>
              </div>

              {/* Video + Stats */}
              <div className="relative flex flex-col gap-4" style={{ animation: "fadeInUp 0.7s 0.3s ease both" }}>
                {/* Video embed */}
                <div className="kling-panel-strong relative overflow-hidden rounded-2xl" style={{ aspectRatio: "16/9" }}>
                  <div className="absolute -bottom-[15%] -top-[10%] left-0 right-0">
                    <iframe
                      ref={iframeRef}
                      onLoad={syncPlayerState}
                      src={`https://www.youtube-nocookie.com/embed/Dz2_7Em3VXo?enablejsapi=1&autoplay=1&mute=1&loop=0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&cc=0&hl=en`}
                      title="Omniweb Demo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="pointer-events-none h-full w-full scale-110"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                    />
                  </div>
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                  {/* Video controls */}
                  <div className="absolute bottom-3 right-3 z-10 flex gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-black/80"
                    >
                      {isPlaying ? <><Pause className="h-3 w-3" />Pause</> : <><Play className="h-3 w-3" />Play</>}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="flex h-8 items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-black/80"
                    >
                      {isMuted ? <><VolumeX className="h-3 w-3" />Unmute</> : <><Volume2 className="h-3 w-3" />Mute</>}
                    </button>
                  </div>
                </div>
                {/* Stats strip below video */}
                <div className="grid grid-cols-4 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="kling-stat-card rounded-xl py-3 text-center">
                      <div className="text-xl font-bold text-white leading-none mb-1">
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-[11px] text-white/40 leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {/* Glow */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Story ──────────────────────────────────────────────── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Our Origin</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">A Problem Worth Solving</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Founded in 2024, Omniweb started with a simple observation: most businesses struggle to create websites that actually convert visitors into customers. Traditional web development is expensive, slow, and often produces underwhelming results.</p>
                  <p>We asked ourselves: what if AI could bridge this gap? What if we could make it possible for <em className="text-white/80 not-italic">any</em> business to have a website that not only looks great but actively helps them grow?</p>
                  <p>Today, Omniweb powers thousands of websites across industries, from local contractors to national e-commerce brands. Our AI technology continuously optimizes each site for maximum conversions, while our human team provides the support and expertise our customers need to succeed.</p>
                </div>
              </div>

              <div>
                <div className="kling-panel-strong mb-8 overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src="/images/generated/company-innovation-team.png"
                      alt="Omniweb team innovation visual"
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>

                {/* Milestone Timeline */}
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Key Milestones</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">How We Got Here</h2>
                <div className="relative space-y-6">
                  <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/30 to-transparent" />
                  {milestones.map((m, i) => (
                    <div key={i} className="relative flex gap-6">
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xs font-bold text-cyan-400">
                        {m.year.slice(2)}
                      </div>
                      <div className="pb-2">
                        <div className="mb-1 font-semibold">{m.title} <span className="ml-1 text-xs text-white/30">— {m.year}</span></div>
                        <p className="text-sm leading-relaxed text-white/50">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission ────────────────────────────────────────────────── */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="kling-panel-strong relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 px-8 py-16">
              <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
              <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
              <div className="relative z-10">
                <div className="site-icon-chip mx-auto mb-6 flex h-16 w-16">
                  <Rocket className="h-8 w-8 site-icon-accent" />
                </div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">Our Mission</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-5xl">Democratize AI-Powered Websites for Every Business on Earth</h2>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/60">
                  We believe every business deserves a website that works as hard as they do. Our mission is to make world-class AI web technology accessible — regardless of budget, technical knowledge, or team size.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ─────────────────────────────────────────────────── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">What We Stand For</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Our Core Values</h2>
              <p className="mx-auto max-w-xl text-white/50">These aren't words on a wall. They're the principles that guide every decision we make.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className={`kling-panel group rounded-2xl bg-gradient-to-br ${value.color} p-6 transition-all hover:border-white/20`}>
                  <div className="relative mb-5 aspect-[5/4] overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                    <Image src={value.image} alt={value.title} fill sizes="(min-width: 1024px) 20vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-white/55">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── Why Omniweb ─────────────────────────────────────────── */}
        <section className="border-t border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Why Omniweb</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Everything you need to grow with AI</h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/55">
                Omniweb combines AI voice agents, chat assistants, lead automation, and smart websites into one platform — so your business never misses a lead, day or night.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Zap,
                  color: "text-cyan-400",
                  bg: "from-cyan-500/15 to-blue-500/10",
                  border: "border-cyan-500/20",
                  title: "Instant Lead Response",
                  description: "AI agents respond to every inbound call, chat, and form within seconds — before a competitor can even pick up the phone.",
                  stat: "< 2s",
                  statLabel: "avg. response time",
                },
                {
                  icon: TrendingUp,
                  color: "text-violet-400",
                  bg: "from-violet-500/15 to-purple-500/10",
                  border: "border-violet-500/20",
                  title: "More Conversions",
                  description: "Turn website visitors into booked appointments and qualified opportunities with AI that guides buyers through every step.",
                  stat: "+38%",
                  statLabel: "conversion lift",
                },
                {
                  icon: Clock,
                  color: "text-emerald-400",
                  bg: "from-emerald-500/15 to-teal-500/10",
                  border: "border-emerald-500/20",
                  title: "30+ Hours Saved Weekly",
                  description: "Automate repetitive qualification, intake, follow-up, and CRM entry so your team focuses entirely on closing.",
                  stat: "30+",
                  statLabel: "hrs saved / week",
                },
                {
                  icon: Users,
                  color: "text-blue-400",
                  bg: "from-blue-500/15 to-sky-500/10",
                  border: "border-blue-500/20",
                  title: "Works for Any Industry",
                  description: "Built for Shopify stores, contractors, professionals, and service businesses. Omniweb adapts to your workflow and your customers.",
                  stat: "12+",
                  statLabel: "industries served",
                },
                {
                  icon: Shield,
                  color: "text-amber-400",
                  bg: "from-amber-500/15 to-yellow-500/10",
                  border: "border-amber-500/20",
                  title: "Always On, Never Missed",
                  description: "24/7 coverage across voice, chat, and SMS means zero missed opportunities — even on holidays, evenings, and weekends.",
                  stat: "24/7",
                  statLabel: "availability",
                },
                {
                  icon: Rocket,
                  color: "text-pink-400",
                  bg: "from-pink-500/15 to-rose-500/10",
                  border: "border-pink-500/20",
                  title: "Live in Days, Not Months",
                  description: "Omniweb is ready to deploy in days. No long onboarding, no developer required — just connect, configure, and convert.",
                  stat: "3",
                  statLabel: "day avg. setup",
                },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${benefit.bg} ${benefit.border} p-6 backdrop-blur-sm`}
                >
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${benefit.border} bg-black/20`}>
                    <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
                  </div>
                  <div className={`mb-1 text-3xl font-bold ${benefit.color}`}>{benefit.stat}</div>
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/40">{benefit.statLabel}</div>
                  <h3 className="mb-2 text-base font-semibold text-white">{benefit.title}</h3>
                  <p className="text-sm leading-7 text-white/55">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/get-started"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#3b82f6] px-7 text-[13px] font-bold uppercase tracking-wider text-white transition hover:bg-[#2563eb]"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/pricing"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-7 text-[13px] font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                See Pricing
              </a>
            </div>
          </div>
        </section>

        {/* ── Contact ────────────────────────────────────────────────── */}
        <section id="contact" className="border-t border-white/10 px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Get in Touch</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">We'd Love to Hear From You</h2>
              <p className="text-white/50">Questions, partnerships, press inquiries — our door is always open.</p>
            </div>
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Info */}
              <div>
                <h3 className="mb-8 text-xl font-semibold">Contact Information</h3>
                <div className="mb-8 space-y-5">
                  <a href="mailto:support@omniweb.ai" className="kling-panel group flex items-center gap-4 rounded-xl p-4 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                    <div className="site-icon-chip flex h-10 w-10 rounded-lg">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40">Email</div>
                      <div className="font-medium transition-colors group-hover:text-cyan-400">support@omniweb.ai</div>
                    </div>
                  </a>
                  <a href="tel:+1234567890" className="kling-panel group flex items-center gap-4 rounded-xl p-4 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                    <div className="site-icon-chip flex h-10 w-10 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40">Phone</div>
                      <div className="font-medium transition-colors group-hover:text-cyan-400">+1 (234) 567-890</div>
                    </div>
                  </a>
                  <div className="kling-panel flex items-center gap-4 rounded-xl p-4">
                    <div className="site-icon-chip flex h-10 w-10 rounded-lg">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40">Headquarters</div>
                      <div className="font-medium">123 Innovation Way, San Francisco, CA 94102</div>
                    </div>
                  </div>
                </div>

                {/* Quick links */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">Quick Links</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Press Kit", href: "#" },
                      { label: "Partnerships", href: "#" },
                      { label: "Investors", href: "#" },
                      { label: "Developer API", href: "#" },
                    ].map((link) => (
                      <a key={link.label} href={link.href} className="kling-panel flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white">
                        <ChevronRight className="site-icon-accent h-3.5 w-3.5" />{link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="mb-8 text-xl font-semibold">Send Us a Message</h3>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/50">First Name</label>
                      <Input placeholder="Alex" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="border-white/10 bg-white/5 placeholder:text-white/20 focus-visible:ring-cyan-500" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/50">Last Name</label>
                      <Input placeholder="Chen" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="border-white/10 bg-white/5 placeholder:text-white/20 focus-visible:ring-cyan-500" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Email Address</label>
                    <Input type="email" placeholder="you@company.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="border-white/10 bg-white/5 placeholder:text-white/20 focus-visible:ring-cyan-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Subject</label>
                    <select className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/60 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                      <option>General Inquiry</option>
                      <option>Partnership</option>
                      <option>Press / Media</option>
                      <option>Investor Relations</option>
                      <option>Technical Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Message</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
                    />
                  </div>
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold hover:from-blue-700 hover:to-purple-700">
                    Send Message <Send className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-xs text-white/30">We typically respond within 2 business hours.</p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────── */}
        <section className="border-t border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="kling-panel-strong relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 px-8 py-16">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold lg:text-5xl">Join the Omniweb Community</h2>
                <p className="mb-10 text-lg text-white/60">Start building your AI-powered website today. No credit card required.</p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild className="h-14 bg-white px-8 text-base font-semibold text-black hover:bg-white/90">
                    <Link href="/get-started">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-14 border-white/20 px-8 text-base hover:bg-white/10">
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="site-icon-accent h-4 w-4" />Free 14-day trial</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="site-icon-accent h-4 w-4" />No credit card needed</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="site-icon-accent h-4 w-4" />Cancel anytime</span>
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
