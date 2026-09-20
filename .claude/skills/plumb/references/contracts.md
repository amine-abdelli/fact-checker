# Inter-stage contracts

Stages are independent processes/modules that exchange **events**. A stage may only read the
fields defined here. Changing a contract is an ADR-level decision, not an implementation detail.
Authoritative source: `specs/02-architecture-technique.md` §3 (stages) and §4 (data model).

Every payload is a dataclass in Python and a TypeScript interface on the server side. Keep the
field names identical across both — the server relays these events verbatim.

---

## Stage 2 → Stage 3 — `TranscriptSegment`

```python
@dataclass
class TranscriptSegment:
    segment_id: str        # uuid4
    session_id: str
    speaker_id: str | None # "spk_0", "spk_1", … stable within a session
    start_ms: int          # from session start
    end_ms: int
    text: str
    language: str          # "fr" | "en"
    confidence: float      # ASR confidence 0.0–1.0
    is_final: bool         # interim segments are displayed dimmed, never sent to Stage 3
```

Only `is_final=True` segments feed claim extraction.

---

## Stage 3 → Stage 4 — `Claim`

```python
@dataclass
class Claim:
    claim_id: str              # uuid4, stable for the whole lifetime of the claim
    session_id: str
    speaker_id: str | None
    start_ms: int
    end_ms: int
    raw_quote: str             # the exact spoken words
    canonical: str             # clean, neutral, declarative restatement (this is what is verified)
    context: str               # surrounding transcript, for disambiguation
    category: str              # statistique_publique | evenement_recent | citation |
                               # donnee_scientifique | historique | juridique |
                               # attribution_personnelle | opinion | projection
    verifiability_score: float # 0.0–1.0
    state: str                 # "extracted"
```

Routing rules the verifier applies on input:
- `category == "opinion"` → emit an `OPINION` marker, **no external call at all**.
- `verifiability_score < 0.6` → emit `V8` directly, skip search.

---

## Stage 4 → Server — `Verdict`

```python
@dataclass
class Source:
    tier: str             # "T1" | "T2" | "T3" | "T4"
    url: str
    title: str
    publisher: str
    published_at: str     # ISO date
    quote: str            # the excerpt that actually supports the verdict
    relevance_score: float

@dataclass
class Verdict:
    claim_id: str         # same id as the input claim
    verdict: str          # "V1"…"V8" — nothing else, ever
    confidence: str       # "HIGH" | "MEDIUM" | "LOW"
    explanation_short: str  # 1–3 sentences, session language
    explanation_long: str   # 5–10 sentences with citations, session language
    sources: list[Source]   # ≥ 2 unless verdict is V7/V8
    flags: list[str]        # e.g. ["donnee_potentiellement_obsolete"]
    verified_at: str        # ISO timestamp
    state: str              # "verified"
```

---

## Stage 3bis → Server — `Summary`

```python
@dataclass
class Summary:
    session_id: str
    level: str            # "tldr" | "normal" | "detailed"
    scope: str            # "global" (MVP) | "speaker:<id>" | "topic:<id>" (V1+)
    language: str         # "fr" | "en"
    text: str | dict      # str for tldr/normal; dict for detailed:
                          # { "intro": str, "topics": [{"title","lead","claims":[claim_id]}] }
    covers_from_ms: int
    covers_to_ms: int
    generated_at: str
    model_version: str
    disclaimer: str       # MANDATORY, REQ-F-30, exact French string (see below)
```

Exact disclaimer string:

> « Résumé généré automatiquement, peut omettre ou simplifier des points. Vérifiez la transcription complète pour les passages importants. »

---

## Server → UI — WebSocket events

One envelope, five types. The UI must tolerate events arriving out of order and late.

```jsonc
{ "type": "session", "data": { "session_id": "...", "source_type": "mic|system|file|link|live", "language": "fr" } }
{ "type": "transcript", "data": TranscriptSegment }
{ "type": "claim",      "data": Claim }
{ "type": "verdict",    "data": Verdict }     // patches the claim card identified by claim_id
{ "type": "summary",    "data": Summary }     // replaces the summary at that level
```

UI → server: `{ "action": "start" | "stop" | "reset" | "summarize_now", "payload": {…} }`.

On client connect the server replays the full backlog of the live session, in emission order,
so a reconnecting browser rebuilds the exact same state.

---

## Persistence (`specs/02-architecture-technique.md` §4)

Tables: `Session`, `Speaker`, `TranscriptSegment`, `Claim`, `Source`, `Summary`, `Feedback`.
SQLite + SQLCipher, local-first (ADR-06). A `Claim` row carries its verdict fields inline; a
`Source` row belongs to one claim.
