"use client"

import { Upload, X, CheckCircle, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface VideoUploaderProps {
  onUploadComplete: (pathname: string) => void
  currentVideoUrl?: string
}

export function VideoUploader({ onUploadComplete, currentVideoUrl }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()
      setUploadProgress(100)
      onUploadComplete(data.pathname)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full max-w-md">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-foreground/50 bg-secondary/50"
            : "border-border hover:border-foreground/30 hover:bg-secondary/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <div className="w-full">
              <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : currentVideoUrl ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-sm text-muted-foreground">Video uploaded successfully</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace Video
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drag and drop your video here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                MP4, WebM, OGG, or MOV
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
