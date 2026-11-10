# Ameliorations futures, par priorite

## Fait (2026-11-10)

1. GitHub Pages active ; verification en ligne sur mobile et ordinateur : explorateur (tous les filtres), chronologie, fiches.
2. Audit d'accessibilite axe-core (24 analyses, WCAG 2.2 AA + bonnes pratiques) : 0 violation apres corrections ; contrastes de la palette tous >= 7:1.

## P1 -- qualite documentaire

3. Faire passer en A ou B les entrees de niveau C (262), en commencant par DS9 puis TNG, conformement a la priorite documentaire du corpus.
4. Qualifier les 85 entrees « autre / a qualifier » : c'est la plus grosse lacune de l'atlas thematique.
5. Ajouter au corpus des categories pour les domaines qui n'en ont pas (institutions, colonialisme/occupation, religion, technologie/IA). Aujourd'hui, seul un rapprochement lexical non valide les alimente.
6. Rattacher les references sans sigle (« First Contact » dans STP-009, STP-011, STP-013) en corrigeant le champ `source`.
7. Etendre `data/diffusion.json` aux episodes de toutes les entrees (68 sur 305 sont datees). Lever les divergences de dates de DS9 (syndication) a l'aide d'une source primaire.
8. Ajouter une source de controle a la fiche STP-077.
9. Score Lighthouse officiel non mesure : quota anonyme PageSpeed Insights epuise, conteneur Lighthouse refuse par le controle de securite de la session. A lancer depuis https://pagespeed.web.dev/ ou Chrome DevTools > Lighthouse. Point a surveiller : la taille du DOM de l'explorateur (environ 3 700 noeuds).

## P2 -- evolutions

10. Ecrire d'autres analyses fiction / histoire a partir des 31 fiches (Terra Prime, Leyton, Section 31, Data).
11. Graphiques comparatifs : repartition des categories par serie et par decennie de diffusion.
12. Visualisations geopolitiques : acteurs (Federation, Klingons, Romuliens, Cardassiens, Dominion...). Cela suppose d'ajouter au corpus un champ « acteurs », qui n'existe pas aujourd'hui.
13. References croisees avancees : relations explicites entre entrees (cause, consequence, doublon) saisies dans le corpus, plutot que deduites.
14. Le cas echeant, migrer vers Astro avec le template `github-pages-ci`, par exemple pour une recherche plein texte indexee ou des pages par acteur.
15. Domaine personnalise : saisir le domaine dans Settings > Pages, puis vider `baseurl`.
