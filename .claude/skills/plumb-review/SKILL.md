---
name: plumb-review
description: Review any Plumb file, diff or agent output against the specs and the project guardrails. Use when the user says review, check, audit, is this right, does this follow the spec, before I merge, or right after any module is produced and before it is integrated. Returns a structured PASS / PASS WITH NOTES / REVISE verdict with line-referenced issues.
---

# Spec-compliance review

Review is not a formality. Nothing is integrated without it, including work you wrote yourself.

## Procedure

1. Read `CLAUDE.md` (the 8 rules) and `.claude/skills/plumb/references/guardrails.md`.
2. Identify which spec sections govern the file:

   | File | Spec |
   |---|---|
   | `packages/back/pipeline/src/plumb_pipeline/audio.py`, `transcriber.py` | `specs/02-architecture-technique.md` §3.1, §3.2 + REQ-NF-05 |
   | `packages/back/pipeline/src/plumb_pipeline/claims.py` | `specs/02-architecture-technique.md` §3.3 + REQ-F-10…12 |
   | `packages/back/pipeline/src/plumb_pipeline/verifier.py` | `specs/02-architecture-technique.md` §3.4 + `specs/03-modele-fiabilite-sources.md` (full) + `specs/05-ethique-risques-juridique.md` R-01, R-02 |
   | `packages/back/pipeline/src/plumb_pipeline/summarizer.py` | `specs/02-architecture-technique.md` §3.5 + REQ-F-23…30 |
   | `packages/back/server/**` | `specs/02-architecture-technique.md` §3.6, §4 |
   | `packages/front/**` | `specs/06-design-system-ui.md` (full, exact values) + REQ-F-19…22 |

3. Read those sections. Then read the file. In that order — reviewing from memory of the spec is
   how a guardrail gets waved through.
4. Check the contract in `.claude/skills/plumb/references/contracts.md` field by field.
5. Run the hard-blocker list. Any hit → REVISE, no negotiation.

## Hard blockers (auto-REVISE)

- G-1 verdict value outside `V1`–`V8` / `OPINION`
- G-2 fewer than 2 sources and the verdict is not `V8`
- G-3 `V6` on a named person without `HIGH` confidence and no downgrade
- G-4 audio bytes sent anywhere but the ASR provider
- G-5 hardcoded key or credential
- G-6 non-French user-facing string, or one that does not match `specs/06-design-system-ui.md` §11
- G-7 wrong model for the stage (rule 7)
- G-8 summary without the REQ-F-30 disclaimer
- G-9 code contradicting an ADR with no new ADR opened

## Output format — use exactly this

```
## Review: <path>
**Verdict:** PASS | PASS WITH NOTES | REVISE

### Spec sections consulted
- specs/XX §Y

### Blockers
**[G-n] <file>:<line>** — what the spec requires → what the code does → the fix
(or: none)

### Notes
**<file>:<line>** — issue → suggestion
(or: none)

### What's solid
One or two sentences. Be specific; generic praise teaches nothing.
```

## Calibration

- `PASS` — no blockers, integrate now.
- `PASS WITH NOTES` — no blockers; the notes are fixed before the milestone closes.
- `REVISE` — at least one blocker; it does not get merged, and it gets re-reviewed after the fix.

Do not soften a verdict because the work is nearly right, and do not pad the blocker list with
style preferences — a note that is not a spec violation is a note.
