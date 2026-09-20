# 06 — Design system & spécifications UI (mobile)

Ce document est conçu pour reconstruire l'interface mobile de l'app **sans accès au design source**. Il fixe la palette, les typographies, les composants, et le détail layout de chacun des 5 écrans + le bottom sheet de verdict. Toutes les valeurs (couleurs, tailles, paddings, radius, fonts) sont reproduites au pixel près à partir de la maquette de référence (paquet `prototype/`).

## 1. Identité produit

### 1.1 Nom et ton
- **Nom de marque retenu** : **Plumb** (référence au fil à plomb — la verticalité, la mesure, la rigueur).
- **Tagline** dans le header d'accueil : *« Plumb · fact-checker »* (sérif italique pour le nom, sans-serif pour la fonction).
- **Tagline éditoriale** sur l'accueil : *« Vérifiez ce qui se dit, à mesure »* — le mot *« à mesure »* est mis en italique pour porter l'idée du rythme.
- **Ton général** : éditorial, calme, posé. La typographie sérif domine pour les contenus signifiants (titres, citations, verdicts) ; la sans-serif structure l'interface fonctionnelle (boutons, métadonnées, légendes).

### 1.2 Plateforme cible
Mobile en priorité. Le mockup de référence cible un **iPhone 15** (390 × 844 px, radius extérieur 48 px, dynamic island 126 × 37 px à 11 px du haut). Le système de design doit néanmoins fonctionner en desktop (sans dynamic island) sans réécriture.

## 2. Tokens de design

### 2.1 Palette neutre éditoriale

| Token | Valeur | Usage |
|---|---|---|
| `bg` | `#F4F1EC` | Fond de page principal (crème chaude) |
| `bgRaised` | `#FBF9F5` | Surfaces de cartes, listes, panneaux |
| `ink` | `#161413` | Texte primaire (encre presque noire) |
| `inkSoft` | `#4A4641` | Texte secondaire |
| `inkMute` | `#8A857E` | Texte tertiaire / métadonnées |
| `rule` | `#E2DDD3` | Filets, séparateurs |
| `ruleSoft` | `#EBE6DC` | Bordures de cartes, séparateurs subtils |
| `accent` | `#1F1B19` | CTAs forts, fond de bottom-bar |
| `accentInk` | `#FBF9F5` | Texte sur fond accent |

Le canvas hors device (la scène autour du mockup, qui ne se voit que dans la maquette) est `#1a1714` avec deux radial-gradients très discrets.

### 2.2 Palette des 8 verdicts (OKLCH)

Calibrée en OKLCH pour que tous les verdicts aient une chroma et une lightness équivalentes — seule la teinte change. Cette homogénéité perceptuelle est volontaire : aucun verdict ne doit dominer visuellement.

| Code | Nom | Court | `hue` (point + tick) | `soft` (badge) | `ink` (texte) |
|---|---|---|---|---|---|
| V1 | Factuellement vrai | Vrai | `oklch(0.62 0.13 145)` | `oklch(0.94 0.04 145)` | `oklch(0.32 0.06 145)` |
| V2 | Plutôt vrai | Plutôt vrai | `oklch(0.70 0.10 130)` | `oklch(0.95 0.035 130)` | `oklch(0.36 0.05 130)` |
| V3 | Trompeur | Trompeur | `oklch(0.68 0.14 60)` | `oklch(0.95 0.04 60)` | `oklch(0.38 0.07 60)` |
| V4 | Contesté | Contesté | `oklch(0.78 0.13 90)` | `oklch(0.96 0.045 90)` | `oklch(0.42 0.07 90)` |
| V5 | Plutôt faux | Plutôt faux | `oklch(0.65 0.15 25)` | `oklch(0.95 0.04 25)` | `oklch(0.38 0.08 25)` |
| V6 | Factuellement faux | Faux | `oklch(0.55 0.18 25)` | `oklch(0.93 0.05 25)` | `oklch(0.34 0.10 25)` |
| V7 | Non vérifiable | Non vérif. | `oklch(0.45 0.01 280)` | `oklch(0.92 0.005 280)` | `oklch(0.32 0.01 280)` |
| V8 | Non vérifié | En attente | `oklch(0.72 0.005 280)` | `oklch(0.94 0.003 280)` | `oklch(0.42 0.005 280)` |

Le verdict `OPINION` n'est pas dans la palette : il s'affiche en chip pointillé `inkMute` sur fond transparent (cf. composant `VerdictChip`).

### 2.3 Couleurs des locuteurs (mock)
Les 3 locuteurs de la session de référence portent ces teintes calibrées (utilisées sur les `SpeakerDot`) :
- Locuteur A — Hélène Marquet (Députée) : `oklch(0.62 0.10 250)` (bleu).
- Locuteur B — Damien Roche (Économiste) : `oklch(0.62 0.10 30)` (orangé).
- Locuteur C — Animateur (Modérateur) : `oklch(0.55 0.005 280)` (gris froid quasi neutre).

### 2.4 Couleurs des tiers de source
Chips de tier dans `SourceRow` :
- Tier 1 : `oklch(0.55 0.10 250)`.
- Tier 2 : `oklch(0.6 0.08 200)`.
- Tier 3 : `oklch(0.62 0.06 280)`.
- Tier 4 : `oklch(0.65 0.02 280)`.

### 2.5 Typographies

Trois familles importées via Google Fonts :

```
Instrument Serif (display)  — italique disponible
Geist 400/500/600/700       — UI, sans-serif neutre
Geist Mono 400/500/600       — métadonnées, timestamps, build
```

Variables CSS exposées sur `:root` :

```css
--font-display: "Instrument Serif", "Cormorant Garamond", Georgia, serif;
--font-ui:      "Geist", "Inter", system-ui, sans-serif;
--font-mono:    "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
```

Le panneau de tweaks permet de basculer la paire `display/ui` entre trois variantes :
- **serif** (par défaut) — Instrument Serif + Geist.
- **allsans** — tout en Geist.
- **editorial** — DM Serif Display + Geist Mono pour l'UI.

Les écrans iOS internes (status bar native, nav bar de la coque iOS) utilisent `-apple-system, "SF Pro", system-ui` — ne pas y substituer Geist, c'est volontaire pour mimer le système.

### 2.6 Échelles typographiques utilisées

| Usage | Famille | Taille | Poids | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| H1 d'accueil ("Vérifiez ce qui se dit") | display | 40 | 400 | -1.2 | 1.02 |
| Titre écran (Réglages) | display | 32 | 400 | -0.8 | 1.05 |
| Titre résumé ("Politique du logement") | display | 26 | 400 | -0.6 | 1.15 |
| Citation dans verdict sheet | display | 22 | 400 | -0.4 | 1.22 |
| Card title + résumé TL;DR | display | 17.5 | 400 | -0.2 | 1.45 |
| Citation de claim (live card) | display | 16.5 | 400 | -0.2 | 1.32 |
| Body verdict explanation | display | 17 | 400 | -0.2 | 1.45 |
| Source title | display | 14.5 | — | -0.1 | 1.35 |
| Body UI standard | ui | 13.5 | 500 | -0.1 | 1.4 |
| Bouton CTA principal | ui | 17 | 600 | -0.2 | — |
| Section header (uppercase) | ui | 11 | 600 | 1.4 | — |
| Métadonnées | ui | 11.5 | 500 | -0.1 | 1.4 |
| Timestamps + version | mono | 10.5–11 | 400 | — | 1.2 |

Toutes les sections d'en-tête de groupe (`SESSIONS RÉCENTES`, `CAPTURE`, etc.) sont en `text-transform: uppercase` avec `letter-spacing: 1.4` et taille 11 px.

### 2.7 Rayons (radius)

| Usage | Valeur |
|---|---|
| Coque iPhone | 48 |
| Bouton CTA principal de l'accueil | 22 |
| Carte session, carte sujet (résumé détaillé) | 18 |
| Carte standard (claim, méthode, source) | 14 |
| Carte intérieure (confidence, source row, mini-player) | 12 |
| Bottom sheet (top corners only) | 24 |
| Pill / chip / avatar / dot / badge | 999 (pleinement arrondi) |
| Bouton-icône carré (back, settings) | 12 |
| Touche clavier iOS | 8.5 |

### 2.8 Espacements de base
Pas de système 8 pt strict ; les paddings horizontaux dominants sont **16 px** (transcript, listes) ou **20 px** (header d'accueil). Le `gap` vertical entre cartes est **10 px** dans le flux live et **8 px** dans la timeline.

### 2.9 Ombres et lifting

| Élément | Box-shadow |
|---|---|
| iPhone (hors device) | `0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)` |
| Bouton CTA accueil | `0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 30px -16px rgba(22,20,19,0.45)` |
| Bottom-bar floating (live) | `0 10px 30px -8px rgba(22,20,19,0.4)` |
| Screen-jump tab (hors device) | `0 8px 24px rgba(0,0,0,0.18)` |
| Pill iOS (light) | `0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)` |
| Bottom sheet | `0 -10px 30px rgba(0,0,0,0.18)` |
| Toggle switch | `0 1px 3px rgba(0,0,0,0.2)` (sur le rond mobile) |

### 2.10 Animations

```css
@keyframes pulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%      { transform: scale(1.4); opacity: 0.55; }
}
.pulse { animation: pulse 1.6s ease-in-out infinite; }

@keyframes sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
/* le bottom sheet utilise: animation: sheet-up 0.3s cubic-bezier(0.2,0.8,0.2,1); */

@keyframes dotBounce {
  0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
  40%           { transform: translateY(-3px); opacity: 1; }
}
/* chaque dot du loader "Analyse en cours" a son delay: 0s, 0.15s, 0.30s */
```

## 3. Composants partagés (`ui.jsx`)

### 3.1 `Icon`
Bibliothèque d'icônes line-style, viewBox `0 0 24 24`, stroke 1.6, linecap/linejoin "round". Taille par défaut 20 px. Liste des icônes utilisées :

`mic`, `pause`, `play`, `stop`, `chevron-l/r/d/u`, `close`, `plus`, `filter`, `list`, `timeline`, `doc`, `share`, `flag`, `link`, `search`, `settings`, `check`, `cross`, `warn`, `info`, `wave`, `users`, `sparkle`.

Toutes sont définies en SVG inline dans `Icon` — pas de dépendance externe.

### 3.2 `VerdictChip`
Pilule arrondie. Deux tailles : `sm` (text 11, padding `2px 9px 2px 8px`, dot 6 px) et `md` (text 12.5, padding `4px 11px 4px 9px`, dot 8 px).

Structure : `[dot rond hue] [label short]` sur fond `soft`, texte `ink`. Toujours `font-weight: 600`, `letter-spacing: -0.1`.

Cas spécial `OPINION` : pas de fond, bordure dashed `rule`, texte `inkMute` en uppercase letter-spacing 0.6, label littéral `« opinion · non vérifié »`.

### 3.3 `SpeakerDot`
Disque coloré avec l'initiale du locuteur en blanc dessus. Taille paramétrable (par défaut 22). Police `--font-ui`, `font-weight: 600`, `font-size: size * 0.45`. La couleur vient de `SESSION.speakers[].color`.

### 3.4 `ConfidenceDots`
Trois petits points alignés (5 px chacun, gap 3 px). Le nombre rempli (`ink`) correspond au niveau (`high`=3, `medium`=2, `low`=1) ; les non-remplis sont en `rule`. Suivi du libellé `« confiance {label} »` en 11 px lowercase `inkMute`.

### 3.5 `fmtT(sec)`
Formatte un nombre de secondes en `mm:ss` ou `hh:mm:ss` si > 1 h. Padding zéros à 2 chiffres.

### 3.6 Glass pill (iOS, `IOSGlassPill`)
Pilule de hauteur 44 px utilisée dans la nav bar iOS native. Backdrop-filter `blur(12px) saturate(180%)`, fond blanc translucide 50%, shine intérieure et bordure de 0.5 px. Réplicable en CSS pur. Réservée aux "rappels" iOS (par exemple le bouton retour iOS dans une nav bar native), pas aux écrans de l'app proprement dite.

## 4. Coque iOS (`ios-frame.jsx`)

Fournit `IOSDevice`, `IOSStatusBar`, `IOSNavBar`, `IOSGlassPill`, `IOSList`, `IOSListRow`, `IOSKeyboard`. Tous accessibles via `window.*`.

`IOSDevice` enveloppe l'app dans une coque de `width × height` (par défaut 390 × 844 dans le mockup), radius 48, shadow forte, dynamic island en absolute. La status bar est superposée en absolute avec `padding: 21px 24px 19px` (heure à gauche, batterie/wifi/signal à droite). Le home indicator (139×5, radius 100) est un absolu en bas, z-index 60, pointer-events none.

Les écrans de Plumb (home/live/timeline/summary/settings) **n'utilisent pas la `IOSNavBar`** et reproduisent à la place leur propre top bar sur fond `bg`, avec un bouton retour carré rounded 12 (36×36).

## 5. Données de référence (mock)

### 5.1 `SESSION`
```js
{
  id: 's-2026-04-22',
  title: 'Débat — Politique du logement',
  source: 'Capture micro · salon',
  date: '22 avril 2026',
  startedAt: '20:42',
  durationSec: 47*60 + 18,   // 2838 s, 47:18
  speakers: [
    { id: 'A', name: 'Hélène Marquet', role: 'Députée',     color: 'oklch(0.62 0.10 250)' },
    { id: 'B', name: 'Damien Roche',   role: 'Économiste',  color: 'oklch(0.62 0.10 30)'  },
    { id: 'C', name: 'Animateur',      role: 'Modérateur',  color: 'oklch(0.55 0.005 280)' },
  ],
}
```

### 5.2 `CLAIMS` (10 éléments)
Forme : `{ id, t (start sec), end (sec), speakerId, text, verdict, confidence, rationale, sources[] }`. Les opinions n'ont que `verdict: 'OPINION'`. Listing complet dans `prototype/project/data.js` — à reprendre tel quel pour la prévisualisation.

Distribution dans la session de référence : V1×2, V2×1, V3×1, V4×1, V5×1, V6×1, V7×1, V8×1, OPINION×1 (10 claims, 9 vérifications).

### 5.3 `SUMMARIES`
Deux strings prêts à afficher :
- `tldr` (1-3 phrases dramatisant le débat sur le logement et chiffrant 9 vérifications sur 47 min).
- `normal` (paragraphe de ~6-8 phrases qui synthétise les 2 positions et pointe le désaccord central sur l'encadrement des loyers).

Le résumé détaillé est synthétisé côté UI à partir d'un objet `topics` codé en dur dans `screen-summary.jsx` (4 sujets : Production de logement social / Coût pour les locataires / Encadrement des loyers / Aides à l'accession).

## 6. Architecture applicative côté UI

### 6.1 Routage
État local `screen` dans `App` : `home | live | timeline | summary | settings`. Pas de router, transitions instantanées. Un état séparé `openClaim` (ID ou null) déclenche le bottom sheet de verdict en overlay.

### 6.2 Hiérarchie d'écrans
```
App
├── HomeScreen        → onStart, onOpenSession, onOpenSettings
├── SettingsScreen    → onBack
├── LiveScreen        → onBack, onOpenClaim, onOpenTimeline, onOpenSummary
├── TimelineScreen    → onBack, onOpenClaim
├── SummaryScreen     → onBack
└── VerdictSheet      → claimId, onClose   (overlay)
```

### 6.3 ScreenJump (debug)
Un onglet flottant fixé bas/centre **hors** du device frame permet de sauter directement à `home/live/timeline/summary` pendant le développement. Style : pill noire glassy `rgba(22,20,19,0.92)` avec backdrop-blur 20 px, item actif en blanc plein, items inactifs `rgba(255,255,255,0.7)`. À retirer en production.

### 6.4 Panneau de tweaks
`TweaksPanel` exposé en latéral (hors maquette) pour ajuster `fontPair`, `density`, `verdictStyle`, `showOpinions`. Les défauts sont sérialisés dans le bloc `EDITMODE-BEGIN/END` de `app.jsx`. Implémentation détail : fournie par `tweaks-panel.jsx` du paquet design ; non requise en production.

## 7. Spécifications écran par écran

### 7.1 Écran `HomeScreen` — accueil

Background : `bg`. Padding-top du top bar : 60 px (laisse passer status bar + dynamic island).

**Top bar (60 0 0)**
- À gauche : marque `Plumb` (italique sérif 17, weight 500, letter-spacing -0.3) suivi de `· fact-checker` en `inkMute` regular non-italique.
- À droite : icon-button carré 36×36 radius 12 bordé `ruleSoft` sur fond `bgRaised`, contenant l'icône `settings` 18 px stroke `inkSoft`.

**Hero (32 20 22)**
- Titre H1 sérif 40, ligne 1.02, letter-spacing -1.2, weight 400. Texte sur 2 lignes avec `<br/>` :
  > Vérifiez ce<br/>qui se dit, *à mesure*

  Le mot « à mesure » est `font-style: italic` et `inkSoft`.
- Sous-titre : 14 px ui, `inkSoft`, line-height 1.5, max-width 320, letter-spacing -0.1.
  > Posez le téléphone, lancez l'écoute. Affirmations isolées, sources retrouvées, verdict en moins de 30 secondes.

**Bouton "Démarrer l'écoute" (4 20 8)**
- Largeur 100 %, padding 20 22, radius 22, fond `accent`, texte `accentInk`. Box-shadow listée § 2.9.
- À gauche, cercle 46×46 radius 99 fond `oklch(0.62 0.15 25)` (rouge enregistrement), ombre `0 0 0 4px rgba(255,255,255,0.06)` (anneau subtil), icône `mic` 22 stroke blanc.
- Texte titre `Démarrer l'écoute` ui 17 weight 600 letter-spacing -0.2 ; sous-texte `Micro · Français détecté` ui 12.5 `rgba(251,249,245,0.6)` margin-top 2.
- Chevron-r 20 stroke `rgba(251,249,245,0.5)` à droite.

**Bandeau de sources de capture (14 20 8)**
Quatre chips arrondies pleines pill (radius 99), padding 8 12, font ui 12.5, fond `bgRaised`, bordure `ruleSoft`, texte `inkSoft` :
- `Micro` (icône `mic`)
- `Son système` (icône `wave`)
- `Fichier` (icône `doc`)
- `Lien` (icône `link`)

**En-tête de section (28 20 12)**
- Gauche : `SESSIONS RÉCENTES` (uppercase ui 11 weight 600 letter-spacing 1.4, `inkMute`).
- Droite : `Tout voir` (ui 12.5 `inkSoft`).

**Liste des sessions (0 20 24, gap 10)**
Carte `SessionCard` :
- Padding 14 16 13, radius 18, fond `bgRaised`, bordure 1 px `ruleSoft`. Si `ongoing` : ajouter une halo box-shadow `0 0 0 2px oklch(0.62 0.15 25 / 0.18)` (anneau rouge tamisé).
- Tête : titre serif 17 weight 500 letter-spacing -0.3 line-height 1.25 sur 1-2 lignes. Métadonnées en dessous (gap 4) : `inkMute` ui 12, avec si `ongoing` un préfixe `LIVE` rouge (`oklch(0.55 0.18 25)` weight 600) précédé d'un dot `.pulse` 6 px `oklch(0.62 0.18 25)`. Séparateurs `·` en `rule`.
- Chevron-r 18 `inkMute` à droite.
- **Bande de verdicts** en bas : barre 6 px de hauteur, radius 99, fond `ruleSoft`, contenant des segments flex proportionnels aux comptes par verdict (couleur `hue`). L'ordre est strictement `V1, V2, V3, V4, V5, V6, V7, V8`. C'est le résumé visuel de la session.

**Footnote (0 20 28)**
Petit message ui 11.5 `inkMute` line-height 1.5 avec icône `info` 13 :
> Cet outil n'est pas un détecteur de mensonge. Il vérifie des faits, pas des intentions.

**Sessions du mock (à reproduire pour la maquette)**
- `Débat — Politique du logement` — *ongoing* — `En cours · 47:18 · 9 vérifications` — distribution V1:2, V2:1, V3:1, V4:1, V5:1, V6:1, V8:1.
- `Émission radio — matinale` — `Hier · 1:12:04 · 18 vérifications` — V1:6, V2:3, V3:2, V4:1, V5:2, V6:1, V7:1, V8:2.
- `Conférence — climat & habitat` — `14 avril · 38:50 · 11 vérifications` — V1:5, V2:2, V4:2, V8:2.
- `Discussion entre amis (salon)` — `9 avril · 22:14 · 4 vérifications` — V1:1, V3:1, V7:1, V8:1.

### 7.2 Écran `LiveScreen` — capture en direct

Background : `bg`. Top bar à `padding: 58px 16px 0`.

**Top bar**
1. Bouton retour 36×36 radius 12 (border `ruleSoft`, fond `bgRaised`), icône `chevron-l` 18 stroke `inkSoft`.
2. **Live status pill** flex 1, padding 7 12, radius 99, border `ruleSoft`, fond `bgRaised`. Contenu :
   - Dot `.pulse` 7×7 (rouge `oklch(0.62 0.18 25)` quand actif, `inkMute` en pause).
   - Bloc texte (1 ligne titre + 1 ligne meta) :
     - `Écoute · Micro` (ui 12, weight 600, `ink`) ou `En pause` quand pause.
     - `mm:ss · FR` (mono 10.5, `inkMute`).
   - Bouton play/pause 28×28 radius 99 fond `accent`, icône `pause`/`play` 13 blanche.

**Bandeau locuteurs (12 16 8)**
Pill horizontale fond `bgRaised`, border `ruleSoft`, padding 6 10 6 6, radius 99. Pour chaque locuteur : `SpeakerDot` 20 + prénom (split sur l'espace) en ui 11.5 `inkSoft`. Gap 8 entre locuteurs, 5 entre dot et nom.

À droite (flex spacer) : compteur ui 11.5 `inkMute` du type `9 vérifications` (compte des claims non-OPINION ≤ now).

**Filtres (0 16 6)**
Chips horizontales scrollables si overflow. Padding 6 12, radius 99, ui 12.
- État inactif : border `ruleSoft`, fond `bgRaised`, texte `inkSoft`.
- État actif : border `ink`, fond `ink`, texte `accentInk`, weight 600.

Filtres : `Tout`, `Affirmations factuelles`, `À surveiller` (ce dernier = verdicts V3, V5, V6, V4).

**Flux principal (8 16 200, gap 10)**

`AnalyzingCard` (visible quand non-pause) :
- Padding 12 14, radius 14, fond `bgRaised`, border dashed `rule`.
- Trois dots animés (6×6 fond `ink`, animation `dotBounce`, delays 0 s/0.15 s/0.30 s).
- Texte ui 12.5 `inkSoft` : `Analyse en cours… · 1 affirmation détectée`.
- Timestamp mono 10.5 `inkMute` aligné à droite (`now - 4` secondes).

`ClaimCard` :
- Padding 13 14 14, radius 14, fond `bgRaised`, border 1 `ruleSoft`. **Border-left 3 px** de la couleur `hue` du verdict (ou `rule` pour OPINION).
- En-tête (gap 8, marginBottom 8) : `SpeakerDot` 20 → nom complet (ui 12 weight 600 `ink`) → `·` `rule` → timestamp mono 11 `inkMute` → flex spacer → `VerdictChip size="sm"`.
- Citation : `display` 16.5, line-height 1.32, `ink`, weight 400, letter-spacing -0.2. Encadrée de guillemets français `«  »` (espaces insécables). Si OPINION : italique + `inkMute`.
- Si non-OPINION et `rationale` présente : séparateur dashed `ruleSoft` 10 px de marge en haut, puis paragraphe ui 12.5 `inkSoft` line-height 1.5.
- Pied de carte : `ConfidenceDots` à gauche, à droite icône `link` 12 + `{n} sources` ui 11.5 `inkMute`.
- Cliquable uniquement si non-OPINION → `onOpenClaim(claim.id)`.

L'ordre d'affichage est **antichronologique** (`reverse()`), nouveaux en haut. En bas du flux, message ui 11.5 `inkMute` centré : `Début de session — {SESSION.startedAt}`.

**Bottom bar flottante**
Position absolute `left:12 right:12 bottom:28`, padding 6, radius 22, fond `rgba(22,20,19,0.94)`, backdrop-blur 20, shadow listée. Quatre `BarBtn` flex 1, layout vertical icône+label :
- `Flux` (icône `list`) — actif (fond `rgba(255,255,255,0.10)`, texte blanc).
- `Timeline` (icône `timeline`).
- `Résumé` (icône `sparkle`).
- `Arrêter` (icône `stop`) — couleur spéciale `oklch(0.78 0.15 25)` (rouge clair).

Les inactifs sont `rgba(255,255,255,0.62)` weight 500.

### 7.3 Écran `TimelineScreen` — frise rejouable

Background : `bg`. Top bar à `padding: 58px 16px 0` :
- Bouton retour identique au LiveScreen.
- Centre, deux lignes empilées : `TIMELINE · 47:18` (ui 10.5 uppercase letter-spacing 1.4 weight 600 `inkMute`) puis `Politique du logement` (display 15 weight 500 `ink`).
- Bouton filtre 36×36 radius 12 avec icône `filter`.

**TimelineCanvas (20 16 12)**
Visualisation interactive de la session. Hauteur totale 96 + 18 (axe et timestamps).
- Axe horizontal : 1 px haut `rule`, posé à `bottom: 18`.
- **Heatmap** : 24 buckets à largeur égale (gap 1 px), hauteur proportionnelle au nombre de claims dans le bucket. Chaque bucket est une mini-stack column-reverse de couleurs `hue` du verdict. Buckets vides → un trait de 2 px `ruleSoft`.
- **Ticks précis** par claim : pour chaque claim, un trait vertical 2×6 à `left: (t/duration)*100%`, couleur `hue` du verdict. Permet de retrouver visuellement la position d'une affirmation.
- **Playhead** : ligne verticale 2 px noire `ink` traversant la zone, surmontée d'un disque 12×12 noir bordé 2 px `bg`. Position `left: (scrub/duration)*100%`. Cliquer sur le canvas met à jour `scrub`.

Sous le canvas, ligne mono 10.5 `inkMute` avec `00:00` à gauche, `{fmtT(scrub)}` au centre, `{fmtT(dur)}` à droite.

**Mini-player (4 16 14)**
Card 10 12, radius 14, `bgRaised`, border `ruleSoft`. Bouton play 36×36 radius 99 noir + texte `Lecture du passage à 14:07` (ui 12.5 weight 600) et sous-texte `Glissez la frise pour sauter ailleurs` (ui 11). À droite, badge mono `1.0×`.

**Toggle de groupage (0 16 8)**
Trois boutons flex 1, padding 7 8, radius 10. Actif : fond `ink`, texte `accentInk`, weight 600. Inactif : fond transparent, texte `inkSoft`. Valeurs : `Chronologique`, `Par locuteur`, `Par verdict`.

Quand `Par locuteur`, regrouper par `speakerId`. Quand `Par verdict`, regrouper et trier dans l'ordre `V6, V5, V3, V4, V2, V1, V8, V7` (faux et trompeur en premier — c'est un design éditorial).

**Liste groupée (6 16 100, gap 16)**
Pour chaque groupe :
- En-tête (4 4 8) : ui 11 weight 600 uppercase letter-spacing 1.4 `inkMute`, précédé d'un `SpeakerDot` 16 si `Par locuteur` ou d'un dot 8×8 `hue` si `Par verdict`. Suivi d'un `·` puis du compteur.
- Liste de `TimelineRow` (gap 8) :
  - Card 10 12, radius 12, `bgRaised`, border `ruleSoft`, **border-left 3 px** `hue` du verdict.
  - À gauche, colonne 50 px : timestamp mono 11 `inkMute`.
  - À droite, citation display 13.5 line-height 1.35, **clamp 2 lignes** (`-webkit-line-clamp: 2`).
  - Sous la citation : `SpeakerDot` 14 + prénom ui 11 `inkSoft` + flex spacer + `VerdictChip size="sm"`.
  - Au clic : `setScrub(c.t)` puis `onOpenClaim(c.id)`.

### 7.4 Écran `SummaryScreen` — résumés

Background : `bg`. Top bar à `padding: 58px 16px 0` :
- Bouton retour standard.
- Centre : `RÉSUMÉ DE SESSION` (ui 10.5 uppercase letter-spacing 1.4 weight 600 `inkMute`).
- Bouton partage 36×36 radius 12 avec icône `share`.

**Header (14 16 80)**
- Titre `display` 26 line-height 1.15 letter-spacing -0.6 : `Politique du logement` avec « logement » en italique.
- Méta ui 12.5 `inkMute` : `Couverture · 00:00 — 47:18 · 9 affirmations`.

**Switcher de niveau**
Conteneur padding 4, radius 14, `bgRaised`, border `ruleSoft`, flex gap 4. Trois pills flex 1 (radius 10, padding 8 6) :
- Actif : fond `ink`, texte `accentInk`.
- Inactif : fond transparent, `inkSoft`.

Chaque pill empile deux lignes :
- Label 12.5 (weight 600 si actif).
- Sub label 10 opacity 0.65 indiquant le temps de lecture cible : `10 s`, `1 min`, `3-5 min`.

Valeurs : `TL;DR | Normal | Détaillé`.

**Vue TL;DR**
Card 16 16, radius 16, `bgRaised`, border `ruleSoft`. Texte display 17.5 line-height 1.45 letter-spacing -0.2 weight 400. Contenu = `SUMMARIES.tldr`.

**Vue Normal**
Card identique mais texte display 15 line-height 1.55 letter-spacing -0.1. Contenu = `SUMMARIES.normal`.

**Vue Détaillé**
Stack de cards (gap 12) — une par sujet. Chaque card :
- Padding 14 14, radius 14, `bgRaised`, border `ruleSoft`.
- Titre display 16 weight 500 letter-spacing -0.2 `ink`.
- Lead ui 12.5 `inkSoft` line-height 1.5 (margin-top 4).
- Liste de claims associés (margin-top 10, gap 6) : pour chaque claim, ligne avec séparateur dashed `ruleSoft` en haut, padding 6 0, contenant `SpeakerDot` 16 + texte ui 12 `inkSoft` (1 ligne avec ellipsis) + `VerdictChip size="sm"`.

Topics du mock (à coder en dur dans la maquette) : `Production de logement social` (claims c1 c9), `Coût pour les locataires` (c3 c7), `Encadrement des loyers` (c4 c8), `Aides à l'accession` (c6).

**Card "Répartition des verdicts" (18 14 12)**
- Header ui 11 weight 600 uppercase letter-spacing 1.4 `inkMute` : `Répartition des verdicts`.
- Barre de stack 8 px radius 99 fond `ruleSoft`, segments flex selon `counts[k]`, ordre V1..V8.
- Grille 2 colonnes (gap 6×12) : pour chaque verdict présent, ligne `[dot 7] [name flex inkSoft] [count weight 600 ink]`.

**Card "Rafraîchissement automatique"**
Card 12 14, radius 14, border `ruleSoft`. Icône `sparkle` 18 `inkSoft`, bloc texte titre+sub, `Toggle` à droite. Sub : `Régénère le résumé toutes les 5 min`.

**Disclaimer obligatoire (REQ-F-30)**
Card 12 14, radius 12, fond `oklch(0.96 0.04 90)` (jaune ambré tamisé), border `oklch(0.86 0.05 90)`. Icône `warn` 15 stroke `oklch(0.42 0.07 90)`. Texte ui 11.5 line-height 1.45 `oklch(0.32 0.07 90)` :
> Résumé généré automatiquement, peut omettre ou simplifier des points. Vérifiez la transcription complète pour les passages importants.

**Footer**
Mono 10 `inkMute` centré : `Généré il y a 2 min · v0.4`.

### 7.5 Écran `SettingsScreen` — réglages

Background : `bg`. Top bar à `padding: 58px 16px 0` (retour + label `RÉGLAGES` centré + spacer 36).

**Titre (12 20 4)**
Display 32 letter-spacing -0.8 line-height 1.05 weight 400 :
> Réglages *& confidentialité*

(« & confidentialité » en italique `inkSoft`.)

**Carte de profil (14 14, radius 16, `bgRaised`)**
- Avatar 42×42 radius 99 `accent` avec lettre `P` italique sérif 19 (`accentInk`).
- Bloc texte : `Mode anonyme local` (ui 14 weight 600 `ink`) + `Aucun compte · sessions stockées sur cet appareil` (ui 11.5 `inkMute`).
- Bouton outline pill `Créer un compte` (border `ink`, padding 7 12, ui 11.5 weight 600).

**Sections** (gap 18 entre sections)
Chaque section a un header (icon 13 + label uppercase) suivi d'un container `bgRaised` border `ruleSoft` radius 16 contenant des `Row` séparées par 1 px `ruleSoft`.

`Row` : padding 12 14, label ui 13.5 weight 500 `ink`, sub ui 11.5 `inkMute` line-height 1.4, contrôle à droite (Toggle 42×24 ou texte sélecteur + chevron).

`Toggle` : pill 42×24, fond `accent` quand actif sinon `rule`, rond intérieur 20×20 blanc avec shadow douce, transition 0.18 s.

**Sections à reproduire (ordre verbatim)**

1. **Capture audio** (icône `mic`)
   - Toggle `Détection automatique de la langue` — sub `FR ou EN détectées sur les 5 premières secondes`.
   - Toggle `Capture du son système` — sub `Pour les vidéos YouTube et émissions en direct`.
   - Toggle `Confirmation avant écoute` — sub `Demander une validation à chaque démarrage`.
   - SelectRow `Langue de l'interface` → valeur `Français`.
   - SelectRow `Voix par défaut` → valeur `Sans préférence`.

2. **Confidentialité** (icône `users`, ton `warn` — header en `oklch(0.45 0.15 25)`)
   - Toggle `Conserver l'audio brut` — sub `Permet le replay des passages — chiffré localement`.
   - Toggle `Chiffrement au repos` — sub `AES-256 sur les sessions stockées`.
   - Toggle `Empreinte vocale (V1, opt-in)` — sub `Reconnaissance de personnalités publiques uniquement`.
   - Toggle `Vérification cloud` — sub `Envoie le texte (jamais l'audio brut) aux moteurs de recherche`.

3. **Stockage local** (icône `doc`)
   - `StorageBar` : ligne `1,8 Go utilisés sur 5 Go` à gauche, `12 sessions` mono à droite. Barre 8 px radius 99 fond `ruleSoft` avec deux segments : 28 % `accent` (audio), 6 % `oklch(0.62 0.10 250)` (transcriptions). Légende sous la barre : `Audio · 1,4 Go`, `Transcriptions · 320 Mo`, `Libre · 3,2 Go`.
   - ActionRow `Alléger les sessions` (icône `wave`) — sub `Supprime l'audio, garde transcriptions et verdicts`.
   - ActionRow `Exporter toutes les sessions` (icône `share`) — sub `Markdown · PDF · JSON`.
   - ActionRow `Effacer tout l'historique` (icône `cross`, **tone danger** texte `oklch(0.5 0.16 25)`) — sub `Action irréversible — RGPD droit à l'effacement` — déclenche `ConfirmEraseDialog`.

4. **Verdicts** (icône `check`)
   - Toggle `Afficher les sources tier 4` — sub `Wikipedia, encyclopédies — utile mais à recouper`.
   - Toggle `Envoyer mon feedback sur les verdicts` — sub `Aide à améliorer la qualité — anonyme`.
   - ActionRow `Glossaire des 8 verdicts` (icône `info`).
   - ActionRow `Méthodologie publique` (icône `link`).

5. **Accessibilité** (icône `settings`)
   - Toggle `Contraste élevé`.
   - Toggle `Grandes tailles`.
   - Toggle `Lecture vocale des verdicts` — sub `Lecteur d'écran — RGAA / WCAG 2.1 AA`.

6. **À propos** (icône `info`)
   - ActionRow `Conditions d'utilisation` (icône `doc`).
   - ActionRow `Politique de confidentialité` (icône `doc`).
   - ActionRow `Liste des prestataires` (icône `users`) — sub `ASR, recherche, hébergement`.
   - ActionRow `Contester un verdict produit publiquement` (icône `flag`).

**Footer mono**
`Plumb · v0.4.2-mvp · build 2026.04.22` (texte mono 10.5 `inkMute` centré).

**`ConfirmEraseDialog`**
Overlay plein écran `rgba(22,20,19,0.55)`, dialog max 320 px, padding 20 18 14, radius 18, fond `bg` border `rule` shadow forte.
- Cercle 44×44 `oklch(0.94 0.05 25)` avec icône `warn` 20 `oklch(0.45 0.18 25)`.
- Titre display 19 letter-spacing -0.3 centré : `Effacer tout l'historique ?`
- Sub ui 12.5 `inkSoft` centré line-height 1.5 : `12 sessions, 1,8 Go d'audio et toutes les vérifications seront définitivement supprimés.`
- Boutons côte à côte : `Annuler` (outline) et `Effacer` (fond `oklch(0.5 0.18 25)` blanc).

### 7.6 Bottom sheet `VerdictSheet`

Overlay full-screen, fond `rgba(22,20,19,0.4)`. Au clic dehors → `onClose`. La sheet se déploie depuis le bas avec animation `sheet-up 0.3s cubic-bezier(0.2,0.8,0.2,1)`.

**Conteneur sheet** : fond `bg`, top corners radius 24, max-height 88 %, shadow `0 -10px 30px rgba(0,0,0,0.18)`.

**Grabber** (8 0 4) : barre 38×4 radius 99 `rule` centrée.

**Header verdict** (8 20 18)
- Fond = `verdict.soft`, séparateur bas 1 px `ruleSoft`.
- Ligne du haut (margin-bottom 10) :
  - Gauche : badge ui 11 uppercase letter-spacing 1.4 weight 600 `verdict.ink` précédé d'un dot 9×9 `verdict.hue` : `Verdict · {verdict.name}`.
  - Droite : bouton close 30×30 radius 99 `rgba(255,255,255,0.5)` avec icône `close` 14 `verdict.ink`.
- Citation : display 22, line-height 1.22, letter-spacing -0.4, `ink`. Encadrée de guillemets `«  »`.
- Méta (margin-top 12) : `SpeakerDot` 18 + nom (ui 12 weight 600) + `·` + rôle italique colorisé `speaker.color` + `·` + timestamp mono 11.

**Tabs** (12 16 0, border-bottom `ruleSoft`)
Trois onglets : `Verdict`, `Sources ({n})`, `Méthodologie`. Onglet actif : weight 600, `ink`, border-bottom 2 px `ink` (margin-bottom -1). Onglet inactif : weight 500, `inkMute`.

**Body** (18 20 24, scrollable)

**Tab `Verdict`**
1. Sur-titre uppercase `EXPLICATION` (ui 11 weight 600 letter-spacing 1.4 `inkMute`).
2. Bloc display 17 line-height 1.45 letter-spacing -0.2 `ink` : la `rationale` du claim (ou fallback "Aucune explication disponible.").
3. Si l'utilisateur déplie : paragraphe additionnel ui 13.5 line-height 1.55 `inkSoft` qui explique la méthodologie en clair, avec un complément spécial si `confidence === 'low'`.
4. Lien `Lire l'explication détaillée` / `Réduire` ui 12 weight 500 `inkSoft` souligné `rule` underline-offset 3.
5. Card "Confiance" (margin-top 18) : 12 14 radius 12 `bgRaised` border `ruleSoft`. Header `CONFIANCE DANS LE VERDICT` (uppercase) à gauche, `ConfidenceDots` à droite. Sous-texte ui 12.5 `inkSoft` line-height 1.5 : `Indépendant du verdict lui-même : reflète la qualité et la convergence des sources trouvées.`
6. Bouton `Réécouter le passage` (margin-top 14) — full width, padding 12 14, radius 14, fond `accent`. Icon-bubble blanc translucide 32×32 avec `play`. Texte ui 13.5 weight 600 + sous-texte mono 11 `rgba(251,249,245,0.6)` : `mm:ss — mm:ss · {dur}s`. Chevron-r 16 à droite.
7. Card feedback (margin-top 18) : 14, radius 14, border `ruleSoft`. Question : `Ce verdict vous semble-t-il correct ?` (ui 12.5 `inkSoft`). 3 boutons flex 1 : `Correct` (icône `check`), `À revoir` (icône `cross`), `Source manquante` (icône `flag`). Chaque bouton padding 8 6 radius 10 border `ruleSoft` `bgRaised`, gap 5, ui 11.5.

**Tab `Sources`**
- Si `sources.length === 0` : card 14 radius 12 `bgRaised` border `ruleSoft`, texte ui 13 `inkSoft` line-height 1.5 : `Aucune source publique n'a pu être identifiée. Le verdict reste « non vérifié » par principe de prudence.`
- Sinon : stack de `SourceRow` (gap 10).

`SourceRow` : padding 12 14 radius 12 `bgRaised` border `ruleSoft`. En-tête (gap 8 marginBottom 6) : badge `Tier {n}` (padding 2 7 radius 99 fond `rgba(0,0,0,0.04)` ui 10.5 weight 600 letter-spacing 0.4 uppercase, couleur du tier — voir § 2.4) + host mono 11 `inkMute` + spacer + date mono 10.5 `inkMute`. Titre display 14.5 line-height 1.35 letter-spacing -0.1. Pied : icône `link` 12 + `Ouvrir la source` (ui 11.5 `inkSoft`).

**Tab `Méthodologie`**
- Card d'introduction 12 14 radius 12 `bgRaised` border `ruleSoft` ui 12.5 `inkSoft` line-height 1.55 : `Cette affirmation a été classée comme [statistique publique / projection à long terme]. Voici comment le verdict a été construit, étape par étape.` (Le type est dérivé du verdict — V7 → projection ; sinon statistique publique pour le mock.)
- Stepper vertical : 6 étapes, à gauche cercle numéroté (22 px radius 99 `bgRaised` border `rule`, mono 10.5 weight 600 `ink`) avec ligne de connexion entre cercles (1 px `rule` flex 1). À droite, titre ui 13 weight 600 + détail ui 12.5 `inkSoft` line-height 1.5.

Étapes (verbatim, à reproduire) :
1. **Catégorisation** — `statistique publique` (ou `projection` si V7).
2. **Décomposition** — `1 sous-affirmation`.
3. **Recherche ciblée** — `INSEE, Eurostat, AFP, OCDE — domaines tier 1 priorisés`.
4. **Lecture de sources** — `{n} documents en plein texte`.
5. **Synthèse argumentée** — `verdict candidat + niveau de confiance`.
6. **Garde-fous post-LLM** — `downgrade appliqué (confiance faible)` si `confidence === 'low'`, sinon `aucun ajustement nécessaire`.

## 8. Patterns d'interaction

- **Bottom sheet** : appel via `onOpenClaim(claim.id)` depuis Live, Timeline, ou Detailed summary. Fermeture par tap dehors, sur grabber, ou sur le X.
- **Saut audio depuis timeline** : tap sur ligne → `setScrub(t)` puis ouverture du verdict sheet. Tap sur le canvas → met juste à jour le scrub sans ouvrir de sheet.
- **Pause** : sur `LiveScreen`, le bouton play/pause arrête le tick simulé. `paused` masque la `AnalyzingCard` et change la couleur du dot pulse (rouge → `inkMute`) et le label (`Écoute · Micro` → `En pause`).
- **Filtres live** : `Tout` montre tout sauf rien ; `Affirmations factuelles` exclut `OPINION` ; `À surveiller` ne garde que V3, V4, V5, V6.
- **Switch de groupage timeline** : recalcule la liste avec `useMemo`. Pour `Par verdict`, l'ordre est éditorialisé (V6 en premier).

## 9. Internationalisation

- Tous les libellés sont en français dans la maquette. Pour l'EN : prévoir un dictionnaire `i18n` clé→string pour les labels d'UI listés exhaustivement dans ce document. Les noms des verdicts viennent de `tokens.verdicts[code].name|short` — donc la traduction se fait au niveau des tokens.
- Les heures (`startedAt: '20:42'`, `date: '22 avril 2026'`) sont des strings de la session, pas calculées — à formatter selon la locale réelle en production.

## 10. Accessibilité (visée WCAG 2.1 AA)

- Toutes les interactions cliquables sont des `<button>` natifs (pas de `<div onClick>` non sémantique en production).
- Contraste : `ink #161413` sur `bg #F4F1EC` = ratio > 12:1, OK. Surveiller `inkMute` sur `bgRaised` (ratio ~3.5:1) pour les sub-labels — utiliser `inkSoft` si AA strict requis.
- Cibles tactiles ≥ 44×44 dans la pratique (les boutons d'icônes 36×36 doivent être agrandis en zones tactiles invisibles si testés sur device réel).
- Les couleurs des verdicts ne portent pas l'information seule : un libellé textuel (`Faux`, `Trompeur`...) accompagne toujours le dot de couleur.
- Toggle `Lecture vocale des verdicts` dans `SettingsScreen` permet la lecture vocale via le screen reader (à brancher en dev).

## 11. Liste exhaustive des libellés (FR)

Section condensée pour faciliter la traduction.

```
Plumb · fact-checker
Vérifiez ce qui se dit, à mesure
Posez le téléphone, lancez l'écoute. Affirmations isolées, sources retrouvées, verdict en moins de 30 secondes.
Démarrer l'écoute
Micro · Français détecté
Micro / Son système / Fichier / Lien
SESSIONS RÉCENTES / Tout voir
Cet outil n'est pas un détecteur de mensonge. Il vérifie des faits, pas des intentions.

Écoute · Micro / En pause
Tout / Affirmations factuelles / À surveiller
Analyse en cours… · 1 affirmation détectée
Début de session — {time}
Flux / Timeline / Résumé / Arrêter

TIMELINE · {duration}
Lecture du passage à {time} / Glissez la frise pour sauter ailleurs
Chronologique / Par locuteur / Par verdict

RÉSUMÉ DE SESSION
TL;DR (10 s) / Normal (1 min) / Détaillé (3-5 min)
Couverture · 00:00 — {duration} · {n} affirmations
Répartition des verdicts
Rafraîchissement automatique / Régénère le résumé toutes les 5 min
Résumé généré automatiquement, peut omettre ou simplifier des points. Vérifiez la transcription complète pour les passages importants.
Généré il y a 2 min · v0.4

RÉGLAGES
Réglages & confidentialité
Mode anonyme local / Aucun compte · sessions stockées sur cet appareil / Créer un compte
Capture audio / Confidentialité / Stockage local / Verdicts / Accessibilité / À propos
Effacer tout l'historique ? / Annuler / Effacer
Plumb · v0.4.2-mvp · build 2026.04.22

Verdict · {name}
Explication / Lire l'explication détaillée / Réduire
Confiance dans le verdict / Indépendant du verdict lui-même : reflète la qualité et la convergence des sources trouvées.
Réécouter le passage
Ce verdict vous semble-t-il correct ? / Correct / À revoir / Source manquante
Sources ({n})
Aucune source publique n'a pu être identifiée. Le verdict reste « non vérifié » par principe de prudence.
Tier {n} / Ouvrir la source
Méthodologie / Catégorisation / Décomposition / Recherche ciblée / Lecture de sources / Synthèse argumentée / Garde-fous post-LLM
```

## 12. Checklist de reconstruction

À cocher pour valider qu'un build de l'UI est conforme :

1. Tokens couleur, typo, radius, ombres exactement repris.
2. 5 écrans présents et navigables : Home → Live → (Timeline ou Summary) → retour Live, Home → Settings.
3. Bottom sheet de verdict ouvrable depuis Live et Timeline.
4. Le bouton "Démarrer l'écoute" de l'accueil utilise bien la bulle rouge `oklch(0.62 0.15 25)`.
5. Les `SessionCard` affichent la **bande de verdicts** proportionnelle.
6. Le `LiveScreen` a un dot `.pulse` rouge dans le status pill et l'AnalyzingCard utilise les 3 dots `dotBounce` avec delays 0/0.15/0.3 s.
7. La `TimelineCanvas` produit une heatmap 24-buckets avec ticks précis ET un playhead cliquable.
8. Le `SummaryScreen` affiche bien le **disclaimer ambré** obligatoire (REQ-F-30).
9. Le verdict sheet a 3 onglets `Verdict / Sources / Méthodologie` et le stepper de méthodologie a 6 étapes.
10. Le `SettingsScreen` montre les 6 sections dans l'ordre exact, avec la section Confidentialité en `tone="warn"`.
11. Tous les `VerdictChip` non-OPINION ont **dot `hue` + label `short` + fond `soft` + texte `ink`**.
12. Le verdict `OPINION` est en pill dashed `inkMute`.
13. L'animation `sheet-up` joue bien à l'ouverture du bottom sheet.
14. Les boutons de feedback (Correct / À revoir / Source manquante) sont présents sur la tab Verdict.
15. La pill flottante `ScreenJump` n'apparaît **pas** dans le device frame (debug seulement).

## 13. Annexe — extraits de code de référence

### 13.1 Création d'un `VerdictChip` (composant minimal)

```jsx
function VerdictChip({ code, size = 'md' }) {
  if (code === 'OPINION') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: 999, border: `1px dashed ${T.rule}`,
        fontSize: size === 'sm' ? 11 : 12, color: T.inkMute,
        textTransform: 'uppercase', letterSpacing: 0.6,
      }}>opinion · non vérifié</span>
    );
  }
  const v = T.verdicts[code];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: size === 'sm' ? '2px 9px 2px 8px' : '4px 11px 4px 9px',
      borderRadius: 999, background: v.soft,
      fontSize: size === 'sm' ? 11 : 12.5, fontWeight: 600,
      color: v.ink, letterSpacing: -0.1, lineHeight: 1.2,
    }}>
      <span style={{
        width: size === 'sm' ? 6 : 8, height: size === 'sm' ? 6 : 8,
        borderRadius: 99, background: v.hue, flexShrink: 0,
      }} />
      {v.short}
    </span>
  );
}
```

### 13.2 Heatmap simplifiée de la timeline

```js
const buckets = 24;
const bucketSize = duration / buckets;
const heatmap = Array(buckets).fill(0).map(() => ({}));
claims.forEach(c => {
  const i = Math.min(buckets - 1, Math.floor(c.t / bucketSize));
  heatmap[i][c.verdict] = (heatmap[i][c.verdict] || 0) + 1;
});
```

Chaque bucket est rendu en `flex column-reverse` avec un `<div>` par verdict, dont le `flex` vaut le compte et le `background` la `hue`.

### 13.3 Verdict-strip d'une `SessionCard`

```jsx
const order = ['V1','V2','V3','V4','V5','V6','V7','V8'];
<div style={{
  display: 'flex', height: 6, borderRadius: 99,
  overflow: 'hidden', background: T.ruleSoft,
}}>
  {order.map(k => stripCounts[k] ? (
    <div key={k} style={{
      flex: stripCounts[k], background: T.verdicts[k].hue,
    }} />
  ) : null)}
</div>
```

Ce document est suffisant pour qu'un développeur sans accès à la maquette source produise une UI conforme. Les seules zones où la décision reste ouverte sont : (a) la stack technique du build (React + Vite vs SwiftUI), (b) le mode dark — la maquette est en clair uniquement, le mode sombre devra être conçu en V1.
