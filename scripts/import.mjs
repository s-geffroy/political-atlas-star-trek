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
import { SERIES, CONTINUITES, PRECISIONS, episodesDe, continuite, ordreDiegetique, slug, epKey } from './lib/derive.mjs';
import { construireAtlas, DOMAINES } from './lib/atlas.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'data/source');
export const COLONNES = ['id', 'cycle', 'period', 'event', 'source', 'politics', 'categories_politiques', 'niveau_recoupement', 'nature_source', 'url_source', 'note_audit', 'version_entree'];

export function dernieresSources() {
  const files = fs.readdirSync(SRC).filter((f) => /^Star_Trek_Atlas_Politique_V\d+_\d+_.+\.(csv|md)$/.test(f));
  const version = (f) => f.match(/_V(\d+)_(\d+)_/).slice(1).map(Number);
  const cmp = (a, b) => { const [x, y] = [version(a), version(b)]; return x[0] - y[0] || x[1] - y[1] || a.localeCompare(b); };
  const csv = files.filter((f) => f.endsWith('.csv')).sort(cmp).pop();
  const md = files.filter((f) => f.endsWith('.md')).sort(cmp).pop();
  return { csv: csv && path.join(SRC, csv), md: md && path.join(SRC, md) };
}

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
  const siecle = Math.floor((o.cle - 1) / 100) + 1;
  return `${romain(siecle)}e siècle`;
}

export function lireDoublons() {
  const p = path.join(ROOT, 'data/doublons.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).doublons : [];
}

export function lireRelations() {
  const p = path.join(ROOT, 'data/relations.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).relations : [];
}

export function importer(csvPath, mdPath) {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const md = fs.readFileSync(mdPath, 'utf8');
  const { header, records, rejects } = readRecords(csvText, ';');
  const { fiches, problems: problemesFiches } = parseFiches(md);
  const registre = parseRegistre(md);
  const editorial = sectionsEditoriales(md);
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
  for (const e of evenements) e.relations = { sortantes: [], entrantes: [] };
  for (const x of relations) {
    if (!parId.has(x.de) || !parId.has(x.vers)) continue;
    parId.get(x.de).relations.sortantes.push({ id: x.vers, type: x.type, url: x.url, justification: x.justification });
    parId.get(x.vers).relations.entrantes.push({ id: x.de, type: x.type, url: x.url, justification: x.justification });
  }

  // Rang diegetique (tri seulement) et bande d'affichage (siecle de la cle).
  const groupe = (o) => (o.precision === 'passe_lointain' ? 0 : o.cle == null ? 2 : 1);
  [...evenements]
    .sort((a, b) => groupe(a.ordre) - groupe(b.ordre) || (a.ordre.cle ?? 0) - (b.ordre.cle ?? 0) || a.id.localeCompare(b.id))
    .forEach((e, i) => { e.rang_diegetique = i + 1; });
  for (const e of evenements) e.bande = bande(e.ordre);

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
  const NW = 210, NH = 46, GX = 70, GY = 18, PAD = 12, PADX = 56;
  const parId = new Map(r.evenements.map((e) => [e.id, e]));
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
  const voisins = new Map();
  for (const x of rels) for (const [a, b] of [[x.de, x.vers], [x.vers, x.de]]) {
    if (!voisins.has(a)) voisins.set(a, new Set());
    voisins.get(a).add(b);
  }
  const vus = new Set(); const comps = [];
  for (const id of [...voisins.keys()].sort()) {
    if (vus.has(id)) continue;
    const pile = [id]; const c = [];
    vus.add(id);
    while (pile.length) { const n = pile.pop(); c.push(n); for (const v of voisins.get(n)) if (!vus.has(v)) { vus.add(v); pile.push(v); } }
    comps.push(c);
  }
  const tronque = (t, n) => (t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t);
  const sortie = comps.map((ids) => {
    const set = new Set(ids);
    const aretes = rels.filter((x) => set.has(x.de));
    // Couche = plus long chemin depuis une source (cause/suite) ; meme_arc : meme couche minimale.
    const couche = new Map(ids.map((i) => [i, 0]));
    for (let k = 0; k < ids.length; k++) for (const x of aretes) {
      if (x.type === 'meme_arc' || x.type === 'episode_commun') continue;
      if (couche.get(x.vers) < couche.get(x.de) + 1) couche.set(x.vers, couche.get(x.de) + 1);
    }
    const nCouches = Math.max(...couche.values()) + 1;
    const parCouche = [...Array(nCouches)].map((_, c) => ids.filter((i) => couche.get(i) === c)
      .sort((a, b) => parId.get(a).rang_diegetique - parId.get(b).rang_diegetique));
    const maxL = Math.max(...parCouche.map((l) => l.length));
    const pos = new Map();
    parCouche.forEach((l, c) => l.forEach((id, j) => {
      const off = ((maxL - l.length) * (NH + GY)) / 2;
      pos.set(id, { x: PADX + c * (NW + GX), y: PAD + off + j * (NH + GY) });
    }));
    const noeuds = ids.map((id) => {
      const e = parId.get(id); const p = pos.get(id);
      return { id, x: p.x, y: p.y, w: NW, h: NH, titre: tronque(e.event, 30), titre_complet: e.event, niv: e.niveau_recoupement, cycle: e.cycle };
    }).sort((a, b) => parId.get(a.id).rang_diegetique - parId.get(b.id).rang_diegetique);
    const chemins = aretes.map((x) => {
      const a = pos.get(x.de), b = pos.get(x.vers);
      let d;
      if (Math.abs(a.x - b.x) < 1) { // meme couche : arc dans la marge de gauche (hors des etiquettes)
        const x0 = a.x, y0 = a.y + NH / 2, y1 = b.y + NH / 2;
        const ecart = Math.min(48, 18 + Math.abs(y1 - y0) / 6);
        d = `M${x0},${y0} C${x0 - ecart},${y0} ${x0 - ecart},${y1} ${x0},${y1}`;
      } else {
        const [g, dr] = a.x < b.x ? [a, b] : [b, a];
        const x0 = g.x + NW, y0 = g.y + NH / 2, x1 = dr.x, y1 = dr.y + NH / 2, m = (x0 + x1) / 2;
        d = a.x < b.x ? `M${x0},${y0} C${m},${y0} ${m},${y1} ${x1 - 4},${y1}` : `M${x1},${y1} C${m},${y1} ${m},${y0} ${x0 + 4},${y0}`;
      }
      return { de: x.de, vers: x.vers, type: x.type, d, url: x.url };
    });
    const cycles = {};
    for (const id of ids) cycles[parId.get(id).cycle] = (cycles[parId.get(id).cycle] || 0) + 1;
    const cycle = Object.entries(cycles).sort((a, b) => b[1] - a[1])[0][0];
    return { titre: cycle, taille: ids.length, noeuds, aretes: chemins,
      largeur: PADX + PAD + nCouches * NW + (nCouches - 1) * GX, hauteur: PAD * 2 + maxL * NH + (maxL - 1) * GY };
  }).sort((a, b) => b.taille - a.taille);
  sortie.forEach((c, i) => {
    c.numero = i + 1;
    c.cle = [...c.noeuds.map((n) => n.id)].sort()[0]; // cle stable : plus petit identifiant du groupe
    c.ids = c.noeuds.map((n) => n.id);
    c.series = [...new Set(c.noeuds.flatMap((n) => parId.get(n.id).series))];
    c.nb_relations = c.aretes.filter((a) => a.type !== 'episode_commun').length;
  });
  return { composantes: sortie, noeuds: sortie.reduce((s, c) => s + c.taille, 0), relations: relsDoc.length, liens_episode: communs.length };
}

// Donnees des graphiques : matrices et repartitions, quantifiees en 5 classes
// pour le codage couleur (une seule teinte ; 0 = case vide).
export function graphiques(r) {
  const ev = r.distincts;
  const q = (n, max) => (n === 0 ? 0 : Math.max(1, Math.ceil((5 * n) / max)));
  const cats = r.stats.categories.map((c) => c.cle);
  const series = r.stats.series.map((s) => ({ code: s.cle, nom: s.nom }));
  const matrice = (lignes, colonnes, test) => {
    const m = lignes.map((l) => colonnes.map((c) => ev.filter((e) => e.categories.includes(l) && test(e, c)).length));
    const max = Math.max(1, ...m.flat());
    return { max, lignes: lignes.map((l, i) => ({ cle: l, total: m[i].reduce((a, b) => a + b, 0), cellules: m[i].map((n) => ({ n, q: q(n, max) })) })) };
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
  for (const n of niveaux) for (const k of ['A', 'B', 'C']) n['pct_' + k] = +(100 * n[k] / maxNiv).toFixed(2);
  return {
    categories: cats, series, decennies: decennies.map((d) => `${d}s`),
    par_serie: parSerie, par_decennie: { ...parDecennie, sans_date: ev.filter((e) => !decennie(e)).length },
    niveaux_par_serie: niveaux, max_niveaux: maxNiv,
  };
}

function pageEvenement(e) {
  const resume = e.politics.length > 155 ? e.politics.slice(0, 154).replace(/\s+\S*$/, '') + '…' : e.politics;
  return [
    '---',
    '# Fichier GENERE par scripts/import.mjs. Ne pas modifier a la main :',
    '# corriger la source dans data/source/ puis relancer l\'import.',
    'layout: evenement',
    `stp: ${e.id}`,
    // Permalien explicite : Jekyll 3 met :name en minuscules.
    `permalink: /evenements/${e.id}/`,
    `title: ${yamlStr(`${e.id} — ${e.event}`)}`,
    `description: ${yamlStr(`${e.period} · ${e.source}. ${resume}`)}`,
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
  for (const c of res.composantes) {
    ecrire(path.join(dirR, `${c.cle}.md`), ['---', '# Fichier GENERE par scripts/import.mjs.', 'layout: reseau-groupe', `groupe: ${c.cle}`,
      `title: ${yamlStr(`Réseau — ${c.titre} (${c.taille} événements)`)}`,
      `description: ${yamlStr(`Graphe des relations documentées entre ${c.taille} événements politiques de Star Trek (${c.series.join(', ')}) : causes, suites et arcs narratifs.`)}`,
      `permalink: /reseau/${c.cle}/`, 'nav: graphiques', '---', ''].join('\n'));
  }

  // Analyses fiction / histoire : une page par fiche approfondie (sauf STP-006,
  // qui a sa page editoriale propre). Contenu = volets de la fiche + paragraphe
  // « Lignes de force » de la periode de diffusion de la serie ; rien de redige.
  const periodes = [...(r.editorial.lignes_de_force?.markdown || '').matchAll(/^\*\*(\d{4}–\d{4}) \(([^)]+)\)\.\*\* (.+)$/gm)]
    .map((m) => ({ bornes: m[1], codes: m[2].split(/[\/,]\s*|\s+/).filter(Boolean), texte: m[3].trim() }));
  ecrire(D('periodes.json'), JSON.stringify(periodes, null, 1) + '\n');
  for (const f of r.fiches) {
    if (f.id === 'STP-006') continue;
    const e = r.evenements.find((x) => x.id === f.id);
    const per = periodes.find((p) => e.series.some((s) => p.codes.includes(s)));
    ecrire(path.join(ROOT, 'analyses', `${f.id}.md`), ['---', '# Fichier GENERE par scripts/import.mjs.', 'layout: analyse', `stp: ${f.id}`,
      `periode_diffusion: ${per ? yamlStr(per.bornes) : 'null'}`,
      `title: ${yamlStr(`${e.event} : fiction, contexte et limites`)}`,
      `description: ${yamlStr(`Analyse de ${f.id} (${e.source}) : faits de la fiction, contexte de diffusion, parallèle réel et limites de l’analogie.`)}`,
      `permalink: /analyses/${f.id}/`, 'nav: analyses', '---', ''].join('\n'));
  }

  // Une page par domaine de l'atlas.
  for (const d of r.atlas.domaines) {
    ecrire(path.join(ROOT, 'atlas', `${d.slug}.md`), ['---', '# Fichier GENERE par scripts/import.mjs.', 'layout: domaine', `domaine: ${d.slug}`,
      `title: ${yamlStr(d.nom)}`, `description: ${yamlStr(`Atlas thématique — ${d.nom} : événements de la base rattachés par catégorie, table de correspondance publiée.`)}`,
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
  const csv = process.argv[2] ? path.resolve(process.argv[2]) : def.csv;
  const md = process.argv[3] ? path.resolve(process.argv[3]) : def.md;
  if (!csv || !md) { console.error('Sources introuvables dans data/source/'); process.exit(2); }
  const r = importer(csv, md);
  ecrireSorties(r);
  console.log(`Import : ${r.evenements.length} entrées, ${r.rejects.length} rejet(s), ${r.fiches.length} fiches, ${r.problemesFiches.length} problème(s) de fiche.`);
  console.log('Lancer ensuite : node scripts/validate.mjs');
}
