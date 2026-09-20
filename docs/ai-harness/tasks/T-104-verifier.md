# T-104 — Stage 4: fact verification
**Skill:** plumb-verify · **Agent:** fact-verifier · **Blocked by:** D-03, T-103

Build as four separate tasks, reviewed one by one. Do not merge them into one pass.

## T-104a — query decomposition (Haiku)
`canonical` + `category` → 1–3 targeted queries and the expected source type.
- [ ] Category-aware query shaping · [ ] no network call for `opinion` inputs · [ ] plumb-review PASS

## T-104b — multi-source search (`SearchProvider`)
Parallel search, 5–10 documents, domain scored against the tier table (`specs/03-modele-fiabilite-sources.md` §4), forbidden
zone (§7) filtered out.
- [ ] Provider behind an interface, chosen by `SEARCH_PROVIDER` · [ ] provenance kept · [ ] plumb-review PASS

## T-104c — read + synthesize (Sonnet)
Fetch top results, pass to `claude-sonnet-4-6` under a strict schema, get verdict + confidence +
both explanations + a supporting excerpt per source.
- [ ] Verdict validated against the V1–V8 enum at the boundary (invalid → raise)
- [ ] Source without a verifiable excerpt is dropped · [ ] plumb-review PASS

## T-104d — post-LLM guardrails
Deterministic, in order: `sources < 2` → V8 · `V6` + named person + confidence ≠ HIGH → downgrade ·
T1 contradiction → V4 · stale-claim flag.
- [ ] One unit test per guardrail · [ ] guardrails run on every verdict including HIGH-confidence ones
- [ ] Re-run of guardrail 1 after excerpt-based source dropping · [ ] plumb-review PASS

## Read first
`specs/02-architecture-technique.md` §3.4 · the whole of `specs/03-modele-fiabilite-sources.md` · `specs/05-ethique-risques-juridique.md` R-01 and R-02 ·
`.claude/skills/plumb/references/verdicts.md`
