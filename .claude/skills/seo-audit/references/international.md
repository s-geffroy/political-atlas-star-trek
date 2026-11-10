# International et hreflang

Seulement si le site a plusieurs langues ou regions (hreflang present,
`/fr/`, `/en/`, ccTLD multiples, selecteur de langue).

## Controles

- **auto-reference** : chaque page liste toutes ses alternates, elle comprise ;
- **retour** : si A pointe vers B, B pointe vers A (`hreflang_non_reciprocal`
  ne couvre que les pages de l'echantillon : signal partiel) ;
- codes : langue ISO 639-1 (`en`, `fr`, pas `eng`, `jp` -> `ja`), region
  ISO 3166-1 alpha-2 optionnelle (`en-GB`, pas `en-UK`) ; une region seule est
  invalide (`be` = bielorusse) ; script optionnel (`zh-Hant`) ;
- `x-default` : recommande s'il existe une page de repli ou un selecteur ;
  son absence n'est pas un defaut sinon ;
- hreflang uniquement vers des URL **canoniques** et 200 ; si le canonical
  pointe ailleurs, l'hreflang est ignore ;
- correspondance exacte des URL (protocole, slash final) ;
- une methode : balises HTML, en-tete `Link` (non-HTML), ou sitemap (gros
  sites) ; les melanger complique la maintenance (P3) ;
- liens hreflang dans le `<body>` (`in_body`) : invalides ;
- `<html lang>` present et coherent avec la langue du texte.

## Hors hreflang

- hreflang est un **indice**, pas une directive ;
- les meta geographiques sont ignorees par Google ; le ciblage pays de GSC a
  ete retire ;
- redirection automatique selon l'IP ou `Accept-Language` : Googlebot crawle
  surtout depuis les Etats-Unis et peut ne jamais voir certaines versions --
  a verifier, risque eleve ;
- traduction automatique non relue publiee en masse : risque « scaled content
  abuse » (spam policy). Indice : alternates au corps identique.
- parite des contenus entre langues : meme offre, title/meta localises.

## Faux positifs

- reciprocite « manquante » vers une page non echantillonnee ;
- `x-default` absent sur un site sans page de repli ;
- `en` seul sans region : valide.
