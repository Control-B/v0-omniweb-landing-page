"use client"

import { useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"

interface VideoHeroProps {
  youtubeId?: string
}

export function VideoHero({ youtubeId = "4YMOZ2hteDU" }: VideoHeroProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Video Background - positioned on right side */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Video container on the right */}
        <div className="absolute right-0 top-0 h-full w-full lg:w-[60%]">
          <iframe
            key={`${isMuted}-${isPlaying}`}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1`}
            title="Omniweb Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="pointer-events-none h-full w-full"
          />
        </div>
        {/* Overlay gradient for text readability - stronger on left for hero content */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 via-40% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 lg:px-16 xl:px-24">
        <div className="max-w-2xl">
          {/* Label */}
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            AI Website Platform
          </p>

          {/* Headline with gradient */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-foreground">Build Smarter.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
              Convert Faster.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg lg:text-xl">
            The all-in-one platform built for modern businesses.
            <br />
            Less complexity, more conversions.
          </p>
        </div>
      </div>

      {/* Scrolling Marquee Text */}
      <div className="relative z-10 overflow-hidden border-t border-border/20 bg-background/30 py-4 backdrop-blur-sm">
        <div className="animate-marquee flex whitespace-nowrap">
          <span className="mx-8 text-lg font-medium text-foreground/70 lg:text-2xl">
            From e-commerce brands to professional services, we build AI-powered websites that present, qualify, and convert your visitors into customers.
          </span>
          <span className="mx-8 text-lg font-medium text-foreground/70 lg:text-2xl">
            From e-commerce brands to professional services, we build AI-powered websites that present, qualify, and convert your visitors into customers.
          </span>
        </div>
      </div>

      {/* Video Controls - integrated into footer area */}
      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
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
