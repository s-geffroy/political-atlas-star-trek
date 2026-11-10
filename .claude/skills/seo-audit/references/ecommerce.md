# E-commerce

Declencheur : prix, bouton d'achat, panier, `Product`/`Offer`, SKU.

## Gabarits a echantillonner

accueil, categories (et leurs pages paginees), fiches produit (plusieurs
categories), produit en rupture, produit retire (404/410/redirection ?),
recherche interne (doit etre `noindex` ou bloquee), facettes.

## Controles

- **facettes et parametres** : combinaisons infinies = piege de crawl ;
  canonical vers la categorie propre, ou noindex, ou blocage robots selon le
  cas -- **action a risque**, revue humaine ;
- produits retires : redirection vers un produit equivalent ou la categorie
  si pertinent, sinon 404/410 ; pas de redirection massive vers l'accueil
  (soft 404) ;
- rupture temporaire : garder la page en 200 avec `availability` a jour ;
- variantes : une URL canonique par produit ou par variante, de facon
  coherente ; pas de H1 identiques entre variantes sans canonical ;
- fiches : description propre (pas celle du fabricant seule), specs, images,
  fil d'Ariane + BreadcrumbList.

## Product / Offer (doc Google des « merchant listings », a verifier le jour J)

- `name`, `image`, `offers` ; `price` numerique, `priceCurrency` ISO 4217,
  `availability` en URL schema.org complete ;
- recommandes : `sku`, `gtin`/`mpn`, `brand`, `shippingDetails`,
  `hasMerchantReturnPolicy`, `aggregateRating`/`review` **seulement** avec
  des avis reels visibles ;
- dans le HTML serveur plutot qu'injecte par JS ;
- coherence prix balise / prix affiche / prix du flux Merchant Center.

## Hors de portee ici

Merchant Center, flux produits, Shopping : acces proprietaire. Les dates de
politique Merchant Center citees par claude-seo ne sont pas reprises sans
verification.
