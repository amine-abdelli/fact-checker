# T-012 — Prototype: real-time display and measurement
**Skill:** plumb-proto · **Agent:** proto-engineer · **Blocked by:** T-011

## Goal
The PWA shows the transcript and the claims as they happen, attributed by speaker, and the five
success criteria are measured on a real conversation.

## Deliverables
- Two panes: live transcript (chat style, one side per speaker, interim segments dimmed) and claim
  cards (newest first, speaker-coloured, `canonical` + quoted `raw_quote` + category + timestamp)
- A visible latency readout: time between the end of the spoken sentence and the card appearing
- `docs/ai-harness/findings/pwa-prototype.md` — the finding

## Acceptance criteria
- [ ] Sentence → claim card in ≤ 15 s, measured over at least 20 claims (report the median and the worst)
- [ ] ≥ 80 % of displayed claims genuinely fact-checkable, ≤ 1 obvious non-claim per 10 min
- [ ] Speaker attribution ≥ 85 % correct on a two-person conversation
- [ ] A first-time viewer can tell who said what without explanation
- [ ] Finding written: what worked, real latency numbers, which contract field turned out wrong,
      what the production pipeline should do differently
- [ ] Amine decides whether the prototype is deleted or kept a while longer
