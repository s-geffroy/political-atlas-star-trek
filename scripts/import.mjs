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
    fiches: evenements.filter((e) => e.fiche).length,
    niveaux: compte(evenements.map((e) => e.niveau_recoupement), ['A', 'B', 'C']),
    cycles: compte(evenements.map((e) => e.cycle), cyclesOrdre).map((c) => ({ ...c, slug: slug(c.cle) })),
    series: compte(evenements.flatMap((e) => e.series), seriesCodes).map((c) => ({ ...c, nom: SERIES.find((s) => s.code === c.cle).nom })),
    categories: compte(evenements.flatMap((e) => e.categories)),
    continuites: compte(evenements.map((e) => e.continuite), Object.keys(CONTINUITES)).map((c) => ({ ...c, nom: CONTINUITES[c.cle] })),
    versions: compte(evenements.map((e) => e.version_entree)),
    precisions: compte(evenements.map((e) => e.ordre.precision), Object.keys(PRECISIONS)).map((c) => ({ ...c, nom: PRECISIONS[c.cle] })),
    max_serie: Math.max(...compte(evenements.flatMap((e) => e.series)).map((c) => c.n)),
    max_categorie: Math.max(...compte(evenements.flatMap((e) => e.categories)).map((c) => c.n)),
    max_cycle: Math.max(...compte(evenements.map((e) => e.cycle)).map((c) => c.n)),
  };

  const atlas = construireAtlas(evenements, categoriesPresentes);

  return {
    meta: {
      csv: path.relative(ROOT, csvPath), md: path.relative(ROOT, mdPath),
      version: (csvPath.match(/_V(\d+_\d+)_/) || [])[1]?.replace('_', '.') || null,
      etat: editorial.etat, colonnes: header,
    },
    header, records, rejects, evenements, fiches, problemesFiches, registre, editorial, stats, atlas,
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
    .map((f) => ({ ...f, evenements: (f.titre_corpus ? r.evenements.filter((e) => e.episodes.some((p) => p.serie === 'Film' && titreFilm(p.titre) === titreFilm(f.titre_corpus))) : []).map((e) => e.id) }));
  const filmsDates = films.filter((f) => f.date);
  const parSerie = (code) => r.evenements.filter((e) => e.series.includes(code))
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
