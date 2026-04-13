"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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

const heroHeadlines = [
  { line1: "AI-POWERED SOLUTIONS", line2: "FOR EVERY INDUSTRY.", color: "from-cyan-400 to-blue-500" },
  { line1: "SMARTER WEBSITES THAT", line2: "SELL FOR YOU.", color: "from-violet-400 to-purple-500" },
  { line1: "AUTOMATE LEADS,", line2: "ACCELERATE GROWTH.", color: "from-emerald-400 to-teal-500" },
  { line1: "YOUR AI SALES TEAM,", line2: "ALWAYS ON.", color: "from-amber-400 to-orange-500" },
  { line1: "BUILT TO CONVERT,", line2: "DESIGNED TO SCALE.", color: "from-rose-400 to-pink-500" },
]

const heroSubheadings = [
  "Pre-configured AI voice and chat systems tuned for your industry — ready to qualify, capture, and close.",
  "From first click to booked call, every visitor gets a personalized experience that drives revenue.",
  "Stop losing leads to slow response times. AI handles intake, follow-up, and routing instantly.",
  "Voice agents, chat assistants, and lead automation working 24/7 so your team can focus on closing.",
  "Conversion-optimized AI that adapts to your business, your customers, and your growth goals.",
]

const solutions = [
  { 
    icon: ShoppingCart, 
    title: "E-Commerce Brands", 
    description: "AI-powered storefronts that showcase your products beautifully and convert browsers into buyers with intelligent recommendations.", 
    features: ["Smart product recommendations", "Conversion-optimized layouts", "Integrated inventory management", "Multi-channel selling"], 
    gradient: "from-orange-500/20 to-pink-500/20", 
    accent: "text-orange-400", 
    border: "hover:border-orange-500/40", 
    image: "/images/generated/solutions-ecommerce.png",
    video: "/media/e-commerce-video.mp4"
  },
  { 
    icon: Briefcase, 
    title: "Professional Services", 
    description: "Websites that establish credibility, capture leads, and automate client intake for consultants, lawyers, and service providers.", 
    features: ["Lead qualification forms", "Appointment scheduling", "Client portals", "Case study showcases"], 
    gradient: "from-blue-500/20 to-cyan-500/20", 
    accent: "text-blue-400", 
    border: "hover:border-blue-500/40", 
    image: "/images/generated/solutions-professional-services.png",
    video: "/media/generated/resources-lead-generation.mp4"
  },
  { 
    icon: Building2, 
    title: "Agencies & Studios", 
    description: "Portfolio websites that win clients with stunning case studies, streamlined project inquiries, and automated proposal generation.", 
    features: ["Dynamic portfolios", "Project inquiry forms", "Team showcases", "Client testimonials"], 
    gradient: "from-purple-500/20 to-violet-500/20", 
    accent: "text-purple-400", 
    border: "hover:border-purple-500/40", 
    image: "/images/generated/solutions-agencies.png",
    video: "/media/generated/resources-ai-copywriting.mp4"
  },
  { 
    icon: Wrench, 
    title: "Contractors & Trades", 
    description: "Local business websites that generate leads, showcase completed projects, and make it easy for customers to request quotes.", 
    features: ["Quote request forms", "Project galleries", "Service area maps", "Review integration"], 
    gradient: "from-cyan-500/20 to-teal-500/20", 
    accent: "text-cyan-400", 
    border: "hover:border-cyan-500/40", 
    image: "/images/generated/solutions-contractors.png",
    videoSources: [
      { src: "/media/Roofers.mp4", label: "Roofers" },
      { src: "/media/Plumbers.mp4", label: "Plumbers" },
      { src: "/media/Mechanics.mp4", label: "Mechanics" },
      { src: "/media/HVAC Specialists.mp4", label: "HVAC Specialists" },
    ]
  },
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

const systemsLayers = [
  {
    title: "Industry Workflows",
    subtitle: "Templates become launch-ready operating systems.",
    accent: "from-blue-500/25 via-cyan-500/20 to-transparent",
    stats: [
      { label: "Templates connected", value: "42" },
      { label: "Lead sources synced", value: "8" },
      { label: "Funnel readiness", value: "94%" },
    ],
    chips: ["CRM", "Scheduling", "Email capture"],
  },
  {
    title: "AI Automation Layer",
    subtitle: "Routing, follow-up, and content updates run in parallel.",
    accent: "from-fuchsia-500/20 via-violet-500/20 to-transparent",
    stats: [
      { label: "Active automations", value: "17" },
      { label: "Copy tests live", value: "24" },
      { label: "Reply time", value: "< 30s" },
    ],
    chips: ["Assistant", "Nurture", "Smart forms"],
  },
  {
    title: "Optimization Engine",
    subtitle: "Conversion signals loop back into every page section.",
    accent: "from-rose-500/20 via-orange-500/20 to-transparent",
    stats: [
      { label: "Experiments this week", value: "31" },
      { label: "Conversion lift", value: "+38%" },
      { label: "Winning variants", value: "12" },
    ],
    chips: ["Heatmaps", "A/B loops", "Revenue alerts"],
  },
]

function SystemsShowcaseSection() {
  const [activeLayer, setActiveLayer] = useState(0)
  const layerColors = ["text-cyan-300", "text-fuchsia-300", "text-orange-300"]
  const dotColors = ["bg-cyan-400", "bg-fuchsia-400", "bg-orange-400"]
  const barColors = ["from-cyan-400 to-blue-500", "from-fuchsia-400 to-purple-500", "from-orange-400 to-rose-500"]

  // Auto-cycle every 5s
  useEffect(() => {
    const timer = setInterval(() => setActiveLayer((p) => (p + 1) % 3), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="how-it-works" className="relative overflow-hidden border-b border-[#1e293b]/50 bg-black px-4 py-20 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_36%),radial-gradient(circle_at_85%_15%,rgba(217,153,255,0.14),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(255,153,161,0.12),transparent_24%)]" />
      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          {/* ── Left: Copy + layer selector ── */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Modular Design Systems
            </div>
            <h2 className="mt-6 max-w-xl text-3xl font-bold tracking-tight text-white lg:text-5xl">
              Your solution becomes a living growth system.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60 lg:text-lg">
              Three interconnected system layers — from pre-configured industry workflows to real-time optimization engines that continuously improve your site.
            </p>

            {/* ── Layer tabs ── */}
            <div className="mt-8 space-y-2">
              {systemsLayers.map((layer, i) => (
                <button
                  key={layer.title}
                  onClick={() => setActiveLayer(i)}
                  className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${
                    activeLayer === i
                      ? "border-white/15 bg-white/[0.06]"
                      : "border-transparent bg-transparent hover:border-white/8 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                    activeLayer === i ? `${dotColors[i]} text-black` : "bg-white/10 text-white/40"
                  }`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold transition-colors ${activeLayer === i ? "text-white" : "text-white/50"}`}>
                      {layer.title}
                    </div>
                    <div className={`mt-0.5 text-xs transition-colors ${activeLayer === i ? "text-white/50" : "text-white/30"}`}>
                      {layer.chips.join(" · ")}
                    </div>
                  </div>
                  {/* timer bar */}
                  {activeLayer === i && (
                    <div className="ml-auto h-1 w-16 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${barColors[i]}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        key={`bar-${i}-${activeLayer}`}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <Button size="lg" asChild className="bg-white text-black hover:bg-white/90">
                <Link href="/get-started">Build Your System <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          {/* ── Right: Animated panel ── */}
          <div className="relative flex items-center justify-center" style={{ perspective: "1200px" }}>
            <div className="relative w-full max-w-[620px]">
              <AnimatePresence mode="wait">
                {activeLayer === 0 && (
                  <motion.div
                    key="layer-0"
                    initial={{ opacity: 0, y: 40, rotateX: 8 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -40, rotateX: -8 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11182d]/95 to-[#070b16]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.28em] text-cyan-300/90">System Layer 01</div>
                        <div className="mt-2 text-xl font-semibold text-white">{systemsLayers[0].title}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Live blueprint</div>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {systemsLayers[0].stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <div className="text-2xl font-semibold text-white">{stat.value}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-cyan-500/12 via-blue-500/8 to-transparent p-5">
                      <div className="mb-3 text-sm font-medium text-white/75">Pre-configured pipeline</div>
                      <div className="space-y-3">
                        {[78, 58, 86].map((width, index) => (
                          <div key={width} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-white/35">
                              <span>{systemsLayers[0].chips[index]}</span>
                              <span>{width}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10">
                              <motion.div
                                className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${width}%` }}
                                transition={{ duration: 0.8, delay: index * 0.15 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeLayer === 1 && (
                  <motion.div
                    key="layer-1"
                    initial={{ opacity: 0, y: 40, rotateX: 8 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -40, rotateX: -8 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#171127]/95 to-[#090d18]/95 p-6 shadow-[0_40px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                  >
                    <div className={`absolute inset-x-0 top-0 h-24 rounded-t-[2rem] bg-gradient-to-r ${systemsLayers[1].accent}`} />
                    <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.28em] text-fuchsia-300/90">System Layer 02</div>
                        <div className="mt-2 text-xl font-semibold text-white">{systemsLayers[1].title}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Automation active</div>
                    </div>
                    <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm font-medium text-white/75">Action graph</div>
                          <div className="text-xs text-white/35">Real-time</div>
                        </div>
                        <div className="space-y-2">
                          {[
                            ["Quote submitted", "Intent scored", "CRM assigned"],
                            ["Follow-up drafted", "Synced", "Meeting booked"],
                            ["Page personalized", "Variant set", "Revenue tracked"],
                          ].map((row) => (
                            <div key={row[0]} className="grid gap-1.5 md:grid-cols-3">
                              {row.map((item) => (
                                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11px] text-white/60">{item}</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {systemsLayers[1].stats.map((stat) => (
                          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xl font-semibold text-white">{stat.value}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeLayer === 2 && (
                  <motion.div
                    key="layer-2"
                    initial={{ opacity: 0, y: 40, rotateX: 8 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -40, rotateX: -8 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#241119]/95 to-[#0b1019]/95 p-6 shadow-[0_45px_110px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                  >
                    <div className={`absolute inset-x-0 top-0 h-24 rounded-t-[2rem] bg-gradient-to-r ${systemsLayers[2].accent}`} />
                    <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.28em] text-orange-300/90">System Layer 03</div>
                        <div className="mt-2 text-xl font-semibold text-white">{systemsLayers[2].title}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Optimization loop</div>
                    </div>
                    <div className="relative mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                      <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
                        <div className="mb-3 text-sm font-medium text-white/75">Performance snapshot</div>
                        <div className="space-y-3">
                          {systemsLayers[2].stats.map((stat, index) => (
                            <div key={stat.label} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/35">
                                <span>{stat.label}</span>
                                <span>{stat.value}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/10">
                                <motion.div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${72 + index * 8}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.15 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-sm font-medium text-white/75">Winning sequence</div>
                          <div className="text-xs text-white/35">Adaptive</div>
                        </div>
                        <div className="grid gap-2">
                          {[
                            "Hero adapts by traffic source",
                            "AI qualifies budget & urgency",
                            "Offers reorder by scroll depth",
                            "Revenue promotes best CTA",
                          ].map((item) => (
                            <div key={item} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-[12px] text-white/65">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-orange-300" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Solution Video Player ─── multi-video with labeled tabs (Contractors) or single video ── */
function SolutionVideoPlayer({ solution }: { solution: typeof solutions[number] }) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [currentVideo, setCurrentVideo] = useState(0)

  const videos = solution.videoSources ?? (solution.video ? [{ src: solution.video, label: "" }] : [])

  const handleVideoEnded = useCallback((idx: number) => {
    if (idx !== currentVideo) return
    const next = (idx + 1) % videos.length
    setCurrentVideo(next)
    videoRefs.current[next]?.play().catch(() => {})
  }, [currentVideo, videos.length])

  // Start the active video when it changes
  useEffect(() => {
    if (videos.length > 0) {
      const v = videoRefs.current[currentVideo]
      if (v) {
        v.currentTime = 0
        v.play().catch(() => {})
      }
    }
  }, [currentVideo, videos.length])

  const hasLabels = videos.some((v) => v.label)

  return (
    <div className="relative flex h-full w-full flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#06091A]/80">
        {videos.length > 0 ? (
          videos.map((v, i) => (
            <video
              key={v.src}
              ref={(el) => { videoRefs.current[i] = el }}
              src={v.src}
              muted
              playsInline
              preload="metadata"
              poster={v.src.replace('/media/', '/media/posters/').replace('.mp4', '.jpg')}
              onEnded={() => handleVideoEnded(i)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${i === currentVideo ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            />
          ))
        ) : (
          <Image
            src={solution.image}
            alt={`${solution.title} preview`}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        )}
        {/* Browser chrome overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a12]/10 via-[#050a12]/20 to-[#050a12]/80 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 flex items-center gap-1.5 border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur-sm">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <span className="h-3 w-3 rounded-full bg-green-500/60" />
          <div className="ml-2 flex-1 rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/30">omniweb.ai/your-site</div>
        </div>
      </div>

      {/* Video selector tabs — shown when there are multiple labeled videos */}
      {hasLabels && videos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {videos.map((v, i) => (
            <button
              key={v.src}
              onClick={() => setCurrentVideo(i)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                i === currentVideo
                  ? `${solution.accent} border border-current/30 bg-current/10`
                  : "border border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [heroIdx, setHeroIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % solutions.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroHeadlines.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#06091A]">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />
      <Header />
      <main className="relative flex-1 pt-16">

        {/* ── Hero (Box.com-inspired) ─────────────────────────────── */}
        <section id="solutions-overview" className="relative min-h-screen overflow-hidden border-b border-white/10">
          {/* Soft radial background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(168,85,247,0.08),transparent_50%)]" />

          {/* ── Top: Heading + Subtitle + CTAs ── */}
          <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-32 text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="site-eyebrow mb-6"
            >
              <span className="text-white">OMNIWEB</span> &nbsp;|&nbsp; <span className="opacity-80">SOLUTIONS</span>
            </motion.p>

            <div className="relative max-w-5xl" style={{ minHeight: "7rem" }}>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`h-${heroIdx}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl"
                >
                  <span className={`bg-gradient-to-r ${heroHeadlines[heroIdx].color} bg-clip-text text-transparent`}>
                    {heroHeadlines[heroIdx].line1}
                  </span>
                  <br />
                  <span className={`bg-gradient-to-r ${heroHeadlines[heroIdx].color} bg-clip-text text-transparent`}>
                    {heroHeadlines[heroIdx].line2}
                  </span>
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="mx-auto mt-6 max-w-2xl" style={{ minHeight: "3.5rem" }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`s-${heroIdx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  className="text-lg leading-relaxed text-cyan-200 lg:text-xl"
                >
                  {heroSubheadings[heroIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-500">
                <Link href="/get-started">
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 rounded-full border-white/20 bg-transparent px-8 text-sm font-semibold text-white hover:bg-white/10">
                <Link href="#industry-solutions">
                  Contact us
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* ── Bottom: Background Image ── */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/generated/WebDevelopers.png"
              alt="Web Development"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06091A]/40 via-[#06091A]/25 to-[#06091A]/80" />
          </div>

            {/* Bottom fade into dark bg */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06091A] to-transparent z-[1]" />
        </section>
        {/* ── Solution Tabs ──────────────────────────────────────────── */}
        <section id="industry-solutions" className="bg-[#050811] px-4 py-24 lg:px-8 border-y border-[#1e293b]/50">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">BUILT FOR YOUR INDUSTRY</h2>
              <p className="mx-auto max-w-xl text-[14px] text-slate-400">Pre-configured for your specific industry needs — so you start with everything already tuned for maximum performance.</p>
            </div>
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              {solutions.map((s, i) => (
                <button 
                  key={s.title} 
                  onClick={() => setActiveTab(i)} 
                  className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeTab === i ? "text-white" : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"}`}
                >
                  {activeTab === i && (
                    <motion.div 
                      layoutId="activeTabBadge" 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20" 
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <s.icon className={`relative z-10 h-4 w-4 ${activeTab === i ? "text-white" : "site-icon-accent"}`} />
                  <span className="relative z-10">{s.title}</span>
                </button>
              ))}
            </div>
            <div className="relative mt-8 min-h-[500px]">
              <AnimatePresence mode="wait">
                {solutions.map((solution, i) => i === activeTab && (
                  <motion.div 
                    key={solution.title}
                    initial={{ opacity: 0, x: 50, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -50, filter: "blur(8px)" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`absolute inset-0 kling-panel-strong overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${solution.gradient} p-8 lg:p-12 ${solution.border}`}
                  >
                    <div className="grid h-full items-center gap-12 lg:grid-cols-2">
                      <div>
                        <div className="site-icon-chip mb-6 inline-flex h-14 w-14 backdrop-blur-sm">
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
                      <SolutionVideoPlayer solution={solution} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ─── BLOCK 1: E-Commerce Deep Dive — image right ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">E-Commerce</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Storefronts That Sell While You Sleep</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Most online stores leak revenue at the same three points: unanswered product questions, abandoned carts, and slow post-purchase follow-up. Omniweb fixes all three with AI that responds instantly.</p>
                  <p>Voice and chat agents answer sizing questions, compare products, recover abandoned carts, and capture contact details — all in real time, 24/7, without adding headcount to your support team.</p>
                  <p>The result: higher average order value, more recovered revenue, and a shopping experience that feels personal at scale. Stores on Omniweb see an average 38% lift in conversions within the first 30 days.</p>
                </div>
              </div>
              <div>
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/generated/solutions-ecommerce.png" alt="E-Commerce AI storefront" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BLOCK 2: Professional Services — image left (reversed) ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/professional-services.jpg" alt="Professional services AI intake" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Professional Services</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Client Intake That Never Sleeps</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Law firms, consultancies, and accounting practices lose leads because intake is slow, qualification is manual, and staff spend too much time on repetitive screening questions.</p>
                  <p>Omniweb&apos;s AI handles the first conversation — answering FAQs, collecting case context, assessing urgency, and routing qualified prospects directly to the right team member with a structured summary.</p>
                  <p>Firms using Omniweb report 4× faster intake, 85% lead qualification accuracy, and a measurable drop in admin hours per week. Your team focuses on billable work, not phone tag.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BLOCK 3: Contractors & Trades — image right ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Contractors &amp; Trades</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">More Booked Jobs, Fewer Missed Calls</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Homeowners call after hours, send vague quote requests, and disappear before your team can follow up. Every missed call is lost revenue — and your competitors answer faster.</p>
                  <p>Omniweb qualifies every lead automatically: service area, job type, urgency, and budget. Hot opportunities get routed to booking or callbacks immediately. Low-intent inquiries get filtered out before they waste your crew&apos;s time.</p>
                  <p>Roofers, plumbers, HVAC specialists, and mechanics on Omniweb see 52% more booked jobs and respond to every lead within 60 seconds — day or night.</p>
                </div>
              </div>
              <div>
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/generated/solutions-contractors.png" alt="Contractor lead management AI" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BLOCK 4: Agencies — image left (reversed) ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/generated/solutions-agencies.png" alt="Agency portfolio and AI intake" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-purple-400">Agencies &amp; Studios</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Win More Clients, Automate the Pitch</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Creative agencies live and die by their portfolio — but a beautiful website means nothing if inquiries go unanswered or proposals take days to send. Speed wins in a competitive market.</p>
                  <p>Omniweb turns your portfolio into a client acquisition engine. AI qualifies project inquiries, collects briefs, estimates scope, and routes high-value prospects to the right partner or team lead.</p>
                  <p>Agencies on Omniweb report 3× more inbound project inquiries and a 40% reduction in time spent on unqualified leads. Your creative team stays creative — the AI handles the intake.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BLOCK 5: The AI Advantage — full-width story section ─── */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">The AI Advantage</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Why Businesses Switch to Omniweb</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Traditional websites are static brochures. They look fine, but they don&apos;t sell. They don&apos;t answer questions at midnight. They don&apos;t qualify leads. They don&apos;t follow up when your team is busy.</p>
                  <p>Omniweb is different. Every site we build comes with AI voice agents, chat assistants, and lead automation baked in — not bolted on. The system learns your business, your customers, and your conversion patterns, then optimizes continuously.</p>
                  <p>The result isn&apos;t just a better website. It&apos;s a revenue system that works 24/7 — answering, qualifying, booking, and routing so your team can focus on what they do best: closing deals and delivering exceptional service.</p>
                </div>
              </div>
              <div>
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/ai-integration.jpg" alt="AI integration dashboard" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SystemsShowcaseSection />

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <section id="results" className="bg-white/[0.02] px-4 py-16 lg:px-8 border-b border-[#1e293b]/50">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="mb-2 text-5xl font-bold tracking-tight text-white lg:text-6xl transition-all duration-300 group-hover:scale-105 group-hover:text-cyan-400">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-medium tracking-wide text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────── */}
        <section id="features" className="border-t border-white/5 bg-[#0a0f25] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 text-center lg:text-left lg:pl-4">
              <h2 className="text-2xl font-bold tracking-wider text-white lg:text-3xl">KEY FEATURES</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.slice(0, 4).map((feature, i) => (
                <motion.div 
                  key={feature.title} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group rounded-2xl border border-[#1e293b] bg-[#111827] p-6 shadow-xl transition-all hover:border-[#3b82f6]/50 hover:bg-[#1f2937]"
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#1e293b] border border-white/5 ring-1 ring-white/10 group-hover:bg-[#2563eb]/20 group-hover:ring-[#3b82f6]/50 transition-colors">
                    <feature.icon className="h-6 w-6 text-[#3b82f6] group-hover:text-[#60a5fa]" />
                  </div>
                  <h3 className="mb-3 text-[15px] font-bold tracking-wide text-white uppercase">{feature.title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────── */}
        <section className="bg-[#050811] px-4 py-24 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-[1000px] text-center"
          >
            <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#211d51] via-[#10234a] to-[#0e3b52] px-8 py-16 shadow-2xl border border-white/5">
              <div className="relative z-10">
                <h2 className="mb-4 text-[26px] font-bold uppercase tracking-wider text-white lg:text-[32px]">READY TO BUILD YOUR WEBSITE WITH AI?</h2>
                <p className="mb-10 text-[15px] text-white/80">Start your 14-day free trial today.</p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild className="h-12 rounded-lg bg-[#3b82f6] px-8 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#2563eb]">
                    <Link href="/get-started">START FOR FREE</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
