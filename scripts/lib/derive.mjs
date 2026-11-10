// Derivations documentees. Chaque valeur derivee est calculee par une regle
// explicite, publiee sur la page Methodologie, et n'ecrase jamais un champ du
// CSV. Toute evolution d'une regle doit etre consignee dans docs/.

export const SERIES = [
  // ordre = ordre de premiere diffusion de la franchise (affichage)
  { code: 'TOS', nom: 'The Original Series' },
  { code: 'TAS', nom: 'The Animated Series' },
  { code: 'Film', nom: 'Films' },
  { code: 'TNG', nom: 'The Next Generation' },
  { code: 'DS9', nom: 'Deep Space Nine' },
  { code: 'VOY', nom: 'Voyager' },
  { code: 'ENT', nom: 'Enterprise' },
  { code: 'DIS', nom: 'Discovery' },
  { code: 'Short Treks', nom: 'Short Treks' },
  { code: 'PIC', nom: 'Picard' },
  { code: 'LD', nom: 'Lower Decks' },
  { code: 'PRO', nom: 'Prodigy' },
  { code: 'SNW', nom: 'Strange New Worlds' },
  { code: 'SFA', nom: 'Starfleet Academy' },
];
const SERIE_RE = /\b(TOS|TAS|TNG|DS9|VOY|ENT|DIS|PIC|LD|PRO|SNW|SFA|Film|Short Treks)\b/;

// Regle « serie » : sigle en tete de chaque segment du champ `source`
// (segments separes par « ; »). Un segment sans sigle herite du sigle
// precedent (« ENT «Demons»; «Terra Prime» »). Aucun titre n'est rattache a une
// serie par connaissance exterieure.
export function episodesDe(source) {
  const segs = source.split(';').map((s) => s.trim()).filter(Boolean);
  const series = [];
  const episodes = [];
  const nonRattaches = [];
  let courante = null;
  for (const seg of segs) {
    const m = SERIE_RE.exec(seg);
    if (m && seg.indexOf(m[1]) <= 1) courante = m[1];
    else if (m) courante = m[1];
    const titres = [...seg.matchAll(/«\s*([^»]+?)\s*»/g)].map((x) => x[1]);
    if (!m && !titres.length) {
      // « saison 3 », « S3 » : precision de saison de la serie courante.
      if (!(courante && /^(S\d|saisons?\b)/i.test(seg))) nonRattaches.push(seg);
      continue;
    }
    if (courante && !series.includes(courante)) series.push(courante);
    for (const t of titres) episodes.push({ serie: courante, titre: t });
  }
  return { series, episodes, nonRattaches };
}

// Regle « continuite » : lue dans `period`, puis dans `cycle` et `event`.
//   kelvin   : `period` contient « Kelvin ».
//   modifiee : `period` contient « chronologie modifiée », « (alt.) »,
//              « timeline alternative », « branche temporelle » ou
//              « réalité alternative ».
//   miroir   : `period` contient « Miroir », ou `cycle` est « Univers Miroir… ».
//              Un recit de la continuite principale qui EVOQUE l'Empire terrien
//              (STP-194, STP-268) reste en continuite principale.
//   sinon    : principale.
export const CONTINUITES = {
  principale: 'Continuité principale',
  miroir: 'Univers Miroir',
  kelvin: 'Chronologie Kelvin',
  modifiee: 'Temporalité ou réalité modifiée',
};
export function continuite(d) {
  if (/Kelvin/.test(d.period)) return { code: 'kelvin', regle: '`period` contient « Kelvin »' };
  if (/chronologie modifiée|\(alt\.\)|timeline alternative|branche temporelle|réalité alternative/.test(d.period))
    return { code: 'modifiee', regle: '`period` signale une temporalité ou réalité modifiée' };
  if (/Miroir/.test(d.period)) return { code: 'miroir', regle: '`period` contient « Miroir »' };
  if (/^Univers Miroir/.test(d.cycle)) return { code: 'miroir', regle: '`cycle` « Univers Miroir »' };
  return { code: 'principale', regle: null };
}

// Regle « ordre diegetique » : sert UNIQUEMENT a trier. La periode affichee
// reste le texte du CSV ; la cle n'est jamais presentee comme une date.
const ROMAINS = { XX: 20, XXI: 21, XXII: 22, XXIII: 23, XXIV: 24, XXV: 25, XXXI: 31, XXXII: 32 };
export function ordreDiegetique(period) {
  const p = period.trim();
  let m;
  if (/Antiquité|Passé lointain|Préhistoire/.test(p)) return { cle: null, precision: 'passe_lointain' };
  if ((m = /^(\d{4})s\b/.exec(p))) return { cle: +m[1], precision: 'decennie' };
  if ((m = /^(\d{4})\b/.exec(p))) {
    const exacte = /^\d{4}$/.test(p);
    return { cle: +m[1], precision: exacte ? 'annee' : 'annee_qualifiee' };
  }
  if ((m = /^(?:vers|Avant|Après) (\d{4})/.exec(p))) return { cle: +m[1], precision: 'borne' };
  if ((m = /^Années (\d{4})/.exec(p))) return { cle: +m[1], precision: 'decennie' };
  if ((m = /\b(X{1,3}(?:IV|V|I{0,3}))e\b/.exec(p)) && ROMAINS[m[1]])
    return { cle: (ROMAINS[m[1]] - 1) * 100 + 1, precision: 'siecle' };
  return { cle: null, precision: 'indeterminee' };
}

export const PRECISIONS = {
  annee: 'Année explicite',
  annee_qualifiee: 'Année avec réserve (intervalle, « env. », alternative…)',
  decennie: 'Décennie',
  borne: 'Borne (« vers », « avant », « après »)',
  siecle: 'Siècle seulement',
  passe_lointain: 'Passé lointain non daté',
  indeterminee: 'Non ordonnable sans interprétation',
};

export function slug(s) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function epKey(e) {
  return `${e.serie || '?'}|${e.titre.toLowerCase().replace(/[’']/g, "'").replace(/[.…]+$/, '').trim()}`;
}
