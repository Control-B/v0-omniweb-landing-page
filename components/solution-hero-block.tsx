"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type SolutionHeroProps = {
  icon: LucideIcon
  title: string
  problem: string
  workflow: string
  outcome: string
  href?: string
  videoSrc?: string
  videoSources?: string[]
  index?: number
  accent?: "cyan" | "violet" | "emerald"
  stats?: { value: string; label: string }[]
}

const accentStyles = {
  cyan: {
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    glow: "bg-blue-600/10",
    glowAlt: "bg-cyan-600/8",
    label: "text-cyan-300",
    bullet: "text-cyan-400",
    statColor: "text-cyan-400",
  },
  violet: {
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    glow: "bg-purple-600/10",
    glowAlt: "bg-violet-600/8",
    label: "text-violet-300",
    bullet: "text-violet-400",
    statColor: "text-violet-400",
  },
  emerald: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    glow: "bg-emerald-600/10",
    glowAlt: "bg-teal-600/8",
    label: "text-emerald-300",
    bullet: "text-emerald-400",
    statColor: "text-emerald-400",
  },
}

export function SolutionHeroBlock({
  icon: Icon,
  title,
  problem,
  workflow,
  outcome,
  href = "/get-started",
  videoSrc,
  videoSources,
  index = 0,
  accent = "cyan",
  stats,
}: SolutionHeroProps) {
  const a = accentStyles[accent]
  const reversed = index % 2 === 1

  // Multi-video seamless sequential playback — all videos preloaded and stacked
  const videos = videoSources ?? (videoSrc ? [videoSrc] : [])
  const [currentVideo, setCurrentVideo] = useState(0)
  const [isNearViewport, setIsNearViewport] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Lazy-load: only activate videos when section is near the viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true)
          observer.disconnect() // Once visible, stay loaded
        }
      },
      { rootMargin: "200px" } // Start loading 200px before entering viewport
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // When the active video ends, instantly switch to the next (already preloaded)
  const handleVideoEnded = useCallback((idx: number) => {
    if (idx !== currentVideo) return
    const next = (idx + 1) % videos.length
    setCurrentVideo(next)
    videoRefs.current[next]?.play().catch(() => {})
  }, [currentVideo, videos.length])

  // Start the first video on mount
  useEffect(() => {
    if (videos.length > 0) {
      const v = videoRefs.current[0]
      if (v) {
        v.setAttribute("muted", "")
        v.muted = true
        v.play().catch(() => {})
      }
    }
  }, [videos.length])

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-white/10">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full ${a.glow} blur-[120px]`} />
        <div className={`absolute right-0 top-1/2 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/2 rounded-full ${a.glowAlt} blur-[100px]`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050a12]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
        <div className={`grid items-center gap-12 lg:grid-cols-2 ${reversed ? "lg:direction-rtl" : ""}`}>
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className={`order-2 ${reversed ? "lg:order-2 lg:text-left" : "lg:order-1"}`}
            style={{ direction: "ltr" }}
          >
            <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${a.badge}`}>
              <Icon className="h-3.5 w-3.5" />
              {title}
            </div>

            <div className="space-y-5">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${a.label}`}>The Problem</p>
                <p className="mt-2 text-lg leading-8 text-slate-100/90">{problem}</p>
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${a.label}`}>How Omniweb Solves It</p>
                <p className="mt-2 text-lg leading-8 text-slate-100/90">{workflow}</p>
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${a.label}`}>Expected Outcome</p>
                <p className="mt-2 text-lg leading-8 text-slate-100/90">{outcome}</p>
              </div>
            </div>

            <div className="mt-8">
              <Button size="lg" asChild className="h-12 rounded-lg bg-[#3b82f6] px-6 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#2563eb]">
                <Link href={href}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Video side */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className={`order-1 relative flex w-full min-w-0 flex-col gap-5 ${reversed ? "lg:order-1" : "lg:order-2"}`}
            style={{ direction: "ltr" }}
          >
            {/* Video container */}
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30" style={{ aspectRatio: "16/9" }}>
              {videos.length > 0 && isNearViewport ? (
                videos.map((src, i) => {
                  // Only load the current and next video to save bandwidth
                  const nextIdx = (currentVideo + 1) % videos.length
                  const shouldLoad = i === currentVideo || i === nextIdx
                  const posterUrl = src.replace('/media/', '/media/posters/').replace('.mp4', '.jpg')
                  return (
                  <video
                    key={src}
                    ref={(el) => {
                      videoRefs.current[i] = el
                      if (el) {
                        el.setAttribute("muted", "")
                        el.muted = true
                      }
                    }}
                    src={shouldLoad ? src : undefined}
                    autoPlay={i === 0}
                    muted
                    playsInline
                    preload={i === currentVideo ? "auto" : "none"}
                    poster={posterUrl}
                    onEnded={() => handleVideoEnded(i)}
                    onStalled={(e) => {
                      const vid = e.currentTarget
                      setTimeout(() => {
                        if (vid && vid.paused && i === currentVideo) {
                          vid.currentTime = Math.max(0, vid.currentTime - 0.1)
                          vid.play().catch(() => {})
                        }
                      }, 4000)
                    }}
                    onWaiting={(e) => {
                      const vid = e.currentTarget
                      setTimeout(() => {
                        if (vid && vid.paused && i === currentVideo) {
                          vid.play().catch(() => {})
                        }
                      }, 4000)
                    }}
                    className={`absolute inset-0 h-full w-full object-cover brightness-110 transition-opacity duration-300 ${i === currentVideo ? "opacity-100" : "opacity-0"}`}
                  />
                  )
                })
              ) : videos.length > 0 && !isNearViewport ? (
                /* Show first poster as placeholder until section enters viewport */
                <img
                  src={videos[0].replace('/media/', '/media/posters/').replace('.mp4', '.jpg')}
                  alt={title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover brightness-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border ${a.badge}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium text-white/40">Video coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats row */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-center backdrop-blur-sm">
                    <div className={`text-xl font-bold ${a.statColor}`}>{stat.value}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
