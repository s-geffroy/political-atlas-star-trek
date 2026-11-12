// Atlas thematique : table EXPLICITE des correspondances entre les dix grands
// domaines de la specification et les categories effectivement presentes dans
// la colonne `categories_politiques` du CSV. Aucune categorie n'est attribuee
// a un evenement : un domaine sans categorie correspondante le dit.
//
// Depuis la V0.4, chaque domaine a sa categorie. Le mecanisme de
// « rapprochement lexical » (champ `lexique`) reste disponible pour un futur
// domaine sans categorie ; il est inactif quand `lexique` vaut null.

export const DOMAINES = [
  { slug: 'institutions-federalisme', intro: 'Ce domaine regroupe les entrées classées « institutions/fédéralisme » : fonctionnement et crises des gouvernements, successions, élections et transitions de pouvoir, adhésions à la Fédération ou départs, chaîne de commandement de Starfleet.', nom: 'Institutions et fédéralisme', categories: ['institutions/fédéralisme'], lexique: null },
  { slug: 'guerres-securite-collective', intro: 'Ce domaine regroupe les entrées classées « guerre/bataille » : guerres entre puissances et guerres civiles, batailles, attaques et représailles, débats sur une attaque préventive ; le renseignement et les opérations secrètes relèvent d’un domaine distinct.', nom: 'Guerres et sécurité collective', categories: ['guerre/bataille'], lexique: null },
  { slug: 'colonialisme-occupation-resistance', intro: 'Ce domaine regroupe les entrées classées « colonialisme/occupation » : occupations militaires et résistances qu’elles suscitent, de Bajor à Mat’aar XII, colonies déplacées ou redécoupées par un traité, mise en servitude d’un peuple par un autre.', nom: 'Colonialisme, occupation et résistance', categories: ['colonialisme/occupation'], lexique: null },
  { slug: 'droits-civiques-discriminations', intro: 'Ce domaine regroupe les entrées classées « justice/droits », catégorie plus large que son intitulé : persécutions de minorités, ségrégation, discriminations de sexe ou de genre, mais aussi procès, audiences, droit d’asile et statut juridique des êtres artificiels.', nom: 'Droits civiques et discriminations', categories: ['justice/droits'], lexique: null },
  { slug: 'autoritarisme-coups-detat', intro: 'Ce domaine regroupe les entrées classées « insurrection/pouvoir » : coups d’État, régimes autoritaires, soulèvements, crises de succession et chutes de dirigeants ; la catégorie couvre aussi des changements de pouvoir sans violence, comme une élection.', nom: 'Autoritarisme et coups d’État', categories: ['insurrection/pouvoir'], lexique: null },
  { slug: 'economie-politique-classes', intro: 'Ce domaine regroupe les entrées classées « économie/social » : hiérarchies de classe ou de caste, conditions de travail, pénuries et chocs économiques comme le Burn, domination commerciale, ascension sociale et contre-cultures.', nom: 'Économie politique et classes sociales', categories: ['économie/social'], lexique: null },
  { slug: 'renseignement-propagande-raison-detat', intro: 'Ce domaine regroupe les entrées classées « renseignement/sécurité » : services secrets comme Section 31, opérations clandestines, infiltrations, conspirations et sabotages ; la propagande et la raison d’État, sans catégorie propre, n’apparaissent que dans les entrées de cette catégorie qui les évoquent.', nom: 'Renseignement, propagande et raison d’État', categories: ['renseignement/sécurité'], lexique: null },
  { slug: 'diplomatie-traites', intro: 'Ce domaine regroupe les entrées classées « diplomatie/traité » : premiers contacts, négociations, traités et accords de frontière, alliances, aide humanitaire, et cas où la Directive première limite l’intervention de la Fédération.', nom: 'Diplomatie et traités', categories: ['diplomatie/traité'], lexique: null },
  { slug: 'religion-legitimite', intro: 'Ce domaine regroupe les entrées classées « religion/légitimité » : rapports entre autorité religieuse et pouvoir politique, à Bajor avec les Prophètes et l’Émissaire, chez les Klingons avec le retour de Kahless, ou sur une planète soumise à l’ordinateur Vaal.', nom: 'Religion et légitimité politique', categories: ['religion/légitimité'], lexique: null },
  { slug: 'technologie-bioethique-ia', intro: 'Ce domaine regroupe les entrées classées « technologie/bioéthique » : eugénisme et modifications génétiques, droits des intelligences artificielles et des synthétiques, de l’audience sur le statut de Data à leur interdiction fédérale, technologies militaires devenues incontrôlables.', nom: 'Technologie, bioéthique et intelligences artificielles', categories: ['technologie/bioéthique'], lexique: null },
];

export function construireAtlas(evenements, categoriesPresentes) {
  const nonCouvertes = categoriesPresentes.filter((c) => !DOMAINES.some((d) => d.categories.includes(c)));
  const domaines = DOMAINES.map((d) => {
    const parCategorie = evenements.filter((e) => e.categories.some((c) => d.categories.includes(c))).map((e) => e.id);
    const re = d.lexique ? new RegExp(d.lexique) : null;
    const lexical = re
      ? evenements.filter((e) => !parCategorie.includes(e.id) && re.test(`${e.event} ${e.politics}`)).map((e) => e.id)
      : [];
    return { ...d, inconnues: d.categories.filter((c) => !categoriesPresentes.includes(c)), evenements: parCategorie, rapprochements_lexicaux: lexical };
  });
  return { domaines, categories_non_couvertes: nonCouvertes };
}
