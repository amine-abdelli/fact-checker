# CLAUDE.md — Plumb

## What this project is

**Plumb** is a real-time fact-checker. It listens to a live conversation or stream, separates
speakers, isolates factual claims, verifies them against tiered sources, and returns one of
**8 graded verdicts** with a confidence level, in ~30 s per claim.

- Tagline (FR, in-app): *« Vérifiez ce qui se dit, à mesure. »*
- It is **not** a lie detector. It verifies facts, never intentions.
- Product UI strings: **French**. Specs, code, comments, commit messages: **English**.

> The name `VeriLive` in `specs/README.md` is the old working title. The product is **Plumb**.

---

## Current state (2026-09-15)

| | |
|---|---|
| Specs | Complete — `specs/01-cahier-des-charges.md` … `specs/06-design-system-ui.md` |
| AI harness | Complete — `.claude/skills/`, `.claude/agents/`, `.claude/commands/` |
| Code | **None.** The three packages are scaffolded and empty. Prototypes were deleted on 2026-09-15. |
| Phase | Prototype first (`packages/prototype-pwa`), then Phase 1 — the pipeline, stage by stage |

Nothing is inherited from the old prototypes. Every module is written fresh from the specs.

---

## Read the specs before writing anything

`specs/` is the source of truth. Never write code without reading the relevant section first.

| File | Read when |
|---|---|
| `specs/01-cahier-des-charges.md` | Product requirements (REQ-F-xx / REQ-NF-xx), personas, MVP scope |
| `specs/02-architecture-technique.md` | Pipeline stages (§3.1–§3.6), ADR-01…08, data model (§4) |
| `specs/03-modele-fiabilite-sources.md` | The 8 verdicts, confidence, source tiers, verification method |
| `specs/04-roadmap.md` | Phases, milestones, exit criteria |
| `specs/05-ethique-risques-juridique.md` | R-01 diffamation, R-02 hallucinations, GDPR, AI Act |
| `specs/06-design-system-ui.md` | Tokens (OKLCH, px), components, screens, §11 exhaustive FR label list |

---

## Target architecture

Three packages, three lifetimes: a throwaway prototype, then the production back and front.

```
Microphone / System audio / Live stream
   │
   ├─[Stage 1]    Audio capture .............. audio.py       │
   ├─[Stage 2]    ASR + diarization .......... transcriber.py │  packages/back/pipeline
   ├─[Stage 3]    Claim extraction (Haiku) ... claims.py      │  (Python)
   ├─[Stage 4]    Fact verification (Sonnet) . verifier.py    │
   ├─[Stage 3bis] Incremental summaries ...... summarizer.py  │
   │
   ├─[Stage 5]    Relay: WebSocket + REST .... packages/back/server      (NestJS / TS)
   └─[UI]         Live feed, timeline ........ packages/front           (platform TBD — D-01)
```

Pipeline modules live in `packages/back/pipeline/src/plumb_pipeline/`, tests in
`packages/back/pipeline/tests/`.

**`packages/prototype-pwa/` is separate and disposable**: a PWA plus a small FastAPI server, built
first, to prove that continuous browser recording and real-time claim display actually work. It has
no verdicts, no design-system fidelity, and no import relationship with the two production
packages. When it has answered its question, it is deleted and what it taught is written into
`docs/ai-harness/findings/`.

Stage 3bis runs in parallel with Stages 3–4 and never blocks on verdicts.

---

## Open decisions (block the work that depends on them)

| # | Decision | Blocks | How to resolve |
|---|---|---|---|
| D-01 | Platform target (Tauri / SwiftUI / Next.js) | `packages/front/`, Stage 1 capture strategy | `/plumb-research` RND-03 → ADR-09 |
| D-02 | ASR provider (Deepgram vs Speechmatics) | Stage 2 | `/plumb-research` RND-01 → ADR-10 |
| D-03 | Search API (Brave / Tavily / SerpAPI) | Stage 4 step 4b | `/plumb-research` RND-02 → ADR-11 |

A decision is only "made" once it is written as an ADR in `specs/02-architecture-technique.md` §2
and the matching line in `docs/ai-harness/tasks/T-000-open-decisions.md` is ticked.

---

## The 8 non-negotiable rules

1. **Spec first.** Read the relevant `specs/` section before writing a line.
2. **ADRs are binding.** Never contradict one silently. Disagree → open a new ADR.
3. **8 verdicts, immutable.** `V1 V2 V3 V4 V5 V6 V7 V8` + `OPINION`. No other key, ever, anywhere.
4. **Prudence.** `len(sources) < 2` → force `V8`. `V6` + named person + confidence ≠ `HIGH` → downgrade.
5. **No audio leaves the device** except the stream to the ASR provider. LLMs and search get text only.
6. **French UI strings**, matching `specs/06-design-system-ui.md` §11 exactly. Code and comments in English.
7. **Model discipline.** Extraction / query decomposition / TL;DR + normal summaries → `claude-haiku-4-5`.
   Verification synthesis + detailed summaries → `claude-sonnet-4-6`. Never swap.
8. **Secrets from env only.** `ANTHROPIC_API_KEY`, ASR and search keys. Never hardcoded, never committed.

Rule 3, 4, 5, 7 and 8 violations are **hard blockers** at review — the work is not integrated.

---

## How work gets done: AI Harness Engineering

Amine is the orchestrator. Claude skills and agents implement. The loop:

```
DEFINE → BRIEF → IMPLEMENT → REVIEW → INTEGRATE
```

Everything runs through `.claude/skills/`. The entry point is the **`plumb`** skill, which routes
any request to the right specialized skill.

| Skill | Scope |
|---|---|
| `plumb` | Router + project context. Start here for any Plumb request. |
| `plumb-capture` | Stages 1–2 — audio capture, ASR, diarization |
| `plumb-claims` | Stage 3 — claim extraction |
| `plumb-verify` | Stage 4 — search, synthesis, verdicts, guardrails |
| `plumb-summaries` | Stage 3bis — TL;DR / normal / detailed summaries |
| `plumb-server` | Stage 5 — NestJS gateway, REST, SQLite persistence |
| `plumb-ui` | Frontend + design system fidelity |
| `plumb-review` | Spec-compliance review, PASS / PASS WITH NOTES / REVISE |
| `plumb-research` | Research spikes → findings → ADR proposals |
| `plumb-proto` | The throwaway PWA prototype: recording + live claim display |
| `plumb-harness` | Maintain the harness itself (new skills, agents, task briefs) |

Slash commands: `/plumb-status`, `/plumb-task`, `/plumb-review`, `/plumb-research`, `/plumb-adr`.

Sub-agents in `.claude/agents/` are the same roles for parallel/isolated execution.

---

## Folder structure

```
fact_checker/
├── CLAUDE.md                  ← you are here
├── pnpm-workspace.yaml        ← JS/TS workspace members
├── specs/                     ← source of truth (01–06)
├── packages/
│   ├── prototype-pwa/         ← THROWAWAY: web/ (PWA) + server/ (FastAPI)
│   ├── back/
│   │   ├── pipeline/          ← Python stages 1–4 + 3bis (src/plumb_pipeline/, tests/)
│   │   └── server/            ← NestJS relay
│   └── front/                 ← production UI (platform TBD)
├── docs/
│   ├── ai-harness/            ← methodology, workflow, registry, tasks, findings, decisions
│   └── archive/               ← dead prototypes' specs, kept for reference only
└── .claude/
    ├── skills/                ← the harness (SKILL.md files)
    ├── agents/                ← sub-agent definitions
    ├── commands/              ← slash commands
    └── settings.local.json
```

`front`, `back/server` and `prototype-pwa/web` are pnpm workspace members. The Python packages
(`back/pipeline`, `prototype-pwa/server`) keep their own virtualenv — pnpm does not manage them.

## Conventions

- Python ≥ 3.11, type hints everywhere, `ruff` + `mypy` clean, dataclasses for event payloads.
- One module = one pipeline stage = one clear input/output contract (`.claude/skills/plumb/references/contracts.md`).
- Every LLM call is logged: `component, model, input_tokens, output_tokens, latency_ms, cost_eur`.
- No new top-level module without an entry in `docs/ai-harness/tasks/`.
- The prototype never imports from `back/` or `front/`, and neither ever imports from it.
- `.env.keys.bak` at the repo root holds the old prototype API keys — move them into your own `.env`, never commit either.
