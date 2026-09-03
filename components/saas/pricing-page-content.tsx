"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  PhoneCall,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react"
import { PlanSelectionGrid } from "@/components/saas/plan-selection-grid"
import { PRICING_INDUSTRY_OPTIONS, getPricingContent, normalizeIndustry } from "@/lib/saas/billing"
import { Button } from "@/components/ui/button"
import type { PlanType, SubscriptionStatus } from "@/lib/saas/types"

type PricingPageContentProps = {
  isSignedIn: boolean
  onboardingCompleted: boolean
  currentPlan: PlanType
  subscriptionStatus: SubscriptionStatus | null
  initialIndustry: string | null
}

const COMPARISON_FEATURES = [
  {
    category: "Core Voice & Intelligence",
    items: [
      { name: "LiveKit WebRTC Audio Pipeline", starter: "Standard", standard: "Sub-250ms Ultra-Low Latency", business: "Dedicated Swarm Audio Nodes" },
      { name: "Speech-to-Text Model", starter: "Deepgram Nova-3", standard: "Deepgram Nova-3 (Streaming)", business: "Deepgram Nova-3 + Custom Vocab" },
      { name: "Reasoning & LLM Router", starter: "Gemini 2.0 Flash-Lite", standard: "Gemini 2.0 Flash", business: "Gemini 2.0 Pro / Flash Swarm" },
      { name: "Natural TTS Voices", starter: "4 Standard Voices", standard: "All Deepgram Aura Voices", business: "Custom Brand Voice Cloning" },
      { name: "Concurrent Voice Lines", starter: "5 concurrent", standard: "50 concurrent", business: "500+ concurrent" },
    ],
  },
  {
    category: "Specialist Agents & Automation",
    items: [
      { name: "Multi-Agent Swarm Coordination", starter: "1 Single Agent", standard: "4 Specialist Swarm Agents", business: "8 Fully Bounded Swarm Agents" },
      { name: "Deterministic Business Logic Tools", starter: "Basic FAQs", standard: "Booking & Qualification", business: "Custom API & SQL Tool Calling" },
      { name: "Knowledge Base RAG (pgvector)", starter: "Up to 25 Sources", standard: "Unlimited Sources", business: "Enterprise Auto-Sync RAG" },
      { name: "After-Hours & Weekend Answering", starter: "Included", standard: "Included (Priority)", business: "24/7 Dedicated Line Support" },
      { name: "Human-in-the-Loop Barge-In", starter: "—", standard: "Live Listen-In", business: "Live Barge-In & Whisper Coach" },
    ],
  },
  {
    category: "Integrations & Workflows",
    items: [
      { name: "Calendar & Booking Sync", starter: "Google Calendar", standard: "Cal.com & Calendly", business: "Custom EHR/CRM Scheduling" },
      { name: "CRM Auto-Sync", starter: "Webhooks", standard: "HubSpot, Salesforce, Zapier", business: "Custom Bi-Directional CRM Sync" },
      { name: "Outbound Automated Follow-Ups", starter: "SMS Notifications", standard: "SMS & Automated Outbound Calls", business: "Omnichannel Campaign Dialer" },
      { name: "Call Recordings & Full Transcripts", starter: "30 Days", standard: "90 Days", business: "Unlimited Encrypted Storage" },
    ],
  },
  {
    category: "Support & Compliance",
    items: [
      { name: "TCPA & DNC Policy Engine", starter: "Standard", standard: "Enterprise Guardrails", business: "100% Deterministic Compliance" },
      { name: "Service Level Agreement (SLA)", starter: "Best Effort", standard: "99.9% Uptime", business: "99.99% Guaranteed SLA" },
      { name: "Support Channels", starter: "Email (24h)", standard: "Priority Chat & Email (< 2h)", business: "Dedicated Slack & Solution Architect" },
    ],
  },
]

const PRICING_FAQS = [
  {
    question: "How does the 7-day free trial work?",
    answer: "You get full, unrestricted access to the Omniweb AI contact center platform for 7 days. You can test sub-250ms voice calls, build chat assistants, and connect your knowledge sources. No credit card is required to begin.",
  },
  {
    question: "What counts as an AI conversation?",
    answer: "An AI conversation is any inbound phone call or interactive web chat session handled by your agent. Unanswered rings or visitors who just view the widget without asking a question never count against your quota.",
  },
  {
    question: "Can I bring or forward my existing business phone number?",
    answer: "Yes! You can instantly provision a new toll-free or local phone number inside Omniweb, or configure unconditional or after-hours call forwarding from your existing carrier (AT&T, Verizon, RingCentral, Grasshopper, etc.) in under 2 minutes.",
  },
  {
    question: "What happens if my business exceeds the monthly conversation allowance?",
    answer: "Your phone lines and AI agents never stop answering customer calls. Additional interactions are billed at a predictable, transparent rate ($0.04/conversation on Starter, $0.03 on Growth, and $0.02 on Scale), or you can upgrade tiers at any time with one click.",
  },
  {
    question: "Can I upgrade, downgrade, or cancel anytime?",
    answer: "Yes, there are zero lock-in contracts on monthly plans. You can upgrade or switch plans anytime from your Billing dashboard. If you cancel, your service remains active until the end of your billing cycle.",
  },
  {
    question: "How does Omniweb achieve sub-250ms voice response times?",
    answer: "We pair LiveKit WebRTC transport with Deepgram Nova-3 streaming transcription and Google Gemini 2.0 Flash reasoning directly on Google Cloud Platform fiber infrastructure, eliminating awkward conversational pauses completely.",
  },
]

export function PricingPageContent({
  isSignedIn,
  onboardingCompleted,
  currentPlan,
  subscriptionStatus,
  initialIndustry,
}: PricingPageContentProps) {
  const [selectedIndustry, setSelectedIndustry] = useState(() => normalizeIndustry(initialIndustry))
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly")
  const [monthlyVolume, setMonthlyVolume] = useState<number>(3000)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const content = getPricingContent(selectedIndustry)

  // Calculations for ROI calculator
  // Assume a human rep handles ~1,200 calls/mo and costs ~$4,000/mo with overhead ($25-$30/hr)
  const humanAgentsNeeded = Math.max(1, Math.ceil(monthlyVolume / 1200))
  const humanCostMonthly = humanAgentsNeeded * 4000
  const recommendedOmniwebCost =
    monthlyVolume <= 1200
      ? billingInterval === "annual" ? 119 : 149
      : monthlyVolume <= 5000
      ? billingInterval === "annual" ? 239 : 299
      : billingInterval === "annual" ? 399 : 499
  const monthlySavings = humanCostMonthly - recommendedOmniwebCost
  const annualSavings = monthlySavings * 12
  const savingsPercent = Math.round((monthlySavings / humanCostMonthly) * 100)

  return (
    <div className="space-y-24 pb-24">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            {content.badge}
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            {content.headline}
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">
            {content.description}
          </p>

          {/* Industry filter pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {PRICING_INDUSTRY_OPTIONS.map((option) => {
              const active = selectedIndustry === option.key

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSelectedIndustry(option.key)}
                  className={`inline-flex h-10 items-center justify-center rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-1 ring-cyan-300"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          {/* Monthly / Annual Billing Toggle */}
          <div className="mt-12 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingInterval("monthly")}
              className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                billingInterval === "monthly"
                  ? "bg-white text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval("annual")}
              className={`flex items-center gap-2 rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                billingInterval === "annual"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Plans Section ──────────────────────────────────── */}
      <section id="plans" className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <PlanSelectionGrid
            variant="public"
            isSignedIn={isSignedIn}
            onboardingCompleted={onboardingCompleted}
            currentPlan={currentPlan}
            subscriptionStatus={subscriptionStatus}
            industry={selectedIndustry}
            billingInterval={billingInterval}
          />
        </div>
      </section>

      {/* ── Enterprise Custom VPC Banner ────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-cyan-500/30 bg-[linear-gradient(135deg,rgba(10,25,50,0.85),rgba(6,12,28,0.85))] p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-cyan-300">
                <Shield className="h-3.5 w-3.5" /> Dedicated Cloud VPC
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Need High-Volume or Custom Swarm Orchestration?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                For organizations handling 50,000+ monthly calls, multi-location franchises, healthcare operations requiring HIPAA compliance, or custom CRM integrations — our engineering team provisions private Google Cloud clusters with custom SLA guarantees.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Dedicated LiveKit SIP trunks
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> 99.99% Uptime Guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Dedicated Solution Architect
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col justify-center">
              <Button
                size="lg"
                asChild
                className="h-13 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500"
              >
                <Link href="/company/contact">
                  Speak With Sales & Architect <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-13 rounded-xl border-white/15 bg-white/5 font-semibold text-white hover:bg-white/10"
              >
                <Link href="/demo">
                  Try Live Call Center Simulator
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive ROI Cost Calculator ─────────────────────── */}
      <section className="px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#08101f]/90 p-4 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <Calculator className="h-3.5 w-3.5" />
              Live Cost Comparison
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Calculate Your Real Monthly Savings
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Compare the cost of staffing human front-desk receptionists vs. deploying Omniweb 24/7 autonomous voice swarms.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Slider Control */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Estimated Monthly Inbound Calls & Chats:
                </label>
                <span className="text-2xl font-extrabold text-cyan-400">
                  {monthlyVolume.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min="500"
                max="15000"
                step="250"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400 focus:outline-none"
              />

              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>500 (Lean Setup)</span>
                <span>5,000 (Growing Team)</span>
                <span>15,000+ (High Volume)</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Traditional Front-Desk Reps Required:</span>
                  <span className="font-semibold text-white">{humanAgentsNeeded} full-time rep(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Hold Time:</span>
                  <span className="font-semibold text-white">4.5 minutes (Human) vs &lt; 250ms (Omniweb)</span>
                </div>
                <div className="flex justify-between">
                  <span>After-Hours Answering:</span>
                  <span className="font-semibold text-emerald-400">100% Covered 24/7/365</span>
                </div>
              </div>
            </div>

            {/* Financial Result Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400">Traditional Cost</p>
                <p className="mt-3 text-3xl font-extrabold text-red-400">
                  ${humanCostMonthly.toLocaleString()}<span className="text-sm font-medium text-slate-400">/mo</span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  ${(humanCostMonthly * 12).toLocaleString()}/yr in salaries &amp; overhead
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-6 text-center shadow-lg shadow-cyan-500/10">
                <p className="text-xs uppercase tracking-wider text-cyan-300">Omniweb AI Cost</p>
                <p className="mt-3 text-3xl font-extrabold text-white">
                  ${recommendedOmniwebCost.toLocaleString()}<span className="text-sm font-medium text-slate-400">/mo</span>
                </p>
                <p className="mt-2 text-xs text-cyan-200">
                  Fixed pricing, unlimited scale
                </p>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-emerald-500/40 bg-[linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,95,70,0.1))] p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Net Estimated Savings
                </p>
                <p className="mt-2 text-4xl font-black text-emerald-300">
                  ${monthlySavings.toLocaleString()} <span className="text-base font-semibold">saved/mo</span>
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  That&apos;s ${annualSavings.toLocaleString()} saved annually ({savingsPercent}% cost reduction)
                </p>
                <Button
                  size="lg"
                  asChild
                  className="mt-5 rounded-xl bg-emerald-500 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <Link href="/get-started">
                    Claim These Savings Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Comparison Matrix ───────────────────────────── */}
      <section className="px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#08101f]/90 p-4 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Compare Plan Capabilities Side-by-Side
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Detailed technical specifications across audio pipeline, AI routing, tools, and infrastructure.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="py-4 pr-4 font-bold text-white uppercase tracking-wider text-xs">Feature</th>
                  <th className="py-4 px-4 font-bold text-slate-300 uppercase tracking-wider text-xs">Starter ($149)</th>
                  <th className="py-4 px-4 font-bold text-cyan-300 uppercase tracking-wider text-xs">Growth / Pro ($299)</th>
                  <th className="py-4 pl-4 font-bold text-purple-300 uppercase tracking-wider text-xs">Scale ($499)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARISON_FEATURES.map((section) => (
                  <tbody key={section.category} className="divide-y divide-white/5">
                    <tr className="bg-white/[0.04]">
                      <td colSpan={4} className="py-3 px-3 font-bold uppercase tracking-widest text-[11px] text-cyan-400">
                        {section.category}
                      </td>
                    </tr>
                    {section.items.map((row) => (
                      <tr key={row.name} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 pr-4 font-medium text-slate-200">{row.name}</td>
                        <td className="py-3.5 px-4 text-slate-400">{row.starter}</td>
                        <td className="py-3.5 px-4 font-semibold text-cyan-300">{row.standard}</td>
                        <td className="py-3.5 pl-4 font-semibold text-purple-300">{row.business}</td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────── */}
      <section id="faq" className="px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#08101f]/90 p-4 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">
              <HelpCircle className="h-4 w-4" /> Frequently Asked Questions
            </div>
            <h2 className="mt-3 text-3xl font-extrabold text-white">
              Everything You Need to Know About Omniweb Pricing
            </h2>
          </div>

          <div className="space-y-4">
            {PRICING_FAQS.map((item, index) => {
              const isOpen = openFaq === index

              return (
                <div
                  key={item.question}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white sm:text-base"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-cyan-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-white/5 pt-3">
                      {item.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center rounded-[2rem] border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 p-12 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Start Answering Every Customer Today
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto text-sm leading-relaxed">
            Deploy your first autonomous voice &amp; chat swarm in under 10 minutes. 7-day risk-free trial with full feature access.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-13 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500"
            >
              <Link href="/get-started">
                Start Your Setup Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-13 rounded-xl border-white/20 bg-white/5 px-8 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Link href="/demo">
                Test Live Demo Simulator
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}