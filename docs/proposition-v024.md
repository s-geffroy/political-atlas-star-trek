# Proposition V0.24 -- points mineurs de la revue du 14/11 (niveaux A sur page thematique, STP-187, STP-224)

Brouillon (docs/ exclu du site). Rapport de recherche verifie (deux pages officielles archivees relues).

# Vérifications mineures — corpus V0.23 (2026-11-14)

Lecture seule ; aucun fichier du dépôt modifié. Toutes les citations sont copiées des pages réellement lues
(User-Agent « atlas-verification/1.0 »).

Sources consultées : API CDX et rediffusions web.archive.org (ancienne base startrek.com/database_article),
startrek.com en direct (curl), API MediaWiki de Memory Alpha et de Wikipedia, transcriptions chakoteya.net,
pages Paramount+ dans le navigateur partagé (fermé ensuite), recherche pplx pour trouver les URL.

Limites :
- Paramount+ (vu depuis la région GB) : les pages de saison ne donnent qu'un synopsis d'une ligne. Aucun ne suffit
  pour les entrées concernées. Les pages vidéo /shows/video/<id>/ trouvées par recherche renvoient 404 dans
  cette région, et Prodigy saison 2 n'y est pas (404).
- Les citations de dialogue de Prodigy proviennent des notes et des journaux de bord recopiés par Memory Alpha.
  Je n'ai trouvé aucune transcription intégrale de Prodigy saison 2.

---

## Tâche 1 — pages officielles propres à l'épisode

### STP-001 — Guerre totale de l'Antiquité vulcaine puis doctrine de Surak

Pages de l'ancienne base startrek.com lues en archive : « The Savage Curtain », « Forge, The », « Awakening »,
« Kir'Shara ». Aucune ne mentionne la guerre ancienne :
- Savage Curtain (https://web.archive.org/web/20100812221147/http://www.startrek.com:80/database_article/savage-curtain) :
  seulement « Surak, founder of the present Vulcan culture ».
- Awakening (https://web.archive.org/web/20100717091243/http://www.startrek.com:80/database_article/awakening) :
  « Surak , a man who died 2,000 years ago » ; « Loyal to Surak's teachings and resistant to violence ».
- Kir'Shara (https://web.archive.org/web/20100722011825/http://www.startrek.com:80/database_article/kirshara) :
  la seule guerre citée est la guerre vulcano-andorienne évitée (« a war is averted »).
- Paramount+ (synopsis de saison) : « Kirk and Spock are forced into a battle of good and evil. » (TOS) ;
  pour « The Forge », « Awakening » et « Kir'Shara », rien sur la guerre ancienne.

Aucune page officielle propre à l'épisode ne confirme donc le fait central. **Proposition : passer en B.**

| Champ | Avant | Après |
|---|---|---|
| niveau_recoupement | A | B |
| nature_source | Éditorial officiel | Résumé secondaire indexé |
| url_source | https://www.startrek.com/en-un/news/15-years-ago-one-enterprise-epic-set-the-stage-for-discovery | https://memory-alpha.fandom.com/wiki/The_Forge_(episode) |
| event | (inchangé) | (inchangé) |

Citations :
- Memory Alpha, « The Forge (episode) », réplique de Soval : « We had our wars, Admiral, just as Humans did. Our planet was devastated, our civilization nearly destroyed. Logic saved us, but it took us nearly fifteen hundred years to rebuild and travel to the stars. »
- En appui, Memory Alpha, « The Savage Curtain (episode) » (https://memory-alpha.fandom.com/wiki/The_Savage_Curtain_(episode)) : « Surak proposes to become an emissary, the option that resolved the final war on Vulcan. »
- En appui, Memory Alpha, « Awakening (episode) » (https://memory-alpha.fandom.com/wiki/Awakening_(episode)) : « "The war is taking its toll. Vulcan is tearing itself apart", an elderly appearing Vulcan man says. »

Réserve : Memory Alpha (« Awakening », Background information) parle d'« atomic weapons ». Cela confirme
indirectement l'aspect nucléaire écarté en V0.12. Ne pas le réintroduire dans l'intitulé : c'est une note de
fond, pas une page officielle.

### STP-020 — Empoisonnement du peuple akaali par une exploitation minière clandestine

Page propre à l'épisode trouvée. **A maintenu.**

| Champ | Avant | Après |
|---|---|---|
| nature_source | Éditorial officiel | Récapitulatif officiel |
| url_source | https://www.startrek.com/en-un/news/pre-warp-impersonations-prime-directive | https://web.archive.org/web/20100719215348/http://www.startrek.com:80/database_article/civilization |

Citations (base startrek.com, « Civilization ») :
- « the city's groundwater is contaminated with tetracyanate 622, a toxic compound primarily used as an industrial lubricant, which appears to be responsible for the plague. »
- « take a stairwell to find a massive underground drilling operation operated by scaly-gray aliens. Archer determines they're mining a veridium isotope, which is used to manufacture explosives, and their drill bits are saturated with tetracyanate. »
- « The Enterprise crew removes all the mining equipment and provides an antidote for the plague »

Cette page lève la réserve V0.5 : l'exploitation minière y est explicite.

### STP-042 — Projet fédéral d'anéantir Qo'noS, abandonné sous la menace d'une mutinerie de l'équipage

Pages officielles propres à l'épisode lues ; aucune ne confirme le fait central :
- Base startrek.com « will-you-take-my-hand » (archives du 12 mars 2018 au 2 avril 2023, par ex.
  https://web.archive.org/web/20200811033959/https://www.startrek.com/database_article/will-you-take-my-hand) :
  seulement « With Georgiou at the helm of the plan to end the Klingon war once and for all, the U.S.S. Discovery crew struggles to fathom and tolerate her hostile tactics. Memories of past hardships are rekindled within Burnham . »
  Les mots hydro, bomb, genocid, mutin, volcan n'apparaissent dans aucune archive.
- Paramount+ (saison 1) : même synopsis.
- startrek.com « 8 Takeaways from "Will You Take My Hand?" After Trek » : rien sur la bombe ni sur la mutinerie.

**Proposition : passer en B.**

| Champ | Avant | Après |
|---|---|---|
| niveau_recoupement | A | B |
| nature_source | Éditorial officiel | Résumé secondaire indexé |
| url_source | https://www.startrek.com/en-un/news/starfleet-encounters-with-qonos | https://memory-alpha.fandom.com/wiki/Will_You_Take_My_Hand%3F_(episode) |

Citations (Memory Alpha, « Will You Take My Hand? (episode) ») :
- « Tilly who explains that detonating a hydro bomb in an active volcano would lead to an apocalyptic explosion that would render the planet uninhabitable, which was Georgiou's plan all along. »
- « Burnham believes Georgiou is following Starfleet's orders. »
- « Burnham pleads with Cornwell that genocide is not the way to end the war. »
- « She threatens another mutiny to prove who they are as Starfleet officers, and unlike her last mutiny, the crew stands to support her. Cornwell then asks what Burnham is suggesting as an alternative. »

Note : la page Wikipedia « Will You Take My Hand? » redirige vers « Star Trek: Discovery season 1 ». Il n'y a
donc pas de page Wikipedia propre à l'épisode.

### STP-115 — Infiltration d'une cellule du Maquis et défection de Ro Laren

Page propre à l'épisode trouvée. **A maintenu.**

| Champ | Avant | Après |
|---|---|---|
| nature_source | Éditorial officiel | Récapitulatif officiel |
| url_source | https://www.startrek.com/en-un/news/essential-ro-laren-watch-list | https://web.archive.org/web/20100719173348/http://www.startrek.com:80/database_article/preemptive-strike |

Citations (base startrek.com, « Preemptive Strike ») :
- « Federation ships from the renegade group the Maquis attack a Cardassian vessel near the Demilitarized Zone. »
- « Admiral Nechayev decides to send Ro Laren into the Maquis community as an undercover operative. »
- « But at the last moment, Ro grabs a phaser, points it at Riker, then reveals the Enterprise 's location. The Maquis ships retreat, and Ro goes with them, asking Riker to tell Picard she is sorry she let him down. »

### STP-158 — Capitulation du Dominion et armistice mettant fin à la guerre du quadrant Alpha

Page propre à l'épisode trouvée. **A maintenu, avec une réserve de vocabulaire.**

| Champ | Avant | Après |
|---|---|---|
| nature_source | Éditorial officiel | Récapitulatif officiel |
| url_source | https://www.startrek.com/en-un/news/star-treks-most-breathtaking-and-consequential-battles | https://web.archive.org/web/20101130130656/http://www.startrek.com:80/database_article/what-you-leave-behind-part-ii |

Citations (base startrek.com, « What You Leave Behind, Part II ») :
- « Hoping to commune with the Female Shapeshifter, Odo links with her and heals the Shapeshifter of the disease that has ravaged their people. Transformed by the experience, she orders a cease-fire. »
- « With the signing of surrender documents, the war officially ends. »

Réserve : la page dit « cease-fire » et « surrender documents », pas « armistice ». La capitulation qui met fin
à la guerre (fait central) est confirmée mot pour mot. Le mot « armistice » repose toujours sur Wikipedia et
Memory Alpha (déjà cités dans la note V0.23). L'intitulé n'est pas réduit.

### STP-217 — Enquête sur les failles ouvrant des portails vers des univers parallèles

Page officielle propre à un épisode de la saison 5 trouvée : la chronique startrek.com consacrée à « Fissure
Quest » (5x09), annoncée comme « Discussion for Star Trek: Lower Decks – Season 5, Episode 9 ». **A maintenu.**

| Champ | Avant | Après |
|---|---|---|
| url_source | https://www.startrek.com/en-un/news/warp-five-lowers-decks-series-finale-cerritos-future | https://www.startrek.com/en-un/news/below-deck-with-lower-decks-boiming-the-rifts |
| nature_source | Éditorial officiel | (inchangé) |

Citations (startrek.com, « Below Deck with Lower Decks: Boiming the Rifts », Dayton Ward, 13 décembre 2024) :
- « he's been given a highly sensitive mission — finding and stopping whoever's been opening spatial rifts all over the place, using a special ship which can create dimensional rifts in order to bridge different realities. »
- « she's figured out a way to track the ship that's creating all the dimensional rifts! »

Complément, même série pour le final (https://www.startrek.com/en-un/news/below-deck-with-lower-decks-510-boiming-even-more-rifts) :
« still dealing with the effects of the inter-dimensional rifts which have plagued them throughout this entire season. »

Remarque : le champ source dit « LD saison 5 ». Si l'on veut l'aligner sur la page, on peut le préciser en
« LD saison 5 ; « Fissure Quest » ». C'est facultatif, et ce n'est pas une réduction de l'intitulé.

---

## Tâche 2 — STP-187 : année des réintégrations de Ni'Var et de la Terre

**Aucune année n'est dite à l'écran dans « All Is Possible » ni dans « Coming Home ».** J'ai cherché 318x, 319x et
« year » dans les 13 transcriptions de la saison 4. Les en-têtes « Stardate: 3190 » de chakoteya sont des
étiquettes ajoutées par le transcripteur, pas du dialogue. Les dates stellaires du XXXIIe siècle (par ex.
865661.2 pour « All Is Possible » selon Memory Alpha) ne relèvent pas de la convention 2323 + milliers.

Ce qui est dit à l'écran, en chaîne :
1. DIS 3x01 « That Hope Is You » : « COMPUTER: You have reached year 3188. » (http://www.chakoteya.net/STDisco17/301.html)
2. DIS 3x02 « Far From Home » : « Saru, I landed here a year ago. » (http://www.chakoteya.net/STDisco17/302.html) — Discovery arrive donc en 3189.
3. DIS 4x01 « Kobayashi Maru » : « BURNHAM: Last year at this time, Federation Headquarters was cloaked. The Federation itself had 38 member worlds. Now, we have 59. » (http://www.chakoteya.net/STDisco17/401.html) — le début de la saison 4 est donc un an après la saison 3, soit 3190.
4. DIS 5x03 « Jinaal » : « JINAAL: What year is it? BURNHAM: 3191. » (http://www.chakoteya.net/STDisco17/503.html) — borne postérieure.

Memory Alpha place les deux réintégrations en 3190 (https://memory-alpha.fandom.com/wiki/3190, section 3190) :
« Ni'Var rejoins the United Federation of Planets. ({{DIS|All Is Possible}}) » ; « United Earth rejoins the Federation. ({{DIS|Coming Home}}) ».
La fiche « All Is Possible (episode) » donne « date = 865661.2 (3190) ». Mais la fiche « Kobayashi Maru (episode) »
note : « The episode does not state if it is still 3189. »

Conclusion : la période actuelle « 3189 » contredit la chaîne des dialogues. La meilleure déduction est 3190,
mais ce n'est pas une année dite à l'écran.

Propositions (à arbitrer selon la stricte application de la règle) :
- Option 1 (déduction de dialogues, la plus exacte) : `period` « 3189 » → « 3190 ». La note d'audit doit dire que
  l'année est déduite (3188 dit + « a year ago » + « Last year at this time »), non prononcée.
- Option 2 (règle stricte, aucune année dite à l'écran) : `period` « 3189 » → une période non chiffrée, par ex.
  « XXXIIe siècle », avec la chaîne ci-dessus dans la note.
- Dans les deux cas, ne pas garder 3189.
- Niveau : le récapitulatif officiel reste A pour le fait. L'année n'y figure pas : aucune occurrence de 318x,
  319x ou « last year » dans les récapitulatifs startrek.com de « Kobayashi Maru », « All Is Possible » et
  « Coming Home », relus le 14 novembre 2026.

---

## Tâche 3 — STP-224 : années de Prodigy saison 2

Dates stellaires de journaux de bord (recopiées par Memory Alpha), converties selon la convention 2323 + milliers :

| Épisode | Journal (citation Memory Alpha) | Année déduite |
|---|---|---|
| 2x02 « Into the Breach, Part II » | « Admiral's log, classified. Stardate 61859.6. Voyager has arrived at the Beta Quadrant border… » | 2384 |
| 2x15 « Ascension, Part I » | « Dal's personal log. Stardate 61945.4. We finally made it back to Voyager. » | 2384 |
| 2x17 « Brink » | « Personal log, stardate 62083.5. Returning the Protostar to Tars Lamora will have to wait. Voyager's set a course for Solum. We've been ordered to find and neutralize the time-space technology that attacked us, to prevent all-out war with Starfleet. » (Gwyn) | 2385 |
| 2x18 « Touch of Grey » | « Admiral's personal log, stardate 62091.1. The Protostar crew are behind enemy lines on Solum… » | 2385 |
| 2x20 « Ouroboros, Part II » | « Admiral's personal log, stardate 62314.8. An old friend once said we do not feel the passage of time… » | 2385 |

URL : https://memory-alpha.fandom.com/wiki/Into_the_Breach,_Part_II_(episode), …/Ascension,_Part_I_(episode),
…/Brink_(episode), …/Touch_of_Grey_(episode), …/Ouroboros,_Part_II_(episode) ; tableau des dates :
https://memory-alpha.fandom.com/wiki/Template:PRO_Season_2.
Sur la même page, « Who Saves the Saviors » porte 61860.1, mais Memory Alpha ne l'associe à aucun journal (section
« Log entries » vide). Ce chiffre ne peut donc pas servir.

Contradiction à l'écran (signalée par Memory Alpha, non vérifiée sur transcription) :
- « Touch of Grey », Continuity : « Chakotay indicates this episode takes place 14 years, to the date, of Kathryn Janeway's first command in 2371 (suggesting 2385, which is also consistent with the stardate.) Though dialogue in the following episode, Ouroboros, Part I, indicates it is still 2384. »
- « Ouroboros, Part I », Continuity : « Dialogue indicates 2382 was "two years ago," and that 2436 is "fifty-two years from now," suggesting it is still 2384. »
- Memory Alpha range l'arc de Solum de « Brink » à « Ouroboros, Part II » en 2385 (https://memory-alpha.fandom.com/wiki/2385 :
  « The crew prevent Asencia from using time-space weapons to wage war on the Federation… ({{PRO|Brink|Touch of Grey|Ouroboros, Part I|Ouroboros, Part II}}) »).

Conclusion : selon la règle du projet (journaux de l'ère TNG), la saison 2 couvre 2384 (61859.6 à 61945.4) et 2385
(62083.5 à 62314.8). « Ouroboros », dont le seul journal est 62314.8, tombe en 2385. La période actuelle « 2384 »
seule est donc trop étroite et ne vaut pas pour « Ouroboros ».

**Proposition : `period` « 2384 » → « 2384–2385 »** (tiret demi-cadratin, comme « 2153–2154 » dans le corpus).
La note doit mentionner les cinq journaux ci-dessus et la contradiction des dialogues (« Ouroboros, Part I » laisse
entendre 2384, « Touch of Grey » 2385). Niveau et URL inchangés (cette entrée ne fait pas partie de la tâche 1).
Les années viennent d'une source B (Memory Alpha) ; je n'ai lu aucune transcription.

Pour information : Prodigy saison 2 n'est pas sur Paramount+ (404). Sur startrek.com, je n'ai trouvé un récapitulatif
par épisode que pour la saison 1 (aucune page « recap-star-trek-prodigy-ouroboros… »). Il existe une page de synopsis
de la saison 2 (https://www.startrek.com/news/star-trek-prodigy-season-2-now-available), que je n'ai pas lue en entier.

---

## Récapitulatif

| ID | Champ(s) | Avant | Après | Niveau |
|---|---|---|---|---|
| STP-001 | niveau, nature, url | A, Éditorial officiel, startrek.com/…15-years-ago… | B, Résumé secondaire indexé, memory-alpha …/The_Forge_(episode) | A → B |
| STP-020 | nature, url | Éditorial officiel, …pre-warp-impersonations… | Récapitulatif officiel, web.archive.org/web/20100719215348/…/database_article/civilization | A |
| STP-042 | niveau, nature, url | A, Éditorial officiel, …starfleet-encounters-with-qonos | B, Résumé secondaire indexé, memory-alpha …/Will_You_Take_My_Hand%3F_(episode) | A → B |
| STP-115 | nature, url | Éditorial officiel, …essential-ro-laren-watch-list | Récapitulatif officiel, web.archive.org/web/20100719173348/…/database_article/preemptive-strike | A |
| STP-158 | nature, url | Éditorial officiel, …most-breathtaking…battles | Récapitulatif officiel, web.archive.org/web/20101130130656/…/database_article/what-you-leave-behind-part-ii | A (réserve « armistice ») |
| STP-217 | url | …warp-five-lowers-decks-series-finale… | https://www.startrek.com/en-un/news/below-deck-with-lower-decks-boiming-the-rifts | A |
| STP-187 | period | 3189 | 3190 (déduit) ou « XXXIIe siècle » (règle stricte) | inchangé |
| STP-224 | period | 2384 | 2384–2385 | inchangé |
