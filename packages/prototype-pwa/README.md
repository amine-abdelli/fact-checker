# @plumb/prototype-pwa — throwaway prototype

**Purpose:** prove two things work before any production code exists.

1. **Recording** — a PWA can capture microphone audio continuously and stream it to a server
   without the browser killing the session.
2. **Real-time display** — claims appear in the UI as they are spoken, attributed to a speaker,
   with a latency that feels live.

**Explicitly out of scope:** verdicts, V1–V8, sources, summaries, persistence, auth, design-system
fidelity. Claims are displayed as « à vérifier » and nothing more.

```
web/      PWA — React + TypeScript + Tailwind/shadcn UI, AudioWorklet capture, WebSocket client
server/   FastAPI — audio in over WebSocket, Deepgram ASR (diarize), claim extraction, events out
```

This code is disposable and everyone knows it. It does not have to follow `specs/06-design-system-ui.md`, and it is
never imported by `back/` or `front/`. What survives is the finding written at the end
(`docs/ai-harness/findings/pwa-prototype.md`, written after a real test conversation).

### DEROGATION — claim extraction runs on OpenAI, not Haiku

Project rule 7 ("extraction must use `claude-haiku-4-5`, never swap — hard blocker at review")
is **knowingly violated** in this prototype only: `server/app/claims.py` calls OpenAI
(`gpt-4o-mini` by default), by explicit decision of the project owner on 2026-09-16, taken
after being shown that this repeats the exact mistake the deleted v0 prototype made
(`docs/archive/live-prototype-spec-v1.md` §9 — `gpt-4o-mini` was replaced by Haiku for
that reason). This is scoped to `packages/prototype-pwa/` only — it sets **no precedent**
for `packages/back/pipeline` Stage 3, which must use `claude-haiku-4-5`.

Skill: `plumb-proto`. Agent: `proto-engineer`. Briefs: `docs/ai-harness/tasks/T-01*.md`.
Prior art, for reference only: `docs/archive/live-prototype-spec-v1.md`.

## Run it

Two terminals, backend first. Requires Python ≥ 3.11 and Node ≥ 18.

### 1. Backend (FastAPI) — terminal 1

```bash
cd packages/prototype-pwa/server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `server/.env` and fill in **both** keys (a copied `.env.example` has empty values — the
server refuses to start with a clear `RuntimeError` naming the missing one):

```
DEEPGRAM_API_KEY=...   # from console.deepgram.com, or the repo root's .env.keys.bak
OPENAI_API_KEY=...     # from platform.openai.com, or the repo root's .env.keys.bak
```

Using `OPENAI_API_KEY` here is the documented derogation above, not an oversight.

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify it's up: `curl http://localhost:8000/health` → `{"status":"ok"}`. Keep this terminal open;
`--reload` picks up code edits automatically.

### 2. Frontend (PWA) — terminal 2

```bash
cd packages/prototype-pwa/web
npm install
npm run dev -- --host
```

Open the `http://localhost:5173` URL Vite prints. `http://localhost` is a secure context, so
`getUserMedia` (microphone access) works there without TLS, and the app talks to the backend over
plain `ws://localhost:8000/ws` — no certificate to accept, nothing else to configure for
local-only testing (two people, one laptop mic).

To test from a phone over LAN instead, `getUserMedia` requires HTTPS on a non-localhost host: run
`VITE_HTTPS=1 npm run dev -- --host` to get a self-signed cert at `https://<your-LAN-ip>:5173`
(accept the certificate warning on the phone). Note this only covers the frontend — the FastAPI
backend still has no TLS, so the browser will still try `wss://` and fail against it; LAN testing
needs a TLS-terminating proxy in front of the backend too, which this prototype does not set up.
Stick to localhost unless you're specifically testing phone capture.

Override the backend port with `VITE_SERVER_PORT` if the backend runs elsewhere.

### 3. Talk

Two people, one browser tab, click **▶ Écouter**. Speaker 1 (blue) and Speaker 2 (orange) show up
on opposite sides of the transcript pane; claims stream into the right-hand pane as they're
extracted, each card showing category, speaker, and the phrase→card latency.

### Troubleshooting

- `RuntimeError: Missing required environment variable` on backend startup → a key in
  `server/.env` is present but empty; fill it in and the `--reload` process restarts on its own.
- `WARNING: Invalid HTTP request received` spamming the backend log → the page is being served
  over HTTPS (`VITE_HTTPS=1`) while the backend has no TLS, so the browser opens a `wss://`
  handshake the backend can't parse. Drop `VITE_HTTPS` and use `http://localhost:5173`.
- Certificate warning in the browser → only expected when `VITE_HTTPS=1` is set (self-signed, for
  LAN/phone testing). Not expected on plain `http://localhost`.

## Known limitations (prototype, not bugs to "fix" before testing)

- Single session at a time — one WebSocket connection == one recording, no multi-tenancy.
- Speaker attribution takes the first word's speaker per ASR utterance; an utterance that
  genuinely mixes two speakers mid-sentence is logged, not split.
- The latency readout matches a claim's `raw_quote` against the last finalized transcript segment
  that textually overlaps it — an approximation, not a true "microphone to card" timestamp.
- Reconnects preserve the recording but queue at most ~10s of audio; a longer outage loses audio,
  not the session.
