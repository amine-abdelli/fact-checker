# The verdict system — one-page index

**Authoritative source: `specs/03-modele-fiabilite-sources.md`.** This page is an index, not a
substitute: read §2 (verdicts), §3 (confidence), §4 (source tiers) and §5 (method) before
implementing anything that assigns a verdict.

## The 8 verdicts (immutable)

| Code | Name (FR, user-facing) | Short label | Meaning in one line |
|---|---|---|---|
| `V1` | Factuellement vrai | Vrai | Confirmed by converging reliable sources |
| `V2` | Plutôt vrai | Plutôt vrai | Substantially true, with a nuance or imprecision |
| `V3` | Trompeur | Trompeur | True in itself but presented out of context |
| `V4` | Contesté | Contesté | Reliable sources disagree |
| `V5` | Plutôt faux | Plutôt faux | Mostly wrong, with a grain of truth |
| `V6` | Factuellement faux | Faux | Contradicted by converging reliable sources |
| `V7` | Non vérifiable | Non vérif. | No source could settle it (prediction, private fact…) |
| `V8` | Non vérifié | En attente | Not verified yet, or not enough signal to decide |

Plus `OPINION` — surfaced in the UI, never given a verdict, displayed in italics.

**There is no ninth code, no numeric score, no boolean.** Never emit `true`, `false`, `unknown`,
`0.87`, `MOSTLY_TRUE`, or a translated label as the machine value. The FR name is a display
string; the key is `V1`…`V8`.

## Confidence (independent of the verdict)

`HIGH` | `MEDIUM` | `LOW` — 3 / 2 / 1 dots in the UI. Confidence reflects the **quality and
convergence of the sources found**, never how true the claim is. A confident `V6` and a shaky
`V6` are the same verdict with different confidence.

## Source tiers

| Tier | What | Examples |
|---|---|---|
| `T1` | Primary official sources | INSEE, Eurostat, Légifrance, OECD, official registries |
| `T2` | Reference media and recognized fact-checkers | wire services, national dailies' fact-check desks |
| `T3` | Secondary and specialist publications | trade press, domain-specific outlets |
| `T4` | Collaborative encyclopedias / aggregators | Wikipedia — only when cross-checked |
| — | **Forbidden zone** | see `specs/03-modele-fiabilite-sources.md` §7 blacklist — never cited as evidence |

## Mandatory post-LLM guardrails (`specs/02-architecture-technique.md` §3.4 step 4d)

Run **in this order**, after the LLM answers and before the event is emitted:

1. `len(sources) < 2` → force `V8` and clear the explanation.
2. `verdict == "V6"` and the claim names a real person and `confidence != "HIGH"` → downgrade to `V5` (or `V4` if sources conflict).
3. Contradiction between T1 sources → force `V4`.
4. Claim older than 5 years and newest source younger than 2 years → attach an obsolescence flag.

These are not suggestions and not the LLM's job. They are deterministic code that runs on every
verdict, and they are unit-tested.
