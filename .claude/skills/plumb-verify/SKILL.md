---
name: plumb-verify
description: Build or fix Stage 4 of the Plumb pipeline — fact verification. Use for anything about query decomposition, web search (Brave, Tavily, SerpAPI), fetching and reading sources, source tiers T1-T4, verdict synthesis with Sonnet, the 8 verdicts V1-V8, confidence levels, post-LLM guardrails, forcing V8 when sources are thin, downgrading V6 on a named person, or defamation and hallucination risk in verdicts.
---

# Stage 4 — Fact verification

Output file: `packages/back/pipeline/src/plumb_pipeline/verifier.py` (+ `packages/back/pipeline/src/plumb_pipeline/search/<provider>.py` adapters).
This is the most critical stage in the product. A wrong verdict on a named person is a legal risk,
not a bug.

## Read first — all of it, not a summary

1. `CLAUDE.md` — rules 3, 4, 5, 7.
2. `specs/03-modele-fiabilite-sources.md` — **the whole file**. Verdict definitions (§2),
   confidence (§3), tiers (§4), method (§5), special cases (§6), domain lists (§7).
3. `specs/02-architecture-technique.md` §3.4 — sub-steps 4a–4d.
4. `specs/01-cahier-des-charges.md` §5.4 — REQ-F-13 to REQ-F-18.
5. `specs/05-ethique-risques-juridique.md` R-01 (diffamation) and R-02 (hallucinations).
6. `.claude/skills/plumb/references/verdicts.md` and `contracts.md`.

## Blocked by D-03

The search API is an open decision. Write 4b behind a `SearchProvider` interface with adapters in
`packages/back/pipeline/src/plumb_pipeline/search/`, chosen by `SEARCH_PROVIDER`. Do not couple the pipeline to one vendor.

## The four sub-steps — build them in this order, one task each

**4a — Query decomposition** (`claude-haiku-4-5`)
Turn `canonical` into 1–3 targeted search queries. Use `category` to shape them (a
`statistique_publique` claim searches the statistical office first, a `juridique` claim searches
the legal database). Output the queries plus the expected source type.

**4b — Multi-source search** (`SearchProvider`)
Run the queries in parallel. Target 5–10 documents. Score each result's domain against the tier
table in `specs/03-modele-fiabilite-sources.md` §4 and drop anything in the forbidden zone (§7). Keep provenance: url, title,
publisher, date.

**4c — Read and synthesize** (`claude-sonnet-4-6` — never downgrade this one)
Fetch the top results in full text, truncate sensibly, and pass them with the claim to Sonnet
under a strict structured output. The model returns a candidate verdict, confidence, both
explanations, and for each cited source the **exact excerpt** that supports the verdict. A source
without a supporting excerpt is not a source — drop it.

**4d — Post-LLM guardrails** (deterministic Python, mandatory, in this order)
1. `len(sources) < 2` → `V8`, explanations cleared.
2. `V6` + named person + confidence ≠ `HIGH` → downgrade to `V5` (or `V4` if sources conflict).
3. Contradiction between T1 sources → `V4`.
4. Claim > 5 years old and newest source < 2 years old → add obsolescence flag.

Guardrails run on every verdict, including the ones the LLM was confident about. They are code,
they are unit-tested, and they are never delegated to the prompt.

## Fast paths (no external call at all)

- `category == "opinion"` → emit the `OPINION` marker and return.
- `verifiability_score < 0.6` → emit `V8` and return.

## Hard requirements

- `verdict` accepts exactly `V1`…`V8`. Validate with an enum at the boundary — a Sonnet answer of
  `"MOSTLY_TRUE"` must raise, not silently map.
- Only `canonical` and its `context` go to external APIs. Never the audio, never the raw session,
  never the speaker's real name unless an explicit consent flag is set.
- Keys from env: `ANTHROPIC_API_KEY`, `SEARCH_API_KEY`.
- Log per sub-step: `claim_id, step, model, input_tokens, output_tokens, cost_eur, latency_ms`.
- Latency budget: ~30 s claim → verdict. Search and fetch run concurrently; a slow source is
  dropped, it does not extend the budget.

## Done when

- [ ] A property test asserts no output can carry a verdict outside the enum.
- [ ] Each of the four guardrails has its own unit test, including the `V6` downgrade.
- [ ] `opinion` and low-score inputs make zero network calls (asserted with a mocked client).
- [ ] Sonnet is used for 4c and Haiku for 4a — asserted in the test, not just intended.
- [ ] Every emitted source carries a non-empty supporting `quote`.
- [ ] `plumb-review` returns PASS.

See `references/synthesis-prompt.md` for the 4c prompt skeleton.
