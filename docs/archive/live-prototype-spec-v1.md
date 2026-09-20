# Live Prototype — Specification

*Version 1.0 — 2026-07-07*
*Folder: `prototypes/live_prototype/` — pre-MVP throwaway prototype*

---

## 1. Purpose

Validate the two riskiest assumptions of Plumb before building the MVP pipeline:

1. **Claim filtering quality** — can an LLM reliably surface *only* fact-checkable claims from a live conversation, ignoring greetings, opinions, small talk ("bonjour je m'appelle Michel, j'ai mangé au restaurant ce matin"), while catching factual/dated statements ("la bataille de Marignan a eu lieu en 1515")?
2. **Speaker separation UX** — can we attribute each claim to the right speaker via diarization, and is a color-coded two-sided layout readable in real time?

**Explicitly out of scope:** verification (Stage 4), verdicts V1–V8, summaries, session persistence, auth. No verdict UI at all — claims are displayed as "à vérifier".

## 2. Success criteria

- **SC-1** ≥ 80% of displayed claims are genuinely fact-checkable (human judgment over a 10-min test conversation).
- **SC-2** ≤ 1 obvious non-claim (opinion/small talk) displayed per 10 minutes.
- **SC-3** Speaker attribution correct ≥ 85% on a 2-person conversation (matches REQ-NF-05).
- **SC-4** Utterance → claim card latency ≤ 15 s.
- **SC-5** A first-time viewer can tell who said what without explanation.

## 3. Architecture

```
Microphone (mono 16 kHz)
   │  sounddevice, 250 ms frames
   ▼
[ASR + diarisation] Deepgram Nova streaming WebSocket
   │  diarize=true, language=fr, interim_results
   │  → TranscriptSegment(text, speaker_id, start, end, confidence)
   ▼
[Claim extraction] claude-haiku-4-5
   │  triggered every MIN_WORDS new words or EXTRACT_INTERVAL s
   │  → Claim JSON (schema §5)
   ▼
[Server] FastAPI + WebSocket broadcast (localhost:8000)
   ▼
[UI] Single-page browser app, French strings
```

Notes:
- **ASR choice.** Deepgram streaming is used *for the prototype only* because it ships native streaming diarization with one WebSocket and free credits. This does **not** pre-empt ADR-07 (Speechmatics remains the MVP default candidate; benchmark still owed in Phase 0). Wrap the ASR behind a minimal `ASRStreamProvider` interface so the prototype can swap providers.
- Replaces v0 chunked Google STT (6 s blind chunks, no diarization) and gpt-4o-mini (violates model discipline rule 7).

## 4. Functional requirements

### Capture & session
- **PROTO-F-01** Start / stop listening with a single button; state visible at all times (REQ-F-02/F-03).
- **PROTO-F-02** Audio never leaves the device except as a stream to the ASR provider; no audio is written to disk. Transcript text only goes to the LLM. *(Project rule 5 — audio-to-ASR is the accepted prototype exception; flag it in the README.)*

### Transcription & diarization
- **PROTO-F-03** Live transcript displayed as segments, each tagged with a stable `speaker_id` (`spk_0`, `spk_1`, …) for the session (REQ-F-06).
- **PROTO-F-04** Support 2 speakers nominally, up to 4 tolerated. No speaker naming UI (V1 feature) — labels are «Locuteur 1», «Locuteur 2», …
- **PROTO-F-05** Interim (partial) transcripts may be shown dimmed; only finalized segments feed extraction.

### Claim extraction
- **PROTO-F-06** Extraction runs on a rolling window of finalized transcript, preserving per-segment speaker attribution, triggered every `MIN_WORDS` (default 50) new words or `EXTRACT_INTERVAL` (default 20 s).
- **PROTO-F-07** A claim is displayed only if **all four** criteria hold (spec 02 §3.3):
  1. **Déclarative** — states a fact, not a question/order/wish/feeling
  2. **Référentielle** — about an objective external state of the world, not an opinion
  3. **Vérifiable** — a real source could confirm or refute it
  4. **Précise** — contains numbers, dates, named entities, or places
- **PROTO-F-08** `verifiability_score < 0.6` → discarded, never displayed.
- **PROTO-F-09** Each claim carries the `speaker_id` of the segment containing its `raw_quote`.
- **PROTO-F-10** Deduplication: a claim whose `canonical` is near-identical to one already displayed is dropped.
- **PROTO-F-11** Model: `claude-haiku-4-5` (project rule 7 — extraction is Haiku, never Sonnet). Log model, tokens, latency_ms per call.

### Display
- **PROTO-F-12** Two panels: live transcript (left), claim cards (right), newest on top on the claims side.
- **PROTO-F-13** Claims are visually split by speaker (see §6): the user sees at a glance which claims belong to whom.

## 5. Data contracts

WebSocket messages (server → UI):

```jsonc
{ "type": "state",      "running": true }
{ "type": "status",     "text": "● En écoute", "color": "listening" }
{ "type": "transcript", "data": { "speaker_id": "spk_0", "text": "…", "final": true, "ts": "14:02:11" } }
{ "type": "claim",      "data": {
    "id": "uuid",
    "speaker_id": "spk_0",
    "raw_quote": "exact words from transcript",
    "canonical": "clean neutral declarative restatement",
    "category": "statistique|historique|citation|scientifique|juridique|geographique|autre",
    "score": 0.91,
    "ts": "14:02:19"
}}
```

UI → server: `{ "action": "start" | "stop" }`.

## 6. UI specification

Desktop browser page, dark theme (keep v0 base: bg `#0d0d1a`, text `#dde0ff`, accent `#7c6fff`). French strings only.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ PLUMB   Vérifiez ce qui se dit, à mesure.   ● En écoute  [⏸ Arrêter] │
├───────────────────────────┬──────────────────────────────┤
│ TRANSCRIPTION             │ AFFIRMATIONS À VÉRIFIER      │
│                           │                              │
│ ● Locuteur 1              │ ┌─● L1──────────┐            │
│   segment text… (left)    │ │ canonical      │            │
│                           │ │ "raw quote"    │            │
│              Locuteur 2 ● │ │ catégorie · ts │            │
│      (right) segment text │ └────────────────┘            │
│                           │            ┌──────────● L2─┐ │
│                           │            │ …             │ │
└───────────────────────────┴──────────────────────────────┘
```

- **Transcript panel:** chat-style — Locuteur 1 segments aligned left, Locuteur 2 aligned right (speakers 3–4 fall back to left-aligned with their color). Each segment: speaker dot + label + text.
- **Claims panel:** claim cards aligned to the same side as their speaker, with a 3 px left/right border in the speaker color. Card contents: `canonical` (bold), `raw_quote` (italic, quoted, dimmed), category chip + timestamp, speaker dot + label.

### Speaker colors (from spec 06 §2.3)

| Speaker | Color |
|---|---|
| Locuteur 1 | `oklch(0.62 0.10 250)` (bleu) |
| Locuteur 2 | `oklch(0.62 0.10 30)` (orangé) |
| Locuteur 3 | `oklch(0.55 0.005 280)` (gris froid) |
| Locuteur 4 | `oklch(0.62 0.10 145)` (vert, prototype-only extension) |

SpeakerDot: colored disc, white initial (L1…), 22 px, per spec 06 §SpeakerDot.

### French strings

«Vérifiez ce qui se dit, à mesure.» · «▶ Écouter» / «⏸ Arrêter» · «● En écoute» · «⏸ En pause» · «⟳ Transcription…» · «🔍 Analyse…» · «Transcription» · «Affirmations à vérifier» · «Locuteur N» · «En attente d'affirmations…» · «⚠ Erreur ASR (réseau ?)»

## 7. Configuration (`.env`)

| Variable | Default | Description |
|---|---|---|
| `DEEPGRAM_API_KEY` | — | Required. ASR streaming + diarization. |
| `ANTHROPIC_API_KEY` | — | Required. Claim extraction (Haiku). |
| `LANGUAGE` | `fr` | ASR language (`en` supported). |
| `MIN_WORDS` | `50` | New words buffered before extraction. |
| `EXTRACT_INTERVAL` | `20` | Min seconds between extractions. |
| `SCORE_THRESHOLD` | `0.6` | Min verifiability_score to display. |

All keys from env only — never hardcoded (rule 8).

## 8. Constraints inherited from project rules

- No verdicts anywhere in this prototype (no V1–V8, no OPINION labels).
- Extraction model is Haiku — never Sonnet (rule 7).
- UI strings French; code and comments English (rule 6).
- Audio bytes go only to the ASR provider; nothing else leaves the device (rule 5, prototype exception documented).

## 9. Delta from current v0 implementation

| Area | v0 (current) | v1 (this spec) |
|---|---|---|
| ASR | Google free STT, 6 s blind chunks | Deepgram streaming, continuous, interim results |
| Diarization | none | native (`diarize=true`), stable speaker_id |
| Extraction LLM | `gpt-4o-mini` | `claude-haiku-4-5` |
| Transcript UI | flat list | chat-style, per-speaker sides + colors |
| Claims UI | single column, no speaker | speaker-attributed, color-coded cards |
| Speaker in claim JSON | absent | `speaker_id` required |

## 10. Open questions

- Diarization stability across silence gaps (Deepgram may re-index speakers) — if unstable, add a simple embedding-based re-mapping or accept drift for the prototype.
- Whether the rolling window (25 utterances) is enough context for claims referencing earlier statements — tune during testing.
