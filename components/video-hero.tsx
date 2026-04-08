"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { dispatchAssistantOpen } from "@/lib/assistant-events"

const MEDIA_PAUSE_EVENT = "omniweb:pause-media"
const YOUTUBE_ORIGIN = "https://www.youtube-nocookie.com"

interface VideoHeroProps {
  youtubeId?: string
}

export function VideoHero({ youtubeId = "Dz2_7Em3VXo" }: VideoHeroProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const router = useRouter()

  const postPlayerMessage = (payload: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), YOUTUBE_ORIGIN)
  }

  const syncPlayerState = () => {
    postPlayerMessage({ event: "listening" })
    postPlayerMessage({
      event: "command",
      func: isMuted ? "mute" : "unMute",
      args: [],
    })
    postPlayerMessage({
      event: "command",
      func: isPlaying ? "playVideo" : "pauseVideo",
      args: [],
    })
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_ORIGIN && event.origin !== "https://www.youtube.com") return
      
      try {
        const data = JSON.parse(event.data)
        
        // YouTube API infoDelivery sends playerState changes
        // playerState 0 = ended
        if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
          router.push('/solutions')
        }
      } catch (e) {
        // Ignore unparseable messages
      }
    }

    window.addEventListener("message", handleMessage)

    return () => window.removeEventListener("message", handleMessage)
  }, [router])

  // Control YouTube via the postMessage API instead of remounting the iframe key
  useEffect(() => {
    postPlayerMessage({
      event: "command",
      func: isPlaying ? "playVideo" : "pauseVideo",
      args: [],
    })
  }, [isPlaying])

  useEffect(() => {
    postPlayerMessage({
      event: "command",
      func: isMuted ? "mute" : "unMute",
      args: [],
    })
  }, [isMuted])

  useEffect(() => {
    const handlePauseMedia = () => {
      setIsPlaying(false)
      setIsMuted(true)
    }

    window.addEventListener(MEDIA_PAUSE_EVENT, handlePauseMedia)
    return () => window.removeEventListener(MEDIA_PAUSE_EVENT, handlePauseMedia)
  }, [])

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Video Background - scaled to crop YouTube UI elements and captions */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Video container - fills hero height and stays anchored right */}
        <div className="absolute inset-y-0 right-0 w-[68%] overflow-hidden">
          <iframe
            ref={iframeRef}
            onLoad={syncPlayerState}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=1&loop=0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&cc=0&hl=en`}
            title="Omniweb Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[142%] w-[142%] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.08]"
          />
        </div>
        {/* Overlay gradient for text readability with less video suppression */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050a12]/80 via-[#050a12]/40 via-30% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a12]/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 lg:px-16 xl:px-24">
        <div className="max-w-2xl">
          {/* Label */}
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            AI Revenue System
          </p>

          {/* Headline with gradient */}
          <h2 className="site-h2 mb-6">
            <span className="site-display-tone-dark">AI that answers, qualifies,</span>
            <br />
            <span className="site-display-accent">
              and books more business.
            </span>
          </h2>

          {/* Supporting text */}
          <h3 className="site-h3 max-w-xl">
            Omniweb combines video-first pages, AI voice agents, AI chat assistants, and follow-up automation so your business captures more leads, closes more sales, and reduces manual work.
          </h3>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-400"
              onClick={() => dispatchAssistantOpen("voice")}
            >
              Talk to AI
            </Button>
            <Button size="lg" asChild className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
              <Link href="/get-started">
                Start Free Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              { label: "Lead response", value: "24/7" },
              { label: "Follow-up speed", value: "< 60s" },
              { label: "Manual work saved", value: "30+ hrs" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-9 items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-background"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play
            </>
          )}
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex h-9 items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-background"
        >
          {isMuted ? (
            <>
              <VolumeX className="h-4 w-4" />
              Unmute
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Mute
            </>
          )}
        </button>
      </div>
    </div>
  )
}
