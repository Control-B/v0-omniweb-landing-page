"use client"

import Script from "next/script"

/**
 * ElevenLabs Conversational AI Widget
 *
 * Replaces the previous Deepgram + DigitalOcean AI chatbot with the
 * ElevenLabs convai widget. Supports both voice calls and text chat
 * out of the box — no custom WebSocket code needed.
 *
 * Agent is managed from the Omniweb Admin dashboard at:
 *   https://omniweb-engine-rs6fr.ondigitalocean.app/admin
 */

const AGENT_ID = "agent_4601kny4fvsgfjz8mbqhevyp1k9q"

export function Chatbot() {
  return (
    <>
      <Script
        src="https://elevenlabs.io/convai-widget/index.js"
        strategy="lazyOnload"
        async
      />
      {/* @ts-expect-error – web component not in JSX types */}
      <elevenlabs-convai agent-id={AGENT_ID} />
    </>
  )
}
