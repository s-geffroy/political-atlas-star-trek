# Proposition V0.31 -- fiches STP-281 et STP-286 alignees sur l'ecran

Proposition validee le 2026-11-16 (docs/ exclu du site). Suite des analyses redigees du
2026-11-16 (/analyses/STP-281/, /analyses/STP-286/). Deux entrees touchees ; intitule de STP-281 inchange,
intitule de STP-286 a trancher (voir plus bas : options, rien d'inscrit). Journal correspondant :
V0.31.json (base V0_29_2026-11-16, derniere version presente dans data/source/ au moment de l'essai ;
aucune V0.30 n'y figurait). Si une V0.30 est produite d'ici l'integration, changer `base` en consequence :
les textes « Avant » de STP-281 et STP-286 sont inchanges depuis V0.15/V0.14, mais il faudra relancer
l'essai.
Les textes « Avant » sont ceux du Markdown V0.29, identiques a _data/fiches.json (verifie par gen.py).
Essai a blanc de `appliquer()` en memoire (essai.mjs) : aucun refus, aucun avertissement, aucun fichier
ecrit ; deux notes d'audit V0.31 ; textes « Apres » et sources presents dans le Markdown produit. Meme
resultat avec chacune des trois options d'intitule de STP-286 (essai-intitule-1/2/3.json).

Les citations a l'appui renvoient aux brouillons d'analyse (numeros entre crochets = sources du
brouillon, pas de la page publiee) : flesh/brouillon.md et thunder/brouillon.md.

---

## STP-281 -- Revolte de proies holographiques (VOY « Flesh and Blood »)

### Volet faits

Avant : Des hologrammes créés comme proies pour les chasses hirogenes développent une autonomie et se révoltent. Le Docteur soutient leur revendication, avant de devoir s’opposer aux violences du meneur Iden.

Apres : Des hologrammes créés comme proies pour les chasses hirogènes, que les Hirogens ont eux-mêmes rendus capables d’apprendre et de souffrir, se révoltent sous la conduite d’Iden et cherchent un foyer, la planète Ha’Dara. Le Docteur prend leur parti : il désobéit à Janeway, livre aux hologrammes les fréquences des boucliers de Voyager et quitte le vaisseau. Devant les violences d’Iden, qui tue les deux occupants d’un vaisseau minier puis veut chasser les Hirogens désarmés, il se retourne contre lui et le détruit lui-même. Aucune planète n’est accordée aux hologrammes : Janeway laisse Kejal, seule hologramme encore active, et le technicien hirogen Donik repartir avec leur vaisseau, vers une destination que l’écran ne dit pas.

Appui (transcription de « Flesh and Blood », chakoteya.net [1], sauf mention) :
- Proies modifiees sur ordre -- TORRES : « They're not malfunctioning, are they? They're doing exactly what the Hirogen want them to do, Captain. Fight back. » / DONIK : « I did. Under orders from my Alpha. » ; KEJAL : « Apparently, there's no satisfaction in hunting something that doesn't suffer when you kill it. » ; JANEWAY : « These holograms have the ability to learn and adapt » (meme scene ; replique relevee dans la transcription, absente du brouillon).
- Foyer et Ha'Dara -- IDEN : « What we're looking for is a home. Somewhere where the Hirogen can't hurt us anymore » ; « We call this planet Ha'Dara. It's Bajoran for home of light. » (projet d'Iden ; Memory Alpha [3] : « home of light »).
- Docteur -- fréquences des boucliers contre une promesse : IDEN : « You have my word » ; il quitte Voyager (« The EMH is beamed aboard ») ; Janeway, dans « Author, Author » : « the Doctor disobeyed my direct orders. In the process, he endangered the ship and crew » [17].
- Violences d'Iden -- vaisseau minier nuu'bari detruit avec ses deux occupants : TORRES : « You killed two living beings to liberate mindless machines. » ; chasse des Hirogens desarmes : IDEN : « For us to hunt them like they hunted us » ; EMH : « Now you're going to stage a massacre ».
- Destruction d'Iden par le Docteur -- EMH : « If you've taught me anything, it's that I'm not one of your own. » (didascalie : « The EMH zaps Iden to photons ») ; TORRES : « Iden's programme is unrecoverable. »
- Issue -- KEJAL : « This is my home. » / JANEWAY : « I don't suppose I have a right to tell either of you how to live your lives. » ; didascalie : « the hologram's ship leaves orbit » ; Memory Alpha [2] : « Janeway allows Donik to reprogram the holograms with Kejal, the only remaining running hologram, and run the ship. »
- Aucune planete « accordee » : affirmation ecartee n° 1 du brouillon ; la destination du vaisseau n'est pas dite a l'ecran.
- Graphie : « hirogenes » (sans accent) dans le texte V0.29 ; « hirogènes » propose. Correction typographique seulement, a signaler.

### Volet parallele

Avant : Parallèle philosophique avec les débats sur la sentience artificielle, et historique avec les luttes contre des systèmes de servitude.

Apres : Parallèle philosophique avec les débats sur la sentience artificielle, et historique avec les luttes contre des systèmes de servitude. Ce second parallèle s’appuie sur le vocabulaire du dialogue (« enslave », « property ») et sur la critique, non sur une intention déclarée : la seule référence historique de l’équipe rapportée de première main, par Robert Picardo, est Castro et la révolution cubaine, modèle du meneur Iden et non de la révolte.

Appui :
- Dialogue -- IDEN : « Then you know they enslave holograms, too. » / EMH : « Enslave may be too strong a word. » / IDEN : « What would you call it? They're denied basic freedoms. » ; NUU'BARI : « These holograms are the property of the Mining Consortium. » / IDEN : « They're no one's property. » [1]
- Critique -- Michelle Erica Green : « Is it right for species across the galaxy to create holographic slave labor? » [13] ; Darren Mooney : « coded in terms of slave narratives, particularly older ones » [15].
- Intention declaree -- PICARDO (Michelle Erica Green, entretien du 30 octobre 2000 [7]) : « I was surprised to speak to one of the writers on our staff who said that he was really using Castro and what's happened to the Cuban revolution as his model for this. He had lofty ideals, but what happened subsequently perverted those ideals. » (le scenariste n'est pas nomme). Fuller attribuant l'idee a Biller (« Ken had the idea of this being kind of a Castro situation ») n'est connu que par Mooney [15] : cite dans l'analyse avec reserve, non repris dans la fiche, d'ou « de première main ».
- Bryan Fuller (Fandom.com, 2001 [8]) : la proposition de Jack Monaco portait sur des hologrammes qui « rebelled against their repressors » ; aucun auteur ne parle de servitude ou d'esclavage dans une source lue de premiere main. (La declaration de Picardo sur une « allegory » de « any oppressed group » n'est connue que par Mooney [15] : non reprise dans la fiche.)

### Sources ajoutees a la fiche

**Source — Transcription de « Flesh and Blood » (chakoteya.net)** : http://www.chakoteya.net/Voyager/706.htm

**Source — Michelle Erica Green, « Turning the Doctor On: Robert Picardo Enjoys the Home Stretch », entretien, 30 octobre 2000** : http://www.littlereview.com/getcritical/trektalk/picardo4.htm

Raison : la transcription appuie tout le volet faits ; l'entretien est la source de la reference a Castro citee dans le volet parallele. (Date : « 10/30/00 » dans la reprise sur sffchronicles.com ; la page de l'autrice n'est pas datee -- point a arbitrer du brouillon.)

### Non propose

- Volet mecanisme (« L’émancipation d’un groupe construit pour souffrir... ») : inchange ; confirme par l'episode (« there's no satisfaction in hunting something that doesn't suffer »).
- Volet contexte (« Diffusion 2000. ») : hors de la liste validee ; l'analyse donne la date (29 novembre 2000, soiree de deux heures) et l'absence de lien avec l'actualite. A signaler seulement.
- Source A de la fiche : le resume de la page officielle archivee (2023) est mot pour mot celui de Jim Wright (Delta Blues, 2003), et la citation de la note V0.15 (« the Holograms malfunctioned ») reprend la version de Donik, dementie dans l'episode [1]. Niveau A non touche ; a signaler.
- Relation STP-281 -> STP-172 (« Author, Author ») : possible, avec la reserve que l'episode n'est pas nomme a l'ecran [17] ; hors perimetre de cette version.

### Motif

(voir V0.31.json, entree STP-281)

---

## STP-286 -- Kelpiens et Ba'ul sur Kaminar (DIS « The Sound of Thunder »)

### Volet faits

Avant : Sur Kaminar, le gouvernement ba’ul contrôle les Kelpiens en leur présentant le vahar’ai comme une mort inéluctable. La découverte d’un passé où les rôles étaient inversés provoque une rupture, puis une tentative d’extermination.

Apres : Sur Kaminar, le gouvernement ba’ul contrôle les Kelpiens en leur présentant le vahar’ai comme une mort inéluctable. La découverte d’un passé où les rôles étaient inversés conduit Saru, avec l’accord de Pike, à déclencher le vahar’ai de tous les Kelpiens à la fois, avec l’aide du Discovery ; c’est cette décision qui fait rupture. Les Ba’ul y répondent par une tentative d’extermination, que l’ange rouge arrête en désactivant les pylônes, et non Starfleet. Siranna annonce aux villageois qu’ils n’ont plus à avoir peur, mais aussi un long chemin avant que Kelpiens et Ba’ul s’acceptent (« a long road ahead »).

Appui (transcription de « The Sound of Thunder », chakoteya.net [1]) :
- Passe inverse -- BURNHAM : « The Ba'ul narrowly escaped extinction. Then they turned around and wiped out the evolved Kelpiens. » ; « The Ba'ul were originally the prey species. »
- Decision -- PIKE : « What if history repeats itself? We can't be responsible for the extinction of the Ba'ul species. » / SARU : « We will not perpetuate the cycle. We will create a new balance. » / PIKE : « Very well, Commander. Discovery will help you amplify the signal. » ; SIRANNA : « Then let it begin. »
- Scenaristes (TrekMovie, 22 fevrier 2019 [7]) : « The decision to trigger Vahar'ai was indeed a drastic one. [...] it was a decision made by Captain Pike, who was willing to accept responsibility for it. »
- Extermination -- DETMER : « Sir, they've activated all 4,056 pylons in every Kelpien village. » ; BURNHAM : « Rather than let them evolve, the Ba'ul are committing genocide? »
- Arret par l'ange rouge -- BURNHAM : « The pulse has deactivated all the pylons across Kaminar. » ; PIKE : « the Red Angel took advantage of their temporary exposure and used its advanced technology to save the Kelpiens from genocide. »
- Issue -- SIRANNA : « It is time for a true balance to be restored. You do not have to be afraid anymore. » ; « No. I must stay for my people. There is a long road ahead. Our minds must truly be free before Kelpien and Ba'ul accept each other. »
- « le gouvernement ba’ul » est garde (a l'ecran : « the Ba'ul High Council » [1]) : ecart mineur releve par le brouillon, hors de la liste validee.

### Intitule « Fin du système de sélection et de mise à mort des Kelpiens par les Ba’ul sur Kaminar » -- a trancher

Etat V0.29 : `Fin du système de sélection et de mise à mort des Kelpiens par les Ba’ul sur Kaminar`.

Constat : l'ecran montre la desactivation de « all the pylons across Kaminar » et la fin de la peur dans un
village ; Siranna annonce « a long road ahead » [1] ; dans le final de la saison, Siranna arrive « with Ba'ul
fighters » [17]. « Fin » se defend pour l'abattage (les pylones sont desactives), pas pour un systeme de
domination dont l'episode ne montre ni le demantelement ni un accord. Le brouillon suggerait « Fin de
l'abattage des Kelpiens et effondrement du Grand Équilibre ».

Options (a trancher par l'utilisateur ; rien n'est inscrit dans V0.31.json) :
1. `Fin de l’abattage des Kelpiens et effondrement du Grand Équilibre sur Kaminar` -- forme du brouillon ; garde « Fin », restreint a l'abattage.
2. `Effondrement du Grand Équilibre et déclenchement du vahar’ai des Kelpiens sur Kaminar` -- nomme la rupture que l'ecran montre (la decision de Saru et Pike), sans parler de fin.
3. `Remise en cause du système de sélection et de mise à mort des Kelpiens par les Ba’ul sur Kaminar` -- changement minimal : seul « Fin » est remplace.
4. Garder l'intitule, la nuance etant portee par le volet faits.

Pour l'option retenue (1 a 3), ajouter a l'entree STP-286 du journal (essais a blanc reussis : essai-intitule-N.json ;
le registre et le titre de la fiche suivent) :

```json
"champs": {
 "event": {
  "avant": "Fin du système de sélection et de mise à mort des Kelpiens par les Ba’ul sur Kaminar",
  "apres": "<intitule retenu>"
 }
}
```

et completer le motif (ex. : « Intitulé : l’écran montre la désactivation des pylônes et l’annonce d’« a long road ahead », non la fin du système de domination »). Valeur « avant » verifiee dans _data/fiches.json et le Markdown V0.29.
Effet sur le site : l'intitule s'affiche par Liquid (chapo de /analyses/STP-286/, page /evenements/STP-286/) ;
les adresses sont par identifiant et ne changent pas.

### Source de controle (niveau A) -- a signaler

Le guide officiel des premiers contacts (Christine Dinh, StarTrek.com, 5 avril 2024 [15]), source A de la fiche,
ecrit : « The Ba'ul are predatory species that hunted Kelpiens. As a warp capable species, they forced the
pre-warp Kelpiens to submit to cullings ». L'episode le contredit : « The Ba'ul were originally the prey
species » [1]. La meme page rapporte ensuite la revelation (« the Great Balance was an invention by the actually
frail Ba'ul to keep Kelpiens in line, as they once faced extinction at the hands of evolved Kelpiens »). Le
niveau A n'est pas touche ; le motif V0.31 le signale. Si l'utilisateur prefere ne rien en dire dans la note
d'audit, retirer la derniere phrase du motif.

### Source ajoutee a la fiche

**Source — Transcription de « The Sound of Thunder » (chakoteya.net)** : http://www.chakoteya.net/STDisco17/206.html

Raison : elle appuie tout le volet faits (la page porte le titre « The Sounds of Thunder »).

### Non propose

- Volets mecanisme, parallele, objections : inchanges ; le mecanisme est confirme par « We will never allow the past to be repeated » [1] et par les scenaristes [7].
- Volet contexte (« Diffusion 2019. ») : hors de la liste validee ; le seul parallele declare par les auteurs (« the Japanese occupation of Korea », TrekMovie [7]) pourrait y entrer dans une version ulterieure. A signaler seulement.
- Releve des dates stellaires (`data/stardates.json`, genere) : « transcription introuvable » alors qu'elle existe a http://www.chakoteya.net/STDisco17/206.html (titre « The Sounds of Thunder ») ; a reporter au prochain releve (procedure 7), pas dans ce journal.

### Motif

(voir V0.31.json, entree STP-286)

Decision de l utilisateur (2026-11-16) : intitule de STP-286, option 3.
