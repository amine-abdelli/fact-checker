"""Stage 3 claim extraction.

DEROGATION from project rule 7 ("extraction must use claude-haiku-4-5, never swap"):
this prototype calls OpenAI instead, by explicit, informed decision of the project
owner on 2026-09-16, for this throwaway prototype only — see config.py and
packages/prototype-pwa/README.md. Production Stage 3 (packages/back/pipeline) must
still use claude-haiku-4-5; do not carry this choice over.

Prompt reused from .claude/skills/plumb-claims/references/extraction-prompt.md, adapted
to this prototype's transcript-line format. Filtering (opinion, verifiability_score,
dedup) matches the routing rules in .claude/skills/plumb/references/contracts.md.
"""

import difflib
import json
import logging
import time
from dataclasses import dataclass

from openai import OpenAI

from . import config
from .contracts import CLAIM_CATEGORIES

logger = logging.getLogger("plumb.claims")

_client = OpenAI(api_key=config.OPENAI_API_KEY)

EXTRACTION_PROMPT = """\
You are embedded in Plumb, a real-time fact-checking app. Analyse the conversation transcript
below and identify FACTUAL CLAIMS that are genuinely worth fact-checking.

A claim qualifies only if ALL FOUR conditions hold:
1. DECLARATIVE       — states something as a fact (not a question, order, wish or feeling)
2. WORLD-REFERENTIAL — describes an objective external state of the world, not an opinion
3. VERIFIABLE        — a real source (statistics, papers, legal records) could confirm or refute it
4. SPECIFIC          — contains numbers, dates, named entities, places or percentages

INCLUDE (this covers well-known facts too — you are NOT being asked to judge whether the
statement is true, only whether it is the KIND of statement a real source could check. A
named person/place/organization performing a role, or a location fact, with no number or
date at all, still counts as SPECIFIC and must be extracted — do not reject it for being
"too easy", "common knowledge", or something you already know the answer to):
- "La France compte 2,9 millions de chômeurs"        -> statistique_publique
- "Le SMIC est à 1767 € depuis janvier 2024"          -> statistique_publique
- "Macron a été élu en 2017 avec 66 % des voix"       -> historique
- "La loi de 2016 interdit cette pratique"            -> juridique
- "Il a dit que le chômage avait baissé"              -> citation (a reported claim: what
  was said is itself the fact-checkable unit here, not (yet) the underlying figure)
- "Le PIB va croître de 2% l'an prochain"             -> projection (falsifiable later, not now)
- "Paris est la capitale de la France"                -> historique
- "Emmanuel Macron est le président de la République" -> attribution_personnelle
- "Emmanuel Macron n'est pas le président de la République" -> attribution_personnelle
  (a negated role claim is exactly as checkable as an affirmed one — never drop it for
  being negated, and never drop it for seeming obviously true or false to you)
- "Le Louvre est à Paris"                             -> historique

EXCLUDE (but emit opinions with category "opinion" and verifiability_score 0.0):
- "Je pense que cette politique est mauvaise"         -> opinion
- "C'est scandaleux"                                  -> opinion (normative)
- "Les gens en ont marre"                             -> opinion (too vague, unfalsifiable as stated)
- "Bonjour, je m'appelle Michel"                       -> not a claim, omit entirely
- "Nous devons agir maintenant"                        -> not a claim, omit entirely
- "Il est évident que cette politique a échoué"        -> opinion (value judgment wrapped
  around a claim; if the underlying failure is itself quantifiable, extract that as a
  separate, neutral claim instead)

Transcript — each line is prefixed with its speaker id and start time in ms:
{transcript}

Return a JSON array. Each element has exactly these fields:
{{
  "speaker_id": "spk_N — copy it from the line the quote comes from, never guess",
  "raw_quote": "the exact words from the transcript, verbatim",
  "canonical": "clean, neutral, declarative restatement, self-contained (resolve pronouns and
                relative dates using the surrounding context)",
  "context": "the one or two transcript lines around the quote",
  "category": "statistique_publique|evenement_recent|citation|donnee_scientifique|historique|
               juridique|attribution_personnelle|opinion|projection",
  "verifiability_score": 0.0
}}

Return [] if nothing qualifies. Return ONLY valid JSON — no markdown fence, no preamble.
"""


@dataclass
class ExtractedClaim:
    speaker_id: str | None
    raw_quote: str
    canonical: str
    context: str
    category: str
    verifiability_score: float


def _log_call(input_tokens: int, output_tokens: int, latency_ms: int) -> None:
    logger.info(
        "llm_call component=claim_extraction model=%s input_tokens=%d output_tokens=%d latency_ms=%d",
        config.OPENAI_MODEL,
        input_tokens,
        output_tokens,
        latency_ms,
    )


def _strip_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines)
    return text.strip()


async def extract_claims(transcript_lines: list[str]) -> list[ExtractedClaim]:
    """Call Haiku once on the given transcript window and return validated claims.

    Filtering NOT applied here: category=="opinion" exclusion, verifiability_score
    threshold and dedup are the caller's responsibility (session.py), matching the
    routing rules in the contracts document.
    """
    if not transcript_lines:
        return []

    prompt = EXTRACTION_PROMPT.format(transcript="\n".join(transcript_lines))

    start = time.monotonic()
    response = _client.chat.completions.create(
        model=config.OPENAI_MODEL,
        max_tokens=2048,
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )
    latency_ms = int((time.monotonic() - start) * 1000)
    usage = response.usage
    _log_call(usage.prompt_tokens if usage else 0, usage.completion_tokens if usage else 0, latency_ms)

    raw_text = response.choices[0].message.content or ""
    raw_text = _strip_fence(raw_text)

    try:
        items = json.loads(raw_text)
    except json.JSONDecodeError:
        logger.warning("Extraction response was not valid JSON, discarding this pass")
        return []

    if not isinstance(items, list):
        return []

    claims: list[ExtractedClaim] = []
    for item in items:
        try:
            category = item["category"]
            if category not in CLAIM_CATEGORIES:
                logger.warning("Unknown category %r, discarding claim", category)
                continue
            claims.append(
                ExtractedClaim(
                    speaker_id=item.get("speaker_id"),
                    raw_quote=item["raw_quote"],
                    canonical=item["canonical"],
                    context=item.get("context", ""),
                    category=category,
                    verifiability_score=float(item["verifiability_score"]),
                )
            )
        except (KeyError, TypeError, ValueError):
            logger.warning("Malformed claim item discarded: %r", item)
            continue

    return claims


def is_displayable(claim: ExtractedClaim) -> bool:
    """Routing rules from contracts.md: opinions never surface, low-score claims never surface."""
    if claim.category == "opinion":
        return False
    if claim.verifiability_score < config.SCORE_THRESHOLD:
        return False
    return True


def is_duplicate(canonical: str, already_shown: list[str], threshold: float = 0.85) -> bool:
    normalized = canonical.strip().lower()
    for shown in already_shown:
        ratio = difflib.SequenceMatcher(None, normalized, shown.strip().lower()).ratio()
        if ratio >= threshold:
            return True
    return False
