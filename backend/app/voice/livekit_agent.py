"""LiveKit AgentSession Bridge for Omniweb Contact Center.

Connects LiveKit Realtime Media Transport to the LangGraph Stateful Workflow Plane.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any

from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.telemetry import MetricTracker, async_correlation_scope
from app.orchestration.langgraph.graph import run_contact_center_turn
from app.orchestration.langgraph.state import ContactCenterState, create_initial_state
from app.voice.pipelines import VoicePipelineManager

logger = get_logger(__name__)
settings = get_settings()


class LiveKitContactCenterSession:
    """Manages a single live conversational audio session over LiveKit WebRTC/SIP."""

    def __init__(
        self,
        room_name: str,
        tenant_id: str = "default_tenant",
        caller_phone: str | None = None,
        caller_email: str | None = None,
        channel: str = "phone_inbound",
    ):

        self.room_name = room_name
        self.tenant_id = tenant_id
        self.caller_phone = caller_phone
        self.caller_email = caller_email
        self.channel = channel
        self.pipeline_config = VoicePipelineManager.get_pipeline_config(tenant_id, channel)
        self.state: ContactCenterState = create_initial_state(
            tenant_id=tenant_id,
            session_id=room_name,
            channel=channel,  # type: ignore
            caller_phone=caller_phone,
            caller_email=caller_email,
        )
        self.case_id: str | None = None
        self.is_active = True
        self.interrupted = False
        self.interruption_count = 0

    def attach_case(self, case_id: str) -> None:
        """Attach an active case UUID to this live session."""
        self.case_id = case_id
        self.state["case_id"] = case_id
        logger.info(f"[LiveKit Session {self.room_name}] Attached case {case_id}")

    async def on_user_speech_committed(self, transcribed_text: str) -> str:
        """Invoked when VAD commits a user speech turn."""
        turn_start = time.perf_counter()
        async with async_correlation_scope(
            tenant_id=self.tenant_id,
            session_id=self.room_name,
            call_id=self.room_name,
        ):
            logger.info(f"[LiveKit Session {self.room_name}] User Speech Turn: '{transcribed_text}'")

            # Reset interruption state on new turn
            self.interrupted = False

            # Append user message
            messages = [*self.state.get("messages", [])]
            messages.append({"role": "user", "content": transcribed_text, "timestamp": time.time()})
            self.state["messages"] = messages

            # Execute LangGraph turn
            updated_state = await run_contact_center_turn(self.state)
            self.state = updated_state

            response_text = updated_state.get("response_text") or "I am here to assist you."
            turn_latency_ms = (time.perf_counter() - turn_start) * 1000

            MetricTracker.record_turn_latency(
                stage="end_to_end_voice_turn",
                duration_ms=turn_latency_ms,
                agent=updated_state.get("active_agent"),
                tenant_id=self.tenant_id,
            )

            logger.info(
                f"[LiveKit Session {self.room_name}] Agent Response ({turn_latency_ms:.1f}ms): '{response_text}'"
            )
            return response_text

    async def handle_interruption(self) -> None:
        """Invoked when the caller interrupts the AI during speech playback."""
        self.interrupted = True
        self.interruption_count += 1
        MetricTracker.record_turn_latency(
            stage="barge_in_interruption",
            duration_ms=0.0,
            agent=self.state.get("active_agent"),
            tenant_id=self.tenant_id,
        )
        logger.info(
            f"[LiveKit Session {self.room_name}] Interruption detected (Barge-in count={self.interruption_count}). Halting TTS playback."
        )

    async def warm_transfer(self, destination: str) -> dict[str, Any]:
        """Perform warm transfer to human specialist with full conversational packet."""
        from app.voice.telephony_provider import get_telephony_provider
        provider = get_telephony_provider("livekit")
        context_packet = {
            "case_id": self.case_id,
            "session_id": self.room_name,
            "caller_phone": self.caller_phone,
            "caller_email": self.caller_email,
            "active_agent": self.state.get("active_agent"),
            "intent": self.state.get("intent"),
            "sentiment": self.state.get("sentiment"),
            "summary": self.state.get("conversation_summary"),
        }
        return await provider.transfer_call(
            call_id=self.room_name,
            destination_number=destination,
            warm=True,
            context_packet=context_packet,
        )

    async def close_session(self) -> None:
        """Finalize session and trigger post-call persistence."""
        self.is_active = False
        logger.info(f"[LiveKit Session {self.room_name}] Session closed. Final summary: {self.state.get('conversation_summary')}")
