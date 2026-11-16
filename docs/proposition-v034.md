# Proposition V0.34 -- fiches STP-293 et STP-297 alignees sur l'ecran

Proposition validee le 2026-11-16 (docs/ exclu du site). Suite des analyses redigees du
2026-11-16 (/analyses/STP-293/, /analyses/STP-297/). Deux entrees touchees, volets « faits » et « parallele » ;
intitules, periodes, problematiques, categories, niveaux de recoupement et autres volets inchanges. Journal
correspondant : V0.34.json.

**Base : V0_33_2026-11-16**, derniere version presente dans data/source/ au moment de l'essai (V0.33 y etait deja,
non commitee ; data/corrections/V0.33.json porte la base V0_32). Les textes « Avant » sont lus dans le Markdown V0.33
par gen.py. Essai a blanc de `appliquer()` en memoire (essai.mjs) : aucun refus, aucun avertissement, aucun fichier
ecrit ; deux notes d'audit V0.34, section des corrections ajoutee, deux lignes « V0.34 révisé » dans le CSV ; textes
« Apres » et sources ajoutees presents dans le Markdown produit ; repartition inchangee (256 A, 40 B, 1 C). Si une
autre version est produite d'ici l'integration, relancer `python3 -I gen.py <BASE>` puis l'essai.

Les citations a l'appui renvoient aux brouillons d'analyse (numeros entre crochets = sources du brouillon, pas de la
page publiee) : beta/brouillon.md et omega/brouillon.md. Toutes les citations anglaises des motifs ont ete retrouvees
dans les copies `web/` des brouillons (chk_motifs.py).

---

## STP-293 -- Negociation de reintegration de Betazed et proposition d'y etablir le siege federal (SFA « Beta Test »)

### Volet faits

Avant : La présidence de Betazed, longtemps isolée derrière une barrière psionique, négocie son retour dans la Fédération. Les responsables fédéraux proposent d’établir le siège politique fédéral sur Betazed pour crédibiliser l’engagement.

Apres : Betazed, isolée depuis plus d’un siècle derrière un mur psionique, négocie son retour dans la Fédération ; son président, Emrin Sadal, qui a fait campagne sur le maintien de ce mur, ouvre les négociations sous la pression de la délégation de la jeunesse bétazoïde. Après la rupture des discussions sur les garanties de sécurité, la chancelière de l’Académie Nahla Ake, avec l’amiral Vance, propose, si Betazed revient dans la Fédération, d’y bâtir le nouveau siège du gouvernement fédéral plutôt qu’à Paris. L’épisode s’achève sur le « Yes » de Sadal ; les termes de l’accord ne sont pas montrés.

Appui (transcription chakoteya.net [1]) :
- Mur et isolement -- NAHLA : « So they put up that psionic wall around their planetary system and stayed behind it for over a hundred years. Nobody gets in or out. »
- President -- KELREC : « Emrin Sadal is humouring them. He's an isolationist who campaigned his presidency on keeping that wall up. » (graphie de la transcription ; Memory Alpha et Wikipedia ecrivent « Emerin »)
- Delegation de la jeunesse -- LURA : « They're the ones that pressured their government to enter negotiations with us. »
- Rupture -- INTERPRETER DRONE : « We came here hoping for actions but received only empty words. The negotiations are over. »
- Offre, conditionnelle, par la chanceliere avec l'amiral -- NAHLA : « Should Betazed rejoin, the Federation will build its new seat of government not in Paris, where it once stood, but on Betazed. » / VANCE : « Should Betazed lower her walls, we will be there, with equal investment in building and protecting a future we both desperately need. » / SADAL : « Yes. »
- Aucun responsable civil de la Federation a l'ecran ; la scene finale ne revient ni sur les vaisseaux ni sur les sieges au conseil de securite [1] (constat d'absence ; DeCandido : « these negotiations shouldn't be led by Vance, aided by Ake, they should be led by President Rillak » [13]).

### Volet parallele

Avant : Rapprochement avec les fédérations asymétriques, les garanties de souveraineté et les politiques de sortie de l’isolationnisme.

Apres : Rapprochement avec les fédérations asymétriques, les garanties de souveraineté et les politiques de sortie de l’isolationnisme. Aucune source consultée ne fait ce rapprochement ni ne relie l’épisode à une sécession, à un retour dans une union ou à un déplacement de capitale réels : la comparaison est une construction de l’atlas.

Appui : aucune source consultee ne rapproche l'episode du federalisme asymetrique, d'une secession, d'un retour reel
dans une union ou d'un deplacement reel de capitale (brouillon, partie 5 ; recherches pplx7.json). Les rapprochements
avec l'actualite sont ceux de critiques (TrekCore [9], TrekMovie [10]), qui ne nomment aucun pays ; la seule lecture
critique du siege porte sur le decentrement de la Terre et de l'Occident [11][13].

### Source ajoutee a la fiche (`sources_fiche`)

- « Source — Transcription de « Beta Test » (chakoteya.net) » : http://www.chakoteya.net/SFAcad/SFA102.html
  (modele : V0.31 a V0.33 ont ajoute les transcriptions aux fiches alignees ; a retirer du journal si non voulu.)

### Niveau de recoupement : passage de B a A examine, non propose

Concordance verifiee : transcription [1], Memory Alpha [3] (« Chancellor [[Nahla Ake]] intervenes with a decisive
proposal, offering to build the Federation's new seat of government on Betazed itself if it rejoins »), Wikipedia [4][5]
(« Ake proposes relocating the Federation's governmental center to Betazed if it joins, and the Betazoids accept ») et
TrekCore [9], source actuelle de la fiche. Mais dans le corpus, le niveau A suit la nature de la source de controle,
non le nombre de sources concordantes : il demande une source officielle (V0.24 : deux entrees « passent en B faute
d'une telle page » ; V0.15 : STP-228, autre episode de la serie, est passe de A a B quand le synopsis officiel a ete
remplace par Wikipedia). Pour « Beta Test », la seule page officielle trouvee donne le titre et la date [6] ;
Paramount+ n'a pas ete consulte. Rien n'est donc inscrit : le journal laisse le niveau B et le dit dans le motif.
Si l'on veut neanmoins le niveau A, il faudrait une decision de methode (une transcription d'amateur concordante avec
deux encyclopedies vaut-elle source A ?) et, dans le journal, des champs `niveau_recoupement` (B -> A),
`nature_source` et `url_source` ; option non essayee.

### Non propose

- Volet mecanisme (« rendre une réintégration plus symétrique ») et volet contexte (« Épisode de janvier 2026. ») : inchanges.
- Suite dans « 300th Night » (inauguration du siege sur Betazed [17]) : laissee a l'analyse, non portee dans la fiche.
- Relation STP-293 -> STP-297 (« 300th Night » s'ouvre sur l'inauguration du siege) : a examiner a part (data/relations.json).
- Liens commentes de l'index chakoteya (« transcription introuvable » de data/stardates.json) : hors journal (procedure 7, script).

---

## STP-297 -- Menace d'une chaine de mines Omega-47 (SFA « 300th Night » ; « Rubincon »)

### Volet faits

Avant : Nus Braka détient des mines Omega-47 capables de détruire les conditions matérielles du voyage à distorsion et utilise cette menace contre la Fédération.

Apres : Nus Braka vole à une base stellaire de l’Omega-47, substance créée par Starfleet, dont une seule particule rend le voyage à distorsion impossible pour des millions d’années, et en fait des mines. Il les dispose en une chaîne autour du territoire fédéral, où la flotte, rappelée pour le défendre, se trouve enfermée ; sa menace doit couvrir un cartel de mondes non membres, libres de piller toute planète. Les mines sont désarmées sans exploser.

Appui (transcriptions chakoteya.net de « 300th Night » [1] et « Rubincon » [2]) :
- Vol et nature -- HOLO-VANCE : « That wasn't the only classified weapon held there. » [1] ; SAM : « When Starfleet created Omega-47, they used Rubin particles to make it easier to stabilise. » [2] ; NAHLA : « We were trying to create a new power source. » [2] (nature disputee a l'ecran : la fiche dit « substance »).
- Effet d'une particule -- HOLO-VANCE : « he detonated a single particle of Omega-47. » ; « It'll be millions of years before warp travel will be possible there again, if ever. » [1]
- Flotte enfermee -- KELREC : « No Starfleet vessels will be allowed outside our territory until we've ended the Venari Ral threat. » ; GENESIS : « They're forming a ring around Federation territory. » ; NAHLA : « He manoeuvred us into a defensive position and then put a wall around the entire Federation. He put us in a box. » [1]
- Cartel -- HOLO-VANCE : « We're hearing he's trying to organise a coalition of some sort of mutual protection pact. » / HOLO-LURA : « A cartel of non-member worlds, free to pillage any planet under threat of Omega-47. » [2]
- Desarmement sans explosion -- CALEB : « the mines will be stable, and harmless. » ; COMPUTER : « Mine field deactivated. Omega-47 particles stabilised. » [2]

### Volet parallele

Avant : Résonance avec les stratégies de dissuasion, les armes perturbant les infrastructures critiques et les théories de coercition.

Apres : Résonance avec les stratégies de dissuasion, les armes perturbant les infrastructures critiques et les théories de coercition. Aucune source consultée, ni déclaration d’auteur ni critique, ne fait ce rapprochement ni ne relie les mines au terrorisme ou à une arme réelle : la comparaison est une construction de l’atlas.

Appui : aucune source lue ne relie les mines Omega-47 a une arme reelle, a la dissuasion nucleaire, au terrorisme ou a
une attaque d'infrastructures (brouillon, methode et partie 5). Les declarations de Kurtzman et Landau [10]-[13]
portent sur le proces et les institutions, non sur les mines ; elles ne sont pas rattachees aux mines.

### Sources ajoutees a la fiche (`sources_fiche`)

- « Source — Transcription de « 300th Night » (chakoteya.net) » : http://www.chakoteya.net/SFAcad/SFA109.html
- « Source — Transcription de « Rubincon » (chakoteya.net) » : http://www.chakoteya.net/SFAcad/SFA110.html

### Non propose

- Niveau de recoupement : inchange (B, Den of Geek) ; startrek.com ne publie pas de recapitulatif des episodes de la serie.
- Volet faits, « capables de détruire les conditions matérielles du voyage à distorsion » : remplace par l'effet dit a l'ecran pour une particule (secteur 953) ; la chaine entiere n'est jamais declenchee.
- Volets mecanisme, objections et contexte : inchanges.
- Periode : « XXXIIe siècle » maintenu (Memory Alpha se contredit : 3192, 3193, 3195-3196).
- Remarque de DeCandido sur le proces (« make the galaxy great again ») : retiree de l'analyse sur decision ; absente du journal.
- Proces de « Rubincon » : releve de STP-296 et STP-232, non touches.

---

## Motifs

(voir V0.34.json, une entree par fiche)

Decision de l utilisateur (2026-11-16) : integrer ; STP-293 reste au niveau B.
