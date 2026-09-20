---
name: plumb-research
description: Run a research spike for Plumb and turn it into a decision. Use when the user asks which option to use, to compare providers or APIs, to benchmark, what something costs, or when an open decision (D-01 platform, D-02 ASR provider, D-03 search API) blocks the work. Produces a findings document and a proposed ADR, never silent guesses.
---

# Research spike → finding → ADR

A research spike ends in a written recommendation Amine can accept or reject. It never ends in
code, and it never ends in "it depends".

## Procedure

1. Read `specs/02-architecture-technique.md` §2 first. If an ADR already answers the question,
   stop and say « déjà tranché : ADR-XX ». Do not re-open a decision by accident.
2. Read `docs/ai-harness/findings/` — the spike may already exist.
3. Search the web. Current facts only: pricing pages, official docs, dated benchmarks, changelogs.
   Never quote a price, a model name, a latency number or a rate limit from memory.
4. Compare on the criteria that actually bind Plumb — not on a generic feature matrix:
   latency, French-language quality, cost per hour of audio or per 1 000 queries, data residency
   and privacy terms, vendor lock-in, and whether the choice is reversible behind our interfaces.
5. Write the finding to `docs/ai-harness/findings/<slug>.md` using the template below.
6. If it resolves an open decision, also draft the ADR in `docs/ai-harness/decisions/ADR-XX.md`
   and tell Amine it is waiting for his sign-off. **Only he moves it into `specs/02-architecture-technique.md` §2.**
7. Summarize the recommendation in the conversation in five lines. Do not make him open the file
   to learn the answer.

## Finding template

```markdown
# Research: <question>

**Date:** YYYY-MM-DD · **Status:** finding | decision pending | superseded by ADR-XX
**Blocks:** D-0X (or: nothing)

## Question
One precise sentence.

## Why it matters for Plumb
Link to the spec section or ADR it feeds.

## Options

| Option | <criterion 1> | <criterion 2> | Cost | Lock-in |
|---|---|---|---|---|

### Option A — <name>
What it is · fit for Plumb · risks · cost basis (with the source of the number)

## Recommendation
**Use <X>** — three sentences grounded in the numbers above. If a benchmark is needed before
deciding, say that explicitly and describe the benchmark in one paragraph.

## Caveats
What stays uncertain, and what would change the answer.

## Sources
- URL — accessed YYYY-MM-DD
```

## Standing spikes

| Id | Question | Decision |
|---|---|---|
| RND-01 | Deepgram Nova vs Speechmatics for FR + EN live ASR: WER, diarization stability, streaming latency, cost/hour | D-02 |
| RND-02 | Brave vs Tavily vs SerpAPI for fact-checking retrieval: freshness, snippet quality, domain filtering, cost/1k | D-03 |
| RND-03 | Tauri vs SwiftUI vs Next.js: system-audio capture on macOS 14+, live-stream ingestion, distribution, dev velocity | D-01 |
| RND-04 | Real cost per session-hour with Haiku extraction + Sonnet synthesis at MVP volume | budget |

## Rules

- A benchmark number without a citation is not a finding.
- If the result contradicts an existing ADR, flag it loudly as a contradiction. Never edit `specs/`
  to make it fit.
- Cost estimates state their assumptions (claims per hour, tokens per claim) — a number without its
  assumptions cannot be re-checked in six months.
