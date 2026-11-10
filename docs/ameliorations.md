# Ameliorations futures, par priorite

## Fait (2026-11-10)

1. GitHub Pages active ; verification en ligne sur mobile et ordinateur : explorateur (tous les filtres), chronologie, fiches.
2. Audit d'accessibilite axe-core (24 analyses, WCAG 2.2 AA + bonnes pratiques) : 0 violation apres corrections ; contrastes de la palette tous >= 7:1.

## P1 -- fait en V0.4 (2026-11-10)

Journal complet : `data/corrections/V0.4.json`.

- 3. Recoupement des 262 entrees C : 77 passees en A, 139 en B, 46 maintenues en C (dont 39 avec un signalement de divergence dans la note d'audit). Repartition V0.4 : A 94, B 165, C 46.
- 4-5. Quatre categories ajoutees, 85 entrees « autre / a qualifier » requalifiees, 65 entrees completees (proposition validee, `docs/proposition-categories.md`).
- 6. « First Contact » rattache au film (STP-009, 011, 013) ; corrections de titres « Kobayashi Maru » (STP-188) et « Rubincon » (STP-232).
- 7. Dates de diffusion : 292 entrees sur 305 datees (contre 68).
- 8. Fiche STP-077 : source officielle ajoutee (synopsis startrek.com), niveau A.

## P1 -- reste a faire

- Les 46 entrees encore en C : la plupart ont un fait central non confirme ou contredit par la source consultee (voir leur note d'audit). A reprendre une par une : corriger l'intitule, changer d'episode, ou fusionner (doublon probable STP-216 / STP-270).
- Entrees B sans source officielle : une passe pplx sur startrek.com pourrait en faire monter une partie en A.
- Score Lighthouse officiel a mesurer (https://pagespeed.web.dev/).

## P1 -- historique (avant V0.4)

3. Faire passer en A ou B les entrees de niveau C (262), en commencant par DS9 puis TNG, conformement a la priorite documentaire du corpus.
4. Qualifier les 85 entrees « autre / a qualifier » : c'est la plus grosse lacune de l'atlas thematique.
5. Ajouter au corpus des categories pour les domaines qui n'en ont pas (institutions, colonialisme/occupation, religion, technologie/IA). Aujourd'hui, seul un rapprochement lexical non valide les alimente.
6. Rattacher les references sans sigle (« First Contact » dans STP-009, STP-011, STP-013) en corrigeant le champ `source`.
7. Etendre `data/diffusion.json` aux episodes de toutes les entrees (68 sur 305 sont datees). Lever les divergences de dates de DS9 (syndication) a l'aide d'une source primaire.
8. Ajouter une source de controle a la fiche STP-077.
9. Score Lighthouse officiel non mesure : quota anonyme PageSpeed Insights epuise, conteneur Lighthouse refuse par le controle de securite de la session. A lancer depuis https://pagespeed.web.dev/ ou Chrome DevTools > Lighthouse. DOM de l'explorateur allege depuis (environ 790 elements).

## P2 -- evolutions

10. Ecrire d'autres analyses fiction / histoire a partir des 31 fiches (Terra Prime, Leyton, Section 31, Data).
11. Graphiques comparatifs : repartition des categories par serie et par decennie de diffusion.
12. Visualisations geopolitiques : acteurs (Federation, Klingons, Romuliens, Cardassiens, Dominion...). Cela suppose d'ajouter au corpus un champ « acteurs », qui n'existe pas aujourd'hui.
13. References croisees avancees : relations explicites entre entrees (cause, consequence, doublon) saisies dans le corpus, plutot que deduites.
14. Le cas echeant, migrer vers Astro avec le template `github-pages-ci`, par exemple pour une recherche plein texte indexee ou des pages par acteur.
15. Domaine personnalise : saisir le domaine dans Settings > Pages, puis vider `baseurl`.
