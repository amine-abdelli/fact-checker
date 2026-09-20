---
name: plumb-claims
description: Build or improve Stage 3 of the Plumb pipeline — LLM claim extraction from a live transcript. Use when the task involves detecting fact-checkable claims, the four-criteria filter (declarative, world-referential, verifiable, specific), claim categorization, canonical restatement, verifiability_score, deduplication, the extraction trigger window, or the Haiku extraction prompt.
---

# Stage 3 — Claim extraction

Output file: `packages/back/pipeline/src/plumb_pipeline/claims.py`. Prompt lives in `references/extraction-prompt.md`.

## Read first

1. `CLAUDE.md` — rule 7 (extraction is **Haiku**, never Sonnet) and rule 5.
2. `specs/02-architecture-technique.md` §3.3 — the stage spec, including the category enum.
3. `specs/01-cahier-des-charges.md` §5.3 — REQ-F-10 to REQ-F-12.
4. `.claude/skills/plumb/references/contracts.md` — `TranscriptSegment` in, `Claim` out.

## What this stage does

Consumes a rolling window of **final** transcript segments and emits `Claim` objects.

- Trigger: every `MIN_WORDS` new words (default 50) **or** `EXTRACT_INTERVAL` seconds (default 20),
  whichever comes first. Both configurable through env.
- Window: the last ~25 final segments, so a claim can reference something said earlier.
- Model: `claude-haiku-4-5`. Target latency < 3 s per batch.
- Each claim keeps the `speaker_id` of the segment its `raw_quote` came from. Never infer a speaker.
- `canonical` is a neutral declarative restatement — it is the text that Stage 4 will verify, so it
  must be self-contained (resolve "il", "là-bas", "l'année dernière" using the context).

## The four criteria (all must hold)

1. **Declarative** — states a fact, not a question, order, wish or feeling.
2. **World-referential** — an objective external state of the world, not an opinion.
3. **Verifiable** — a real source (statistics, papers, legal records) could confirm or refute it.
4. **Specific** — contains numbers, dates, named entities, places or percentages.

Opinions are **not discarded**: emit them with `category="opinion"` and `verifiability_score=0.0`.
The UI shows them in italics; the verifier skips them without any external call.

## Hard requirements

- `verifiability_score < 0.6` → still emitted, flagged; Stage 4 turns it into `V8` without searching.
- Deduplication: a `canonical` near-identical to an already-emitted claim in the session is dropped
  (normalized string similarity; log the drop).
- Never invent a speaker, a timestamp or a quote. `raw_quote` must appear verbatim in the transcript
  — verify it programmatically before emitting, and drop the claim if it does not.
- LLM failure → log it and skip the window; never crash the pipeline, never silently lose segments
  (re-queue them into the next window).
- Log every call: `component="claims", model, input_tokens, output_tokens, latency_ms`.

## Done when

- [ ] Output matches the `Claim` contract field for field, including `state="extracted"`.
- [ ] `category` is one of the nine values in `specs/02-architecture-technique.md` §3.3 — validated, not trusted.
- [ ] `raw_quote` verbatim check implemented.
- [ ] Opinions pass through with score 0.0.
- [ ] Dedup works across the whole session, not just the current window.
- [ ] `ANTHROPIC_API_KEY` from env; model id is `claude-haiku-4-5`.
- [ ] `packages/back/pipeline/tests/test_claims.py` includes a fixture transcript with small talk, an opinion, and two real
      claims, and asserts exactly the expected output.
