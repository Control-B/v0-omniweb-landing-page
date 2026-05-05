"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react"
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

// ─── Industry video marquee ────────────────────────────────────────
const marqueeVideos = [
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
]
const doubledMarquee = [...marqueeVideos, ...marqueeVideos]

// ─── Mini components ───────────────────────────────────────────────
function FeatureCard({ text, index, accentClassName }: { text: string; index: number; accentClassName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/20 hover:bg-white/[0.06]"
    >
      <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${accentClassName}`} />
      <p className="text-sm leading-7 text-white/75 group-hover:text-white/90">{text}</p>
    </motion.div>
  )
}

function StepCard({ index, text, accentClassName, accentBg }: { index: number; text: string; accentClassName: string; accentBg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${accentBg} text-xl font-black`}>
        <span className={accentClassName}>{index + 1}</span>
      </div>
      <p className="text-[15px] leading-8 text-white/70">{text}</p>
    </motion.div>
  )
}

function UseCaseCard({ text, index }: { text: string; index: number }) {
  const variants = [
    { grad: "from-cyan-500/10 to-blue-600/10", border: "border-cyan-500/20", text: "text-cyan-300", dot: "bg-cyan-400" },
    { grad: "from-violet-500/10 to-purple-600/10", border: "border-violet-500/20", text: "text-violet-300", dot: "bg-violet-400" },
    { grad: "from-emerald-500/10 to-teal-600/10", border: "border-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400" },
    { grad: "from-amber-500/10 to-orange-600/10", border: "border-amber-500/20", text: "text-amber-300", dot: "bg-amber-400" },
    { grad: "from-rose-500/10 to-pink-600/10", border: "border-rose-500/20", text: "text-rose-300", dot: "bg-rose-400" },
    { grad: "from-sky-500/10 to-indigo-600/10", border: "border-sky-500/20", text: "text-sky-300", dot: "bg-sky-400" },
  ]
  const v = variants[index % variants.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`rounded-2xl border ${v.border} bg-gradient-to-br ${v.grad} p-6 transition-all hover:brightness-110`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${v.dot}`} />
        <span className={`text-xs font-bold uppercase tracking-widest ${v.text}`}>Use Case</span>
      </div>
      <p className="text-sm leading-7 text-white/80">{text}</p>
    </motion.div>
  )
}

// ─── Main Shell ────────────────────────────────────────────────────
function MarketingPageShell({
  sectionLabel,
  content,
  accentClassName = "text-cyan-300",
  gradientFrom = "rgba(59,130,246,0.18)",
  gradientTo = "rgba(168,85,247,0.10)",
  heroVideos = ["/media/web-developers.mp4", "/media/female-dev.mp4"],
  sectionImage = "/images/AI Voice room.png",
  sectionImage2 = "/images/Sales1.webp",
}: TemplateProps) {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [titleIdx, setTitleIdx] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const handleVideoEnded = useCallback(
    (idx: number) => {
      if (idx !== currentVideo) return
      const next = (idx + 1) % heroVideos.length
      setCurrentVideo(next)
      videoRefs.current[next]?.play().catch(() => {})
    },
    [currentVideo, heroVideos.length]
  )

  useEffect(() => {
    videoRefs.current[0]?.play().catch(() => {})
  }, [])

  const headlines = [content.hero.title.toUpperCase(), content.hero.eyebrow.toUpperCase()]
  const gradientColors = [
    "from-white to-white/80",
    "from-cyan-400 to-blue-500",
    "from-violet-400 to-purple-500",
    "from-emerald-400 to-teal-500",
  ]

  useEffect(() => {
    const t = setInterval(() => setTitleIdx((i) => (i + 1) % headlines.length), 4000)
    return () => clearInterval(t)
  }, [headlines.length])

  const stats = content.hero.stats ?? []
  const accentBg = accentClassName.includes("cyan")
    ? "bg-cyan-400/10"
    : accentClassName.includes("violet")
    ? "bg-violet-400/10"
    : accentClassName.includes("emerald")
    ? "bg-emerald-400/10"
    : accentClassName.includes("amber")
    ? "bg-amber-400/10"
    : "bg-sky-400/10"

  return (
    <PageLayout>
      <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#050a12]">

        {/* ─── HERO: full-screen sequential video ─── */}
        <section className="relative min-h-dvh overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 z-0">
            {heroVideos.map((src, i) => (
              <video
                key={src}
                ref={(el) => { videoRefs.current[i] = el }}
                src={src}
                muted
                playsInline
                preload="auto"
                onEnded={() => handleVideoEnded(i)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === currentVideo ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a12] via-transparent to-[#050a12]/40" />
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${gradientFrom}, transparent 60%)` }} />
          </div>

          <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-32 text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="site-eyebrow mb-6"
            >
              <span className="text-white">OMNIWEB</span>
              &nbsp;|&nbsp;
              <span className="opacity-80">{sectionLabel}</span>
            </motion.p>

            <div className="relative mx-auto w-full max-w-5xl" style={{ minHeight: "6rem" }}>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={titleIdx}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`text-4xl font-black tracking-tight lg:text-6xl xl:text-7xl bg-gradient-to-r ${gradientColors[titleIdx % gradientColors.length]} bg-clip-text text-transparent leading-tight`}
                >
                  {headlines[titleIdx]}
                </motion.h1>
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65"
            >
              {content.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              {content.features.slice(0, 4).map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/75 backdrop-blur-sm"
                >
                  {f.split(" ").slice(0, 4).join(" ")}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-500">
                <Link href={content.hero.primaryAction.href}>
                  {content.hero.primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {content.hero.secondaryAction && (
                <Button size="lg" asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-sm text-white hover:bg-white/10">
                  <Link href={content.hero.secondaryAction.href}>{content.hero.secondaryAction.label}</Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        {/* ─── STATS BAR ─── */}
        {stats.length > 0 && (
          <section className="border-b border-white/10 bg-white/[0.025] px-4 py-14 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="group text-center">
                    <div className={`mb-2 text-4xl font-black tracking-tight lg:text-5xl transition-all duration-300 group-hover:scale-105 ${accentClassName}`}>
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium tracking-wide text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── INDUSTRY VIDEO MARQUEE ─── */}
        <section className="overflow-hidden border-b border-white/10 bg-white/[0.02] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
            <p className={`site-eyebrow mb-4 ${accentClassName}`}>Built for Every Industry</p>
            <h2 className="text-2xl font-bold text-white lg:text-3xl">
              AI that works across{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                every business type
              </span>
            </h2>
          </div>
          <div className="relative mt-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050a12] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050a12] to-transparent" />
            <div className="flex w-max animate-marquee gap-4">
              {doubledMarquee.map((v, i) => (
                <div
                  key={`mv-${i}`}
                  className="relative w-[min(400px,72vw)] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10"
                  style={{ aspectRatio: "400/300" }}
                >
                  <video src={v.src} muted autoPlay loop playsInline preload="auto" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6">
                    <span className="text-xs font-semibold tracking-wide text-white/90">{v.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── OVERVIEW: TEXT LEFT + IMAGE RIGHT ─── */}
        {content.overview?.length ? (
          <section className="px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                >
                  <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>{sectionLabel}</p>
                  <h2 className="mb-8 text-3xl font-bold leading-tight text-white lg:text-4xl">{content.hero.title}</h2>
                  <div className="space-y-5">
                    {content.overview.map((para, i) => (
                      <p key={i} className="text-[15px] leading-8 text-white/65">{para}</p>
                    ))}
                  </div>
                  <div className="mt-10">
                    <Button asChild className="h-11 rounded-full bg-blue-600 px-7 text-sm font-semibold text-white hover:bg-blue-500">
                      <Link href={content.hero.primaryAction.href}>
                        {content.hero.primaryAction.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative overflow-hidden rounded-[2rem] border border-white/10"
                >
                  <div className="relative aspect-[4/3]">
                    <Image src={sectionImage} alt={content.hero.title} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/80 via-transparent to-[#050a12]/20" />
                    {stats.length > 0 && (
                      <div className="absolute bottom-6 left-6 rounded-2xl border border-white/10 bg-black/60 px-5 py-3 backdrop-blur-md">
                        <div className={`text-2xl font-black ${accentClassName}`}>{stats[0].value}</div>
                        <div className="text-xs text-white/60">{stats[0].label}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── PROBLEM / SOLUTION ─── */}
        <section className="bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>The Challenge</p>
              <h2 className="text-3xl font-bold text-white lg:text-4xl">Problem → Solution</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/8 to-rose-900/5 p-8 lg:p-10"
              >
                <div className="absolute right-6 top-6 text-[80px] font-black text-rose-500/5 leading-none select-none">!</div>
                <div className="mb-5 inline-flex rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-400">
                  The Problem
                </div>
                <h3 className="mb-4 text-xl font-bold text-white lg:text-2xl">{content.problem.title}</h3>
                <p className="text-[15px] leading-8 text-white/60">{content.problem.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 lg:p-10 ${
                  accentClassName.includes("cyan") ? "border-cyan-500/20 from-cyan-500/8 to-blue-900/5"
                  : accentClassName.includes("violet") ? "border-violet-500/20 from-violet-500/8 to-purple-900/5"
                  : accentClassName.includes("emerald") ? "border-emerald-500/20 from-emerald-500/8 to-teal-900/5"
                  : accentClassName.includes("amber") ? "border-amber-500/20 from-amber-500/8 to-orange-900/5"
                  : "border-sky-500/20 from-sky-500/8 to-indigo-900/5"
                }`}
              >
                <div className="absolute right-6 top-6 text-[80px] font-black text-white/[0.04] leading-none select-none">✓</div>
                <div className={`mb-5 inline-flex rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${accentBg} border-white/10 ${accentClassName}`}>
                  The Solution
                </div>
                <h3 className="mb-4 text-xl font-bold text-white lg:text-2xl">{content.solution.title}</h3>
                <p className="text-[15px] leading-8 text-white/60">{content.solution.description}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── VALUE TRIO ─── */}
        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>Why It Matters</p>
              <h2 className="text-3xl font-bold text-white lg:text-4xl">The Impact</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                { label: "Industry Value", text: content.valueToIndustry, num: "01" },
                { label: "Your Advantage", text: content.valueToUser, num: "02" },
                { label: "The Outcome", text: content.outcome, num: "03" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1525] p-8 shadow-xl transition-all hover:border-white/20"
                >
                  <div className="absolute right-4 top-2 text-[64px] font-black text-white/[0.04] leading-none select-none">{card.num}</div>
                  <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${accentClassName}`}>{card.label}</p>
                  <p className="text-[15px] leading-8 text-white/65">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── KEY FEATURES ─── */}
        <section className="border-y border-white/10 bg-white/[0.025] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>{"What's Included"}</p>
              <h2 className="text-3xl font-bold text-white lg:text-4xl">Key Features</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {content.features.map((f, i) => (
                <FeatureCard key={f} text={f} index={i} accentClassName={accentClassName} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS: image + steps ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-[2rem] border border-white/10"
              >
                <div className="relative aspect-[4/3]">
                  <Image src={sectionImage2} alt="How it works" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/80 via-transparent to-[#050a12]/20" />
                  <div className="absolute inset-0 flex items-end p-8">
                    <div className="rounded-2xl border border-white/10 bg-black/50 px-6 py-4 backdrop-blur-md">
                      <p className={`text-xs font-bold uppercase tracking-widest ${accentClassName} mb-1`}>The Process</p>
                      <p className="text-sm font-semibold text-white">{content.hero.title}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div>
                <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>The Process</p>
                <h2 className="mb-10 text-3xl font-bold text-white lg:text-4xl">How It Works</h2>
                <div className="space-y-4">
                  {content.howItWorks.map((step, i) => (
                    <StepCard key={step} index={i} text={step} accentClassName={accentClassName} accentBg={accentBg} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── USE CASES ─── */}
        <section className="bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>Applications</p>
              <h2 className="text-3xl font-bold text-white lg:text-4xl">Who Uses This</h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/50">Real businesses across industries rely on this every day.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.useCases.map((uc, i) => (
                <UseCaseCard key={uc} text={uc} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── RELATED PAGES ─── */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>Explore More</p>
              <h2 className="text-3xl font-bold text-white lg:text-4xl">Related Pages</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.relatedLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <Link href={link.href} className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#08101d] p-6 transition-all hover:border-white/25 hover:bg-white/[0.05]">
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

        {/* ─── FAQ ─── */}
        {content.faq?.length ? (
          <section className="bg-[#050811] px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>Questions</p>
                <h2 className="text-3xl font-bold text-white lg:text-4xl">Frequently Asked</h2>
              </div>
              <FAQAccordion items={content.faq} />
            </div>
          </section>
        ) : null}

        {/* ─── FINAL CTA ─── */}
        <section className="px-4 py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-[1000px]"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#181d40] via-[#10234a] to-[#0e3b52] px-8 py-20 text-center shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(96,165,250,0.22),transparent_60%)]" />
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: gradientFrom }} />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl" style={{ background: gradientTo }} />
              <div className="relative z-10">
                {content.footerCta.eyebrow && (
                  <p className={`mb-3 text-xs font-bold uppercase tracking-[0.28em] ${accentClassName}`}>{content.footerCta.eyebrow}</p>
                )}
                <h2 className="mb-4 text-2xl font-black uppercase tracking-wide text-white lg:text-[2.2rem] leading-tight">
                  {content.footerCta.title.toUpperCase()}
                </h2>
                <p className="mb-10 mx-auto max-w-xl text-[15px] text-white/70">{content.footerCta.description}</p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-10 text-sm font-bold text-white hover:bg-blue-500">
                    <Link href={content.footerCta.primaryAction.href}>
                      {content.footerCta.primaryAction.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {content.footerCta.secondaryAction && (
                    <Button size="lg" asChild variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-10 text-sm text-white hover:bg-white/10">
                      <Link href={content.footerCta.secondaryAction.href}>{content.footerCta.secondaryAction.label}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </PageLayout>
  )
}

// ─── Named exports with section-specific visuals ───────────────────

export function FeaturePageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="FEATURES"
      accentClassName="text-cyan-300"
      gradientFrom="rgba(34,211,238,0.18)"
      gradientTo="rgba(59,130,246,0.10)"
      heroVideos={["/media/web-developers.mp4", "/media/female-dev.mp4"]}
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
      heroVideos={["/media/female-dev.mp4", "/media/web-developers.mp4"]}
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
      heroVideos={["/media/web-developers.mp4", "/media/female-dev.mp4"]}
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
      heroVideos={["/media/ai-conversion-pitch-web.mp4", "/media/web-developers.mp4"]}
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
      heroVideos={["/media/female-dev.mp4", "/media/web-developers.mp4"]}
      sectionImage="/images/generated/company-innovation-team.png"
      sectionImage2="/images/generated/company-perk-team.png"
      {...props}
    />
  )
}
