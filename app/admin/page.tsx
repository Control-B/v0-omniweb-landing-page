"use client"

import { useState } from "react"
import { VideoUploader } from "@/components/video-uploader"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [videoPathname, setVideoPathname] = useState<string>("")
  const [copied, setCopied] = useState(false)

  // For private blobs, serve via API route
  const videoUrl = videoPathname 
    ? `/api/file?pathname=${encodeURIComponent(videoPathname)}` 
    : ""

  const handleCopy = async () => {
    if (videoUrl) {
      await navigator.clipboard.writeText(videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border px-6 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </Link>
        <h2 className="text-lg font-semibold text-foreground">Video Upload</h2>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Upload Hero Video</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a video to display on your landing page hero section.
            </p>
          </div>

          <div className="flex justify-center">
            <VideoUploader
              onUploadComplete={setVideoPathname}
              currentVideoUrl={videoUrl}
            />
          </div>

          {videoUrl && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Video URL
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded bg-secondary px-2 py-1 text-xs text-foreground">
                    {videoUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Preview
                </p>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
              </div>

              <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Usage
                </p>
                <p className="text-xs text-muted-foreground">
                  Copy the URL above and update your <code className="rounded bg-secondary px-1">VideoHero</code> component:
                </p>
                <pre className="mt-2 overflow-x-auto rounded bg-secondary p-2 text-xs text-foreground">
{`<VideoHero videoUrl="${videoUrl}" />`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
