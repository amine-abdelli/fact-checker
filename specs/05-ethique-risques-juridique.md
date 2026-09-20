# 05 — Éthique, risques et conformité juridique

Ce document existe parce qu'une app qui assigne des verdicts publics à des affirmations de personnes nommées est, intrinsèquement, **un objet sensible**. Le risque ici n'est pas marginal ; il est central. Si on rate cette partie, le projet ne tiendra pas — ni juridiquement, ni dans l'opinion.

## 1. Cartographie des risques

### Risque R-01 — Diffamation
L'app produit un verdict "factuellement faux" sur une affirmation d'une personne nommée, à tort. Cette personne peut considérer que l'app la met publiquement en cause sur la base d'un jugement automatique erroné.
**Niveau** : critique.
**Mitigation** :
- Règle dure du § 3 de `03-modele-fiabilite-sources.md` : verdict V6 sur personne nommée → confiance élevée requise, sinon downgrade.
- Page de transparence publique avec procédure de signalement / rectification.
- Délai de 24 h pour le retrait d'un verdict signalé erroné, dans l'attente de revue.
- Réfléchir à un opt-in pour rendre publics les verdicts (en V0/V1 : verdicts privés à l'utilisateur, pas de partage social par défaut).

### Risque R-02 — Hallucinations LLM
Le LLM invente un fait, une source ou un chiffre.
**Niveau** : critique.
**Mitigation** :
- Le LLM ne sort jamais de fait sans citer une source réelle vérifiable.
- Pipeline qui valide que les URLs citées existent et que le contenu cité s'y trouve effectivement (vérification mécanique avant émission).
- Tests adversariaux dédiés (claims piégeux, claims sur des sujets inexistants).

### Risque R-03 — Biais politique perçu ou réel
Les utilisateurs perçoivent l'app comme orientée. Cela peut être un biais réel des modèles, un biais des sources retenues, ou un biais de l'agrégation.
**Niveau** : élevé, structurel.
**Mitigation** :
- **Jeu d'or politiquement équilibré** : 50% claims provenant de personnalités d'orientations diverses, par sujet et par bord.
- Audit externe avant la V1 publique, mené par une équipe pluridisciplinaire avec expertise en sciences politiques.
- Publication des erreurs identifiées par bord politique, sans cacher les biais résiduels.
- Pas de filtrage idéologique des sources tier 1 ; seules les sources de la zone interdite (cf. § 4.7 de `03`) sont exclues, sur critères publics.
- Pluralisme des sources tier 2 (presse de gauche, presse de droite, presse internationale).

### Risque R-04 — Surcorrection / sous-correction
Soit l'app marque "faux" trop facilement (faux positifs), soit elle marque "non vérifié" en permanence pour éviter le risque (sous-utilité).
**Niveau** : moyen.
**Mitigation** : suivi continu de la distribution des verdicts. Cible : pas plus de 60% des claims sortis avec un verdict V7 ou V8.

### Risque R-05 — Effet de halo et déresponsabilisation cognitive
Les utilisateurs surestiment la fiabilité de l'app et perdent leur esprit critique.
**Niveau** : moyen.
**Mitigation** :
- Affichage systématique du niveau de confiance.
- Onboarding qui explique la méthodologie et les limites.
- Bouton "voir comment c'est calculé" toujours visible.
- Texte d'accueil : "Cet outil vous aide à vérifier, il ne remplace pas votre jugement."

### Risque R-06 — Manipulation / empoisonnement de l'app
Quelqu'un publie massivement des fausses sources sur un sujet pour influencer l'agrégation.
**Niveau** : faible au MVP, à anticiper en V2+.
**Mitigation** : pondération par tier de source, prudence accrue sur les sujets émergents (downgrade automatique de la confiance pendant les premières 48 h).

### Risque R-07 — Captation de données personnelles
L'app capte des conversations qui contiennent potentiellement des données personnelles de tiers (la personne d'en face dans un débat).
**Niveau** : élevé, juridique direct.
**Mitigation** : voir § RGPD ci-dessous.

### Risque R-08 — Usage en contexte non autorisé (espionnage)
Un utilisateur capte la voix de quelqu'un sans son consentement (réunion, conversation privée).
**Niveau** : élevé.
**Mitigation** :
- Conditions d'utilisation explicites : interdiction d'enregistrer des personnes sans leur consentement légal.
- Témoin d'écoute visuel non équivoque côté app.
- Refus de capter en mode discret au MVP.
- Mention dans l'onboarding du cadre légal (en France, art. 226-1 du Code pénal sur l'enregistrement de paroles privées).

### Risque R-09 — Atteinte au droit à l'image / à la voix
Reconnaissance automatique de personnalités (V1+). Même sur figures publiques, le droit n'est pas le même selon contexte.
**Niveau** : élevé.
**Mitigation** : la reconnaissance auto est repoussée en V2+, opt-in, base limitée à un nombre très réduit de figures publiques explicitement intégrées au catalogue, avec procédure de retrait sur demande.

### Risque R-10 — Coût d'infrastructure non maîtrisé
Une session virale (1000 utilisateurs simultanés sur un débat présidentiel) explose les coûts.
**Niveau** : moyen.
**Mitigation** : rate limiting, cache agressif (un même claim qui apparaît dans 1000 sessions n'est vérifié qu'une fois), quotas par utilisateur.

### Risque R-11 — Dépendance critique à un fournisseur tiers
ASR cloud, LLM cloud, API de recherche : si un fournisseur change ses CGU ou ses prix, tout casse.
**Niveau** : moyen.
**Mitigation** : architecture en ports/adapters, possibilité de basculer un fournisseur en quelques jours, présence d'au moins une alternative testée pour chaque brique critique.

## 2. Conformité RGPD

### 2.1 Cadre général
L'app traite des données personnelles à plusieurs titres :
- L'utilisateur lui-même (compte, historique).
- La voix et les paroles de tiers captés dans les conversations.
- Les noms de personnalités publiques mentionnées (et donc des données les concernant).

L'app est responsable de traitement au sens du RGPD. La nomination d'un DPO devient nécessaire dès qu'un traitement à grande échelle de données sensibles est en jeu — à étudier dès la V1 publique.

### 2.2 Bases légales par traitement
- **Captation et transcription de la voix de l'utilisateur** : consentement explicite (case à cocher au démarrage de la session, pas pré-cochée).
- **Captation et transcription de la voix de tiers** : c'est le point le plus délicat. L'app n'est pas légalement le responsable de la captation (c'est l'utilisateur qui appuie sur le bouton), mais elle peut être considérée comme co-responsable. Mitigation : obligations contractuelles à la charge de l'utilisateur via les CGU, refus de fonctionnalités d'enregistrement caché, mentions légales claires.
- **Stockage de l'historique** : intérêt légitime (utilité du produit) + consentement (le user peut refuser et tout reste en RAM).
- **Vérification (envoi de texte transcrit aux APIs cloud)** : exécution du contrat (c'est l'objet du service).

### 2.3 Droits utilisateurs implémentés
- Accès : export complet en JSON (`REQ-F-22`).
- Rectification : édition des labels de locuteurs, des transcriptions, des verdicts contestés.
- Effacement : suppression d'une session ou de tout l'historique en un clic (`REQ-F-25`).
- Portabilité : export Markdown / JSON.
- Opposition : refus de la synchro cloud, refus du compte.

### 2.4 Durées de conservation
- Sessions locales : durée illimitée tant que l'utilisateur ne supprime pas. Stockage chiffré.
- Sessions synchronisées (V1+) : durée alignée sur le compte ; suppression automatique à la fermeture du compte + 30 jours.
- Données envoyées aux APIs cloud (texte transcrit) : pas de rétention côté serveur app, et obligations contractuelles aux fournisseurs (data retention off, zero training si possible).
- Logs d'observabilité : 30 jours, anonymisés.
- Feedback utilisateur : conservés tant que pertinent pour amélioration, anonymisés au bout de 1 an.

### 2.5 Sous-traitants
La liste des sous-traitants (ASR, LLM, recherche web, hébergement) est rendue **publique** sur la page de transparence. Chaque sous-traitant doit accepter un contrat conforme RGPD (CCT si transfert hors UE).

### 2.6 Transferts hors UE
À éviter quand possible. Si Deepgram (US) ou OpenAI/Anthropic sont utilisés, transfert encadré par CCT et mention claire à l'utilisateur. À V2 envisager l'usage de modèles européens (Mistral, etc.) pour les utilisateurs sensibles à ce point.

## 3. Conformité française et européenne spécifique

### 3.1 Loi Informatique et Libertés
Identique au RGPD pour l'essentiel. La CNIL a doctrine sur la voix : à consulter pour la reconnaissance de personnalités (V2+).

### 3.2 Loi sur la liberté de la presse de 1881
Pas applicable directement à l'app puisqu'elle n'est pas un éditeur de presse, mais les verdicts publics sur des personnes pourraient être attaqués sur des bases voisines de la diffamation. Les CGU doivent clarifier que les verdicts sont produits automatiquement, accompagnés d'un niveau de confiance, et qu'ils ne constituent pas des affirmations éditoriales.

### 3.3 AI Act européen
Entrée en application progressive. L'app entre dans la catégorie des **systèmes d'IA à risque limité** ou **élevé** selon analyse. Obligations probables :
- Marquage clair que les verdicts sont produits par IA.
- Documentation technique exhaustive.
- Possibilité d'intervention humaine.
- Mécanisme de signalement.
À approfondir avec un juriste avant la V1 publique.

### 3.4 Droit d'auteur
Les sources citées sont citées avec extraits courts (fair quotation). Pas de reproduction d'articles entiers. Lien obligatoire vers la source primaire pour que le clic de l'utilisateur passe par l'éditeur.

## 4. Gouvernance interne

### 4.1 Comité de méthodologie
Avant la V1 publique, mettre en place un comité de 3-5 personnes (interne + externe) qui valide :
- Les modifications de la liste blanche/noire de sources.
- Les changements majeurs de la méthodologie de verdict.
- La revue trimestrielle du jeu d'or.
- Les cas escaladés (verdicts contestés non triviaux).

### 4.2 Procédure de signalement
- Signalement utilisateur depuis l'app → traitement sous 5 jours ouvrés.
- Signalement de personnes citées via formulaire public → traitement sous 48 h en V1, avec possibilité de retrait conservatoire immédiat.
- Tenue d'un registre interne de tous les signalements et actions prises, publié en agrégé chaque trimestre.

### 4.3 Transparence publique
Une page web de transparence accessible depuis l'app, contenant :
- La méthodologie complète des verdicts (extrait public de `03-modele-fiabilite-sources.md`).
- La liste des sources tier 1 et tier 2.
- Les sous-traitants et leur juridiction.
- Les statistiques agrégées : nombre de sessions, distribution des verdicts, nombre de signalements et taux de correction.
- Les rapports d'audit de biais.
- Les changements de méthodologie versionnés (changelog public).

## 5. Charte d'usage destinée à l'utilisateur

Affichée à la première utilisation, et accessible à tout moment. Texte court à rédiger, dont l'esprit est :
- Tu utilises cet outil pour t'aider à réfléchir, pas pour décréter qui a raison.
- Tu n'enregistres jamais quelqu'un sans son consentement quand la loi l'exige.
- Tu sais que les verdicts sont produits automatiquement et peuvent se tromper ; tu vérifies les sources avant de t'en servir publiquement.
- Tu peux signaler une erreur — c'est ainsi qu'on s'améliore.

## 6. Modèle de menace (à compléter avant V1)

Threat model dédié à écrire avant V1, couvrant :
- Adversaire qui injecte des prompts dans le contenu d'une source web pour manipuler le LLM de vérification (prompt injection).
- Adversaire qui floode l'app de signalements pour faire retirer des verdicts vrais.
- Adversaire qui manipule la chaîne audio (audio adversarial input).
- Vol de données par un sous-traitant compromis.
- Compte compromis et exfiltration d'historique.

## 7. Plan d'incident

Préparé avant la V1 publique :
- Procédure de retrait d'un verdict (kill switch sur claim_id).
- Procédure de désactivation d'une feature (kill switch produit).
- Communication de crise type, prête à adapter.
- Liste de personnes à mobiliser (juriste, communication, technique).
- Test de l'incident à blanc une fois par an.

## 8. Synthèse des engagements visibles publiquement

Les 6 engagements à afficher dans l'app et sur la landing :
1. **Aucun verdict sans sources citées.**
2. **Le silence vaut mieux que l'erreur** — on dit "non vérifié" plutôt que de risquer un faux verdict.
3. **Tu vois toujours comment un verdict est produit.**
4. **Tu peux contester chaque verdict en un clic.**
5. **Tes données t'appartiennent** — local par défaut, suppression instantanée.
6. **Audits de biais publiés.**

Ces engagements sont contractuels (intégrés aux CGU) et opposables.
