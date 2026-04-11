"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Conversation } from "@elevenlabs/client"

const AGENT_ID = "agent_4601kny4fvsgfjz8mbqhevyp1k9q"

type Message = {
  role: "user" | "agent"
  text: string
  final: boolean
}

type Status = "idle" | "connecting" | "connected"
type Mode = "listening" | "speaking"

export function VoiceOrb() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [mode, setMode] = useState<Mode>("listening")
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [chatMode, setChatMode] = useState<"voice" | "text">("voice")

  const conversationRef = useRef<Awaited<
    ReturnType<typeof Conversation.startSession>
  > | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const startConversation = useCallback(async () => {
    if (conversationRef.current) return
    setStatus("connecting")
    setMessages([])

    try {
      const conversation = await Conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
        onConnect: () => {
          setStatus("connected")
        },
        onDisconnect: () => {
          setStatus("idle")
          conversationRef.current = null
        },
        onMessage: (msg) => {
          // msg has: source ("user"|"ai"), message, type ("transcript"|…)
          const role = msg.source === "ai" ? "agent" : "user"
          const isFinal = msg.type !== "transcript" // transcripts are interim

          setMessages((prev) => {
            // For interim transcripts, update last message from same role
            if (!isFinal) {
              const lastIdx = prev.length - 1
              if (lastIdx >= 0 && prev[lastIdx].role === role && !prev[lastIdx].final) {
                const updated = [...prev]
                updated[lastIdx] = { role, text: msg.message, final: false }
                return updated
              }
            }
            // If the previous message from same role was interim, finalize it
            const lastIdx = prev.length - 1
            if (lastIdx >= 0 && prev[lastIdx].role === role && !prev[lastIdx].final) {
              const updated = [...prev]
              updated[lastIdx] = { role, text: msg.message, final: true }
              return updated
            }
            return [...prev, { role, text: msg.message, final: isFinal }]
          })
        },
        onError: (error) => {
          console.error("[VoiceOrb] Error:", error)
        },
        onModeChange: (m) => {
          setMode(m.mode === "speaking" ? "speaking" : "listening")
        },
      })

      conversationRef.current = conversation
    } catch (err) {
      console.error("[VoiceOrb] Failed to start:", err)
      setStatus("idle")
    }
  }, [])

  const endConversation = useCallback(async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession()
      conversationRef.current = null
    }
    setStatus("idle")
  }, [])

  const toggleMute = useCallback(() => {
    if (conversationRef.current) {
      const next = !isMuted
      conversationRef.current.setMicMuted(next)
      setIsMuted(next)
    }
  }, [isMuted])

  const sendText = useCallback(() => {
    const msg = textInput.trim()
    if (!msg || !conversationRef.current) return
    conversationRef.current.sendUserMessage(msg)
    setMessages((prev) => [...prev, { role: "user", text: msg, final: true }])
    setTextInput("")
  }, [textInput])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendText()
      }
    },
    [sendText]
  )

  // Notify agent when user is typing
  const handleTyping = useCallback(() => {
    conversationRef.current?.sendUserActivity()
  }, [])

  const handleToggle = useCallback(async () => {
    if (!open) {
      setOpen(true)
      // Start in voice mode by default
      if (status === "idle") {
        await startConversation()
      }
    } else {
      setOpen(false)
    }
  }, [open, status, startConversation])

  const handleClose = useCallback(async () => {
    await endConversation()
    setOpen(false)
    setMessages([])
    setChatMode("voice")
  }, [endConversation])

  // Orb animation classes
  const orbPulse =
    status === "connected" && mode === "speaking"
      ? "animate-pulse-fast"
      : status === "connected"
        ? "animate-pulse-slow"
        : status === "connecting"
          ? "animate-spin-slow"
          : ""

  return (
    <>
      {/* ---- Global keyframes ---- */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99,102,241,.6); }
          50% { transform: scale(1.12); box-shadow: 0 0 20px 6px rgba(99,102,241,.35); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulse-fast 1s ease-in-out infinite; }
        .animate-spin-slow  { animation: spin-slow 1.5s linear infinite; }
      `}</style>

      {/* ---- Backdrop when panel open on mobile ---- */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm sm:hidden"
          onClick={handleClose}
        />
      )}

      {/* ---- Expanded Chat Panel ---- */}
      {open && (
        <div
          className={[
            "fixed z-[9999] bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl",
            "flex flex-col overflow-hidden",
            // Mobile: nearly full screen. Desktop: fixed panel.
            "bottom-2 right-2 left-2 top-16",
            "sm:bottom-24 sm:right-5 sm:left-auto sm:top-auto sm:w-[380px] sm:h-[520px]",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0c14]">
            <div className="flex items-center gap-2">
              {/* Mini orb in header */}
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] ${orbPulse}`}
              />
              <div>
                <span className="text-white text-sm font-medium">Omniweb AI</span>
                <span className="ml-2 text-xs text-white/50">
                  {status === "connected"
                    ? mode === "speaking"
                      ? "Speaking…"
                      : "Listening…"
                    : status === "connecting"
                      ? "Connecting…"
                      : "Offline"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice / Text toggle */}
              <button
                onClick={() => setChatMode(chatMode === "voice" ? "text" : "voice")}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title={chatMode === "voice" ? "Switch to text" : "Switch to voice"}
              >
                {chatMode === "voice" ? (
                  // Keyboard icon
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                ) : (
                  // Mic icon
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              {/* Mute toggle (voice mode) */}
              {chatMode === "voice" && status === "connected" && (
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isMuted ? "text-red-400" : "text-white/60 hover:text-white"}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>
              )}
              {/* Close / end call */}
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="End & close"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && status === "connected" && (
              <div className="text-center text-white/40 text-sm mt-8">
                {chatMode === "voice"
                  ? "Start speaking — I'm listening!"
                  : "Type a message below…"}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={[
                    "max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-white/10 text-white/90 rounded-bl-md",
                    !m.final ? "opacity-60" : "",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 bg-[#0a0c14]">
            {/* Voice mode: big center button */}
            {chatMode === "voice" && (
              <div className="flex items-center justify-center py-4">
                {status === "idle" ? (
                  <button
                    onClick={startConversation}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-medium transition-colors"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Start a call
                  </button>
                ) : status === "connecting" ? (
                  <div className="text-white/50 text-sm">Connecting…</div>
                ) : (
                  <button
                    onClick={endConversation}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm font-medium transition-colors"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" />
                    </svg>
                    End call
                  </button>
                )}
              </div>
            )}

            {/* Text mode: input */}
            {chatMode === "text" && (
              <div className="flex items-center gap-2 p-3">
                <input
                  ref={inputRef}
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value)
                    handleTyping()
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={status === "connected" ? "Type a message…" : "Press Start to begin"}
                  disabled={status !== "connected"}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                />
                <button
                  onClick={sendText}
                  disabled={status !== "connected" || !textInput.trim()}
                  className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-colors"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Floating Orb Button ---- */}
      <button
        onClick={handleToggle}
        className={[
          "fixed z-[10000] rounded-full shadow-lg transition-all duration-300",
          // Size: small on mobile, slightly bigger on desktop
          "w-12 h-12 sm:w-14 sm:h-14",
          // Position
          "bottom-5 right-5 sm:bottom-6 sm:right-6",
          // Colors & gradient
          "bg-gradient-to-br from-[#2792dc] to-[#9ce6e6]",
          // Hover
          "hover:scale-110 hover:shadow-indigo-500/30 hover:shadow-xl",
          // Active ring
          status === "connected" ? "ring-2 ring-indigo-400/50 ring-offset-2 ring-offset-[#0f1117]" : "",
          // Pulse animation
          orbPulse,
        ].join(" ")}
        title="Talk to Omniweb AI"
        aria-label="Open voice assistant"
      >
        {/* Inner icon: mic when idle/connected, X when open */}
        <div className="flex items-center justify-center w-full h-full">
          {open ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
      </button>
    </>
  )
}
