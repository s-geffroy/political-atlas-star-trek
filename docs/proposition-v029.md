# Proposition V0.29 -- fiches STP-061, STP-125, STP-129 et STP-274 alignees sur l'ecran

Proposition validee le 2026-11-16 (docs/ exclu du site). Suite des analyses redigees du
2026-11-16 (/analyses/STP-061/, /analyses/STP-125/, /analyses/STP-129/, /analyses/STP-274/). Quatre entrees
touchees ; un intitule modifie (STP-125). Journal correspondant : data/corrections/V0.29.json
(base V0_28_2026-11-16 : suppose que la V0.28 a ete produite avant ; aucune des quatre fiches n'est touchee par la V0.28).
Les textes « Avant » sont ceux de _data/fiches.json et _data/evenements.json, identiques au Markdown et au CSV V0.27
(essai a blanc de `appliquer()` en memoire sur la base V0_27_2026-11-15 : aucun refus, aucun avertissement,
aucun fichier ecrit ; intitule, titre de fiche, notes d'audit et sources ajoutees bien places).

Les citations a l'appui renvoient aux brouillons d'analyse (numeros entre crochets = sources du
brouillon, pas de la page publiee). Toutes les citations anglaises des motifs ont ete retrouvees dans les
copies `web/` des brouillons.

Ce que le format permet et ne permet pas :
- l'intitule passe par `champs.event` {avant, apres} : le script le controle contre le CSV et le reporte dans
  le registre et dans le titre de la fiche ;
- `sources_fiche` ne fait qu'AJOUTER des sources (libelle commencant par « Source ») : il ne retire ni ne
  renomme une source existante. La source « documentaire pour le parallele » de STP-061 (archives.gov, loi de
  1964), qui ne cite pas l'episode, reste donc dans la fiche ; seul un remplacement exact par `textes` (ligne du
  Markdown) pourrait la renommer ou la retirer : non propose ici, a decider.

Volets non touches (aucun ecart valide) : STP-061 mecanisme, objections, contexte ; STP-125 faits, mecanisme,
parallele, objections ; STP-129 parallele, objections ; STP-274 objections, contexte.

---

## STP-061 -- Lutte des Troglytes (TOS « The Cloud Minders »)

Brouillon : scratchpad/cloud/brouillon.md.

### Volet faits

Avant : Sur Ardana, des élites habitent Stratos tandis que les Troglytes travaillent dans des mines dont les conditions affectent leurs capacités. Un mouvement de contestation remet en cause cette hiérarchie.

Apres : Sur Ardana, planète membre de la Fédération, des élites habitent Stratos, cité qui flotte dans les nuages, tandis que les Troglytes vivent à la surface : ils extraient la zénite et cultivent le sol, et quelques-uns servent à Stratos comme domestiques et sentinelles. Le gaz qu’émet la zénite brute ralentit leurs facultés intellectuelles. Un groupe organisé, les Disrupters, dont Vanna est la porte-parole, réclame pour les Troglytes le même droit à la cité que ses habitants ; le haut conseiller Plasus répond par la force. L’issue n’est pas une réforme : Kirk démontre l’effet du gaz et annonce que des masques filtrants en protégeront les mineurs, mais Plasus garde le pouvoir et refuse toute médiation de la Fédération, et Vanna annonce que les revendications ne font que commencer.

Appui :
- DROXINE : « The Troglytes are workers, Captain. Oh surely, you must be aware of that. They mine zenite for shipment, till the soil. » (transcription de « The Cloud Minders », chakoteya.net [1])
- PLASUS : « A few Troglytes are brought here as retainers. Vanna was one of them, as are the sentinels. » [1]
- MCCOY : « But in its raw state, it emits a odourless, invisible gas that retards the intellectual functioning of the mind and heightens the emotional. » [1]
- PLASUS : « A small group of Troglyte malcontents. » ; VANNA : « I speak for my people. They have as much right to the clouds as the Stratos dwellers. » [1]
- PLASUS : « Very well, if you prefer the rays. » ; « Physical discomfort is extremely persuasive, Captain. » [1]
- VANNA : « Yes. Our demands have just begun. » ; KIRK : « The Federation Bureau of Industrialisation may be of aid to you. » / PLASUS : « I will tolerate absolutely no interference! You will not set foot here as long as I rule! » [1]
- KIRK : « Ardana is a member of the Federation [...] » [1]

### Volet parallele

Avant : Éclairage historique de la ségrégation et des luttes pour les droits civiques dans l’Amérique de 1969, ainsi que des rapports entre exposition aux risques professionnels et pouvoir politique.

Apres : Le rapprochement avec la ségrégation et les luttes pour les droits civiques n’est fait que par des critiques et, d’après Memory Alpha, par David Gerrold, auteur de l’histoire originale, qui plaçait parmi les chefs des travailleurs de son histoire, écrite en 1968, une figure à la Martin Luther King ; aucune source lue ne relie la version diffusée, réécrite par Margaret Armen, aux droits civiques. George A. Gonzalez (2021) range l’épisode parmi les récits anti-racistes de la série, Darren Mooney (2016) le rattache aux mouvements sociaux des années 1960 et à la question des classes, Roger Thompson (2023) compare Ardana à l’apartheid. L’épisode reste un appui pour étudier les rapports entre exposition aux risques professionnels et pouvoir politique.

Appui :
- Source documentaire actuelle de la fiche (archives.gov, Civil Rights Act de 1964, lue : `cloud/web/archivesgov_cra.txt`) : aucune mention de l'episode.
- Memory Alpha, citant Gerrold, *The World of Star Trek* (1973, non consulte) : « The Mannies torn between two leaders, one a militant, and one a Martin Luther King figure. (Mind you, this was in 1968 [...]) » [2]
- Gonzalez, *Foundation*, 2021 : « In particular, I shall emphasize the cultural importance of the series to the US Civil Rights Movement of the 1960s » [12]
- Mooney, 2016 : « The Cloud Minders aired at a point in time when these social movements threatened to tear the country apart » ; « the issue of class within a capitalist system » [8]
- Thompson, *CounterPunch*, 2023 : « much like the former Apartheid regime in South Africa » [15]
- Reecriture : Armen, *Starlog* n° 125 : « that's why I added the gas in the caves » [6] ; Gerrold, 2011 : « Freddy Freiberger and Margaret Armen came in and changed it » [4]
- La fin du volet (« rapports entre exposition aux risques professionnels et pouvoir politique ») est conservee telle quelle.

### Sources ajoutees a la fiche

- Source — Transcription de « The Cloud Minders » (chakoteya.net) : http://www.chakoteya.net/StarTrek/74.htm
- Source — Memory Alpha, « The Cloud Minders (episode) » (citation de David Gerrold, The World of Star Trek, 1973, non consulté) : https://memory-alpha.fandom.com/wiki/The_Cloud_Minders_(episode)
- Source — George A. Gonzalez, « ‘May we together become greater’: In Defence of Star Trek and Anti-Racism », Foundation, n° 138, 2021 : https://www.fanac.org/fanzines/Foundation/Foundation%20138%20v50n1%20March-Russell,%20Paul%202021-Sp%20UK.pdf

### Motif

fiche alignée sur l’analyse rédigée du 16 novembre 2026 — Faits : les Troglytes ne sont pas seulement mineurs (DROXINE : « They mine zenite for shipment, till the soil » ; PLASUS : « A few Troglytes are brought here as retainers. Vanna was one of them, as are the sentinels ») ; l’issue n’est pas une réforme : Vanna, « Our demands have just begun » ; Plasus, « I will tolerate absolutely no interference! You will not set foot here as long as I rule! » (transcription de « The Cloud Minders »). Parallèle : la source documentaire de la fiche (archives.gov, Civil Rights Act de 1964) ne mentionne pas l’épisode ; le rapprochement avec les droits civiques est celui de critiques (Gonzalez, Foundation, 2021 : « the cultural importance of the series to the US Civil Rights Movement of the 1960s ») et de David Gerrold cité par Memory Alpha (« one a militant, and one a Martin Luther King figure »), dont l’histoire a été réécrite.

---

## STP-125 -- Detention de Marritza (DS9 « Duet »)

Brouillon : scratchpad/duet/brouillon.md.

### Intitule (champ event)

Avant : Tribunal du passé d'un administrateur de camp cardassien

Apres : Imposture de Marritza, commis aux archives du camp de Gallitep, qui se fait passer pour Gul Darhe’el afin d’être jugé

Appui :
- KIRA : « It'll keep you occupied while we're waiting for the provisional government to prepare your war crimes tribunal. » ; SISKO : « So far, we haven't charged him with anything. » (transcription de « Duet », chakoteya.net [1])
- MARRITZA : « Marritza, who was only good for cowering under his bunk [...] » ; « My trial will force Cardassia to acknowledge its guilt. » [1]
- DUKAT : « he's buried under one of the largest military monuments on Cardassia » (Darhe'el mort) [1]
- Commis aux archives : partie 1 du brouillon Duet (« Marritza etait bien le commis aux archives du camp ») ; Memory Alpha [2].

### Volet contexte

Avant : Diffusion 1993, dans une Amérique qui suit notamment les guerres de l’ex-Yougoslavie et les débats sur les crimes de guerre.

Apres : Diffusé à la mi-juin 1993. Aucune source consultée ne relie l’épisode aux guerres de l’ex-Yougoslavie. En 2004, la critique Michelle Erica Green l’a rapproché d’un procès alors en cours en Israël contre un citoyen américain extradé, accusé d’être un criminel de guerre nazi : l’affaire John Demjanjuk, acquitté en appel le 29 juillet 1993, environ six semaines après la diffusion, et non « quelques jours » comme elle l’écrit. Aucune source ne dit que les auteurs y ont pensé.

Appui :
- Green, *The Trek Nation*, 2004 : « This episode aired in the midst of a trial in Israel where an extradited U.S. citizen was accused of being a Nazi war criminal; he was exonerated within days of the airing of "Duet," so the timeliness was stunning » [10]
- International Crimes Database : « Decision date » « 29 July 1993 » ; « acquitted by the Supreme Court of Israel on the grounds of mistaken identity » [11]
- Mi-juin 1993 : 14 juin (chakoteya, Wikipedia, Jammer) ou 13 juin (Memory Alpha, Tor.com) [1][2][3][8][13] ; `diffusion.json` retient 1993-06.
- Ex-Yougoslavie : aucune source lue ne fait le lien (seules mentions : Visitor 2000, « Serbs », exemple general [6] ; Mooney 2013, « the Balkans » [14]).

### Sources ajoutees a la fiche

- Source — Transcription de « Duet » (chakoteya.net) : http://www.chakoteya.net/DS9/419.htm
- Source — Michelle Erica Green, « Duet », The Trek Nation, 2004 (copie archivée) : http://web.archive.org/web/20081106062836/http://www.treknation.com:80/reviews/ds9/duet.shtml
- Source — International Crimes Database, State of Israel v. Ivan (John) Demjanjuk, décision du 29 juillet 1993 : https://www.internationalcrimesdatabase.org/Case/191

### Motif

fiche alignée sur l’analyse rédigée du 16 novembre 2026 — Intitulé : aucun tribunal ne siège, le gouvernement provisoire prépare seulement un « war crimes tribunal » et Sisko précise : « So far, we haven't charged him with anything » ; le détenu n’est pas l’administrateur du camp mais Marritza, son commis aux archives, « only good for cowering under his bunk », qui se fait passer pour Gul Darhe’el : « My trial will force Cardassia to acknowledge its guilt » (transcription de « Duet »). Contexte : la mention de l’ex-Yougoslavie n’avait pas de source ; le seul rapprochement avec un procès contemporain est celui de Michelle Erica Green (2004) : « This episode aired in the midst of a trial in Israel where an extradited U.S. citizen was accused of being a Nazi war criminal; he was exonerated within days of the airing » ; l’arrêt de la Cour suprême d’Israël est du 29 juillet 1993 (International Crimes Database : « acquitted by the Supreme Court of Israel on the grounds of mistaken identity »).

---

## STP-129 -- Greve chez Quark (DS9 « Bar Association »)

Brouillon : scratchpad/bar/brouillon.md.

### Volet faits

Avant : Rom et les salariés de Quark s’organisent en syndicat après des retenues de salaire et l’absence de garanties sociales. L’Autorité commerciale ferengie intervient pour casser la grève.

Apres : Quark retient le salaire de son frère Rom après un malaise dû à une infection que celui-ci n’a pas pu faire soigner, puis baisse d’un tiers les salaires de tout le personnel du bar. Rom et les salariés s’organisent en syndicat, la Guild of Restaurant and Casino Employees, et se mettent en grève pour obtenir une hausse des salaires, des horaires réduits et des congés maladie payés. L’Autorité commerciale ferengie intervient pour casser la grève : son liquidateur, Brunt, menace les grévistes de confiscations et d’amendes, puis fait battre Quark par ses hommes de main. Le syndicat est officiellement dissous, mais Quark accorde ses revendications en secret, et Rom quitte le bar pour devenir technicien de maintenance de la station.

Appui :
- QUARK : « I'm going to dock his pay. » ; « So, starting tomorrow, everyone's salary gets cut by a third. » (transcription de « Bar Association », chakoteya.net [1])
- ROM : « We're the Guild of Restaurant and Casino Employees and we're here to present our demands. » / QUARK : « Increased pay. Shorter hours. Paid sick leave. » / ROM : « Because as of right now, we're all on strike. » [1]
- BRUNT : « your financial accounts on Ferenginar will be confiscated, your families fined and your trading permits revoked. » ; « Attack the leader of a movement, you risk creating a martyr. » (Quark battu par les Nausicaans) [1]
- QUARK : « you dissolve the union, make it look like I've won, and I'll give you everything you want. » ; « But the union dies here. Today. » ; LEETA : « I just got a raise. » ; ROM : « I do a lot better when you're not around. » [1]

### Volet mecanisme

Avant : Le conflit montre les mécanismes de négociation collective, de dépendance à l’employeur et de répression économique, dans une société où la poursuite du profit prétend être une valeur totale.

Apres : Le conflit montre les mécanismes de négociation collective, de dépendance à l’employeur et de répression, économique (confiscation des comptes, amendes infligées aux familles, retrait des licences commerciales) comme physique (Quark battu sur l’ordre du liquidateur), dans une société où la poursuite du profit prétend être une valeur totale.

Appui :
- Memes repliques de Brunt que ci-dessus [1] ; note (2) de la partie 1 du brouillon Bar Association.

### Volet contexte

Avant : Diffusion 1996, au moment de transformations du marché du travail dans les économies occidentales.

Apres : Diffusé en février 1996. Aucune source consultée ne relie l’épisode à un conflit social précis de l’époque. En 2019, ses scénaristes, Robert Hewitt Wolfe et Ira Steven Behr, ont dit avoir voulu montrer pourquoi le mouvement ouvrier avait été historiquement une bonne chose, à un public peut-être de plus en plus hostile aux syndicats ; l’article qui rapporte leurs propos situe la production dans une période de déclin des effectifs syndicaux, et Wolfe rappelle que certains scénaristes de la série venaient de connaître la grève des scénaristes de la fin des années 1980.

Appui :
- Vilas-Boas, StarTrek.com, 21 juin 2019 (source de la fiche) : « "We wanted to do a show about labor... to say something about why labor historically has been good," Wolfe told StarTrek.com » ; « "We wanted to give that historical context to show how that worked to a viewership that might be increasingly hostile to the idea of organized labor," Wolfe said. » [3]
- Paraphrase du journaliste : « A labor episode, produced in a time when union membership was (and still is) in decline, he said » [3]
- Wolfe : « Some of the [ DS9 ] writers, not me, had just been through a writers' strike in the late '80s » [3]
- Aucune source consultee ne relie la diffusion a un conflit social de 1996 (recherche `bar/pplx3.json`).
- Fevrier 1996 : `diffusion.json` retient 1996-02 ; toutes les sources lues donnent le 19 fevrier [1][2][4][5][8][9].

### Sources ajoutees a la fiche

- Source — Transcription de « Bar Association » (chakoteya.net) : http://www.chakoteya.net/DS9/488.htm

### Motif

fiche alignée sur l’analyse rédigée du 16 novembre 2026 — Faits : les « retenues de salaire » étaient deux mesures distinctes, la retenue sur Rom (QUARK : « I'm going to dock his pay ») et la baisse générale (« starting tomorrow, everyone's salary gets cut by a third ») ; violence : Brunt écarte de frapper Rom (« Attack the leader of a movement, you risk creating a martyr ») et fait battre Quark par les Nausicaans ; menaces : « your financial accounts on Ferenginar will be confiscated, your families fined and your trading permits revoked » ; issue : « you dissolve the union, make it look like I've won, and I'll give you everything you want » ; « But the union dies here. Today » ; Rom : « I do a lot better when you're not around » (transcription de « Bar Association »). Contexte : la phrase sur les « transformations du marché du travail » n’avait pas de source ; l’article de StarTrek.com (2019), source de la fiche, cite Wolfe : « We wanted to give that historical context to show how that worked to a viewership that might be increasingly hostile to the idea of organized labor » et paraphrase : « produced in a time when union membership was (and still is) in decline » ; Wolfe : « Some of the [ DS9 ] writers, not me, had just been through a writers' strike in the late '80s ».

---

## STP-274 -- Prevision de defaite et projet de fuite (DS9 « Statistical Probabilities »)

Brouillon : scratchpad/statistical/brouillon.md.

### Volet faits

Avant : Bashir et des personnes génétiquement augmentées élaborent une prévision selon laquelle la Fédération perdra la guerre. Certains envisagent de communiquer au Dominion des informations militaires pour forcer la paix.

Apres : Quatre patients génétiquement modifiés, internés dans un institut, analysent avec Bashir les pourparlers de paix proposés par Damar. Après avoir obtenu l’accès à des informations classifiées de Starfleet, ils concluent, et Bashir vérifie, que la Fédération perdra la guerre, et recommandent la capitulation ; Sisko transmet la recommandation sans l’appuyer, et Starfleet la rejette. Jack conçoit alors, avec Lauren et Patrick, le projet clandestin de livrer au Dominion les plans de bataille de Starfleet, pour que la guerre s’achève en quelques semaines avec moins de victimes. Bashir refuse et est assommé ; Sarina, qu’il a persuadée, le libère, et le projet est déjoué.

Appui :
- BASHIR : « Starfleet Command was so impressed with our analysis, they've agreed to let us have access to classified information regarding Starfleet's battle readiness. » ; « Everything checks out. » ; « We're going to have to surrender. » (transcription de « Statistical Probabilities », chakoteya.net [1])
- SISKO : « You've made your recommendation. I'll pass it on to Starfleet Command. » ; BASHIR : « I just got word. Starfleet rejected our recommendations. » [1]
- JACK : « We've got to take matters into our own hands. » ; « Starfleet battle plans, fleet deployments. » / LAUREN : « They could take the Alpha Quadrant in a matter of weeks. » ; « There wouldn't be more than two billion casualties. » [1]
- BASHIR : « I'm not going to be a party to treason. » ; a Sarina : « They're going to be arrested and charged with treason [...] » [1]
- Recapitulatif officiel (StarTrek.com, 2013, source de la fiche) : « After convincing her to free him, Bashir alerts Odo to the impending meeting, and the plan is foiled. » [4]
- Patrick fait partie du groupe qui tente le rendez-vous : Bashir intercepte « les trois autres » (partie 1 du brouillon) ; Sarina ne parle pas [1][12].

### Volet mecanisme

Avant : Une prédiction devient une prescription : les experts remplacent un choix démocratique, moral et stratégique par une projection mathématique tenue pour certaine.

Apres : Une prédiction devient une prescription : une projection mathématique tenue pour certaine fonde une recommandation de capitulation. À l’écran, aucun choix démocratique n’est remplacé : la recommandation remonte la chaîne de commandement, qui la rejette, et c’est contre ce refus que le groupe tente de passer outre, en secret, par une fuite d’informations.

Appui :
- SISKO : « I'll pass it on to Starfleet Command. » ; BASHIR : « We presented our case to Starfleet Command. They rejected it. Case closed. » [1]
- Aucune instance civile ni aucun vote n'apparait a l'ecran (note (3) de la partie 1 du brouillon).

### Volet parallele

Avant : Rapprochement avec la gouvernementalité algorithmique et les limites des prévisions probabilistes en situations complexes.

Apres : Rapprochement possible avec les limites des prévisions probabilistes en situations complexes. Le parallèle avec la gouvernementalité algorithmique est une hypothèse de l’atlas : aucune source consultée ne le fait. Les critiques rapprochent plutôt l’épisode de la psychohistoire des romans Fondation d’Isaac Asimov (Zack Handlen, 2013), et Darren Mooney (2017) y voit une lecture possible des populismes anti-élites, qu’il nuance lui-même.

Appui :
- Aucune source consultee ne fait le rapprochement avec la gouvernementalite algorithmique (partie 4 du brouillon).
- Handlen, *The A.V. Club*, 2013 : « what the group of crazies is doing is basically a form of psychohistory, a term invented by Isaac Asimov in his Foundation series » [9]
- Mooney, 2017 : « In some ways, Statistical Probabilities could be read as a defense of those populist movements, particularly in their anti-intellectual and anti-elitist leanings. » ; « Indeed, it seems churlish to complain about the episode’s subtext in light of events that occurred twenty years after it was broadcast » [11]
- La partie « limites des previsions probabilistes en situations complexes » est conservee ; elle rejoint la partie 5 du brouillon (Green [7] : « statistical probabilities can never identify every possible outcome »).

### Sources ajoutees a la fiche

- Source — Transcription de « Statistical Probabilities » (chakoteya.net) : http://www.chakoteya.net/DS9/533.htm

### Motif

fiche alignée sur l’analyse rédigée du 16 novembre 2026 — Faits : le projet de livrer les plans n’est pas celui de Bashir ; il naît après le rejet de la recommandation (BASHIR : « Starfleet rejected our recommendations » ; JACK : « We've got to take matters into our own hands » ; LAUREN : « They could take the Alpha Quadrant in a matter of weeks » ; « There wouldn't be more than two billion casualties ») ; Bashir refuse : « I'm not going to be a party to treason » ; il persuade Sarina que les autres seront « arrested and charged with treason » (transcription de « Statistical Probabilities ») ; récapitulatif officiel : « After convincing her to free him, Bashir alerts Odo to the impending meeting, and the plan is foiled ». Mécanisme : aucune instance démocratique n’apparaît ; Sisko : « You've made your recommendation. I'll pass it on to Starfleet Command » ; Bashir : « We presented our case to Starfleet Command. They rejected it. Case closed ». Parallèle : aucune source consultée ne rapproche l’épisode de la gouvernementalité algorithmique ; Handlen (The A.V. Club, 2013) : « basically a form of psychohistory » ; Mooney (2017) : « could be read as a defense of those populist movements », puis « it seems churlish to complain about the episode’s subtext in light of events that occurred twenty years after it was broadcast ».

---

## Points a trancher

- **Base** : `base` vaut V0_28_2026-11-16. Si la V0.28 n'est pas produite avant, remettre V0_27_2026-11-15 (l'essai a blanc passe sur cette base).
- **Source archives.gov de STP-061** : la garder (format actuel), ou la renommer/retirer par `textes` (geste a valider).
- **Intitule de STP-125** : formulation proposee « Imposture de Marritza, commis aux archives du camp de Gallitep, qui se fait passer pour Gul Darhe’el afin d’être jugé » ; l'identifiant et l'adresse ne changent pas. Variante plus courte possible : « Marritza, commis du camp de Gallitep, se fait passer pour Gul Darhe’el ».
- **Contexte de STP-125** : option retenue = rapprochement Demjanjuk attribue a Green, avec l'erreur de chronologie signalee. Variante generale (sans Demjanjuk) : « Diffusé à la mi-juin 1993. Aucune source consultée ne relie l’épisode à un événement précis de l’actualité, et aucune déclaration d’auteur sur son propos politique n’a été lue. »
- **Date de STP-129** : le volet dit « février 1996 » (mois de `diffusion.json`) ; la page publiee donne le 19 fevrier 1996, date de toutes les sources lues.
