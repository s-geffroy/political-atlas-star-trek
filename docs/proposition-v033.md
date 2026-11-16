# Proposition V0.33 -- fiches STP-298 et STP-300 alignees sur l'ecran

Proposition validee le 2026-11-16 (docs/ exclu du site). Suite des analyses redigees du
2026-11-16 (/analyses/STP-298/, /analyses/STP-300/). Deux entrees touchees ; periodes, problematiques, categories,
intitules et niveaux de recoupement inchanges. Journal correspondant : V0.33.json (genere par gen.py).

**Base de l'essai : V0_31_2026-11-16**, derniere version presente dans data/source/ au moment de l'essai : **la V0.32
n'y figure pas encore**. Les textes « Avant » sont ceux du Markdown V0.31 (lus par gen.py dans le Markdown) ; la
V0.32 proposee (v032/V0.32.json) ne touche ni STP-298 ni STP-300, ils resteront donc identiques. Une fois la V0.32
integree : `python3 -I gen.py V0_32_2026-11-16`, puis relancer l'essai (`node essai.mjs V0.33.json`).

Essai a blanc de `appliquer()` en memoire (essai.mjs) sur la base V0.31 : aucun refus, aucun avertissement, aucun
fichier ecrit (git status inchange) ; cible Star_Trek_Atlas_Politique_V0_33_2026-11-16 ; deux notes d'audit V0.33,
section des corrections « ### V0.33 (2026-11-16) » ajoutee, deux lignes « V0.33 révisé » dans le CSV ; textes
« Apres » et trois sources ajoutees presents dans le Markdown produit. Toutes les citations anglaises des motifs ont
ete retrouvees dans les copies `web/` des brouillons (chk_motifs.py : 17/17).

Les citations a l'appui renvoient aux brouillons d'analyse (numeros entre crochets = sources du brouillon, pas de la
page publiee) : chiaroscuro/brouillon.md, orders/brouillon.md.

---

## STP-298 -- Occupation militaire klingonne de Mat'aar XII et resistance locale (SNW « A Case of Chiaroscuro »)

### Volet faits

Avant : Sur Mat’aar XII, une autorité klingonne maintient une occupation et une surveillance de la population. Une résistance clandestine tente de frapper ses dispositifs militaires et de protéger des habitants.

Apres : Sur Mat’aar XII, une autorité klingonne maintient une occupation et une surveillance de la population, avec l’appui de collaborateurs locaux, et prépare une prise de contrôle militaire totale : les Mat’aarans autochtones n’occuperaient plus de postes de pouvoir et ne pourraient plus choisir leur lieu de vie. Une résistance clandestine, dirigée en secret par Nevette, que l’occupant tient pour l’une de ses principales collaboratrices, évacue des familles et prépare une impulsion électromagnétique pour neutraliser le système de sécurité klingon ; Nevette est empoisonnée avant d’agir par Roman, un collaborateur placé sous ses ordres. Une fois l’impulsion déclenchée, le champ de force planétaire tombe et les évacuations sont organisées.

Appui :
- Collaborateurs -- M'BENGA : « Local collaborators. We must walk. » ; « He has the armband to prove it. » [1]
- Prise de controle et exclusion -- UHURA : « The Klingons are planning a full military takeover in 24 hours. » ; KOR : « Native Mat'Aarans will no longer hold positions of power, nor will they be free to live where they wish. » [1]
- Nevette -- Memory Alpha : « Nevette outwardly became one of the highest-ranking collaborators in the occupation, answering directly to Commander Kor. » ; « Covertly, she played a central role in the Mat'Aaran resistance, arranging for the evacuation of numerous families to safety. » [4] ; « Under her leadership, the resistance evacuated many families out of Klingon-controlled areas. » [3]
- Cible precise -- M'BENGA : « Once acquired, a proximity detonator will trigger an electromagnetic pulse and overload Klingon security. » ; UNA : « The resistance is planning an EMP attack. » [1] ; Memory Alpha : « which would disable all Klingon security systems across the planet » [4]. Apres le declenchement -- WAITER : « The forcefield is down! » ; M'BENGA : « Ja'lem prepared the evacuations quickly, thanks to you. » [1] ; la barriere est ce champ de force (UHURA, a l'arrivee : « Looks like the forcefield only triggered a momentary alert. ») [1].
- Roman -- Memory Alpha : « However, Nevette was fatally poisoned by her subordinate Roman before she could enact the plan. » [3] ; ROMAN : « She never respected me. Respected her resistance, though. » ; « Well, I make myself useful. They'll find a place for me. » [1] ; *Vulture* : « a collaborator under Nevette's command » [12].

### Ecart de la source de controle (a signaler)

startrekarchive.com (https://startrekarchive.com/episodes/a-case-of-chiaroscuro), source secondaire de controle de la
fiche depuis l'origine, presente Roman comme « the resistance member who killed Nevette » et Kor comme « the Klingon
governor » : la transcription [1] et Memory Alpha [3][4] le contredisent (collaborateur subordonne a Nevette ; a
l'ecran, Kor est seulement celui qui « must run this outpost »). La note d'audit V0.33 le dit. Le journal ne retire pas
de source (meme regle qu'en V0.32 pour STP-197) ; la transcription et Memory Alpha sont ajoutees.

### Sources ajoutees a la fiche (`sources_fiche`)

- « Source — Transcription de « A Case of Chiaroscuro » (chakoteya.net) » : http://www.chakoteya.net/StarTrekSNW/404.html
- « Source — Memory Alpha, « Mat’Aaran resistance » » : https://memory-alpha.fandom.com/wiki/Mat%27Aaran_resistance

### Point a trancher (rien d'inscrit)

- « Pour permettre l'evacuation » : l'ecran ne donne pas l'evacuation comme but de l'impulsion (M'Benga : « Give the
  resistance a fighting chance » ; Memory Alpha [3] : « give the resistance an opportunity to reclaim their world ») ;
  il montre la succession : impulsion, chute du champ de force, evacuations. La formule « Apres » suit cette
  succession au lieu d'enoncer un but. Si l'on veut le but, il faudrait une source qui le dise.
- Graphie : la fiche ecrit « Mat’aar », la transcription et Memory Alpha « Mat'Aar » ; « Apres » garde la graphie de la
  fiche (la page /analyses/STP-298/ suit la transcription).

### Non propose

- Volet mecanisme : inchange (la « double economie d'information » est conforme a l'ecran : Nevette collaboratrice en
  apparence, cheffe de la resistance en secret [1][4]).
- Periode : « XXIIIe siecle » inchange ; Memory Alpha deduit 2262 (date stellaire 2122.4) [2], non dit a l'ecran.
- Recoupement : reste B (TrekCore) ; la transcription [1] et Memory Alpha [2][3][4] concordent sur le fait central.
- Relations possibles (STP-062 « Errand of Mercy », STP-053/041, STP-048/050, STP-120/142, STP-169, STP-059) :
  listees par le brouillon, aucune proposee ferme ; hors journal (data/relations.json).

---

## STP-300 -- Ordre de l'amiral Reeger de detruire Argus II (SNW « Orders of Magnitude »)

### Volet faits

Avant : Vétéran traumatisé, l’amiral Reeger veut détruire Argus II, planète non fédérée de milliers d’habitants, qu’il considère collectivement comme complice. Kirk refuse et sa mise hors de fonction est organisée.

Apres : Vétéran de la guerre klingonne, blessé au cerveau au combat, l’amiral Reeger, dont la femme et les deux filles ont péri au massacre de Vaardan, ordonne en vertu de l’ordre général 24 de détruire la surface habitée d’Argus II, planète non fédérée de 5 321 habitants où s’est posé le vaisseau qu’il traque, et qu’il présume complice. Kirk s’y oppose et est mis aux arrêts ; il s’évade et verse de la cordrazine dans le café de l’amiral, que M’Benga relève alors de son commandement pour inaptitude, en vertu de l’ordre 104, section C.

Appui (transcription chakoteya.net [1]) :
- Guerre et blessure -- LA'AN : « Captain of the Federation flagship Constitution during the Klingon war. » ; KIRK (lisant les dossiers medicaux de M'Benga) : « Captain Reeger suffered a traumatic brain injury at the start of the Battle of Zeta Reticuli. He needed emergency surgery. »
- Deuil -- KIRK : « Did you know that he had a wife and two daughters? » ; REEGER : « This is personal. My family was killed by that ship. »
- Ordre -- REEGER : « I am authorising the implementation of General Order 24. When we arrive at Argus II, the entire inhabited surface of the planet... will be destroyed. »
- Planete -- SPOCK : « On course for Argus II, a small non-Federation planet. » ; « 5,321. » ; REEGER : « Argus II, in all likelihood, is their home base. » ; « What if they are not innocent? » ; Memory Alpha : « concluded that the planet's inhabitants must be in collusion with it » [3].
- Arrestation de Kirk -- REEGER : « place Lieutenant Commander Kirk under arrest for the dereliction of duty ».
- Cordrazine -- KIRK : « I spiked Reeger's coffee with cordrazine. »
- Releve -- M'BENGA : « Admiral Reeger, in accordance with Starfleet order 104, section C, I am certifying you as unfit and immediately relieving you of command. »
- Aucun diagnostic psychologique a l'ecran (« vétéran traumatisé » ecarte) ; « sa mise hors de fonction » etait ambigu (Kirk ou Reeger) : les deux releves sont decrits.

### Volet parallele

Avant : Confrontation avec les principes de distinction et de proportionnalité du droit humanitaire et les devoirs militaires face à un ordre manifestement criminel.

Apres : Confrontation avec les principes de distinction et de proportionnalité du droit humanitaire et les devoirs militaires face à un ordre manifestement criminel. Dans la fiction, l’ordre général 24 est une directive en vigueur, que Kirk appelle une directive de dernier recours ; aucune source lue ne rapporte l’épisode aux principes de distinction et de proportionnalité : la comparaison est une construction de l’atlas.

Appui :
- KIRK : « Admiral, as you know, General Order 24 is a directive of last resort. » [1] ; McElroy : « that a commander should have the ability to destroy a planet if it feels that it is a clear and present threat to the Federation » [6] (transcription automatique du podcast).
- Aucune source lue ne nomme distinction ni proportionnalite ; le seul texte qui invoque le droit humanitaire (*Tech Times* [21], peu fiable) parle de punition collective (art. 33 de la IVe Convention de Geneve). Modele de formule : V0.32, STP-267 (« la comparaison ... est une construction de l’atlas »).

### Sources ajoutees a la fiche (`sources_fiche`)

- « Source — Transcription de « Orders of Magnitude » (chakoteya.net) » : http://www.chakoteya.net/StarTrekSNW/408.html

### Signale, non inscrit : passage du niveau B au niveau A

Le brouillon pose la question (« Porter STP-300 au niveau A ? À décider (procédure 1) ») : STP-055, doublon secondaire
de STP-300, est au niveau A depuis V0.19 (page Paramount+ lue dans un navigateur le 2026-11-13) ; la transcription [1],
Memory Alpha [2][3] et Wikipedia [5] concordent sur le fait central. Rien n'est inscrit dans V0.33.json ; si l'accord
est donne, ajouter a STP-300 `champs: { niveau_recoupement: {avant: "B", apres: "A"}, nature_source: {avant:
"Compte rendu indépendant détaillé", apres: "Récapitulatif officiel"}, url_source: {avant: <TrekCore>, apres:
<page Paramount+ de STP-055>} }`, a valider (c'est STP-055 qui porte la lecture de la page officielle).

### Non propose

- Volet mecanisme (« le refus d'obeir devient la derniere protection ») : le brouillon propose d'ajouter que la releve
  pour inaptitude n'aboutit que par une manipulation ; hors liste validee, non inscrit.
- Note d'audit V0.12 (« Le prétexte des « collaborateurs » n’apparaît dans aucune des trois sources lues ») : historique,
  non modifiable ; la note V0.33 cite « What if they are not innocent? » et la presomption de complicite est reprise
  dans « Apres » (« qu'il présume complice ») ; l'intitule reduit reste juste.
- Date stellaire « 2179.3 » dite a l'ecran (journal de Kirk) [1] : `dates_stellaires` vide pour STP-300, STP-301,
  STP-055 ; data/stardates.json est un releve genere, a refaire par sa procedure.
- Archives : aucune copie archivee pour l'entretien Morton [7], McElroy [6], Jammer [18] (data/archives.json genere).
- Relations possibles (STP-057, STP-063/036, STP-247, STP-041, STP-303) : hors journal.

---

## Motifs

(voir V0.33.json, une entree par fiche)

Decision de l utilisateur (2026-11-16) : integrer ; STP-300 reste au niveau B (aucune page officielle de l episode).
