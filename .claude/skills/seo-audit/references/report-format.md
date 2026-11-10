# Format de restitution -- les gestes avant le jargon

Dossier : `~/seo-audit-reports/<domaine>/<UTC-AAAAMMJJ-HHMMSS>/`, droits
restreints (`umask 077`).

| Fichier | Qui l'ecrit | Contenu |
|---|---|---|
| `manifest.json` | seo_fetch.py (+ completer : outils, mode, depot) | horodatage, versions, limites, couverture |
| `signals.json`, `crawl-summary.md`, `evidence/` | seo_fetch.py | faits observes |
| `findings.json` | Claude, valide par validate_findings.py | constats |
| `findings.csv`, `evidence-index.md` | make_report.py | |
| `qa-review.md` | Claude, d'apres le sous-agent red-team | verdicts, desaccords |
| `executive-summary.md`, `actions.md`, `implementation-plan.md`, `README.md` | Claude | ci-dessous |

Ajoute au manifest, a la main si besoin : `mode`, outils effectivement
utilises (navigateur, Lighthouse + digest, CrUX), sources consultees avec
date, SHA du depot.

## A. Verdict executif (`executive-summary.md`, une page)

- URL, type de site presume (et pourquoi), date, langues/pays consideres ;
- **reellement controle** : nb de pages, familles, gabarits, outils ;
- **non controle** : rendu JS ?, CWV terrain ?, GSC ?, depot ?, zones exclues ;
- 3 a 5 problemes dominants, angles morts, niveau de confiance global ;
- **aucune note de « sante SEO »**.

## B. Les cinq gestes prioritaires (`actions.md`, en tete ; et dans la conversation)

```
**[SEO-00x / P1] -- ACTION A FAIRE**
**Ou :** URL, CMS, fichier, composant, configuration.
**Preuve :** observation exacte, source, date (reference evidence/...).
**Pourquoi :** effet plausible et incertitude.
**Comment :** 1. ... 2. ... (etapes concretes, propres au site)
**Effort :** fourchette justifiee.
**Risque :** effets de bord, sauvegarde necessaire.
**Controle :** test precis et critere de reussite.
```

Si les preuves manquent, les premiers gestes sont des verifications ou des
demandes d'acces : c'est un resultat honnete, pas un echec.

## C. Backlog (`actions.md`, ensuite)

`ID | Statut preuve | P | Geste | Impact | Confiance | Effort | Risque | Dependance | Responsable`

## D. Diagnostic par categorie (`actions.md`, fin)

Technique, indexation, architecture/maillage, contenu, balisage,
performance, local/international/e-commerce si concerne, opportunites
conditionnelles, **constats rejetes par la revue** (avec la raison). URL et
elements constates ; zones non explorees nommees.

## E. Depot (si mode SOURCE) -- `implementation-plan.md`

`constat -> route -> fichier:ligne -> modification -> tests -> risques ->
diff`. Aucun patch applique ; source analysee != code deploye.

## F. Plan d'action -- `implementation-plan.md`

Immediat / 7 jours / 30 jours / 90 jours, dependances et jalons verifiables.
Peut etre « recueillir telle preuve ».

## G. Mesure et validation -- `implementation-plan.md`

Baseline avant changement (si donnees), KPI pertinents (couverture
indexable, pages valides GSC, impressions/clics organiques, CTR avec
prudence, conversions SEO, CWV terrain), calendrier, limites d'attribution,
seuils d'alerte, procedure de retour arriere pour les changements a risque.
Un test passe au vert ne prouve pas un gain de classement.

## H. Informations a obtenir -- `executive-summary.md`, fin

Pour chaque acces (GSC lecture, analytics, logs serveur, objectifs et
marche, depot, CMS) : ce qu'il permettrait de trancher concretement.

## README.md du run

Trois lignes : URL, date, mode ; ordre de lecture des fichiers ; rappel que
`evidence/` contient du contenu de tiers.
