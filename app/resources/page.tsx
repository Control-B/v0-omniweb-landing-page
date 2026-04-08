"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { BigFooter } from "@/components/big-footer"
import { AIWidget } from "@/components/ai-widget"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  PlayCircle,
  Rocket,
  Video,
  ChevronRight,
  Headphones,
  BarChart3,
  Zap,
  TrendingUp,
  Search,
} from "lucide-react"

/* ── Data ──────────────────────────────────────────────────────── */

const dashboardSidebarItems = [
  "Overview",
  "AI Assistant",
  "Leads & CRM",
  "Site Editor",
  "Analytics",
  "Settings",
]

const dashboardTasks = [
  "Review 3 new leads",
  "Approve AI chat response",
  "Update service pricing",
  "Publish landing page edits",
]

const heroHeadlines = [
  { text: "LEARN HOW AI DRIVES REAL REVENUE.", color: "from-cyan-400 to-blue-500" },
  { text: "PLAYBOOKS, CASE STUDIES & DEMOS.", color: "from-violet-400 to-purple-500" },
  { text: "THE KNOWLEDGE TO SCALE FASTER.", color: "from-emerald-400 to-teal-500" },
]

const resourceCategories = [
  {
    icon: Video,
    title: "Demo Videos",
    description: "Watch AI voice agents, chat assistants, and qualification workflows in action — before you commit.",
    accent: "text-cyan-400",
    gradient: "from-cyan-500/20 to-blue-500/20",
    items: [
      { title: "Voice agent call demo", description: "See how AI handles a live inbound call, qualifies urgency, and routes to booking.", time: "4 min" },
      { title: "Live chat qualification walkthrough", description: "Watch the chat assistant capture intent, overcome objections, and collect contact details.", time: "3 min" },
      { title: "CRM automation overview", description: "End-to-end look at how leads flow from conversation to pipeline without manual entry.", time: "5 min" },
    ],
  },
  {
    icon: Rocket,
    title: "Case Studies",
    description: "Real businesses, real numbers. See how stores, contractors, and service firms grow with Omniweb.",
    accent: "text-violet-400",
    gradient: "from-violet-500/20 to-purple-500/20",
    items: [
      { title: "Shopify conversion recovery", description: "How a DTC brand recovered 38% of abandoned carts with AI chat follow-up.", time: "6 min read" },
      { title: "Contractor lead routing", description: "How a roofing company booked 52% more jobs by responding to every lead in under 60 seconds.", time: "5 min read" },
      { title: "Professional services intake", description: "How a law firm automated client screening and cut admin hours by 30+ per week.", time: "7 min read" },
    ],
  },
  {
    icon: BookOpen,
    title: "AI Playbooks",
    description: "Step-by-step rollout guides for scripts, qualification logic, and automation setup.",
    accent: "text-emerald-400",
    gradient: "from-emerald-500/20 to-teal-500/20",
    items: [
      { title: "Lead qualification scripts", description: "Copy-paste question trees for service, e-commerce, and professional verticals.", time: "10 min read" },
      { title: "Follow-up automation templates", description: "Pre-built email and SMS sequences triggered by AI conversation outcomes.", time: "8 min read" },
      { title: "Onboarding rollout checklist", description: "The 14-day launch plan that gets your AI assistants live and optimized.", time: "12 min read" },
    ],
  },
]

const popularArticles = [
  { title: "How AI voice agents reduce missed revenue after hours", category: "Voice", accent: "text-cyan-400" },
  { title: "What to automate first in your sales funnel", category: "Strategy", accent: "text-violet-400" },
  { title: "The fastest way to qualify leads without adding headcount", category: "Automation", accent: "text-emerald-400" },
  { title: "Why response time is the #1 conversion factor in 2026", category: "Data", accent: "text-amber-400" },
  { title: "Building an AI-first sales process from scratch", category: "Playbook", accent: "text-rose-400" },
]

const stats = [
  { value: "150+", label: "Resources Published" },
  { value: "40K+", label: "Monthly Readers" },
  { value: "12", label: "Industry Playbooks" },
  { value: "98%", label: "Helpfulness Rating" },
]

export default function ResourcesPage() {
  const [heroIdx, setHeroIdx] = useState(0)
  const [activeCategory, setActiveCategory] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx((i) => (i + 1) % heroHeadlines.length), 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#06091A]">
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
              <span className="text-white">OMNIWEB</span> &nbsp;|&nbsp; <span className="opacity-80">RESOURCES</span>
            </motion.p>
            <div className="relative" style={{ minHeight: "5rem" }}>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={heroIdx}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.5 }}
                  className={`text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-r ${heroHeadlines[heroIdx].color} bg-clip-text text-transparent`}
                >
                  {heroHeadlines[heroIdx].text}
                </motion.h2>
              </AnimatePresence>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Explore demos, case studies, and playbooks that show exactly how Omniweb turns AI into a practical growth system for your business.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="h-12 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-500">
                <Link href="#resource-library">Browse Library <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── Stats Bar ───────────────────────────────────────────── */}
        <section className="bg-white/[0.02] px-4 py-16 lg:px-8 border-b border-[#1e293b]/50">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="mb-2 text-4xl font-bold tracking-tight text-white lg:text-5xl transition-all duration-300 group-hover:scale-105 group-hover:text-cyan-400">{stat.value}</div>
                  <div className="text-sm font-medium tracking-wide text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Resource Library Tabs ────────────────────────────────── */}
        <section id="resource-library" className="bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">RESOURCE LIBRARY</h2>
              <p className="mx-auto max-w-xl text-[14px] text-slate-400">Everything you need to understand, evaluate, and roll out AI-powered sales systems.</p>
            </div>
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              {resourceCategories.map((cat, i) => (
                <button
                  key={cat.title}
                  onClick={() => setActiveCategory(i)}
                  className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeCategory === i ? "text-white" : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"}`}
                >
                  {activeCategory === i && (
                    <motion.div layoutId="activeCategoryBadge" className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20" initial={false} transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                  <cat.icon className={`relative z-10 h-4 w-4 ${activeCategory === i ? "text-white" : "site-icon-accent"}`} />
                  <span className="relative z-10">{cat.title}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="kling-panel-strong overflow-hidden rounded-3xl border border-white/10 p-8 lg:p-12">
                  <div className="mb-8">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${resourceCategories[activeCategory].gradient} border border-white/10 mb-4`}>
                      {(() => { const Icon = resourceCategories[activeCategory].icon; return <Icon className={`h-7 w-7 ${resourceCategories[activeCategory].accent}`} /> })()}
                    </div>
                    <h3 className="text-2xl font-bold">{resourceCategories[activeCategory].title}</h3>
                    <p className="mt-2 text-white/60">{resourceCategories[activeCategory].description}</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {resourceCategories[activeCategory].items.map((item) => (
                      <div key={item.title} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.06]">
                        <div className="mb-3 flex items-center justify-between">
                          <span className={`text-xs font-semibold uppercase tracking-wider ${resourceCategories[activeCategory].accent}`}>{item.time}</span>
                          <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
                        </div>
                        <h4 className="mb-2 text-[15px] font-bold text-white">{item.title}</h4>
                        <p className="text-sm leading-relaxed text-white/50">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ─── BLOCK 1: Voice Agents — image right ─── */}
        <section className="px-4 py-24 lg:px-8">
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
              <div>
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/AI Voice room.png" alt="AI Voice agents in action" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BLOCK 2: Lead Automation — image left (reversed) ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/AI lead automation.png" alt="AI lead automation dashboard" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
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

        {/* ─── BLOCK 3: Sales Pipeline — image right ─── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">Sales Pipeline</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">Achieve More with AI</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Most sales pipelines leak revenue at every stage — leads go cold waiting for a callback, follow-ups fall through the cracks, and reps spend more time on data entry than closing deals.</p>
                  <p>Our AI doesn&apos;t just capture leads — it qualifies them in real time, scores intent, triggers the right follow-up sequence, and delivers pipeline-ready opportunities directly to your team.</p>
                  <p>The result is a sales pipeline that never sleeps, never forgets a follow-up, and never lets a high-value lead slip away. Businesses on Omniweb close faster, waste less, and scale without adding headcount.</p>
                </div>
              </div>
              <div>
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/Sales1.webp" alt="AI-powered sales pipeline" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Command Center Dashboard ─── */}
        <section className="relative overflow-hidden border-t border-b border-[#1e293b]/50 bg-[#040812] px-4 py-20 lg:px-8 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.22),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Your Command Center
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white lg:text-[2.8rem]">
                One dashboard to manage, customize, and grow your entire web presence.
              </h2>
              <p className="mt-5 mx-auto max-w-xl text-base leading-relaxed text-white/50 lg:text-lg">
                From the moment you sign up, your Omniweb dashboard gives you full control — monitor AI conversations, track leads, customize services, and watch your site performance in real time.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,31,61,0.96),rgba(5,8,18,0.96))] p-3 shadow-[0_32px_100px_rgba(0,0,0,0.45)] lg:p-5"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.18),transparent_28%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />

              <div className="relative grid gap-4 lg:grid-cols-[0.2fr_0.8fr]">
                {/* Sidebar */}
                <div className="rounded-[1.8rem] border border-white/10 bg-black/35 p-3 backdrop-blur-xl">
                  <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">O</div>
                    <div>
                      <div className="text-sm font-semibold text-white">Omniweb</div>
                      <div className="text-xs text-white/35">Admin Panel</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dashboardSidebarItems.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`rounded-2xl px-4 py-3 text-sm transition-colors ${index === 0 ? "bg-blue-500/20 text-white" : "text-white/55 hover:bg-white/[0.04]"}`}
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Main content area */}
                <div className="relative rounded-[1.8rem] border border-white/10 bg-black/25 p-3 backdrop-blur-xl lg:p-4">
                  {/* Top bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#102341]/80 px-4 py-2 text-sm text-white/70">
                      <Search className="h-3.5 w-3.5 text-white/40" />
                      Search leads, pages, settings...
                    </div>
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/90">
                      CUSTOMIZE SITE
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[0.58fr_0.42fr]">
                    <div className="space-y-4">
                      {/* Site performance stats */}
                      <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1630]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/35">
                          <span>Site Performance</span>
                          <span>Last 30 days</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xl font-semibold text-white">12.4k</div>
                            <div className="mt-1 text-xs text-white/40">Visitors</div>
                            <div className="mt-2 text-xs text-emerald-400">↑ 24%</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xl font-semibold text-white">847</div>
                            <div className="mt-1 text-xs text-white/40">Leads</div>
                            <div className="mt-2 text-xs text-emerald-400">↑ 18%</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <div className="text-xl font-semibold text-white">4.2%</div>
                            <div className="mt-1 text-xs text-white/40">Conv. Rate</div>
                            <div className="mt-2 text-xs text-emerald-400">↑ 1.1%</div>
                          </div>
                        </div>
                      </div>

                      {/* Action items + AI score */}
                      <div className="grid gap-4 md:grid-cols-[1fr_0.85fr]">
                        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
                          <div className="mb-4 text-lg font-semibold text-white">Action Items</div>
                          <div className="space-y-3 text-sm text-white/45">
                            {dashboardTasks.map((task, index) => (
                              <div key={task} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                <span>{task}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${index === 0 ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/30"}`}>{index === 0 ? "Urgent" : index + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
                          <div className="mb-4 text-lg font-semibold text-white">AI Health</div>
                          <div className="flex items-center justify-center pt-3">
                            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_62%)]">
                              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                                <motion.circle
                                  cx="50"
                                  cy="50"
                                  r="44"
                                  fill="none"
                                  stroke="url(#dashboard-progress-gradient)"
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeDasharray="276.46"
                                  initial={{ strokeDashoffset: 276.46 }}
                                  whileInView={{ strokeDashoffset: 5.53 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                />
                                <defs>
                                  <linearGradient id="dashboard-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#67e8f9" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-4xl font-semibold leading-none text-white">98</div>
                                <div className="mt-1.5 text-[11px] uppercase tracking-[0.28em] text-white/30">Score</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column — AI assistant activity + service config */}
                    <div className="space-y-4">
                      <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1630]/90 p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-sm font-semibold text-white">AI Assistant Activity</div>
                          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">Live</div>
                        </div>
                        <div className="space-y-3">
                          {[
                            { msg: "Answered pricing question", time: "2m ago", status: "text-emerald-400" },
                            { msg: "Qualified roofing lead", time: "8m ago", status: "text-cyan-400" },
                            { msg: "Booked consultation call", time: "14m ago", status: "text-fuchsia-400" },
                            { msg: "Sent follow-up email", time: "22m ago", status: "text-blue-400" },
                          ].map((item) => (
                            <div key={item.msg} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.status}`} />
                              <span className="flex-1 text-xs text-white/60">{item.msg}</span>
                              <span className="text-[10px] text-white/25">{item.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1630]/90 p-4">
                        <div className="mb-4 text-sm font-semibold text-white">Service Configuration</div>
                        <div className="space-y-3">
                          {[
                            { service: "AI Chat Widget", status: "Active", dot: "bg-emerald-400" },
                            { service: "Lead Capture Forms", status: "Active", dot: "bg-emerald-400" },
                            { service: "Auto Follow-ups", status: "Paused", dot: "bg-amber-400" },
                            { service: "Review Requests", status: "Active", dot: "bg-emerald-400" },
                          ].map((item) => (
                            <div key={item.service} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                              <span className="text-xs text-white/60">{item.service}</span>
                              <div className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                                <span className="text-[10px] text-white/35">{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Popular Reads ──────────────────────────────────────── */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Popular Reads</p>
                <h2 className="text-3xl font-bold lg:text-4xl">Start With the Playbooks Buyers Ask for Most</h2>
              </div>
              <Button asChild variant="outline" className="shrink-0 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Link href="/company#contact">Request a custom demo <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-4">
              {popularArticles.map((article, i) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#08101d] px-6 py-5 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${article.accent}`}>{article.category}</span>
                    <span className="text-sm font-medium text-white">{article.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-cyan-400 transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Key Features Grid ──────────────────────────────────── */}
        <section className="bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">WHY TEAMS CHOOSE OMNIWEB</h2>
              <p className="mx-auto max-w-xl text-[14px] text-slate-400">The tools, data, and automation that make AI-powered growth practical — not theoretical.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Zap, title: "Instant Setup", description: "Go from sign-up to live AI assistants in under 48 hours with guided onboarding." },
                { icon: BarChart3, title: "Real-Time Analytics", description: "See every conversation, conversion, and lead score in a single unified dashboard." },
                { icon: Headphones, title: "24/7 Coverage", description: "Voice and chat agents that never sleep, never take breaks, and never miss a lead." },
                { icon: TrendingUp, title: "Continuous Optimization", description: "AI that learns from every interaction and improves qualification accuracy over time." },
              ].map((feature, i) => (
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

        {/* ── AI Widget CTA ──────────────────────────────────────── */}
        <section className="border-t border-white/10 bg-white/[0.02] px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <AIWidget title="Want a personalized rollout recommendation?" description="Ask the AI which flows to launch first based on your sales process, lead volume, and service model." />
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
                <h2 className="mb-4 text-[26px] font-bold uppercase tracking-wider text-white lg:text-[32px]">READY TO SEE AI IN ACTION?</h2>
                <p className="mb-10 text-[15px] text-white/80">Start your free trial and explore every resource, playbook, and demo.</p>
                <Button size="lg" asChild className="h-12 rounded-lg bg-[#3b82f6] px-8 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#2563eb]">
                  <Link href="/get-started">START FOR FREE</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
      <BigFooter />
    </div>
  )
}
