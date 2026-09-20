# T-101 — Stage 1: audio capture
**Skill:** plumb-capture · **Agent:** capture-engineer · **Blocked by:** D-01 (for system/live sources only)

## Goal
`packages/back/pipeline/src/plumb_pipeline/audio.py` captures mono 16 kHz PCM in ~250 ms frames from a microphone or a file and
pushes frames to a bounded queue, behind an `AudioSource` interface.

## Read first
- `specs/02-architecture-technique.md` §3.1
- `specs/01-cahier-des-charges.md` §5.1 (REQ-F-01…F-05), §6.3 (privacy)

## Deliverables
- `packages/back/pipeline/src/plumb_pipeline/audio.py` — `AudioSource` protocol, `MicSource`, `FileSource`
- `packages/back/pipeline/tests/test_audio.py` — frame size, backpressure drop, start/stop lifecycle

## Acceptance criteria
- [ ] Frame size, sample rate and queue depth configurable through env
- [ ] Backpressure drops the oldest frame and logs it — no unbounded buffer, no silent stall
- [ ] No audio written to disk unless the retention setting is on
- [ ] `system` and `live` sources stubbed behind the same interface, raising a clear "blocked by D-01"
- [ ] plumb-review: PASS
