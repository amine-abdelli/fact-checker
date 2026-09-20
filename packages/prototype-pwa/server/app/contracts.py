"""Dataclasses mirroring .claude/skills/plumb/references/contracts.md.

Field names must stay identical to the contract — the server relays these events verbatim
to the real pipeline's future consumers. No verdict fields exist here on purpose: this
prototype never produces or displays a verdict.
"""

from dataclasses import dataclass


@dataclass
class TranscriptSegment:
    segment_id: str
    session_id: str
    speaker_id: str | None
    start_ms: int
    end_ms: int
    text: str
    language: str
    confidence: float
    is_final: bool


@dataclass
class Claim:
    claim_id: str
    session_id: str
    speaker_id: str | None
    start_ms: int
    end_ms: int
    raw_quote: str
    canonical: str
    context: str
    category: str
    verifiability_score: float
    state: str = "extracted"


CLAIM_CATEGORIES = {
    "statistique_publique",
    "evenement_recent",
    "citation",
    "donnee_scientifique",
    "historique",
    "juridique",
    "attribution_personnelle",
    "opinion",
    "projection",
}
