# Proposition V0.28 -- fiches STP-048, STP-101 et STP-107 alignees sur l'ecran

Proposition validee le 2026-11-16 (docs/ exclu du site). Suite des analyses redigees du
2026-11-16 (/analyses/STP-048/, /analyses/STP-101/, /analyses/STP-107/). Trois entrees touchees ;
intitules inchanges. Journal correspondant : data/corrections/V0.28.json (base V0_27_2026-11-15).
Les textes « Avant » sont ceux de _data/fiches.json, identiques au Markdown V0.27 (essai a blanc de
`appliquer()` en memoire : aucun refus, aucun avertissement, aucun fichier ecrit).

Les citations a l'appui renvoient aux brouillons d'analyse (numeros entre crochets = sources du
brouillon, pas de la page publiee).

---

## STP-048 -- Proces d'Una (SNW « Ad Astra per Aspera »)

### Volet faits

Avant : Una est poursuivie pour avoir caché son origine illyrienne et des modifications génétiques culturellement constitutives de son groupe. Sa défense établit qu’elle s’est signalée et demande la protection prévue par le Code de Starfleet.

Apres : Una est poursuivie pour avoir caché son origine illyrienne et des modifications génétiques culturellement constitutives de son groupe ; l’accusation y ajoute deux chefs de sédition. Sa défense invoque l’asile prévu par le code 8514 de Starfleet : la démission qu’Una avait remise à Pike, et que celui-ci avait refusée (« Ghosts of Illyria »), est présentée comme une demande d’asile, et ce refus comme son octroi. Le tribunal retient cette lecture, lui accorde l’asile et l’acquitte.

Appui :
- BATEL : « violating Starfleet code 614 to 617 prohibiting Starfleet officers from engaging in permanent bioengineering, and two counts of sedition » (transcription de « Ad Astra per Aspera », chakoteya.net [1]).
- KETOUL : « Captain Batel, are you familiar with the Starfleet Code 8514? » ; « She asked for it and Captain Pike granted it. » [1]
- Code lu a l'audience : « and 3, upon revealing themselves to authorities and making a request, may be granted asylum. » [1]
- UNA, dans « Ghosts of Illyria » : « I am resigning my commission and surrendering myself for disciplinary review. » / PIKE : « Rejected. » (transcription, chakoteya.net [2] ; le mot asile n'y est pas prononce).
- JAVAS : « we grant the defendant's request for asylum and find Una Chin-Riley not guilty of all charges. » [1] ; recapitulatif officiel : « Javas grants Una asylum and judges her not guilty » [4].

### Volet mecanisme

Avant : L’interdit fédéral contre les Augments, construit à partir d’un traumatisme historique, devient une discrimination indiscriminée. L’audience mobilise la contradiction entre norme générale et droit d’asile individuel.

Apres : L’interdit de la modification génétique permanente, justifié par le souvenir des guerres eugéniques, se décline en plusieurs normes : la loi fédérale, le règlement 17 (article 12) de Starfleet, qui écarte du service les personnes génétiquement modifiées, et le code 614 à 617, qui interdit aux officiers toute bio-ingénierie permanente. Il frappe indistinctement les Illyriens, pour qui la modification est une pratique culturelle. L’audience oppose cette norme générale au droit d’asile individuel ; le tribunal maintient la loi, mais refuse de traiter de la même façon Augments, Illyriens et autres personnes à l’ADN modifié.

Appui :
- Loi federale -- KETOUL : « Permanent genetic modification is illegal under Federation law. » [1]
- Reglement de recrutement -- APRIL : « Starfleet Regulation 17, Article 12 explicitly prohibits genetically modified people such as Illyrians, from serving. » [1]
- Code vise par l'accusation -- BATEL : « Starfleet code 614 to 617 prohibiting Starfleet officers from engaging in permanent bioengineering » [1].
- Guerres eugeniques -- BATEL : « the outcome of the Eugenics Wars on Earth speaks for itself. Tens of millions dead. » [1]
- Pratique culturelle -- KETOUL : « It is an Illyrian cultural practice done to children before they are even born. It is done for survival » [1].
- Verdict -- JAVAS : « The laws prohibiting it exist for very good reasons, and regulations must persist [...] But this court also believes that these reasons cannot and do not allow us to treat every individual - Augment, Illyrian, or other persons with modified DNA - the same. » [1]
- Le mot « Augments » est celui de Javas, qui le distingue des Illyriens ; d'ou le retrait de « l'interdit fédéral contre les Augments ».
- Reserve : l'ordinateur du tribunal dit « Starfleet regulation 614-617, prohibiting permanent DNA modification » [1] ; le texte propose suit Batel (« code »), comme l'analyse publiee.

### Volet contexte

Avant : Diffusé en 2023, dans un contexte de discussion accrue sur les identités, la protection des minorités et les technologies de modification génétique.

Apres : Mis en ligne le 22 juin 2023 (saison tournée de février à juillet 2022), dans un contexte de discussion accrue sur les identités et la protection des minorités. À l’écran, la modification génétique est une pratique culturelle illyrienne interdite par la loi fédérale ; aucune source lue ne relie l’épisode à un débat de 2023 sur les biotechnologies.

Appui :
- Date : « Star Trek: Strange New Worlds Season 2, Episode 2 – Debuted Thursday, June 22, 2023 » (TrekMovie [15]) ; « Original Airdate: 22 June 2023 » [1] ; `_data/evenements.json` : 2023-06-22.
- Tournage : « Filming began on February 1st for the 10-episode season. » ; article du 1er juillet 2022 annoncant la fin du tournage (TrekMovie [5]).
- Identites et minorites : GOLDSMAN : « Star Trek is challenging when it comes to talking about marginalized peoples because it’s utopia, right? » (TV Insider [7]) ; McFarland sur le mois des fiertes 2023 (Salon [19]).
- Ecran : citations de Ketoul ci-dessus [1].
- Biotechnologies : la seule source qui en parle est la realisatrice, en termes generaux (« Eugenics and genetic modifications, GMOs and all of that, can be scary to the general public who doesn’t understand science », StarTrek.com [13]) ; aucune source ne relie l'episode a un debat de 2023.

### Categorie « insurrection/pouvoir » -- reexamen, sans decision

Etat V0.27 : `justice/droits ; insurrection/pouvoir`.

Constat : le seul appui textuel de « insurrection/pouvoir » est l'accusation de sedition (« two counts of sedition » [1]), qui n'est discutee a aucun moment de l'audience ; l'episode ne montre ni insurrection ni prise de pouvoir. Le proces porte sur l'interdit de la modification genetique, une pratique biologique, et la fiche voisine STP-047 (arrestation d'Una, meme interdit) est classee `justice/droits ; technologie/bioéthique` ; STP-050 (clivages illyriens) porte aussi `technologie/bioéthique`.

Decision de l utilisateur (2026-11-16) : option 1, technologie/bioéthique. Options examinees :
1. **Remplacer** `insurrection/pouvoir` par `technologie/bioéthique` -> `justice/droits ; technologie/bioéthique`. Ma preference : c'est ce que le texte de la fiche (« modifications génétiques », « interdiction générale de modification génétique ») et l'ecran soutiennent, et cela aligne STP-048 sur STP-047.
2. **Retirer** `insurrection/pouvoir` sans le remplacer -> `justice/droits`.
3. **Garder** la categorie, au titre des chefs de sedition (appui faible : une ligne de l'acte d'accusation).

Si l'option 1 ou 2 est retenue, ajouter a l'entree STP-048 du journal :

```json
"champs": {
 "categories_politiques": {
  "avant": "justice/droits ; insurrection/pouvoir",
  "apres": "justice/droits ; technologie/bioéthique"
 }
}
```

et completer le motif (ex. : « catégories revues : retrait d’insurrection/pouvoir, qui ne reposait que sur « two counts of sedition », jamais débattus ; technologie/bioéthique, comme STP-047 »). Valeur « avant » verifiee dans le CSV V0.27.

### Motif

(voir V0.28.json, entree STP-048)

---

## STP-101 -- Enquete de l'amirale Satie (TNG « The Drumhead »)

### Volet faits

Avant : L’amirale Norah Satie transforme une enquête sur une suspicion de sabotage en procédure accusatoire visant des officiers, notamment Picard, malgré l’absence de preuve d’un complot généralisé.

Apres : Un exobiologiste klingon en échange à bord, J’Dan, avoue espionner pour les Romulans, et l’explosion qui a endommagé la propulsion se révèle accidentelle avant l’audience publique. L’amirale à la retraite Norah Satie poursuit pourtant la recherche d’un complot : elle met en cause un membre d’équipage d’ascendance romulienne, Simon Tarses, technicien médical du rang (« Crewman First Class »), puis le capitaine Picard. Les audiences cessent quand l’amiral Henry, de la sécurité de Starfleet, quitte la salle, puis y met fin.

Appui (transcription de « The Drumhead », chakoteya.net [1], sauf mention) :
- Espion reel -- J'DAN : « Romulans are strong. They are worthy allies. » ; SATIE : « We do have a confessed spy. » ; PICARD : il « will answer for his crime ».
- Sabotage refute avant l'audience publique -- DATA : « the explosion was not intentional » ; LA FORGE : « This wasn't sabotage at all. It was nothing more than an accident. » ; SATIE : « Just because there was no sabotage doesn't mean there isn't a conspiracy on this ship. » ; puis l'audience ouverte : « spies and saboteurs don't like the bright light of an open inquiry ».
- Grade de Satie -- journal : « Retired Admiral Norah Satie, whose investigation exposed the alien conspiracy against Starfleet Command three years ago, is arriving to assist in our inquiry. »
- Tarses -- « Simon Tarses, Crewman First Class, medical technician. » ; ascendance : grand-pere paternel romulien (revele par Sabin a l'audience).
- Picard mis en cause -- SATIE : « I question your actions, Captain. I question your choices. I question your loyalty. »
- Fin des audiences -- didascalie « (Admiral Henry walks out) » ; WORF : « It is over. Admiral Henry has called an end to any more hearings on this matter. »
- Amiral Henry -- SATIE : « every hearing from now on will be held in the presence of Admiral Thomas Henry of Starfleet Security ».

### Source ajoutee a la fiche

**Source — Cinefantastique, vol. 22, n° 2, octobre 1991 (dossier de Mark A. Altman sur la quatrième saison : déclarations de Jeri Taylor et Michael Piller)** : https://archive.org/download/cinefantastique_1970-2002/Cinefantastique%20Vol%2022%20No%202%20%20(Oct%201991)_djvu.txt

Raison : le volet « Parallèle » parle de maccarthysme, mais la source de controle (StarTrek.com, 2020 [11]) ne le mentionne pas ; la scenariste le declare dans ce numero : TAYLOR : « The idea was taking the McCarthy era and the Salem witch hunts, showing they can happen even in our enlightened 24th century » [4]. (La glose « [a look at McCarthyism in the 24th century] » inseree dans la citation de Piller est de la revue, pas de Piller.)

### Non propose

- Intitule (« Enquête de l'amirale Satie ») : inchange ; « amirale » reste exact, le grade complet est dans le volet faits.
- Volet contexte : le brouillon suggerait de remplacer la phrase sur les « technologies numériques » par la declaration de Taylor ; hors de la liste validee, non inscrit.

### Motif

(voir V0.28.json, entree STP-101)

---

## STP-107 -- Correction forcee sur J'naii (TNG « The Outcast »)

### Volet faits

Avant : Sur la planète des J’naii, Soren vit une identité de genre réprouvée par les normes officielles. Le dispositif social prétend effacer l’écart par une « correction » forcée.

Apres : Sur la planète des J’naii, société androgyne où l’on enseigne que « gender is primitive », Soren se dit femme, une identité réprouvée. L’écran ne montre aucune loi : dénoncée, Soren comparaît à huis clos devant Noor, qui parle de perversion, de maladie et de guérison, puis subit une thérapie « psychotectic » destinée à éliminer tout élément de genre ; après le traitement, elle se dit guérie et refuse de partir.

Appui (transcription de « The Outcast », chakoteya.net [1]) :
- « We have been contacted by an androgynous race called the J'naii » ; SOREN : « on my planet we have been taught that gender is primitive ».
- SOREN : « I am female. I was born that way. » ; « On our world these feelings are forbidden. »
- Denonciation et garde -- KRITE : « In custody, and there's nothing you can do about it. » ; huis clos -- NOOR : « Commander Riker, these proceedings are closed to everyone. »
- Vocabulaire du soin -- NOOR : « Your decision to admit your perversion makes it much more likely that we can help you. » ; « Soren is sick, and sick people want to get well. »
- Traitement -- SOREN : « only by undergoing psychotectic therapy and having all elements of gender eliminated can they become accepted into society again » ; NOOR : « Treatment will begin tomorrow. »
- Apres le traitement -- SOREN : « That I was sick. I had these terrible urges, and that is why I reached out to you. But it was wrong, and I see that now. » ; « Why would I want that? »
- Graphie : « psychotectic » (transcription [1], scenario du 2 janvier 1992 [3], Memory Alpha [2]), et non « psychotactic » (editorial StarTrek.com [17]).
- Aucune loi : l'episode ne montre ni texte ni autorite legislative ; seulement une denonciation, une audience fermee et un traitement (partie 5 du brouillon).

### Source ajoutee a la fiche

**Source — Cinefantastique, vol. 23, n° 2/3, octobre 1992 (article de Mark A. Altman : déclarations de Jeri Taylor, Rick Berman et Michael Piller)** : https://archive.org/download/cinefantastique_1970-2002/Cinefantastique%20Vol%2023%20No%202-3%20(Oct%201992)_djvu.txt

Raison : c'est la source d'epoque de la declaration que cite deja le volet « Contexte » d'apres l'editorial officiel : TAYLOR : « ‘The Outcast,’ though, is a gay rights story. It absolutely, specifically and outspokenly dealt with gay issues. » [5] ; elle documente aussi le debat sur la distribution que mentionne le volet « Objections » (BERMAN : « We read both men and women for the [J'naii] roles and decided to go with women » ; FRAKES : « Soren should have been more obviously male » [6]).

### Non propose

- Volet mecanisme (« violence institutionnelle se disant thérapeutique ») : inchange ; Noor et « the school authorities » [1] soutiennent « institutionnelle ».
- Intitule (« Politique de correction forcée ») : le mot « Politique » peut suggerer une regle generale que l'ecran ne montre pas ; changer l'intitule n'est pas dans la liste validee -- a signaler seulement.

### Motif

(voir V0.28.json, entree STP-107)
