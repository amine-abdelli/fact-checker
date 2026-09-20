# T-106 — Stage 5: NestJS relay
**Skill:** plumb-server · **Agent:** server-engineer · **Blocked by:** T-104, T-105

## Goal
`packages/back/server/` relays the five event types to the UI, replays the backlog on reconnect, exposes the
REST surface and persists sessions to SQLite.

## Read first
`specs/02-architecture-technique.md` §3.6 and §4 · ADR-01, ADR-02, ADR-06, ADR-08 · `.claude/skills/plumb/references/contracts.md`

## Deliverables
- Gateway, session service, REST controller, SQLite persistence layer
- An integration test that disconnects and reconnects a client mid-session

## Acceptance criteria
- [ ] Five event types typed, mirroring the Python dataclasses field for field
- [ ] Backlog replay rebuilds identical state after a reconnect
- [ ] `verdict` arriving before its `claim` is buffered, not dropped
- [ ] Schema matches `specs/02-architecture-technique.md` §4 table by table
- [ ] Export endpoint produces both Markdown and JSON
- [ ] No business logic in the gateway; no secret in source
- [ ] plumb-review: PASS
