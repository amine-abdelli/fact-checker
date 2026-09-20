# 02 — Architecture technique

Ce document décrit comment l'application est construite. Les choix de stack ne sont pas définitifs ; pour chaque brique on a au moins deux options sérieuses, on tranchera au moment du POC.

## 1. Vue d'ensemble du pipeline

L'app est un pipeline temps-réel à 5 étages, chaque étage produisant un événement consommé par le suivant.

```
[Audio brut]
    │
    ▼
(1) CAPTURE  ──► segmente l'audio en fenêtres de 1 à 5 s
    │
    ▼
(2) ASR + DIARISATION  ──► transcription horodatée + label de locuteur
    │
    ├──────────────────────────┐
    ▼                          ▼
(3) EXTRACTION D'AFFIRMATIONS   (3 bis) RÉSUMÉ INCRÉMENTAL
    │                              │
    ▼                              │
(4) VÉRIFICATION                   │
    │                              │
    ▼                              ▼
(5) RENDU  ◄──── UI live + timeline + résumés + persistance + export
```

L'étage 3 bis tourne **en parallèle** de l'extraction et de la vérification. Il ne dépend pas des verdicts, mais peut les enrichir si disponibles au moment de la régénération.

Chaque étage écrit dans une queue/bus interne (in-memory au MVP, Redis ou équivalent en V1+) — c'est ce qui permet de remplacer un étage sans casser les autres (`REQ-NF-14`).

## 2. ADR (Architecture Decision Records)

### ADR-01 — Architecture en pipeline événementiel
**Décision** : pipeline asynchrone, étages communiquant par événements, plutôt qu'appel synchrone d'un orchestrateur.
**Pourquoi** : la latence des étages est très inégale (transcription = ~1 s, vérification = ~20 s). Un appel synchrone bloquerait l'UI ; un pipeline événementiel laisse chaque étage avancer à son rythme.
**Conséquence** : gestion d'état distribuée (état d'une affirmation = `extraite` → `en vérification` → `vérifiée` → `affichée`). Nécessite une bonne traçabilité (claim ID stable).

### ADR-02 — Local-first avec cloud optionnel
**Décision** : capture, ASR et UI tournent sur l'appareil de l'utilisateur. La vérification (étage 4) est cloud-hébergée.
**Pourquoi** : l'audio brut ne doit pas quitter l'appareil (`REQ-NF-07`). Mais la vérification a besoin de modèles trop lourds et d'accès web : c'est le cloud qui s'en charge, mais avec du **texte uniquement**, jamais de l'audio.
**Conséquence** : il faut un protocole client/serveur léger pour pousser des affirmations textuelles. WebSocket avec backpressure côté client.

### ADR-03 — Vérification = recherche + LLM avec garde-fou
**Décision** : pour vérifier une affirmation, l'app fait une recherche web (multi-source), agrège 5-10 documents, et passe le tout à un LLM avec une consigne stricte de produire un verdict structuré accompagné de sources.
**Pourquoi** : la connaissance pré-entraînée d'un LLM est insuffisante (date périmée, hallucinations). La recherche web donne du frais et du citable. Le LLM sert d'agrégateur structuré, pas d'oracle.
**Conséquence** : qualité du verdict ≈ qualité de la recherche × qualité du prompt × qualité du modèle. Voir `03-modele-fiabilite-sources.md`.

### ADR-04 — Modèle de verdict explicite, jamais binaire
**Décision** : 8 niveaux de verdict (cf. `03-modele-fiabilite-sources.md`), pas un score de 0 à 100.
**Pourquoi** : la binarité est un piège (vrai/faux ne couvre pas "trompeur" ni "obsolète"). Un score numérique donne une fausse sensation de précision.
**Conséquence** : il faut un classifieur multi-classes plus exigeant côté qualité, et un design UI qui n'écrase pas les nuances.

### ADR-05 — Le verdict est asserti, pas neutre
**Décision** : l'app produit un verdict (ex. "Factuellement faux") plutôt qu'une présentation neutre des sources.
**Pourquoi** : sinon l'utilité s'effondre. Mais on accompagne toujours d'une explication et d'un niveau de confiance.
**Conséquence** : risque légal accru (cf. `05-ethique`). Doit être assumé par le design.

### ADR-06 — Stockage local par défaut, synchro cloud opt-in
**Décision** : SQLite local pour les sessions et l'historique. Cloud uniquement si l'utilisateur active la synchro.
**Pourquoi** : `REQ-NF-07`, `REQ-NF-08`, et c'est aussi la bonne attitude par défaut.
**Conséquence** : pas de prérequis de compte au MVP, complexité de synchro reportée à V1+.

### ADR-07 — Stratégie multilingue en trois temps
**Décision** : MVP avec un fournisseur ASR multilingue unique (Stratégie A — Speechmatics par défaut). En V1, possibilité d'ouvrir vers la Stratégie B (un provider optimal par langue) si le benchmark le justifie. En V2+, viser la Stratégie C (Whisper local pour toutes les langues).
**Pourquoi** :
- A au MVP : une intégration, un comportement homogène, qualité défendable des deux côtés. Permet de livrer le multilingue sans doubler la complexité opérationnelle.
- B en V1 : seulement si la mesure montre un gain de qualité par langue qui justifie le coût d'opérer deux pipelines (Gladia FR + Deepgram EN par exemple).
- C en V2+ : aligné avec le mode souverain / offline, un seul modèle Whisper gère 99 langues, coût marginal nul.

**Conséquence** :
- Le port `ASRStreamProvider` est obligatoire dès le MVP, même avec une seule implémentation, pour ne pas avoir à refondre plus tard.
- Au MVP, **FR et EN** sont les seules langues officiellement supportées. Le pipeline d'extraction et de vérification est multilingue de naissance (les LLM gèrent les deux nativement). La hiérarchie des sources tier 1/2 spécifique à chaque langue est livrée en deux temps : couverture FR complète au MVP, couverture EN affinée en V1 (à compléter dans `03-modele-fiabilite-sources.md`).
- L'architecture des prompts d'extraction et de vérification est language-agnostic : le LLM reçoit la langue de la session en paramètre et adapte son output (la canonical, l'explication, et le résumé sont produits dans la langue de la session).

### ADR-08 — Ligne de vie temporelle persistante des affirmations
**Décision** : toutes les affirmations détectées dans une session sont **horodatées** (`start_ms`, `end_ms` calés sur l'audio), **persistées** intégralement, et **rejouables** depuis l'app. La session entière (transcription + claims + verdicts) est consultable et navigable même après la fin du débat, avec saut audio sur clic d'un timestamp.
**Pourquoi** : c'est ce qui distingue un fact-checker live d'un fil Twitter — la possibilité de revenir en arrière pour comprendre dans quel contexte une affirmation a été faite, et de la relire à froid après la chaleur du débat.
**Conséquence** :
- L'audio brut de la session est conservé localement (chiffré, supprimable d'un clic) tant que la session existe — sinon, le saut audio sur timestamp est impossible.
- L'UI doit proposer, dès le MVP, une **timeline** scrollable de la session, avec densité visuelle des verdicts (couleur par tier de gravité), et permettre la navigation par locuteur, par sujet, et par verdict.
- L'export Markdown/JSON inclut tous les timestamps et un lien interne vers le segment audio si l'utilisateur réimporte la session.

## 3. Détail de chaque étage

### 3.1 Étage 1 — Capture audio
Trois sources possibles :
- **Microphone** : Web Audio API, AVAudioEngine (macOS), Android `AudioRecord`, iOS `AVAudioRecorder`.
- **Son système (loopback)** : sur macOS via une extension audio (CoreAudio + tap d'app, dispo en macOS 14.4+) ou un driver virtuel type BlackHole. Sur Windows via WASAPI loopback. Sur mobile, beaucoup plus délicat (sandboxing).
- **Fichier ou URL** : ingestion d'un fichier mp3/mp4 ou d'un lien YouTube (via `yt-dlp` côté serveur).

Format de sortie : PCM mono 16 kHz, fenêtres glissantes de 1 s avec recouvrement de 250 ms (pour ne pas couper les mots).

⚠️ À TRANCHER : la capture du son système sur macOS récent est une excellente expérience mais nécessite une habilitation utilisateur ; en V0 on peut commencer en micro pur pour valider la chaîne.

### 3.2 Étage 2 — Transcription (ASR) + diarisation

L'app supporte **FR et EN dès le MVP**. La stratégie est définie par ADR-07 et évolue en trois temps : un fournisseur multilingue unique au MVP (Stratégie A), spécialisation par langue éventuellement en V1 (B), bascule local en V2+ (C).

**Choix MVP — Speechmatics (Stratégie A)**
Speechmatics est le candidat retenu par défaut. Justification : top 3 sur le FR comme sur l'EN, diarisation native parmi les meilleures du marché, hébergement UK (adequacy decision RGPD), une seule intégration et un seul comportement à monitorer. Streaming WebSocket avec partial transcripts, latence p50 sous la seconde. Choix à confirmer après le benchmark de Phase 0.

**Alternatives benchmarkées en Phase 0**
- **Gladia** — boîte française, streaming basé Whisper avec optimisations propriétaires, hébergement UE. Candidat sérieux si l'écart de qualité avec Speechmatics est faible.
- **Deepgram Nova-3** — leader EN, FR rattrapé sur Nova-3 mais à valider. US-based, moins aligné RGPD.
- **AssemblyAI** — solide en EN, FR moins testé.
- **Whisper local** (`faster-whisper` + `pyannote.audio`) — référence pour la Phase V2+ (Stratégie C). Pas de streaming natif, latence supérieure, mais une seule architecture pour 99 langues et coût marginal nul.

Le choix est validé en Phase 0 sur 30 min FR + 30 min EN, métriques : taux d'erreur sur noms propres et chiffres, qualité diarisation à 2 et 4 locuteurs, latence p50/p95, coût par heure.

**Architecture en ports/adapters**
Le port `ASRStreamProvider` est posé dès le MVP (cf. ADR-01 et ADR-07). Conséquences :
- Une session a une langue déterminée (auto-détectée sur 5-10 secondes ou choisie par l'utilisateur).
- Un seul provider est utilisé par session — pas de bascule en cours de route.
- Code-switching (locuteur qui passe d'une langue à l'autre dans la même phrase) non géré au MVP, fallback sur la langue de la session.

Sortie de cet étage : flux d'événements `TranscriptSegment(text, language, speakerId, start, end, confidence)`.

### 3.3 Étage 3 — Extraction d'affirmations

C'est la brique la plus subtile. Une affirmation factuelle vérifiable a 4 caractéristiques :
1. Énoncé déclaratif (pas une question, pas un ordre).
2. Référence à un fait du monde (pas une opinion ni un jugement de goût).
3. Vérifiable en principe (il existe une source qui peut trancher).
4. Suffisamment précise pour être vérifiée.

**Approche** : LLM léger (Haiku, ou un modèle local type Qwen 7B/14B) avec un prompt qui prend en entrée 30 secondes de transcription et produit une liste structurée d'affirmations canoniques avec leur locuteur et leur timestamp.

Format de sortie :
```json
{
  "claim_id": "uuid",
  "speaker_id": "spk_2",
  "timestamp_start": 1234.56,
  "timestamp_end": 1240.12,
  "raw_quote": "Et en France on a deux millions de chômeurs en plus depuis 2017",
  "canonical": "Le nombre de chômeurs en France a augmenté de 2 millions entre 2017 et aujourd'hui.",
  "context": "...",
  "category": "statistique_publique",
  "verifiability_score": 0.91
}
```

Le `verifiability_score` permet de filtrer en aval (on n'envoie pas en vérification ce qui est en dessous d'un seuil — typiquement 0.6).

### 3.4 Étage 4 — Vérification factuelle

C'est le cœur de l'app. Décomposé en 4 sous-étapes :

**4a. Décomposition de la requête**
Le LLM reformule l'affirmation canonique en 1 à 3 requêtes de recherche optimisées, et identifie le **type de fait** (statistique INSEE, événement historique, citation, donnée scientifique, etc.) — ce qui détermine quelles sources prioriser.

**4b. Recherche multi-source**
Recherche parallèle sur :
- Moteur web généraliste (Brave Search API, Tavily, ou SerpAPI) avec filtres sur domaines de confiance.
- Bases ouvertes spécialisées selon le type de fait :
  - Statistiques publiques : INSEE, Eurostat, World Bank, OECD.
  - Législation : Légifrance.
  - Politique : Vie publique, Assemblée Nationale (open data).
  - Science : Pubmed, Semantic Scholar, OurWorldInData.
  - Histoire récente : presse de référence (Le Monde, AFP, Reuters).
- Index de fact-checks existants : Les Surligneurs, AFP Factuel, CheckNews, Politifact (EN), Snopes (EN).

**4c. Lecture et synthèse**
Pour les top 5-10 résultats, on récupère le contenu, on le passe à un LLM avec l'affirmation et une consigne de produire un verdict argumenté **avec citations**. Le LLM doit retourner :
- Un verdict parmi les 8 niveaux.
- Un niveau de confiance (faible / moyen / élevé).
- Une explication courte (1-3 phrases).
- Une explication longue (5-10 phrases) avec arguments.
- Les sources retenues (URLs + extraits cités).

Ce sous-étage utilise un LLM **plus puissant** (Sonnet ou équivalent) parce que la qualité est critique.

**4d. Validation et garde-fous**
Avant d'émettre le verdict, plusieurs vérifications :
- Si moins de 2 sources retenues → forcer `Non vérifié` ou `Indécidable`.
- Si les sources se contredisent fortement → forcer `Contesté`.
- Si l'affirmation porte sur une personne nommée et le verdict est "faux" → niveau de confiance maximal **élevé** requis, sinon downgradage en `Discuté`.
- Niveau de confiance bas → toujours afficher avec un avertissement visuel.

### 3.5 Étage 3 bis — Résumé incrémental (TL;DR / normal / détaillé)

Le moteur de résumé tourne en parallèle du pipeline d'extraction/vérification. Il consomme le flux de `TranscriptSegment` (avec labels de locuteur) et, quand disponibles, les `Claim` avec leur verdict pour enrichir le résumé.

**Trois résumés distincts produits, indépendants**
- **TL;DR** (1-3 phrases) — généré par un LLM léger (Haiku) sur un buffer glissant d'environ 5 minutes de transcription.
- **Normal** (5-10 phrases) — généré par un LLM moyen (Haiku ou Sonnet) sur l'ensemble de la transcription depuis le début de session, avec tronçonnage si > 50 min.
- **Détaillé** (structuré par sujets) — généré par un LLM plus puissant (Sonnet) avec un prompt de structuration : détection des sujets, attribution par locuteur, intégration des verdicts.

**Stratégie de génération**
- **À la demande** : l'utilisateur clique "Résumer maintenant" → génération des 3 niveaux en parallèle, affichage en streaming.
- **En arrière-plan** : régénération automatique du TL;DR toutes les 2 min, du résumé normal toutes les 5 min, du résumé détaillé toutes les 10 min ou sur signal de "changement de sujet" (détection par embedding shift sur les segments de transcription).
- Le résumé courant est stocké en cache avec sa plage temporelle couverte. Quand l'utilisateur ouvre la vue résumé, il voit le dernier résumé valide + un indicateur "généré il y a X secondes".

**Filtrage (V1+)**
- Résumé restreint à un locuteur : filtrage des `TranscriptSegment` par `speaker_id` avant prompt.
- Résumé restreint à un sujet : nécessite la détection de sujets (clustering d'embeddings sur les segments). Reporté à V1.

**Sortie de l'étage** : événements `Summary(level, scope, language, text, covers_from_ms, covers_to_ms, generated_at)`.

**Garde-fous**
- Tout résumé qui mentionne un fait précis vérifié doit citer le verdict associé (ex. "M. X a affirmé que Y, ce qui s'est révélé factuellement faux selon la vérification").
- Si la transcription est trop courte (< 30 s ou < 50 mots), aucun résumé n'est produit, message UI "trop tôt pour résumer".
- L'avertissement de fiabilité (`REQ-F-30`) est ajouté en sortie d'étage avant rendu UI.

### 3.6 Étage 5 — Rendu

Stack UI à trancher selon plateforme :
- **Desktop macOS** : SwiftUI natif (fenêtre flottante, faible empreinte) **ou** Tauri (Rust + web) si on veut viser cross-platform sans réécrire.
- **Web (extension navigateur ou app web)** : Next.js + WebSocket.
- **Mobile** : React Native, Flutter, ou natif Swift/Kotlin.

L'UI consomme un flux de `ClaimUpdate`, `TranscriptSegment` et `Summary` via WebSocket et met à jour les vues en place (un claim peut passer de "en vérification" à "vérifié" sans disparaître).

**Vues principales**
- **Live feed** : transcription en streaming + claims qui s'attachent à mesure de leur vérification.
- **Timeline** (cf. ADR-08) : ligne de vie horizontale ou verticale de la session entière, avec densité de couleur par verdict. Cliquer sur un point fait sauter à ce moment de la session — la transcription scrolle, le claim associé est mis en évidence, et un mini-player audio peut rejouer le passage exact (`start_ms` à `end_ms`).
- **Résumés** : panneau ou onglet avec les 3 niveaux (TL;DR / normal / détaillé), sélectionnables par toggle, avec horodatage de génération et plage couverte.
- **Filtres** : par locuteur, par verdict, par mot-clé, par fenêtre temporelle (cf. `REQ-F-20`).
- **Replay session** : même après la fin du débat, l'utilisateur peut ouvrir une session passée et la naviguer comme s'il y était — toute affirmation reste accessible avec son timestamp et son audio.

Persistance : SQLite local (encrypté). L'audio brut de la session est conservé localement (chiffré, supprimable d'un clic) pour permettre le saut audio (cf. ADR-08).

## 4. Modèle de données (extrait)

Sept tables principales :

**Session** (`id`, `started_at`, `ended_at`, `source_type`, `source_label`, `language`, `audio_blob_path`, `audio_duration_ms`, `metadata`). Le `audio_blob_path` pointe sur l'audio chiffré local conservé pour permettre le replay (ADR-08).

**Speaker** (`id`, `session_id`, `auto_label`, `display_name`, `voice_signature`).

**TranscriptSegment** (`id`, `session_id`, `speaker_id`, `start_ms`, `end_ms`, `text`, `language`, `confidence`).

**Claim** (`id`, `session_id`, `speaker_id`, `start_ms`, `end_ms`, `raw_quote`, `canonical`, `category`, `verdict`, `verdict_confidence`, `explanation_short`, `explanation_long`, `created_at`, `verified_at`, `state`). Les `start_ms`/`end_ms` sont calés sur l'horloge audio de la session — c'est ce qui permet le saut audio depuis la timeline (ADR-08).

**Source** (`id`, `claim_id`, `url`, `title`, `publisher`, `published_at`, `quote`, `relevance_score`, `source_tier`).

**Summary** (`id`, `session_id`, `level` [`tldr`|`normal`|`detailed`], `scope` [`global`|`speaker:<id>`|`topic:<id>`], `language`, `text`, `covers_from_ms`, `covers_to_ms`, `generated_at`, `model_version`). Plusieurs résumés cohabitent — l'UI affiche le plus récent par `level`+`scope`.

**Feedback** (`id`, `claim_id`, `user_action`, `comment`, `created_at`).

## 5. Choix de stack — options de référence

| Brique | Option A (rapide) | Option B (souverain/local) | Recommandation MVP |
|---|---|---|---|
| Capture audio | OS natif | OS natif | OS natif |
| ASR streaming FR + EN | Speechmatics API | `faster-whisper` local | Speechmatics (UK, RGPD-aligned, multilingue par défaut) |
| Diarisation | Speechmatics natif | `pyannote.audio` | Speechmatics en MVP, pyannote en V2+ |
| Résumés (TL;DR / normal) | Claude Haiku | Qwen 14B local | Haiku |
| Résumé détaillé | Claude Sonnet | Mistral / Llama 70B local | Sonnet |
| Extraction de claims | Claude Haiku | Qwen 14B local | Haiku |
| Recherche web | Brave Search API + Tavily | DuckDuckGo + scraping ciblé | Brave + Tavily |
| LLM vérification | Claude Sonnet | Mistral / Llama 70B local | Sonnet |
| Stockage local | SQLite + SQLCipher | idem | SQLite + SQLCipher |
| Backend orchestration | Python (FastAPI) ou Rust (Axum) | idem | Python pour le MVP, on accepte la dette |
| Front desktop | Tauri | SwiftUI | ⚠️ À TRANCHER : Tauri si cross-platform visé tôt, sinon SwiftUI |
| Front mobile (V2) | React Native | Natif | Natif (qualité audio meilleure) |

## 6. Diagramme de séquence (cas nominal)

```
Utilisateur         App (capture)     ASR cloud      Extracteur     Vérificateur     Sources externes     UI
    │                    │                │              │                │                  │            │
    │── start session ──►│                │              │                │                  │            │
    │                    │── audio chunk ─►│              │                │                  │            │
    │                    │                │── partial ─►│                │                  │            │
    │                    │                │── final ───►│── claim found ►│                  │            │
    │                    │                │              │                │── search ──────►│            │
    │                    │                │              │                │◄── docs ────────│            │
    │                    │                │              │                │── verdict ─────────────────►│
    │                    │                │              │                │                  │            │
    │                    │                │              │                │                  │            │── affiche
    │◄────────────────── verdict en T+18s ──────────────────────────────────────────────────────────────│
```

## 7. Tests et qualité

- **Jeu de test or** : 100 affirmations annotées manuellement, couvrant les 8 verdicts. Lancé sur chaque change du moteur de vérification. Métrique : accuracy par classe.
- **Replays** : 10 enregistrements de débats publics avec verdicts attendus, rejoués automatiquement.
- **Tests d'intégration** : pipeline complet sur 30 s d'audio, latence mesurée.
- **Tests adversariaux** : affirmations volontairement piégeuses (vraies-mais-trompeuses, fausses-mais-citées-souvent).

## 8. Observabilité

Dès le MVP : logs structurés par claim_id traversant tous les étages. Métriques : latence par étage, taux d'erreur ASR, distribution des verdicts, coût par session. Alerting V1+ : taux de "factuellement faux" anormalement élevé sur une session = signal de dérive du modèle.

## 9. Sécurité

- Toutes les communications client/serveur en TLS.
- Pas de stockage d'audio brut côté serveur.
- Rotation des clés API.
- Rate limiting par utilisateur pour éviter le coût explosif.
- Modèle de menace dédié à écrire avant V1 (cf. `05-ethique`).

## 10. Coûts d'infra estimés (ordres de grandeur, à valider)

Hypothèse : 1 heure de session active.
- ASR streaming : ~0,55 € (Speechmatics, ~30-40% au-dessus de Deepgram, justifié par la qualité FR et la diarisation native multilingue) ou ~0 € si Whisper local en V2+.
- Extraction (Haiku, ~5k tokens / minute) : ~0,02 €.
- Vérification (Sonnet, ~10 claims / heure × 8k tokens / claim) : ~0,30 €.
- Recherche (10 claims × 5 requêtes) : ~0,10 €.
- Résumés (Haiku pour TL;DR + normal régénérés ~12 fois/h, Sonnet pour détaillé ~6 fois/h, sur transcriptions glissantes) : ~0,15 €.

**Total ordre de grandeur** : ~1,10 € / heure de session en cloud-only au MVP.

⚠️ Ce chiffre dépasse l'objectif initial `REQ-NF-17` (< 0,50 €/h en V1). Trois leviers pour rentrer dans le budget :
1. Cache des résumés (un même utilisateur qui ouvre plusieurs fois la session ne régénère pas).
2. Dédup des claims sur sujets traités (un fact-check sur "X a dit Y le DD/MM" ne se relance pas).
3. Bascule progressive vers la Stratégie C (Whisper local) en V2+ pour ramener l'ASR à ~0 €.

Cible révisée : **~0,80 €/h en V1**, **< 0,30 €/h en V2+** avec local. À acter dans le suivi du modèle économique en Phase 2.
