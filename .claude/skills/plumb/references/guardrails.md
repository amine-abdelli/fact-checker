# Guardrails — the enforcement checklist

Every skill applies this before declaring a task done. `plumb-review` applies it again before
integration. Anything in the **hard blocker** list stops integration outright.

## Hard blockers

| # | Blocker | Where it comes from |
|---|---|---|
| G-1 | A verdict value outside `V1`–`V8` / `OPINION` | rule 3, `specs/03-modele-fiabilite-sources.md` §2 |
| G-2 | `len(sources) < 2` and the emitted verdict is not `V8` | rule 4, `specs/02-architecture-technique.md` §3.4 |
| G-3 | `V6` on a named person with confidence ≠ `HIGH`, not downgraded | rule 4, `specs/05-ethique-risques-juridique.md` R-01 |
| G-4 | Audio bytes sent anywhere except the ASR provider | rule 5, `specs/01-cahier-des-charges.md` §6.3 |
| G-5 | A hardcoded API key, token or credential | rule 8 |
| G-6 | A user-facing string not in French, or not matching `specs/06-design-system-ui.md` §11 | rule 6 |
| G-7 | Wrong model — Sonnet for extraction, Haiku for verification synthesis | rule 7 |
| G-8 | A summary emitted without the REQ-F-30 disclaimer | `specs/01-cahier-des-charges.md` §5.6 |
| G-9 | Code contradicting an ADR without a new ADR being opened | rule 2, `specs/02-architecture-technique.md` §2 |

## Soft checks (fix before the milestone, not blocking)

- Every LLM call logs `component, model, input_tokens, output_tokens, latency_ms, cost_eur`.
- Every external call has a timeout and a defined failure path — a stage never dies silently.
- No stage mutates another stage's payload; stages communicate only through the contracts.
- Type hints on every public function; dataclasses (not bare dicts) for event payloads.
- New module → an entry in `docs/ai-harness/tasks/` and a line in the pipeline diagram.

## Privacy rules worth restating

- The LLM receives the **canonical claim text and its transcript context**. Not the audio, not the
  raw file, not the user's identity.
- Speaker names are `Locuteur 1`, `Locuteur 2`… A real name only ever comes from an explicit user
  action, never from inference.
- Local-first (ADR-02, ADR-06): everything is stored on-device by default; cloud is opt-in.
- `specs/05-ethique-risques-juridique.md` R-01 (diffamation) and R-02 (hallucinations) govern every verdict that names a person.
