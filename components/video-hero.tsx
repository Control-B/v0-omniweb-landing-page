"use client"

import { Play } from "lucide-react"
import { useState } from "react"

interface VideoHeroProps {
  videoUrl?: string
  posterUrl?: string
}

export function VideoHero({ videoUrl, posterUrl }: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-6 lg:px-8">
      {/* Subtle glow effect behind video */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[60%] w-[70%] rounded-full bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] blur-3xl" />
      </div>

      {/* Tagline */}
      <p className="relative mb-6 text-center text-sm font-medium tracking-wide text-muted-foreground lg:mb-8 lg:text-base">
        AI-powered websites that present, qualify, and convert.
      </p>

      {/* Video Container */}
      <div className="relative w-full max-w-4xl">
        {/* Glass border effect */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-white/5" />

        {/* Video wrapper */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl shadow-black/50 backdrop-blur-sm">
          {/* Aspect ratio container */}
          <div className="relative aspect-video w-full">
            {videoUrl && isPlaying ? (
              <video
                src={videoUrl}
                poster={posterUrl}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary/80 to-secondary/40">
                {/* Placeholder with play button */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="group flex h-20 w-20 items-center justify-center rounded-full border border-border/50 bg-background/80 shadow-lg transition-all hover:scale-105 hover:bg-background lg:h-24 lg:w-24"
                  aria-label="Play video"
                >
                  <Play className="h-8 w-8 text-foreground transition-transform group-hover:scale-110 lg:h-10 lg:w-10" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
