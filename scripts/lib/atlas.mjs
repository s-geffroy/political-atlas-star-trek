// Atlas thematique : table EXPLICITE des correspondances entre les dix grands
// domaines de la specification et les categories effectivement presentes dans
// la colonne `categories_politiques` du CSV. Aucune categorie n'est attribuee
// a un evenement : un domaine sans categorie correspondante le dit.
//
// Les « rapprochements lexicaux » sont une aide de lecture distincte, calculee
// par expression reguliere sur `event` et `politics`, affichee comme non validee.

export const DOMAINES = [
  { slug: 'institutions-federalisme', nom: 'Institutions et fédéralisme', categories: [],
    lexique: 'Sénat|Conseil|constitution|élection|électo|parlement|président|chancel|gouvernement|institution|adhésion|réintégration|fédéralisme|fondation de la Fédération' },
  { slug: 'guerres-securite-collective', nom: 'Guerres et sécurité collective', categories: ['guerre/bataille'], lexique: null },
  { slug: 'colonialisme-occupation-resistance', nom: 'Colonialisme, occupation et résistance', categories: [],
    lexique: 'occup|colon|résistan|annex|libération|indépendan|esclav|servitude' },
  { slug: 'droits-civiques-discriminations', nom: 'Droits civiques et discriminations', categories: ['justice/droits'], lexique: null },
  { slug: 'autoritarisme-coups-detat', nom: 'Autoritarisme et coups d’État', categories: ['insurrection/pouvoir'], lexique: null },
  { slug: 'economie-politique-classes', nom: 'Économie politique et classes sociales', categories: ['économie/social'], lexique: null },
  { slug: 'renseignement-propagande-raison-detat', nom: 'Renseignement, propagande et raison d’État', categories: ['renseignement/sécurité'], lexique: null },
  { slug: 'diplomatie-traites', nom: 'Diplomatie et traités', categories: ['diplomatie/traité'], lexique: null },
  { slug: 'religion-legitimite', nom: 'Religion et légitimité politique', categories: [],
    lexique: 'relig|Prophète|prophét|[Vv]edek|\\bKai\\b|culte|croyance|sacré|théocra|divin|spirituel|orthodox' },
  { slug: 'technologie-bioethique-ia', nom: 'Technologie, bioéthique et intelligences artificielles', categories: [],
    lexique: 'synthétique|androïde|hologramme|holograph|intelligence artificielle|\\bIA\\b|génétique|eugén|[Aa]ugment|clon|bioéth|\\bData\\b|technolog|[Bb]org|implant|artificiel' },
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
