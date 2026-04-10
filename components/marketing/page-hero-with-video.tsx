"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Pause, Play, Volume2, VolumeX, Zap, BarChart3, Clock, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HeroAction = {
  label: string
  href: string
  variant?: "primary" | "secondary"
}

interface PageHeroWithVideoProps {
  id?: string
  eyebrow: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  size?: "default" | "large"
  youtubeId?: string
  localVideos?: string[]
  videoTitle: string
  videoSlotLabel?: string
  primaryAction: HeroAction
  secondaryAction?: HeroAction
  badges?: string[]
  note?: string
}

export function PageHeroWithVideo({
  id,
  eyebrow,
  title,
  description,
  size = "default",
  youtubeId = "Dz2_7Em3VXo",
  localVideos,
  videoTitle,
  videoSlotLabel,
  primaryAction,
  secondaryAction,
  badges = [],
  note,
}: PageHeroWithVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [localVideoFailed, setLocalVideoFailed] = useState(false)
  const [isLargeDesktop, setIsLargeDesktop] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const activeLocalVideo = localVideos?.[currentVideoIndex]
  const hasWorkingLocalVideo = Boolean(activeLocalVideo && !localVideoFailed)

  const playWithSound = async () => {
    setIsPlaying(true)
    setIsMuted(false)

    if (hasWorkingLocalVideo) {
      if (!videoRef.current) return
      videoRef.current.muted = false
      await videoRef.current.play().catch(() => {})
      return
    }

    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "unMute" }),
      "*"
    )
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "playVideo" }),
      "*"
    )
  }

  const toggleMute = async () => {
    if (isMuted) {
      await playWithSound()
      return
    }

    setIsMuted(true)

    if (hasWorkingLocalVideo) {
      if (videoRef.current) videoRef.current.muted = true
      return
    }

    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "mute" }),
      "*"
    )
  }

  useEffect(() => {
    setLocalVideoFailed(false)
  }, [activeLocalVideo])

  useEffect(() => {
    if (hasWorkingLocalVideo) {
      if (videoRef.current) {
        if (isPlaying) videoRef.current.play().catch(() => {})
        else videoRef.current.pause()
      }
      return
    }

    if (!iframeRef.current?.contentWindow) return
    const message = JSON.stringify({
      event: "command",
      func: isPlaying ? "playVideo" : "pauseVideo"
    })
    iframeRef.current.contentWindow.postMessage(message, "*")
  }, [hasWorkingLocalVideo, isPlaying, localVideos])

  useEffect(() => {
    if (hasWorkingLocalVideo) {
      if (videoRef.current) {
        videoRef.current.muted = isMuted
      }
      return
    }

    if (!iframeRef.current?.contentWindow) return
    const message = JSON.stringify({
      event: "command",
      func: isMuted ? "mute" : "unMute"
    })
    iframeRef.current.contentWindow.postMessage(message, "*")
  }, [hasWorkingLocalVideo, isMuted, localVideos])

  useEffect(() => {
    const handlePause = () => {
      setIsPlaying(false)
      if (!hasWorkingLocalVideo) setIsMuted(true)
    }

    window.addEventListener("omniweb:pause-media", handlePause)
    return () => window.removeEventListener("omniweb:pause-media", handlePause)
  }, [hasWorkingLocalVideo])

  useEffect(() => {
    if (hasWorkingLocalVideo && videoRef.current) {
      // Auto-play when mounted if it's local videos (like hero autoplay)
      setIsPlaying(true)
    }
  }, [hasWorkingLocalVideo])

  useEffect(() => {
    if (size !== "large") return

    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsLargeDesktop(event.matches)
    }

    handleChange(mediaQuery)
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [size])

  const handleVideoEnded = () => {
    if (localVideos && localVideos.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % localVideos.length)
    } else if (videoRef.current) {
      videoRef.current.play().catch(() => {}) // Loop single video
    }
  }

  const renderVideoMedia = ({
    className,
    objectClassName,
    isBackground = false,
  }: {
    className?: string
    objectClassName?: string
    isBackground?: boolean
  }) => {
    if (hasWorkingLocalVideo) {
      return (
        <video
          ref={videoRef}
          key={activeLocalVideo}
          autoPlay
          muted={isMuted}
          playsInline
          loop
          preload="auto"
          onEnded={handleVideoEnded}
          onError={() => setLocalVideoFailed(true)}
          className={cn(className, objectClassName)}
        >
          <source src={activeLocalVideo} type="video/mp4" />
        </video>
      )
    }

    return (
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&cc=0&hl=en&enablejsapi=1`}
        title={videoTitle}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className={cn(className, objectClassName, !isBackground && "pointer-events-none")}
        style={isBackground ? { position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" } : undefined}
      />
    )
  }

  return (
    <section id={id} className={cn(
      "relative overflow-hidden border-b border-white/10 bg-[#050a12]",
      size === "large" && "min-h-dvh"
    )}>
      {/* ─── FULL-SCREEN VIDEO BACKGROUND (large hero only) ─── */}
      {size === "large" && isLargeDesktop && (
        <div className="absolute inset-0 z-0 hidden items-center justify-center bg-[#050a12] lg:flex">
          {renderVideoMedia({ className: "h-full w-full", objectClassName: "scale-[0.94] object-contain", isBackground: true })}
          {/* Light overlays — just enough for text legibility without dimming the video */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/60 via-transparent to-transparent" />
        </div>
      )}

      {/* ─── Original decorative background (default size only) ─── */}
      {size !== "large" && (
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-[28rem] w-[28rem] rounded-full bg-cyan-500/25 blur-[120px]" />
          <div className="absolute right-0 top-24 h-[30rem] w-[30rem] rounded-full bg-purple-500/25 blur-[140px]" />
          <div className="absolute bottom-0 left-1/2 h-[24rem] w-[70rem] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_30%)]" />
        </div>
      )}

      {/* ─── CONTENT ─── */}
      {size === "large" && hasWorkingLocalVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute right-4 top-4 z-30 hidden lg:right-8 lg:top-24 lg:block"
        >
          <button
            onClick={() => void toggleMute()}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 text-[11px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md transition hover:bg-black/60"
            aria-label={isMuted ? "Play narrator with sound" : "Mute narrator"}
          >
            {isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {isMuted ? "Play with sound" : "Mute narrator"}
          </button>
        </motion.div>
      )}
      <div
        className={cn(
          "relative z-10",
          size === "large"
            ? "flex min-h-dvh flex-col px-6 pb-12 pt-24 lg:justify-end lg:px-12 lg:pb-16 lg:pt-32"
            : "mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_34rem] lg:items-center lg:px-8 lg:py-20"
        )}
      >
        {size === "large" && !isLargeDesktop && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: "easeOut" }}
            className="relative mb-8 lg:hidden"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#04070d] shadow-2xl shadow-black/35 aspect-video">
              {renderVideoMedia({ className: "h-full w-full", objectClassName: "object-cover" })}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a12]/30 via-transparent to-black/10" />

              <button
                onClick={() => void toggleMute()}
                className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/28 text-white/85 backdrop-blur-md transition hover:bg-black/45"
                aria-label={isMuted ? "Play narrator with sound" : "Mute narrator"}
              >
                {isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
            </div>
          </motion.div>
        )}

        <div className={cn(size === "large" ? "max-w-2xl" : "max-w-3xl")}>
          {size !== "large" && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="site-eyebrow mb-5"
            >
              {eyebrow}
            </motion.p>
          )}

          {size !== "large" && (
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
              className="site-h2"
            >
              {title}
            </motion.h2>
          )}

          {description ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55, ease: "easeOut" }}
              className={cn("site-section-copy mt-6", size === "large" ? "max-w-2xl" : "max-w-2xl")}
            >
              {description}
            </motion.p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className={cn("flex flex-col gap-2.5", size === "large" ? "mt-5" : "mt-8")}
          >
            <RotatingStatCard
              messages={cardMessagesA}
              intervalMs={3500}
              compact={size === "large"}
            />
            <RotatingStatCard
              messages={cardMessagesB}
              intervalMs={4200}
              compact={size === "large"}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
            className={cn("flex flex-col gap-3 sm:flex-row", size === "large" ? "mt-6" : "mt-10")}
          >
            <HeroActionButton action={primaryAction} />
            {secondaryAction ? <HeroActionButton action={secondaryAction} /> : null}
          </motion.div>

          {note ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className={cn("text-white/40", size === "large" ? "mt-3 text-[11px]" : "mt-5 text-sm")}
            >
              {note}
            </motion.p>
          ) : null}
        </div>

        {/* Video panel — default (non-fullscreen) hero only */}
        {size !== "large" && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-purple-500/15 blur-3xl" />
            <div className="kling-panel-strong relative overflow-hidden rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.25em] text-white/35">
                <span>{videoTitle}</span>
                <span>{videoSlotLabel ?? "Replace with page-specific explainer"}</span>
              </div>
              <div className="relative overflow-hidden bg-[#04070d] aspect-video">
                {hasWorkingLocalVideo ? (
                  <video
                    ref={videoRef}
                    key={activeLocalVideo}
                    autoPlay
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    onEnded={handleVideoEnded}
                    onError={() => setLocalVideoFailed(true)}
                    className="h-full w-full object-cover"
                  >
                    <source src={activeLocalVideo} type="video/mp4" />
                  </video>
                ) : (
                  <iframe
                    ref={iframeRef}
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&cc=0&hl=en&enablejsapi=1`}
                    title={videoTitle}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="pointer-events-none h-full w-full scale-[1.05]"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a12]/20 via-transparent to-transparent" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                <p className="text-sm text-white/45">Video explains the page first. AI assistant is there for deeper questions.</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying((value) => !value)}
                    className="kling-pill inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={() => setIsMuted((value) => !value)}
                    className="kling-pill inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {isMuted ? "Unmute" : "Mute"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating mute/unmute for fullscreen hero */}
        {size === "large" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="fixed bottom-6 right-6 z-50 hidden gap-2 lg:flex"
          >
            <button
              onClick={() => setIsPlaying((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 backdrop-blur-lg transition hover:bg-black/80"
              aria-label={isPlaying ? "Pause hero video" : "Play hero video"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => void toggleMute()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 backdrop-blur-lg transition hover:bg-black/80"
              aria-label={isMuted ? "Play hero video with sound" : "Mute hero video"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

/* ─── Auto-rotating marketing message cards ─── */
type CardMessage = {
  icon: React.ReactNode
  stat: string
  label: string
}

const cardMessagesA: CardMessage[] = [
  { icon: <Zap className="h-3.5 w-3.5 text-cyan-400" />, stat: "< 2s", label: "Avg response time" },
  { icon: <Clock className="h-3.5 w-3.5 text-blue-400" />, stat: "24/7", label: "Always-on coverage" },
  { icon: <Shield className="h-3.5 w-3.5 text-emerald-400" />, stat: "99.9%", label: "Platform uptime" },
  { icon: <Zap className="h-3.5 w-3.5 text-amber-400" />, stat: "60s", label: "Lead follow-up speed" },
]

const cardMessagesB: CardMessage[] = [
  { icon: <BarChart3 className="h-3.5 w-3.5 text-purple-400" />, stat: "+38%", label: "More conversions" },
  { icon: <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />, stat: "30+", label: "Hours saved / week" },
  { icon: <Shield className="h-3.5 w-3.5 text-blue-400" />, stat: "3×", label: "Faster qualification" },
  { icon: <Clock className="h-3.5 w-3.5 text-emerald-400" />, stat: "$0", label: "Missed-call revenue lost" },
]

function RotatingStatCard({ messages, intervalMs, compact = false }: { messages: CardMessage[]; intervalMs: number; compact?: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [messages.length, intervalMs])

  const current = messages[index]

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] shadow-lg shadow-black/30 backdrop-blur-xl",
      compact ? "h-12 w-[260px]" : "h-12 min-w-[220px]"
    )}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -18, filter: "blur(4px)" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn("absolute inset-0 flex items-center gap-2.5", compact ? "px-4" : "px-4")}
        >
          <div className={cn("flex shrink-0 items-center justify-center rounded-md bg-white/[0.06]", compact ? "h-7 w-7" : "h-6 w-6")}>
            {current.icon}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn("font-bold text-white/90", compact ? "text-lg" : "text-base")}>{current.stat}</span>
            <span className={cn("whitespace-nowrap font-medium text-white/50", compact ? "text-sm" : "text-[12px]")}>{current.label}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function HeroActionButton({ action }: { action: HeroAction }) {
  if (action.variant === "secondary") {
    return (
      <Button
        size="lg"
        variant="outline"
        asChild
        className="kling-pill h-12 rounded-lg border border-white/20 bg-transparent px-6 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-white/10"
      >
        <Link href={action.href}>{action.label}</Link>
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      asChild
      className={cn(
        "rounded-lg bg-[#3b82f6] font-bold uppercase tracking-wider text-white hover:bg-[#2563eb]",
        "h-10 px-5 text-[11px]",
      )}
    >
      <Link href={action.href} className="inline-flex items-center gap-2">
        {action.label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Button>
  )
}
