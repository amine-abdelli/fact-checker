---
name: plumb
description: Entry point and router for the Plumb real-time fact-checker project. Use for ANY request about Plumb — building or fixing a pipeline stage (audio, ASR, claim extraction, verification, summaries), the NestJS server, the UI, reviewing code against the specs, researching a technical option, resolving an open decision, or asking what to work on next. Triggers on plumb, fact-checker, fact checking, claim, verdict, V1-V8, diarization, Deepgram, Speechmatics, stage 3, stage 4, stage 3bis, verifier, summarizer, harness. Start here, then follow the routing table to the specialized skill.
---

# Plumb — project router

Plumb listens to a live conversation or stream, extracts factual claims, verifies them against
tiered sources, and returns one of 8 graded verdicts with a confidence level. UI is French.

**Read `CLAUDE.md` at the repo root before anything else.** It holds the 8 non-negotiable rules,
the current state, and the open decisions. This skill assumes you have.

---

## 1. Route the request

| The request is about… | Use this skill | Spec to read |
|---|---|---|
| Audio capture, ASR, diarization, speaker IDs | `plumb-capture` | `specs/02-architecture-technique.md` §3.1, §3.2 |
| Detecting / categorizing claims in a transcript | `plumb-claims` | `specs/02-architecture-technique.md` §3.3 |
| Search, sources, verdicts, confidence, guardrails | `plumb-verify` | `specs/02-architecture-technique.md` §3.4 + `specs/03-modele-fiabilite-sources.md` (full) |
| TL;DR / normal / detailed summaries | `plumb-summaries` | `specs/02-architecture-technique.md` §3.5 |
| WebSocket events, REST, persistence, sessions | `plumb-server` | `specs/02-architecture-technique.md` §3.6, §4 |
| Screens, components, colors, French labels | `plumb-ui` | `specs/06-design-system-ui.md` (full) |
| "Is this correct / does it follow the spec?" | `plumb-review` | the spec of the file under review |
| "Which option should we use?" / benchmarks | `plumb-research` | `specs/02-architecture-technique.md` §2 (existing ADRs) |
| Adding a skill, agent, or task brief | `plumb-harness` | `docs/ai-harness/` |
| The throwaway PWA prototype (recording, live display) | `plumb-proto` | `packages/prototype-pwa/README.md` |

If the request spans several stages, do them one at a time in pipeline order, reviewing each
before moving on. Never build two stages in a single pass.

Three packages, three lifetimes — know which one you are in before you write a line:
`packages/prototype-pwa` is throwaway and deliberately rough, `packages/back` and `packages/front`
are production and follow every rule. Never mix them, in either direction.

---

## 2. Before writing code — the four checks

1. **Is the work blocked by an open decision?** Check `CLAUDE.md` § Open decisions.
   D-01 blocks the UI and the capture strategy, D-02 blocks Stage 2, D-03 blocks Stage 4b.
   Blocked → run `plumb-research` first and say so, do not guess the decision.
2. **Does a task brief exist?** `docs/ai-harness/tasks/`. If yes, follow it. If no, write one first
   (`/plumb-task`) — it is what makes the output reviewable.
3. **Did you read the spec section?** Not a summary of it — the actual section.
4. **Do you know the contract?** Input and output shapes live in
   `references/contracts.md`. Stages talk to each other only through these.

---

## 3. Build loop

```
DEFINE     pick / write the task brief            docs/ai-harness/tasks/
BRIEF      hand it to the specialized skill       .claude/skills/plumb-*
IMPLEMENT  read spec → write module → self-check  packages/...
REVIEW     plumb-review (or the reviewer agent)   PASS / PASS WITH NOTES / REVISE
INTEGRATE  only on PASS or PASS WITH NOTES
```

Two revision rounds are normal. A third means the brief is wrong, not the agent — rewrite the brief.

For anything longer than a single module, spawn the matching sub-agent from `.claude/agents/`
so the main context stays clean, then review its output yourself.

---

## 4. Rules that apply to every skill

`references/guardrails.md` is the enforcement checklist. The short version:

- 8 verdict codes only: `V1 V2 V3 V4 V5 V6 V7 V8` + `OPINION`.
- `len(sources) < 2` → `V8`, whatever the LLM answered.
- `V6` on a named person without `HIGH` confidence → downgrade.
- Audio bytes go to the ASR provider and nowhere else.
- French user-facing strings, exactly as written in `specs/06-design-system-ui.md` §11.
- Haiku for extraction / decomposition / short summaries, Sonnet for synthesis / detailed summaries.
- Secrets from environment variables only.

---

## 5. Reporting back

Finish every task with, in this order:

1. What was built or changed, in two sentences.
2. The files written, with paths.
3. Which spec sections were applied.
4. Open questions or decisions Amine needs to make — or "none".

Do not paste whole files into the conversation; write them to disk and point at them.

---

## References

- `references/project-map.md` — what exists, what does not, where everything lives.
- `references/contracts.md` — the event and data contracts between stages.
- `references/guardrails.md` — the enforcement checklist used by every skill and by review.
- `references/verdicts.md` — the 8 verdicts, confidence levels, source tiers, in one page.
