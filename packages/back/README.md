# @plumb/back — pipeline + real-time server

Empty. Built from the specs through the harness, one task brief at a time.

```
pipeline/               Python — stages 1, 2, 3, 4, 3bis
  src/plumb_pipeline/
    audio.py            Stage 1  — capture (mic, system, file, live)
    transcriber.py      Stage 2  — ASR + diarization, behind ASRStreamProvider
    claims.py           Stage 3  — claim extraction (Haiku)
    verifier.py         Stage 4  — search + synthesis (Sonnet) + guardrails
    summarizer.py       Stage 3bis — TL;DR / normal / detailed
    asr/                provider adapters (D-02)
    search/             search provider adapters (D-03)
  tests/

server/                 NestJS + Socket.IO — Stage 5, the relay
  src/
```

The pipeline is a library with a CLI entry point; the server owns the WebSocket and the REST API
and drives the pipeline. They ship together but stay separable — no server import inside a pipeline
module, ever.

Contracts between stages: `.claude/skills/plumb/references/contracts.md`.
