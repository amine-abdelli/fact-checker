---
name: plumb-proto
description: Build or fix the throwaway Plumb prototype in packages/prototype-pwa — a PWA that records audio continuously plus a small FastAPI server that transcribes and extracts claims in real time. Use for anything about the prototype, the PWA, microphone recording in the browser, AudioWorklet or MediaRecorder, service worker, WebSocket audio streaming, or checking that live claim display actually works before the production pipeline exists.
---

# Prototype — PWA + FastAPI (throwaway)

Location: `packages/prototype-pwa/` (`web/` = PWA, `server/` = FastAPI).

## What this prototype is for

Two questions, and only two:

1. **Does continuous recording work in a browser?** Can a PWA capture the microphone for 20+
   minutes and stream it to a server without the tab, the OS or iOS Safari killing it?
2. **Does real-time display work?** Do claims land in the UI fast enough, attributed to the right
   speaker, to feel live rather than batch?

Everything else is out of scope: verdicts, V1–V8, sources, summaries, persistence, accounts,
design-system fidelity. Claims are displayed as « à vérifier » and nothing more.

**This code is disposable and everyone knows it.** Do not gold-plate it, do not build abstractions
for a future it will not see, do not port `specs/06-design-system-ui.md` into it. When it has answered its two
questions it is deleted, and what it taught is written to `docs/ai-harness/findings/`.

## Read first

- `packages/prototype-pwa/README.md` — scope.
- `docs/archive/live-prototype-spec-v1.md` — prior art from the deleted v1 prototype: the
  four-criteria extraction filter, the trigger heuristic (50 words / 20 s), the speaker colors, and
  the known diarization drift. **Reference only** — it is an archive, not a spec to comply with.
- `specs/02-architecture-technique.md` §3.3 — the claim definition the extraction prompt must match.
  The prototype's extraction must be recognizably the same thing the real Stage 3 will do,
  otherwise it validates nothing.

## Shape

```
web/      vite + TypeScript, no framework needed
          AudioWorklet → mono 16 kHz PCM → WebSocket (binary frames, ~250 ms)
          manifest.json + service worker (installability, not offline)
          two panes: live transcript (chat style, per speaker) · claims (newest first)

server/   FastAPI, one WebSocket endpoint in, one event stream out
          audio → ASR provider (streaming, diarize=true) → rolling transcript buffer
          → claim extraction (claude-haiku-4-5) → { type: "transcript" | "claim" } events
```

Event payloads stay close to `.claude/skills/plumb/references/contracts.md` — the same field names
for `speaker_id`, `raw_quote`, `canonical`, `category`. Getting this wrong now means the finding
does not transfer to the real pipeline.

## Rules that still apply, even here

- Extraction is `claude-haiku-4-5`. Never Sonnet, never another vendor's model (rule 7 — this is
  precisely how the last prototype drifted to `gpt-4o-mini` unnoticed).
- Keys from environment variables only, `.env` never committed (rule 8).
- Audio bytes go to the ASR provider and nowhere else (rule 5).
- **No verdicts anywhere.** No V1–V8 key, no colored verdict chip, no « vrai / faux ». The moment a
  verdict appears, the prototype stops being a prototype.
- UI strings in French, but free-form — `specs/06-design-system-ui.md` §11 does not bind here.

## Browser realities to handle, not discover late

- Microphone capture needs HTTPS or `localhost`. Plan for a LAN test over HTTPS if you test on a phone.
- A backgrounded tab is throttled; on iOS Safari the mic stops when the tab loses focus. Use a
  Wake Lock, and **measure** what actually happens rather than assuming — that measurement *is* the
  deliverable of question 1.
- `MediaRecorder` gives you compressed chunks; an `AudioWorklet` gives you raw PCM you control.
  Prefer the worklet for streaming ASR, and say why in the finding if you had to fall back.
- Reconnect the WebSocket with backoff and keep recording across the gap; a dropped socket must not
  end the session.

## Success criteria — measure them, do not assert them

- [ ] 20 minutes of continuous recording, tab in foreground, zero dropouts. Note what happens in
      background and on a locked phone.
- [ ] Spoken sentence → claim card on screen in ≤ 15 s, measured on at least 20 claims.
- [ ] ≥ 80 % of displayed claims genuinely fact-checkable; ≤ 1 obvious non-claim per 10 minutes.
- [ ] Speaker attribution correct ≥ 85 % on a two-person conversation.
- [ ] A first-time viewer can tell who said what without an explanation.

## Done when

The five criteria are measured with real numbers, and `docs/ai-harness/findings/pwa-prototype.md`
says what worked, what the real latency was, which contract field turned out wrong, and what the
production pipeline should do differently. That document is the only thing that survives.
