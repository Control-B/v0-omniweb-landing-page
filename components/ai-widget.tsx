"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Headphones,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dispatchAssistantOpen, type AssistantOpenMode } from "@/lib/assistant-events"

type AIWidgetProps = {
  title?: string
  description?: string
  primaryLabel?: string
  secondaryLabel?: string
  primaryMode?: AssistantOpenMode
  secondaryMode?: AssistantOpenMode
  ctaHref?: string
  className?: string
}

const QUICK_QUESTIONS = [
  { label: "⚡ Sub-250ms Latency & Barge-in", query: "What is your latency and how does barge-in interruption work?" },
  { label: "💰 Pricing: $49 vs $149", query: "Explain the difference between Starter ($49) and Pro Growth ($149) plans" },
  { label: "🎙️ Turn-Taking Mechanics", query: "How does conversational turn-taking work in Omniweb?" },
  { label: "🛍️ Shopify Catalog AI", query: "How does the Shopify AI Assistant connect to store catalogs?" },
]

export function AIWidget({
  title = "Let AI qualify, answer, and book for you",
  description = "Experience true conversational AI with sub-250ms latency, natural turn-taking, and instant barge-in interruption.",
  primaryLabel = "Talk to AI",
  secondaryLabel = "Start 14-Day Trial",
  primaryMode = "voice",
  secondaryMode = "text",
  ctaHref = "/get-started",
  className,
}: AIWidgetProps) {
  const router = useRouter()

  const [inputQuery, setInputQuery] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isInterrupted, setIsInterrupted] = useState(false)
  const [assistantReply, setAssistantReply] = useState<string | null>(null)
  const [actionData, setActionData] = useState<{ label: string; href: string } | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const sharedAudioElRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isSpeakingRef = useRef(false)

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  // Unlock audio context on first direct user gesture
  const unlockAudio = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtxClass && !audioContextRef.current) {
        audioContextRef.current = new AudioCtxClass()
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {})
      }
      if (!sharedAudioElRef.current) {
        sharedAudioElRef.current = new Audio()
      }
    } catch (e) {}
  }, [])

  // Immediate audio cutoff (<10ms)
  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop()
      } catch (e) {}
      audioSourceRef.current = null
    }
    if (sharedAudioElRef.current) {
      try {
        sharedAudioElRef.current.pause()
        sharedAudioElRef.current.currentTime = 0
      } catch (e) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    isSpeakingRef.current = false
  }, [])

  // Instant barge-in interruption
  const interruptAgent = useCallback(
    (reason: string = "User interrupted") => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      stopAudio()
      setIsThinking(false)
      setIsInterrupted(true)
      setTimeout(() => setIsInterrupted(false), 2400)
      console.info(`[AIWidget] Interrupted: ${reason}`)
    },
    [stopAudio]
  )

  // Speech playback with turn handoff
  const playSpeech = useCallback(
    async (textToSpeak: string) => {
      if (typeof window === "undefined") return
      stopAudio()
      setIsSpeaking(true)
      isSpeakingRef.current = true

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToSpeak,
            personaId: "site-concierge",
            provider: "deepgram",
          }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error(`TTS HTTP error: ${res.status}`)

        const arrayBuffer = await res.arrayBuffer()

        if (audioContextRef.current) {
          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume()
          }

          const bufferCopy = arrayBuffer.slice(0)
          const audioBuffer = await audioContextRef.current.decodeAudioData(bufferCopy)

          if (controller.signal.aborted) return

          const source = audioContextRef.current.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContextRef.current.destination)
          audioSourceRef.current = source

          source.onended = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false
            audioSourceRef.current = null
          }

          source.start(0)
          return
        }

        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
        const url = URL.createObjectURL(blob)
        const audioEl = sharedAudioElRef.current || new Audio()
        sharedAudioElRef.current = audioEl
        audioEl.src = url
        audioEl.onended = () => {
          setIsSpeaking(false)
          isSpeakingRef.current = false
          URL.revokeObjectURL(url)
        }
        await audioEl.play()
      } catch (err: any) {
        if (err?.name === "AbortError") return

        // Web speech synthesis fallback
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const clean = textToSpeak.replace(/https?:\/\/[^\s]+/g, "").replace(/[\*#_`]/g, "")
          const utterance = new SpeechSynthesisUtterance(clean)
          utterance.onend = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false
          }
          utterance.onerror = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false
          }
          window.speechSynthesis.speak(utterance)
        } else {
          setIsSpeaking(false)
          isSpeakingRef.current = false
        }
      }
    },
    [stopAudio]
  )

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onspeechstart = () => {
          if (isSpeakingRef.current) {
            interruptAgent("Voice detected during playback")
          }
        }

        recognition.onresult = (e: any) => {
          const transcript = e.results?.[0]?.[0]?.transcript
          if (transcript) {
            handleAskQuestion(transcript)
          }
          setIsListening(false)
        }

        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)

        recognitionRef.current = recognition
      }
    }
  }, [interruptAgent])

  const toggleMic = () => {
    unlockAudio()
    if (isSpeaking) {
      interruptAgent("User tapped mic to interrupt")
      return
    }

    if (!recognitionRef.current) {
      alert("Microphone voice input is supported in modern mobile and desktop browsers.")
      return
    }

    if (isListening) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        setIsListening(false)
      }
    }
  }

  // Ask Question & Handle Conversational Turn
  const handleAskQuestion = async (queryText?: string) => {
    unlockAudio()
    const query = (queryText || inputQuery).trim()
    if (!query) return

    stopAudio()
    setInputQuery("")
    setIsThinking(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: query }],
          personaId: "site-concierge",
        }),
        signal: controller.signal,
      })

      const data = await res.json()
      const reply = data.reply || "Omniweb delivers sub-250ms voice turns and instant barge-in interruptions."
      setAssistantReply(reply)
      setActionData(data.action || null)
      setIsThinking(false)

      // Speak answer aloud with Deepgram Aura
      playSpeech(reply)
    } catch (err: any) {
      if (err?.name === "AbortError") return
      setIsThinking(false)
      const fallback = "Omniweb automates voice and chat conversations with sub-250ms latency. How can I help you today?"
      setAssistantReply(fallback)
      playSpeech(fallback)
    }
  }

  return (
    <div
      className={[
        "rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(8,15,31,0.95),rgba(7,12,25,0.9))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8 transition-all",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Info Column */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Bot className="h-3.5 w-3.5" />
              Conversational AI Concierge
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
              <Zap className="h-2.5 w-2.5 text-amber-300" />
              &lt;50ms Barge-in
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
              <Sparkles className="h-2.5 w-2.5" />
              Continuous Turn-Taking
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold text-white lg:text-3xl tracking-tight">{title}</h3>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate-300 lg:text-base">{description}</p>

          {/* Quick Question Chips */}
          <div className="mt-4 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Ask Instant Question (or Type / Speak Below):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAskQuestion(chip.query)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-white"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Action & Launch Column */}
        <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col shrink-0 lg:w-64">
          <Button
            size="lg"
            type="button"
            onClick={() => {
              unlockAudio()
              dispatchAssistantOpen("voice")
            }}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500"
          >
            <Headphones className="mr-2 h-4 w-4 text-cyan-200" />
            {primaryLabel}
          </Button>

          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href="/demo">
              <Sparkles className="mr-2 h-4 w-4 text-amber-300" />
              Interactive Demo Lab
            </Link>
          </Button>

          <Button
            size="lg"
            asChild
            className="w-full rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500"
          >
            <Link href={ctaHref}>
              {secondaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Interactive Inline Conversation Area ───────────────────────── */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5">
        {/* Status Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isSpeaking
                  ? "bg-purple-400 animate-ping"
                  : isListening
                  ? "bg-emerald-400 animate-pulse"
                  : isThinking
                  ? "bg-amber-400 animate-pulse"
                  : "bg-cyan-400"
              }`}
            />
            <span className="font-semibold text-slate-200">
              {isInterrupted ? (
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  <Zap className="h-3.5 w-3.5" />
                  Interrupted — floor yielded to you
                </span>
              ) : isSpeaking ? (
                <span className="text-purple-300 flex items-center gap-1 font-bold">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                  Agent Speaking (Tap Interrupt button or speak to cut in)
                </span>
              ) : isListening ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  Your turn: Listening to you...
                </span>
              ) : isThinking ? (
                <span className="text-amber-300">Reasoning through knowledge base...</span>
              ) : (
                "Ready — ask any question or test low-latency voice"
              )}
            </span>
          </div>

          {/* Instant Interruption Button */}
          {isSpeaking && (
            <button
              type="button"
              onClick={() => interruptAgent("User clicked inline interrupt button")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md transition hover:bg-rose-500 animate-pulse"
              aria-label="Interrupt speech"
            >
              <Square className="h-3 w-3 fill-current" />
              Interrupt Agent
            </button>
          )}
        </div>

        {/* Inline Answer Display (When Q&A occurred) */}
        {assistantReply && (
          <div className="my-4 rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-4 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Bot className="h-4 w-4" />
                <span>Omniweb Assistant Response</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  unlockAudio()
                  if (isSpeaking) {
                    stopAudio()
                  } else {
                    playSpeech(assistantReply)
                  }
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-white/15"
              >
                {isSpeaking ? (
                  <>
                    <Square className="h-3 w-3 fill-current text-rose-400" />
                    <span className="text-rose-400">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    Listen Aloud
                  </>
                )}
              </button>
            </div>

            <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">{assistantReply}</p>

            {/* Action suggestion if available */}
            {actionData && (
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300 font-medium">{actionData.label}</span>
                <Button
                  size="sm"
                  onClick={() => router.push(actionData.href)}
                  className="h-7 rounded-lg bg-cyan-500 px-3 text-xs font-bold text-black hover:bg-cyan-400"
                >
                  View Page
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Input & Microphone Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAskQuestion()
          }}
          className="mt-3 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              isSpeaking
                ? "bg-purple-600 text-white animate-pulse"
                : isListening
                ? "bg-emerald-600 text-white animate-pulse"
                : "border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={isSpeaking ? "Interrupt agent" : isListening ? "Stop listening" : "Speak question with microphone"}
            aria-label="Toggle Microphone"
          >
            {isSpeaking ? <Zap className="h-5 w-5 text-amber-300" /> : <Mic className="h-5 w-5" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => {
              if (isSpeaking) interruptAgent("User started typing")
              setInputQuery(e.target.value)
            }}
            onFocus={() => {
              unlockAudio()
              if (isSpeaking) interruptAgent("User focused input field")
            }}
            placeholder="Ask about latency, $49 vs $149 pricing, Shopify, or barge-in..."
            className="h-11 flex-1 rounded-xl border border-white/15 bg-slate-900/90 px-3.5 text-base sm:text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />

          <Button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 p-0 text-white hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40"
            aria-label="Submit question"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
