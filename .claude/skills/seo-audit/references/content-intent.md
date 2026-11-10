# Contenu, intention, E-E-A-T, architecture editoriale

Sources : Google « Creating helpful, reliable, people-first content » ;
principes de seo-agent-skills (MIT) ; couverture de claude-seo seo-content et
seo-sxo (MIT). Les seuils chiffres de claude-seo sont **non sources** : on ne
les reprend pas comme regles.

## Ce qu'on juge, page par page de l'echantillon

- **title** : present, unique (`duplicate_titles`), decrit la page, pas de
  bourrage. Longueur : aucune limite Google ; une troncature dans la SERP est
  un sujet de CTR, pas d'indexation (P3).
- **meta description** : absente ou dupliquee = P3 ; Google la reecrit
  souvent.
- **H1 / Hn** : un H1 qui dit le sujet ; plusieurs H1 n'est **pas** une
  erreur Google (P3 au plus) ; hierarchie lisible.
- **contenu principal** : original, exact, complet pour le besoin, utile au
  lecteur. Le nombre de mots n'est pas un facteur Google : un seuil de mots
  n'est jamais une preuve de « contenu maigre ».
- **promesse vs intention** : la page repond-elle a ce que cherche la personne
  qui arrive (informationnelle, commerciale, transactionnelle,
  navigationnelle) ?

## Test Who / How / Why (Google)

- **Who** : qui a fait le contenu ? signature, page auteur, references --
  attendu surtout en YMYL (sante, argent, juridique, securite).
- **How** : comment a-t-il ete produit (methode, tests, usage de l'IA) ?
- **Why** : pour aider des personnes, ou pour capter du trafic ?

Signaux de confiance observables : contact, adresse, mentions legales,
politique de confidentialite, dates de publication et de mise a jour,
corrections. Leur absence est un indice, pas un verdict.

Signaux d'alerte (Google) : ecrire pour un nombre de mots, fausse fraicheur
(dates changees sans changement reel), entrer dans une niche sans expertise,
contenu genere a grande echelle sans valeur (scaled content abuse).

## Type de page contre intention (SXO, repris de claude-seo)

Classer la page cible : landing, article, produit, service, comparatif,
local, outil, hybride. Le **type attendu** par une requete se lit dans la
SERP : sans recherche web dans la session, c'est NON_VERIFIABLE et on le dit.
Decalage typique : article de blog qui vise une requete transactionnelle
(« acheter X »), page service generique sur une requete locale. Elements
attendus par type -- produit : prix, achat, avis reels ; comparatif :
tableau, pour/contre ; local : NAP, carte, horaires ; outil : l'outil
au-dessus de la ligne de flottaison, sans mur de connexion.

## Architecture et maillage

- pages strategiques (services, categories, produits phares) liees depuis la
  navigation et depuis des pages proches ; ancres descriptives ;
- clusters : une page pilier et des pages filles liees entre elles ;
- **cannibalisation** : deux pages qui visent la meme intention -- toujours
  `SUSPECTE` sans requetes GSC ; l'action est d'abord de verifier ;
- contenus perimes : dates anciennes sur des sujets qui bougent.

## Interdits (quality gates, seo-agent-skills)

Jamais : faux avis, notes, auteurs, prix, stocks, chiffres, temoignages ;
pages satellites (doorway) ; contenu de masse sans valeur ; bourrage ;
cloaking ; texte cache. Une recommandation qui y mene est `REJETE` en revue.

## Opportunites

Sans donnees marche (GSC, SERP, volumes), une opportunite editoriale est une
**hypothese de test** : decrire le test et la mesure, jamais un gain chiffre.
