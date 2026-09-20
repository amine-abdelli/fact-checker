"""Streaming ASR client for Deepgram Nova (diarize=true).

Prototype-only choice per docs/archive/live-prototype-spec-v1.md — does not pre-empt
ADR-07/D-02 (Speechmatics remains the MVP default candidate, benchmark still owed).
Raw audio bytes go only to Deepgram; nothing else on the network ever sees them
(project rule 5).
"""

import json
import logging
from collections.abc import AsyncIterator
from urllib.parse import urlencode

import websockets
from websockets.asyncio.client import ClientConnection

from . import config

logger = logging.getLogger("plumb.asr")

DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen"


class DeepgramStream:
    """One Deepgram streaming connection for the lifetime of a recording session."""

    def __init__(self, language: str = config.LANGUAGE) -> None:
        self._language = language
        self._conn: ClientConnection | None = None

    async def connect(self) -> None:
        params = {
            "model": "nova-2",
            "language": self._language,
            "diarize": "true",
            "punctuate": "true",
            "interim_results": "true",
            "endpointing": "300",
            "encoding": "linear16",
            "sample_rate": str(config.SAMPLE_RATE),
            "channels": "1",
        }
        url = f"{DEEPGRAM_URL}?{urlencode(params)}"
        self._conn = await websockets.connect(
            url,
            additional_headers={"Authorization": f"Token {config.DEEPGRAM_API_KEY}"},
        )
        logger.info("Deepgram connected (language=%s)", self._language)

    async def send_audio(self, chunk: bytes) -> None:
        if self._conn is None:
            return
        await self._conn.send(chunk)

    async def messages(self) -> AsyncIterator[dict]:
        if self._conn is None:
            return
        async for raw in self._conn:
            if isinstance(raw, bytes):
                continue
            try:
                yield json.loads(raw)
            except json.JSONDecodeError:
                logger.warning("Non-JSON Deepgram message dropped")

    async def close(self) -> None:
        if self._conn is not None:
            await self._conn.close()
            self._conn = None


def parse_result(message: dict) -> dict | None:
    """Extract a flat {text, is_final, speaker_id, start_ms, end_ms, confidence} from a
    Deepgram `Results` message, or None if the message carries no transcript (e.g. Metadata).

    Speaker attribution: Deepgram tags each word with a `speaker` index under diarize=true.
    One Results message is one utterance bounded by endpointing, so we take the speaker of
    the first word as the segment's speaker_id — logging when the utterance is not
    speaker-homogeneous (prototype simplification, see finding).
    """
    if message.get("type") != "Results":
        return None

    channel = message.get("channel", {})
    alternatives = channel.get("alternatives", [])
    if not alternatives:
        return None

    alt = alternatives[0]
    text = (alt.get("transcript") or "").strip()
    if not text:
        return None

    words = alt.get("words", [])
    speaker_id = None
    if words:
        speaker_indices = {w.get("speaker") for w in words if w.get("speaker") is not None}
        if len(speaker_indices) > 1:
            logger.info("Utterance spans %d speakers, using first word's speaker", len(speaker_indices))
        first_speaker = words[0].get("speaker")
        if first_speaker is not None:
            speaker_id = f"spk_{first_speaker}"

    start_s = message.get("start", 0.0)
    duration_s = message.get("duration", 0.0)

    return {
        "text": text,
        "is_final": bool(message.get("is_final", False)),
        "speaker_id": speaker_id,
        "start_ms": int(start_s * 1000),
        "end_ms": int((start_s + duration_s) * 1000),
        "confidence": float(alt.get("confidence", 0.0)),
    }
