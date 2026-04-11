"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Conversation } from "@elevenlabs/client"
import type { DisconnectionDetails, MessagePayload } from "@elevenlabs/client"

const AGENT_ID = "agent_4601kny4fvsgfjz8mbqhevyp1k9q"

type Message = { role: "user" | "agent"; text: string }
type ConvStatus = "disconnected" | "connecting" | "connected"
type ConvMode = "listening" | "speaking"

export function VoiceOrb() {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<ConvStatus>("disconnected")
  const [mode, setMode] = useState<ConvMode>("listening")
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const convRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  /* ── SDK helpers ── */
  const startConversation = useCallback(async () => {
    if (convRef.current) return
    setStatus("connecting")
    setError(null)

    try {
      const conv = await Conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "websocket",
        onConnect: () => setStatus("connected"),
        onDisconnect: (_d: DisconnectionDetails) => {
          setStatus("disconnected")
          convRef.current = null
          setIsMuted(false)
        },
        onMessage: (p: MessagePayload) => {
          const role = p.role === "agent" ? ("agent" as const) : ("user" as const)
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last?.role === role) return [...prev.slice(0, -1), { role, text: p.message }]
            return [...prev, { role, text: p.message }]
          })
        },
        onError: (msg: string) => {
          console.error("[VoiceOrb]", msg)
          setError(msg)
        },
        onModeChange: ({ mode: m }) => setMode(m),
        onStatusChange: ({ status: s }) => {
          if (s === "connected") setStatus("connected")
          else if (s === "connecting") setStatus("connecting")
          else setStatus("disconnected")
        },
      })
      convRef.current = conv
    } catch (e: any) {
      setError(e?.message ?? "Connection failed")
      setStatus("disconnected")
    }
  }, [])

  const endConversation = useCallback(async () => {
    try { await convRef.current?.endSession() } catch {}
    convRef.current = null
    setStatus("disconnected")
    setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    if (!convRef.current) return
    const next = !isMuted
    convRef.current.setMicMuted(next)
    setIsMuted(next)
  }, [isMuted])

  const sendText = useCallback(() => {
    const t = textInput.trim()
    if (!t || !convRef.current) return
    convRef.current.sendUserMessage(t)
    setMessages(prev => [...prev, { role: "user" as const, text: t }])
    setTextInput("")
  }, [textInput])

  const handleClose = useCallback(async () => {
    await endConversation()
    setExpanded(false)
    setMessages([])
    setError(null)
  }, [endConversation])

  const isActive = status === "connected"
  const isBusy = status === "connecting"

  /* ─────────────────── COLLAPSED: pill widget ─────────────────── */
  if (!expanded) {
    return (
      <>
        <style jsx global>{`
          @keyframes vo-orb { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
          @keyframes vo-ring { 0%{box-shadow:0 0 0 0 rgba(39,146,220,.45)} 100%{box-shadow:0 0 0 14px rgba(39,146,220,0)} }
        `}</style>
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[10000] flex items-center">
          {/* Pill container */}
          <div className="flex items-center bg-white rounded-full shadow-xl border border-gray-200/80 p-1.5 gap-1">
            {/* Orb avatar */}
            <button
              onClick={() => { setExpanded(true) }}
              className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
            >
              {isActive && (
                <div className="absolute inset-0 rounded-full" style={{ animation: "vo-ring 1.5s ease-out infinite" }} />
              )}
              {/* Orb shine effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-white/20 rounded-full blur-sm" />
              </div>
              {isActive ? (
                <div className="flex items-end gap-[2px] h-4 z-10">
                  {[6, 10, 7, 12, 5].map((h, i) => (
                    <span key={i} className="w-[2.5px] bg-white rounded-full animate-bounce" style={{ height: h, animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              ) : (
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24" className="z-10">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
            </button>

            {/* Start / End call button */}
            {isActive ? (
              <button
                onClick={endConversation}
                className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium rounded-full px-4 py-2.5 hover:bg-gray-800 transition-colors"
              >
                End
              </button>
            ) : isBusy ? (
              <div className="flex items-center gap-2 px-4 py-2.5 text-gray-400 text-sm">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : (
              <button
                onClick={startConversation}
                className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium rounded-full px-4 py-2.5 hover:bg-gray-800 transition-colors"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
                Start a call
              </button>
            )}

            {/* Expand arrow */}
            <button
              onClick={() => setExpanded(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Expand"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7" />
              </svg>
            </button>
          </div>
        </div>
      </>
    )
  }

  /* ─────────────────── EXPANDED: full chat panel ─────────────────── */
  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/30 sm:hidden" onClick={handleClose} />

      <div
        className={[
          "fixed z-[9999] flex flex-col overflow-hidden",
          "bg-white rounded-2xl shadow-2xl border border-gray-200",
          "bottom-2 right-2 left-2 top-16",
          "sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[380px] sm:h-[540px]",
        ].join(" ")}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] flex items-center justify-center flex-shrink-0">
              {isActive && mode === "speaking" && (
                <div className="absolute inset-0 rounded-full" style={{ animation: "vo-ring 1.5s ease-out infinite" }} />
              )}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-white/20 rounded-full blur-sm" />
              </div>
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24" className="z-10">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Omniweb AI</div>
              <div className="text-xs text-gray-400">
                {isActive ? (mode === "speaking" ? "Speaking…" : "Listening…") : isBusy ? "Connecting…" : "Ready to chat"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {/* Mute */}
            {isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute() }}
                className={`p-2 rounded-full transition-colors ${isMuted ? "bg-red-50 text-red-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                title={isMuted ? "Unmute mic" : "Mute mic"}
              >
                {isMuted ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            )}
            {/* Collapse */}
            <button
              onClick={() => setExpanded(false)}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Collapse"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 15v4.5m0-4.5h4.5m-4.5 0l5.25 5.25" />
              </svg>
            </button>
            {/* Close & end */}
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="End & close"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2 border border-red-100">
              {error}
            </div>
          )}
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] flex items-center justify-center mb-4 shadow-lg shadow-blue-200/50">
                <div className="absolute w-16 h-16 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-white/20 rounded-full blur-sm" />
                </div>
                <svg width="28" height="28" fill="white" viewBox="0 0 24 24" className="z-10">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-gray-800">How can I help you?</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">Start a voice call or type a message below</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-1`}>
              {m.role === "agent" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              )}
              <div
                className={[
                  "max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-gray-900 text-white rounded-2xl rounded-br-sm"
                    : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100",
                ].join(" ")}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isActive && mode === "speaking" && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2792dc] to-[#9ce6e6] flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-100 bg-white">
          {/* Call controls */}
          <div className="flex items-center justify-center py-3 gap-2 border-b border-gray-50">
            {status === "disconnected" ? (
              <button
                onClick={startConversation}
                className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-gray-800 transition-colors shadow-sm"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
                Start a call
              </button>
            ) : isBusy ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2.5">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                Connecting…
              </div>
            ) : (
              <button
                onClick={endConversation}
                className="flex items-center gap-2 bg-red-500 text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-red-600 transition-colors"
              >
                End
              </button>
            )}
          </div>

          {/* Text input — always visible */}
          <div className="flex items-center gap-2 p-3">
            <input
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value)
                convRef.current?.sendUserActivity()
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText() } }}
              placeholder={isActive ? "Type a message…" : "Start a call to chat"}
              disabled={!isActive}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-40 transition-all"
            />
            <button
              onClick={sendText}
              disabled={!isActive || !textInput.trim()}
              className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-25 transition-all flex-shrink-0"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating keyframes */}
      <style jsx global>{`
        @keyframes vo-ring { 0%{box-shadow:0 0 0 0 rgba(39,146,220,.45)} 100%{box-shadow:0 0 0 14px rgba(39,146,220,0)} }
      `}</style>
    </>
  )
}
