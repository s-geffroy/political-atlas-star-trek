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
import { SERIES, CONTINUITES, PRECISIONS, episodesDe, continuite, ordreDiegetique, slug, epKey, historiqueAudit, nomComplet, oeuvres, amorce, anneeDeduite } from './lib/derive.mjs';
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

// Analyses redigees a la main (data/analyses-redigees.json) : l'import ne
// genere pas de page pour ces fiches, retire la page generee devenue inutile,
// et les gabarits lisent `analyse_url`. Valeur : id -> segment d'adresse.
export function lireAnalysesRedigees() {
  const p = path.join(ROOT, 'data/analyses-redigees.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).analyses : [];
}
export const ANALYSES_REDIGEES = Object.fromEntries(lireAnalysesRedigees().map((a) => [a.id, a.permalien.replace(/^\/analyses\/|\/$/g, '')]));

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
  if (groupe === 0) return [0, o.anciennete != null ? -o.anciennete : 0, 0, 0, 0];
  return [groupe, o.siecle ?? 0, o.siecle_fin ? 1 : 0, o.imprecis ? 1 : 0, o.imprecis ? o.qualif : (o.cle ?? 0) - (o.avant ? 0.5 : 0) + (o.apres ? 0.5 : 0)];
}

export function lireDoublons() {
  const p = path.join(ROOT, 'data/doublons.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).doublons : [];
}

export function lireRelations() {
  const p = path.join(ROOT, 'data/relations.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).relations : [];
}
// Dates stellaires dites a l'ecran (data/stardates.json, produit par scripts/stardates.mjs).
export function lireStardates() {
  const p = path.join(ROOT, 'data/stardates.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).episodes : [];
}

// Copies archivees des sources (data/archives.json, produit par scripts/sources.mjs).
export function lireArchives() {
  const p = path.join(ROOT, 'data/archives.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).sources : {};
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
  const archives = lireArchives();
  const stardates = new Map(lireStardates().filter((x) => x.dates_stellaires.length).map((x) => [`${x.serie}|${x.titre}`, x]));
  const sansRel = lireSansRelation();
  for (const e of evenements) e.relations = { sortantes: [], entrantes: [], examinee_le: sansRel.ids.includes(e.id) ? sansRel.date : null, passes: sansRel.ids.includes(e.id) ? sansRel.passes : null };
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
    e.analyse_redigee = Boolean(ANALYSES_REDIGEES[e.id]);
    e.sous_bande = e.ordre.imprecis ? 'Datation imprécise dans le siècle' : null;
    e.url_archive = archives[e.url_source]?.archive || null;
    // Dates stellaires prononcees a l'ecran ; annee deduite pour l'ere TNG seulement.
    e.dates_stellaires = e.episodes.map((p) => stardates.get(`${p.serie}|${p.titre}`)).filter(Boolean).map((x) => ({
      titre: x.titre, source_url: [x.transcription_url].flat()[0], transcriptions: [x.transcription_url].flat(), memory_alpha_url: x.memory_alpha_url,
      dates: x.dates_stellaires.map((d) => ({ date: d, annee: anneeDeduite(d) })),
      // Annees deduites distinctes : affichees une fois quand toutes les dates tombent la meme annee.
      annees: [...new Set(x.dates_stellaires.map(anneeDeduite).filter(Boolean))],
    }));
  }
  for (const f of fiches) f.sources = f.sources.map((x) => ({ ...x, archive: archives[x.url]?.archive || null }));

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
    passes_relations: sansRel.passes,
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
  const NW = 270, NH = 74, GX = 84, GY = 22, PAD = 12, PADX = 56, SEUIL = 25, LIGNE = 36;
  const parId = new Map(r.evenements.map((e) => [e.id, e]));
  const rang = (id) => parId.get(id).rang_diegetique;
  const relsDoc = r.relations.filter((x) => parId.has(x.de) && parId.has(x.vers));
  // Liens « episode commun » (associations deja affichees sur les fiches) :
  // dessines en gris a l'interieur d'un arc, mais ils ne servent pas a former
  // les arcs, qui ne reposent que sur des relations documentees.
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

  const causal = (x) => x.type === 'cause' || x.type === 'suite';
  // Arcs : composantes connexes des relations DOCUMENTEES. Une composante de
  // plus de SEUIL evenements (illisible) est redecoupee sans couper les chaines
  // causales : d'abord en ne gardant que les liens cause / suite, puis, si un
  // morceau reste trop grand, par serie.
  const composantes = (ids, garder) => {
    const voisins = new Map(ids.map((i) => [i, new Set()]));
    for (const x of relsDoc) if (voisins.has(x.de) && voisins.has(x.vers) && garder(x)) { voisins.get(x.de).add(x.vers); voisins.get(x.vers).add(x.de); }
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
  // Apres la coupe causale, un morceau relie a un autre par un lien « meme arc »
  // le rejoint, tant que l'arc obtenu ne depasse pas SEUIL (plus petits d'abord).
  const recoller = (morceaux) => {
    const ms = morceaux.map((m) => [...m]);
    for (let change = true; change;) {
      change = false;
      ms.sort((a, b) => a.length - b.length || String(a[0]).localeCompare(String(b[0])));
      for (const m of ms) {
        if (!m.length) continue;
        const ici = new Set(m);
        const cibles = relsDoc.filter((x) => !causal(x) && (ici.has(x.de) !== ici.has(x.vers)))
          .map((x) => ms.find((o) => o !== m && o.includes(ici.has(x.de) ? x.vers : x.de)))
          .filter((o) => o && o.length && o.length + m.length <= SEUIL)
          .sort((a, b) => a.length - b.length || a[0].localeCompare(b[0]));
        if (cibles.length) { cibles[0].push(...m); m.length = 0; change = true; break; }
      }
    }
    return ms.filter((m) => m.length);
  };
  const comps = composantes([...dansReseau], () => true)
    .flatMap((c) => (c.length > SEUIL ? recoller(composantes(c, causal)) : [c]))
    .flatMap((c) => (c.length > SEUIL ? composantes(c, (x) => serieP(x.de) === serieP(x.vers)) : [c]));

  // Etiquette sur trois lignes au plus (coupure aux mots), la derniere tronquee si besoin.
  const deuxLignes = (t, n = 3) => {
    const mots = t.split(/\s+/); const l = Array(n).fill('');
    let i = 0;
    for (const m of mots) {
      const essai = l[i] ? `${l[i]} ${m}` : m;
      if (essai.length <= LIGNE || !l[i]) l[i] = essai;
      else if (i < n - 1) { i += 1; l[i] = m; }
      else { l[i] = `${l[i]} ${m}`; }
    }
    if (l[n - 1].length > LIGNE) l[n - 1] = l[n - 1].slice(0, LIGNE - 1).replace(/\s+\S*$/, '') + '…';
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
        lignes: deuxLignes(e.event).map((t, k) => ({ t, y: p.y + 32 + k * 15 })), titre_complet: e.event, niv: e.niveau_recoupement, cycle: e.cycle };
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
        // Lien qui franchit des colonnes intermediaires : il passe par un couloir
        // horizontal libre entre leurs boites, au lieu de glisser dessous.
        const c1 = Math.min(couche.get(x.de), couche.get(x.vers)), c2 = Math.max(couche.get(x.de), couche.get(x.vers));
        const inter = [];
        for (let k = c1 + 1; k < c2; k++) inter.push(...parCouche[k].map((id) => pos.get(id)));
        const libre = (y) => inter.every((q) => y < q.y - 3 || y > q.y + NH + 3);
        if (inter.length && !inter.every((q) => [ya, yb, (ya + yb) / 2].every((y) => libre(y)) )) {
          const candidats = [PAD / 2, ...inter.flatMap((q) => [q.y - GY / 2, q.y + NH + GY / 2])].filter(libre);
          const cy = candidats.sort((u, v) => Math.abs(u - (ya + yb) / 2) - Math.abs(v - (ya + yb) / 2))[0];
          const g = xb > xa ? 1 : -1, x1 = xa + g * GX / 2, x2 = xb - g * GX / 2;
          d = `M${xa},${ya} C${x1},${ya} ${x1},${cy} ${x1 + g * 12},${cy} L${x2 - g * 12},${cy} C${x2},${cy} ${x2},${yb} ${fin},${yb}`;
        } else {
          d = `M${xa},${ya} C${m},${ya} ${m},${yb} ${fin},${yb}`;
        }
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
    seuil_decoupe: SEUIL, carte: carteDesArcs(sortie, parId), graphe: grapheChronologique(sortie, relsDoc, parId) };
}

// Graphe chronologique : tous les evenements relies et leurs relations
// documentees. Abscisse = temps fictif (une largeur par periode, croissant avec
// la racine du nombre d'evenements ; ordre diegetique a l'interieur) ;
// ordonnee calculee par relaxation deterministe (les evenements lies se
// rapprochent, les voisins dans le temps s'ecartent). Calcule a la
// construction : le graphe s'affiche sans JavaScript.
function grapheChronologique(arcs, rels, parId) {
  const H = 720, PADY = 40, PADX = 30, MIN = 46, K = 44;
  const ids = arcs.flatMap((c) => c.ids);
  const ev = ids.map((id) => parId.get(id)).sort((a, b) => a.rang_diegetique - b.rang_diegetique);
  // Periodes dans l'ordre diegetique, largeur ~ racine du nombre d'evenements.
  const bandes = [];
  for (const e of ev) { const b = e.bande || 'Non daté'; if (!bandes.length || bandes.at(-1).nom !== b) bandes.push({ nom: b, ids: [] }); bandes.at(-1).ids.push(e.id); }
  let x0 = PADX;
  for (const b of bandes) { b.x = x0; b.w = Math.round(MIN + K * Math.sqrt(b.ids.length)); x0 += b.w; }
  const L = x0 + PADX;
  const degre = new Map(ids.map((id) => [id, 0]));
  for (const x of rels) if (degre.has(x.de) && degre.has(x.vers)) { degre.set(x.de, degre.get(x.de) + 1); degre.set(x.vers, degre.get(x.vers) + 1); }
  const n = new Map();
  for (const b of bandes) b.ids.forEach((id, k) => {
    const d = degre.get(id);
    n.set(id, { id, x: b.x + (b.w * (k + 0.5)) / b.ids.length, y: PADY + ((k * 97) % (H - 2 * PADY)), r: Math.min(14, 4 + 2.2 * Math.sqrt(d)), d });
  });
  const N = [...n.values()];
  const E = rels.filter((x) => n.has(x.de) && n.has(x.vers));
  // Relaxation : ressorts verticaux sur les liens, repulsion entre noeuds proches.
  for (let it = 0; it < 500; it++) {
    const pas = 1 - it / 500;
    for (const x of E) { const a = n.get(x.de), b = n.get(x.vers); const dy = (b.y - a.y) * 0.025 * pas; a.y += dy; b.y -= dy; }
    for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
      const a = N[i], b = N[j]; const dx = b.x - a.x; if (Math.abs(dx) > 90) continue;
      const dy = b.y - a.y || (i % 2 ? 0.5 : -0.5); const dist = Math.hypot(dx, dy), min = a.r + b.r + 26;
      if (dist < min) { const f = ((min - dist) / dist) * 0.5; a.y -= dy * f; b.y += dy * f; }
    }
    for (const a of N) { a.y += (H / 2 - a.y) * 0.0008 * pas; a.y = Math.max(PADY, Math.min(H - PADY, a.y)); }
  }
  // Etiquettes : les evenements les plus relies d'abord ; une etiquette n'est
  // ecrite que si elle ne touche ni une autre etiquette ni un autre point.
  const posees = [];
  const touche = (b) => posees.some((q) => b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h)
    || N.some((o) => Math.max(b.x - o.x, 0, o.x - (b.x + b.w)) ** 2 + Math.max(b.y - o.y, 0, o.y - (b.y + b.h)) ** 2 < (o.r + 1) ** 2);
  const etiquettes = new Map();
  for (const a of [...N].sort((u, v) => v.d - u.d || u.id.localeCompare(v.id))) {
    if (a.d < 2) break;
    const e = parId.get(a.id);
    const court = e.event.length > 30 ? e.event.slice(0, 29).replace(/\s+\S*$/, '') + '…' : e.event;
    const w = court.length * 5.9, h = 13;
    for (const c of [{ x: a.x + a.r + 4, ancre: 'start' }, { x: a.x - a.r - 4 - w, ancre: 'end' }]) {
      const b = { x: c.x, y: a.y - 9, w, h };
      if (b.x < 2 || b.x + w > L - 2 || touche(b)) continue;
      posees.push(b); etiquettes.set(a.id, { court, tx: Math.round(c.ancre === 'start' ? c.x : c.x + w), ancre: c.ancre }); break;
    }
  }
  const noeuds = N.map((a) => {
    const e = parId.get(a.id); const t = etiquettes.get(a.id);
    return { id: a.id, x: Math.round(a.x), y: Math.round(a.y), r: Math.round(a.r * 10) / 10, d: a.d, titre: e.event, serie: e.series[0] || 'Film', periode: e.period,
      ...(t ? { court: t.court, tx: t.tx, ancre: t.ancre } : {}) };
  });
  const liens = E.map((x) => {
    const a = n.get(x.de), b = n.get(x.vers);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.min(60, Math.abs(b.x - a.x) / 6);
    return { de: x.de, vers: x.vers, type: x.type, d: `M${Math.round(a.x)},${Math.round(a.y)} Q${Math.round(mx)},${Math.round(my)} ${Math.round(b.x)},${Math.round(b.y)}` };
  });
  return { largeur: L, hauteur: H, bandes: bandes.map((b) => ({ nom: b.nom, x: b.x, w: b.w, n: b.ids.length })), noeuds, liens };
}

// Carte d'ensemble des arcs : une bulle par arc, placee en abscisse a la
// mediane de l'ordre diegetique de ses evenements (axe ordinal, non
// proportionnel au temps), dans la bande de sa serie dominante ; surface
// proportionnelle au nombre d'evenements ; traits fins pour les relations
// documentees entre deux arcs (epaisseur = nombre de relations).
function carteDesArcs(arcs, parId) {
  const D = 16, G = 236, HAUT = 40, BAS = 24, RMAX = 30, MIN = 26, K = 22;
  const noms = (() => { const p = path.join(ROOT, 'data/arcs-noms.json'); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).noms : {}; })();
  const mediane = (v) => { const t = [...v].sort((a, b) => a - b); return t[(t.length - 1) >> 1]; };
  // Axe : une largeur par periode (croissant avec la racine du nombre d'evenements),
  // ordre diegetique a l'interieur ; une bulle est placee a son evenement median.
  const ev = arcs.flatMap((c) => c.ids).map((id) => parId.get(id)).sort((a, b) => a.rang_diegetique - b.rang_diegetique);
  const bandes = [];
  for (const e of ev) { const b = e.bande || 'Non daté'; if (!bandes.length || bandes.at(-1).nom !== b) bandes.push({ nom: b, ids: [] }); bandes.at(-1).ids.push(e.id); }
  let x0 = G;
  for (const b of bandes) { b.x = x0; b.w = Math.round(MIN + K * Math.sqrt(b.ids.length)); x0 += b.w; }
  const L = x0 + D;
  const xDe = (id) => { const b = bandes.find((q) => q.ids.includes(id)); return b.x + (b.w * (b.ids.indexOf(id) + 0.5)) / b.ids.length; };
  const tailleMax = Math.max(...arcs.map((c) => c.taille));
  const rayon = (n) => Math.max(7, RMAX * Math.sqrt(n / tailleMax));
  // Bandes horizontales : series peu representees regroupees avec leur epoque.
  const GROUPES = { TAS: 'TOS', SFA: 'DIS', 'Short Treks': 'DIS', PRO: 'LD' };
  const NOMS_GROUPES = { TOS: 'Série originale et animée', DIS: 'Discovery, Academy, Short Treks', LD: 'Lower Decks et Prodigy', Film: 'Films' };
  const bulles = arcs.map((c) => {
    const ordre = c.ids.map((id) => parId.get(id)).sort((a, b) => a.rang_diegetique - b.rang_diegetique);
    const median = ordre[(ordre.length - 1) >> 1];
    const compte = new Map();
    for (const id of c.ids) { const s0 = parId.get(id).series[0] || 'Film'; const s = GROUPES[s0] || s0; compte.set(s, (compte.get(s) || 0) + 1); }
    const serie = [...compte].sort((a, b) => b[1] - a[1] || SERIES.findIndex((x) => x.code === a[0]) - SERIES.findIndex((x) => x.code === b[0]))[0][0];
    return { cle: c.cle, titre: c.titre, taille: c.taille, serie, rang: median.rang_diegetique, x: Math.round(xDe(median.id)), r: Math.round(rayon(c.taille) * 10) / 10, court: noms[c.cle] || null };
  });
  const parSerie = new Map();
  for (const b of bulles) { if (!parSerie.has(b.serie)) parSerie.set(b.serie, []); parSerie.get(b.serie).push(b); }
  const ordre = [...parSerie.keys()].sort((a, b) => mediane(parSerie.get(a).map((x) => x.rang)) - mediane(parSerie.get(b).map((x) => x.rang)));
  let y0 = HAUT; const couloirs = [];
  for (const s of ordre) {
    const liste = parSerie.get(s).sort((a, b) => a.x - b.x || b.taille - a.taille);
    const places = [];
    for (const b of liste) {
      let dy = 0;
      for (let k = 0; k < 40; k++) {
        const essai = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 9;
        if (places.every((q) => Math.hypot(q.x - b.x, q.dy - essai) >= q.r + b.r + 3)) { dy = essai; break; }
      }
      b.dy = dy; places.push(b);
    }
    const haut = Math.max(...places.map((b) => b.r - b.dy)), bas = Math.max(...places.map((b) => b.r + b.dy));
    const h = Math.max(40, haut + bas + 14);
    const centre = y0 + 7 + haut;
    for (const b of places) b.y = Math.round(centre + b.dy);
    couloirs.push({ serie: s, nom: NOMS_GROUPES[s] || (SERIES.find((x) => x.code === s) || { nom: s }).nom, y: y0, h, ty: centre + 4 });
    y0 += h;
  }
  const hauteur = y0 + BAS;
  // Graduations : nom de chaque periode ; une etiquette plus large que sa bande
  // passe sur la seconde ligne, sous celle de sa voisine.
  const fins = [-Infinity, -Infinity];
  const graduations = bandes.map((b) => {
    const t = b.nom.replace(/^Entre le (.*) et le (.*) siècle$/, '$1–$2 s.').replace(/ siècle$/, ' s.').replace('Non ordonnable sans interprétation', 'non daté');
    const rang = b.x + 3 >= fins[0] ? 0 : 1;
    fins[rang] = b.x + 3 + t.length * 6.2 + 6;
    return { x: b.x, w: b.w, t, ty: rang ? 31 : 17 };
  });
  // Noms courts (arcs de 5 evenements et plus) : a droite, a gauche, au-dessus ou
  // au-dessous de la bulle, la premiere position qui ne touche ni bulle ni nom deja place.
  const poses = [];
  for (const b of [...bulles].sort((u, v) => v.taille - u.taille)) {
    if (b.taille < 5) continue;
    const t = b.court || (b.titre.length > 30 ? b.titre.slice(0, 29).replace(/\s+\S*$/, '') + '…' : b.titre);
    const w = t.length * 6.4, h = 14;
    const essais = [
      { x: b.x + b.r + 6, y: b.y + 4, a: 'start', bx: b.x + b.r + 6, by: b.y - 9 },
      { x: b.x - b.r - 6, y: b.y + 4, a: 'end', bx: b.x - b.r - 6 - w, by: b.y - 9 },
      { x: b.x, y: b.y - b.r - 6, a: 'middle', bx: b.x - w / 2, by: b.y - b.r - 17 },
      { x: b.x, y: b.y + b.r + 15, a: 'middle', bx: b.x - w / 2, by: b.y + b.r + 4 },
      // Diagonales : texte qui part du bord de la bulle, au-dessus ou au-dessous.
      { x: b.x + b.r * 0.6, y: b.y - b.r - 4, a: 'start', bx: b.x + b.r * 0.6, by: b.y - b.r - 15 },
      { x: b.x + b.r * 0.6, y: b.y + b.r + 13, a: 'start', bx: b.x + b.r * 0.6, by: b.y + b.r + 2 },
      { x: b.x - b.r * 0.6, y: b.y - b.r - 4, a: 'end', bx: b.x - b.r * 0.6 - w, by: b.y - b.r - 15 },
      { x: b.x - b.r * 0.6, y: b.y + b.r + 13, a: 'end', bx: b.x - b.r * 0.6 - w, by: b.y + b.r + 2 },
    ];
    const libre = (e) => e.bx >= G - 4 && e.bx + w <= L - 4
      && poses.every((q) => e.bx + w < q.x || q.x + q.w < e.bx || e.by + h < q.y || q.y + q.h < e.by)
      && bulles.every((o) => o === b || Math.max(e.bx - o.x, 0, o.x - (e.bx + w)) ** 2 + Math.max(e.by - o.y, 0, o.y - (e.by + h)) ** 2 > (o.r + 3) ** 2);
    const e = essais.find(libre);
    if (e) { poses.push({ x: e.bx, y: e.by, w, h }); Object.assign(b, { nom: t, nx: Math.round(e.x), ny: Math.round(e.y), nancre: e.a }); }
  }
  const ou = new Map(bulles.map((b) => [b.cle, b]));
  const paires = new Map();
  for (const c of arcs) for (const x of c.externes) if (x.sortant && x.groupe) { const k = `${c.cle}|${x.groupe}`; paires.set(k, (paires.get(k) || 0) + 1); }
  const liens = [...paires].map(([k, n]) => {
    const [a, b] = k.split('|').map((cle) => ou.get(cle));
    return { de: a.cle, vers: b.cle, n, d: `M${a.x},${a.y} Q${(a.x + b.x) / 2},${Math.min(a.y, b.y) - 18} ${b.x},${b.y}` };
  });
  return { largeur: L, hauteur, gauche: G, couloirs, graduations, bulles: bulles.map(({ rang, dy, ...b }) => b), liens };
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

const courte = (s) => (s.length > 158 ? s.slice(0, 157).replace(/\s+\S*$/, '') + '…' : s);

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

  // Analyses fiction / histoire : une page par fiche approfondie, sauf les
  // analyses redigees (data/analyses-redigees.json). Contenu = volets de la fiche
  // + paragraphe « Lignes de force » de la periode de diffusion ; rien de redige.
  const periodes = [...(r.editorial.lignes_de_force?.markdown || '').matchAll(/^\*\*(\d{4}–\d{4}) \(([^)]+)\)\.\*\* (.+)$/gm)]
    .map((m) => ({ bornes: m[1], codes: m[2].split(/[\/,]\s*|\s+/).filter(Boolean), texte: m[3].trim() }));
  ecrire(D('periodes.json'), JSON.stringify(periodes, null, 1) + '\n');
  for (const f of r.fiches) {
    if (ANALYSES_REDIGEES[f.id]) {
      // Page generee remplacee par une analyse redigee : on la retire (jamais une page ecrite a la main).
      const gen = path.join(ROOT, 'analyses', `${f.id}.md`);
      if (fs.existsSync(gen) && fs.readFileSync(gen, 'utf8').includes('# Fichier GENERE par scripts/import.mjs.')) fs.unlinkSync(gen);
      continue;
    }
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
      `title: ${yamlStr(`Analyse — ${e.event}`)}`,
      `description: ${yamlStr(courte(`${oeuvres(e, 2).replace(/^./, (c) => c.toUpperCase())} : faits de la fiction, contexte de diffusion, parallèle réel et limites de l’analogie.`))}`,
      // Type Article date, comme les fiches : publiee avec les analyses (V0.4), revue avec sa fiche.
      `date: ${dateVersion('V0.4')}`,
      `last_modified_at: ${[dateVersion('V0.4'), dateVersion((/^V\d+\.\d+/.exec(e.version_entree) || [])[0]) || ''].sort().pop()}`,
      'seo:', '  type: Article',
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
