---
name: plumb-summaries
description: Build or fix Stage 3bis of the Plumb pipeline — incremental conversation summaries at three levels (TL;DR, normal, detailed). Use for anything about summary generation, refresh cadence, rolling transcript buffers, topic segmentation, the mandatory REQ-F-30 disclaimer, summarize_now, or citing verdicts inside a summary.
---

# Stage 3bis — Incremental summaries

Output file: `packages/back/pipeline/src/plumb_pipeline/summarizer.py`.

Runs **in parallel** with Stages 3 and 4. It never blocks on verdicts; it enriches the summary with
them when they happen to be available.

## Read first

1. `CLAUDE.md` — rule 7 (Haiku for tldr/normal, Sonnet for detailed).
2. `specs/02-architecture-technique.md` §3.5 — the stage spec.
3. `specs/01-cahier-des-charges.md` §5.6 — REQ-F-23 to REQ-F-30, all eight of them.
4. `.claude/skills/plumb/references/contracts.md` — the `Summary` payload.

## The three levels

| Level | Length | Model | Refresh | Input |
|---|---|---|---|---|
| `tldr` | 1–3 sentences | `claude-haiku-4-5` | every 2 min | rolling ~5 min buffer |
| `normal` | 5–10 sentences | `claude-haiku-4-5` | every 5 min | full session, truncated past 50 min |
| `detailed` | structured by topic | `claude-sonnet-4-6` | every 10 min or on topic shift | full session |

`detailed.text` is a dict: `{ "intro": str, "topics": [{ "title", "lead", "claims": [claim_id] }] }`.

Any level can be regenerated immediately on a `summarize_now` action.

## Non-negotiable

- **Every** emitted summary carries the exact REQ-F-30 disclaimer string (see `contracts.md`).
  A summary without it is a hard blocker (G-8).
- Transcript shorter than 30 s or 50 words → emit nothing, log the skip reason.
- Never fabricate a claim, a speaker or a figure that is not in the transcript. A summary is a
  compression of what was said, not an analysis of whether it was true.
- When a summarized claim has a known verdict, cite it:
  « M. X a affirmé que Y, ce qui s'est révélé [nom du verdict]. » Use the French verdict name, and
  only when the verdict is actually known — never "en attente de vérification" as filler.
- Session language (`fr` by default) for the output; English instructions in the prompt.
- Regeneration is idempotent per level: a new summary at a level replaces the previous one in the
  UI, it does not stack.

## Cost control

Summaries are the quiet budget leak: they re-read the whole session on every refresh. Cache the
previous summary and pass it with the delta transcript rather than the whole session where the
level allows it. Log `level, input_tokens, output_tokens, latency_ms` on every call.

## Done when

- [ ] Disclaimer present in every emission — asserted in a test that iterates all three levels.
- [ ] Short-transcript guard emits nothing.
- [ ] The three levels produce visibly different outputs on the same fixture.
- [ ] Verdict enrichment works when a verdict arrives after the summary was first generated.
- [ ] Cadence timers are configurable and do not drift over a 1 h session.
- [ ] `packages/back/pipeline/tests/test_summarizer.py` covers all of the above.
