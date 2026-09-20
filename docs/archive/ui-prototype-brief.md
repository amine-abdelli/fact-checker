# Plumb — Real-time fact-checker (mobile app)

## One-line
**Plumb** is a mobile app that listens to a live conversation (debate, radio show, talk, discussion) and fact-checks spoken claims in near real time — isolating each factual assertion, finding sources, and assigning one of 8 graded verdicts with a confidence level, all in under ~30 seconds per claim. The UI is in French.

> Tagline used in the app: *"Vérifiez ce qui se dit, à mesure."* (Check what's being said, as it's said.)
> It explicitly is **not** a lie detector — it verifies facts, not intentions.

## Product concept
- You put the phone down, start listening (mic, system audio, an uploaded file, or a link), and the app streams a transcript while detecting **claims**.
- Each claim is categorized (statistic, projection, opinion…), decomposed, researched against prioritized sources, read in full text, and synthesized into a candidate verdict + confidence. Post-LLM guardrails can downgrade confidence.
- Opinions are surfaced but not verified (shown in italic, not given a verdict).

## The 8 verdicts (core of the system)
Each has a name, a short label, and an OKLCH color (same lightness/chroma, different hue, for a calibrated scale):
1. **V1 — Factuellement vrai** (Vrai) — green
2. **V2 — Plutôt vrai** (Plutôt vrai) — yellow-green
3. **V3 — Trompeur** (Trompeur) — orange
4. **V4 — Contesté** (Contesté) — amber
5. **V5 — Plutôt faux** (Plutôt faux) — red-orange
6. **V6 — Factuellement faux** (Faux) — red
7. **V7 — Non vérifiable** (Non vérif.) — neutral grey
8. **V8 — Non vérifié / En attente** (En attente) — light grey
Plus **OPINION** — surfaced but not assigned a verdict.

**Confidence** is separate from the verdict (high / medium / low, shown as 3/2/1 dots). It reflects the quality and convergence of sources found, NOT how true the claim is.

**Source tiers:** Tier 1 = primary source (e.g. INSEE, Eurostat, Légifrance, OECD), Tier 2 = reference media, Tier 3 = specialist, Tier 4 = encyclopedia (Wikipedia, recoupable).

## Screens

### 1. Home (Accueil)
- Branding: *Plumb · fact-checker*.
- Big editorial hero + primary CTA **"Démarrer l'écoute"** (mic, French auto-detected).
- Capture-source strip: **Micro · Son système · Fichier · Lien**.
- **Sessions récentes** list — each session card shows title, meta (status, duration, # verifications) and a proportional verdict color bar. One session is LIVE/ongoing.
- Footnote disclaimer: not a lie detector.

### 2. Live capture (Live)
- Top bar with a live "listening" pill (pulse dot, elapsed time, language), pause/play.
- Speakers strip (color-coded dots per speaker) + running count of verifications.
- Filter chips: **Tout / Affirmations factuelles / À surveiller** (flagged = misleading/false/contested).
- Streaming feed of **claim cards**, newest first, each with: speaker, timestamp, the quoted claim, a verdict chip, a short rationale, confidence dots, and source count. An "Analyse en cours…" placeholder shows while listening.
- Floating bottom bar: **Flux / Timeline / Résumé / Arrêter**.

### 3. Verdict detail (bottom sheet)
Opens when a claim is tapped. Tabs:
- **Verdict** — explanation (short + expandable long form), a confidence card (explains confidence is independent of the verdict), a "Réécouter le passage" audio-replay button (start–end timecodes), and a feedback block (*Correct / À revoir / Source manquante*).
- **Sources (N)** — list of source rows: tier badge, host, date, title, "Ouvrir la source". Empty state when no public source could be found (verdict stays "non vérifié" by prudence).
- **Méthodologie** — step-by-step pipeline: Catégorisation → Décomposition → Recherche ciblée → Lecture de sources → Synthèse argumentée → Garde-fous post-LLM.

### 4. Timeline / replay
- Master timeline visualization (heatmap of verdict density in ~1-min buckets, precise claim ticks, draggable playhead/scrubber over the full 47:18).
- Mini player (play, current passage time, speed).
- Group toggle: **Chronologique / Par locuteur / Par verdict**.
- Grouped list of timeline rows (timestamp, clamped claim text, speaker, verdict chip) — tapping seeks the playhead and opens the verdict sheet.

### 5. Summary (Résumé)
- Session title + coverage (00:00 → end) + total claims.
- Level switcher: **TL;DR (10 s) / Normal (1 min) / Détaillé (3–5 min)**. Detailed view groups claims by topic with each speaker's stance.
- **Répartition des verdicts** distribution card (proportional bar + per-verdict counts).
- Auto-refresh toggle (regenerate summary every 5 min).
- Disclaimer: auto-generated summary, may omit/simplify; "Généré il y a 2 min · v0.4".
- Share action.

### 6. Settings (Réglages & confidentialité)
Privacy-forward, local-first. Sections:
- **Profile** — "Mode anonyme local" (no account, sessions stored on-device), option to create an account.
- **Capture audio** — auto language detection (FR/EN), system-audio capture, confirm-before-listen, interface language, default voice.
- **Confidentialité** — keep raw audio (locally encrypted), encryption at rest (AES-256), voice-print opt-in (public figures only, V1), cloud verification (sends text, never raw audio).
- **Stockage local** — storage usage bar; lighten sessions (drop audio, keep transcripts+verdicts); export all (Markdown/PDF/JSON); erase all history (GDPR right to erasure, with confirm dialog).
- **Verdicts** — show tier-4 sources, send verdict feedback (anonymous), glossary of the 8 verdicts, public methodology.
- **Accessibilité** — high contrast, large type, spoken verdicts (RGAA / WCAG 2.1 AA).
- **À propos** — terms, privacy policy, list of providers (ASR, search, hosting), contest a publicly-produced verdict.
- Footer build: *Plumb · v0.4.2-mvp*.

## Design system
- **Palette:** warm editorial neutrals — page bg `#F4F1EC`, raised card `#FBF9F5`, ink `#161413`, near-black accent. Verdict hues defined in OKLCH for a calibrated scale.
- **Typography (tweakable):** display serif + UI sans by default (Instrument Serif / Geist), with "all-sans" and "editorial" (DM Serif + mono) alternatives. Claims are rendered in the display serif, in « guillemets ».
- **Tweaks available:** font pairing, density (compact/normal/aéré), verdict style (soft/bold), show/hide opinions.
- Built as a React (inline JSX/Babel) prototype rendered inside an iOS device frame, with a floating screen-jump tab for navigation (Accueil / Live / Timeline / Résumé).

## Demo data
A single fictitious session: **"Débat — Politique du logement"** (French housing-policy debate, 47:18, ~9–10 verified claims). Three speakers: Hélène Marquet (Députée), Damien Roche (Économiste), an Animateur (moderator). All claims, verdicts, sources and figures are invented for the prototype.

## File structure (prototype)
- `index.html` — entry; loads React/Babel + all scripts, defines fonts/CSS vars.
- `tokens.js` — design tokens (colors, verdicts, confidence, tiers).
- `data.js` — mock session, claims, summaries.
- `app.jsx` — app shell, screen routing, tweaks panel, screen-jump nav.
- `ui.jsx` — shared UI (icons, verdict chip, speaker dot, confidence dots, time formatting).
- `screen-home.jsx`, `screen-live.jsx`, `screen-verdict.jsx`, `screen-timeline.jsx`, `screen-summary.jsx`, `screen-settings.jsx` — the screens.
- `ios-frame.jsx`, `tweaks-panel.jsx` — device frame + tweak controls.
