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

## Fait en V0.5 (2026-11-10)

Journal : `data/corrections/V0.5.json`. Passe « B -> A » : les 165 entrees B confrontees aux sources officielles (startrek.com, Paramount+) ; 113 passees en A, 52 restees B (source officielle partielle, absente ou non verifiable). Repartition V0.5 : A 207, B 52, C 46.

Chronologie de diffusion exhaustive : 15 series, 57 saisons, 15 films (pages /chronologie/series/ et /chronologie/films/).

## Fait en V0.6 (2026-11-10)

Journal : `data/corrections/V0.6.json` ; proposition validee : `docs/proposition-entrees-c.md`. Les 46 entrees C reprises une a une : 43 intitules corriges (dont 14 reecritures substantielles), 3 episodes cites corriges, 4 problematiques ajustees ; 6 passees en A, 36 en B ; 2 doublons marques (STP-054 -> STP-298, STP-254 -> STP-111) ; 2 non attestees (STP-013, STP-014). Repartition V0.6 : A 213, B 88, C 4.

## Fait en V0.7 (2026-11-10)

Journal : `data/corrections/V0.7.json` ; proposition validee : `docs/proposition-categories-v07.md`. Categories des 43 entrees reecrites en V0.6 revues a partir du seul texte corrige : 30 ajustees, 13 maintenues.

## Fait en V0.8 (2026-11-10)

Doublons tranches (`data/doublons.json`, journal `data/corrections/V0.8.json`) : STP-054 -> STP-298, STP-254 -> STP-111, STP-270 -> STP-216. Aucune suppression ; les secondaires renvoient a la principale et ne sont plus comptees (302 evenements distincts pour 305 entrees).

## Fait en V0.9 (2026-11-10)

STP-013 rattachee a TNG « Up the Long Ladder » et « Attached » (formation du gouvernement mondial terrien), STP-014 recoupee (guerres Kzinti) : niveau B. Plus aucun evenement distinct en C (A 212, B 90).

## P1 -- reste a faire

- 52 entrees B sans source officielle exploitable : pages Paramount+ d'episode non verifiables, saison 4 de SNW et Starfleet Academy sans recapitulatif officiel a ce jour.
- Score Lighthouse officiel a mesurer (https://pagespeed.web.dev/).

## P1 -- historique (avant V0.4)

3. Faire passer en A ou B les entrees de niveau C (262), en commencant par DS9 puis TNG, conformement a la priorite documentaire du corpus.
4. Qualifier les 85 entrees « autre / a qualifier » : c'est la plus grosse lacune de l'atlas thematique.
5. Ajouter au corpus des categories pour les domaines qui n'en ont pas (institutions, colonialisme/occupation, religion, technologie/IA). Aujourd'hui, seul un rapprochement lexical non valide les alimente.
6. Rattacher les references sans sigle (« First Contact » dans STP-009, STP-011, STP-013) en corrigeant le champ `source`.
7. Etendre `data/diffusion.json` aux episodes de toutes les entrees (68 sur 305 sont datees). Lever les divergences de dates de DS9 (syndication) a l'aide d'une source primaire.
8. Ajouter une source de controle a la fiche STP-077.
9. Score Lighthouse officiel non mesure : quota anonyme PageSpeed Insights epuise, conteneur Lighthouse refuse par le controle de securite de la session. A lancer depuis https://pagespeed.web.dev/ ou Chrome DevTools > Lighthouse. DOM de l'explorateur allege depuis (environ 790 elements).

## P2 -- fait (2026-11-10)

- 10. Analyses fiction / histoire : une page par fiche approfondie (/analyses/STP-NNN/), composee des volets de la fiche, des dates de diffusion sourcees et du paragraphe « Lignes de force » de la periode ; aucune analyse redigee.
- 11. Graphiques comparatifs (/graphiques/) : categories x series, categories x decennie de diffusion (cartes de chaleur lisibles comme tableaux), niveaux par serie (barres empilees). Palette des niveaux A/B/C revalidee (luminosite, daltonisme, contraste) et appliquee a tout le site.

- 13. Relations documentees : 60 relations orientees (22 causes, 28 suites, 10 meme arc), chacune etablie par la page citee, affichees sur 87 fiches (`data/relations.json`, proposition validee : `docs/proposition-relations.md`).

## P2 -- evolutions

10. Ecrire d'autres analyses fiction / histoire a partir des 31 fiches (Terra Prime, Leyton, Section 31, Data).
11. Graphiques comparatifs : repartition des categories par serie et par decennie de diffusion.
12. Visualisations geopolitiques : acteurs (Federation, Klingons, Romuliens, Cardassiens, Dominion...). Cela suppose d'ajouter au corpus un champ « acteurs », qui n'existe pas aujourd'hui.
13. Relations : etendre au-dela des 60 relations actuelles (paires partageant un episode, relations entre series non explorees).
14. Le cas echeant, migrer vers Astro avec le template `github-pages-ci`, par exemple pour une recherche plein texte indexee ou des pages par acteur.
15. Domaine personnalise : saisir le domaine dans Settings > Pages, puis vider `baseurl`.
