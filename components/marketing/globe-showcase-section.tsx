"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { RotatingGlobeBackground } from "@/components/solutions/rotating-globe-background"

const globeFeaturePoints = [
  {
    title: "AI Voice + Text Customer Service",
    description: "Answer calls, chats, SMS, and website questions instantly with a consistent brand voice that never sleeps.",
    accent: "from-cyan-400/30 via-sky-400/20 to-blue-500/25",
    border: "border-cyan-300/30",
    glow: "shadow-[0_24px_80px_rgba(34,211,238,0.18)]",
    position: "left-[4%] top-[12%]",
  },
  {
    title: "AI Sales Specialist",
    description: "Guide buyers, handle objections, recommend next steps, and keep high-intent conversations moving toward revenue.",
    accent: "from-violet-400/28 via-fuchsia-400/18 to-blue-500/22",
    border: "border-violet-300/30",
    glow: "shadow-[0_24px_80px_rgba(139,92,246,0.18)]",
    position: "right-[4%] top-[16%]",
  },
  {
    title: "AI Lead Qualification Expert",
    description: "Collect buying intent, budget, urgency, and service fit automatically so your team spends time only on qualified opportunities.",
    accent: "from-emerald-400/28 via-cyan-300/16 to-teal-400/24",
    border: "border-emerald-300/30",
    glow: "shadow-[0_24px_80px_rgba(16,185,129,0.18)]",
    position: "left-1/2 top-[62%] -translate-x-1/2",
  },
]

export function GlobeShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 20%"],
  })

  const copyY = useTransform(scrollYProgress, [0, 1], [20, -10])

  return (
    <section ref={sectionRef} className="relative -mt-px flex min-h-[92vh] items-center justify-center overflow-hidden border-b border-[#1e293b]/50 bg-[#030712]">
      <div className="absolute inset-0 z-0" style={{ width: "100%", height: "100%" }}>
        <RotatingGlobeBackground className="h-full w-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(3,7,18,0.4)_80%,rgba(3,7,18,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_50%_38%,rgba(34,211,238,0.12),transparent_22%),radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.12),transparent_24%),radial-gradient(circle_at_35%_72%,rgba(16,185,129,0.1),transparent_20%)]" />

      {/* ── Desktop: two-row layout — copy on top, cards below ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 py-14 lg:px-8 lg:pt-10 lg:pb-6">
        {/* Copy — sits in normal flow so it never overlaps cards */}
        <motion.div
          style={{ y: copyY }}
          className="max-w-2xl text-left"
        >
          <div className="site-eyebrow inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-400/12 px-4 py-1.5 text-cyan-200 backdrop-blur-md shadow-[0_18px_60px_rgba(34,211,238,0.18)]">
            Revenue Orbit
          </div>
          <h2 className="site-h2 mt-4 max-w-3xl text-3xl lg:text-4xl">
            Put AI specialists around every customer conversation.
          </h2>
        </motion.div>

        {/* Desktop orbit cards — pushed into bottom portion */}
        <div className="relative mx-auto mt-4 hidden h-[36rem] w-full max-w-6xl lg:block">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[29rem] w-[29rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 border-dashed opacity-70" />

          {globeFeaturePoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ y: [0, index % 2 === 0 ? -10 : 10, 0] }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                opacity: { duration: 0.45, delay: index * 0.12 },
                y: { duration: 7 + index, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                scale: { duration: 0.45, delay: index * 0.12 },
              }}
              className={`absolute w-[18rem] overflow-hidden rounded-[1.75rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06))] px-6 py-6 text-left backdrop-blur-2xl ${point.border} ${point.glow} ${point.position}`}
            >
              <div className={`absolute inset-0 rounded-[1.75rem] bg-gradient-to-br ${point.accent} opacity-90`} />
              <div className="relative z-10">
                <div className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                  Omniweb AI
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-tight text-white">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-100/88">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile stacked cards */}
        <div className="mt-14 grid gap-5 text-left lg:hidden">
          {globeFeaturePoints.map((point, index) => (
            <motion.div
              key={`${point.title}-mobile`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-[1.5rem] border px-5 py-5 text-left backdrop-blur-xl ${point.border} ${point.glow}`}
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
              }}
            >
              <div className={`absolute inset-0 rounded-[1.5rem] bg-gradient-to-br ${point.accent} opacity-80`} />
              <div className="relative z-10">
                <div className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                  Omniweb AI
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{point.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-100/88">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}