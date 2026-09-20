# 01 — Cahier des charges

## 1. Vision produit

### 1.1 Problème
Dans un débat télévisé, une discussion politique entre amis, ou une vidéo YouTube, des affirmations factuelles passent **plus vite que la capacité du cerveau humain à les vérifier**. Le téléspectateur doit choisir entre suivre le fil et fact-checker — il ne peut pas faire les deux. Résultat : les contre-vérités prospèrent par défaut, parce que vérifier coûte plus cher que mentir.

### 1.2 Solution
Une application qui **écoute en continu** une source audio (le monde réel via micro, le son système d'une vidéo, ou un flux TV), **identifie les locuteurs**, **isole les affirmations factuelles**, **les vérifie auprès de sources** et **affiche un verdict** sur l'écran de l'utilisateur, le tout avec un délai cible de **moins de 30 secondes** entre l'énoncé et le verdict.

### 1.3 Promesse de valeur
- Pour le citoyen : un copilote pendant les débats électoraux et les émissions politiques.
- Pour le journaliste : un assistant de live fact-checking sur plateau.
- Pour l'éducateur : un outil pour apprendre à raisonner avec des sources.
- Pour la plateforme (YouTube/TV) : un overlay vérifié possible (V3+).

### 1.4 Anti-vision (ce que l'app n'est PAS)
- Pas un détecteur de mensonge ou un juge moral. On vérifie des **faits vérifiables**, pas des intentions ni des opinions.
- Pas un censeur. Aucun contenu n'est masqué ou bloqué ; on annote.
- Pas un outil partisan. Voir `05-ethique-risques-juridique.md` § biais politique.
- Pas un assistant conversationnel. L'utilisateur ne dialogue pas avec l'app pendant l'écoute.

## 2. Suggestions de nom

`VeriLive` est mon nom de travail. Quelques alternatives à départager : `Veracis`, `Factuel`, `LiveCheck`, `Limpide`, `Plumb` (référence au fil à plomb), `Étalon`. À décider après recherche d'antériorité de marque.

## 3. Personas

### 3.1 Persona principal — "Camille, le téléspectateur engagé"
35 ans, suit l'actualité politique, regarde les débats en direct sur sa TV ou sur YouTube. Frustrée par le fait que les contre-vérités passent. N'est pas journaliste mais a un bagage suffisant pour vouloir vérifier. **Usage** : pose son téléphone à côté de sa TV ou ouvre l'app sur son ordi à côté de son flux YouTube. **Critère de succès** : voir au moins 3 vérifications utiles par heure de débat.

### 3.2 Persona secondaire — "Mehdi, le journaliste en plateau"
Documentaliste / fact-checker dans une rédaction. Doit produire des vérifications en direct pendant des émissions. **Usage** : version pro avec dashboard, sources copiables, export. **Critère de succès** : réduire de 50% le temps moyen pour produire une vérification publiable.

### 3.3 Persona tertiaire — "Léna, la prof"
Enseignante en lycée, EMC ou SES. Veut montrer à ses élèves comment décortiquer une affirmation. **Usage** : enregistre un extrait, le repasse en classe en mode pédagogique. **Critère de succès** : un extrait analysé fournit matière à 30 min de cours.

## 4. Cas d'usage

### 4.1 Cas d'usage prioritaires (MVP)
- **CU-01 — Débat TV regardé en direct sur ordinateur** : l'utilisateur regarde un débat sur le replay/live d'un site de TV ou YouTube ; l'app capte le son système et fact-check en parallèle dans une fenêtre.
- **CU-02 — Discussion en présentiel avec téléphone posé sur la table** : deux personnes débattent dans un salon, l'app sur smartphone écoute via le micro.
- **CU-03 — Replay analysé après coup** : l'utilisateur charge un fichier audio/vidéo (mp3, mp4, lien YouTube) et obtient un rapport horodaté.
- **CU-03 bis — Reprise d'une session live terminée** : à la fin d'un débat capté en live, l'utilisateur ouvre la session, navigue la timeline, retrouve toutes les affirmations vérifiées avec leur timestamp, et peut réécouter chaque passage exact. Utile pour reprendre à froid une discussion qu'on a vécue en direct.

### 4.2 Cas d'usage V1+
- **CU-04 — Émission radio en direct**.
- **CU-05 — Conférence / table ronde captée par l'app sur ordinateur posé sur scène**.
- **CU-06 — Mode "discret" pour journaliste** sur tablette, prise de notes augmentée.

### 4.3 Cas d'usage V2+ (à confirmer)
- **CU-07 — Extension navigateur** qui s'attache directement à l'élément `<video>` d'un site (YouTube, Twitch, sites de chaînes).
- **CU-08 — Mode collaboratif** : plusieurs utilisateurs vérifient ensemble la même session, avec un fil partagé.

### 4.4 Cas d'usage hors-scope (volontairement exclus)
- Vérification de texte écrit (articles, tweets) — c'est un autre produit.
- Détection de deepfake vidéo — domaine différent.
- Modération automatique de contenu — risque éthique trop élevé.

## 5. Exigences fonctionnelles (REQ-F)

### 5.1 Capture audio
- **REQ-F-01** L'app doit capter l'audio depuis au moins une source : microphone, son système (loopback), fichier importé, ou URL de stream.
- **REQ-F-02** L'utilisateur doit pouvoir démarrer / mettre en pause / arrêter une session en un geste.
- **REQ-F-03** L'app doit indiquer en permanence si elle écoute (témoin visuel non équivoque, exigence éthique également — voir `05-ethique`).
- **REQ-F-04** La session enregistrée doit pouvoir être sauvegardée localement et rejouée.

### 5.2 Transcription et identification des locuteurs
- **REQ-F-05** L'audio doit être transcrit en **français et en anglais** en quasi-temps-réel, avec une latence de transcription cible < 3 secondes. La langue est détectée automatiquement sur les 5-10 premières secondes ou choisie manuellement par l'utilisateur en début de session.
- **REQ-F-06** L'app doit segmenter le flux par locuteur (diarisation), en attribuant un identifiant stable à chaque locuteur sur la durée d'une session.
- **REQ-F-07** L'utilisateur doit pouvoir nommer manuellement chaque locuteur (`Locuteur 1` → `Marine Le Pen`) ; ce nommage est conservé.
- **REQ-F-08** Optionnel V1 : reconnaissance automatique de personnalités publiques par empreinte vocale, **strictement opt-in et avec base limitée à des figures publiques**, voir `05-ethique`.
- **REQ-F-09** Le mot-à-mot transcrit doit être affiché en streaming, avec mise en évidence de la portion en cours d'analyse.

### 5.3 Extraction des affirmations
- **REQ-F-10** L'app doit identifier dans la transcription les **affirmations factuelles vérifiables** et ignorer les opinions, les questions, les éléments de discours, l'humour.
- **REQ-F-11** Pour chaque affirmation, l'app doit extraire : la formulation canonique (déclaration nettoyée), le locuteur, le timestamp, le contexte (phrases précédentes/suivantes).
- **REQ-F-12** L'utilisateur doit pouvoir manuellement marquer un passage comme "à vérifier" même si l'app ne l'a pas extrait.

### 5.4 Vérification factuelle
- **REQ-F-13** Pour chaque affirmation extraite, l'app doit produire un verdict parmi les 8 niveaux définis dans `03-modele-fiabilite-sources.md`.
- **REQ-F-14** Chaque verdict doit s'accompagner de **2 à 5 sources** cliquables (URL, titre, type de source, date).
- **REQ-F-15** Chaque verdict doit être accompagné d'une explication courte (1 à 3 phrases) justifiant la note, et d'une explication longue dépliable.
- **REQ-F-16** Chaque verdict doit afficher un **niveau de confiance de l'app dans son propre verdict** (faible/moyen/élevé), distinct du niveau de véracité.
- **REQ-F-17** L'utilisateur doit pouvoir contester un verdict (feedback signalé, voir `05-ethique`).
- **REQ-F-18** Les affirmations dont le verdict serait peu fiable doivent rester `Non vérifié` plutôt que de risquer une assertion fausse — **principe de prudence**.

### 5.5 Présentation
- **REQ-F-19** Affichage en flux : nouvelles affirmations qui apparaissent en haut, anciennes scrollables en bas. **Chaque affirmation affiche son timestamp** (format `hh:mm:ss` calé sur le début de session) et reste consultable indéfiniment, y compris après la fin du débat.
- **REQ-F-19 bis** **Timeline visuelle** de la session entière : ligne de vie scrollable avec densité de couleur par verdict. Un clic sur un point de la timeline fait sauter à ce moment précis : la transcription scrolle au bon endroit, le claim associé est mis en évidence, et un mini-player audio peut **rejouer le passage exact** (`start_ms` à `end_ms`).
- **REQ-F-19 ter** **Persistance complète** : toutes les affirmations détectées dans une session sont conservées intégralement. À la fin d'un débat de 2 heures, l'utilisateur peut revenir au tout début et retrouver chaque verdict avec son timestamp. Aucun "oubli silencieux", aucune fenêtre glissante limitée.
- **REQ-F-20** Filtres : par locuteur, par verdict, par mot-clé, par fenêtre temporelle.
- **REQ-F-21** Vue "résumé de session" en fin d'écoute : nombre d'affirmations par locuteur, par verdict, top 5 des plus discutables.
- **REQ-F-22** Export d'une session : Markdown, PDF, JSON. L'export inclut **tous les timestamps** et, pour le format JSON, des références qui permettent de retrouver les passages audio si la session est réimportée.

### 5.6 Résumés de conversation (rattrapage)

Les résumés permettent à un utilisateur qui rejoint une conversation en cours, ou qui reprend une session après pause, de comprendre rapidement ce qui s'est dit sans relire toute la transcription. Trois niveaux de granularité sont proposés.

- **REQ-F-23 — Résumé TL;DR** : 1 à 3 phrases. Donne le sujet principal et le ton (débat tendu / discussion technique / interview, etc.). Cible : se faire une idée en 10 secondes.
- **REQ-F-24 — Résumé normal** : 5 à 10 phrases organisées en paragraphe. Couvre les positions principales de chaque locuteur, les sujets clés abordés, et les affirmations factuelles les plus saillantes (avec leur verdict s'il est déjà disponible). Cible : se faire une idée en 1 minute.
- **REQ-F-25 — Résumé détaillé** : structuré par **sujets abordés** (et non par ordre chronologique strict), avec pour chaque sujet : qui a dit quoi, sur quels points il y a accord ou désaccord, et la liste des affirmations vérifiées avec leur verdict. Cible : se mettre à niveau pour participer à la discussion en 3-5 minutes de lecture.
- **REQ-F-26** Les résumés doivent être **générés à la demande** (bouton "Résumer maintenant") et **mis à jour en continu** en arrière-plan : un nouveau résumé est régénéré automatiquement toutes les N minutes (paramètre, défaut 5 min) ou sur changement de sujet détecté, pour qu'à tout moment le résumé affiché soit récent.
- **REQ-F-27** Chaque résumé indique sa **plage temporelle couverte** ("Résumé des 12 dernières minutes" / "Résumé complet depuis le début de session") et l'horodatage de génération.
- **REQ-F-28** Un résumé doit pouvoir être restreint à un **locuteur** ("résume uniquement les positions de Marine X") ou à un **sujet** ("résume ce qui a été dit sur l'inflation").
- **REQ-F-29** Les résumés sont produits dans la langue de la session par défaut, avec option de traduction vers l'autre langue supportée (FR ↔ EN) en MVP.
- **REQ-F-30** Tout résumé doit afficher un **avertissement de fiabilité** : "Résumé généré automatiquement, peut omettre ou simplifier des points. Vérifiez la transcription complète pour les passages importants." C'est une exigence éthique, pas seulement UX.

### 5.7 Compte et historique
- **REQ-F-31** Mode anonyme local fonctionnel sans compte (priorité forte au MVP).
- **REQ-F-32** Compte optionnel pour synchroniser l'historique entre appareils (V1+).
- **REQ-F-33** L'utilisateur peut supprimer toute session ou tout son historique d'un clic.

### 5.8 Pédagogie
- **REQ-F-34** Sur chaque verdict, l'utilisateur peut afficher la **méthodologie** : quelles sources ont été consultées, comment elles ont été pondérées, quels signaux ont déclenché le verdict.
- **REQ-F-35** Glossaire intégré expliquant les niveaux de verdict, les types de sources, les biais courants.

## 6. Exigences non-fonctionnelles (REQ-NF)

### 6.1 Performance
- **REQ-NF-01** Latence cible affirmation → verdict affiché : **médiane < 30 s**, p95 < 90 s. C'est le KPI principal.
- **REQ-NF-02** Latence audio → texte affiché à l'écran : médiane < 3 s.
- **REQ-NF-03** L'app doit pouvoir traiter une session continue de **3 heures minimum** sans dégradation ni fuite mémoire.

### 6.2 Fiabilité
- **REQ-NF-04** Taux de faux positifs sur le verdict "factuellement faux" doit être < 2% (mesuré sur jeu de test). C'est le risque légal majeur — voir `05-ethique`.
- **REQ-NF-05** Taux de précision de la diarisation > 85% sur deux locuteurs en conditions correctes.
- **REQ-NF-06** Reprise automatique en cas de coupure réseau (queue locale des affirmations en attente de vérification).

### 6.3 Vie privée et sécurité
- **REQ-NF-07** Aucun audio ne quitte l'appareil de l'utilisateur sans action explicite — sauf appel API nécessaire au moteur cloud, et alors **par segments transcrits, pas en audio brut** dès que possible.
- **REQ-NF-07 bis** L'audio brut d'une session est conservé **localement et chiffré** pour permettre le replay (cf. ADR-08). L'utilisateur peut supprimer l'audio d'une session sans supprimer la transcription et les verdicts (option "alléger la session"), ou tout supprimer d'un clic. Une session sans audio reste consultable mais sans saut audio.
- **REQ-NF-08** Conformité RGPD : finalité, consentement, durée de conservation, droit à l'effacement, registre des traitements.
- **REQ-NF-09** Chiffrement au repos des sessions stockées localement.
- **REQ-NF-10** Pas de partage de données avec des tiers sauf nécessaire à la vérification (API de recherche), et avec liste publique des prestataires.

### 6.4 Accessibilité
- **REQ-NF-11** Conformité RGAA / WCAG 2.1 niveau AA visé.
- **REQ-NF-12** L'interface doit rester utilisable avec lecteur d'écran (les verdicts sont lus à voix haute si demandé).
- **REQ-NF-13** Mode contraste élevé et taille de police ajustable.

### 6.5 Évolutivité et maintenabilité
- **REQ-NF-14** Architecture modulaire : ASR, diarisation, extraction, vérification doivent être interchangeables sans refonte (voir `02-architecture-technique.md` § ports/adapters).
- **REQ-NF-15** Tests automatisés sur le pipeline d'extraction d'affirmations et le moteur de verdict (jeu de données de référence).
- **REQ-NF-16** Internationalisation native : FR + EN dès le MVP (transcription, UI, prompts d'extraction et de vérification, résumés). Architecture en ports/adapters pour permettre l'ajout d'autres langues sans refonte (cf. ADR-07 dans `02-architecture-technique.md`).

### 6.6 Coût d'usage
- **REQ-NF-17** Coût marginal par heure de session ne doit pas dépasser un budget cible — **à fixer en fonction du modèle économique** (cf. décision ouverte 3 du README). Hypothèse de travail : viser un coût technique inférieur à 0,50 € par heure d'écoute en V1.

## 7. Scope du MVP (V0)

Le MVP doit prouver que la chaîne **audio → texte → affirmations → verdict sourcé** fonctionne sur un cas réel. Tout le reste est V1+.

**Inclus dans le MVP**
- Plateforme unique (recommandation : desktop macOS, à valider — voir README).
- Capture micro **et** son système.
- Transcription **FR + EN** temps réel via fournisseur multilingue unique (cf. ADR-07).
- Diarisation 2-4 locuteurs sans nommage automatique.
- Extraction d'affirmations factuelles.
- Verdict avec les 8 niveaux + sources + explication courte.
- **Résumés à 3 niveaux** (TL;DR / normal / détaillé) générés à la demande et rafraîchis périodiquement.
- **Timeline scrollable** + saut audio sur clic d'un timestamp + replay des sessions terminées (cf. ADR-08).
- **Conservation intégrale** des affirmations : aucune limite de fenêtre, persistance jusqu'à suppression manuelle par l'utilisateur.
- Export Markdown.
- Mode local sans compte.

**Exclu du MVP, prévu V1+**
- Mobile.
- Reconnaissance automatique de personnalités.
- Mode collaboratif.
- Extension navigateur.
- Compte synchronisé.
- Langues au-delà de FR + EN (espagnol, allemand visés en V2+).
- Hiérarchie de sources EN complète (le MVP ship avec couverture FR exhaustive et un sous-ensemble EN limité aux sources tier 1/2 internationales — couverture EN affinée en V1).
- Mode pédagogique avancé.
- Résumés filtrés par locuteur ou par sujet (le MVP livre uniquement les 3 résumés globaux ; les résumés ciblés arrivent en V1).

## 8. Critères d'acceptation du MVP

Pour considérer le MVP livré et utilisable, on doit pouvoir cocher :
1. Sur 5 extraits-tests de débats publics français de 10 min chacun, l'app produit au moins 3 verdicts par extrait avec sources cliquables.
2. La latence médiane affirmation → verdict est mesurée et < 60 s (objectif final 30 s, mais on accepte 60 s en MVP).
3. Aucun verdict "factuellement faux" produit par le MVP n'a été identifié comme erroné lors d'une revue manuelle de 50 cas.
4. Le pipeline tient une session de 90 min sans crash.
5. L'utilisateur peut exporter sa session et y retrouver tout ce qui a été dit + tous les verdicts.

## 9. Risques fonctionnels majeurs (vue produit)

Vue détaillée dans `05-ethique-risques-juridique.md`. En vue produit :
- **R1** L'app dit du faux comme étant vrai → casse la confiance, risque légal. Mitigation : niveau de confiance, principe de prudence, revue humaine en V1.
- **R2** L'app sur-détecte des affirmations dans des opinions → bruit, fatigue d'usage. Mitigation : seuil sur l'extracteur, possibilité de masquer.
- **R3** L'app a un biais politique perçu (ou réel) → critiques publiques. Mitigation : transparence du fonctionnement, audit externe, jeu de test équilibré.
- **R4** Les utilisateurs surestiment la fiabilité de l'app → effet de halo. Mitigation : niveaux de confiance affichés, formation à la lecture des verdicts.

## 10. Métriques de succès

- **Métrique nord** : nombre de sessions de plus de 30 min par utilisateur actif par mois.
- **Engagement** : minutes écoutées / utilisateur / semaine.
- **Qualité perçue** : score moyen de feedback sur les verdicts (signalements sur total verdicts produits, viser < 5%).
- **Performance** : latence médiane et p95 (suivies en temps réel).
- **Technique** : taux d'erreur ASR, taux de faux positifs sur "faux", coût par heure d'usage.
