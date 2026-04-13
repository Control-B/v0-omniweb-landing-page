"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Conversation } from "@elevenlabs/client"
import type { DisconnectionDetails } from "@elevenlabs/client"
import { Suspense } from "react"

type Message = { role: "user" | "agent"; text: string }
type ConvStatus = "disconnected" | "connecting" | "connected"
type ConvMode = "listening" | "speaking"
type ChatMode = "voice" | "text"

function EmbeddableWidget() {
  const params = useParams()
  const searchParams = useSearchParams()
  const agentId = params.agentId as string
  const accentColor = searchParams.get("color") || "#6366f1"

  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<ConvStatus>("disconnected")
  const [mode, setMode] = useState<ConvMode>("listening")
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<ChatMode>("voice")

  const convRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatBufferRef = useRef<string>("")
  const pendingTextRef = useRef<string | null>(null)
  const chatModeRef = useRef<ChatMode>("voice")
  const expandedRef = useRef(false)

  useEffect(() => { chatModeRef.current = chatMode }, [chatMode])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // Notify parent iframe about state changes
  const postToParent = useCallback((type: string) => {
    try { window.parent.postMessage({ type }, "*") } catch {}
  }, [])

  useEffect(() => {
    postToParent("omniweb:widget-ready")
  }, [postToParent])

  useEffect(() => {
    postToParent(expanded ? "omniweb:widget-expanded" : "omniweb:widget-collapsed")
  }, [expanded, postToParent])

  const sessionCallbacks = useCallback(() => ({
    agentId,
    connectionType: "websocket" as const,
    onConnect: () => {
      setStatus("connected")
      const pending = pendingTextRef.current
      if (pending) {
        pendingTextRef.current = null
        setTimeout(() => { convRef.current?.sendUserMessage(pending) }, 100)
      }
    },
    onDisconnect: (_d: DisconnectionDetails) => {
      setStatus("disconnected")
      convRef.current = null
      setIsMuted(false)
    },
    onMessage: (p: any) => {
      // Only handle user transcripts — agent responses handled by onAgentChatResponsePart
      if (p.role !== "agent") {
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.role === "user") return [...prev.slice(0, -1), { role: "user", text: p.message }]
          return [...prev, { role: "user" as const, text: p.message }]
        })
      }
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
    onError: (msg: string) => { console.error("[Widget]", msg); setError(msg) },
    onModeChange: ({ mode: m }: { mode: ConvMode }) => setMode(m),
    onStatusChange: ({ status: s }: { status: string }) => {
      if (s === "connected") setStatus("connected")
      else if (s === "connecting") setStatus("connecting")
      else setStatus("disconnected")
    },
  }), [agentId])

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
      const conv = await Conversation.startSession({ ...sessionCallbacks(), textOnly: true })
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
    if (convRef.current) {
      convRef.current.sendUserMessage(t)
      return
    }
    pendingTextRef.current = t
    await startTextSession()
  }, [textInput, startTextSession])

  const handleOpen = useCallback((openMode: ChatMode = "voice") => {
    setExpanded(true)
    setChatMode(openMode)
    setError(null)
  }, [])

  const handleClose = useCallback(async () => {
    await endConversation()
    setExpanded(false)
    setMessages([])
    setError(null)
    setChatMode("voice")
    chatBufferRef.current = ""
  }, [endConversation])

  // Auto-start voice when opened in voice mode
  useEffect(() => {
    const justOpened = expanded && !expandedRef.current
    expandedRef.current = expanded
    if (justOpened && chatMode === "voice" && !convRef.current) {
      void startVoiceSession()
    }
  }, [expanded, chatMode, startVoiceSession])

  const selectVoice = useCallback(async () => {
    if (convRef.current && chatModeRef.current === "text") await endConversation()
    setChatMode("voice")
    if (!convRef.current) startVoiceSession()
  }, [startVoiceSession, endConversation])

  const selectText = useCallback(async () => {
    if (convRef.current && chatModeRef.current === "voice") await endConversation()
    setChatMode("text")
  }, [endConversation])

  const isActive = status === "connected"
  const isBusy = status === "connecting"
  const CONIC = `conic-gradient(from 0deg, ${accentColor}, #2792DC, #9ce6e6, #ffffff, #2792DC, ${accentColor}, #9ce6e6, #ffffff, ${accentColor})`
  const CONIC_SM = `conic-gradient(from 0deg, ${accentColor}, #2792DC, #9ce6e6, #fff, #2792DC, ${accentColor})`

  if (!expanded) {
    return (
      <div style={{ position: "fixed", bottom: 16, right: 16 }}>
        <style>{`
          @keyframes w-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          @keyframes w-ring { 0% { box-shadow: 0 0 0 0 rgba(39,146,220,.5) } 100% { box-shadow: 0 0 0 18px rgba(39,146,220,0) } }
          @keyframes w-glow { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.2) } }
        `}</style>
        <button onClick={() => handleOpen("voice")} style={{ outline: "none", border: "none", background: "none", padding: 0, cursor: "pointer" }}>
          {isActive && <div style={{ position: "absolute", inset: -6, borderRadius: "50%", animation: "w-ring 2s ease-out infinite" }} />}
          <div style={{
            position: "relative", width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            animation: isActive ? "w-glow 2s ease-in-out infinite" : undefined,
          }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: CONIC, animation: isActive ? "w-spin 6s linear infinite" : "w-spin 20s linear infinite" }} />
            <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.15)" }} />
          </div>
          {isActive && <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, background: "#4ade80", borderRadius: "50%", border: "2px solid white" }} />}
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes w-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes w-ring { 0% { box-shadow: 0 0 0 0 rgba(39,146,220,.5) } 100% { box-shadow: 0 0 0 14px rgba(39,146,220,0) } }
        @keyframes w-panel { from { opacity:0; transform: translateY(16px) scale(0.95) } to { opacity:1; transform: translateY(0) scale(1) } }
      `}</style>
      <div style={{
        position: "fixed", bottom: 16, right: 16, width: 380, maxWidth: "calc(100vw - 32px)",
        height: 540, maxHeight: "calc(100dvh - 32px)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        background: "#0f172a", borderRadius: 16, boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.1)", animation: "w-panel .25s ease-out",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(to right, #0f172a, #1e293b, #0f172a)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: CONIC, animation: isActive ? "w-spin 6s linear infinite" : "w-spin 20s linear infinite" }} />
              <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)" }} />
              {isActive && <div style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, background: "#4ade80", borderRadius: "50%", border: "1.5px solid white" }} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>AI Assistant</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {isActive ? (chatMode === "voice" ? (mode === "speaking" ? "Speaking…" : "Listening…") : "Text mode") : isBusy ? "Connecting…" : "Ready"}
              </div>
            </div>
          </div>
          <button onClick={handleClose} style={{ padding: 8, borderRadius: "50%", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "linear-gradient(to bottom, #0f172a, #020617, #0f172a)" }}>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 12, borderRadius: 12, padding: "8px 12px", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}
          {messages.length === 0 && !error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", paddingBottom: 32 }}>
              <div style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", overflow: "hidden", marginBottom: 20, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: CONIC, animation: "w-spin 20s linear infinite" }} />
                <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)" }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "white" }}>How can I help you?</p>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 6, maxWidth: 220 }}>Tap the orb or type below to get started</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "agent" && (
                <div style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", marginRight: 8, marginTop: 4, flexShrink: 0 }}>
                  <div style={{ width: "100%", height: "100%", background: CONIC_SM }} />
                </div>
              )}
              <div style={{
                maxWidth: "75%", padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? `linear-gradient(135deg, ${accentColor}, #4f46e5)` : "rgba(255,255,255,0.07)",
                color: m.role === "user" ? "white" : "#e2e8f0",
                border: m.role === "agent" ? "1px solid rgba(255,255,255,0.1)" : "none",
                boxShadow: m.role === "user" ? `0 4px 12px rgba(99,102,241,0.2)` : "none",
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "#0f172a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", gap: 8 }}>
            {!isActive && !isBusy ? (
              <>
                <button onClick={selectVoice} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 14, fontWeight: 500, borderRadius: 999, padding: "10px 16px", border: "none", cursor: "pointer",
                  background: chatMode === "voice" ? "linear-gradient(to right, #06b6d4, #2563eb)" : "rgba(255,255,255,0.06)",
                  color: chatMode === "voice" ? "white" : "#94a3b8",
                }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                  Voice
                </button>
                <button onClick={selectText} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 14, fontWeight: 500, borderRadius: 999, padding: "10px 16px", border: "none", cursor: "pointer",
                  background: chatMode === "text" ? "linear-gradient(to right, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.06)",
                  color: chatMode === "text" ? "white" : "#94a3b8",
                }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                  Text
                </button>
              </>
            ) : isBusy ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 14, padding: "10px 0" }}>
                <div style={{ width: 16, height: 16, border: "2px solid #334155", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "w-spin 1s linear infinite" }} />
                Connecting…
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                {chatMode === "voice" && (
                  <>
                    <button onClick={toggleMute} style={{
                      padding: 8, borderRadius: "50%", border: "none", cursor: "pointer",
                      background: isMuted ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
                      color: isMuted ? "#f87171" : "#94a3b8",
                    }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        {isMuted && <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />}
                      </svg>
                    </button>
                    <button onClick={endConversation} style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      background: "linear-gradient(to right, #ef4444, #e11d48)", color: "white",
                      fontSize: 14, fontWeight: 500, borderRadius: 999, padding: "10px 20px", border: "none", cursor: "pointer",
                    }}>End call</button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Text input */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, background: "#0f172a" }}>
            <input
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); convRef.current?.sendUserActivity?.() }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText() } }}
              placeholder={isActive || chatMode === "text" ? "Type a message…" : "Start voice or type…"}
              disabled={chatMode === "voice" && !isActive}
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 999, padding: "10px 16px", fontSize: 14, color: "#e2e8f0",
                outline: "none", opacity: chatMode === "voice" && !isActive ? 0.3 : 1,
              }}
            />
            <button
              onClick={sendText}
              disabled={(chatMode === "voice" && !isActive) || !textInput.trim()}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${accentColor}, #4f46e5)`, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                opacity: (chatMode === "voice" && !isActive) || !textInput.trim() ? 0.2 : 1,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
            </button>
          </div>

          {/* Powered by */}
          <div style={{ textAlign: "center", padding: "6px 0 10px", fontSize: 11, color: "#475569" }}>
            Powered by <a href="https://omniweb.ai" target="_blank" rel="noopener" style={{ color: "#06b6d4", textDecoration: "none" }}>Omniweb AI</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default function WidgetPage() {
  return (
    <Suspense fallback={
      <div style={{ position: "fixed", bottom: 16, right: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", overflow: "hidden",
          background: "conic-gradient(from 0deg, #0a4f8c, #2792DC, #9ce6e6, #ffffff, #2792DC, #0a4f8c)",
        }} />
      </div>
    }>
      <EmbeddableWidget />
    </Suspense>
  )
}
