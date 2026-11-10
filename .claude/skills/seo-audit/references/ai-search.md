# Recherche IA, crawlers IA, « GEO » -- section EXPERIMENTALE

Position de Google (guide sur les fonctionnalites IA, voir `sources.md`) :
optimiser pour la recherche generative, **c'est du SEO**. Les fondamentaux
(explorable, indexable, utile, exact, fiable) sont les prerequis. Tout le
reste de cette page est classe `EXPERIMENTAL / A MESURER` dans le rapport,
jamais en tete des cinq gestes sauf blocage avere.

## Etabli

- une page eligible aux apercus IA de Google doit etre indexee et eligible a
  un extrait : `noindex`, `nosnippet`, `max-snippet`, `data-nosnippet` la
  limitent ;
- **un controle par robot, par usage** (`robots.ai_bots_home` dans signals) :
  - recherche/citation : OAI-SearchBot, Claude-SearchBot, PerplexityBot,
    Googlebot (Search et apercus IA), Applebot ;
  - entrainement : GPTBot, ClaudeBot, Google-Extended (Gemini ; **sans effet
    sur Google Search**), Applebot-Extended, CCBot ;
  - declenches par un utilisateur : ChatGPT-User, Claude-User,
    Perplexity-User -- comportement vis-a-vis de robots.txt variable.
- **faux positif majeur** : conclure qu'un site est absent d'un moteur IA
  parce qu'il bloque un robot d'**entrainement**.
- bloquer ou autoriser l'entrainement est une **decision metier** : on la
  presente, on ne la recommande pas par defaut.
- contenu principal disponible sans JavaScript : beaucoup de robots IA ne
  rendent pas le JS.
- un WAF/CAPTCHA sur les pages de contenu peut bloquer les robots legitimes
  (403 generalises dans le run = indice, NON_VERIFIABLE pour un robot
  precis).

## Non etabli (dire « non demontre »)

- `llms.txt` : Google l'ignore ; aucun grand moteur ne confirme l'utiliser.
  Presence/absence = information, sans poids. Eventuellement utile pour une
  documentation de developpeurs.
- Content-Signal, Markdown servi aux agents, ai-catalog, WebMCP, Web Bot
  Auth : propositions ou brouillons ; absence = ni defaut ni opportunite
  chiffree.
- « blocs de reponse de N mots », « mentions de marque x3 », « contenu frais
  x3 cite » : correlations publiees par des tiers, pas des leviers.

## Pistes raisonnables (sans promesse)

structure claire (titres explicites, definitions, tableaux), entites
nommees, sources citees, auteur identifie, informations factuelles a jour,
accessibilite (vrais `<a href>` et `<button>`, noms accessibles). Ce sont aussi
des bonnes pratiques SEO et UX : c'est la seule justification avancee.

Jamais : promesse de citation par une IA, de presence dans un apercu IA, ou
de trafic IA.
