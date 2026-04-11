"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Conversation } from "@elevenlabs/client"
import type { DisconnectionDetails, MessagePayload } from "@elevenlabs/client"

const AGENT_ID = "agent_4601kny4fvsgfjz8mbqhevyp1k9q"
const WELCOME_MESSAGE = "Tell me the problem you’re trying to solve, and I’ll qualify your needs, recommend the right solution, and answer questions so you can move forward faster by text or voice."

type Message = { role: "user" | "agent"; text: string }
type ConvStatus = "disconnected" | "connecting" | "connected"
type ConvMode = "listening" | "speaking"
type ChatMode = "voice" | "text"

export function VoiceOrb() {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<ConvStatus>("disconnected")
  const [mode, setMode] = useState<ConvMode>("listening")
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<ChatMode>("text")

  const convRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatBufferRef = useRef<string>("")
  const pendingTextRef = useRef<string | null>(null)
  const chatModeRef = useRef<ChatMode>("text")
  const hasSpokenWelcomeRef = useRef(false)

  // Keep ref in sync with state so callbacks always see the latest value
  useEffect(() => { chatModeRef.current = chatMode }, [chatMode])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const playWelcome = useCallback(() => {
    if (typeof window === "undefined" || hasSpokenWelcomeRef.current) return
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(WELCOME_MESSAGE)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    synth.speak(utterance)
    hasSpokenWelcomeRef.current = true
  }, [])

  const handleOpen = useCallback(() => {
    setExpanded(true)
    setChatMode("text")
    setError(null)
    if (messages.length === 0) {
      setMessages([{ role: "agent", text: WELCOME_MESSAGE }])
    }
    playWelcome()
  }, [messages.length, playWelcome])

  /* ── shared session options (everything except textOnly) ── */
  const sessionCallbacks = useCallback(() => ({
    agentId: AGENT_ID,
    connectionType: "websocket" as const,
    onConnect: () => {
      setStatus("connected")
      // Send any pending text message once connected
      const pending = pendingTextRef.current
      if (pending) {
        pendingTextRef.current = null
        // Small delay to ensure socket is fully ready
        setTimeout(() => { convRef.current?.sendUserMessage(pending) }, 100)
      }
    },
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
    onAgentChatResponsePart: (part: { text: string; type: "start" | "delta" | "stop"; event_id: number }) => {
      if (part.type === "start") {
        chatBufferRef.current = part.text
        setMessages(prev => [...prev, { role: "agent", text: part.text }])
      } else if (part.type === "delta") {
        chatBufferRef.current += part.text
        const fullText = chatBufferRef.current
        setMessages(prev => {
          const lastIdx = prev.length - 1
          if (lastIdx >= 0 && prev[lastIdx].role === "agent") {
            return [...prev.slice(0, lastIdx), { role: "agent", text: fullText }]
          }
          return [...prev, { role: "agent", text: fullText }]
        })
      } else if (part.type === "stop") {
        if (part.text) chatBufferRef.current += part.text
        const finalText = chatBufferRef.current
        setMessages(prev => {
          const lastIdx = prev.length - 1
          if (lastIdx >= 0 && prev[lastIdx].role === "agent") {
            return [...prev.slice(0, lastIdx), { role: "agent", text: finalText }]
          }
          return prev
        })
        chatBufferRef.current = ""
      }
    },
    onError: (msg: string) => { console.error("[VoiceOrb]", msg); setError(msg) },
    onModeChange: ({ mode: m }: { mode: ConvMode }) => setMode(m),
    onStatusChange: ({ status: s }: { status: string }) => {
      if (s === "connected") setStatus("connected")
      else if (s === "connecting") setStatus("connecting")
      else setStatus("disconnected")
    },
  }), [])

  const startVoiceSession = useCallback(async () => {
    if (convRef.current) return
    setStatus("connecting")
    setError(null)
    try {
      const conv = await Conversation.startSession(sessionCallbacks())
      convRef.current = conv
    } catch (e: any) {
      setError(e?.message ?? "Connection failed")
      setStatus("disconnected")
    }
  }, [sessionCallbacks])

  const startTextSession = useCallback(async () => {
    if (convRef.current) return
    setStatus("connecting")
    setError(null)
    try {
      // textOnly: true → uses TextConversation → NO microphone access needed
      const conv = await Conversation.startSession({
        ...sessionCallbacks(),
        textOnly: true,
      })
      convRef.current = conv
    } catch (e: any) {
      setError(e?.message ?? "Connection failed")
      setStatus("disconnected")
      pendingTextRef.current = null
    }
  }, [sessionCallbacks])

  const endConversation = useCallback(async () => {
    try { await convRef.current?.endSession() } catch {}
    convRef.current = null
    setStatus("disconnected")
    setIsMuted(false)
    pendingTextRef.current = null
  }, [])

  const toggleMute = useCallback(() => {
    if (!convRef.current) return
    const next = !isMuted
    convRef.current.setMicMuted(next)
    setIsMuted(next)
  }, [isMuted])

  const sendText = useCallback(async () => {
    const t = textInput.trim()
    if (!t) return
    setTextInput("")
    setMessages(prev => [...prev, { role: "user" as const, text: t }])

    // Already connected — send immediately
    if (convRef.current) {
      convRef.current.sendUserMessage(t)
      return
    }
    // Not connected yet — queue message and connect (text mode, no mic)
    pendingTextRef.current = t
    await startTextSession()
  }, [textInput, startTextSession])

  const handleClose = useCallback(async () => {
    await endConversation()
    setExpanded(false)
    setMessages([])
    setError(null)
    setChatMode("text")
    chatBufferRef.current = ""
    hasSpokenWelcomeRef.current = false
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel()
    }
  }, [endConversation])

  const selectVoice = useCallback(async () => {
    // If switching from text session, end it first
    if (convRef.current && chatModeRef.current === "text") {
      await endConversation()
    }
    setChatMode("voice")
    if (!convRef.current) startVoiceSession()
  }, [startVoiceSession, endConversation])

  const selectText = useCallback(async () => {
    // If switching from voice session, end it first
    if (convRef.current && chatModeRef.current === "voice") {
      await endConversation()
    }
    setChatMode("text")
    // Don't auto-connect — connect when user sends first message
  }, [endConversation])

  const isActive = status === "connected"
  const isBusy = status === "connecting"

  const CONIC = "conic-gradient(from 0deg, #0a4f8c, #2792DC, #9ce6e6, #ffffff, #2792DC, #0a4f8c, #9ce6e6, #ffffff, #0a4f8c)"
  const CONIC_SM = "conic-gradient(from 0deg, #0a4f8c, #2792DC, #9ce6e6, #fff, #2792DC, #0a4f8c)"

  /* ════════════════════ SHINY METALLIC DISK (collapsed) ════════════════════ */
  if (!expanded) {
    return (
      <>
        <style jsx global>{`
          @keyframes orb-spin   { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          @keyframes orb-pulse  { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.08); opacity: .85 } }
          @keyframes orb-ring   { 0% { box-shadow: 0 0 0 0 rgba(39,146,220,.5) } 100% { box-shadow: 0 0 0 18px rgba(39,146,220,0) } }
          @keyframes orb-glow   { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.2) } }
        `}</style>

        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[10000] group cursor-pointer"
          style={{ outline: "none", border: "none", background: "none", padding: 0 }}
          aria-label="Open voice assistant"
        >
          {isActive && (
            <div className="absolute inset-[-6px] rounded-full" style={{ animation: "orb-ring 2s ease-out infinite" }} />
          )}

          <div
            className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-110"
            style={{
              animation: isActive ? "orb-glow 2s ease-in-out infinite" : isBusy ? "orb-pulse 1.5s ease-in-out infinite" : undefined,
            }}
          >
            <div className="absolute inset-0 rounded-full" style={{ background: CONIC, animation: isActive ? "orb-spin 6s linear infinite" : "orb-spin 20s linear infinite" }} />
            <div className="absolute inset-[3px] rounded-full" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%), radial-gradient(ellipse at 65% 70%, rgba(39,146,220,0.3) 0%, transparent 60%)" }} />
            <div className="absolute inset-[2px] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)" }} />
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.15)" }} />
          </div>

          {isActive && <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm" />}
          {isBusy && <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-sm animate-pulse" />}
        </button>
      </>
    )
  }

  /* ════════════════════ EXPANDED CHAT PANEL ════════════════════ */
  return (
    <>
      <style jsx global>{`
        @keyframes orb-spin  { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes orb-ring  { 0% { box-shadow: 0 0 0 0 rgba(39,146,220,.5) } 100% { box-shadow: 0 0 0 14px rgba(39,146,220,0) } }
        @keyframes orb-glow  { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.15) } }
        @keyframes panel-in  { from { opacity:0; transform: translateY(16px) scale(0.95) } to { opacity:1; transform: translateY(0) scale(1) } }
      `}</style>

      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/30 sm:hidden" onClick={handleClose} />

      <div
        className="fixed z-[9999] flex flex-col overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-200/60 inset-2 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[560px]"
        style={{ animation: "panel-in .25s ease-out" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ background: CONIC, animation: isActive ? "orb-spin 6s linear infinite" : "orb-spin 20s linear infinite" }} />
              <div className="absolute inset-[2px] rounded-full" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)" }} />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.1)" }} />
              {isActive && <div className="absolute -top-px -right-px w-2.5 h-2.5 bg-green-400 rounded-full border-[1.5px] border-white" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Omniweb AI</div>
              <div className="text-xs text-gray-400">
                {isActive
                  ? chatMode === "voice"
                    ? mode === "speaking" ? "Speaking…" : "Listening…"
                    : "Text chat"
                  : isBusy ? "Connecting…" : "Choose how to chat"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {isActive && chatMode === "voice" && (
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full transition-colors ${isMuted ? "bg-red-50 text-red-500" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  {isMuted && <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />}
                </svg>
              </button>
            )}
            <button onClick={handleClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Close">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
          {error && <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2 border border-red-100">{error}</div>}

          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-8">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-5 shadow-xl" style={{ animation: isActive ? "orb-glow 2s ease-in-out infinite" : undefined }}>
                <div className="absolute inset-0 rounded-full" style={{ background: CONIC, animation: isActive ? "orb-spin 6s linear infinite" : "orb-spin 20s linear infinite" }} />
                <div className="absolute inset-[3px] rounded-full" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)" }} />
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 3px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.12)" }} />
              </div>
              <p className="text-[15px] font-semibold text-gray-800">How can I help you?</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-[220px]">Choose voice or text below to get started</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "agent" && (
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
                  <div className="w-full h-full" style={{ background: CONIC_SM }} />
                </div>
              )}
              <div className={[
                "max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-gray-900 text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100",
              ].join(" ")}>
                {m.text}
              </div>
            </div>
          ))}

          {isActive && mode === "speaking" && chatMode === "voice" && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
                <div className="w-full h-full" style={{ background: CONIC_SM, animation: "orb-spin 4s linear infinite" }} />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom controls ── */}
        <div className="border-t border-gray-100 bg-white">
          {/* Mode selector / call controls */}
          <div className="flex items-center justify-center py-3 border-b border-gray-50 gap-2 px-4">
            {!isActive && !isBusy ? (
              <>
                  <button
                    onClick={selectText}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-full px-4 py-2.5 transition-colors ${
                      chatMode === "text"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    Text chat
                  </button>
                <button
                  onClick={selectVoice}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-full px-4 py-2.5 transition-colors ${
                    chatMode === "voice"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  Voice call
                </button>
              </>
            ) : isBusy ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2.5">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" /> Connecting…
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                {chatMode === "voice" && (
                  <button onClick={endConversation} className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-red-600 transition-colors">End call</button>
                )}
                {chatMode === "text" && (
                  <button
                    onClick={async () => { await endConversation(); setChatMode("voice") }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Switch to voice
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text input */}
          <div className="flex items-center gap-2 p-3">
            <input
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); convRef.current?.sendUserActivity?.() }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText() } }}
              placeholder={chatMode === "text" ? "Type a message…" : isActive ? "Type a message…" : "Select text chat to type"}
              disabled={chatMode === "voice" && !isActive}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-40 transition-all"
            />
            <button
              onClick={sendText}
              disabled={(chatMode === "voice" && !isActive) || !textInput.trim()}
              className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-25 transition-all flex-shrink-0"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
