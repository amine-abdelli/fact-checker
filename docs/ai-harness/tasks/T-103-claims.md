# T-103 — Stage 3: claim extraction
**Skill:** plumb-claims · **Agent:** claim-extractor · **Blocked by:** T-102

## Goal
`packages/back/pipeline/src/plumb_pipeline/claims.py` turns a rolling window of final transcript segments into `Claim` objects
using `claude-haiku-4-5` and the four-criteria filter.

## Read first
- `specs/02-architecture-technique.md` §3.3 · `specs/01-cahier-des-charges.md` §5.3 (REQ-F-10…F-12)
- `.claude/skills/plumb-claims/references/extraction-prompt.md`

## Deliverables
- `packages/back/pipeline/src/plumb_pipeline/claims.py`
- `packages/back/pipeline/tests/test_claims.py` with a fixture transcript containing small talk, one opinion, two claims

## Acceptance criteria
- [ ] Output matches the `Claim` contract, `category` validated against the nine-value enum
- [ ] Trigger on `MIN_WORDS` or `EXTRACT_INTERVAL`, both configurable
- [ ] `raw_quote` verified verbatim against the transcript in code; non-matching claims dropped
- [ ] Opinions emitted with `verifiability_score = 0.0`
- [ ] Session-wide deduplication of near-identical `canonical` values
- [ ] LLM failure re-queues the window instead of losing it; every call logged
- [ ] plumb-review: PASS
