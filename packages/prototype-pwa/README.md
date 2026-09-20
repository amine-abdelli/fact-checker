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

### 1. Server

```bash
cd packages/prototype-pwa/server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env: set DEEPGRAM_API_KEY and OPENAI_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Both keys can come from the repo root's `.env.keys.bak`. Using `OPENAI_API_KEY` here is the
documented derogation above, not an oversight.

### 2. Web

```bash
cd packages/prototype-pwa/web
npm install
npm run dev -- --host
```

By default Vite serves plain HTTP at `http://localhost:5173` — `getUserMedia` works there without
TLS, and the app talks to the FastAPI server over plain `ws://localhost:8000/ws`. This is enough
for local-only testing (two people, one laptop mic).

To test from a phone over LAN, `getUserMedia` requires HTTPS on a non-localhost host: run
`VITE_HTTPS=1 npm run dev -- --host` to get a self-signed cert at `https://<your-LAN-ip>:5173`
(accept the certificate warning on the phone). Note this only covers the frontend — the FastAPI
server still has no TLS, so the browser will still try `wss://` and fail against it; LAN testing
needs a TLS-terminating proxy in front of the server too, which this prototype does not set up.

Override the backend port with `VITE_SERVER_PORT` if the server runs elsewhere.

### 3. Talk

Two people, one browser tab, click **▶ Écouter**. Speaker 1 (blue) and Speaker 2 (orange) show up
on opposite sides of the transcript pane; claims stream into the right-hand pane as they're
extracted, each card showing category, speaker, and the phrase→card latency.

## Known limitations (prototype, not bugs to "fix" before testing)

- Single session at a time — one WebSocket connection == one recording, no multi-tenancy.
- Speaker attribution takes the first word's speaker per ASR utterance; an utterance that
  genuinely mixes two speakers mid-sentence is logged, not split.
- The latency readout matches a claim's `raw_quote` against the last finalized transcript segment
  that textually overlaps it — an approximation, not a true "microphone to card" timestamp.
- Reconnects preserve the recording but queue at most ~10s of audio; a longer outage loses audio,
  not the session.
