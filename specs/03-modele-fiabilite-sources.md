# 03 — Modèle de fiabilité, verdicts et sources

C'est le document le plus sensible du dossier : c'est ici que se joue la confiance que les utilisateurs accorderont à l'app. Tout le reste est de l'ingénierie ; ceci est de la méthodologie.

## 1. Principes directeurs

**P1 — Distinguer la véracité du fait, et la confiance dans l'évaluation.**
Une affirmation peut être "probablement fausse" avec une confiance basse de l'app, ou "fausse" avec une confiance élevée. Ces deux dimensions ne se confondent pas et sont affichées séparément.

**P2 — Le silence vaut mieux que l'erreur.**
Si on ne sait pas, on dit qu'on ne sait pas. Un verdict `Non vérifié` n'est pas un échec, c'est un résultat acceptable. Un faux verdict "faux" est un échec grave.

**P3 — Toujours sourcer, jamais asserter sans citer.**
Aucun verdict ne sort sans au minimum 2 sources. Pas de sources → pas de verdict.

**P4 — Distinguer le fait, le contexte, et l'interprétation.**
Une statistique peut être exacte mais utilisée de façon trompeuse. C'est ce que capture le verdict `Trompeur`.

**P5 — Transparence méthodologique systématique.**
L'utilisateur peut toujours déplier le verdict pour voir comment il a été produit. Pas d'opacité de boîte noire.

**P6 — La qualité d'une source compte autant que la quantité.**
Dix blogs anonymes ne valent pas un rapport de l'INSEE.

## 2. Les 8 verdicts

Le système de notation est multi-classes, pas un score continu. Chaque verdict est défini par : son nom, sa définition, ses critères de déclenchement, sa couleur d'affichage, et un exemple.

### V1 — Factuellement vrai
**Définition** : l'affirmation est exacte, suffisamment précise, et étayée par plusieurs sources de qualité.
**Critères** : au moins 2 sources de tier 1 ou 2 confirmant directement, aucune source crédible en contradiction, contexte non-déformant.
**Couleur** : vert.
**Exemple** : "La France compte 18 régions administratives" → vrai (DOM-TOM inclus, depuis 2016).

### V2 — Plutôt vrai
**Définition** : l'affirmation est globalement correcte mais comporte une imprécision mineure ou un arrondi qui ne change pas le sens.
**Critères** : sources confirment l'idée générale, écart < 10% sur les chiffres, ou imprécision lexicale sans incidence.
**Couleur** : vert clair.
**Exemple** : "Il y a environ 67 millions de Français" alors que la pop. est 68,4 M → plutôt vrai.

### V3 — Trompeur (vrai mais sorti de contexte)
**Définition** : le fait énoncé est techniquement exact, mais son cadrage induit une conclusion erronée.
**Critères** : la donnée brute est correcte, mais cherry-picking de période, comparaison non-pertinente, omission d'un facteur essentiel.
**Couleur** : orange.
**Exemple** : "Le chômage a baissé de X% depuis Y" en omettant un changement de définition statistique sur la période.

### V4 — Contesté / Discuté
**Définition** : sources crédibles existent dans les deux sens, ou l'affirmation porte sur un sujet où le consensus n'est pas établi.
**Critères** : au moins une source de tier 1 affirme, au moins une source de tier 1 conteste. Ou : sujet en débat scientifique ouvert.
**Couleur** : jaune.
**Exemple** : "L'effet de la politique X sur l'inflation a été Y" — sujet où économistes divergent.

### V5 — Plutôt faux
**Définition** : l'affirmation comporte une erreur substantielle mais conserve un noyau exact.
**Critères** : sources contredisent un élément central, mais d'autres éléments tiennent.
**Couleur** : rouge clair.
**Exemple** : "X a voté pour la loi Y" alors que X s'est abstenu (le vote a eu lieu, mais pas "pour").

### V6 — Factuellement faux
**Définition** : l'affirmation est démentie par les sources de référence sur le fait central.
**Critères** : au moins 2 sources de tier 1 démentent, aucune source crédible ne soutient.
**Couleur** : rouge.
**Exemple** : "L'OMS a déclaré que X" alors qu'aucune déclaration de l'OMS en ce sens n'existe.

### V7 — Non vérifiable
**Définition** : l'affirmation, par sa nature, ne peut pas être tranchée par des sources publiques (anecdote privée, projection future non quantifiable, intention prêtée).
**Critères** : aucune source publique ne peut trancher en principe, OU le fait porte sur l'intériorité d'une personne.
**Couleur** : gris foncé.
**Exemple** : "X pensait que..." (intention), "Dans 50 ans, Y arrivera" (projection lointaine).

### V8 — Non vérifié (faute de temps ou de signal)
**Définition** : l'app n'a pas pu collecter suffisamment de signal pour produire un verdict robuste, mais l'affirmation est en principe vérifiable.
**Critères** : moins de 2 sources de tier 1 ou 2 trouvées, ou contradictions trop fortes pour trancher en automatique.
**Couleur** : gris.
**Exemple** : statistique récente que la recherche n'a pas fait remonter.

### Note sur les opinions
Les **opinions** ("c'est inacceptable", "c'est une bonne politique") ne reçoivent **aucun verdict** — elles sont reconnues à l'extraction comme non-factuelles et n'entrent pas dans le pipeline de vérification. C'est un cas séparé du verdict V7.

## 3. Niveau de confiance dans le verdict

Indépendant du verdict lui-même.

- **Confiance élevée** : sources nombreuses, de qualité, convergentes, méthodologie claire.
- **Confiance moyenne** : sources convergentes mais peu nombreuses, ou de qualité mixte, ou affirmation un peu floue à cadrer.
- **Confiance faible** : sources rares, contradictions partielles, formulation ambiguë de l'affirmation.

**Règle dure** : un verdict V6 (factuellement faux) sur une personne nommée n'est affiché publiquement que si **confiance élevée**. Sinon, downgrade automatique en V5 ou V4. C'est la règle qui réduit le risque diffamatoire.

## 4. Hiérarchie des sources

Quatre tiers, plus une zone interdite.

### Tier 1 — Sources primaires officielles
Données publiées par les producteurs primaires de l'information. INSEE, Eurostat, World Bank, organisations onusiennes, Légifrance, sites officiels de ministères et institutions, journaux officiels (BO, JO), comptes-rendus parlementaires, rapports de cours des comptes, dépôts d'études scientifiques (Pubmed, Cochrane, NBER).

### Tier 2 — Médias de référence et fact-checkers reconnus
Agences de presse internationales (AFP, Reuters, AP), grands médias avec rédaction éditoriale et corrections publiées (Le Monde, Libération, Reuters, BBC, etc.), services de fact-checking certifiés IFCN (AFP Factuel, Les Surligneurs, CheckNews, PolitiFact, Snopes, Full Fact).

### Tier 3 — Médias secondaires et publications spécialisées
Médias avec rédaction mais d'orientation marquée, presse spécialisée crédible, think tanks reconnus (avec mention explicite de leur orientation), publications universitaires non-peer-reviewed.

### Tier 4 — Encyclopédies collaboratives et agrégateurs
Wikipedia, OurWorldInData, Statista. Utilisables comme **point de départ**, jamais comme source unique. Toujours suivre les références primaires.

### Zone interdite — Non recevable
Blogs anonymes, sites complotistes connus, contenu généré par IA non identifié, médias de propagande d'État sans contre-source, captures d'écran sans contexte vérifiable, réseaux sociaux comme source unique. Une liste noire est maintenue (cf. § 7).

## 5. Méthodologie de vérification — pas-à-pas

Quand une affirmation arrive au moteur de vérification, voici la procédure exacte.

**Étape 1 — Catégorisation.** L'affirmation est typée : `statistique_publique`, `evenement_recent`, `citation`, `donnée_scientifique`, `historique`, `juridique`, `attribution_personnelle`. Le type oriente les sources prioritaires.

**Étape 2 — Décomposition.** Si l'affirmation contient plusieurs sous-affirmations, on les sépare et on les traite chacune ("X depuis 2017, ce qui en fait une première en Europe" = 2 affirmations).

**Étape 3 — Recherche ciblée.** Selon le type, requêtes lancées en priorité sur les sources tier 1 attendues ; en parallèle, recherche web ouverte. Filtres : domaines de la zone interdite exclus, langue FR puis EN.

**Étape 4 — Lecture des sources.** Top 5-10 documents récupérés en plein texte. Extraction du passage pertinent. Notation de la pertinence.

**Étape 5 — Synthèse argumentée.** Le LLM reçoit l'affirmation, les passages, et doit produire :
1. Un verdict candidat parmi V1-V8.
2. Un niveau de confiance.
3. Une explication courte.
4. Une explication longue avec citations.
5. Au moins 2 sources retenues.

**Étape 6 — Garde-fous post-LLM.**
- Si moins de 2 sources retenues → forcer V8.
- Si verdict V6 et au moins une source tier 1 contredit le verdict → forcer V4.
- Si l'affirmation cite une personne nommée et verdict V6 et confiance < élevée → downgrade en V5 ou V4.
- Si l'affirmation est ancienne (> 5 ans) et la source la plus récente est antérieure → mention "donnée potentiellement obsolète" ajoutée.

**Étape 7 — Émission de l'événement.** Verdict, sources, métadonnées poussés vers l'UI.

## 6. Cas particuliers

### Citations
"X a dit Y" : on cherche la trace primaire (vidéo, transcription officielle, tweet original). En l'absence de trace primaire vérifiable, verdict V7 (non vérifiable) plutôt que V6.

### Statistiques sans source citée
"Selon une étude...", "il est démontré que..." sans référence : on cherche les études cohérentes. Si on ne trouve pas, verdict V8 + mention "étude non identifiée".

### Affirmations historiques contestées
Histoire ancienne (avant XIXe) : on s'appuie sur les ouvrages de référence en histoire académique, pas sur la presse. Cas sensibles (génocides, guerres) : extrême prudence, sources tier 1 universitaires uniquement, downgrade automatique en cas de doute.

### Questions juridiques
Toujours citer l'article exact du code applicable et son interprétation jurisprudentielle si pertinente. Ne jamais inventer un article.

### Données scientifiques
Privilégier les méta-analyses et revues systématiques (Cochrane, NICE, HAS) sur les études isolées. Mentionner le niveau de consensus.

### Prédictions
Toute affirmation sur le futur ("dans 10 ans, X arrivera") tombe sur V7 ou est reformulée en "selon les projections de [source], il est probable que X" — auquel cas la projection est vérifiable, pas l'événement futur.

## 7. Liste noire et liste blanche de domaines

Maintenues en versionnage, mises à jour mensuellement. Critères :
- **Liste blanche** : domaines tier 1 et tier 2 où la recherche peut s'appuyer fortement.
- **Liste noire** : domaines de la zone interdite, sites de désinformation documentés (croisement avec les listes du Conseil de l'UE, de NewsGuard, et des observatoires des médias).

⚠️ La maintenance de cette liste est un travail éditorial sensible. À V1 il faut un processus clair : proposition → revue par 2 personnes → publication.

## 8. Affichage côté utilisateur

Un verdict se présente toujours avec **5 éléments visibles** :
1. Le nom du verdict avec sa couleur.
2. La phrase exacte vérifiée (la `canonical`, pas le mot-à-mot brut).
3. L'explication courte (1-3 phrases).
4. Le niveau de confiance.
5. Au moins 2 sources cliquables avec leur titre et leur publisher.

Sur clic, l'utilisateur peut déplier :
- L'explication longue.
- Toutes les sources retenues avec leur extrait pertinent et leur tier.
- La méthodologie : type d'affirmation, requêtes lancées, sources écartées et pourquoi.
- Le bouton "contester ce verdict".

## 9. Boucle de feedback humain

L'utilisateur peut sur chaque verdict :
- Dire "verdict correct".
- Dire "verdict incorrect" + raison.
- Suggérer une source manquante.

Ces signaux sont collectés (avec consentement, voir `05-ethique`). En V1 ils alimentent une revue manuelle. En V2 ils peuvent entraîner l'ajustement du modèle d'extraction et de pondération des sources.

## 10. Évaluation continue de la qualité

Trois mécanismes :
- **Jeu d'or** : 100 affirmations annotées par 2 humains, mis à jour trimestriellement. Mesure d'accuracy par classe et de F1 macro.
- **Audit a posteriori** : un échantillon aléatoire de verdicts produits en prod est revu manuellement chaque semaine.
- **Comparaison avec fact-checkers humains** : sur les sujets également traités par les Surligneurs, AFP Factuel, etc., on compare nos verdicts. Discordances analysées.

Le tout est documenté publiquement (cf. principe de transparence — `05-ethique`).
