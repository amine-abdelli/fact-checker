---
name: plumb-server
description: Build or extend the Plumb NestJS server (Stage 5) — the relay between the Python pipeline and the UI. Use for anything about Socket.IO gateways, WebSocket event types, backlog replay on reconnect, REST endpoints, session lifecycle, SQLite/SQLCipher persistence, the data model, or export to Markdown/JSON.
---

# Stage 5 — Server / relay

Output: `packages/back/server/` (NestJS + TypeScript + Socket.IO).

## Read first

1. `CLAUDE.md` — rules 2, 5, 8.
2. `specs/02-architecture-technique.md` §3.6 (Étage 5) and §4 (data model).
3. `specs/02-architecture-technique.md` §2 — ADR-01 (event pipeline), ADR-02 / ADR-06 (local-first, opt-in cloud),
   ADR-08 (persistent claim timeline).
4. `.claude/skills/plumb/references/contracts.md` — the five event types.

## What the server is

A dumb, reliable relay with a memory. It **does not** decide verdicts, rewrite explanations, or
filter claims. It receives events from the pipeline, stores them, and broadcasts them.

```
Python pipeline ──push──▶ Gateway ──▶ SessionService (memory + SQLite) ──▶ Socket.IO ──▶ UI
                                    ▲
                                    └── REST controller (history, export, reset)
```

## Rules

- Every event type is a TypeScript interface, mirroring the Python dataclass **field for field**.
  Define the interfaces before writing handlers. A drifted field name is a silent data loss bug.
- On client connect: replay the entire backlog of the live session in emission order, then attach
  the live stream. A reconnecting browser must rebuild byte-identical state.
- A `verdict` event patches an existing claim by `claim_id`. If the claim is unknown, buffer it —
  do not drop it, events can arrive out of order.
- Persistence: SQLite + SQLCipher, schema exactly as `specs/02-architecture-technique.md` §4. In-memory backlog stays for
  live clients; the DB is the durable copy. Local-first — no remote write without opt-in.
- Secrets from `process.env`. The server holds no LLM key unless it proxies a call, and it should
  not: the pipeline owns the model calls.
- Never break an existing event contract. Add fields, do not rename them.

## REST surface (MVP)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/sessions` | list sessions with counts and duration |
| `GET` | `/api/sessions/:id` | full session: segments, claims, verdicts, summaries |
| `GET` | `/api/sessions/:id/export?format=markdown\|json` | REQ export, `specs/01-cahier-des-charges.md` §5.7 |
| `POST` | `/api/sessions/:id/feedback` | claim feedback (correct / à revoir / source manquante) |
| `POST` | `/api/reset` | dev only, clears the live session |

## Done when

- [ ] All five event types typed and relayed.
- [ ] Backlog replay reconstructs the full state — tested with a disconnect/reconnect integration test.
- [ ] Out-of-order `verdict` before `claim` is handled.
- [ ] Schema matches `specs/02-architecture-technique.md` §4 table by table.
- [ ] No secret in source; no business logic in the gateway.
- [ ] `plumb-review` returns PASS.
