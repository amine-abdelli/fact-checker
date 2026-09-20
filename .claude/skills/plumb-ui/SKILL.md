---
name: plumb-ui
description: Build or fix the Plumb user interface and enforce its design system. Use for anything about screens (accueil, live, timeline, résumé, réglages, verdict sheet), components (VerdictChip, SpeakerDot, ConfidenceDots), OKLCH colors, typography, spacing, radii, animations, French labels, accessibility, or wiring the WebSocket events to the display.
---

# UI — screens and design system

Output: `packages/front/`. **Blocked by decision D-01** (Tauri / SwiftUI / Next.js). Until D-01 is an ADR,
build only platform-agnostic pieces — tokens, component contracts, event wiring logic — and say so.

## Read first

1. `specs/06-design-system-ui.md` — **the whole file**. It is exact: OKLCH values, pixel sizes,
   radii, animation curves. §7 is screen by screen, §11 is the exhaustive French label list.
2. `specs/01-cahier-des-charges.md` §5.5 — REQ-F-19 to REQ-F-22 (display requirements),
   §6.4 accessibility.
3. `.claude/skills/plumb/references/contracts.md` — the events the UI consumes.
4. `.claude/skills/plumb/references/verdicts.md` — what a verdict and a confidence level mean.

## Absolute rules

- **No hardcoded color.** Every color comes from the token layer generated from `specs/06-design-system-ui.md` §2.
  If a value is missing from the spec, ask — do not pick one.
- **No invented French string.** Every user-facing label is copied from `specs/06-design-system-ui.md` §11, character
  for character, guillemets included. If a string is missing, that is a spec gap to report.
- **No invented data.** The UI renders what the events carry. A missing verdict renders the
  "en attente" state, it does not guess.
- Confidence and verdict are displayed as **separate** signals — never merged into one score.
- The summary disclaimer is always visible where a summary is shown (REQ-F-30).
- Opinions render in italics with no verdict chip.
- Accessibility (WCAG 2.1 AA / RGAA): native buttons, focus states, contrast ratios checked, and
  the verdict never conveyed by color alone — the chip always carries its label.

## Live feed behaviour

- Claim cards appear newest first with an "Analyse en cours…" placeholder until the verdict lands.
- A `verdict` event patches its card in place; the card must not jump position when it does.
- Latency is displayed honestly: for a live stream, show the « décalage ~Xs » indicator rather than
  pretending the verdict is instantaneous.
- Timeline (ADR-08): every claim is anchored to the **stream timecode**, not wall clock.

## Done when

- [ ] Every string traced to a `specs/06-design-system-ui.md` §11 line.
- [ ] Zero literal color values outside the token file.
- [ ] Verdict chips cover all 8 codes plus the OPINION and "en attente" states.
- [ ] Reconnect replays the backlog without duplicate cards.
- [ ] Contrast and focus states verified, not assumed.
- [ ] `plumb-review` returns PASS against `specs/06-design-system-ui.md`.
