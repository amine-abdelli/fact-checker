---
name: plumb-capture
description: Build or fix Stages 1 and 2 of the Plumb pipeline — audio capture (microphone, system audio, file, live stream URL) and streaming ASR with speaker diarization. Use for anything about sounddevice/PyAudio, sample rates, frame size, WebSocket ASR, Deepgram, Speechmatics, interim vs final segments, speaker_id stability, language detection FR/EN, or the ASRStreamProvider interface.
---

# Stage 1–2 — Capture, transcription, diarization

Output files: `packages/back/pipeline/src/plumb_pipeline/audio.py` (Stage 1), `packages/back/pipeline/src/plumb_pipeline/transcriber.py` (Stage 2).

## Read first

1. `CLAUDE.md` — the 8 rules, especially rule 5 (no audio leaves the device).
2. `specs/02-architecture-technique.md` §3.1 and §3.2 — the full stage specs.
3. `specs/01-cahier-des-charges.md` §5.1 (capture) and §5.2 (transcription / speakers),
   plus REQ-NF-05 (diarization accuracy target).
4. `specs/02-architecture-technique.md` §2 ADR-07 — the multilingual strategy. It constrains the provider choice.
5. `.claude/skills/plumb/references/contracts.md` — the `TranscriptSegment` you must emit.

## Blocked by D-02

The ASR provider is an **open decision** (Deepgram Nova vs Speechmatics). Do not hardcode one.

Write Stage 2 against an abstract provider:

```python
class ASRStreamProvider(Protocol):
    async def connect(self, language: str, diarize: bool) -> None: ...
    async def send(self, frame: bytes) -> None: ...
    def on_segment(self, cb: Callable[[TranscriptSegment], None]) -> None: ...
    async def close(self) -> None: ...
```

Concrete adapters live in `packages/back/pipeline/src/plumb_pipeline/asr/<provider>.py`, selected by an `ASR_PROVIDER`
environment variable. Swapping providers must not touch any other stage.

## Stage 1 — capture

- Mono, 16 kHz, 16-bit PCM, ~250 ms frames. Frame size configurable.
- Sources: `mic`, `system`, `file`, `link`, `live`. System audio and live capture depend on
  decision D-01 (platform) — implement `mic` and `file` first; the others behind the same
  `AudioSource` interface.
- Backpressure is explicit: a bounded queue that drops the oldest frame and logs it, never an
  unbounded buffer and never a silent stall.
- Audio is never written to disk unless the user turned on "conserver l'audio" (`specs/01-cahier-des-charges.md` §6.3),
  and then only locally encrypted.

## Stage 2 — ASR + diarization

- Streaming WebSocket, interim results on, diarization on.
- Emit `TranscriptSegment`. Interim segments are marked `is_final=False`, displayed dimmed by the
  UI, and never forwarded to Stage 3.
- `speaker_id` must be **stable for the whole session**. Providers re-index speakers after long
  silences — add a stabilization layer that maps provider labels to session-stable ids, and log
  every remap. This is a known failure mode, do not skip it.
- Language: `fr` by default, `en` supported (ADR-07). Auto-detection is a user setting, not a
  per-segment guess.
- Reconnect with exponential backoff on socket drop; emit a status event; never lose the session.

## Done when

- [ ] `TranscriptSegment` matches the contract field for field.
- [ ] Provider is swappable through `ASR_PROVIDER`; no provider name appears outside its adapter.
- [ ] `speaker_id` stable across a 60 s silence in the test fixture.
- [ ] Interim segments never reach Stage 3.
- [ ] No API key in the source; all from env.
- [ ] Audio bytes go to the ASR socket and nowhere else (grep the diff for any other sink).
- [ ] `packages/back/pipeline/tests/test_transcriber.py` covers: final/interim split, speaker remap, reconnect.
