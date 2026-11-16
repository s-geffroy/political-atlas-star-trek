# Proposition V0.35 -- fiches STP-230 et STP-295 (« Vox in Excelso ») alignees sur l'ecran

Proposition validee le 2026-11-16 (docs/ exclu du site). Suite des analyses redigees du
2026-11-16 (/analyses/STP-230/ et /analyses/STP-295/). Deux entrees touchees ; periodes, problematiques, categories et
cycles inchanges ; intitule de STP-295 inchange par defaut (options plus bas, rien d'inscrit). Journal correspondant :
V0.35.json.

**Base : V0_33_2026-11-16**, derniere version presente dans data/source/ au moment de l'essai (V0.32 et V0.33 y
figurent ; **V0.34 n'y figure pas encore** : l'essai a donc ete fait sur une base anterieure a celle prevue). Ni
V0.32 ni V0.33 ne touchent STP-230 ou STP-295 (data/corrections/V0.32.json et V0.33.json : aucune occurrence). Les
textes « Avant » sont lus dans le Markdown V0.33 (gen.py) et sont identiques a ceux de _data/fiches.json. Essai a blanc
de `appliquer()` en memoire (essai.mjs) : aucun refus, aucun avertissement, aucun fichier ecrit ; deux notes d'audit
V0.35, section des corrections ajoutee, deux lignes « V0.35 révisé » dans le CSV ; textes « Apres » et source ajoutee
presents dans le Markdown produit. Meme resultat avec chacune des trois options d'intitule de STP-295
(essai-intitule-1.json a essai-intitule-3.json) : nouvel intitule dans le titre de la fiche, le registre et le CSV ;
l'ancien ne subsiste que dans l'entree historique V0.17 de la section des corrections (normal). **Quand V0.34 sera
integree** : `python3 -I gen.py V0_34_2026-11-16` (et `... V0_34_2026-11-16 1|2|3` pour les options), puis
`node essai.mjs V0.35.json` depuis la racine du depot ; si V0.34 modifie STP-230 ou STP-295, les « Avant » suivent
automatiquement, mais les « Apres » sont a relire.

Les citations a l'appui renvoient aux brouillons d'analyse (numeros entre crochets = sources du brouillon, pas de la
page publiee) : vox/brouillon-230.md et vox/brouillon-295.md. Toutes les citations anglaises des motifs ont ete
retrouvees dans les copies vox/web/ (chk_motifs.py : 17/17).

---

## STP-230 -- Crise menacant l'existence et l'avenir des Klingons (SFA « Vox in Excelso »)

### Volet faits

Avant : Après le Burn, Qo’noS est inhabitable et plusieurs maisons klingonnes vivent en diaspora. La Fédération propose une planète de repli, mais leur représentativité et leur conception de l’honneur rendent l’aide politiquement délicate.

Apres : Après le Burn, Qo’noS est inhabitable et les huit maisons klingonnes qui subsistent vivent en diaspora. La Fédération propose une planète de repli, mais leur représentativité et leur conception de l’honneur rendent l’aide politiquement délicate.

Appui (transcription chakoteya.net [1] ; Memory Alpha [2]) :
- REPORTER : « Today, an unregistered heavy cargo carrier with members of the eight remaining Klingon Houses on board suffered a catastrophic mechanical failure » [1].
- Memory Alpha : « Of the [[House|Klingon Houses]], only eight remained by the 3190s. » [2]
- « Qo'noS est inhabitable » garde sa formulation (compatible, selon le brouillon) : « After the Burn caused dilithium reactors on Qo'noS and other worlds to explode, billions perished » ; « The rest of the Klingon empire became uninhabitable. » [1]

### Volet objections (recentre)

Avant : Un geste diplomatique théâtral de la Fédération ne constitue pas un modèle général applicable aux réfugiés réels.

Apres : Le récit choisit une crise sans responsable : l’avarie d’un vaisseau, sur fond de Burn, et non un État qui chasse ou persécute les Klingons. Le refus de l’aide y est un trait de culture d’un peuple fictif défini par l’honneur guerrier ; appliquer la thèse de l’épisode à des réfugiés réels leur prêterait ce refus. La crise est réglée par une planète vide, sans que soient traitées les questions du territoire, du nombre et du coût.

Raison : le « geste diplomatique théâtral » est la conquete simulee, objet de STP-295 ; le brouillon propose de
reformuler « sur le refus d'aide présenté comme trait culturel, voir partie 5 ». L'« Apres » resume la partie 5 du
brouillon, sans rien y ajouter.

Appui (partie 5 du brouillon-230) :
- Accident : « suffered catastrophic mechanical failure » ; cause lointaine : « After the Burn caused dilithium reactors on Qo'noS and other worlds to explode » [1] ; brouillon : « aucun État, aucune armée n'a chassé les Klingons ».
- Refus culturel -- WOCHAK : « Accepting the charity of the Federation is an impossibility. Our Houses will only unite over conquest. » [1] ; brouillon : « Une lecture qui appliquerait la thèse de Jay-Den à des réfugiés réels prêterait à ceux-ci un refus de l'aide que l'épisode attribue à un trait de culture des Klingons. »
- Planete vide et moyens -- HOLO-VANCE : « Command has identified an uninhabited planet within Federation space. » ; DAREM : « with limited post-Burn resources » [1] ; brouillon : « la question du territoire, du nombre et du coût [...] n'est pas traitée ».

### Volet contexte

Avant : Diffusé le 29 janvier 2026.

Apres : Mis en ligne sur Paramount+ le 29 janvier 2026.

Appui : « Original Release: 29 January 2026 » (chakoteya [1]) ; liste Paramount+ « S1 » / « E4 » [3] ; StarTrek.com :
« All episodes are now streaming » [4] ; Jammer : « Air date: 1/29/2026 » [13].

### Source ajoutee a la fiche (`sources_fiche`)

- « Source — Transcription de « Vox in Excelso » (chakoteya.net) » : http://www.chakoteya.net/SFAcad/SFA104.html

Raison : les « Apres » s'appuient sur des repliques ; modele V0.31 et V0.32 (transcriptions ajoutees aux fiches). Pas
de copie archivee verifiee (brouillon, « Archives ») : le releve des archives se fait par sa procedure (procedure 7).
A retirer du journal si l'on ne veut pas de source d'amateur dans la fiche.

### Non propose

- « leur représentativité » (faits) : l'ecran presente Wochak comme « their oldest warlord » que les maisons tiennent pour chef, sans autre institution [1] ; ecart releve par le brouillon, non inscrit dans la liste validee.
- Volet mecanisme : il reprend presque mot pour mot l'argument de Jay-Den (« deny Klingons their right to define themselves ») ; le brouillon le note sans proposer de texte.
- « Créatrice » (Gaia Violo) : absent de la fiche ; rien a changer.
- Date stellaire « 868943.8 » [1][2] : a verifier dans data/stardates.json par sa procedure (releve genere).
- Relations : STP-077 (Praxis) signale par un lien dans le texte de l'analyse, pas par une relation (type « echo » inexistant) ; STP-293, STP-296 : non proposes.

---

## STP-295 -- « Conquete » klingonne de Faan Alpha (SFA « Vox in Excelso »)

### Volet faits

Avant : Une flotte klingonne reçoit l’occasion de présenter l’installation sur Faan Alpha comme une conquête plutôt qu’une concession humanitaire de la Fédération.

Apres : Sur une idée du cadet Jay-Den Kraag, la Fédération déclare publiquement la guerre aux vaisseaux klingons entrés dans le secteur de Faan Alpha ; après un combat où seuls les vaisseaux de Starfleet ont l’ordre de tirer à côté, elle offre une reddition complète. La flotte klingonne peut ainsi présenter l’installation sur Faan Alpha comme une conquête plutôt qu’une concession humanitaire de la Fédération.

Appui (transcription [1] ; Memory Alpha [3] ; Wikipedia [6][7]) :
- Declaration -- VANCE : « General Wochak, Klingon ships have taken refuge in this sector. They have trespassed Federation space and have threatened the security of our planet, Faan Alpha. The Federation has no choice but to declare any Klingon ship an enemy vessel. » / NAHLA : « Fight with me, Obel. » [1]
- Tirs -- NAHLA : « tell our folks to put on a good show, but make sure they miss wide. » ; YA : « Shields holding at 95 percent, Captain. No structural damage. » [1] ; Memory Alpha : « with the Klingons scoring several low-power hits on the ''Athena'' » [3].
- Reddition -- VANCE : « On behalf of the Federation, we offer you complete surrender. Faan Alpha is now Klingon. » [1]
- Idee du cadet -- JAY-DEN : « Therefore, I suggest a Klingon solution to a Klingon problem. » [1] ; Wikipedia (source B de la fiche) : « At Jay-Den's suggestion, Vance and Ake stage a battle with Obel » [6].
- Wikipedia se trompe : l'article de l'episode ecrit « a brief battle commences with both sides intentionally missing or only inflicting minor hits » [7] ; l'ecran ne montre que l'ordre donne a Starfleet. Ecrit dans le motif (note d'audit) ; l'« Apres » dit « seuls les vaisseaux de Starfleet ». L'article fautif n'est pas la source de controle de la fiche (celle-ci renvoie a la page de saison [6], qui ne dit pas « both sides ») : niveau B inchange.

### Volet objections

Avant : La mise en scène pourrait être jugée paternaliste ou manipulatrice ; son efficacité locale ne valide pas toutes les politiques fondées sur l’honneur.

Apres : La mise en scène est facilitée par la fiction : la planète est vide, la cession ne déplace personne et la Fédération risque peu. L’écran ne dit pas qui, côté klingon, sait le combat simulé ; les critiques discutent la vraisemblance de la ruse plutôt que sa loyauté. Son efficacité locale ne valide pas toutes les politiques fondées sur l’honneur.

Raison : « paternaliste ou manipulatrice » sans appui : aucune critique nommee lue ne le dit de la ruse (seulement des
commentaires anonymes, non repris) ; Rosch emploie « paternalism » pour l'asile impose, position que l'episode rejette
[18]. La derniere phrase de l'« Avant » est gardee (reflexion de l'atlas, pas une attribution).

Appui (partie 5 du brouillon-295) :
- « an uninhabited planet within Federation space » ; « Shields holding at 95 percent » [1].
- Epsicokhan : « One wonders what mental gymnastics the Klingon houses put themselves through [...] After all, who exactly are they saving face for? » [14] ; brouillon : « On ne sait pas qui, côté klingon, sait que le combat est simulé ».
- Baugher : « is laughably thin » [12] ; Collura : « rings false » [13] ; brouillon : « aucun ne dit que les Klingons sont trompés ».

Variante non essayee (si l'on veut garder l'idee comme reflexion de l'atlas) : « On peut juger la mise en scène
paternaliste ou manipulatrice, objection de l’atlas que les critiques lues ne formulent pas ; son efficacité locale ne
valide pas toutes les politiques fondées sur l’honneur. » (le brouillon : « L'objection reste légitime comme réflexion
de l'atlas, mais la page ne peut pas l'attribuer à la réception »).

### Intitule (a trancher ; rien d'inscrit dans V0.35.json)

Actuel : « Accord mettant en scène une « conquête » klingonne de Faan Alpha pour préserver l’honneur des réfugiés ».
L'ecran ne montre aucun accord : une declaration de guerre publique de Vance, l'invitation d'Ake (« Fight with me,
Obel »), une reddition « complete » [1]. Trois options fideles, chacune essayee :
- Option 1 (formule du brouillon) : « Cession de Faan Alpha aux Klingons sous la forme d’une conquête simulée, pour préserver l’honneur des réfugiés » (essai-intitule-1.json).
- Option 2 : « Déclaration de guerre et reddition de la Fédération mises en scène pour que les Klingons « conquièrent » Faan Alpha » (espaces insecables dans les guillemets, comme l'intitule actuel ; essai-intitule-2.json). Appui : « declare any Klingon ship an enemy vessel » ; « put on a good show » ; « complete surrender » [1].
- Option 3 : « Combat simulé au terme duquel la Fédération cède Faan Alpha aux Klingons comme butin de guerre » (essai-intitule-3.json). Appui : « make sure they miss wide » ; WOCHAK : « We seize this planet as spoils of war » ; « Faan Alpha is now Klingon » [1].
L'intitule est repris par le titre de la fiche, le registre, la chronologie, le reseau et le chapeau de l'analyse
redigee (qui l'affiche par Liquid) ; l'adresse ne change pas. L'analyse publiee ne cite pas l'intitule en dur.

### Source ajoutee a la fiche

- « Source — Transcription de « Vox in Excelso » (chakoteya.net) » : http://www.chakoteya.net/SFAcad/SFA104.html (meme remarque que pour STP-230).

### Non propose

- Volet mecanisme (« ratification sociale d’un accord ») : l'ecran ne montre pas les maisons ratifier quoi que ce soit, seul Wochak parle pour elles [1] ; ecart releve par le brouillon, non inscrit dans la liste validee. A traiter avec l'intitule si l'on retire « Accord ».
- Cycle : STP-295 dans « Starfleet Academy : actualisation 2026 », STP-230 dans « Starfleet Academy (saison 1, 2026) » pour le meme episode ; harmonisation a decider a part.
- Note V0.12 (« ne présente pas cette prise comme un arrangement mis en scène ») : historique, non modifiable par le journal ; Moorhouse parle pourtant de « role-playing fun in the final battle scene » [19]. Le motif V0.35 ne la reprend pas.
- Volet contexte (« Épisode de 2026. ») : exact ; non touche (l'ecart valide sur « diffusé » ne concerne que STP-230).
- New Qo'noS (Memory Alpha [4]) : non verifie a l'ecran ; rien dans la fiche.
- Relation STP-230 -> STP-295 (« cause ») : justification inchangee (data/relations.json, hors journal).

---

## Remarque sur les analyses publiees

Les deux pages affichent les volets par Liquid. Apres V0.35, le volet « Objections » de STP-230 resumera la partie 5 de
sa propre analyse (le paragraphe redige le suit immediatement) : redite courte, sans contradiction. Les textes rediges
des deux pages ont ete ecrits pour rester exacts avant comme apres V0.35 (ils ne citent pas les volets en dur).

Decision de l utilisateur (2026-11-16) : integrer ; intitule de STP-295, option 2.
