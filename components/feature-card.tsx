"use client"

import { ArrowRight, type LucideIcon } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

type FeatureCardProps = {
  icon: LucideIcon
  title: string
  benefit: string
  summary: string
  bullets: string[]
  actionLabel?: string
  index?: number
  accent?: "cyan" | "violet" | "emerald"
  image?: string
}

const accents = {
  cyan: {
    iconBg: "bg-cyan-400/15 border-cyan-400/35",
    iconText: "text-cyan-300",
    label: "text-cyan-300",
    bullet: "bg-cyan-400",
    link: "text-cyan-300 hover:text-cyan-100",
    hoverBorder: "group-hover:border-cyan-400/50",
    glow: "group-hover:shadow-[0_24px_80px_rgba(34,211,238,0.12)]",
    barGradient: "from-cyan-400 to-blue-500",
  },
  violet: {
    iconBg: "bg-violet-400/15 border-violet-400/35",
    iconText: "text-violet-300",
    label: "text-violet-300",
    bullet: "bg-violet-400",
    link: "text-violet-300 hover:text-violet-100",
    hoverBorder: "group-hover:border-violet-400/50",
    glow: "group-hover:shadow-[0_24px_80px_rgba(139,92,246,0.12)]",
    barGradient: "from-violet-400 to-fuchsia-500",
  },
  emerald: {
    iconBg: "bg-emerald-400/15 border-emerald-400/35",
    iconText: "text-emerald-300",
    label: "text-emerald-300",
    bullet: "bg-emerald-400",
    link: "text-emerald-300 hover:text-emerald-100",
    hoverBorder: "group-hover:border-emerald-400/50",
    glow: "group-hover:shadow-[0_24px_80px_rgba(16,185,129,0.12)]",
    barGradient: "from-emerald-400 to-teal-500",
  },
}

export function FeatureCard({
  icon: Icon,
  title,
  benefit,
  summary,
  bullets,
  actionLabel = "Try the demo",
  index = 0,
  accent = "cyan",
  image,
}: FeatureCardProps) {
  const a = accents[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,18,36,0.96),rgba(6,11,24,0.92))] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1.5 ${a.hoverBorder} ${a.glow}`}
    >
      {/* Top accent bar */}
      <div className={`absolute left-6 right-6 top-0 z-10 h-[2px] rounded-full bg-gradient-to-r ${a.barGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

      {/* Image */}
      {image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1224] via-transparent to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${a.iconBg} ${a.iconText} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] ${a.label}`}>{benefit}</p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-200/90">{summary}</p>
      <ul className="mt-5 space-y-2 text-sm text-slate-100/90">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span className={`mt-2 h-1.5 w-1.5 rounded-full ${a.bullet}`} />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <Button variant="ghost" className={`mt-5 px-0 ${a.link} hover:bg-transparent`}>
        {actionLabel}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Button>
      </div>
    </motion.div>
  )
}
