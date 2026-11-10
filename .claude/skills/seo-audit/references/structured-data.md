# Donnees structurees

Regle de fond : un type schema.org **valide** n'est pas forcement **eligible**
a une fonctionnalite Google. On juge d'apres la documentation Google de la
fonctionnalite precise (galerie : voir `sources.md`), consultee le jour de
l'audit.

## Controles (OBSERVE depuis le HTML initial)

- blocs JSON-LD (`jsonld_blocks`), types (`jsonld_types`), erreurs de syntaxe
  (`jsonld_errors`) ; detecter aussi Microdata (`itemscope`) et RDFa
  (`typeof`) dans le HTML brut si utile ;
- `@context` et `@type` presents ; URL absolues ; dates ISO 8601 ;
- **le balisage decrit du contenu visible et vrai** (sinon : spam de donnees
  structurees, action manuelle possible) ;
- JSON-LD injecte par JS : lu par Google, mais moins fiable (notamment
  Product) -- preferer le HTML serveur ;
- coherence avec la page : `Product` sans prix visible, `Review` sans avis
  visible, `LocalBusiness` avec une adresse differente du pied de page.

La validation d'eligibilite complete se fait avec le Rich Results Test
(outil Google en ligne, envoie l'URL a Google) : sinon, la conclusion reste
« syntaxe correcte, eligibilite non verifiee ».

## Etat des types selon claude-seo (au 2026-10) -- **a revérifier**

Les dates ci-dessous viennent de claude-seo (MIT) et n'ont pas ete
re-verifiees par ce socle. Avant d'en faire une preuve, ouvrir la page Google
correspondante.

- **Actifs** (selon eux) : Organization, LocalBusiness, Product (+
  ProductGroup, Offer), Article/BlogPosting/NewsArticle, BreadcrumbList,
  WebSite, Person/ProfilePage, VideoObject, ImageObject, Event, JobPosting,
  Course (liste), DiscussionForumPosting, QAPage, SoftwareApplication, Review
  et AggregateRating (sous conditions), Dataset (Dataset Search seulement).
- **Retires ou restreints** (selon eux) :
  - FAQPage : restreint aux sites gouvernementaux/sante en aout 2023, puis
    rich result retire pour tous en 2026. Un FAQPage existant n'est pas un
    defaut (information) ; ne jamais en **recommander** pour la SERP.
  - HowTo : rich result retire en septembre 2023.
  - Retires en juin 2025 : VehicleListing, ClaimReview (encore lu par Fact
    Check Explorer), EstimatedSalary, LearningVideo, Course Info.
  - SpecialAnnouncement : deprecie en 2025.
  - `Attorney` -> `LegalService`.

## Interdits (quality gates, seo-agent-skills)

- `aggregateRating`/`review` sans avis clients reels affiches sur la page ;
  avis auto-attribues d'une entreprise sur elle-meme : non eligibles.
- FAQ inventees pour gagner un extrait.
- schema « sitewide » sans verification par type de page : action a risque,
  `human_review_required`.
- jamais de valeur inventee (note, prix, auteur, date) dans un exemple de
  balisage propose : utiliser des champs marques `A_FOURNIR`.
