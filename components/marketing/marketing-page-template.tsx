"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { FAQAccordion } from "@/components/marketing/page-sections"

type CTA = { label: string; href: string }

export type MarketingPageContent = {
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
}

// ─── Mini components ───────────────────────────────────────────────

function StepCard({ index, text, accentClassName }: { index: number; text: string; accentClassName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-bold ${accentClassName} bg-white/[0.04]`}>
        {index + 1}
      </div>
      <p className="text-sm leading-7 text-white/70">{text}</p>
    </motion.div>
  )
}

function FeatureChip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75 transition-all hover:border-white/20 hover:text-white/90">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
      {text}
    </div>
  )
}

function UseCaseCard({ text, index }: { text: string; index: number }) {
  const colors = [
    "from-cyan-500/15 to-blue-500/15 border-cyan-500/20",
    "from-violet-500/15 to-purple-500/15 border-violet-500/20",
    "from-emerald-500/15 to-teal-500/15 border-emerald-500/20",
    "from-amber-500/15 to-orange-500/15 border-amber-500/20",
    "from-rose-500/15 to-pink-500/15 border-rose-500/20",
    "from-sky-500/15 to-indigo-500/15 border-sky-500/20",
  ]
  const textColors = ["text-cyan-300", "text-violet-300", "text-emerald-300", "text-amber-300", "text-rose-300", "text-sky-300"]
  const c = colors[index % colors.length]
  const t = textColors[index % textColors.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={`rounded-2xl border bg-gradient-to-br ${c} p-5`}
    >
      <p className={`text-sm font-semibold ${t}`}>{text}</p>
    </motion.div>
  )
}

// ─── Main Shell ────────────────────────────────────────────────────

function MarketingPageShell({
  sectionLabel,
  content,
  accentClassName = "text-cyan-300",
  gradientFrom = "rgba(59,130,246,0.14)",
  gradientTo = "rgba(168,85,247,0.08)",
}: TemplateProps) {
  const [titleIdx, setTitleIdx] = useState(0)

  const headlines = [
    { text: content.hero.title.toUpperCase(), color: "from-white to-white/80" },
    { text: content.hero.eyebrow.toUpperCase(), color: "from-cyan-400 to-blue-500" },
  ]

  useEffect(() => {
    const t = setInterval(() => setTitleIdx((i) => (i + 1) % headlines.length), 4000)
    return () => clearInterval(t)
  }, [])

  const stats = content.hero.stats ?? []

  return (
    <PageLayout>
      <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#06091A]">
        <div className="pointer-events-none absolute inset-0 kling-canvas" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />

        <main className="relative flex-1 pt-16">

          {/* Hero */}
          <section className="relative overflow-hidden border-b border-white/10 px-6 py-28 lg:py-36">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${gradientFrom}, transparent 60%)` }} />
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 40% at 80% 0%, ${gradientTo}, transparent 50%)` }} />

            <div className="relative z-10 mx-auto max-w-5xl text-center">
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

              <div className="relative" style={{ minHeight: "5rem" }}>
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={titleIdx}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.5 }}
                    className={`text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-r ${headlines[titleIdx].color} bg-clip-text text-transparent`}
                  >
                    {headlines[titleIdx].text}
                  </motion.h1>
                </AnimatePresence>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60"
              >
                {content.hero.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
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

          {/* Stats Bar */}
          {stats.length > 0 && (
            <section className="bg-white/[0.02] px-4 py-14 lg:px-8 border-b border-[#1e293b]/50">
              <div className="mx-auto max-w-5xl">
                <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center group">
                      <div className="mb-2 text-4xl font-bold tracking-tight text-white lg:text-5xl transition-all duration-300 group-hover:scale-105 group-hover:text-cyan-400">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium tracking-wide text-white/50">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Problem / Solution */}
          <section className="bg-[#050811] px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:p-10"
              >
                <div className="mb-4 inline-flex rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-rose-400">
                  The Problem
                </div>
                <h2 className="mb-4 text-2xl font-bold text-white lg:text-3xl">{content.problem.title}</h2>
                <p className="text-base leading-8 text-white/60">{content.problem.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:p-10"
              >
                <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                  <span className={accentClassName}>The Solution</span>
                </div>
                <h2 className="mb-4 text-2xl font-bold text-white lg:text-3xl">{content.solution.title}</h2>
                <p className="text-base leading-8 text-white/60">{content.solution.description}</p>
              </motion.div>
            </div>
          </section>

          {/* Value + Outcome */}
          <section className="px-4 py-20 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-8 lg:grid-cols-3">
                {[
                  { label: "Industry Value", text: content.valueToIndustry },
                  { label: "User Value", text: content.valueToUser },
                  { label: "Outcome", text: content.outcome },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group rounded-2xl border border-[#1e293b] bg-[#111827] p-6 shadow-xl transition-all hover:border-[#3b82f6]/50 hover:bg-[#1f2937]"
                  >
                    <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${accentClassName}`}>{card.label}</p>
                    <p className="text-sm leading-7 text-white/65">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section className="border-y border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>What&apos;s Included</p>
                <h2 className="text-3xl font-bold text-white lg:text-4xl">Key Features</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {content.features.map((f, i) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <FeatureChip text={f} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-[#050811] px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 text-center">
                <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>The Process</p>
                <h2 className="text-3xl font-bold text-white lg:text-4xl">How It Works</h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.howItWorks.map((step, i) => (
                  <StepCard key={step} index={i} text={step} accentClassName={accentClassName} />
                ))}
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="px-4 py-24 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className={`mb-3 text-sm font-semibold uppercase tracking-widest ${accentClassName}`}>Applications</p>
                  <h2 className="text-3xl font-bold text-white lg:text-4xl">Who Uses This</h2>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {content.useCases.map((uc, i) => (
                  <UseCaseCard key={uc} text={uc} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* Related Pages */}
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
                    <Link
                      href={link.href}
                      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#08101d] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-[15px] font-bold text-white">{link.label}</h3>
                        <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-white/60" />
                      </div>
                      <p className="text-sm leading-relaxed text-white/50">{link.description}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
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

          {/* Final CTA */}
          <section className="bg-[#050811] px-4 py-24 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto max-w-[1000px] text-center"
            >
              <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#211d51] via-[#10234a] to-[#0e3b52] px-8 py-16 shadow-2xl border border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.18),transparent_50%)]" />
                <div className="relative z-10">
                  {content.footerCta.eyebrow && (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      {content.footerCta.eyebrow}
                    </p>
                  )}
                  <h2 className="mb-4 text-2xl font-bold uppercase tracking-wider text-white lg:text-[2rem]">
                    {content.footerCta.title.toUpperCase()}
                  </h2>
                  <p className="mb-10 text-[15px] text-white/75">{content.footerCta.description}</p>
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button size="lg" asChild className="h-12 rounded-lg bg-blue-600 px-8 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-blue-500">
                      <Link href={content.footerCta.primaryAction.href}>{content.footerCta.primaryAction.label}</Link>
                    </Button>
                    {content.footerCta.secondaryAction && (
                      <Button size="lg" asChild variant="outline" className="h-12 rounded-lg border-white/20 bg-white/5 px-8 text-[13px] text-white hover:bg-white/10">
                        <Link href={content.footerCta.secondaryAction.href}>{content.footerCta.secondaryAction.label}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

        </main>
      </div>
    </PageLayout>
  )
}

// ─── Named exports ─────────────────────────────────────────────────

export function FeaturePageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="FEATURES"
      accentClassName="text-cyan-300"
      gradientFrom="rgba(34,211,238,0.13)"
      gradientTo="rgba(59,130,246,0.08)"
      {...props}
    />
  )
}

export function SolutionPageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="SOLUTIONS"
      accentClassName="text-violet-300"
      gradientFrom="rgba(139,92,246,0.14)"
      gradientTo="rgba(168,85,247,0.08)"
      {...props}
    />
  )
}

export function ResourcePageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="RESOURCES"
      accentClassName="text-emerald-300"
      gradientFrom="rgba(16,185,129,0.13)"
      gradientTo="rgba(20,184,166,0.08)"
      {...props}
    />
  )
}

export function PricingPageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="PRICING"
      accentClassName="text-amber-300"
      gradientFrom="rgba(245,158,11,0.13)"
      gradientTo="rgba(249,115,22,0.08)"
      {...props}
    />
  )
}

export function CompanyPageTemplate(props: { content: MarketingPageContent }) {
  return (
    <MarketingPageShell
      sectionLabel="COMPANY"
      accentClassName="text-sky-300"
      gradientFrom="rgba(56,189,248,0.13)"
      gradientTo="rgba(99,102,241,0.08)"
      {...props}
    />
  )
}
