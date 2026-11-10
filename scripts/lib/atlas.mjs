// Atlas thematique : table EXPLICITE des correspondances entre les dix grands
// domaines de la specification et les categories effectivement presentes dans
// la colonne `categories_politiques` du CSV. Aucune categorie n'est attribuee
// a un evenement : un domaine sans categorie correspondante le dit.
//
// Depuis la V0.4, chaque domaine a sa categorie. Le mecanisme de
// « rapprochement lexical » (champ `lexique`) reste disponible pour un futur
// domaine sans categorie ; il est inactif quand `lexique` vaut null.

export const DOMAINES = [
  { slug: 'institutions-federalisme', nom: 'Institutions et fédéralisme', categories: ['institutions/fédéralisme'], lexique: null },
  { slug: 'guerres-securite-collective', nom: 'Guerres et sécurité collective', categories: ['guerre/bataille'], lexique: null },
  { slug: 'colonialisme-occupation-resistance', nom: 'Colonialisme, occupation et résistance', categories: ['colonialisme/occupation'], lexique: null },
  { slug: 'droits-civiques-discriminations', nom: 'Droits civiques et discriminations', categories: ['justice/droits'], lexique: null },
  { slug: 'autoritarisme-coups-detat', nom: 'Autoritarisme et coups d’État', categories: ['insurrection/pouvoir'], lexique: null },
  { slug: 'economie-politique-classes', nom: 'Économie politique et classes sociales', categories: ['économie/social'], lexique: null },
  { slug: 'renseignement-propagande-raison-detat', nom: 'Renseignement, propagande et raison d’État', categories: ['renseignement/sécurité'], lexique: null },
  { slug: 'diplomatie-traites', nom: 'Diplomatie et traités', categories: ['diplomatie/traité'], lexique: null },
  { slug: 'religion-legitimite', nom: 'Religion et légitimité politique', categories: ['religion/légitimité'], lexique: null },
  { slug: 'technologie-bioethique-ia', nom: 'Technologie, bioéthique et intelligences artificielles', categories: ['technologie/bioéthique'], lexique: null },
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
