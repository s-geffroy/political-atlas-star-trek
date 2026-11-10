# Sitemaps

Un sitemap aide a la decouverte. **Son absence n'est pas une erreur
bloquante** : un petit site bien maille s'en passe. Un sitemap est utile pour
un gros site, un site recent avec peu de liens entrants, des contenus riches
(video, news).

Ce que `seo_fetch.py` lit : les sitemaps declares dans robots.txt, sinon une
tentative sur `/sitemap.xml` ; 10 Mo max par fichier ; 3 sitemaps enfants max
d'un index ; 5 000 `<loc>` max lues ; refus des DOCTYPE/ENTITY.

## Controles

- XML valide (`parse_error`), type `urlset` / `sitemapindex`.
- Limites du protocole : 50 000 URL et 50 Mo non compresses par fichier,
  sinon index.
- URL du perimetre (`loc_out_of_scope`), en HTTPS, 200, indexables,
  canoniques : sur les URL **echantillonnees** depuis le sitemap
  (`source: sitemap` dans signals), regarder statut, noindex, canonical. Une
  URL redirigee ou noindex dans le sitemap = signal mixte (P2/P3).
- `lastmod` : exact et coherent ; toutes les valeurs identiques ou plus
  recentes que le contenu = indice de lastmod artificiel. Google ne s'y fie
  que s'il est exact de facon constante.
- `priority` et `changefreq` : ignores par Google -- information, pas defaut.
- Sitemaps image/video/news : regles specifiques (news : 1 000 URL, articles
  des 2 derniers jours) -- a verifier sur la doc Google si present.

## Faux positifs

- « sitemap absent » lu comme critique.
- un `Sitemap:` declare mais en 404 alors qu'un autre chemin usuel repond.
- sitemap en partie lu (index tronque a 3 enfants) : la couverture est
  partielle, le dire.
