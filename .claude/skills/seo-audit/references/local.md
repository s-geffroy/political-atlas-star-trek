# SEO local

Declencheur : adresse physique, carte integree, « intervention a [ville] »,
`areaServed`, type `LocalBusiness` ou sous-type, horaires.

Type d'activite : **etablissement** (adresse visible, clients sur place),
**zone de service** (pas d'adresse publique, `areaServed`), **hybride**. Les
zones de service sautent les controles d'adresse et de carte.

## Controles (HTML public)

- **NAP** (nom, adresse, telephone) visible (pied de page, contact) et
  identique dans le JSON-LD ;
- `LocalBusiness` au sous-type juste (Restaurant, Dentist, LegalService...)
  avec `name`, `address` (PostalAddress), et si pertinent `geo`,
  `openingHoursSpecification`, `telephone`, `url` ;
- multi-etablissements : une page par lieu, chacune avec son `LocalBusiness`
  (`@id` unique), liee depuis une page liste crawlable ;
- pages de lieu **non interchangeables** : si remplacer le nom de la ville
  suffit a obtenir une autre page, risque de pages satellites (doorway) --
  aucun seuil Google de « % de contenu unique » : juger sur la valeur ;
- lien `tel:`, horaires visibles, ville et service dans title et H1 quand
  c'est vrai ;
- pas de « filtrage des avis » (n'inviter a laisser un avis que les clients
  satisfaits) : interdit par Google.

## Hors de portee ici

Fiche Google Business Profile, avis, categories, citations (annuaires),
positions locales par point de grille : demandent des acces ou outils
externes -> section « Informations a obtenir » du rapport, jamais de
chiffres. Les statistiques de facteurs locaux publiees par des tiers ne sont
pas reprises.
