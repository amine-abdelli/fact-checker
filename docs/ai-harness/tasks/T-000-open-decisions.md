# T-000 — Resolve the three open decisions
**Skill:** plumb-research · **Agent:** researcher · **Blocked by:** nothing — run first

## Goal
Three decisions are blocking Phase 1. Each ends as an ADR in `specs/02-architecture-technique.md` §2, signed by Amine.

## D-01 — Platform target for the MVP
Tauri · SwiftUI · Next.js. Decides the UI stack and how system audio and live streams are captured.
`specs/04-roadmap.md` recommends desktop macOS. Spike: **RND-03**.
Criteria: system-audio capture on macOS 14+, live-stream ingestion, distribution and updates,
development velocity for one developer, path to mobile later.
- [ ] finding written · [ ] ADR drafted · [ ] signed → ADR-__ in `specs/02-architecture-technique.md` §2

## D-02 — ASR provider
Deepgram Nova vs Speechmatics, under ADR-07 (FR + EN at launch, single multilingual provider).
Spike: **RND-01**. Criteria: French WER, diarization stability across silences, streaming latency,
cost per hour, data-residency terms.
- [ ] finding · [ ] ADR drafted · [ ] signed → ADR-__

## D-03 — Search API for Stage 4b
Brave vs Tavily vs SerpAPI. Spike: **RND-02**. Criteria: freshness under 24 h, snippet and
full-text quality, domain filtering (needed for the tier model), cost per 1 000 queries, rate limits.
- [ ] finding · [ ] ADR drafted · [ ] signed → ADR-__

## Acceptance criteria
- [ ] Three findings in `docs/ai-harness/findings/`, each with cited, dated sources
- [ ] Three ADRs drafted in `docs/ai-harness/decisions/`
- [ ] `CLAUDE.md` open-decisions table updated once each is signed
