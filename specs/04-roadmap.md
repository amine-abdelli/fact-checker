# 04 — Feuille de route

Découpage en phases avec critères de sortie clairs. Les durées sont des ordres de grandeur ; elles supposent une équipe d'1 à 2 personnes à temps plein équivalent.

## Phase 0 — Cadrage et POC technique (2-3 semaines)

**But** : prouver que la chaîne est faisable techniquement, sans interface, sur quelques minutes d'audio.

**Livrables**
- Script Python local qui prend un fichier mp3 (extrait de débat public **FR ou EN**), produit la transcription diarisée, extrait 5 affirmations, lance la vérification, génère un TL;DR + un résumé normal, sort un Markdown avec les verdicts horodatés.
- **Benchmark multilingue** des fournisseurs d'ASR sur 30 min FR + 30 min EN : Speechmatics (candidat par défaut), Gladia, Deepgram Nova-3, et Whisper local. Métriques : taux d'erreur sur noms propres et chiffres, qualité diarisation à 2 et 4 locuteurs, latence p50/p95, coût par heure.
- Choix tranché : ASR du MVP (par défaut Speechmatics, à confirmer), LLM d'extraction, LLM de vérification, LLM de résumé, fournisseur de recherche.
- Décisions ouvertes du README arbitrées (plateforme MVP, modèle économique, autonomie du verdict). La décision langues est désormais tranchée : FR + EN au MVP via un fournisseur unique (cf. ADR-07).

**Critère de sortie** : on a 3 démos écrites convaincantes (3 extraits différents traités correctement de bout en bout) et un budget cloud / heure mesuré.

## Phase 1 — MVP (8-12 semaines)

**But** : mettre dans les mains d'utilisateurs pilotes une app fonctionnelle sur la plateforme cible.

**Sprint 1 — Squelette du pipeline**
- Pipeline événementiel asynchrone, 5 étages connectés.
- Stockage SQLite local avec le schéma de `02-architecture-technique.md`.
- Tests d'intégration end-to-end sur fichier audio statique.

**Sprint 2 — Capture audio temps réel**
- Capture micro fonctionnelle.
- Capture son système (recommandation : macOS d'abord pour la simplicité).
- UI de session : start, pause, stop, témoin d'écoute.

**Sprint 3 — Transcription et diarisation live**
- Intégration de l'ASR streaming.
- Affichage live du mot-à-mot avec labels de locuteur.
- Édition manuelle des labels par l'utilisateur.

**Sprint 4 — Extraction d'affirmations**
- Prompt d'extraction stabilisé sur le jeu d'or.
- Streaming des affirmations détectées vers l'UI (état "extraite").
- Filtre par seuil de vérifiabilité.

**Sprint 5 — Moteur de vérification (le plus gros)**
- Recherche multi-source.
- Pipeline de lecture + synthèse + verdict.
- Garde-fous post-LLM.
- Affichage du verdict avec sources.

**Sprint 6 — UI complète, timeline rejouable et résumés**
- Liste des claims, filtres, vue résumé de session.
- **Timeline scrollable** de la session avec densité de couleur par verdict, saut audio sur clic d'un timestamp (ADR-08).
- **Stockage de l'audio brut chiffré** localement avec mini-player intégré pour le replay.
- **Trois niveaux de résumé** (TL;DR / normal / détaillé) générés à la demande et rafraîchis périodiquement en arrière-plan.
- Mode replay session : ouverture d'une session passée et navigation comme en live.
- Export Markdown et JSON avec tous les timestamps.
- Boucle de feedback utilisateur.

**Sprint 7 — Polissage et tests utilisateurs**
- Tests d'intégration sur 10 extraits d'or.
- Beta privée avec 5-10 testeurs.
- Itération sur les retours.

**Critères de sortie de la Phase 1**
- Tous les critères d'acceptation du MVP de `01-cahier-des-charges.md` § 8 sont cochés.
- Latence médiane affirmation → verdict < 60 s sur 5 sessions de référence.
- Aucun bug bloquant connu non documenté.
- Au moins 5 testeurs ont fait une session de plus de 30 min et donné un feedback structuré.

## Phase 2 — V1 publique (10-14 semaines après MVP)

**But** : ouvrir l'app au public avec une qualité défendable et une politique claire.

**Chantiers**
- **Qualité du verdict** : monter le score sur le jeu d'or (cible F1 macro > 0,80).
- **Performance** : latence médiane affirmation → verdict < 30 s.
- **Robustesse** : sessions de 3 h sans problème.
- **Couverture cas d'usage** : ajouter ingestion de lien YouTube et fichier vidéo.
- **Benchmark ASR par langue** (cf. ADR-07) : sur 4 h d'audio FR et 4 h EN, comparer Speechmatics au meilleur spécialiste par langue. Décider de basculer en Stratégie B si l'écart dépasse un seuil à définir (~3 points de WER ou perte de diarisation > 5 points).
- **Résumés ciblés** : par locuteur, par sujet (avec détection automatique des sujets via embeddings).
- **Couverture EN complète** des sources tier 1/2 (le MVP livre une couverture FR complète et un sous-ensemble EN).
- **Compte utilisateur optionnel** + synchro multi-appareils chiffrée.
- **Page de transparence** publique : méthodologie, jeu d'or, liste blanche/noire de sources, gouvernance.
- **Mode pédagogique** : explications dépliantes complètes, glossaire, parcours d'apprentissage.
- **Boucle de feedback** active : signalement des verdicts, revue manuelle hebdo, publication des corrections.
- **Accessibilité** : conformité WCAG AA validée.
- **Conformité RGPD** : registre, mentions, droits utilisateurs, DPO si nécessaire.
- **Audit externe** : un audit indépendant sur le risque de biais politique avant le lancement public (cf. `05-ethique`).

**Critères de sortie**
- Page de transparence publiée.
- Audit externe de biais réalisé, résultats publiés.
- 50+ utilisateurs en beta ouverte sur 1 mois sans incident bloquant.
- Procédure de réponse aux signalements en place et testée.
- Conformité RGPD validée juridiquement.

## Phase 3 — V2 mobile et extensions (durée selon budget)

**Chantiers possibles, à prioriser ensemble**
- **App mobile** (iOS d'abord, ou Android selon démographie cible).
- **Extension navigateur** pour s'attacher à `<video>` sur YouTube et sites de chaînes.
- **Mode collaboratif** (sessions partagées entre utilisateurs).
- **Langues supplémentaires** (espagnol et allemand en priorité — FR + EN sont déjà au MVP).
- **Reconnaissance de personnalités** (opt-in strict, base limitée).
- **API B2B** pour rédactions (dashboard pro, export, intégrations CMS).
- **Bascule Stratégie C** (cf. ADR-07) : Whisper local en option pour mode souverain / offline, ramène le coût ASR à zéro.

## Phase 4 — V3 et au-delà (vision long terme)

- **Stratégie C généralisée** (cf. ADR-07) : Whisper local devient le défaut pour les utilisateurs qui activent le mode souverain — un seul modèle pour toutes les langues, coût marginal nul.
- **Modèles LLM open-source locaux** par défaut, pour le pipeline d'extraction, de vérification et de résumé.
- **Mode plateforme** : édition collaborative de la liste blanche/noire de sources avec une communauté de contributeurs.
- **Intégration directe avec services de fact-checking professionnels** (partenariat AFP, IFCN, etc.).
- **Mode "histoire" pour l'éducation** : extraits annotés réutilisables comme support de cours.

## Jalons commerciaux et communication

À aligner avec la Phase 2 :
- **J0** — Page de pré-inscription publique avec démo vidéo (en parallèle du MVP).
- **J+3 mois MVP** — Annonce beta publique, presse spécialisée tech et médias.
- **J+6 mois** — Premier rapport public de qualité (transparence sur les erreurs identifiées et corrigées).
- **J+12 mois** — Conférence ou table ronde avec fact-checkers professionnels pour discussion publique de la méthodologie.

## Risques de planning

- **Le moteur de vérification prend 2x plus de temps que prévu**. Probable, parce que c'est la brique la plus difficile. Mitigation : prévoir le sprint 5 sur 4 semaines plutôt que 2.
- **L'ASR streaming FR ou EN local n'atteint pas la qualité Speechmatics**. Probable au MVP. Mitigation : Stratégie A en cloud, bascule Stratégie C en V2+ uniquement si la qualité est suffisante.
- **Coût par heure plus élevé que prévu** (~1,10 €/h cloud-only au MVP avec résumés, vs cible initiale 0,50 €/h). Mitigation : optimisations cache et dédup en V1 pour viser ~0,80 €/h, bascule local en V2+ pour viser < 0,30 €/h. Acter la cible révisée tôt dans la planification du modèle économique.
- **L'audit de biais politique remonte des problèmes**. Mitigation : prévoir 4 semaines de buffer avant le lancement public V1.
- **Conformité RGPD plus lourde que prévu** (notamment sur reconnaissance vocale). Mitigation : repousser cette feature en V2+ et s'assurer que le MVP n'en a pas besoin.

## Points de décision majeurs au fil du chemin

| Quand | Décision | Pré-requis |
|---|---|---|
| Fin Phase 0 | Plateforme du MVP | Benchmark capture audio sur les 3 OS |
| Mi Phase 1 | LLM cloud vs LLM local pour extraction | Coût mesuré + qualité comparée |
| Fin Phase 1 | Beta privée vs publique | Critères d'acceptation MVP cochés |
| Mi Phase 2 | Modèle économique | Métriques d'engagement de la beta privée |
| Mi Phase 2 | Stratégie ASR : rester en A (Speechmatics) ou basculer en B (multi-provider par langue) | Benchmark FR + EN sur 4 h chaque langue |
| Fin Phase 2 | Lancement public ou V1.5 fermée | Audit de biais + RGPD |
| Phase 3 | Quelle plateforme V2 prioritaire | Démographie de la base utilisateurs V1 |

## Définition globale du "fini"

Pour chaque feature livrée, "fini" signifie :
- Tests automatisés écrits et passants.
- Documentation utilisateur à jour.
- Métriques d'observabilité en place.
- Revue par un second pair (peer review).
- Démo interne validée.
- Rollback prévu en cas de problème.
