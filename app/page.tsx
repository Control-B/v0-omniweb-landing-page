"use client"

import Link from "next/link"
import { Bot, Briefcase, MessageSquare, PhoneCall, ShoppingCart, Wrench } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FeatureCard } from "@/components/feature-card"
import { GlobeShowcaseSection } from "@/components/marketing/globe-showcase-section"
import { ScrollingMarqueeSection } from "@/components/marketing/scrolling-marquee-section"
import { PageHeroWithVideo } from "@/components/marketing/page-hero-with-video"
import { SolutionHeroBlock } from "@/components/solution-hero-block"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: PhoneCall,
    title: "AI Voice Agents",
    benefit: "Answer instantly",
    summary: "Use AI-powered voice agents to answer calls, qualify urgency, collect details, and route buyers without missing revenue after hours.",
    bullets: ["24/7 inbound handling", "Lead qualification scripts", "Booking and routing logic"],
    image: "/images/AI Voice room.png",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistants",
    benefit: "Convert more visitors",
    summary: "Turn site traffic into conversations that capture contact details, overcome objections, and move buyers into your pipeline faster.",
    bullets: ["Website chat + SMS style flows", "Intent capture and routing", "Escalation to human team"],
    image: "/images/AI chatflow.png",
  },
  {
    icon: Bot,
    title: "Lead Automation",
    benefit: "Reduce manual work",
    summary: "Automate qualification, handoff, and follow-up so your team spends time closing opportunities instead of chasing every inquiry manually.",
    bullets: ["CRM entry automation", "Follow-up sequences", "Pipeline-ready summaries"],
    image: "/images/AI lead automation.png",
  },
]

const solutions = [
  {
    icon: ShoppingCart,
    title: "Shopify Stores",
    problem: "Shoppers ask the same questions, abandon carts, and leave without buying when no one answers in the moment.",
    workflow: "AI voice and chat answer product questions, recover intent, capture contact info, and trigger follow-up for high-value buyers.",
    outcome: "More conversions, more recovered revenue, and fewer support interruptions for your team.",
    accent: "cyan" as const,
    videoSources: [
      "/media/Main store.mp4",
      "/media/Beautiful lady store.mp4",
      "/media/shopify rack.mp4",
      "/media/e-commerce store.mp4",
    ],
    stats: [
      { value: "+38%", label: "Conversions" },
      { value: "< 2s", label: "Response Time" },
      { value: "24/7", label: "Availability" },
      { value: "3×", label: "Cart Recovery" },
    ],
  },
  {
    icon: Wrench,
    title: "Contractors",
    problem: "Leads call after hours, request quotes inconsistently, and disappear before your team responds.",
    workflow: "AI qualifies service area, urgency, job type, and budget, then routes hot opportunities into booking or callbacks.",
    outcome: "More booked jobs, faster response times, and less wasted spend on low-intent inquiries.",
    accent: "violet" as const,
    videoSources: [
      "/media/Roofers.mp4",
      "/media/Plumbers.mp4",
      "/media/Mechanics.mp4",
      "/media/HVAC Specialists.mp4",
    ],
    stats: [
      { value: "60s", label: "Lead Follow-up" },
      { value: "+52%", label: "Booked Jobs" },
      { value: "$0", label: "Missed Calls" },
      { value: "30+", label: "Hrs Saved/Wk" },
    ],
  },
  {
    icon: Briefcase,
    title: "Professionals",
    problem: "Service firms lose leads because intake is slow, qualification is manual, and staff spend too much time on repetitive questions.",
    workflow: "AI screens visitors, handles FAQs, collects case or appointment context, and sends qualified summaries to your team.",
    outcome: "Higher-quality consultations, lower admin time, and a smoother client intake experience.",
    accent: "emerald" as const,
    videoSources: [
      "/media/Doctors.mp4",
      "/media/Lawyers.mp4",
      "/media/Dentists.mp4",
      "/media/Accountant.mp4",
    ],
    stats: [
      { value: "85%", label: "Qualified Leads" },
      { value: "4×", label: "Faster Intake" },
      { value: "98%", label: "Satisfaction" },
      { value: "$0", label: "Revenue Lost" },
    ],
  },
]

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />
      <Header />
      <main className="relative flex-1">
        <PageHeroWithVideo
          id="home-hero"
          size="large"
          eyebrow={<><span className="text-white">OMNIWEB</span> &nbsp;|&nbsp; <span className="opacity-80">AI REVENUE SYSTEM</span></>}
          title={
            <>
              <span className="site-display-tone-dark">AI THAT ANSWERS,</span>
              <br />
              <span className="site-display-tone-dark">QUALIFIES, AND BOOKS</span>
              <br />
              <span className="site-display-accent">MORE BUSINESS.</span>
            </>
          }
          description={null}
          localVideos={["/media/ai-conversion-pitch-web.mp4"]}
          videoTitle="Omniweb Demo Video"
          videoSlotLabel="AI SALES SYSTEM"
          primaryAction={{ label: "Start Your Setup", href: "/get-started", variant: "primary" }}
          secondaryAction={{ label: "Try Live Demo", href: "/demo", variant: "secondary" }}
          badges={["24/7 lead response", "< 60s follow-up speed", "30+ hrs manual work saved"]}
          note="Video introduces the system first, then the AI assistant helps visitors take the next step."
        />

        <GlobeShowcaseSection />

        <ScrollingMarqueeSection />

        <section id="features" className="site-section-shell relative overflow-hidden border-y border-white/15 bg-[#050a12]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(139,92,246,0.08),transparent_50%)]" />
          <div className="site-shell relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="site-eyebrow">Features</p>
              <h2 className="site-h2 mt-4">AI-first tools that move buyers forward</h2>
              <p className="site-section-copy mt-5 mx-auto max-w-2xl">
                Every touchpoint is designed to answer faster, qualify better, and automate what slows revenue down.
              </p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {features.map((feature, i) => (
                <FeatureCard key={feature.title} {...feature} index={i} accent={(["cyan", "violet", "emerald"] as const)[i]} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Solutions: three hero-style blocks ── */}
        <div id="solutions">
          <div className="border-b border-white/10 py-16 text-center">
            <p className="site-eyebrow">Solutions</p>
            <h2 className="site-h2 mx-auto mt-4 max-w-3xl">Built for the businesses where speed wins deals</h2>
          </div>
          {solutions.map((solution, i) => (
            <SolutionHeroBlock
              key={solution.title}
              {...solution}
              index={i}
              href="/solutions"
            />
          ))}
        </div>

        <section className="site-section-shell border-t border-white/15">
          <div className="site-shell-narrow text-center">
            <p className="site-eyebrow">How Omniweb wins</p>
            <h2 className="site-h2 mt-4">Less friction. More booked revenue.</h2>
            <p className="site-section-copy mx-auto mt-5 max-w-3xl">
              Video gets attention. AI captures intent. Automation keeps follow-up moving. Omniweb combines all three into one system your business can launch in days, not months.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
