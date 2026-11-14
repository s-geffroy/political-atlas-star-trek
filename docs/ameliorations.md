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

## Fait en V0.10 (2026-11-10)

Doublons tranches : STP-294 -> STP-230, STP-296 -> STP-232 (relations reportees ou retirees). Periodes de STP-239 et STP-194 corrigees : « Entre 2267 et la fin du XXIVe siecle » d'apres startrek.com et Memory Alpha (la date de 3191 est celle de la decouverte, non des faits). 300 evenements distincts pour 305 entrees.

## Fait en V0.11 (2026-11-10)

Doublon tranche : STP-238 -> STP-176 (renversement de Georgiou par Lorca, univers Miroir) ; relation STP-288 reportee, STP-176 -> STP-238 retiree. 299 evenements distincts pour 305 entrees.

## Fait du 12 au 14 novembre 2026 (V0.12 a V0.21)

- V0.12 a V0.17 : constats historiens, typographie, sources d'episode, SFA au XXXIIe siecle, diffusion de Past Tense.
- V0.18 : dix periodes precisees d'apres l'ecran ; V0.19 : 51 entrees B portees a A sur les pages officielles d'episode ; V0.20 : Lignes de force 1970-1986 et 2006-2016, doublon STP-055 ; V0.21 : corrections de la revue du 14/11 (docs/revue-2026-11-14.md).
- Copies archivees des sources (data/archives.json), dates stellaires des journaux de bord (data/stardates.json), cinq analyses redigees (data/analyses-redigees.json).
- Garde-fous : verify (arbre propre, adresses publiees conservees, rapport de qualite), hook pre-push sur HEAD.
- Etat : 259 A, 38 B, 1 C (298 evenements distincts) ; 165 relations, 98 evenements sans relation apres quatre passes.

## Reste a faire

- Revue du 14/11, actions 6 et 7 : relire les 214 periodes en annee (erreurs relevees : STP-104, 106, 113, 165, 275, 162, 098, 225) et les intitules A au regard des 85 reserves de leurs notes.
- Reseau : recalcul des arcs (arcs tenus par les seuls liens « episode commun », chaines coupees par le decoupage par serie) -- refonte de structure, accord requis ; etiquettes tronquees ; liens passant sous des boites.
- 38 entrees B sans source officielle confirmant l'intitule entier (choix de ne pas reduire les intitules).
- Interface : en-tete mobile trop haut ; style.css de Primer publie.
- Score Lighthouse et Search Console : gestes de l'utilisateur.
- Protection de main et des tags corpus-* (ruleset GitHub) : geste de l'utilisateur.

## Evolutions possibles

- Autres analyses redigees (Praxis STP-077, J'naii STP-107, Satie STP-101, Una STP-048), une a la fois.
- Visualisations par acteur (suppose un champ « acteurs » dans le corpus).
- Migration eventuelle vers Astro avec le template `github-pages-ci`.
- Domaine personnalise (Settings > Pages, puis vider `baseurl`).
