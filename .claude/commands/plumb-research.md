---
description: Run a research spike and produce a finding plus a proposed ADR
argument-hint: [question or RND id, e.g. RND-02]
---

Research: $ARGUMENTS

Load the `plumb-research` skill and follow it exactly. If the argument is an RND id, use the
standing question from the skill's table.

Check `specs/02-architecture-technique.md` §2 for an existing ADR before searching. Search for current data — no pricing,
model names or benchmarks from memory. Write the finding to `docs/ai-harness/findings/<slug>.md`,
draft the ADR in `docs/ai-harness/decisions/` if it resolves an open decision, and give me the
recommendation in five lines.
