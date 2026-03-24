"use client"

import { useState } from "react"
import { Mic, MessageSquare, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<"voice" | "text" | null>(null)
  const [message, setMessage] = useState("")

  const handleClose = () => {
    setIsOpen(false)
    setMode(null)
    setMessage("")
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 px-4 py-3">
            <div className="flex items-center gap-2">
              {mode === "voice" ? (
                <Mic className="h-5 w-5 text-cyan-400" />
              ) : (
                <MessageSquare className="h-5 w-5 text-purple-400" />
              )}
              <span className="font-medium text-foreground">
                {mode === "voice" ? "Voice Assistant" : "Chat with Omniweb"}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          {mode === null ? (
            // Mode Selection
            <div className="p-6">
              <p className="mb-4 text-center text-sm text-muted-foreground">
                How would you like to connect?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode("voice")}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20">
                    <Mic className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Voice Chat</p>
                    <p className="text-xs text-muted-foreground">Talk with our AI assistant</p>
                  </div>
                </button>
                <button
                  onClick={() => setMode("text")}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Text Chat</p>
                    <p className="text-xs text-muted-foreground">Type your questions</p>
                  </div>
                </button>
              </div>
            </div>
          ) : mode === "voice" ? (
            // Voice Mode
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30">
                  <Mic className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="mb-2 font-medium text-foreground">Listening...</p>
              <p className="text-center text-sm text-muted-foreground">
                Speak now or click the mic to start
              </p>
              <button
                onClick={() => setMode("text")}
                className="mt-4 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
              >
                Switch to text chat
              </button>
            </div>
          ) : (
            // Text Mode
            <div className="flex h-80 flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4 flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/5 px-4 py-2">
                    <p className="text-sm text-foreground">
                      Hi! I'm the Omniweb assistant. How can I help you build smarter and convert faster today?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-white/10 p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:outline-none"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-xl bg-purple-500 hover:bg-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  onClick={() => setMode("voice")}
                  className="mt-2 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
                >
                  Switch to voice chat
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-purple-500/30 transition-transform hover:scale-105"
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-white" />
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-purple-600 bg-cyan-400" />
          </div>
        )}
      </button>
    </>
  )
}
