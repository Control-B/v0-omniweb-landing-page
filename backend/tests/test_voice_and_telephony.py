"""Comprehensive Unit Tests for Real-Time Audio, Telephony & Voice Invariants (Phase 5).

Tests:
1. LiveKit session turn execution and state machine integration
2. Barge-in interruption detection and counter tracking
3. Case attachment and synchronization
4. Warm call transfer with conversational context packet
5. Telephony provider abstraction (LiveKit & Twilio implementations)
6. Factory resolution
"""
import pytest

from app.voice.livekit_agent import LiveKitContactCenterSession
from app.voice.telephony_provider import (
    CallStatus,
    LiveKitTelephonyProvider,
    TwilioTelephonyProvider,
    get_telephony_provider,
)


@pytest.mark.asyncio
async def test_livekit_session_turn_processing():
    """Verify live speech turn execution produces a response and updates state."""
    session = LiveKitContactCenterSession(
        room_name="room_test_123",
        tenant_id="tenant_apex",
        caller_phone="+15552345678",
        channel="phone_inbound",
    )

    response = await session.on_user_speech_committed("Hi, I want to book an appointment for tomorrow at 2pm.")
    assert response is not None
    assert len(response) > 0
    assert len(session.state["messages"]) >= 2
    assert session.is_active is True


@pytest.mark.asyncio
async def test_livekit_barge_in_interruption_handling():
    """Verify barge-in halts speech, increments counter, and resets on subsequent turns."""
    session = LiveKitContactCenterSession(
        room_name="room_barge_in",
        tenant_id="tenant_apex",
    )
    assert session.interrupted is False
    assert session.interruption_count == 0

    # User interrupts AI playback
    await session.handle_interruption()
    assert session.interrupted is True
    assert session.interruption_count == 1

    await session.handle_interruption()
    assert session.interruption_count == 2

    # New speech turn resets interrupted flag
    await session.on_user_speech_committed("Actually, wait, I have a different question.")
    assert session.interrupted is False
    assert session.interruption_count == 2


@pytest.mark.asyncio
async def test_livekit_case_attachment_and_warm_transfer():
    """Verify attaching a case and executing warm transfer with full context packet."""
    session = LiveKitContactCenterSession(
        room_name="room_transfer_test",
        tenant_id="tenant_apex",
        caller_phone="+15559998888",
    )
    case_id = "550e8400-e29b-41d4-a716-446655440000"
    session.attach_case(case_id)

    assert session.case_id == case_id
    assert session.state.get("case_id") == case_id

    # Populate turn info
    await session.on_user_speech_committed("I need to speak with a tier 2 supervisor about my billing.")

    # Execute warm transfer
    transfer_res = await session.warm_transfer("+15550001111")
    assert transfer_res["success"] is True
    assert transfer_res["transfer_status"] == "transferred"
    assert transfer_res["destination"] == "+15550001111"
    assert transfer_res["warm"] is True
    assert transfer_res["context_handed_off"] is True


@pytest.mark.asyncio
async def test_telephony_provider_abstraction():
    """Verify unified API across LiveKit and Twilio providers."""
    lk_provider = get_telephony_provider("livekit")
    assert isinstance(lk_provider, LiveKitTelephonyProvider)

    outbound_lk = await lk_provider.initiate_outbound_call(
        tenant_id="t1",
        to_number="+15551234567",
        from_number="+15557654321",
    )
    assert outbound_lk["success"] is True
    assert outbound_lk["call_id"].startswith("lk_call_")
    assert outbound_lk["status"] == CallStatus.IN_PROGRESS.value

    # Twilio provider
    twilio_provider = get_telephony_provider("twilio")
    assert isinstance(twilio_provider, TwilioTelephonyProvider)

    outbound_twilio = await twilio_provider.initiate_outbound_call(
        tenant_id="t1",
        to_number="+15551234567",
        from_number="+15557654321",
    )
    assert outbound_twilio["success"] is True
    assert outbound_twilio["call_id"].startswith("CA")
    assert outbound_twilio["status"] == CallStatus.QUEUED.value
