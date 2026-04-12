"use client"

import Script from "next/script"

/**
 * Omniweb Conversational AI Widget
 *
 * Widget attributes override the server-side config, ensuring
 * the correct variant and behaviour regardless of
 * dashboard changes.
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
      {/* Scale down the widget on mobile via a wrapper */}
      <style jsx global>{`
        @media (max-width: 640px) {
          elevenlabs-convai {
            transform: scale(0.85);
            transform-origin: bottom right;
          }
        }
        @media (max-width: 400px) {
          elevenlabs-convai {
            transform: scale(0.75);
            transform-origin: bottom right;
          }
        }
      `}</style>
      {/* @ts-expect-error – web component not in JSX types */}
      <elevenlabs-convai agent-id={AGENT_ID} />
    </>
  )
}
