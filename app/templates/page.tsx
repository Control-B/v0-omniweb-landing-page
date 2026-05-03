"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AIWidget } from "@/components/ai-widget"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Palette,
  ShoppingCart,
  Briefcase,
  Wrench,
  Camera,
  GraduationCap,
  Building2,
} from "lucide-react"

/* ── Data ──────────────────────────────────────────────────────── */

const categories = ["All", "E-Commerce", "Professional", "Contractor", "Agency", "Education"]

const templates = [
  {
    title: "Commerce Pro",
    category: "E-Commerce",
    description: "High-converting storefront with AI product recommendations, cart recovery, and integrated checkout.",
    image: "/images/generated/template-commerce-pro.png",
    features: ["AI product recommendations", "Cart recovery flows", "Multi-currency support"],
    accent: "text-orange-400",
    gradient: "from-orange-500/20 to-pink-500/20",
  },
  {
    title: "Local Pro",
    category: "Contractor",
    description: "Lead-generating website for contractors with quote request forms, project galleries, and AI intake.",
    image: "/images/generated/template-local-pro.png",
    features: ["Quote request forms", "Project galleries", "Service area targeting"],
    accent: "text-cyan-400",
    gradient: "from-cyan-500/20 to-teal-500/20",
  },
  {
    title: "Consultant Elite",
    category: "Professional",
    description: "Authority-building website for consultants with automated client intake and scheduling.",
    image: "/images/generated/template-consultant-elite.png",
    features: ["Client intake automation", "Calendar booking", "Case study showcases"],
    accent: "text-blue-400",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Portfolio Studio",
    category: "Agency",
    description: "Stunning portfolio with dynamic case studies, team showcases, and AI-powered project inquiry.",
    image: "/images/generated/template-portfolio-studio.png",
    features: ["Dynamic case studies", "Team profiles", "Project inquiry AI"],
    accent: "text-purple-400",
    gradient: "from-purple-500/20 to-violet-500/20",
  },
  {
    title: "Course Creator",
    category: "Education",
    description: "Online education platform with course catalogs, enrollment flows, and student engagement AI.",
    image: "/images/generated/template-course-creator.png",
    features: ["Course catalogs", "Enrollment automation", "Student engagement AI"],
    accent: "text-emerald-400",
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    title: "Agency Growth",
    category: "Agency",
    description: "Growth-focused agency site with lead magnets, automated proposal generation, and pipeline tracking.",
    image: "/images/generated/template-agency-growth.png",
    features: ["Lead magnets", "Proposal generation", "Pipeline tracking"],
    accent: "text-violet-400",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
]

const processSteps = [
  { step: "01", title: "Choose a Template", description: "Browse industry-specific templates pre-configured with AI assistants, layouts, and conversion flows." },
  { step: "02", title: "Customize with AI", description: "Our AI generates copy, adjusts design, and configures workflows based on your business details." },
  { step: "03", title: "Launch in Minutes", description: "One-click deploy with hosting, SSL, and AI assistants already connected and ready to convert." },
]

export default function TemplatesPage() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filtered = activeFilter === "All" ? templates : templates.filter((t) => t.category === activeFilter)

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#06091A]">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />
      <Header />
      <main className="relative flex-1 pt-16">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/10 px-6 py-32 lg:py-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(168,85,247,0.08),transparent_50%)]" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="site-eyebrow mb-6">
              <span className="text-white">OMNIWEB</span> &nbsp;|&nbsp; <span className="opacity-80">TEMPLATES</span>
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
              INDUSTRY-READY TEMPLATES WITH AI BUILT IN
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Start with a conversion-optimized template pre-configured for your industry. Every template includes AI voice, chat, and lead automation from day one.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-500">
                <Link href="#template-gallery">Browse Templates <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 rounded-full border-white/20 bg-transparent px-8 text-sm font-semibold text-white hover:bg-white/10">
                <Link href="/get-started">Start Free Setup</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── Template Gallery ────────────────────────────────────── */}
        <section id="template-gallery" className="bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">TEMPLATE GALLERY</h2>
              <p className="mx-auto max-w-xl text-[14px] text-slate-400">Every template is a complete revenue system — not just a design file.</p>
            </div>
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeFilter === cat ? "text-white" : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"}`}
                >
                  {activeFilter === cat && (
                    <motion.div layoutId="activeFilterBadge" className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20" initial={false} transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((template, i) => (
                  <motion.div
                    key={template.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={`group kling-panel-strong overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${template.gradient} transition-all hover:border-white/20`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={template.image} alt={template.title} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/90 via-transparent to-[#050a12]/20" />
                      <div className="absolute bottom-4 left-4">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${template.accent}`}>{template.category}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-bold text-white">{template.title}</h3>
                      <p className="mb-4 text-sm leading-relaxed text-white/50">{template.description}</p>
                      <ul className="mb-6 space-y-2">
                        {template.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-xs text-white/60">
                            <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${template.accent}`} />{feat}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-3">
                        <Button size="sm" asChild className="flex-1 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20">
                          <Link href="/get-started">Use Template</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg border-white/10 text-xs text-white/60 hover:bg-white/5 hover:text-white">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ─── What's Included — image right ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">What&apos;s Included</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Every Template Is a Complete Revenue System</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>These aren&apos;t just design files. Every Omniweb template ships with AI voice agents, chat assistants, lead qualification flows, CRM integrations, and conversion-optimized layouts — all pre-configured for your industry.</p>
                  <p>Choose a template, answer a few questions about your business, and the AI customizes everything — from headlines and CTAs to qualification scripts and follow-up sequences.</p>
                  <p>You launch with a website that&apos;s already tuned to convert, already connected to your tools, and already answering leads 24/7.</p>
                </div>
              </div>
              <div>
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/website-templates.jpg" alt="Website templates showcase" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────── */}
        <section className="bg-[#050811] px-4 py-24 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-20">
              <h2 className="text-2xl font-bold tracking-widest uppercase lg:text-3xl">HOW IT WORKS</h2>
            </div>
            <div className="grid gap-12 lg:grid-cols-3">
              {processSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-8 flex h-40 w-[80%] items-center justify-center overflow-hidden rounded-xl border border-[#1e293b]/50 bg-[#0A0F2A]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_60%)]" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3b82f6] to-[#0ea5e9] shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                      <span className="text-3xl font-extrabold text-white">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="mb-3 text-[17px] font-bold text-white tracking-wide">{step.title}</h3>
                  <p className="text-[14px] leading-relaxed text-slate-400 max-w-[85%]">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Widget CTA ──────────────────────────────────────── */}
        <section className="border-t border-white/10 bg-white/[0.02] px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <AIWidget title="Not sure which template fits?" description="Describe your business and the AI will recommend the best template, customization options, and launch plan." />
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────── */}
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
                <h2 className="mb-4 text-[26px] font-bold uppercase tracking-wider text-white lg:text-[32px]">READY TO LAUNCH YOUR AI-POWERED WEBSITE?</h2>
                <p className="mb-10 text-[15px] text-white/80">Pick a template, customize with AI, and go live in minutes.</p>
                <Button size="lg" asChild className="h-12 rounded-lg bg-[#3b82f6] px-8 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#2563eb]">
                  <Link href="/get-started">START FOR FREE <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
