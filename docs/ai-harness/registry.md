# Registry — skills, agents, commands

**Status legend:** `ready` = written, never used yet · `proven` = produced a first-pass PASS ·
`needs work` = required 3+ revisions, guardrail added.

## Skills (`.claude/skills/`)

| Skill | Scope | Status |
|---|---|---|
| `plumb` | Router + project context + shared references | ready |
| `plumb-capture` | Stages 1–2: audio capture, ASR, diarization | ready |
| `plumb-claims` | Stage 3: claim extraction | ready |
| `plumb-verify` | Stage 4: search, synthesis, verdicts, guardrails | ready |
| `plumb-summaries` | Stage 3bis: TL;DR / normal / detailed | ready |
| `plumb-server` | Stage 5: NestJS relay, REST, persistence | ready |
| `plumb-ui` | Frontend + design system fidelity | ready |
| `plumb-review` | Spec-compliance review | ready |
| `plumb-research` | Research spikes → findings → ADRs | ready |
| `plumb-proto` | Throwaway PWA prototype: recording + live claim display | ready |
| `plumb-harness` | Maintaining the harness itself | ready |

Shared references live in `.claude/skills/plumb/references/`:
`project-map.md`, `contracts.md`, `guardrails.md`, `verdicts.md`.

## Agents (`.claude/agents/`)

| Agent | Skill it loads | Owns |
|---|---|---|
| `capture-engineer` | `plumb-capture` | `packages/back/pipeline/src/plumb_pipeline/audio.py`, `transcriber.py`, `asr/` |
| `claim-extractor` | `plumb-claims` | `packages/back/pipeline/src/plumb_pipeline/claims.py` |
| `fact-verifier` | `plumb-verify` | `packages/back/pipeline/src/plumb_pipeline/verifier.py`, `search/` |
| `summarizer` | `plumb-summaries` | `packages/back/pipeline/src/plumb_pipeline/summarizer.py` |
| `server-engineer` | `plumb-server` | `packages/back/server/` |
| `frontend-engineer` | `plumb-ui` | `packages/front/` |
| `reviewer` | `plumb-review` | nothing — judges only |
| `proto-engineer` | `plumb-proto` | `packages/prototype-pwa/` |
| `researcher` | `plumb-research` | `docs/ai-harness/findings/`, `decisions/` |

## Commands (`.claude/commands/`)

| Command | What it does |
|---|---|
| `/plumb-status` | State of the project and the next unblocked task |
| `/plumb-task` | Write a task brief into the backlog |
| `/plumb-review` | Review a file or diff against the specs |
| `/plumb-research` | Run a spike, produce a finding and a draft ADR |
| `/plumb-adr` | Record a decision for sign-off |
