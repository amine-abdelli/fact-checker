"""One recording session: owns the Deepgram connection, the rolling transcript buffer,
and triggers claim extraction. One instance per WebSocket connection.
"""

import asyncio
import logging
import time
import uuid
from collections.abc import Callable, Coroutine
from dataclasses import dataclass
from typing import Any

from . import claims, config
from .asr import DeepgramStream, parse_result
from .contracts import Claim, TranscriptSegment

logger = logging.getLogger("plumb.session")

EmitFn = Callable[[dict], Coroutine[Any, Any, None]]


@dataclass
class _BufferedSegment:
    speaker_id: str | None
    start_ms: int
    text: str


class Session:
    def __init__(self, emit: EmitFn) -> None:
        self.session_id = str(uuid.uuid4())
        self._emit = emit
        self._asr = DeepgramStream(language=config.LANGUAGE)
        self._asr_task: asyncio.Task | None = None
        self._ticker_task: asyncio.Task | None = None
        self._running = False

        self._finalized_segments: list[_BufferedSegment] = []
        self._words_since_extraction = 0
        self._last_extraction_at = 0.0
        self._extraction_lock = asyncio.Lock()
        self._shown_canonicals: list[str] = []

        self._last_speaker_seen: str | None = None

    @property
    def running(self) -> bool:
        return self._running

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._last_extraction_at = time.monotonic()
        await self._asr.connect()
        self._asr_task = asyncio.create_task(self._consume_asr())
        self._ticker_task = asyncio.create_task(self._extraction_ticker())
        await self._emit(
            {
                "type": "session",
                "data": {
                    "session_id": self.session_id,
                    "source_type": "mic",
                    "language": config.LANGUAGE,
                },
            }
        )
        logger.info("session=%s started", self.session_id)

    async def stop(self) -> None:
        if not self._running:
            return
        self._running = False
        await self._asr.close()
        if self._asr_task is not None:
            self._asr_task.cancel()
            self._asr_task = None
        if self._ticker_task is not None:
            self._ticker_task.cancel()
            self._ticker_task = None
        logger.info("session=%s stopped", self.session_id)

    async def _extraction_ticker(self) -> None:
        """Enforces EXTRACT_INTERVAL as a real wall-clock ceiling.

        The word-count/elapsed check in _handle_asr_message only runs when a new final
        transcript segment arrives — if segments arrive sparsely (silence, slow speech,
        an utterance that never finalizes), a claim can sit unextracted far longer than
        EXTRACT_INTERVAL with nothing to force it out. This ticker is the fix: it checks
        independently of ASR message arrival, every second.
        """
        try:
            while self._running:
                await asyncio.sleep(1)
                elapsed = time.monotonic() - self._last_extraction_at
                if elapsed >= config.EXTRACT_INTERVAL and self._finalized_segments:
                    asyncio.create_task(self._run_extraction())
        except asyncio.CancelledError:
            pass

    async def feed_audio(self, chunk: bytes) -> None:
        if not self._running:
            return
        await self._asr.send_audio(chunk)

    async def _consume_asr(self) -> None:
        try:
            async for message in self._asr.messages():
                await self._handle_asr_message(message)
        except asyncio.CancelledError:
            pass
        except Exception:
            logger.exception("session=%s ASR stream error", self.session_id)
            await self._emit({"type": "status", "data": {"text": "Erreur ASR (réseau ?)", "color": "error"}})

    async def _handle_asr_message(self, message: dict) -> None:
        parsed = parse_result(message)
        if parsed is None:
            return

        if parsed["speaker_id"] is not None and parsed["speaker_id"] != self._last_speaker_seen:
            logger.info(
                "session=%s speaker change/assignment: %s -> %s",
                self.session_id,
                self._last_speaker_seen,
                parsed["speaker_id"],
            )
            self._last_speaker_seen = parsed["speaker_id"]

        segment = TranscriptSegment(
            segment_id=str(uuid.uuid4()),
            session_id=self.session_id,
            speaker_id=parsed["speaker_id"],
            start_ms=parsed["start_ms"],
            end_ms=parsed["end_ms"],
            text=parsed["text"],
            language=config.LANGUAGE,
            confidence=parsed["confidence"],
            is_final=parsed["is_final"],
        )
        await self._emit({"type": "transcript", "data": segment.__dict__})

        if not parsed["is_final"]:
            return

        self._finalized_segments.append(
            _BufferedSegment(speaker_id=parsed["speaker_id"], start_ms=parsed["start_ms"], text=parsed["text"])
        )
        self._words_since_extraction += len(parsed["text"].split())

        elapsed = time.monotonic() - self._last_extraction_at
        if self._words_since_extraction >= config.MIN_WORDS or elapsed >= config.EXTRACT_INTERVAL:
            asyncio.create_task(self._run_extraction())

    async def _run_extraction(self) -> None:
        if self._extraction_lock.locked():
            return
        async with self._extraction_lock:
            if not self._finalized_segments:
                return

            window = self._finalized_segments[-100:]
            self._words_since_extraction = 0
            self._last_extraction_at = time.monotonic()

            lines = [f"[{seg.speaker_id or 'spk_?'} @{seg.start_ms}ms] {seg.text}" for seg in window]

            try:
                extracted = await claims.extract_claims(lines)
            except Exception:
                logger.exception("session=%s extraction call failed", self.session_id)
                return

            for item in extracted:
                if not claims.is_displayable(item):
                    continue
                if claims.is_duplicate(item.canonical, self._shown_canonicals):
                    continue

                self._shown_canonicals.append(item.canonical)
                claim = Claim(
                    claim_id=str(uuid.uuid4()),
                    session_id=self.session_id,
                    speaker_id=item.speaker_id,
                    start_ms=window[0].start_ms,
                    end_ms=window[-1].start_ms,
                    raw_quote=item.raw_quote,
                    canonical=item.canonical,
                    context=item.context,
                    category=item.category,
                    verifiability_score=item.verifiability_score,
                )
                await self._emit({"type": "claim", "data": claim.__dict__})
