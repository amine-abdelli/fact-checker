# T-105 — Stage 3bis: incremental summaries
**Skill:** plumb-summaries · **Agent:** summarizer · **Blocked by:** T-102 (runs parallel to T-104)

## Goal
`packages/back/pipeline/src/plumb_pipeline/summarizer.py` produces TL;DR, normal and detailed summaries on their own cadences,
enriched with verdicts when available, never blocking on them.

## Read first
`specs/02-architecture-technique.md` §3.5 · `specs/01-cahier-des-charges.md` §5.6 (REQ-F-23…F-30) · `.claude/skills/plumb/references/contracts.md`

## Acceptance criteria
- [ ] Exact REQ-F-30 disclaimer in every emission, all three levels — asserted in a test
- [ ] Transcript under 30 s or 50 words → nothing emitted, skip reason logged
- [ ] Haiku for tldr/normal, Sonnet for detailed — asserted, not intended
- [ ] `summarize_now` regenerates any level on demand
- [ ] Verdict enrichment applies to a summary generated before the verdict arrived
- [ ] Cadence timers do not drift over a 1 h session
- [ ] plumb-review: PASS
