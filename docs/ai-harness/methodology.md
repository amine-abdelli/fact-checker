# AI Harness Engineering — methodology

## The idea

Claude skills and agents are the implementers. Amine is the orchestrator: he decides what gets
built, arbitrates the open decisions, reviews the output and integrates it. The specs are the
contract between the two.

What makes it work is not the model — it is that every unit of work has a **written brief**, a
**spec section it must satisfy**, and an **acceptance test**. Without those three, an agent
produces plausible code and nobody can say whether it is right.

## The loop

```
DEFINE     pick or write a brief            docs/ai-harness/tasks/
BRIEF      hand it to the matching skill    .claude/skills/plumb-*
IMPLEMENT  read spec → write → self-check   packages/
REVIEW     plumb-review                     PASS | PASS WITH NOTES | REVISE
INTEGRATE  merge on PASS / PASS WITH NOTES
```

Zero to two revision rounds is normal. Three means the brief was ambiguous — fix the brief or the
skill, not just the code. That correction is the part that compounds.

## Why Plumb fits this approach

The pipeline is five stages with explicit contracts between them. Each stage is a self-contained
module with one input shape and one output shape, so agents can work on different stages without
colliding, and a stage can be rewritten without touching its neighbours. The contracts are in
`.claude/skills/plumb/references/contracts.md` and they are the real architecture.

## Phases

| Phase | Content | State |
|---|---|---|
| 0 — Foundation | Specs 01–06, AI harness | ✅ done (harness rebuilt 2026-09-15) |
| 0.5 — Prototype | Throwaway PWA: continuous recording + real-time claim display | ▶ current |
| 1 — Core pipeline | Resolve D-01…D-03, then Stages 1→2→3→4→3bis→server | next |
| 2 — Production UI | Frontend, timeline (ADR-08), persistence, export | blocked by D-01 |
| 3 — Quality + public | Gold test set, bias audit, GDPR, beta | later |

## Guardrails

The eight rules in `CLAUDE.md` apply to every task. The enforcement checklist — including the nine
hard blockers — is `.claude/skills/plumb/references/guardrails.md`. They are enforced twice: by the
skill while building, and by `plumb-review` before integration.

## Keeping the harness sharp

After each milestone, ten minutes:

- A skill that produced a first-pass PASS → mark it proven in `registry.md`.
- A task that took 3+ revisions → add the missing guardrail to the skill, with a note on what went wrong.
- A new recurring task type → a new skill, not a longer existing one.
- A resolved decision → ADR into `specs/02-architecture-technique.md` §2, tick `tasks/T-000-open-decisions.md`, update `CLAUDE.md`.

The harness is supposed to look different in three months. If it does not, nobody is learning from
the revisions.
