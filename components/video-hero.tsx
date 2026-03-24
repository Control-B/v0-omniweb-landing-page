"use client"

import { useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"

interface VideoHeroProps {
  youtubeId?: string
}

export function VideoHero({ youtubeId = "Dz2_7Em3VXo" }: VideoHeroProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Video Background - scaled to crop YouTube UI elements and captions */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Video container - smaller and positioned to the right */}
        <div className="absolute -bottom-[15%] -top-[10%] right-0 w-[70%]">
          <iframe
            key={`${isMuted}-${isPlaying}`}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&cc=0&hl=en`}
            title="Omniweb Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="pointer-events-none h-full w-full scale-110"
          />
        </div>
        {/* Overlay gradient for text readability - dark blue gradient on left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/95 via-35% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 via-transparent to-[#0a1628]/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 lg:px-16 xl:px-24">
        <div className="max-w-2xl">
          {/* Label */}
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            AI Website Platform
          </p>

          {/* Headline with gradient */}
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-foreground">Build Smarter.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
              Convert Faster.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            From e-commerce brands to professional services, we build AI-powered websites that present, qualify, and convert your visitors into customers.
          </p>
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
