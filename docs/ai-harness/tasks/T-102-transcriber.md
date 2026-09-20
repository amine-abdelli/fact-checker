# T-102 — Stage 2: ASR + diarization
**Skill:** plumb-capture · **Agent:** capture-engineer · **Blocked by:** D-02, T-101

## Goal
`packages/back/pipeline/src/plumb_pipeline/transcriber.py` streams frames to an ASR provider and emits `TranscriptSegment`
events with session-stable `speaker_id`s.

## Read first
- `specs/02-architecture-technique.md` §3.2 and §2 ADR-07
- `specs/01-cahier-des-charges.md` §5.2, REQ-NF-05
- `.claude/skills/plumb/references/contracts.md`

## Deliverables
- `packages/back/pipeline/src/plumb_pipeline/transcriber.py` — `ASRStreamProvider` protocol + speaker-id stabilization
- `packages/back/pipeline/src/plumb_pipeline/asr/<provider>.py` — one adapter for the provider chosen in D-02
- `packages/back/pipeline/tests/test_transcriber.py`

## Acceptance criteria
- [ ] `TranscriptSegment` matches the contract field for field
- [ ] Provider selected by `ASR_PROVIDER`; no vendor name outside its adapter file
- [ ] `speaker_id` stable across a 60 s silence in the fixture
- [ ] Interim segments marked and never forwarded downstream
- [ ] Socket drop → exponential backoff reconnect, status event emitted, no session loss
- [ ] plumb-review: PASS
