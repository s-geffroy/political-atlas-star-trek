# Technique, crawl et indexabilite

Sources : Google Search Central (voir `sources.md`), arbre de decision de
seo-agent-skills (MIT), couverture de claude-seo seo-technical (MIT). Les
affirmations datees issues de claude-seo sont marquees **[cs]** : a revérifier
sur la doc Google du jour avant d'en faire une preuve.

## Trois notions a ne jamais confondre

| | Question | Preuve possible ici |
|---|---|---|
| **Exploration** | un robot a-t-il le droit de recuperer l'URL ? | robots.txt (OBSERVE) |
| **Indexabilite** | la page, une fois recuperee, peut-elle etre indexee ? | statut, noindex meta/en-tete, canonical (OBSERVE) |
| **Indexation** | Google l'a-t-il indexee, et sous quel canonique ? | **GSC seulement** ; sinon NON_VERIFIABLE |

Une page bloquee par robots.txt **n'est pas lue** : son `noindex` n'est pas vu,
et elle peut rester indexee sans contenu. Recommander « robots.txt Disallow »
pour desindexer est une erreur classique.

## Arbre d'indexabilite (par page de l'echantillon)

1. Statut 200 ? Sinon : 3xx (cible ?), 4xx, 5xx -- noter la chaine.
2. Bloquee pour Googlebot par robots.txt ? (`googlebot_allowed` dans signals)
3. `noindex` dans meta robots / googlebot ou `X-Robots-Tag` ? (`noindex_source`)
4. Canonical vers une autre URL ? Intentionnel (consolidation) ou erreur ?
5. Contenu principal dans le HTML initial ? Sinon dependance JS (voir plus bas).
6. Dans un sitemap ? Une aide a la decouverte, **pas une exigence**.

Si tout passe et que la page n'est pas indexee (GSC), c'est en general la
qualite ou la duplication : section contenu.

## Controles et faux positifs

**HTTP / acces**
- variantes `http`/`https`, `www`/sans : une seule version finale, en 1 saut si
  possible (`site.variants`). Plusieurs sauts = P2/P3, sauf boucle ou 5xx.
- soft 404 : la sonde (`soft404_probe`) a demande une URL inventee ; un 200 est
  un indice de soft 404 **suspecte** (verifier le contenu de la page).
- 5xx ou 429 pendant la collecte : peut venir de notre rythme ou d'un WAF ;
  ne pas conclure a l'instabilite sur un seul echantillon.
- 403 sur toutes les pages : souvent un WAF qui refuse notre UA. **Ne pas en
  deduire** que Googlebot est bloque : NON_VERIFIABLE.
- en-tetes de securite (HSTS, CSP...) : pas un facteur de classement ;
  mentionner au plus en P3, jamais devant un sujet d'indexation.

**robots.txt** (RFC 9309)
- 4xx = aucune restriction pour Google (pas un defaut). 5xx = Google suspend
  l'exploration : grave s'il dure.
- un robot n'obeit qu'au groupe le plus specifique qui le nomme : une regle
  sous `*` ne s'applique pas a un robot qui a son propre groupe.
- ne pas bloquer CSS/JS necessaires au rendu.
- robots.txt n'est pas un controle d'acces (zones privees : authentification).
- `Sitemap:` declare : verifier qu'il repond (`site.sitemaps`).

**noindex**
- distinguer intentionnel (panier, recherche interne, filtres, pages
  utilitaires) et accidentel (gabarit entier, environnement de recette copie
  en production). Ne jamais recommander de le retirer sans confirmer l'intention.
- noindex dans le HTML initial retire ensuite par JS : Google peut appliquer
  celui du HTML initial **[cs, doc JS dec. 2025]**.

**canonical**
- un seul, absolu, vers une URL 200 indexable ; autoreferent en general.
- canonical declare != canonique retenu par Google : le second ne se lit que
  dans GSC. Ne jamais ecrire « Google ignore votre canonical » sans GSC.
- canonical du HTML initial different de celui injecte par JS : Google peut
  retenir l'un ou l'autre **[cs]**.
- facettes/parametres canonicalises vers la version propre : correct, pas un
  defaut.
- hreflang et canonical doivent concorder (canonical = la page elle-meme).

**Redirections**
- 301/308 pour un deplacement permanent ; 302/307 legitimes si temporaire.
- chaines, boucles, redirection vers une page sans rapport (soft 404).
- redirection d'un environnement de recette ou URL de staging exposees :
  chercher des hotes `staging.`, `preprod.`, `dev.` dans les liens et sitemaps.

**Rendu JavaScript**
- `words` tres bas + nombreux scripts + marqueurs (`__NEXT_DATA__`,
  `id="root"`/`id="app"` vides, `ng-version`) : dependance JS **INFEREE**.
- title, meta description, canonical, robots, JSON-LD et liens de navigation
  doivent etre dans le HTML initial.
- Google n'execute pas le JS d'une page non 200 **[cs]**.
- beaucoup de robots IA ne rendent pas le JS.
- confirmer par le navigateur partage seulement selon SKILL.md section 2.

**Architecture, profondeur, pieges**
- profondeur en clics depuis l'accueil (`depth`) : pages strategiques loin de
  l'accueil = signal ; « 3 clics max » est une regle d'usage, pas Google.
- pieges : calendriers infinis, facettes combinatoires, parametres de session
  (`excluded_candidates`, `candidates_left_unvisited`).
- pagination : liens `<a href>` crawlables ; rel=next/prev n'est plus utilise
  par Google depuis 2019.
- pages du sitemap non liees depuis l'echantillon
  (`sitemap_urls_not_linked_in_sample`) : **orpheline suspectee** seulement --
  l'echantillon ne voit pas tous les liens.

**Mobile**
- `viewport` present ; parite mobile/desktop du contenu principal, des meta
  robots, des donnees structurees (index mobile-first). La parite exige un
  rendu avec UA mobile : sinon NON_VERIFIABLE.
- interstitiels intrusifs : verification visuelle seulement.

**Taille**
- Googlebot lit les 2 premiers Mo d'un HTML non compresse **[cs]** : contenu
  et JSON-LD loin derriere de gros blocs inline = risque.

## Liens internes

- 4xx/5xx de l'echantillon avec leurs pages sources (`broken_in_sample`).
- liens `nofollow` internes (`links_nofollow_internal`) : en general inutiles.
- ancres non descriptives (« cliquez ici ») sur les liens strategiques.
- liens de navigation seulement en JS (onclick, pas de href) : non suivis.
