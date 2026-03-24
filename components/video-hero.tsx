"use client"

import { useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface VideoHeroProps {
  youtubeId?: string
}

export function VideoHero({ youtubeId = "DqKwuU8v2pU" }: VideoHeroProps) {
  const [isMuted, setIsMuted] = useState(true)

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-6 lg:px-8">
      {/* Subtle glow effect behind video */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[60%] w-[50%] rounded-full bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] blur-3xl" />
      </div>

      {/* Tagline */}
      <p className="relative mb-6 text-center text-sm font-medium tracking-wide text-muted-foreground lg:mb-8 lg:text-base">
        AI-powered websites that present, qualify, and convert.
      </p>

      {/* Video Container - vertical aspect ratio for Shorts */}
      <div className="relative h-full max-h-[60vh] w-auto aspect-[9/16]">
        {/* Glass border effect */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-white/5" />

        {/* Video wrapper */}
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl shadow-black/50 backdrop-blur-sm">
          <iframe
            key={isMuted ? "muted" : "unmuted"}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
            title="Omniweb Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
          
          {/* Mute/Unmute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 border border-border/50 shadow-lg transition-all hover:bg-background hover:scale-105"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-foreground" />
            ) : (
              <Volume2 className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
