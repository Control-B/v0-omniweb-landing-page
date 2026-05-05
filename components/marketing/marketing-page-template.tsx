"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { FAQAccordion } from "@/components/marketing/page-sections"

type CTA = { label: string; href: string }

export type MarketingPageContent = {
  overview?: string[]
  hero: {
    eyebrow: string
    title: string
    description: string
    primaryAction: CTA
    secondaryAction?: CTA
    stats?: Array<{ value: string; label: string }>
  }
  problem: { title: string; description: string }
  solution: { title: string; description: string }
  valueToIndustry: string
  valueToUser: string
  outcome: string
  features: string[]
  useCases: string[]
  howItWorks: string[]
  relatedLinks: Array<{ label: string; href: string; description: string }>
  faq?: Array<{ question: string; answer: string }>
  footerCta: {
    eyebrow: string
    title: string
    description: string
    primaryAction: CTA
    secondaryAction?: CTA
  }
}

type TemplateProps = {
  sectionLabel: string
  content: MarketingPageContent
  accentClassName?: string
  gradientFrom?: string
  gradientTo?: string
  heroVideos?: string[]
  sectionImage?: string
  sectionImage2?: string
}

type LayoutPattern = "split" | "feature-highlight" | "story" | "funnel"

const patternLabels: Record<LayoutPattern, string> = {
  split: "Hero + Split Content",
  "feature-highlight": "Feature Grid + Visual Highlight",
  story: "Story Flow Layout",
  funnel: "Conversion Funnel Layout",
}

const patternOrder: LayoutPattern[] = ["split", "feature-highlight", "story", "funnel"]

const visualVideos = {
  commerce: ["/media/Main store.mp4", "/media/Beautiful lady store.mp4", "/media/shopify rack.mp4", "/media/e-commerce store.mp4"],
  contractors: ["/media/Roofers.mp4", "/media/Plumbers.mp4", "/media/HVAC Specialists.mp4", "/media/Mechanics.mp4"],
  professionals: ["/media/Doctors.mp4", "/media/Lawyers.mp4", "/media/Dentists.mp4", "/media/Accountant.mp4"],
  builders: ["/media/web-developers.mp4", "/media/female-dev.mp4"],
  pitch: ["/media/ai-conversion-pitch-web.mp4", "/media/web-developers.mp4"],
}

const allVideos = [
  ...visualVideos.commerce,
  ...visualVideos.contractors,
  ...visualVideos.professionals,
  ...visualVideos.builders,
  "/media/e-commerce-video.mp4",
  "/media/ai-conversion-pitch.mp4",
  "/media/ai-conversion-pitch-web.mp4",
]

const imagePools = {
  commerce: ["/images/generated/solutions-ecommerce.png", "/images/E-commerceImage.png", "/images/ecommerce-solution.jpg", "/images/generated/template-commerce-pro.png"],
  contractors: ["/images/generated/solutions-contractors.png", "/images/ai-telephony.jpg", "/images/generated/template-local-pro.png", "/images/AI Voice room.png"],
  professionals: ["/images/generated/solutions-professional-services.png", "/images/professional-services.jpg", "/images/generated/company-value-customer-success.png", "/images/generated/company-perk-team.png"],
  resources: ["/images/generated/resources-knowledge-hub.png", "/images/generated/resources-guides-tutorials.png", "/images/generated/resources-case-studies.png", "/images/generated/resources-video-library.png", "/images/generated/resources-blog.png", "/images/generated/resources-free-templates.png"],
  company: ["/images/generated/company-innovation-team.png", "/images/generated/company-value-innovation.png", "/images/generated/company-value-transparency.png", "/images/generated/company-perk-growth.png", "/images/generated/company-perk-tools.png"],
  pricing: ["/images/generated/pricing-growth-dashboard.png", "/images/Sales1.webp", "/images/AI lead automation.png", "/images/NextGenAI.png"],
  features: ["/images/AI Voice room.png", "/images/AI chatflow.png", "/images/AI lead automation.png", "/images/ai-integration.jpg", "/images/ai-web-development.jpg", "/images/generated/WebDevelopers.png"],
}

const industryVideos = [
  { src: "/media/Doctors.mp4", label: "Patient intake" },
  { src: "/media/Lawyers.mp4", label: "Legal screening" },
  { src: "/media/Dentists.mp4", label: "Appointment booking" },
  { src: "/media/Accountant.mp4", label: "Professional services" },
  { src: "/media/Roofers.mp4", label: "Roofing leads" },
  { src: "/media/Plumbers.mp4", label: "Emergency calls" },
  { src: "/media/HVAC Specialists.mp4", label: "HVAC dispatch" },
  { src: "/media/Mechanics.mp4", label: "Repair intake" },
  { src: "/media/shopify rack.mp4", label: "Catalog guidance" },
  { src: "/media/Main store.mp4", label: "Retail conversion" },
  { src: "/media/e-commerce store.mp4", label: "Checkout assist" },
  { src: "/media/Beautiful lady store.mp4", label: "Fashion shoppers" },
]

const iconSet = [PhoneCall, MessageSquare, Target, CalendarCheck, TrendingUp, ShieldCheck, BarChart3, Users]

function getPageScore(key: string) {
  return [...key].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0)
}

function rotateArray<T>(items: T[], offset: number) {
  if (!items.length) return items
  const start = Math.abs(offset) % items.length
  return [...items.slice(start), ...items.slice(0, start)]
}

function getPattern(title: string, sectionLabel: string): LayoutPattern {
  const key = `${sectionLabel}:${title}`
  const score = getPageScore(key)
  return patternOrder[score % patternOrder.length]
}

function resolveVisuals({
  content,
  sectionLabel,
  heroVideos,
  sectionImage,
  sectionImage2,
}: {
  content: MarketingPageContent
  sectionLabel: string
  heroVideos: string[]
  sectionImage: string
  sectionImage2: string
}) {
  const text = `${sectionLabel} ${content.hero.title} ${content.hero.description} ${content.useCases.join(" ")}`.toLowerCase()
  const pageScore = getPageScore(`${sectionLabel}:${content.hero.title}`)
  const defaultImages = [sectionImage, sectionImage2, ...imagePools.features, ...imagePools.resources]
  let videoPool = [...heroVideos, ...visualVideos.builders]
  let imagePool = defaultImages
  let visualLabel = "AI revenue system"

  if (text.includes("shopify") || text.includes("ecommerce") || text.includes("e-commerce") || text.includes("cart")) {
    videoPool = visualVideos.commerce
    imagePool = imagePools.commerce
    visualLabel = "Commerce conversion layer"
  } else if (text.includes("contractor") || text.includes("plumbing") || text.includes("hvac") || text.includes("roof") || text.includes("home service") || text.includes("roadside")) {
    videoPool = visualVideos.contractors
    imagePool = imagePools.contractors
    visualLabel = "Field-service intake system"
  } else if (text.includes("healthcare") || text.includes("patient") || text.includes("legal") || text.includes("professional") || text.includes("appointment")) {
    videoPool = visualVideos.professionals
    imagePool = imagePools.professionals
    visualLabel = "Trust-based intake flow"
  } else if (text.includes("pricing") || text.includes("enterprise") || text.includes("telephony") || text.includes("combo")) {
    videoPool = visualVideos.pitch
    imagePool = imagePools.pricing
    visualLabel = "ROI planning dashboard"
  } else if (text.includes("resource") || text.includes("docs") || text.includes("guide") || text.includes("security") || text.includes("api")) {
    videoPool = visualVideos.builders
    imagePool = imagePools.resources
    visualLabel = "Operator knowledge hub"
  } else if (text.includes("company") || text.includes("partner") || text.includes("career") || text.includes("contact")) {
    videoPool = visualVideos.builders
    imagePool = imagePools.company
    visualLabel = "Omniweb operating system"
  }

  const mixedVideos = rotateArray([...videoPool, ...allVideos.filter((src) => !videoPool.includes(src))], pageScore)
  const mixedImages = rotateArray([...imagePool, ...defaultImages.filter((src) => !imagePool.includes(src))], Math.floor(pageScore / 3))
  const marqueeVideos = rotateArray(industryVideos, pageScore).slice(0, 6)

  return {
    heroVideos: mixedVideos.slice(0, Math.min(4, mixedVideos.length)),
    primaryImage: mixedImages[0],
    secondaryImage: mixedImages[1] ?? mixedImages[0],
    marqueeVideos: [...marqueeVideos, ...marqueeVideos],
    visualLabel,
  }
}

function accentBg(accentClassName: string) {
  if (accentClassName.includes("cyan")) return "bg-cyan-400/10"
  if (accentClassName.includes("violet")) return "bg-violet-400/10"
  if (accentClassName.includes("emerald")) return "bg-emerald-400/10"
  if (accentClassName.includes("amber")) return "bg-amber-400/10"
  return "bg-sky-400/10"
}

function accentBorder(accentClassName: string) {
  if (accentClassName.includes("cyan")) return "border-cyan-400/25"
  if (accentClassName.includes("violet")) return "border-violet-400/25"
  if (accentClassName.includes("emerald")) return "border-emerald-400/25"
  if (accentClassName.includes("amber")) return "border-amber-400/25"
  return "border-sky-400/25"
}

function SectionIntro({ eyebrow, title, description, accentClassName }: { eyebrow: string; title: string; description?: string; accentClassName: string }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">{title}</h2>
      {description ? <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/55">{description}</p> : null}
    </div>
  )
}

function VideoStack({ videos, label, className = "" }: { videos: string[]; label: string; className?: string }) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    refs.current[active]?.play().catch(() => {})
  }, [active])

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl ${className}`}>
      <div className="relative aspect-[4/3] lg:aspect-[16/11]">
        {videos.map((src, index) => (
          <video
            key={`${src}-${index}`}
            ref={(node) => {
              refs.current[index] = node
            }}
            src={src}
            muted
            playsInline
            autoPlay={index === active}
            preload="metadata"
            onEnded={() => setActive((current) => (current + 1) % videos.length)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
        <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
          Autoplay Demo
        </div>
        <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">{label}</p>
          <p className="mt-1 text-sm font-semibold text-white">Live agent install preview</p>
          <div className="mt-3 flex gap-1.5">
            {videos.map((src, index) => (
              <span key={src} className={`h-1.5 flex-1 rounded-full ${index === active ? "bg-white" : "bg-white/20"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductMockup({ accentClassName, title, features }: { accentClassName: string; title: string; features: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08101d] p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Omniweb Console</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          {["Live", "Qualified", "Booked"].map((item, index) => (
            <div key={item} className={`rounded-xl border border-white/10 p-3 ${index === 0 ? accentBg(accentClassName) : "bg-white/[0.03]"}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${index === 0 ? accentClassName : "text-white/40"}`}>{item}</p>
              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div className={`h-full rounded-full bg-white/70 ${index === 0 ? "w-5/6" : index === 1 ? "w-2/3" : "w-1/2"}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accentClassName}`}>Revenue Workflow</p>
              <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
            </div>
            <Sparkles className={`h-5 w-5 ${accentClassName}`} />
          </div>
          <div className="space-y-3">
            {features.slice(0, 4).map((feature, index) => (
              <div key={feature} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${accentBg(accentClassName)} text-xs font-bold ${accentClassName}`}>{index + 1}</span>
                <p className="line-clamp-2 text-sm leading-6 text-white/68">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductUiSection({ content, accentClassName }: { content: MarketingPageContent; accentClassName: string }) {
  return (
    <section className="px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>Product UI</p>
          <h2 className="text-3xl font-bold text-white lg:text-4xl">A clear operating view for every workflow</h2>
          <p className="mt-5 text-[15px] leading-8 text-white/62">Each sub-page now includes a product-style UI mockup so visitors understand how Omniweb captures intent, routes work, and proves ROI.</p>
        </div>
        <ProductMockup accentClassName={accentClassName} title={content.hero.title} features={content.features} />
      </div>
    </section>
  )
}

function FeatureCard({ text, index, accentClassName }: { text: string; index: number; accentClassName: string }) {
  const Icon = iconSet[index % iconSet.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-[0_18px_60px_rgba(59,130,246,0.12)] ${accentBorder(accentClassName)}`}
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${accentBg(accentClassName)}`}>
        <Icon className={`h-5 w-5 ${accentClassName}`} />
      </div>
      <p className="text-sm leading-7 text-white/72 transition-colors group-hover:text-white/90">{text}</p>
    </motion.div>
  )
}

function MidPageCta({ content, accentClassName }: { content: MarketingPageContent; accentClassName: string }) {
  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/[0.08] via-white/[0.035] to-white/[0.02] p-6 shadow-2xl lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.24em] ${accentClassName}`}>Conversion Checkpoint</p>
            <h2 className="mt-2 text-2xl font-black text-white lg:text-3xl">Ready to see this flow on your site?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">Preview the agent, map your first workflow, and install the widget without changing your backend.</p>
          </div>
          <Button asChild className="h-12 rounded-full bg-blue-600 px-8 text-sm font-bold text-white hover:bg-blue-500">
            <Link href={content.hero.primaryAction.href}>
              {content.hero.primaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function HeroVisualCard({
  content,
  accentClassName,
  image,
  visualLabel,
}: {
  content: MarketingPageContent
  accentClassName: string
  image: string
  visualLabel: string
}) {
  const stats = content.hero.stats ?? []

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08101d] p-3 shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.55rem]">
        <Image src={image} alt={content.hero.title} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/92 via-[#050a12]/30 to-[#050a12]/20" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_32%,rgba(255,255,255,0.05)_68%,transparent)]" />
        <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
          {visualLabel}
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md">
          <p className={`text-xs font-bold uppercase tracking-[0.24em] ${accentClassName}`}>Modern AI workflow</p>
          <p className="mt-1 text-sm font-semibold text-white">{content.hero.title}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(stats.length ? stats.slice(0, 3) : [{ value: "24/7", label: "Coverage" }, { value: "<2s", label: "Response" }, { value: "1", label: "Widget" }]).map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
                <div className={`text-lg font-black ${accentClassName}`}>{stat.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/42">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection({
  content,
  pattern,
  accentClassName,
  gradientFrom,
  image,
  visualLabel,
}: {
  content: MarketingPageContent
  pattern: LayoutPattern
  accentClassName: string
  gradientFrom: string
  image: string
  visualLabel: string
}) {
  const split = pattern === "split"
  return (
    <section className={`relative overflow-hidden border-b border-white/10 ${split ? "px-4 py-24 lg:px-8 lg:py-32" : "min-h-[86dvh]"}`}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#050a12]" />
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl" style={{ background: gradientFrom }} />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
        {!split ? <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-18" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a12] via-[#050a12]/82 to-[#050a12]/68" />
      </div>

      <div className={`relative z-10 mx-auto max-w-7xl ${split ? "grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]" : "flex min-h-[86dvh] flex-col items-center justify-center px-6 py-32 text-center"}`}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={split ? "max-w-2xl" : "mx-auto max-w-5xl"}>
          <p className="site-eyebrow mb-6">
            <span className="text-white">OMNIWEB</span>
            &nbsp;|&nbsp;
            <span className="opacity-80">{content.hero.eyebrow}</span>
          </p>
          <h2 className={`font-black uppercase tracking-tight text-white ${split ? "text-4xl leading-[0.95] lg:text-6xl" : "text-4xl leading-tight lg:text-6xl xl:text-7xl"}`}>
            {content.hero.title}
          </h2>
          <p className={`mt-6 text-lg leading-relaxed text-white/65 ${split ? "max-w-xl" : "mx-auto max-w-2xl"}`}>{content.hero.description}</p>
          <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${split ? "" : "items-center justify-center"}`}>
            <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-500">
              <Link href={content.hero.primaryAction.href}>
                {content.hero.primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {content.hero.secondaryAction ? (
              <Button size="lg" asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-sm text-white hover:bg-white/10">
                <Link href={content.hero.secondaryAction.href}>{content.hero.secondaryAction.label}</Link>
              </Button>
            ) : null}
          </div>
          <div className={`mt-7 flex flex-wrap gap-2 ${split ? "" : "justify-center"}`}>
            {content.features.slice(0, 4).map((feature) => (
              <span key={feature} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/72 backdrop-blur-sm">
                {feature.split(" ").slice(0, 5).join(" ")}
              </span>
            ))}
          </div>
        </motion.div>

        {split ? (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
            <HeroVisualCard content={content} accentClassName={accentClassName} image={image} visualLabel={visualLabel} />
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}

function StatsBar({ stats, accentClassName }: { stats: Array<{ value: string; label: string }>; accentClassName: string }) {
  if (!stats.length) return null
  return (
    <section className="border-b border-white/10 bg-white/[0.025] px-4 py-12 lg:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-black/20 p-5 text-center transition-all hover:bg-white/[0.04]">
            <div className={`mb-1 text-3xl font-black tracking-tight lg:text-4xl ${accentClassName}`}>{stat.value}</div>
            <div className="text-xs font-medium uppercase tracking-widest text-white/45">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProblemSolutionSection({ content, accentClassName, pattern }: { content: MarketingPageContent; accentClassName: string; pattern: LayoutPattern }) {
  const painPoints = [content.problem.description, ...content.useCases.slice(0, 3)]
  return (
    <section className="bg-[#050811] px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionIntro eyebrow="Pain → Outcome" title={pattern === "funnel" ? "A funnel built to remove leakage" : "The path from friction to follow-up"} description="Each page now frames the business problem, the Omniweb system, and the measurable outcome in a clearer conversion sequence." accentClassName={accentClassName} />
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} className="rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-rose-950/10 p-7 lg:p-9">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-rose-300">Pain Points</p>
            <div className="space-y-4">
              {painPoints.slice(0, 4).map((point, index) => (
                <div key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-400/10 text-xs font-bold text-rose-300">{index + 1}</span>
                  <p className="text-sm leading-7 text-white/64">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} className={`rounded-[2rem] border ${accentBorder(accentClassName)} bg-gradient-to-br from-white/[0.075] to-white/[0.02] p-7 lg:p-9`}>
            <p className={`mb-5 text-xs font-bold uppercase tracking-[0.24em] ${accentClassName}`}>Omniweb Solution</p>
            <h2 className="text-2xl font-bold text-white lg:text-3xl">{content.solution.title}</h2>
            <p className="mt-5 text-[15px] leading-8 text-white/66">{content.solution.description}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[content.valueToIndustry, content.valueToUser, content.outcome].map((item, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className={`mb-2 text-xs font-black ${accentClassName}`}>0{index + 1}</p>
                  <p className="line-clamp-4 text-xs leading-6 text-white/58">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeatureHighlightSection({ content, accentClassName, image, pattern }: { content: MarketingPageContent; accentClassName: string; image: string; pattern: LayoutPattern }) {
  const visualFirst = pattern === "feature-highlight"
  return (
    <section className="border-y border-white/10 bg-white/[0.025] px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionIntro eyebrow="What's Included" title="Feature cards with a visual break" description="Plain lists become skimmable conversion cards, with one larger visual moment to break the grid and add context." accentClassName={accentClassName} />
        <div className="grid gap-4 lg:grid-cols-3">
          {visualFirst ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/10 lg:col-span-2 lg:row-span-2">
              <Image src={image} alt={content.hero.title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/88 via-[#050a12]/20 to-transparent" />
              <div className="absolute inset-x-6 bottom-6">
                <p className={`text-xs font-bold uppercase tracking-[0.24em] ${accentClassName}`}>Visual Highlight</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{content.hero.title} in action</h2>
              </div>
            </motion.div>
          ) : null}
          {content.features.slice(0, 6).map((feature, index) => (
            <FeatureCard key={feature} text={feature} index={index} accentClassName={accentClassName} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StoryFlowSection({ content, accentClassName, image }: { content: MarketingPageContent; accentClassName: string; image: string }) {
  const rows = [
    { eyebrow: "Problem", title: content.problem.title, body: content.problem.description },
    { eyebrow: "Solution", title: content.solution.title, body: content.solution.description },
    { eyebrow: "Benefit", title: "The outcome your team feels", body: content.outcome },
  ]
  return (
    <section className="px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionIntro eyebrow="Story Flow" title="A simple Z-pattern buyers can follow" description="Alternating content gives each page a more editorial rhythm without changing the underlying content model." accentClassName={accentClassName} />
        <div className="space-y-10">
          {rows.map((row, index) => (
            <div key={row.eyebrow} className={`grid items-center gap-8 lg:grid-cols-2 ${index % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <motion.div initial={{ opacity: 0, x: index % 2 ? 18 : -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 lg:p-9">
                <p className={`text-xs font-bold uppercase tracking-[0.24em] ${accentClassName}`}>{row.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold text-white lg:text-3xl">{row.title}</h2>
                <p className="mt-5 text-[15px] leading-8 text-white/64">{row.body}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: index % 2 ? -18 : 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} className="relative overflow-hidden rounded-[2rem] border border-white/10">
                <div className="relative aspect-[4/3]">
                  <Image src={image} alt={`${content.hero.title} ${row.eyebrow}`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/82 via-transparent to-[#050a12]/20" />
                  <div className="absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-black/50 px-5 py-3 backdrop-blur-md">
                    <span className={`text-xl font-black ${accentClassName}`}>0{index + 1}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection({ content, accentClassName, pattern }: { content: MarketingPageContent; accentClassName: string; pattern: LayoutPattern }) {
  return (
    <section className="bg-[#050811] px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionIntro eyebrow={patternLabels[pattern]} title="How the workflow launches" description="Every page keeps a clear setup path: capture context, automate the next step, and prove the result." accentClassName={accentClassName} />
        <div className="grid gap-4 lg:grid-cols-3">
          {content.howItWorks.map((step, index) => (
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.08 }} className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition-all hover:bg-white/[0.055]">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${accentBg(accentClassName)} text-lg font-black ${accentClassName}`}>{index + 1}</div>
              <p className="text-sm leading-8 text-white/66">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VisualBreakSection({ videos, label, accentClassName, content }: { videos: string[]; label: string; accentClassName: string; content: MarketingPageContent }) {
  return (
    <section className="px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <VideoStack videos={videos} label={label} />
        <div>
          <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>Visual Break</p>
          <h2 className="text-3xl font-bold text-white lg:text-4xl">Short demos make the use case obvious</h2>
          <p className="mt-5 text-[15px] leading-8 text-white/62">The page includes autoplay, muted media so visitors understand the agent experience quickly while keeping performance controlled with metadata preloading.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {content.useCases.slice(0, 4).map((useCase) => (
              <div key={useCase} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <CheckCircle2 className={`mb-3 h-5 w-5 ${accentClassName}`} />
                <p className="text-sm leading-6 text-white/66">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProofSection({ content, accentClassName, pattern }: { content: MarketingPageContent; accentClassName: string; pattern: LayoutPattern }) {
  const stats = content.hero.stats ?? []
  return (
    <section className="border-y border-white/10 bg-white/[0.025] px-4 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionIntro eyebrow={pattern === "funnel" ? "Proof" : "Business Case"} title="Metrics, trust, and next-step clarity" description="A dedicated proof block reinforces why the visitor should act now instead of comparing another vendor." accentClassName={accentClassName} />
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#08101d] p-7">
            <p className={`text-xs font-bold uppercase tracking-[0.24em] ${accentClassName}`}>Operator Note</p>
            <p className="mt-4 text-lg leading-8 text-white/78">“Omniweb gives teams a faster first response, cleaner qualification, and fewer manual handoffs without changing their existing tools.”</p>
            <p className="mt-5 text-sm text-white/42">Conversion team summary</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-black/20 p-6">
                <div className={`text-4xl font-black ${accentClassName}`}>{stat.value}</div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/42">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RelatedAndFaq({ content, accentClassName }: { content: MarketingPageContent; accentClassName: string }) {
  return (
    <>
      <section className="px-4 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Explore More" title="Related pages" accentClassName={accentClassName} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.relatedLinks.map((link, index) => (
              <motion.div key={link.href} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <Link href={link.href} className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#08101d] p-6 transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.05]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-[15px] font-bold text-white">{link.label}</h3>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white/70" />
                  </div>
                  <p className="text-sm leading-relaxed text-white/50 group-hover:text-white/65">{link.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {content.faq?.length ? (
        <section className="bg-[#050811] px-4 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <SectionIntro eyebrow="Questions" title="Frequently asked" accentClassName={accentClassName} />
            <FAQAccordion items={content.faq} />
          </div>
        </section>
      ) : null}
    </>
  )
}

function IndustryMarquee({ accentClassName, videos }: { accentClassName: string; videos: typeof industryVideos }) {
  return (
    <section className="overflow-hidden border-b border-white/10 bg-white/[0.02] py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
        <p className={`site-eyebrow mb-4 ${accentClassName}`}>Industry Proof</p>
        <h2 className="text-2xl font-bold text-white lg:text-3xl">One widget, many buying journeys</h2>
      </div>
      <div className="relative mt-9">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050a12] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050a12] to-transparent" />
        <div className="flex w-max animate-marquee gap-4">
          {videos.map((video, index) => (
            <div key={`${video.src}-${index}`} className="relative w-[min(360px,72vw)] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10" style={{ aspectRatio: "4/3" }}>
              <video src={video.src} muted autoPlay loop playsInline preload="metadata" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8">
                <span className="text-xs font-semibold tracking-wide text-white/90">{video.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ content, accentClassName, gradientFrom, gradientTo }: { content: MarketingPageContent; accentClassName: string; gradientFrom: string; gradientTo: string }) {
  return (
    <section className="px-4 py-20 lg:px-8 lg:py-24">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="mx-auto max-w-[1000px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#181d40] via-[#10234a] to-[#0e3b52] px-8 py-16 text-center shadow-2xl lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(96,165,250,0.22),transparent_60%)]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: gradientFrom }} />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl" style={{ background: gradientTo }} />
          <div className="relative z-10">
            {content.footerCta.eyebrow ? <p className={`mb-3 text-xs font-bold uppercase tracking-[0.28em] ${accentClassName}`}>{content.footerCta.eyebrow}</p> : null}
            <h2 className="mb-4 text-2xl font-black uppercase tracking-wide text-white lg:text-[2.2rem] leading-tight">{content.footerCta.title}</h2>
            <p className="mx-auto mb-10 max-w-xl text-[15px] text-white/70">{content.footerCta.description}</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-10 text-sm font-bold text-white hover:bg-blue-500">
                <Link href={content.footerCta.primaryAction.href}>
                  {content.footerCta.primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {content.footerCta.secondaryAction ? (
                <Button size="lg" asChild variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-10 text-sm text-white hover:bg-white/10">
                  <Link href={content.footerCta.secondaryAction.href}>{content.footerCta.secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function MarketingPageShell({
  sectionLabel,
  content,
  accentClassName = "text-cyan-300",
  gradientFrom = "rgba(59,130,246,0.18)",
  gradientTo = "rgba(168,85,247,0.10)",
  heroVideos = visualVideos.builders,
  sectionImage = "/images/AI Voice room.png",
  sectionImage2 = "/images/Sales1.webp",
}: TemplateProps) {
  const pattern = useMemo(() => getPattern(content.hero.title, sectionLabel), [content.hero.title, sectionLabel])
  const visuals = useMemo(
    () => resolveVisuals({ content, sectionLabel, heroVideos, sectionImage, sectionImage2 }),
    [content, heroVideos, sectionImage, sectionImage2, sectionLabel]
  )
  const stats = content.hero.stats ?? []
  const storyOrFeature =
    pattern === "story" ? (
      <StoryFlowSection content={content} accentClassName={accentClassName} image={visuals.secondaryImage} />
    ) : (
      <FeatureHighlightSection content={content} accentClassName={accentClassName} image={visuals.primaryImage} pattern={pattern} />
    )

  return (
    <PageLayout>
      <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#050a12] text-white">
        <HeroSection content={content} pattern={pattern} accentClassName={accentClassName} gradientFrom={gradientFrom} image={visuals.primaryImage} visualLabel={visuals.visualLabel} />
        <StatsBar stats={stats} accentClassName={accentClassName} />
        <IndustryMarquee accentClassName={accentClassName} videos={visuals.marqueeVideos} />
        {pattern === "feature-highlight" ? (
          <>
            {storyOrFeature}
            <ProblemSolutionSection content={content} accentClassName={accentClassName} pattern={pattern} />
            <ProductUiSection content={content} accentClassName={accentClassName} />
            <MidPageCta content={content} accentClassName={accentClassName} />
            <VisualBreakSection videos={visuals.heroVideos} label={visuals.visualLabel} accentClassName={accentClassName} content={content} />
            <ProcessSection content={content} accentClassName={accentClassName} pattern={pattern} />
          </>
        ) : pattern === "story" ? (
          <>
            <ProblemSolutionSection content={content} accentClassName={accentClassName} pattern={pattern} />
            <MidPageCta content={content} accentClassName={accentClassName} />
            {storyOrFeature}
            <VisualBreakSection videos={visuals.heroVideos} label={visuals.visualLabel} accentClassName={accentClassName} content={content} />
            <ProductUiSection content={content} accentClassName={accentClassName} />
            <ProcessSection content={content} accentClassName={accentClassName} pattern={pattern} />
          </>
        ) : pattern === "funnel" ? (
          <>
            <ProblemSolutionSection content={content} accentClassName={accentClassName} pattern={pattern} />
            <MidPageCta content={content} accentClassName={accentClassName} />
            <ProofSection content={content} accentClassName={accentClassName} pattern={pattern} />
            {storyOrFeature}
            <ProductUiSection content={content} accentClassName={accentClassName} />
            <VisualBreakSection videos={visuals.heroVideos} label={visuals.visualLabel} accentClassName={accentClassName} content={content} />
            <ProcessSection content={content} accentClassName={accentClassName} pattern={pattern} />
          </>
        ) : (
          <>
            <ProblemSolutionSection content={content} accentClassName={accentClassName} pattern={pattern} />
            <MidPageCta content={content} accentClassName={accentClassName} />
            {storyOrFeature}
            <ProductUiSection content={content} accentClassName={accentClassName} />
            <ProcessSection content={content} accentClassName={accentClassName} pattern={pattern} />
            <VisualBreakSection videos={visuals.heroVideos} label={visuals.visualLabel} accentClassName={accentClassName} content={content} />
          </>
        )}
        {pattern !== "funnel" ? <ProofSection content={content} accentClassName={accentClassName} pattern={pattern} /> : null}
        <RelatedAndFaq content={content} accentClassName={accentClassName} />
        <FinalCta content={content} accentClassName={accentClassName} gradientFrom={gradientFrom} gradientTo={gradientTo} />
      </div>
    </PageLayout>
  )
}

export function FeaturePageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="FEATURES"
      accentClassName="text-cyan-300"
      gradientFrom="rgba(34,211,238,0.18)"
      gradientTo="rgba(59,130,246,0.10)"
      heroVideos={visualVideos.builders}
      sectionImage="/images/AI Voice room.png"
      sectionImage2="/images/AI lead automation.png"
      {...props}
    />
  )
}

export function SolutionPageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="SOLUTIONS"
      accentClassName="text-violet-300"
      gradientFrom="rgba(139,92,246,0.18)"
      gradientTo="rgba(168,85,247,0.10)"
      heroVideos={visualVideos.contractors}
      sectionImage="/images/generated/solutions-ecommerce.png"
      sectionImage2="/images/generated/solutions-professional-services.png"
      {...props}
    />
  )
}

export function ResourcePageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="RESOURCES"
      accentClassName="text-emerald-300"
      gradientFrom="rgba(16,185,129,0.18)"
      gradientTo="rgba(20,184,166,0.10)"
      heroVideos={visualVideos.builders}
      sectionImage="/images/generated/resources-knowledge-hub.png"
      sectionImage2="/images/generated/resources-guides-tutorials.png"
      {...props}
    />
  )
}

export function PricingPageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="PRICING"
      accentClassName="text-amber-300"
      gradientFrom="rgba(245,158,11,0.18)"
      gradientTo="rgba(249,115,22,0.10)"
      heroVideos={visualVideos.pitch}
      sectionImage="/images/generated/pricing-growth-dashboard.png"
      sectionImage2="/images/Sales1.webp"
      {...props}
    />
  )
}

export function CompanyPageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="COMPANY"
      accentClassName="text-sky-300"
      gradientFrom="rgba(56,189,248,0.18)"
      gradientTo="rgba(99,102,241,0.10)"
      heroVideos={visualVideos.builders}
      sectionImage="/images/generated/company-innovation-team.png"
      sectionImage2="/images/generated/company-perk-team.png"
      {...props}
    />
  )
}
