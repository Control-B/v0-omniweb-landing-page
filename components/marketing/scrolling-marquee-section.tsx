"use client"

import { useRef } from "react"

/* ── 10 colorful marketing message cards ── */
const marqueeCards = [
  {
    label: "Revenue",
    title: "More sales closed",
    body: "AI handles first response, objections, and routing while your team focuses on closing.",
    gradient: "from-cyan-500/30 to-blue-600/20",
    border: "border-cyan-400/30",
    labelColor: "text-cyan-300",
  },
  {
    label: "Pipeline",
    title: "More qualified leads",
    body: "Every inquiry is scored, enriched, and passed to the right human or automated flow.",
    gradient: "from-violet-500/30 to-fuchsia-500/20",
    border: "border-violet-400/30",
    labelColor: "text-violet-300",
  },
  {
    label: "Efficiency",
    title: "Less manual work",
    body: "Automation replaces repetitive intake, booking, and follow-up tasks across the funnel.",
    gradient: "from-emerald-500/30 to-teal-500/20",
    border: "border-emerald-400/30",
    labelColor: "text-emerald-300",
  },
  {
    label: "Speed",
    title: "Sub-60s response",
    body: "Leads get answered in under a minute — day, night, weekends, holidays — no exceptions.",
    gradient: "from-amber-500/30 to-orange-500/20",
    border: "border-amber-400/30",
    labelColor: "text-amber-300",
  },
  {
    label: "Coverage",
    title: "24/7 availability",
    body: "AI voice and chat agents never clock out, so your business never misses an opportunity.",
    gradient: "from-rose-500/30 to-pink-500/20",
    border: "border-rose-400/30",
    labelColor: "text-rose-300",
  },
  {
    label: "Conversion",
    title: "Higher close rates",
    body: "Instant follow-up and smart objection handling keep high-intent buyers moving forward.",
    gradient: "from-sky-500/30 to-indigo-500/20",
    border: "border-sky-400/30",
    labelColor: "text-sky-300",
  },
  {
    label: "Intelligence",
    title: "Smarter qualification",
    body: "AI collects budget, urgency, and fit data so your team only talks to the best opportunities.",
    gradient: "from-fuchsia-500/30 to-purple-600/20",
    border: "border-fuchsia-400/30",
    labelColor: "text-fuchsia-300",
  },
  {
    label: "Scale",
    title: "Handle 10× more leads",
    body: "AI processes hundreds of conversations simultaneously without added headcount or burnout.",
    gradient: "from-teal-500/30 to-cyan-600/20",
    border: "border-teal-400/30",
    labelColor: "text-teal-300",
  },
  {
    label: "Retention",
    title: "Better customer experience",
    body: "Instant answers and consistent brand voice build trust and reduce churn from slow response.",
    gradient: "from-lime-500/30 to-green-500/20",
    border: "border-lime-400/30",
    labelColor: "text-lime-300",
  },
  {
    label: "Insight",
    title: "Actionable analytics",
    body: "Every conversation is logged, scored, and summarized — giving your team data to improve and close.",
    gradient: "from-indigo-500/30 to-blue-500/20",
    border: "border-indigo-400/30",
    labelColor: "text-indigo-300",
  },
]

function MarqueeCard({
  card,
}: {
  card: (typeof marqueeCards)[number]
}) {
  return (
    <div
      className={`relative w-[min(20rem,calc(100vw-2rem))] flex-shrink-0 overflow-hidden rounded-[1.6rem] border ${card.border} bg-white/[0.05] px-5 py-5 backdrop-blur-sm sm:px-6 sm:py-6`}
    >
      <div
        className={`absolute inset-0 rounded-[1.6rem] bg-gradient-to-br ${card.gradient} opacity-80`}
      />
      <div className="relative z-10">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${card.labelColor}`}
        >
          {card.label}
        </p>
        <h3 className="mt-3 text-xl font-semibold text-white">{card.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-200/90">{card.body}</p>
      </div>
    </div>
  )
}

export function ScrollingMarqueeSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative overflow-hidden border-y border-white/15 bg-white/[0.03] py-14 lg:py-16">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050a12] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050a12] to-transparent" />

      {/* Scrolling track */}
      <div ref={containerRef} className="flex w-max animate-marquee gap-5">
        {/* Render cards twice for seamless loop */}
        {[...marqueeCards, ...marqueeCards].map((card, i) => (
          <MarqueeCard key={`${card.title}-${i}`} card={card} />
        ))}
      </div>
    </section>
  )
}
