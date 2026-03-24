"use client"

interface VideoHeroProps {
  youtubeId?: string
}

export function VideoHero({ youtubeId = "DqKwuU8v2pU" }: VideoHeroProps) {
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
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              title="Omniweb Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
