"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Bot, MessageSquare, Mic, PlugZap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { AIWidget } from "@/components/ai-widget"
import { FeatureCard } from "@/components/feature-card"
import { Button } from "@/components/ui/button"

const heroVideos = ["/media/web-developers.mp4", "/media/female-dev.mp4"]

const rotatingHeadlines = [
  {
    line1: "AI CAPABILITIES BUILT TO",
    line2: "GENERATE REVENUE.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    line1: "SMART AUTOMATION THAT",
    line2: "CLOSES MORE DEALS.",
    color: "from-violet-400 to-purple-500",
  },
  {
    line1: "VOICE & CHAT AGENTS THAT",
    line2: "NEVER SLEEP.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    line1: "LEAD INTELLIGENCE THAT",
    line2: "DRIVES GROWTH.",
    color: "from-amber-400 to-orange-500",
  },
  {
    line1: "CONVERSION ENGINES THAT",
    line2: "SCALE YOUR BUSINESS.",
    color: "from-rose-400 to-pink-500",
  },
]

const rotatingSubheadings = [
  "Every feature is designed around faster response times, better qualification, and less operational drag.",
  "From first touch to closed deal — AI handles the repetitive work so your team focuses on revenue.",
  "Capture intent, qualify buyers, and route opportunities automatically — around the clock.",
  "Turn every website visit, call, and chat into a qualified pipeline opportunity.",
  "Built for businesses that want more conversions without more headcount.",
]

const featureGroups = [
  {
    icon: Mic,
    title: "AI Voice Agents",
    benefit: "Never miss a lead",
    summary: "AI-powered voice agents answer inbound calls, qualify the opportunity, and push the right next step without waiting on your team.",
    bullets: ["Answer sales calls after hours", "Qualify urgency, budget, and fit", "Route to booking or callback flows"],
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistants",
    benefit: "Convert site traffic",
    summary: "Chat assistants respond instantly, collect buyer context, and move visitors toward calls, demos, or purchases while keeping the experience natural.",
    bullets: ["Website and landing-page chat", "FAQ handling + objection support", "Lead capture and handoff"],
  },
  {
    icon: Bot,
    title: "Lead Qualification Automation",
    benefit: "Prioritize the right buyers",
    summary: "Score, summarize, and segment every lead so your reps focus on real opportunities instead of sorting through low-intent inquiries.",
    bullets: ["Qualification forms + AI scoring", "Intent and urgency summaries", "Automatic CRM creation"],
  },
  {
    icon: PlugZap,
    title: "CRM + Workflow Automation",
    benefit: "Reduce manual work",
    summary: "Connect your AI front-end to the tools your business already runs on, then automate follow-up, reminders, and routing from one system.",
    bullets: ["CRM, calendar, and webhook triggers", "Automated follow-up sequences", "Booking, ticketing, and alerts"],
  },
]

export default function FeaturesPage() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const handleVideoEnded = useCallback(
    (idx: number) => {
      if (idx !== currentVideo) return
      const next = (idx + 1) % heroVideos.length
      setCurrentVideo(next)
      videoRefs.current[next]?.play().catch(() => {})
    },
    [currentVideo]
  )

  useEffect(() => {
    videoRefs.current[0]?.play().catch(() => {})
  }, [])

  // Rotate headlines every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % rotatingHeadlines.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <PageLayout>
      {/* ─── FULL-SCREEN SEQUENTIAL VIDEO HERO ─── */}
      <section id="features-hero" className="relative min-h-dvh overflow-hidden border-b border-white/10 bg-[#050a12]">
        {/* Videos stacked — only the active one is visible */}
        <div className="absolute inset-0 z-0">
          {heroVideos.map((src, i) => (
            <video
              key={src}
              ref={(el) => { videoRefs.current[i] = el }}
              src={src}
              muted
              playsInline
              preload="auto"
              poster={src.replace('/media/', '/media/posters/').replace('.mp4', '.jpg')}
              onEnded={() => handleVideoEnded(i)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === currentVideo ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {/* Overlays for text legibility */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a12] via-transparent to-[#050a12]/40" />
        </div>

        {/* Centered content */}
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-32 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="site-eyebrow mb-5"
          >
            <span className="text-white">OMNIWEB</span> &nbsp;|&nbsp; <span className="opacity-80">FEATURES</span>
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
            className="site-h2 relative max-w-4xl"
            style={{ minHeight: "5.5rem" }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={headlineIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="block"
              >
                <span className="text-white/90">{rotatingHeadlines[headlineIndex].line1}</span>
                <br />
                <span className={`bg-gradient-to-r ${rotatingHeadlines[headlineIndex].color} bg-clip-text text-transparent`}>
                  {rotatingHeadlines[headlineIndex].line2}
                </span>
              </motion.span>
            </AnimatePresence>
          </motion.h2>

          <div className="mx-auto mt-6 max-w-2xl" style={{ minHeight: "3.5rem" }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={headlineIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="site-section-copy"
              >
                {rotatingSubheadings[headlineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Badge cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {["AI Voice Agents", "Chat Assistants", "Lead Automation", "CRM Integration"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
            className="mt-8"
          >
            <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-500">
              <Link href="/get-started">
                Start Your Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── SOLUTIONS VIDEO MARQUEE ─── */}
      <section className="overflow-hidden border-b border-white/10 bg-white/[0.02] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <p className="site-eyebrow mb-4">Solutions</p>
          <h2 className="site-h2 mx-auto max-w-3xl">
            AI that works across <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">every industry</span>
          </h2>
          <p className="site-section-copy mx-auto mt-4 max-w-2xl">
            From storefronts to service calls — see how Omniweb powers real businesses with voice, chat, and lead automation.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050a12] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050a12] to-transparent" />
          <div className="flex w-max animate-marquee gap-5">
            {[
              { src: "/media/Doctors.mp4", label: "Doctors" },
              { src: "/media/Lawyers.mp4", label: "Lawyers" },
              { src: "/media/Dentists.mp4", label: "Dentists" },
              { src: "/media/Accountant.mp4", label: "Accountants" },
              { src: "/media/Roofers.mp4", label: "Roofers" },
              { src: "/media/Plumbers.mp4", label: "Plumbers" },
              { src: "/media/HVAC Specialists.mp4", label: "HVAC Specialists" },
              { src: "/media/Mechanics.mp4", label: "Mechanics" },
              { src: "/media/shopify rack.mp4", label: "Shopify Stores" },
              { src: "/media/Main store.mp4", label: "Retail Stores" },
              { src: "/media/e-commerce store.mp4", label: "E-Commerce" },
              { src: "/media/Beautiful lady store.mp4", label: "Beauty & Fashion" },
              { src: "/media/Doctors.mp4", label: "Doctors" },
              { src: "/media/Lawyers.mp4", label: "Lawyers" },
              { src: "/media/Dentists.mp4", label: "Dentists" },
              { src: "/media/Accountant.mp4", label: "Accountants" },
              { src: "/media/Roofers.mp4", label: "Roofers" },
              { src: "/media/Plumbers.mp4", label: "Plumbers" },
              { src: "/media/HVAC Specialists.mp4", label: "HVAC Specialists" },
              { src: "/media/Mechanics.mp4", label: "Mechanics" },
              { src: "/media/shopify rack.mp4", label: "Shopify Stores" },
              { src: "/media/Main store.mp4", label: "Retail Stores" },
              { src: "/media/e-commerce store.mp4", label: "E-Commerce" },
              { src: "/media/Beautiful lady store.mp4", label: "Beauty & Fashion" },
            ].map((v, i) => (
              <div key={`mv-${i}`} className="relative w-[min(540px,80vw)] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10" style={{ aspectRatio: "540/440" }}>
                <video src={v.src} muted autoPlay loop playsInline preload="auto" poster={v.src.replace('/media/', '/media/posters/').replace('.mp4', '.jpg')} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6">
                  <span className="text-xs font-semibold tracking-wide text-white/90">{v.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="chat-assistants" className="site-section-shell">
        <div className="site-shell grid gap-6 lg:grid-cols-2">
          {featureGroups.map((feature) => (
            <FeatureCard key={feature.title} {...feature} actionLabel="Launch this demo" />
          ))}
        </div>
      </section>

      {/* ─── BLOCK 1: Voice & Chat — image right ─── */}
      <section id="voice-agents" className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">AI Voice &amp; Chat</p>
              <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Conversations That Convert</h2>
              <div className="space-y-5 text-white/60 leading-relaxed">
                <p>Most businesses lose leads because no one answers fast enough. Phone calls go to voicemail, chat widgets collect dust, and by the time someone follows up, the buyer has moved on.</p>
                <p>Omniweb&apos;s AI voice and chat agents respond in under two seconds — answering questions, qualifying intent, and capturing contact details while the buyer is still engaged.</p>
                <p>Whether it&apos;s a homeowner requesting a roofing quote at midnight or a shopper asking about sizing on your Shopify store, the AI handles the conversation naturally and routes real opportunities to your team.</p>
              </div>
            </div>

            <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
              <div className="relative aspect-[16/10]">
                <Image
                  src="/images/AI Voice room.png"
                  alt="AI Voice agents in action"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOCK 2: Lead Automation — image left (reversed) ─── */}
      <section id="lead-automation" className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/images/AI lead automation.png"
                    alt="AI lead automation dashboard"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">Lead Automation</p>
              <h2 className="mb-6 text-3xl font-bold lg:text-4xl">From Inquiry to Pipeline, Automatically</h2>
              <div className="space-y-5 text-white/60 leading-relaxed">
                <p>Every conversation the AI handles generates structured data — buyer intent, budget signals, urgency level, and contact details — all pushed directly into your pipeline without manual entry.</p>
                <p>Qualification scores, follow-up sequences, and booking triggers fire automatically, so your team only touches the opportunities that are ready to close.</p>
                <p>The result: fewer hours spent on admin, more hours spent on revenue. Businesses using Omniweb&apos;s automation report saving 30+ hours per week on intake and follow-up alone.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOCK 3: Sales Pipeline — origin story style ─── */}
      <section className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Sales Pipeline</p>
              <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Achieve More with AI</h2>
              <div className="space-y-5 text-white/60 leading-relaxed">
                <p>Most sales pipelines leak revenue at every stage — leads go cold waiting for a callback, follow-ups fall through the cracks, and reps spend more time on data entry than closing deals.</p>
                <p>We built Omniweb because we lived this problem. After watching businesses lose thousands in potential revenue to slow response times and manual processes, we knew there had to be a better way.</p>
                <p>Our AI doesn&apos;t just capture leads — it qualifies them in real time, scores intent, triggers the right follow-up sequence, and delivers pipeline-ready opportunities directly to your team. Every conversation becomes structured data. Every interaction moves the deal forward.</p>
                <p>The result is a sales pipeline that never sleeps, never forgets a follow-up, and never lets a high-value lead slip away. Businesses on Omniweb close faster, waste less, and scale without adding headcount.</p>
              </div>
            </div>

            <div>
              <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/images/Sales1.webp"
                    alt="AI-powered sales pipeline dashboard"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section-shell border-y border-white/10 bg-white/[0.02]">
        <div className="site-shell-narrow">
          <AIWidget
            title="See the product the way your buyer would"
            description="Open voice or chat to experience a live AI assistant that answers questions, qualifies fit, captures details, and routes the right next step automatically."
          />
        </div>
      </section>
    </PageLayout>
  )
}
