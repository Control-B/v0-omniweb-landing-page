"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { BigFooter } from "@/components/big-footer"
import { AIWidget } from "@/components/ai-widget"
import { PricingCard } from "@/components/pricing-card"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Headphones,
  TrendingUp,
} from "lucide-react"

/* ── Data ──────────────────────────────────────────────────────── */

const plans = [
  {
    name: "Starter",
    price: "$497/mo",
    outcome: "For small businesses that need one AI assistant handling first response and qualification.",
    aiMinutes: "500",
    agents: "1 agent",
    onboarding: "Guided setup",
    bullets: ["AI chat assistant", "Lead capture + qualification", "Basic CRM/webhook routing"],
    href: "/get-started?plan=starter",
    cta: "Start Free Setup",
  },
  {
    name: "Growth",
    price: "$1,497/mo",
    outcome: "For teams that want voice + chat coverage across lead qualification, booking, and follow-up.",
    aiMinutes: "2,500",
    agents: "3 agents",
    onboarding: "Done-with-you onboarding",
    bullets: ["Voice + chat assistants", "CRM + calendar automation", "Priority optimization reviews"],
    href: "/get-started?plan=growth",
    cta: "Book Growth Setup",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    outcome: "For multi-location or high-volume businesses that need orchestration, routing, and service-delivery automation.",
    aiMinutes: "Custom",
    agents: "Unlimited",
    onboarding: "White-glove launch",
    bullets: ["Custom AI workflows", "Advanced routing + integrations", "Service delivery orchestration"],
    href: "/company#contact",
    cta: "Talk to Sales",
  },
]

const comparisonFeatures = [
  { feature: "AI Chat Assistant", starter: true, growth: true, scale: true },
  { feature: "AI Voice Agent", starter: false, growth: true, scale: true },
  { feature: "Lead Qualification", starter: true, growth: true, scale: true },
  { feature: "CRM Integration", starter: "Basic", growth: true, scale: true },
  { feature: "Calendar Booking", starter: false, growth: true, scale: true },
  { feature: "Follow-up Sequences", starter: false, growth: true, scale: true },
  { feature: "Multi-location Routing", starter: false, growth: false, scale: true },
  { feature: "Custom AI Workflows", starter: false, growth: false, scale: true },
  { feature: "Dedicated Account Manager", starter: false, growth: false, scale: true },
  { feature: "Priority Support", starter: false, growth: true, scale: true },
  { feature: "Optimization Reviews", starter: false, growth: "Monthly", scale: "Weekly" },
  { feature: "API Access", starter: false, growth: true, scale: true },
]

const testimonials = [
  { name: "Jordan Lee", role: "Owner, Lee Contracting", quote: "Omniweb doubled our quote requests within 30 days. The AI just gets our customers.", stars: 5 },
  { name: "Priya Sharma", role: "Founder, Sharma Law Group", quote: "We went from 2 leads/week to 15. The automated intake forms save us hours every day.", stars: 5 },
  { name: "Carlos Rivera", role: "CEO, Pixel Agency", quote: "Our portfolio site now brings in 3× more client inquiries. Worth every penny.", stars: 5 },
]

const faqs = [
  { q: "Can I switch plans later?", a: "Yes. You can upgrade or downgrade at any time. Changes take effect on your next billing cycle, and we pro-rate unused time." },
  { q: "What counts as an AI minute?", a: "One AI minute equals one minute of voice agent conversation or approximately 10 chat exchanges. Unused minutes roll over for one billing cycle." },
  { q: "Is there a contract or commitment?", a: "No long-term contracts. All plans are month-to-month. You can cancel anytime with no penalties or hidden fees." },
  { q: "What happens if I exceed my AI minutes?", a: "You'll receive a notification at 80% usage. Overage is billed at a discounted per-minute rate, or you can upgrade to the next plan." },
  { q: "Do you offer a free trial?", a: "Yes. Every plan includes a 14-day free trial with full access to all features. No credit card required to start." },
  { q: "What integrations are supported?", a: "We integrate with Shopify, HubSpot, Salesforce, Google Calendar, Calendly, Slack, and dozens of other tools via webhooks and API." },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#06091A]">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />
      <Header />
      <main className="relative flex-1 pt-16">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/10 px-6 py-32 lg:py-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="site-eyebrow mb-6">
              <span className="text-white">OMNIWEB</span> &nbsp;|&nbsp; <span className="opacity-80">PRICING</span>
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SIMPLE PLANS BUILT AROUND OUTCOMES
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Buy AI coverage based on conversation volume, active agents, and onboarding support — not bloated software checklists.
            </motion.p>
          </div>
        </section>

        {/* ── Pricing Cards ──────────────────────────────────────── */}
        <section className="bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </section>

        {/* ── Feature Comparison Table ────────────────────────────── */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">COMPARE PLANS</h2>
              <p className="mx-auto max-w-xl text-[14px] text-slate-400">See exactly what&apos;s included in each plan so you can choose with confidence.</p>
            </div>
            <div className="kling-panel overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="px-6 py-4 text-left font-semibold text-white/70">Feature</th>
                    <th className="px-6 py-4 text-center font-semibold text-white/70">Starter</th>
                    <th className="px-6 py-4 text-center font-semibold text-cyan-400">Growth</th>
                    <th className="px-6 py-4 text-center font-semibold text-white/70">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                      <td className="px-6 py-3.5 text-white/80">{row.feature}</td>
                      {[row.starter, row.growth, row.scale].map((val, j) => (
                        <td key={j} className="px-6 py-3.5 text-center">
                          {val === true ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" /> : val === false ? <span className="text-white/20">—</span> : <span className="text-white/60 text-xs">{val}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Why Omniweb ────────────────────────────────────────── */}
        <section className="px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">Why Omniweb</p>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">More Than a Subscription — A Revenue System</h2>
                <div className="space-y-5 text-white/60 leading-relaxed">
                  <p>Most AI tools charge for features you never use. Omniweb charges for outcomes you can measure — conversations handled, leads qualified, and opportunities routed to your team.</p>
                  <p>Every plan includes the same core AI engine. The difference is scale: how many agents, how many minutes, and how much hands-on support you need to launch and optimize.</p>
                  <p>We don&apos;t lock features behind tiers. We give you the tools to grow, and scale pricing as your revenue grows with you.</p>
                </div>
              </div>
              <div>
                <div className="kling-panel-strong overflow-hidden rounded-[2rem]">
                  <div className="relative aspect-[16/10]">
                    <Image src="/images/generated/pricing-growth-dashboard.png" alt="Growth dashboard" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/85 via-transparent to-[#050a12]/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Signals ──────────────────────────────────────── */}
        <section className="bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">BUILT FOR TRUST</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Shield, title: "No Contracts", description: "Month-to-month billing. Cancel anytime with zero penalties." },
                { icon: Zap, title: "14-Day Free Trial", description: "Full access to all features. No credit card required." },
                { icon: Headphones, title: "Guided Onboarding", description: "Every plan includes setup help so you launch with confidence." },
                { icon: TrendingUp, title: "ROI Guarantee", description: "If you don't see measurable results in 30 days, we extend your trial." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group rounded-2xl border border-[#1e293b] bg-[#111827] p-6 shadow-xl transition-all hover:border-[#3b82f6]/50 hover:bg-[#1f2937]"
                >
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#1e293b] border border-white/5 ring-1 ring-white/10 group-hover:bg-[#2563eb]/20 group-hover:ring-[#3b82f6]/50 transition-colors">
                    <item.icon className="h-6 w-6 text-[#3b82f6] group-hover:text-[#60a5fa]" />
                  </div>
                  <h3 className="mb-3 text-[15px] font-bold tracking-wide text-white uppercase">{item.title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────────── */}
        <section className="border-t border-[#1e293b]/50 bg-[#050811] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">WHAT CUSTOMERS SAY</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#1d1b3f] to-[#122e3f] p-8 text-center border border-white/5 shadow-2xl"
                >
                  <div className="mb-6 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="h-4 w-4 fill-[#facc15] text-[#facc15]" />)}
                  </div>
                  <p className="mb-8 flex-1 text-[15px] font-medium leading-relaxed tracking-wide text-white/90">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <div className="text-[13px] font-semibold tracking-wider text-white">{t.name}</div>
                    <div className="text-[12px] tracking-wide text-white/50">{t.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="border-y border-white/10 bg-white/[0.02] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-widest text-white uppercase lg:text-3xl">FREQUENTLY ASKED QUESTIONS</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#08101d] overflow-hidden transition-all">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-6 py-5 text-left">
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="h-4 w-4 text-cyan-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-relaxed text-white/60">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Widget CTA ──────────────────────────────────────── */}
        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <AIWidget title="Not sure which plan fits your funnel?" description="Ask Omniweb AI about lead volume, call handling, qualification, and automations. It can point you to the right rollout path in seconds." />
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
                <h2 className="mb-4 text-[26px] font-bold uppercase tracking-wider text-white lg:text-[32px]">EVERY PLAN REDUCES CLICKS AND INCREASES AUTOMATION</h2>
                <p className="mb-10 text-[15px] text-white/80">Start your 14-day free trial today. No credit card required.</p>
                <Button size="lg" asChild className="h-12 rounded-lg bg-[#3b82f6] px-8 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#2563eb]">
                  <Link href="/get-started">START FREE SETUP <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
