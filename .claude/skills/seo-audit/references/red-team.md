# Revue contradictoire et quality gates

Utilise par l'orchestrateur avant chaque constat important, et par le
sous-agent `agents/seo-red-team.md` en Phase F. Gates reprises de
seo-agent-skills/seo-quality-gates (MIT) ; faux positifs de seo-agent-skills,
web-quality-skills et claude-seo (MIT).

## Pour chaque finding important

1. au moins **trois hypotheses alternatives** (ex. 403 partout : WAF qui vise
   notre UA, geoblocage, vraie panne) ;
2. la « bonne pratique » est-elle presentee comme une **obligation** ?
3. l'echantillon permet-il la generalisation (`scope: template` ou `site`
   exige plusieurs pages du gabarit) ?
4. le gain annonce est-il une **promesse** ? (tout chiffre de gain = rejet)
5. la preuve citee existe-t-elle et dit-elle bien cela (ouvrir le fichier) ?
   Un en-tete liste dans `manifest.json` > `headers_recorded_when_present` et
   absent d'un enregistrement est **absent de la reponse** (observe), pas « non capture ».
   `site.variants[].same_body_as_home` dit si une variante sert le meme corps.

## Faux positifs classiques -- a chasser

| Faux positif | Pourquoi |
|---|---|
| sitemap absent = critique | aide a la decouverte, pas une exigence |
| robots.txt en 404 = erreur | 4xx = aucune restriction |
| canonical present = canonical retenu | le choix de Google ne se lit que dans GSC |
| `site:` sans resultat = desindexe | `site:` n'est pas un outil de diagnostic fiable |
| page absente du sitemap = non indexee | aucun lien de cause |
| 403/5xx pour notre UA = Googlebot bloque | environnement non representatif |
| Lighthouse = experience reelle | labo ; INP terrain non mesure |
| JSON-LD valide = rich result | eligibilite propre a chaque fonctionnalite |
| plusieurs H1 = erreur | pas une regle Google |
| meta description absente = probleme d'indexation | sujet de CTR, P3 |
| seuil de mots non atteint = contenu maigre | le nombre de mots n'est pas un facteur |
| bot d'entrainement IA bloque = invisible en IA | entrainement != recherche |
| noindex sur panier/recherche/filtres = defaut | souvent voulu |
| rendu partiel = contenu absent | sans rendu, c'est NON_VERIFIABLE |
| orpheline dans l'echantillon = orpheline | l'echantillon ne voit pas tous les liens |

## Quality gates -- REJETE si declenche

1. donnee inventee (note, avis, prix, auteur, stat, citation) ;
2. balisage d'avis/notes sans avis reels visibles, ou auto-attribues ;
3. FAQPage inventee ou hors sujet ;
4. bourrage de mots-cles, listes de villes ;
5. pages satellites, contenu de masse sans valeur, traduction automatique non
   relue en masse ;
6. contenu generique « pour l'algorithme » ;
7. cannibalisation creee par la recommandation elle-meme ;
8. cloaking, texte ou liens caches, redirections trompeuses ;
9. promesse de position, de trafic, de citation IA.

## RISQUE_MAJEUR -- revue humaine imperative

`noindex` / Disallow (sections desindexees), canonical (mauvaise URL
consolidee), redirections (chaines, boucles, perte), hreflang (mauvaise
langue servie), migration, schema injecte sur tout le site. Exiger : intention
confirmee, perimetre exact, sauvegarde, plan de retour arriere, controle apres
mise en place.

## Verdicts

`ACCEPTE` (preuve suffisante, action proportionnee) ; `A_VERIFIER` (plausible,
preuve insuffisante : rester SUSPECTE ou INVESTIGUER) ; `REJETE` (faux positif,
gate declenche, ou preuve qui ne dit pas cela) ; `RISQUE_MAJEUR` (peut etre
juste, mais l'action peut nuire : revue humaine obligatoire).
