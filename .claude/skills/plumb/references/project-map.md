# Project map — what exists and what does not

Last updated: 2026-09-15.

## Exists

| Path | What |
|---|---|
| `specs/01-cahier-des-charges.md`…`specs/06-design-system-ui.md` | The complete product + technical + design specs. Source of truth. |
| `CLAUDE.md` | Project constitution: rules, state, open decisions. |
| `.claude/skills/` | The harness: one skill per concern. |
| `.claude/agents/` | Sub-agents for isolated / parallel execution. |
| `.claude/commands/` | Slash commands for the orchestrator's routine moves. |
| `docs/ai-harness/` | Methodology, workflow, registry, task briefs, findings, decisions. |
| `docs/archive/` | Specs of the deleted prototypes. Reference only — never a source of truth. |

## Does not exist yet

`packages/back/pipeline/src/plumb_pipeline/`, `packages/back/server/`, `packages/front/` and `packages/back/pipeline/tests/` are **empty**. There is no code in this
repository. The two prototypes (`live_prototype`, `ui_prototype`) were deleted on 2026-09-15 by
decision: the harness comes first, the code is rebuilt from the specs afterwards.

Consequences for any agent:
- Never "extend the existing implementation" — there is none. Write the module in full.
- Never import from `r_and_d/`, `prototypes/`, `fact_checker_rd` — those paths are gone.
- The first module of a stage also creates that stage's tests in `packages/back/pipeline/tests/`.

## Lessons kept from the deleted prototypes

1. Deepgram streaming with `diarize=true` gave stable enough speaker IDs for a 2-person
   conversation, but re-indexed speakers across long silences. Any Stage 2 implementation needs a
   speaker-id stabilization layer, and the ASR must sit behind an `ASRStreamProvider` interface so
   the D-02 decision stays reversible.
2. Triggering extraction on "every N new words or T seconds" (50 words / 20 s) worked better than
   fixed-size chunks. Keep it configurable.
3. The prototype drifted to the OpenAI SDK and `gpt-4o-mini`, violating rule 7, and it was not
   caught for weeks. That is exactly what `plumb-review` and guardrail G-7 exist to prevent.
4. A four-criteria filter (declarative · world-referential · verifiable · specific) is the right
   shape for the extraction prompt — it maps to `specs/02-architecture-technique.md` §3.3.

## Naming

The product is **Plumb**. `VeriLive` in `specs/README.md` is the abandoned working title; treat
any occurrence as legacy. Do not rename spec files to fix it — note it, keep going.
