# ADR-002: LiveKit for Realtime Media Transport & Interaction

## Status
Accepted

## Context
Voice responsiveness requires low latency (< 300ms), fast interruption detection (barge-in), and multi-channel media transport across WebRTC (in-browser) and SIP/PSTN telephony. The previous implementation fragmented transport across Retell, ElevenLabs, and Deepgram.

## Decision
Adopt **LiveKit** as the sole owner of the Real-Time Interaction Plane. LiveKit manages audio streams, voice activity detection (VAD), turn taking, and session lifecycle. Business workflow logic is explicitly forbidden inside the LiveKit transport worker and is bridged into LangGraph.

## Consequences
- Single unified transport architecture for both browser calls and telephone SIP trunks.
- Decouples voice transport from business state machines.

## Risks
- LiveKit agent worker downtime must trigger graceful call degradation or fallback.
