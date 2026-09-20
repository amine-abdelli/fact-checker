"""Environment configuration. All keys come from the environment only (project rule 8)."""

import os

from dotenv import load_dotenv

load_dotenv()


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


DEEPGRAM_API_KEY = _require("DEEPGRAM_API_KEY")

# DEROGATION — project rule 7 ("extraction must use claude-haiku-4-5, never swap") is
# violated here by explicit, informed decision of the project owner on 2026-09-16, for
# this throwaway prototype only. Production Stage 3 (packages/back/pipeline) MUST use
# claude-haiku-4-5 — this is not a precedent for that code. See packages/prototype-pwa/README.md.
OPENAI_API_KEY = _require("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

LANGUAGE = os.getenv("LANGUAGE", "fr")
MIN_WORDS = int(os.getenv("MIN_WORDS", "50"))
EXTRACT_INTERVAL = float(os.getenv("EXTRACT_INTERVAL", "20"))
SCORE_THRESHOLD = float(os.getenv("SCORE_THRESHOLD", "0.6"))
PORT = int(os.getenv("PORT", "8000"))

SAMPLE_RATE = 16000
