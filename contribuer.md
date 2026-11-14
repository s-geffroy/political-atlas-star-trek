---
title: Contribuer à la vérification
nav: contribuer
permalink: /contribuer/
description: Comment signaler une erreur ou contribuer à la vérification des événements de l’atlas politique de Star Trek.
---

L’atlas est un inventaire de travail : chaque événement est recoupé par au moins une source, mais un recoupement n’est pas un visionnage intégral, et des erreurs restent possibles. Toute aide à la vérification est bienvenue — mais **aucune donnée publiée n’est modifiable directement par un visiteur**. Chaque proposition passe par une relecture, puis par une nouvelle version du corpus.

## Ce qui aide le plus

1. **Signaler une source officielle.** Une entrée de niveau B passe en A quand une page officielle propre à l’épisode (startrek.com, Paramount+) confirme son fait central ; une entrée C passe en B avec un guide ou récapitulatif indépendant concordant. Indiquez l’URL et la phrase qui concorde.
2. **Signaler une erreur factuelle** : épisode mal cité, date diégétique contestable, acteur erroné. Citez l’épisode et, si possible, le moment de la scène.
3. **Discuter une analogie** d’une fiche approfondie : proposez une objection ou une explication alternative, avec ses sources.

## Comment faire

- Ouvrez un signalement sur le dépôt : [nouvelle vérification](https://github.com/{{ site.repository }}/issues/new?template=verification.md). Chaque fiche d’événement propose aussi un bouton qui pré-remplit l’identifiant.
- Un compte GitHub est nécessaire. Les signalements sont publics.
- Ne joignez pas de capture d’écran ou d’extrait vidéo des œuvres : une référence (épisode, minute) suffit.

## Ce qui se passe ensuite

1. Le signalement est relu.
2. La correction est portée dans les fichiers sources (CSV et document analytique), avec son motif dans la note d’audit.
3. Le site est reconstruit à partir de la nouvelle version. L’identifiant de l’entrée ne change jamais ; l’ancienne valeur reste dans l’historique du dépôt.

Voir aussi la [méthodologie]({{ '/methodologie/' | relative_url }}) et la [définition des niveaux]({{ '/methodologie/' | relative_url }}#niveaux).
