"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
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
  Briefcase,
  Globe,
  Linkedin,
  Twitter,
  Award,
  Rocket,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Send,
  Building,
  Clock,
  DollarSign,
  Coffee,
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
  { icon: Lightbulb, title: "Innovation First", description: "We push the boundaries of what's possible with AI and web technology to deliver cutting-edge solutions that never existed before.", color: "from-yellow-500/20 to-orange-500/20", accent: "text-yellow-400" },
  { icon: Heart, title: "Customer Success", description: "Your success is our success. We measure every decision by the real results our customers achieve with their websites.", color: "from-pink-500/20 to-rose-500/20", accent: "text-pink-400" },
  { icon: Shield, title: "Radical Transparency", description: "No hidden fees, no surprises. We are upfront about our pricing, processes, timelines, and limitations.", color: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400" },
  { icon: Target, title: "Simplicity", description: "Powerful technology should feel simple. We obsess over removing friction from every interaction our customers have.", color: "from-purple-500/20 to-violet-500/20", accent: "text-purple-400" },
]

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", bio: "Former tech lead at a Fortune 500 with 15 years in AI and web. Obsessed with building products that make businesses unstoppable.", twitter: "#", linkedin: "#", gradient: "from-blue-500/30 to-cyan-500/30" },
  { name: "Sarah Mitchell", role: "CTO & Co-Founder", bio: "PhD in Machine Learning with a passion for making AI accessible to every business, not just the big players.", twitter: "#", linkedin: "#", gradient: "from-purple-500/30 to-violet-500/30" },
  { name: "Marcus Johnson", role: "Head of Design", bio: "Award-winning designer with 12 years crafting conversion-optimized experiences for global brands.", twitter: "#", linkedin: "#", gradient: "from-cyan-500/30 to-teal-500/30" },
  { name: "Emily Rodriguez", role: "Head of Customer Success", bio: "Built and scaled CS teams at 3 startups. Dedicated to ensuring every Omniweb customer achieves their goals.", twitter: "#", linkedin: "#", gradient: "from-orange-500/30 to-pink-500/30" },
  { name: "David Park", role: "Head of Engineering", bio: "Previously at Stripe and Vercel. Leads our platform engineering team with a focus on reliability and speed.", twitter: "#", linkedin: "#", gradient: "from-emerald-500/30 to-green-500/30" },
  { name: "Aisha Osei", role: "Head of Marketing", bio: "Growth marketer who scaled two B2B SaaS companies from zero to $10M ARR. Now doing the same for Omniweb.", twitter: "#", linkedin: "#", gradient: "from-yellow-500/30 to-orange-500/30" },
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

const openRoles = [
  { title: "Senior Full-Stack Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
  { title: "AI/ML Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Designer", department: "Design", location: "San Francisco / Remote", type: "Full-time" },
  { title: "Customer Success Manager", department: "Customer Success", location: "Remote", type: "Full-time" },
  { title: "Growth Marketing Manager", department: "Marketing", location: "Remote", type: "Full-time" },
  { title: "Sales Development Rep", department: "Sales", location: "Remote", type: "Full-time" },
]

const perks = [
  { icon: DollarSign, title: "Competitive Salary", description: "Top-of-market pay with equity for every employee." },
  { icon: Globe, title: "Remote First", description: "Work from anywhere in the world. Seriously." },
  { icon: TrendingUp, title: "Career Growth", description: "Clear paths for advancement and a $2K learning budget." },
  { icon: Coffee, title: "Great Benefits", description: "Full health, dental, vision + unlimited PTO policy." },
  { icon: Zap, title: "Latest Tools", description: "$1K/year for hardware and software of your choosing." },
  { icon: Users, title: "Amazing Team", description: "Work with some of the brightest minds in AI and web." },
]

const pressItems = [
  { outlet: "TechCrunch", quote: "Omniweb is redefining what it means to have an AI-powered online presence.", date: "Jan 2026" },
  { outlet: "Forbes", quote: "One of the 25 most exciting AI startups to watch in 2026.", date: "Feb 2026" },
  { outlet: "Product Hunt", quote: "#1 Product of the Day — transforming how businesses build their web presence.", date: "Mar 2026" },
]

export default function CompanyPage() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" })
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <div className="flex min-h-dvh flex-col bg-[#050a12]">
      <Header />
      <main className="flex-1 pt-16">

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
                <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-7xl" style={{ animation: "fadeInUp 0.7s 0.1s ease both" }}>
                  <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">Building the</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Future of the Web</span>
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/60" style={{ animation: "fadeInUp 0.7s 0.2s ease both" }}>
                  Omniweb is on a mission to democratize AI-powered web experiences. We help businesses of all sizes — from solo contractors to enterprise brands — create websites that truly work for them.
                </p>
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
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black" style={{ aspectRatio: "16/9" }}>
                  <div className="absolute -bottom-[15%] -top-[10%] left-0 right-0">
                    <iframe
                      key={`${isMuted}-${isPlaying}`}
                      src={`https://www.youtube-nocookie.com/embed/Dz2_7Em3VXo?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=Dz2_7Em3VXo&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&cc=0&hl=en`}
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
                    <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 py-3 text-center">
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

              {/* Milestone Timeline */}
              <div>
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
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 px-8 py-16">
              <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
              <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/20">
                  <Rocket className="h-8 w-8 text-cyan-400" />
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
                <div key={value.title} className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${value.color} p-6 transition-all hover:border-white/20`}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <value.icon className={`h-6 w-6 ${value.accent}`} />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-white/55">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ───────────────────────────────────────────────────── */}
        <section className="border-t border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">The People</p>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Meet the Team</h2>
              <p className="mx-auto max-w-xl text-white/50">We are a group of builders, designers, and growth experts who love what we do.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div key={member.name} className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20">
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${member.gradient} text-xl font-bold text-white`}>
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex gap-2">
                      <a href={member.twitter} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30 transition-colors hover:border-white/30 hover:text-white">
                        <Twitter className="h-3.5 w-3.5" />
                      </a>
                      <a href={member.linkedin} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/30 transition-colors hover:border-white/30 hover:text-white">
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                  <h3 className="mb-1 font-semibold">{member.name}</h3>
                  <p className="mb-3 text-sm text-cyan-400">{member.role}</p>
                  <p className="flex-1 text-sm leading-relaxed text-white/50">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Press ──────────────────────────────────────────────────── */}
        <section className="border-t border-white/10 px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">As Seen In</p>
              <h2 className="text-3xl font-bold lg:text-4xl">In the Press</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {pressItems.map((item) => (
                <div key={item.outlet} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Award className="h-5 w-5 text-yellow-400" />
                    </div>
                    <span className="text-xs text-white/30">{item.date}</span>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed italic text-white/60">&ldquo;{item.quote}&rdquo;</p>
                  <p className="font-semibold text-white">{item.outlet}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Careers ────────────────────────────────────────────────── */}
        <section id="careers" className="border-t border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 grid items-start gap-12 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Join Us</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Build the Future With Us</h2>
                <p className="mb-8 text-lg leading-relaxed text-white/60">
                  We are a remote-first team of ambitious, kind humans who move fast and take ownership. If you want to work on hard problems that matter, we want to hear from you.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {perks.map((perk) => (
                    <div key={perk.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <perk.icon className="mb-2 h-5 w-5 text-cyan-400" />
                      <div className="mb-1 text-sm font-semibold">{perk.title}</div>
                      <div className="text-xs leading-relaxed text-white/40">{perk.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/40">Open Positions ({openRoles.length})</p>
                <div className="space-y-3">
                  {openRoles.map((role) => (
                    <div key={role.title} className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                      <div>
                        <div className="font-medium">{role.title}</div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{role.department}</span>
                          <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{role.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{role.type}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-cyan-400" />
                    </div>
                  ))}
                </div>
                <Button size="lg" asChild className="mt-6 w-full bg-gradient-to-r from-cyan-600 to-blue-600 font-semibold hover:from-cyan-700 hover:to-blue-700">
                  <Link href="/company/careers">View All Openings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
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
                  <a href="mailto:support@omniweb.ai" className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                      <Mail className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40">Email</div>
                      <div className="font-medium transition-colors group-hover:text-cyan-400">support@omniweb.ai</div>
                    </div>
                  </a>
                  <a href="tel:+1234567890" className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                      <Phone className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40">Phone</div>
                      <div className="font-medium transition-colors group-hover:text-cyan-400">+1 (234) 567-890</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                      <MapPin className="h-5 w-5 text-cyan-400" />
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
                      <a key={link.label} href={link.href} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white">
                        <ChevronRight className="h-3.5 w-3.5" />{link.label}
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
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 px-8 py-16">
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
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" />Free 14-day trial</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" />No credit card needed</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-400" />Cancel anytime</span>
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
