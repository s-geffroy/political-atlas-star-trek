# Proposition V0.32 -- fiches STP-267, STP-194, STP-239 et STP-197 alignees sur l'ecran

Proposition validee le 2026-11-16 (docs/ exclu du site). Suite des analyses redigees du
2026-11-16 (/analyses/STP-267/, /analyses/STP-194/, /analyses/STP-239/, /analyses/STP-197/). Quatre entrees
touchees ; periodes, problematiques et categories inchangees ; intitules inchanges par defaut (intitule de STP-267 :
options plus bas, rien d'inscrit). Journal correspondant : V0.32.json.

**Base : V0_31_2026-11-16**, derniere version presente dans data/source/ au moment de l'essai (V0.30 et V0.31 y
figurent deja ; data/corrections/V0.31.json est identique au brouillon v031/V0.31.json). Les textes « Avant » sont
ceux du Markdown V0.31, identiques a _data/fiches.json (verifie par gen.py, qui les lit dans le Markdown). Essai a
blanc de `appliquer()` en memoire (essai.mjs) : aucun refus, aucun avertissement, aucun fichier ecrit ; quatre notes
d'audit V0.32, section des corrections ajoutee, quatre lignes « V0.32 révisé » dans le CSV ; textes « Apres » et
sources ajoutees presents dans le Markdown produit. Meme resultat avec chacune des deux options d'intitule de STP-267
(essai-intitule-1.json, essai-intitule-2.json). Si une autre version est produite d'ici l'integration, changer
`base` (python3 -I gen.py <BASE>) et relancer l'essai.

Les citations a l'appui renvoient aux brouillons d'analyse (numeros entre crochets = sources du brouillon, pas de la
page publiee) : s31film/brouillon.md, mirrors/brouillon-194.md et brouillon-239.md, synthetiques/brouillon.md. Toutes
les citations anglaises des motifs ont ete retrouvees dans les copies `web/` des brouillons (chk_motifs.py).

---

## STP-267 -- Operation de Section 31 autour de Georgiou (film « Star Trek: Section 31 »)

### Volet faits

Avant : Le film suit Georgiou, ancienne impératrice d’un régime esclavagiste, impliquée dans une mission de Section 31 pour empêcher la mise en service d’une arme dangereuse.

Apres : Le film suit Georgiou, ancienne impératrice d’un régime esclavagiste, impliquée dans une mission de Section 31 qui vise d’abord à empêcher la vente d’une arme au Haut Conseil minosien, puis à récupérer et détruire cette arme, le Godsend, que Georgiou avait elle-même fait construire.

Appui (transcription tiree des sous-titres, Springfield! Springfield! [1] ; Memory Alpha [3]) :
- Vente -- briefing : « Noe's on his way to the Baraam to sell his latest creation to the Minosian High Council. There are no formal hostilities with the Minosian Sway, but that could change if they get their hands on a superweapon. » [1]
- Arme construite pour Georgiou -- GEORGIOU : « So I built a weapon to end all threats. I called it the Godsend. » ; (Quasi) « It's Godsend. No apostrophe. » [1]
- Destruction -- Memory Alpha : « Georgiou used her [[biosignature]] to complete the activation and flew the ship into the [[spatial anomaly|anomaly]], so as to collapse the passage between the two universes. » [3]

### Volet parallele

Avant : La comparaison pertinente touche au contrôle démocratique des services secrets et à la responsabilité des anciens dirigeants impliqués dans des crimes.

Apres : La comparaison pertinente touche au contrôle démocratique des services secrets et à la responsabilité des anciens dirigeants impliqués dans des crimes. Le film ne montre aucun organe de contrôle : le seul contrepoids visible est une officière de Starfleet détachée auprès de l’équipe, qui réclame une supervision ; la comparaison avec le contrôle démocratique est une construction de l’atlas.

Appui :
- ALOK : « She is detailed to Section 31 for this one mission only. » ; GARRETT : « Starfleet does not do assassinations. » ; « And if this unit is gonna be a permanent detail, then you all definitely need oversight. » [1]
- Aucun conseil, commission ou tribunal dans la transcription ni dans le resume de Memory Alpha [1][2] (constat d'absence).

### Sources ajoutees a la fiche (`sources_fiche`)

- « Source — Transcription de « Star Trek: Section 31 », tirée des sous-titres (Springfield! Springfield!) » : https://www.springfieldspringfield.co.uk/movie_script.php?movie=star-trek-section-31
- « Source — Memory Alpha, « Godsend » » : https://memory-alpha.fandom.com/wiki/Godsend

Raison : la source de controle (page du film [4]) ne parle pas d'arme (« joins a secret division of Starfleet ») ;
le terme de l'intitule, « arme de destruction majeure », ne s'appuie que sur Memory Alpha (« The '''Godsend''' was a
[[weapon]] of mass destruction ») [3]. Modele : V0.31 a ajoute les transcriptions aux fiches STP-281 et STP-286.

### Intitule (a trancher ; rien d'inscrit dans V0.32.json)

Actuel : « Opération clandestine de Section 31 autour de Philippa Georgiou et d’une arme de destruction majeure ».
- Option 0 : inchange ; l'appui vient de la source Memory Alpha ajoutee ci-dessus (V0.32.json).
- Option 1 : « Opération clandestine de Section 31 autour de Philippa Georgiou et du Godsend, arme de destruction massive » (essai-intitule-1.json ; « massive » traduit « mass destruction »).
- Option 2 : « Opération clandestine de Section 31 autour de Philippa Georgiou et d’une arme, le Godsend » (essai-intitule-2.json).
L'intitule est repris par le titre de la fiche, le registre, la chronologie et le reseau ; l'adresse ne change pas.

### Non propose

- Periode (« Après 2257 (chronologie secondaire) ») : conforme a l'ecran (« In 2257, she was brought to our universe ») ; inchangee.
- Note d'audit initiale (« le film 2025 se situe autour de 2324 ») : historique, non modifiable par le journal ; la note V0.18 la corrige deja.
- Relations (STP-268, STP-153, STP-278) : non demandees.

---

## STP-194 -- Exode de Terriens decouvert dans l'epave de l'ISS Enterprise (DIS « Mirrors »)

### Volet faits

Avant : En 3191, Discovery retrouve une épave de l’ISS Enterprise. Une inscription raconte une mutinerie menée par des dissidents de l’Empire terrien qui tentaient de faire passer des réfugiés dans l’univers principal.

Apres : En 3191, Discovery retrouve une épave de l’ISS Enterprise, dont les journaux du capitaine ont été effacés. Une plaque, que Book résume, raconte qu’après l’assassinat d’un haut chancelier réformateur, qu’elle ne nomme pas, l’équipage s’est mutiné et s’est enfui en emmenant des réfugiés vers l’univers principal. La plupart de ses membres figurent ensuite dans les bases de données de la Fédération.

Appui (transcription de « Mirrors », chakoteya.net [1]) :
- BOOK : « Shuttles and escape pods gone, too. Captain's logs erased. Crew abandoned ship. » ; recapitulatif officiel : « the captain's log was erased » [4].
- BOOK : « It's the crew's story. The Terran High Chancellor was killed for trying to make reforms, and this crew escaped. They mutinied. Brought refugees with them who were trying to flee their universe for ours. »
- Le mot « dissidents » n'est pas prononce ; StarTrek.com ecrit « a group of rebellious reformers » [6].
- Chancelier non nomme : « the plaque didn't identify Spock by name » (Memory Alpha [9]) ; aucune des deux transcriptions de la plaque ne le nomme [2][5].
- BURNHAM : « So I had Zora look up the crew names on the manifest. Guess what? Most of them ended up in Federation databases. » / BOOK : « So they did make it. Started new lives in our universe. »

### Sources ajoutees a la fiche

- « Source — Transcription de « Mirrors » (chakoteya.net) » : http://www.chakoteya.net/STDisco17/505.html

### Non propose

- Intitule (« Exode ancien de dissidents de l’Empire terrien, découvert dans l’épave du ISS Enterprise en 3191 ») : il contient « dissidents ». Le brouillon d'analyse juge le mot defendable comme qualification de l'atlas ; l'ecart valide porte sur les volets. Si l'on veut aussi l'intitule : « Exode ancien de Terriens fuyant l’Empire, découvert dans l’épave du ISS Enterprise en 3191 » (non essaye).
- Volet mecanisme (« Il s’agit d’une politique d’exil ») : le brouillon note que l'ecran montre une fuite, pas une politique ; ecart non inscrit dans la liste validee.
- Date stellaire de « Mirrors » absente de data/stardates.json (« Stardate 866282.9 » [1][2]) : releve genere, a refaire par sa procedure.

---

## STP-239 -- Reforme et assassinat d'un haut chancelier terrien (DIS « Mirrors », univers Miroir)

### Volet faits

Avant : Le journal de bord et l’inscription du ISS Enterprise indiquent qu’un haut chancelier terrien réformiste a été tué. Des dissidents ont ensuite fui avec le navire en aidant des réfugiés à passer entre les univers.

Apres : Une plaque de l’ISS Enterprise, seul récit lisible à bord puisque les journaux du capitaine ont été effacés, indique qu’un haut chancelier terrien réformiste, qu’elle ne nomme pas, a été tué. Une partie de l’équipage a ensuite pris le navire et s’est enfuie en emmenant des réfugiés vers l’univers principal.

Appui :
- Pas de journal lisible -- BOOK : « Captain's logs erased. » [1] ; recapitulatif : « the captain's log was erased » [4].
- Plaque (passages identiques des deux transcriptions de seconde main, TrekCore [5] et Memory Alpha [2]) : « The new High Chancellor presented hope and justice as if they were natural to our world. » ; « But some saw this as weakness. They killed him, and we sought help from an unlikely ally: a Kelpien slave turned rebel leader. » ; « With his aid we secured the Enterprise » ; « We bear scars from our escape ».
- « Une partie de l'equipage » : Book dit « this crew escaped. They mutinied » [1] ; les transcriptions divergent sur qui est reste dans l'univers Miroir (« but he stayed behind » / « and stayed behind ») [2][5], d'ou une formule qui ne dit pas que tout l'equipage est parti.
- Le mot « dissidents » n'est pas prononce [1].

### Sources ajoutees a la fiche

- « Source — Transcription de « Mirrors » (chakoteya.net) » : http://www.chakoteya.net/STDisco17/505.html

### Non propose

- Intitule (« … assassinat et fuite de dissidents sur le ISS Enterprise ») : meme remarque que pour STP-194 ; option non essayee : « Réformes d’un haut chancelier de l’Empire terrien, assassinat et fuite de Terriens sur le ISS Enterprise ».
- Allie kelpien (Saru Miroir) absent de la fiche, « factions radicales » (interpretation de « some ») : ecarts releves par le brouillon, non inscrits dans la liste validee.
- Note d'audit initiale (« Attesté par une plaque… ») : historique, inchangee.
- Justification de la relation STP-239 -> STP-194 : voir relation-239-194.md (hors journal : data/relations.json).

---

## STP-197 -- Interdiction federale des formes de vie synthetiques (PIC saison 1)

### Volet faits

Avant : Après l’attaque des chantiers martiens en 2385, le Conseil de la Fédération interdit la création et l’usage de synthétiques. L’effort de secours massif des Romuliens est également abandonné.

Apres : Après l’attaque des chantiers martiens en 2385, les formes de vie synthétiques sont interdites dans toute la Fédération, avec effet immédiat : les unités en service sont démantelées et les recherches arrêtées. L’effort de secours massif des Romuliens est également abandonné, avec sa cause propre : avant même l’attaque, quatorze espèces membres menaçaient de quitter la Fédération si le sauvetage continuait, et les navires manquaient. La levée de l’interdiction, à la fin de la saison, n’est annoncée que par une réplique.

Appui (transcriptions chakoteya.net) :
- Decision, sans organe nomme -- PICARD (« The End is the Beginning » [3]) : « All synthetic lifeforms are banned, throughout the Federation, effective immediately. All active units are dismantled and all research is halted. » ; JURATI (« Remembrance » [1]) : « It's a violation of galactic treaty. » Aucune replique lue ne nomme le Conseil de la Federation ; la mention venait de l'ancienne source B de la fiche (startrekarchive.com [37]).
- Romuliens -- CLANCY (« Maps and Legends » [2]) : « but even before the synthetics attacked Mars, 14 species within the Federation said, cut the Romulans loose, or we'll pull out. » ; « We didn't have enough ships left. »
- Levee -- SOJI (« Et in Arcadia Ego, Part 2 » [7]) : « And now that they've lifted the ban on synthetics, I'm free to travel. » ; le recapitulatif officiel du dernier episode n'en parle pas [18].

### Sources ajoutees a la fiche

- Transcriptions de « The End is the Beginning », « Maps and Legends » et « Et in Arcadia Ego, Part 2 » (chakoteya.net) : http://www.chakoteya.net/StarTrekPIC/103.html, .../102.html, .../110.html

### Non propose

- Retrait de la source startrekarchive.com des sources de la fiche : le journal ne retire pas de source ; la note d'audit V0.32 dit d'ou venait la mention du Conseil.
- Volet mecanisme (distinguer les deux decisions) et volet contexte (« débats sociaux sur technologie, frontières et crise humanitaire ») : inchanges ; l'analyse dit que les declarations d'auteurs sur le Brexit, Trump et les refugies ne portent pas sur l'interdiction.
- Doublon possible STP-201 / STP-202 (levee) et justification de la relation STP-197 -> STP-202 (« After the Federation lifts the ban on synths », Wikipedia) : a examiner a part.
- Champ `source` (« PIC saison 1 ») : inchange.

---

## Motifs

(voir V0.32.json, une entree par fiche)

Decision de l utilisateur (2026-11-16) : integrer ; intitule de STP-267, option 2.
