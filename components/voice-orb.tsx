"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Conversation } from "@elevenlabs/client"
import type { DisconnectionDetails, MessagePayload } from "@elevenlabs/client"

const AGENT_ID = "agent_4601kny4fvsgfjz8mbqhevyp1k9q"

type Message = {
  role: "user" | "agent"
  text: string
}

type ConvStatus = "disconnected" | "connecting" | "connected"
type ConvMode = "listening" | "speaking"
type ChatTab = "voice" | "text"

export function VoiceOrb() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<ConvStatus>("disconnected")
  const [mode, setMode] = useState<ConvMode>("listening")
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [chatTab, setChatTab] = useState<ChatTab>("voice")
  const [error, setError] = useState<string | null>(null)

  const conversationRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // ── Start session ──
  const startConversation = useCallback(async () => {
    if (conversationRef.current) return
    setStatus("connecting")
    setError(null)
    setMessages([])

    try {
      const conv = await Conversation.startSession({
        agentId: AGENT_ID,
        onConnect: ({ conversationId }) => {
          console.log("[VoiceOrb] Connected:", conversationId)
          setStatus("connected")
        },
        onDisconnect: (details: DisconnectionDetails) => {
          console.log("[VoiceOrb] Disconnected:", details.reason)
          setStatus("disconnected")
          conversationRef.current = null
        },
        onMessage: (payload: MessagePayload) => {
          const role = payload.role === "agent" ? "agent" : "user"
          setMessages((prev) => {
            // Update last message from same role if it exists and is the last one
            const last = prev[prev.length - 1]
            if (last && last.role === role) {
              return [...prev.slice(0, -1), { role, text: payload.message }]
            }
            return [...prev, { role, text: payload.message }]
          })
        },
        onError: (message: string, context?: any) => {
          console.error("[VoiceOrb] Error:", message, context)
          setError(message)
        },
        onModeChange: ({ mode: m }) => {
          setMode(m)
        },
        onStatusChange: ({ status: s }) => {
          if (s === "connected") setStatus("connected")
          else if (s === "connecting") setStatus("connecting")
          else setStatus("disconnected")
        },
      })

      conversationRef.current = conv
    } catch (err: any) {
      console.error("[VoiceOrb] Failed to start:", err)
      setError(err?.message ?? "Failed to connect. Check microphone permissions.")
      setStatus("disconnected")
    }
  }, [])

  // ── End session ──
  const endConversation = useCallback(async () => {
    try {
      await conversationRef.current?.endSession()
    } catch {}
    conversationRef.current = null
    setStatus("disconnected")
  }, [])

  // ── Mute ──
  const toggleMute = useCallback(() => {
    if (!conversationRef.current) return
    const next = !isMuted
    conversationRef.current.setMicMuted(next)
    setIsMuted(next)
  }, [isMuted])

  // ── Send text ──
  const sendText = useCallback(() => {
    const msg = textInput.trim()
    if (!msg || !conversationRef.current) return
    conversationRef.current.sendUserMessage(msg)
    setMessages((prev) => [...prev, { role: "user" as const, text: msg }])
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

  // ── Orb click ──
  const handleOrbClick = useCallback(() => {
    if (open) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [open])

  // ── Close panel & end ──
  const handleClose = useCallback(async () => {
    await endConversation()
    setOpen(false)
    setMessages([])
    setError(null)
    setChatTab("voice")
    setIsMuted(false)
  }, [endConversation])

  const isActive = status === "connected"
  const isBusy = status === "connecting"

  return (
    <>
      {/* ── Keyframes ── */}
      <style jsx global>{`
        @keyframes vo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(39,146,220,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(39,146,220,0); }
        }
        @keyframes vo-glow {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(99,102,241,0.5); }
          50% { box-shadow: 0 0 20px 6px rgba(99,102,241,0.3); }
        }
        @keyframes vo-spin {
          to { transform: rotate(360deg); }
        }
        .vo-idle:hover { box-shadow: 0 0 16px 4px rgba(39,146,220,0.3); }
        .vo-pulse { animation: vo-pulse 2s ease-in-out infinite; }
        .vo-glow  { animation: vo-glow 1s ease-in-out infinite; }
        .vo-spin  { animation: vo-spin 1.2s linear infinite; }
      `}</style>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] bg-black/40 sm:hidden"
          onClick={handleClose}
        />
      )}

      {/* ── Chat Panel ── */}
      {open && (
        <div
          className={[
            "fixed z-[9999] flex flex-col overflow-hidden",
            "bg-white rounded-2xl shadow-2xl border border-gray-200",
            // Mobile: full width
            "bottom-20 right-3 left-3",
            // Desktop: fixed size
            "sm:bottom-24 sm:right-6 sm:left-auto sm:w-[370px] sm:max-h-[540px]",
          ].join(" ")}
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {/* ─ Header ─ */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* Mini orb */}
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] flex items-center justify-center">
                {isActive && mode === "speaking" && (
                  <div className="absolute inset-0 rounded-full vo-glow" />
                )}
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Omniweb AI</span>
                <span className="text-xs text-gray-400">
                  {isActive
                    ? mode === "speaking" ? "Speaking…" : "Listening…"
                    : isBusy ? "Connecting…" : "Ready"}
                </span>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1">
              {/* Mute (only when active in voice tab) */}
              {chatTab === "voice" && isActive && (
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-full transition-colors ${isMuted ? "bg-red-50 text-red-500" : "hover:bg-gray-100 text-gray-500"}`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L14 9.76V6.41c0-.89-1.08-1.34-1.71-.71zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></svg>
                  ) : (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-3.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  )}
                </button>
              )}
              {/* Close */}
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                title="Close"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ─ Tab switcher ─ */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setChatTab("voice")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${chatTab === "voice" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              🎙️ Voice
            </button>
            <button
              onClick={() => setChatTab("text")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${chatTab === "text" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              💬 Text
            </button>
          </div>

          {/* ─ Messages ─ */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px] bg-gray-50">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2">
                {error}
              </div>
            )}
            {messages.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] flex items-center justify-center mb-3">
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">How can I help you?</p>
                <p className="text-xs text-gray-400 mt-1">
                  {chatTab === "voice" ? "Click the button below to start talking" : "Type your message below"}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={[
                    "max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-2xl rounded-br-md"
                      : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isActive && mode === "speaking" && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─ Bottom action area ─ */}
          <div className="border-t border-gray-100 bg-white">
            {chatTab === "voice" ? (
              <div className="flex items-center justify-center py-4 gap-3">
                {status === "disconnected" ? (
                  <button
                    onClick={startConversation}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                    Start a call
                  </button>
                ) : isBusy ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full vo-spin" />
                    Connecting…
                  </div>
                ) : (
                  <button
                    onClick={endConversation}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-all shadow-md"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 010-1.36C3.57 8.55 7.58 7 12 7s8.43 1.55 11.71 4.72c.18.18.29.44.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 00-2.67-1.85.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                    </svg>
                    End call
                  </button>
                )}
              </div>
            ) : (
              /* Text tab */
              <div className="flex items-center gap-2 p-3">
                {status === "disconnected" ? (
                  <button
                    onClick={startConversation}
                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium transition-all"
                  >
                    Start chat
                  </button>
                ) : (
                  <>
                    <input
                      value={textInput}
                      onChange={(e) => {
                        setTextInput(e.target.value)
                        conversationRef.current?.sendUserActivity()
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      disabled={!isActive}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 disabled:opacity-40"
                    />
                    <button
                      onClick={sendText}
                      disabled={!isActive || !textInput.trim()}
                      className="p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 transition-colors"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ─ Powered by ─ */}
          <div className="text-center py-1.5 bg-gray-50 border-t border-gray-100">
            <span className="text-[10px] text-gray-300">Powered by Omniweb AI</span>
          </div>
        </div>
      )}

      {/* ── Floating Orb ── */}
      <button
        onClick={handleOrbClick}
        className={[
          "fixed z-[10000] rounded-full transition-all duration-300 cursor-pointer",
          "w-12 h-12 sm:w-14 sm:h-14",
          "bottom-5 right-4 sm:bottom-6 sm:right-6",
          "bg-gradient-to-br from-[#2792dc] to-[#9ce6e6]",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          isActive ? "vo-glow" : isBusy ? "vo-spin" : "vo-idle",
          isActive ? "ring-2 ring-indigo-400/40 ring-offset-2 ring-offset-white" : "",
        ].join(" ")}
        title="Talk to Omniweb AI"
        aria-label="Open voice assistant"
      >
        {open ? (
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
          </svg>
        ) : isActive ? (
          /* Animated sound waves when active */
          <div className="flex items-end gap-[3px] h-5">
            <span className="w-[3px] bg-white rounded-full animate-bounce" style={{ height: "8px", animationDelay: "0ms" }} />
            <span className="w-[3px] bg-white rounded-full animate-bounce" style={{ height: "14px", animationDelay: "150ms" }} />
            <span className="w-[3px] bg-white rounded-full animate-bounce" style={{ height: "10px", animationDelay: "300ms" }} />
            <span className="w-[3px] bg-white rounded-full animate-bounce" style={{ height: "16px", animationDelay: "100ms" }} />
            <span className="w-[3px] bg-white rounded-full animate-bounce" style={{ height: "8px", animationDelay: "250ms" }} />
          </div>
        ) : (
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        )}
      </button>
    </>
  )
}
