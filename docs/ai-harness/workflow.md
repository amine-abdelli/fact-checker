# Workflow — Phase 1

## Rule of order

Stages are built in pipeline order, one at a time, each reviewed before the next starts. The two
exceptions: research spikes run first and in parallel, and Stage 3bis (summaries) is independent
of Stage 4 and can run alongside it.

## Phase 0.5 — the prototype, first

Before the production pipeline, the throwaway PWA answers two questions: does continuous browser
recording hold, and does real-time claim display feel live? It runs in parallel with the research
spikes, because neither blocks the other.

| Step | Task brief | Skill / agent | Blocked by |
|---|---|---|---|
| P0-A | `T-010-proto-recording.md` | `plumb-proto` / `proto-engineer` | nothing |
| P0-B | `T-011-proto-server.md` | `plumb-proto` / `proto-engineer` | T-010 |
| P0-C | `T-012-proto-live-display.md` | `plumb-proto` / `proto-engineer` | T-011 |
| P0-D | finding written, prototype deleted | `plumb-research` | T-012 |

Exit: the five success criteria in the `plumb-proto` skill are **measured**, and
`docs/ai-harness/findings/pwa-prototype.md` exists.

## Phase 1 plan

| Step | Task brief | Skill / agent | Blocked by |
|---|---|---|---|
| P1-0 | `T-000-open-decisions.md` | `plumb-research` / `researcher` | nothing — run first |
| P1-1 | `T-101-capture.md` | `plumb-capture` / `capture-engineer` | D-01 (partially), D-02 |
| P1-2 | `T-102-transcriber.md` | `plumb-capture` / `capture-engineer` | D-02, P1-1 |
| P1-3 | `T-103-claims.md` | `plumb-claims` / `claim-extractor` | P1-2 |
| P1-4 | `T-104-verifier.md` (4a→4d, one task each) | `plumb-verify` / `fact-verifier` | D-03, P1-3 |
| P1-5 | `T-105-summarizer.md` | `plumb-summaries` / `summarizer` | P1-2 (parallel with P1-4) |
| P1-6 | `T-106-server.md` | `plumb-server` / `server-engineer` | P1-4, P1-5 |

## Phase 1 exit criteria

- A 5-minute French audio file runs end to end: transcript → claims → verdicts → summaries.
- Transcript → verdict latency under 60 s.
- 20 consecutive claims, zero verdict value outside V1–V8 / OPINION (automated check).
- Every guardrail in step 4d has a passing unit test.
- No hardcoded key anywhere; `ruff`, `mypy` and `pytest` clean.
- Every module has a `plumb-review` PASS recorded in its task brief.

## Phase 2 — after D-01 is an ADR

Frontend live feed → timeline (ADR-08) → SQLite persistence → summary screen → export.

## Phase 3

Gold test set of 100 annotated claims with macro-F1 measurement, ASR benchmark per language,
political bias audit (`specs/05-ethique-risques-juridique.md` §1 R-03), GDPR register and deletion flow, public methodology
page, closed beta with 5+ users.
