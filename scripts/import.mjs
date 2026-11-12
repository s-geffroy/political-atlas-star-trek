#!/usr/bin/env node
// Import du corpus : CSV + Markdown sources -> donnees Jekyll (_data/) et une
// page par identifiant (_evenements/). Usage :
//
//   node scripts/import.mjs [chemin.csv] [chemin.md]
//
// Sans argument, prend la version la plus recente de data/source/.
// Le script ne corrige rien : il copie, derive selon des regles publiees, et
// consigne ce qu'il n'a pas pu rattacher dans les rapports.

import fs from 'node:fs';
import path from 'node:path';
import { readRecords } from './lib/csv.mjs';
import { parseFiches, parseRegistre, sectionsEditoriales } from './lib/fiches.mjs';
import { SERIES, CONTINUITES, PRECISIONS, episodesDe, continuite, ordreDiegetique, slug, epKey, historiqueAudit, nomComplet, oeuvres, amorce } from './lib/derive.mjs';
import { construireAtlas, DOMAINES } from './lib/atlas.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'data/source');
export const COLONNES = ['id', 'cycle', 'period', 'event', 'source', 'politics', 'categories_politiques', 'niveau_recoupement', 'nature_source', 'url_source', 'note_audit', 'version_entree'];

export function dernieresSources() {
  const files = fs.readdirSync(SRC).filter((f) => /^Star_Trek_Atlas_Politique_V\d+_\d+_.+\.(csv|md)$/.test(f));
  const version = (f) => f.match(/_V(\d+)_(\d+)_/).slice(1).map(Number);
  const cmp = (a, b) => { const [x, y] = [version(a), version(b)]; return x[0] - y[0] || x[1] - y[1] || a.localeCompare(b); };
  // Le CSV de version la plus haute, et le Markdown de MEME nom (meme version,
  // meme date) : jamais une paire depareillee.
  const csv = files.filter((f) => f.endsWith('.csv')).sort(cmp).pop();
  if (!csv) return { csv: null, md: null };
  const md = csv.replace(/\.csv$/, '.md');
  if (!files.includes(md)) throw new Error(`Markdown apparie introuvable pour ${csv} (attendu : ${md})`);
  return { csv: path.join(SRC, csv), md: path.join(SRC, md) };
}

// Analyses redigees a la main (pages propres dans analyses/) : l'import ne
// genere pas de page pour ces fiches et les gabarits lisent `analyse_url`.
export const ANALYSES_REDIGEES = { 'STP-006': 'emeutes-de-bell' };

export function lireDiffusion() {
  const p = path.join(ROOT, 'data/diffusion.json');
  if (!fs.existsSync(p)) return { series: [], films: [], episodes: [] };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
function romain(n) { return 'X'.repeat(Math.floor(n / 10)) + ROM[n % 10]; }
export function bande(o) {
  if (o.precision === 'passe_lointain') return 'Passé lointain';
  if (o.cle == null) return 'Non ordonnable sans interprétation';
  if (o.siecle_fin) return `Entre le ${romain(o.siecle)}e et le ${romain(o.siecle_fin)}e siècle`;
  return `${romain(o.siecle)}e siècle`;
}
// Cle de tri complete : groupe, siecle, intervalle apres le siecle, imprecis en fin de siecle.
export function cleTri(o) {
  const groupe = o.precision === 'passe_lointain' ? 0 : o.cle == null ? 2 : 1;
  return [groupe, o.siecle ?? 0, o.siecle_fin ? 1 : 0, o.imprecis ? 1 : 0, o.imprecis ? o.qualif : (o.cle ?? 0) - (o.avant ? 0.5 : 0)];
}

export function lireDoublons() {
  const p = path.join(ROOT, 'data/doublons.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).doublons : [];
}

export function lireRelations() {
  const p = path.join(ROOT, 'data/relations.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).relations : [];
}
export function lireSansRelation() {
  const p = path.join(ROOT, 'data/relations.json');
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, 'utf8')).examinees_sans_relation || { ids: [] }) : { ids: [] };
}

export function importer(csvPath, mdPath) {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const md = fs.readFileSync(mdPath, 'utf8');
  const { header, records, rejects } = readRecords(csvText, ';');
  const { fiches, problems: problemesFiches } = parseFiches(md);
  const registre = parseRegistre(md);
  const editorial = sectionsEditoriales(md);
  // Synthese : les paragraphes « Mise a jour V0.N » (un par version, empiles en
  // tete par nouvelle-version.mjs) deviennent un historique ; le reste est le
  // socle chiffre de la V0.3. La repartition courante est calculee (stats).
  if (editorial.synthese) {
    const blocs = editorial.synthese.markdown.split(/\n{2,}/);
    const estMaj = (b) => /^\*\*Mise à jour V\d+\.\d+/.test(b);
    editorial.synthese.historique = blocs.filter(estMaj).map((b) => ({
      version: b.match(/V\d+\.\d+/)[0],
      markdown: b.replace(/\s*Les chiffres ci-dessous sont ceux de la version précédente\.\s*$/, ''),
    }));
    editorial.synthese.socle = blocs.filter((b) => !estMaj(b)).join('\n\n');
  }
  const diffusion = lireDiffusion();
  const ficheParId = new Map(fiches.map((f) => [f.id, f]));

  // Dates d'episode verifiees, indexees par serie|titre du corpus.
  const datesEp = new Map();
  for (const e of [...diffusion.episodes, ...diffusion.films.map((f) => ({ ...f, serie: 'Film' }))]) {
    if (!e.date || !e.source_url || !e.titre_corpus) continue;
    const k = epKey({ serie: e.serie, titre: e.titre_corpus });
    if (!datesEp.has(k)) datesEp.set(k, []);
    datesEp.get(k).push({ date: e.date, titre: e.titre, source_url: e.source_url });
  }

  // Corrections documentees : une ligne par STP dans la section dediee.
  const corrections = new Map();
  for (const m of (editorial.corrections?.markdown || '').matchAll(/^- \*\*(STP-\d{3})\*\* — (.+?) \*Motif :\* (.+)$/gm)) {
    if (!corrections.has(m[1])) corrections.set(m[1], []);
    corrections.get(m[1]).push({ libelle: m[2].trim(), motif: m[3].trim() });
  }

  const evenements = records.map(({ line, data: d }) => {
    const ep = episodesDe(d.source);
    const cont = continuite(d);
    const dates = ep.episodes.flatMap((e) => datesEp.get(epKey(e)) || []);
    dates.sort((a, b) => a.date.localeCompare(b.date));
    const e = {
      ...d,
      ligne_csv: line,
      categories: d.categories_politiques.split(/\s*;\s*/).filter(Boolean),
      series: ep.series,
      episodes: ep.episodes,
      references_non_rattachees: ep.nonRattaches,
      continuite: cont.code,
      continuite_regle: cont.regle,
      ordre: ordreDiegetique(d.period),
      audit: historiqueAudit(d.note_audit),
      cycle_slug: slug(d.cycle),
      fiche: ficheParId.has(d.id),
      corrections: corrections.get(d.id) || [],
      note_editoriale: registre.get(d.id)?.note_editoriale || null,
      diffusion: dates,
    };
    return e;
  });
  const parId = new Map(evenements.map((e) => [e.id, e]));

  // Doublons tranches (data/doublons.json) : la secondaire renvoie a la
  // principale et n'est pas comptee comme evenement distinct.
  const doublons = lireDoublons();
  for (const e of evenements) { e.doublon_de = null; e.doublons = []; }
  for (const d of doublons) {
    if (parId.has(d.secondaire) && parId.has(d.principal)) {
      parId.get(d.secondaire).doublon_de = { id: d.principal, motif: d.motif };
      parId.get(d.principal).doublons.push(d.secondaire);
    }
  }
  const distincts = evenements.filter((e) => !e.doublon_de);

  // Relations documentees (data/relations.json), affichees dans les deux sens.
  const relations = lireRelations();
  const sansRel = lireSansRelation();
  for (const e of evenements) e.relations = { sortantes: [], entrantes: [], examinee_le: sansRel.ids.includes(e.id) ? sansRel.date : null };
  for (const x of relations) {
    if (!parId.has(x.de) || !parId.has(x.vers)) continue;
    const commun = { type: x.type, url: x.url, url_complementaire: x.url_complementaire || null, justification: x.justification };
    parId.get(x.de).relations.sortantes.push({ id: x.vers, ...commun });
    parId.get(x.vers).relations.entrantes.push({ id: x.de, ...commun });
  }

  // Rang diegetique (tri seulement) et bande d'affichage (siecle de la cle).
  const compare = (a, b) => {
    const x = cleTri(a.ordre), y = cleTri(b.ordre);
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return a.id.localeCompare(b.id);
  };
  [...evenements].sort(compare).forEach((e, i) => { e.rang_diegetique = i + 1; });
  for (const e of evenements) {
    e.bande = bande(e.ordre);
    e.amorce = amorce(e);
    e.analyse_url = e.fiche ? `/analyses/${ANALYSES_REDIGEES[e.id] || e.id}/` : null;
    e.sous_bande = e.ordre.imprecis ? 'Datation imprécise dans le siècle' : null;
  }

  // Evenements associes : (1) episode commun ; (2) identifiant cite dans les
  // textes de l'entree (note d'audit, fiche, correction, note editoriale).
  const parEpisode = new Map();
  for (const e of evenements) for (const k of new Set(e.episodes.map(epKey))) {
    if (!parEpisode.has(k)) parEpisode.set(k, []);
    parEpisode.get(k).push(e.id);
  }
  const liens = new Map(evenements.map((e) => [e.id, new Map()]));
  const lier = (a, b, motif) => {
    if (a === b || !parId.has(a) || !parId.has(b)) return;
    for (const [x, y] of [[a, b], [b, a]]) {
      const m = liens.get(x);
      if (!m.has(y)) m.set(y, new Set());
      m.get(y).add(motif);
    }
  };
  for (const [k, ids] of parEpisode) for (const a of ids) for (const b of ids) lier(a, b, `épisode commun : ${k.split('|')[1]}`);
  const citationsInconnues = [];
  for (const e of evenements) {
    const textes = [e.note_audit, ficheParId.get(e.id)?.brut, ...e.corrections.map((c) => c.motif), e.note_editoriale].filter(Boolean).join('\n');
    for (const m of textes.matchAll(/STP-\d{3}/g)) {
      if (!parId.has(m[0])) citationsInconnues.push({ dans: e.id, cite: m[0] });
      else lier(e.id, m[0], 'identifiant cité dans la notice');
    }
  }
  for (const e of evenements) {
    e.associes = [...liens.get(e.id)].map(([id, motifs]) => ({ id, motifs: [...motifs].sort(), autre_continuite: parId.get(id).continuite !== e.continuite }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  // Statistiques (calculees, jamais saisies).
  const compte = (vals, ordre) => {
    const m = new Map();
    for (const v of vals) m.set(v, (m.get(v) || 0) + 1);
    const arr = [...m].map(([cle, n]) => ({ cle, n }));
    return ordre ? arr.sort((a, b) => ordre.indexOf(a.cle) - ordre.indexOf(b.cle)) : arr.sort((a, b) => b.n - a.n || a.cle.localeCompare(b.cle));
  };
  const cyclesOrdre = [...new Set(evenements.map((e) => e.cycle))];
  const seriesCodes = SERIES.map((s) => s.code);
  const categoriesPresentes = [...new Set(evenements.flatMap((e) => e.categories))].sort();
  const stats = {
    total: evenements.length,
    distincts: distincts.length,
    doublons: evenements.length - distincts.length,
    fiches: distincts.filter((e) => e.fiche).length,
    niveaux: ['A', 'B', 'C'].map((cle) => ({ cle, n: distincts.filter((e) => e.niveau_recoupement === cle).length })),
    cycles: compte(distincts.map((e) => e.cycle), cyclesOrdre).map((c) => ({ ...c, slug: slug(c.cle) })),
    series: compte(distincts.flatMap((e) => e.series), seriesCodes).map((c) => ({ ...c, nom: SERIES.find((s) => s.code === c.cle).nom })),
    categories: compte(distincts.flatMap((e) => e.categories)),
    continuites: compte(distincts.map((e) => e.continuite), Object.keys(CONTINUITES)).map((c) => ({ ...c, nom: CONTINUITES[c.cle] })),
    versions: compte(distincts.map((e) => e.version_entree)),
    precisions: compte(distincts.map((e) => e.ordre.precision), Object.keys(PRECISIONS)).map((c) => ({ ...c, nom: PRECISIONS[c.cle] })),
    max_serie: Math.max(...compte(distincts.flatMap((e) => e.series)).map((c) => c.n)),
    max_categorie: Math.max(...compte(distincts.flatMap((e) => e.categories)).map((c) => c.n)),
    max_cycle: Math.max(...compte(distincts.map((e) => e.cycle)).map((c) => c.n)),
    relations: relations.filter((x) => parId.has(x.de) && parId.has(x.vers)).length,
    sans_relation: sansRel.ids.length,
  };

  const atlas = construireAtlas(distincts, categoriesPresentes);

  return {
    meta: {
      csv: path.relative(ROOT, csvPath), md: path.relative(ROOT, mdPath),
      version: (csvPath.match(/_V(\d+_\d+)_/) || [])[1]?.replace('_', '.') || null,
      etat: editorial.etat, colonnes: header,
    },
    header, records, rejects, evenements, distincts, doublons, relations, fiches, problemesFiches, registre, editorial, stats, atlas,
    citationsInconnues, diffusion, corrections,
    referentiels: { series: SERIES, continuites: CONTINUITES, precisions: PRECISIONS, domaines: DOMAINES },
  };
}

// --- ecriture ---------------------------------------------------------------

const yamlStr = (s) => JSON.stringify(String(s));
const titreFilm = (t) => (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
function ecrire(p, contenu) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, contenu);
}

// Reseau des relations : composantes connexes, mise en couches (une relation
// cause/suite va de gauche a droite ; « meme arc » ne contraint pas l'ordre),
// coordonnees SVG calculees ici pour un rendu statique sans JavaScript.
export function reseau(r) {
  const NW = 250, NH = 60, GX = 80, GY = 18, PAD = 12, PADX = 56, SEUIL = 25, LIGNE = 30;
  const parId = new Map(r.evenements.map((e) => [e.id, e]));
  const rang = (id) => parId.get(id).rang_diegetique;
  const relsDoc = r.relations.filter((x) => parId.has(x.de) && parId.has(x.vers));
  // Liens « episode commun » (associations deja affichees sur les fiches),
  // ajoutes seulement entre evenements qui ont des relations documentees,
  // pour recoudre les arcs sans gonfler le graphe.
  const dansReseau = new Set(relsDoc.flatMap((x) => [x.de, x.vers]));
  const dejaLies = new Set(relsDoc.flatMap((x) => [`${x.de}|${x.vers}`, `${x.vers}|${x.de}`]));
  const communs = [];
  for (const id of [...dansReseau].sort()) for (const a of parId.get(id).associes) {
    if (!dansReseau.has(a.id) || id >= a.id || dejaLies.has(`${id}|${a.id}`)) continue;
    if (!a.motifs.some((m) => m.startsWith('épisode commun'))) continue;
    if (parId.get(a.id).doublon_de || parId.get(id).doublon_de) continue;
    communs.push({ de: id, vers: a.id, type: 'episode_commun', url: null });
  }
  const rels = [...relsDoc, ...communs];

  // Groupes : composantes connexes de TOUTES les relations ; une composante de
  // plus de SEUIL evenements (illisible) est redecoupee en arcs par serie.
  const composantes = (ids, garder) => {
    const voisins = new Map(ids.map((i) => [i, new Set()]));
    for (const x of rels) if (voisins.has(x.de) && voisins.has(x.vers) && garder(x)) { voisins.get(x.de).add(x.vers); voisins.get(x.vers).add(x.de); }
    const vus = new Set(); const out = [];
    for (const id of [...ids].sort()) {
      if (vus.has(id)) continue;
      const pile = [id]; const c = []; vus.add(id);
      while (pile.length) { const n = pile.pop(); c.push(n); for (const v of voisins.get(n)) if (!vus.has(v)) { vus.add(v); pile.push(v); } }
      out.push(c);
    }
    return out;
  };
  const serieP = (id) => parId.get(id).series[0] || 'Film';
  const comps = composantes([...dansReseau], () => true)
    .flatMap((c) => (c.length > SEUIL ? composantes(c, (x) => serieP(x.de) === serieP(x.vers)) : [c]));

  // Etiquette sur deux lignes (coupure aux mots), la seconde tronquee si besoin.
  const deuxLignes = (t) => {
    const mots = t.split(/\s+/); const l = ['', ''];
    let i = 0;
    for (const m of mots) {
      const essai = l[i] ? `${l[i]} ${m}` : m;
      if (essai.length <= LIGNE || !l[i]) l[i] = essai;
      else if (i === 0) { i = 1; l[1] = m; }
      else { l[1] = `${l[1]} ${m}`; }
    }
    if (l[1].length > LIGNE) l[1] = l[1].slice(0, LIGNE - 1).replace(/\s+\S*$/, '') + '…';
    return l.filter(Boolean);
  };

  const sortie = comps.map((ids) => {
    const set = new Set(ids);
    const aretes = rels.filter((x) => set.has(x.de) && set.has(x.vers));
    const externes = relsDoc.filter((x) => (set.has(x.de) || set.has(x.vers)) && !(set.has(x.de) && set.has(x.vers)))
      .map((x) => ({ de: x.de, vers: x.vers, type: x.type, autre: set.has(x.de) ? x.vers : x.de, sortant: set.has(x.de) }));
    // Couche = plus long chemin depuis une source (cause/suite).
    const oriente = (x) => x.type === 'cause' || x.type === 'suite';
    const couche = new Map(ids.map((i) => [i, 0]));
    for (let k = 0; k < ids.length; k++) for (const x of aretes.filter(oriente)) {
      if (couche.get(x.vers) < couche.get(x.de) + 1) couche.set(x.vers, couche.get(x.de) + 1);
    }
    // Un evenement sans relation orientee (seulement « meme arc » ou episode
    // commun) n'est pas « anterieur » : il rejoint la couche de son partenaire
    // oriente, a defaut celle de l'evenement oriente le plus proche dans la
    // chronologie fictive ; dans un groupe sans aucune relation orientee, les
    // evenements sont repartis en colonnes de 6 dans l'ordre de la chronologie.
    const orientes = new Set(aretes.filter(oriente).flatMap((x) => [x.de, x.vers]));
    const libres = ids.filter((i) => !orientes.has(i));
    if (orientes.size) {
      for (const id of libres) {
        const partenaires = aretes.filter((x) => x.de === id || x.vers === id).map((x) => (x.de === id ? x.vers : x.de)).filter((p) => orientes.has(p));
        const ref = partenaires.length ? partenaires : [...orientes];
        const proche = ref.sort((a, b) => Math.abs(rang(a) - rang(id)) - Math.abs(rang(b) - rang(id)) || a.localeCompare(b))[0];
        couche.set(id, couche.get(proche));
      }
    } else {
      [...ids].sort((a, b) => rang(a) - rang(b)).forEach((id, j) => couche.set(id, Math.floor(j / 6)));
    }
    const nCouches = Math.max(...couche.values()) + 1;
    // Ordre dans chaque couche : chronologie fictive, puis quelques passes de
    // barycentre (moyenne des positions des voisins) pour limiter les croisements.
    const parCouche = [...Array(nCouches)].map((_, c) => ids.filter((i) => couche.get(i) === c).sort((a, b) => rang(a) - rang(b)));
    const voisinsDe = (id) => aretes.filter((x) => x.de === id || x.vers === id).map((x) => (x.de === id ? x.vers : x.de));
    for (let passe = 0; passe < 4; passe++) {
      const place = new Map(parCouche.flatMap((l) => l.map((id, j) => [id, j / Math.max(1, l.length - 1)])));
      for (const l of parCouche) {
        const bary = new Map(l.map((id) => {
          const v = voisinsDe(id).filter((w) => couche.get(w) !== couche.get(id));
          return [id, v.length ? v.reduce((s, w) => s + place.get(w), 0) / v.length : place.get(id)];
        }));
        l.sort((a, b) => bary.get(a) - bary.get(b) || rang(a) - rang(b));
      }
    }
    const maxL = Math.max(...parCouche.map((l) => l.length));
    const pos = new Map();
    parCouche.forEach((l, c) => l.forEach((id, j) => {
      const off = ((maxL - l.length) * (NH + GY)) / 2;
      pos.set(id, { x: PADX + c * (NW + GX), y: PAD + off + j * (NH + GY) });
    }));
    const noeuds = ids.map((id) => {
      const e = parId.get(id); const p = pos.get(id);
      // Identifiant en petit sur la premiere ligne, intitule sur deux lignes.
      return { id, x: p.x, y: p.y, w: NW, h: NH, tx: p.x + 10, id_y: p.y + 16,
        lignes: deuxLignes(e.event).map((t, k) => ({ t, y: p.y + 34 + k * 16 })), titre_complet: e.event, niv: e.niveau_recoupement, cycle: e.cycle };
    }).sort((a, b) => rang(a.id) - rang(b.id));
    // Ports : les aretes qui arrivent sur (ou partent d') un meme cote d'une
    // boite sont reparties sur sa hauteur, dans l'ordre vertical de l'autre bout.
    const ports = new Map();
    const port = (id, cote, autre) => {
      const k = `${id}|${cote}`;
      if (!ports.has(k)) ports.set(k, []);
      ports.get(k).push(autre);
    };
    const cotes = (x) => {
      const a = pos.get(x.de), b = pos.get(x.vers);
      if (Math.abs(a.x - b.x) < 1) return ['g', 'g'];
      return a.x < b.x ? ['d', 'g'] : ['g', 'd'];
    };
    for (const x of aretes) { const [ca, cb] = cotes(x); port(x.de, ca, x.vers); port(x.vers, cb, x.de); }
    for (const l of ports.values()) l.sort((a, b) => pos.get(a).y - pos.get(b).y);
    const yPort = (id, cote, autre) => {
      const l = ports.get(`${id}|${cote}`); const k = l.indexOf(autre);
      return pos.get(id).y + (NH * (k + 1)) / (l.length + 1);
    };
    const chemins = aretes.map((x) => {
      const a = pos.get(x.de), b = pos.get(x.vers);
      const [ca, cb] = cotes(x);
      const ya = yPort(x.de, ca, x.vers), yb = yPort(x.vers, cb, x.de);
      let d;
      if (ca === 'g' && cb === 'g') { // meme couche : arc dans la marge de gauche (hors des etiquettes)
        const ecart = Math.min(48, 18 + Math.abs(yb - ya) / 6);
        d = `M${a.x},${ya} C${a.x - ecart},${ya} ${b.x - ecart},${yb} ${b.x},${yb}`;
      } else {
        const xa = ca === 'd' ? a.x + NW : a.x, xb = cb === 'd' ? b.x + NW : b.x, m = (xa + xb) / 2;
        const fin = xb > xa ? xb - 4 : xb + 4; // laisse la place de la pointe de fleche
        d = `M${xa},${ya} C${m},${ya} ${m},${yb} ${fin},${yb}`;
      }
      return { de: x.de, vers: x.vers, type: x.type, d, url: x.url };
    });
    // Titre : evenement le plus connecte du groupe (le pivot), en entier.
    const degre = (id) => aretes.filter((x) => x.de === id || x.vers === id).length + relsDoc.filter((x) => x.de === id || x.vers === id).length / 100;
    const pivot = [...ids].sort((a, b) => degre(b) - degre(a) || rang(a) - rang(b))[0];
    return { titre: parId.get(pivot).event, taille: ids.length, noeuds, aretes: chemins, externes,
      largeur: PADX + PAD + nCouches * NW + (nCouches - 1) * GX, hauteur: PAD * 2 + maxL * NH + (maxL - 1) * GY };
  }).sort((a, b) => b.taille - a.taille);
  sortie.forEach((c, i) => {
    c.numero = i + 1;
    c.cle = [...c.noeuds.map((n) => n.id)].sort()[0]; // cle stable : plus petit identifiant du groupe
    c.ids = c.noeuds.map((n) => n.id);
  });
  const groupeDe = new Map(sortie.flatMap((c) => c.ids.map((id) => [id, c.cle])));
  sortie.forEach((c) => {
    for (const x of c.externes) x.groupe = groupeDe.get(x.autre);
    c.series = [...new Set(c.noeuds.flatMap((n) => parId.get(n.id).series))];
    c.series_noms = c.series.map((s) => (s === 'Film' ? 'films' : (SERIES.find((x) => x.code === s) || { nom: s }).nom));
    c.nb_relations = c.aretes.filter((a) => a.type !== 'episode_commun').length;
  });
  return { composantes: sortie, noeuds: sortie.reduce((s, c) => s + c.taille, 0), relations: relsDoc.length, liens_episode: communs.length,
    seuil_decoupe: SEUIL };
}

// Donnees des graphiques : matrices et repartitions, quantifiees en 5 classes
// pour le codage couleur (une seule teinte ; 0 = case vide).
export function graphiques(r) {
  const ev = r.distincts;
  const cats = r.stats.categories.map((c) => c.cle);
  const series = r.stats.series.map((s) => ({ code: s.cle, nom: s.nom }));
  // Cartes de chaleur : la couleur code la PART de la categorie parmi les
  // evenements de la colonne (serie ou decennie), sur une echelle commune aux
  // deux cartes ; le nombre brut reste ecrit dans la case. Sans cela, la
  // couleur ne montrerait que la taille de chaque serie.
  const BORNES = [10, 20, 35, 50]; // classes : ]0;10] ]10;20] ]20;35] ]35;50] ]50;100] (en %)
  const classe = (pct) => (pct === 0 ? 0 : 1 + BORNES.filter((b) => pct > b).length);
  const matrice = (lignes, colonnes, test) => {
    const effectifs = colonnes.map((c) => ev.filter((e) => test(e, c)).length);
    const m = lignes.map((l) => colonnes.map((c) => ev.filter((e) => e.categories.includes(l) && test(e, c)).length));
    const max = Math.max(1, ...m.flat());
    return {
      max, effectifs,
      lignes: lignes.map((l, i) => ({ cle: l, total: m[i].reduce((a, b) => a + b, 0), cellules: m[i].map((n, j) => {
        const pct = effectifs[j] ? Math.round((100 * n) / effectifs[j]) : 0;
        return { n, pct, q: classe(effectifs[j] ? (100 * n) / effectifs[j] : 0) };
      }) })),
    };
  };
  const decennie = (e) => (e.diffusion[0]?.date ? e.diffusion[0].date.slice(0, 3) + '0' : null);
  const decennies = [...new Set(ev.map(decennie).filter(Boolean))].sort();
  const parSerie = matrice(cats, series.map((s) => s.code), (e, c) => e.series.includes(c));
  const parDecennie = matrice(cats, decennies, (e, d) => decennie(e) === d);
  const niveaux = series.map((s) => {
    const sel = ev.filter((e) => e.series.includes(s.code));
    return { ...s, total: sel.length, A: sel.filter((e) => e.niveau_recoupement === 'A').length, B: sel.filter((e) => e.niveau_recoupement === 'B').length, C: sel.filter((e) => e.niveau_recoupement === 'C').length };
  });
  const maxNiv = Math.max(...niveaux.map((n) => n.total));
  for (const n of niveaux) {
    for (const k of ['A', 'B', 'C']) n['pct_' + k] = +(100 * n[k] / maxNiv).toFixed(2);
    n.part_A = n.total ? Math.round((100 * n.A) / n.total) : 0; // part des A dans la serie
  }
  return {
    bornes_pct: BORNES,
    categories: cats, series, decennies: decennies.map((d) => `${d}s`),
    par_serie: parSerie, par_decennie: { ...parDecennie, sans_date: ev.filter((e) => !decennie(e)).length },
    niveaux_par_serie: niveaux, max_niveaux: maxNiv,
  };
}

// Adresse publique du site (url + baseurl de _config.yml), pour les canoniques absolus.
let SITE_URL;
function siteUrl() {
  if (SITE_URL) return SITE_URL;
  const cfg = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
  const v = (k) => (cfg.match(new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, 'm')) || [])[1]?.trim() || '';
  return (SITE_URL = v('url').replace(/\/$/, '') + v('baseurl'));
}

// Date d'une version du corpus : journal data/corrections/V0.N.json, sinon date
// portee par le nom du fichier source (V0.3 : premiere publication).
let DATES_VERSIONS;
function dateVersion(v) {
  if (!DATES_VERSIONS) {
    DATES_VERSIONS = new Map();
    for (const f of fs.readdirSync(path.join(ROOT, 'data/source'))) {
      const m = /_V(\d+)_(\d+)_(\d{4}-\d{2}-\d{2})\.csv$/.exec(f);
      if (m) DATES_VERSIONS.set(`V${m[1]}.${m[2]}`, m[3]);
    }
    const dc = path.join(ROOT, 'data/corrections');
    if (fs.existsSync(dc)) for (const f of fs.readdirSync(dc).filter((x) => /^V\d+\.\d+\.json$/.test(x))) {
      const j = JSON.parse(fs.readFileSync(path.join(dc, f), 'utf8'));
      if (j.version && j.date) DATES_VERSIONS.set(j.version, j.date);
    }
  }
  return DATES_VERSIONS.get(v) || null;
}

function pageEvenement(e) {
  // Metadonnees : titre et description sans sigles, type Article, dates reelles
  // (premiere publication = V0.3 ; modification = version de la derniere revision).
  const libelle = oeuvres(e, 2);
  const desc = `${libelle.charAt(0).toUpperCase()}${libelle.slice(1)} — ${e.period} : ${e.politics}`;
  const description = desc.length > 158 ? desc.slice(0, 157).replace(/\s+\S*$/, '') + '…' : desc;
  const publie = dateVersion('V0.3');
  const revise = dateVersion((/^V\d+\.\d+/.exec(e.version_entree) || [])[0]) || publie;
  const serieTitre = e.series.length === 1 ? (e.series[0] === 'Film' ? 'film Star Trek' : nomComplet(e.series[0])) : 'Star Trek';
  return [
    '---',
    '# Fichier GENERE par scripts/import.mjs. Ne pas modifier a la main :',
    '# corriger la source dans data/source/ puis relancer l\'import.',
    'layout: evenement',
    `stp: ${e.id}`,
    // Permalien explicite : Jekyll 3 met :name en minuscules.
    `permalink: /evenements/${e.id}/`,
    `title: ${yamlStr(`${e.event} — ${serieTitre} (${e.id})`)}`,
    `description: ${yamlStr(description)}`,
    `date: ${publie}`,
    `last_modified_at: ${revise > publie ? revise : publie}`,
    'seo:',
    '  type: Article',
    // Doublon secondaire : canonique vers la principale (jekyll-seo-tag) et hors du plan du site.
    ...(e.doublon_de ? [`canonical_url: ${siteUrl()}/evenements/${e.doublon_de.id}/`, 'sitemap: false'] : []),
    '---',
    '',
  ].join('\n');
}

function rapportImport(r) {
  const L = [];
  L.push(`# Rapport d'import`, '', `> Généré par \`scripts/import.mjs\`. Sources : \`${r.meta.csv}\`, \`${r.meta.md}\`.`, '');
  L.push('## Comptages', '');
  L.push(`| Élément | Valeur |`, `|---|---|`);
  L.push(`| Lignes de données lues dans le CSV | ${r.records.length + r.rejects.length} |`);
  L.push(`| Entrées importées | ${r.evenements.length} |`);
  L.push(`| Lignes rejetées | ${r.rejects.length} |`);
  L.push(`| Colonnes | ${r.header.length} (${r.header.map((h) => '`' + h + '`').join(', ')}) |`);
  L.push(`| Fiches approfondies extraites du Markdown | ${r.fiches.length} |`);
  L.push(`| Notices du registre intégral (Markdown) | ${r.registre.size} |`);
  L.push(`| Corrections documentées (Markdown) | ${[...r.corrections.values()].flat().length} |`);
  L.push(`| Pages d'événement générées | ${r.evenements.length} |`, '');
  if (r.rejects.length) {
    L.push('## Lignes rejetées', '');
    for (const x of r.rejects) L.push(`- ligne ${x.line} : ${x.reason}`);
    L.push('');
  }
  L.push('## Répartition par niveau', '');
  for (const n of r.stats.niveaux) L.push(`- ${n.cle} : ${n.n}`);
  L.push('', '## Références de source non rattachées à une série', '', 'Segments du champ `source` sans sigle de série reconnu (laissés tels quels, non interprétés) :', '');
  const nr = r.evenements.filter((e) => e.references_non_rattachees.length);
  if (!nr.length) L.push('- aucun');
  for (const e of nr) L.push(`- ${e.id} : ${e.references_non_rattachees.map((s) => '« ' + s + ' »').join(', ')}`);
  L.push('', '## Classement de continuité (règle dérivée)', '');
  for (const e of r.evenements.filter((x) => x.continuite !== 'principale')) L.push(`- ${e.id} → ${r.referentiels.continuites[e.continuite]} (${e.continuite_regle})`);
  L.push('', '## Dates de diffusion rattachées', '');
  const avecDates = r.evenements.filter((e) => e.diffusion.length);
  L.push(`${avecDates.length} entrées ont au moins une date d'épisode vérifiée (source : \`data/diffusion.json\`).`, '');
  return L.join('\n') + '\n';
}

export function ecrireSorties(r) {
  const D = (f) => path.join(ROOT, '_data', f);
  const evenementsData = r.evenements.map(({ ligne_csv, ...e }) => e);
  ecrire(D('evenements.json'), JSON.stringify(evenementsData, null, 1) + '\n');
  const fichesData = Object.fromEntries(r.fiches.map(({ brut, ligne, ...f }) => [f.id, f]));
  ecrire(D('fiches.json'), JSON.stringify(fichesData, null, 1) + '\n');
  ecrire(D('stats.json'), JSON.stringify(r.stats, null, 1) + '\n');
  ecrire(D('atlas.json'), JSON.stringify(r.atlas, null, 1) + '\n');
  ecrire(D('editorial.json'), JSON.stringify({ ...r.editorial, meta: r.meta }, null, 1) + '\n');
  // Chronologie de diffusion : series (et films regroupes) ordonnees par
  // premiere diffusion verifiee ; une serie sans date verifiee va en fin.
  // Chronologie de diffusion EXHAUSTIVE : toutes les series du catalogue
  // (data/diffusion.json), y compris celles sans entree, et tous les films.
  const diff = r.diffusion;
  const films = (diff.films || []).slice().sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
    .map((f) => ({ ...f, evenements: (f.titre_corpus ? r.distincts.filter((e) => e.episodes.some((p) => p.serie === 'Film' && titreFilm(p.titre) === titreFilm(f.titre_corpus))) : []).map((e) => e.id) }));
  const filmsDates = films.filter((f) => f.date);
  const parSerie = (code) => r.distincts.filter((e) => e.series.includes(code))
    .map((e) => ({ id: e.id, date: e.diffusion[0]?.date || null }))
    .sort((x, y) => (x.date || '9999').localeCompare(y.date || '9999') || x.id.localeCompare(y.id));
  const blocs = [
    ...(diff.series || []).map((s) => ({ code: s.code, nom: s.nom, diffuseur: s.diffuseur || null, debut: s.debut || null, fin: s.fin || null,
      statut: s.statut || null, source_url: s.source_url || null, note: s.note || '', saisons: s.saisons || [] })),
    ...(filmsDates.length ? [{ code: 'Film', nom: 'Films', diffuseur: null, debut: filmsDates[0].date, fin: filmsDates[filmsDates.length - 1].date, statut: null,
      source_url: null, note: 'Bornes calculées à partir des films datés.', saisons: [] }] : []),
  ].sort((a, b) => (a.debut || '9999').localeCompare(b.debut || '9999'))
    .map((b) => ({ ...b, evenements: parSerie(b.code) }));
  const sansSerie = r.stats.series.filter((s) => !blocs.some((b) => b.code === s.cle)).map((s) => s.cle);
  if (sansSerie.length) console.warn('Séries citées absentes du catalogue de diffusion :', sansSerie.join(', '));
  ecrire(D('diffusion.json'), JSON.stringify({ releve_le: diff.releve_le || null, blocs, films }, null, 1) + '\n');
  ecrire(D('referentiels.json'), JSON.stringify(r.referentiels, null, 1) + '\n');

  // Pages : une par identifiant. Les pages d'identifiants disparus ne sont PAS
  // supprimees ici (une URL publiee ne doit pas disparaitre) : la validation
  // echoue et demande une decision humaine.
  const dir = path.join(ROOT, '_evenements');
  fs.mkdirSync(dir, { recursive: true });
  for (const e of r.evenements) ecrire(path.join(dir, `${e.id}.md`), pageEvenement(e));

  // Graphiques comparatifs (calcules, jamais saisis), sur les evenements distincts.
  ecrire(D('graphiques.json'), JSON.stringify(graphiques(r), null, 1) + '\n');
  const res = reseau(r);
  ecrire(D('reseau.json'), JSON.stringify(res, null, 1) + '\n');
  // Une page par groupe du reseau (/reseau/STP-NNN/), regeneree a chaque import.
  const dirR = path.join(ROOT, 'reseau');
  fs.mkdirSync(dirR, { recursive: true });
  for (const f of fs.readdirSync(dirR)) {
    const p = path.join(dirR, f);
    if (/^STP-\d{3}\.md$/.test(f) && fs.readFileSync(p, 'utf8').includes('GENERE par scripts/import.mjs')) fs.unlinkSync(p);
  }
  // Adresses deja publiees (registre qui ne fait que grandir) : une cle qui
  // n'est plus tete de groupe devient une page de renvoi vers l'arc qui
  // contient desormais cet evenement.
  const clesP = path.join(ROOT, 'data/reseau-cles-publiees.json');
  const clesAvant = fs.existsSync(clesP) ? JSON.parse(fs.readFileSync(clesP, 'utf8')) : [];
  const clesMaintenant = res.composantes.map((c) => c.cle);
  for (const k of clesAvant.filter((k) => !clesMaintenant.includes(k))) {
    // Evenement devenu doublon secondaire : renvoyer a l'arc de sa principale.
    const k2 = r.evenements.find((e) => e.id === k)?.doublon_de?.id || k;
    const g = res.composantes.find((c) => c.ids.includes(k)) || res.composantes.find((c) => c.ids.includes(k2));
    ecrire(path.join(dirR, `${k}.md`), ['---', '# Fichier GENERE par scripts/import.mjs (renvoi d\'une adresse deja publiee).', 'layout: reseau-renvoi',
      `cible: ${g ? g.cle : 'null'}`, `stp: ${k}`, `title: ${yamlStr(`Réseau — arc déplacé (${k})`)}`, 'sitemap: false',
      // jekyll-redirect-from (liste blanche) produit la page de renvoi : canonique unique, refresh dans <head>, noindex.
      `redirect_to: /reseau/${g ? g.cle + '/' : ''}`,
      `permalink: /reseau/${k}/`, 'nav: reseau', '---', ''].join('\n'));
  }
  ecrire(clesP, JSON.stringify([...new Set([...clesAvant, ...clesMaintenant])].sort(), null, 1) + '\n');
  for (const c of res.composantes) {
    ecrire(path.join(dirR, `${c.cle}.md`), ['---', '# Fichier GENERE par scripts/import.mjs.', 'layout: reseau-groupe', `groupe: ${c.cle}`,
      `title: ${yamlStr(`Arc « ${c.titre} » (${c.series_noms.join(', ')}) — réseau des relations`)}`,
      `description: ${yamlStr(`Graphe des relations documentées entre ${c.taille} événements politiques de Star Trek (${c.series.join(', ')}) : causes, suites et arcs narratifs.`)}`,
      `permalink: /reseau/${c.cle}/`, 'nav: reseau', '---', ''].join('\n'));
  }

  // Analyses fiction / histoire : une page par fiche approfondie (sauf STP-006,
  // qui a sa page editoriale propre). Contenu = volets de la fiche + paragraphe
  // « Lignes de force » de la periode de diffusion de la serie ; rien de redige.
  const periodes = [...(r.editorial.lignes_de_force?.markdown || '').matchAll(/^\*\*(\d{4}–\d{4}) \(([^)]+)\)\.\*\* (.+)$/gm)]
    .map((m) => ({ bornes: m[1], codes: m[2].split(/[\/,]\s*|\s+/).filter(Boolean), texte: m[3].trim() }));
  ecrire(D('periodes.json'), JSON.stringify(periodes, null, 1) + '\n');
  for (const f of r.fiches) {
    if (ANALYSES_REDIGEES[f.id]) continue;
    const e = r.evenements.find((x) => x.id === f.id);
    // Periode : celle de la serie de l'episode principal (premier episode cite) ;
    // a defaut (films, TAS, Short Treks), celle qui contient l'annee de premiere
    // diffusion, signalee comme rattachement par l'annee.
    const seriePrincipale = e.episodes[0]?.serie || e.series[0];
    let per = periodes.find((p) => p.codes.includes(seriePrincipale)) || periodes.find((p) => e.series.some((s) => p.codes.includes(s)));
    let parAnnee = false;
    if (!per && e.diffusion?.length) {
      const an = +e.diffusion[0].date.slice(0, 4);
      per = periodes.find((p) => { const [a, b] = p.bornes.split('–').map(Number); return an >= a && an <= b; });
      parAnnee = !!per;
    }
    ecrire(path.join(ROOT, 'analyses', `${f.id}.md`), ['---', '# Fichier GENERE par scripts/import.mjs.', 'layout: analyse', `stp: ${f.id}`,
      `periode_diffusion: ${per ? yamlStr(per.bornes) : 'null'}`, `periode_par_annee: ${parAnnee}`,
      `title: ${yamlStr(`${e.event} : fiction, contexte et limites`)}`,
      `description: ${yamlStr(`Analyse de ${f.id} (${e.source}) : faits de la fiction, contexte de diffusion, parallèle réel et limites de l’analogie.`)}`,
      `permalink: /analyses/${f.id}/`, 'nav: analyses', '---', ''].join('\n'));
  }

  // Une page par domaine de l'atlas.
  for (const d of r.atlas.domaines) {
    ecrire(path.join(ROOT, 'atlas', `${d.slug}.md`), ['---', '# Fichier GENERE par scripts/import.mjs.', 'layout: domaine', `domaine: ${d.slug}`,
      `title: ${yamlStr(d.nom)}`, `description: ${yamlStr(d.intro ? (d.intro.length > 158 ? d.intro.slice(0, 157).replace(/\s+\S*$/, '') + '…' : d.intro) : `Atlas thématique — ${d.nom} : événements de la base rattachés par catégorie, table de correspondance publiée.`)}`,
      `permalink: /atlas/${d.slug}/`, '---', ''].join('\n'));
  }

  // Registre des identifiants deja publies (union, jamais diminue).
  const pubPath = path.join(ROOT, 'data/ids-publies.json');
  const avant = fs.existsSync(pubPath) ? JSON.parse(fs.readFileSync(pubPath, 'utf8')) : [];
  const union = [...new Set([...avant, ...r.evenements.map((e) => e.id)])].sort();
  ecrire(pubPath, JSON.stringify(union, null, 1) + '\n');

  ecrire(path.join(ROOT, 'docs/rapport-import.md'), rapportImport(r));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const def = dernieresSources();
  if (process.argv[2] && !process.argv[3]) { console.error('Donner le CSV ET le Markdown, ou aucun des deux.'); process.exit(2); }
  const csv = process.argv[2] ? path.resolve(process.argv[2]) : def.csv;
  const md = process.argv[3] ? path.resolve(process.argv[3]) : def.md;
  if (!csv || !md) { console.error('Sources introuvables dans data/source/'); process.exit(2); }
  const r = importer(csv, md);
  ecrireSorties(r);
  console.log(`Import : ${r.evenements.length} entrées, ${r.rejects.length} rejet(s), ${r.fiches.length} fiches, ${r.problemesFiches.length} problème(s) de fiche.`);
  console.log('Lancer ensuite : node scripts/validate.mjs');
}
