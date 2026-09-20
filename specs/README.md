# VeriLive — Fact-checking conversationnel en temps réel

> Nom de code provisoire. À remplacer plus tard (suggestions plus bas dans `01-cahier-des-charges.md`).

## Pitch en une phrase

Une application qui écoute un débat, une discussion ou une émission, identifie qui parle, extrait les affirmations factuelles à la volée, et affiche en quasi-temps-réel un verdict sourcé pour chacune d'elles.

## Pourquoi ce dossier existe

Avant d'écrire la moindre ligne de code, on pose ici **toutes** les décisions structurantes : ce que l'app fait (et ne fait pas), comment elle est architecturée, comment elle juge la véracité d'une affirmation, et dans quel ordre on construit. L'objectif est qu'au moment d'ouvrir un éditeur, il n'y ait plus de question ouverte assez grosse pour casser l'architecture.

## Index des documents

| Fichier | Contenu | Quand le lire |
|---|---|---|
| [`01-cahier-des-charges.md`](./01-cahier-des-charges.md) | Vision produit, personas, cas d'usage, exigences fonctionnelles et non-fonctionnelles, scope du MVP | En premier, c'est la source de vérité produit |
| [`02-architecture-technique.md`](./02-architecture-technique.md) | Architecture logicielle, pipeline temps réel, choix de stack, schémas de flux | Avant toute décision technique |
| [`03-modele-fiabilite-sources.md`](./03-modele-fiabilite-sources.md) | Système de notation (les 8 verdicts), méthodologie de vérification, hiérarchie des sources, gestion de l'incertitude | Avant d'implémenter le moteur de vérification |
| [`04-roadmap.md`](./04-roadmap.md) | Découpage en phases (MVP → V1 → V2), jalons, critères de sortie de phase, planning indicatif | Pour piloter l'exécution |
| [`05-ethique-risques-juridique.md`](./05-ethique-risques-juridique.md) | Risques (diffamation, biais, hallucinations), garde-fous, RGPD, droit à l'image et à la voix, modération | Avant le premier déploiement public |

## Décisions encore ouvertes (à trancher avec moi)

Ces points sont volontairement laissés ouverts dans les specs. Je les liste ici pour qu'on en discute avant de figer la roadmap.

1. **Plateforme cible du MVP** : mobile (iOS d'abord ?), desktop (macOS d'abord ?), ou web ? Recommandation par défaut dans `04-roadmap.md` : **desktop macOS** pour le MVP (capture audio système triviale, latence maîtrisée), puis mobile en V2.
2. **Mode de capture pour la TV/YouTube** : capture du son système, capture micro de la pièce, ou intégration directe (extension navigateur pour YouTube) ? Le doc technique propose les trois mais priorise la capture système.
3. **Modèle économique** : gratuit avec quotas, freemium, B2B (rédactions / chaînes), open source ? Impacte fortement les choix d'infra.
4. **Niveau d'autonomie du verdict** : verdict assertif émis par l'app, ou présentation neutre des sources avec verdict laissé à l'utilisateur ? Recommandation forte : **verdict assertif mais nuancé**, avec sources cliquables — sans cela l'app n'apporte pas grand-chose vs. une recherche Google.
5. ~~**Langues supportées au lancement**~~ ✅ **Tranchée le 2026-05-09** : FR + EN au lancement, via un fournisseur ASR multilingue unique (Speechmatics par défaut, à confirmer en Phase 0). Stratégie d'évolution en trois temps détaillée dans `02-architecture-technique.md` § ADR-07.

## Comment lire ces documents

- Les exigences sont identifiées par un code (ex. `REQ-F-01` pour fonctionnel, `REQ-NF-01` pour non-fonctionnel) afin qu'on puisse les référencer dans les tickets.
- Les décisions d'architecture importantes sont marquées `ADR-XX` (Architecture Decision Record) pour qu'on puisse y revenir.
- Les zones d'incertitude sont signalées par `⚠️ À TRANCHER` — ce sont les points qui méritent une discussion avant de coder.

## Statut

Brouillon V0.2, mis à jour le 2026-05-09. Ce dossier est fait pour être discuté, amendé, et signé avant le sprint 0.

### Changelog
- **V0.2 (2026-05-09)** :
  - Décision multilingue tranchée : FR + EN au MVP via fournisseur unique (cf. ADR-07).
  - Ajout des résumés à 3 niveaux (TL;DR / normal / détaillé) au scope MVP (REQ-F-23 à REQ-F-30, étage 3 bis du pipeline).
  - Ajout de la timeline rejouable et de la persistance intégrale des affirmations (ADR-08, REQ-F-19/19bis/19ter, CU-03 bis).
  - Mise à jour de la roadmap (Phase 0 benchmark multilingue, Sprint 6 timeline+résumés, Phase 2 benchmark par langue).
  - Estimations de coûts revues à la hausse (~1,10 €/h MVP cloud-only, cible révisée 0,80 €/h en V1).
- **V0.1 (2026-05-09)** : pose initiale des 5 documents.
