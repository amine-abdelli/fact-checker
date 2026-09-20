# T-011 — Prototype: FastAPI server, ASR + claim extraction
**Skill:** plumb-proto · **Agent:** proto-engineer · **Blocked by:** T-010

## Goal
`packages/prototype-pwa/server` receives PCM over WebSocket, transcribes with diarization, extracts
claims with Haiku, and broadcasts `transcript` and `claim` events.

## Read first
- `specs/02-architecture-technique.md` §3.3 — the claim definition; the prototype's extraction must
  be recognizably the same thing the real Stage 3 will do
- `.claude/skills/plumb-claims/references/extraction-prompt.md` — reuse the four-criteria prompt
- `.claude/skills/plumb/references/contracts.md` — keep the field names

## Deliverables
- `server/` — FastAPI, one WebSocket in (audio) and one out (events), `.env.example`, README with
  the run command
- Rolling transcript buffer, extraction triggered every ~50 new words or ~20 s, both configurable
- Speaker ids kept stable for the session; log every provider re-index

## Acceptance criteria
- [ ] Extraction uses `claude-haiku-4-5` — asserted by reading the code, not assumed
- [ ] Event fields match the contract names (`speaker_id`, `raw_quote`, `canonical`, `category`)
- [ ] `verifiability_score < 0.6` claims are not displayed
- [ ] No verdict anywhere in the payloads or the UI
- [ ] All keys from env; `.env` gitignored
- [ ] Every LLM call logs model, tokens, latency
