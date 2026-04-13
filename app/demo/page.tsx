"use client"

import { useEffect, useState, useCallback } from "react"
import { dispatchAssistantOpen } from "@/lib/assistant-events"
import Link from "next/link"

export default function DemoPage() {
  const [widgetOpened, setWidgetOpened] = useState(false)

  /* Auto-open the voice widget after a short delay */
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatchAssistantOpen("voice")
      setWidgetOpened(true)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const openVoice = useCallback(() => {
    dispatchAssistantOpen("voice")
    setWidgetOpened(true)
  }, [])

  const openText = useCallback(() => {
    dispatchAssistantOpen("text")
    setWidgetOpened(true)
  }, [])

  return (
    <div className="min-h-dvh bg-[#050a12] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-cyan-500/8 via-indigo-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-gradient-to-tl from-violet-500/5 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="font-semibold text-lg">Omniweb AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/get-started"
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-medium text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100dvh-73px)] px-6 pb-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Animated orb preview */}
          <div className="relative mx-auto w-24 h-24">
            <style jsx>{`
              @keyframes demo-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
              @keyframes demo-pulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.05); opacity: .9 } }
              @keyframes demo-ring { 0% { box-shadow: 0 0 0 0 rgba(39,146,220,.4) } 100% { box-shadow: 0 0 0 20px rgba(39,146,220,0) } }
            `}</style>
            <div
              className="absolute inset-0 rounded-full"
              style={{ animation: "demo-ring 2s ease-out infinite" }}
            />
            <div
              className="w-24 h-24 rounded-full overflow-hidden shadow-2xl"
              style={{ animation: "demo-pulse 3s ease-in-out infinite" }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #0a4f8c, #2792DC, #9ce6e6, #ffffff, #2792DC, #0a4f8c, #9ce6e6, #ffffff, #0a4f8c)",
                  animation: "demo-spin 8s linear infinite",
                }}
              />
              <div className="absolute inset-[3px] rounded-full" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)" }} />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.15)" }} />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Talk to our{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                AI assistant
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
              Experience what your customers will experience. Have a real conversation — 
              by voice or text — and see how Omniweb AI qualifies leads, answers questions, 
              and books appointments.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={openVoice}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all w-full sm:w-auto justify-center"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Talk to AI
              <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </button>
            <button
              onClick={openText}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-semibold text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all w-full sm:w-auto justify-center backdrop-blur-sm"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Chat with AI
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 max-w-xl mx-auto">
            {[
              { icon: "🎙️", title: "Voice & Text", desc: "Talk naturally or type — your choice" },
              { icon: "🌍", title: "16 Languages", desc: "English, Spanish, French, and more" },
              { icon: "⚡", title: "Instant Setup", desc: "Embed on any website in 30 seconds" },
            ].map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center"
              >
                <div className="text-2xl mb-2">{feat.icon}</div>
                <p className="text-sm font-semibold text-white">{feat.title}</p>
                <p className="text-xs text-slate-500 mt-1">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Hint */}
          {!widgetOpened && (
            <p className="text-sm text-slate-500 animate-pulse pt-4">
              👉 Click the orb in the bottom right to start a conversation
            </p>
          )}
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-white/5 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-3">
            <p className="text-sm text-slate-400 text-center sm:text-left">
              Like what you see?{" "}
              <Link href="/get-started" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Sign up
              </Link>{" "}
              and get your own AI assistant with an embeddable widget for your website.
            </p>
            <Link
              href="/pricing"
              className="text-xs text-slate-500 hover:text-slate-400 whitespace-nowrap"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
