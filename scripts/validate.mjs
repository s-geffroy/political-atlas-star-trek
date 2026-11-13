#!/usr/bin/env node
// Validateur documentaire : relit les sources ET les donnees generees, et
// verifie les dix controles de la specification (section 6). Il ne corrige
// rien. Sortie : docs/rapport-qualite.md + _data/qualite.json ; code de sortie
// 1 si une erreur bloquante est trouvee.

import fs from 'node:fs';
import path from 'node:path';
import { serializeCsv } from './lib/csv.mjs';
import { importer, dernieresSources, COLONNES } from './import.mjs';
import { anneesHorsPeriode } from './lib/derive.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lire = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

export function valider({ csv, md } = dernieresSources()) {
  const r = importer(csv, md);
  const gen = lire('_data/evenements.json');
  const genFiches = lire('_data/fiches.json');
  const mdText = fs.readFileSync(md, 'utf8');
  const controles = [];
  const ajouter = (num, titre, erreurs, avertissements = [], info = '') =>
    controles.push({ num, titre, statut: erreurs.length ? 'erreur' : avertissements.length ? 'avertissement' : 'ok', erreurs, avertissements, info });

  // 1. Identifiants uniques et non vides
  {
    const err = [];
    const vus = new Map();
    for (const { line, data } of r.records) {
      if (!data.id) err.push(`ligne ${line} : identifiant vide`);
      else if (!/^STP-\d{3}$/.test(data.id)) err.push(`ligne ${line} : identifiant « ${data.id} » hors format STP-NNN`);
      if (vus.has(data.id)) err.push(`${data.id} : doublon (lignes ${vus.get(data.id)} et ${line})`);
      vus.set(data.id, line);
    }
    const publies = fs.existsSync(path.join(ROOT, 'data/ids-publies.json')) ? lire('data/ids-publies.json') : [];
    for (const id of publies) if (!vus.has(id)) err.push(`${id} : identifiant déjà publié absent de la source (URL qui disparaîtrait)`);
    const pages = fs.readdirSync(path.join(ROOT, '_evenements')).map((f) => f.replace(/\.md$/, ''));
    for (const p of pages) if (!vus.has(p)) err.push(`_evenements/${p}.md : page sans entrée dans la source`);
    for (const id of vus.keys()) if (!pages.includes(id)) err.push(`${id} : page _evenements/${id}.md manquante`);
    ajouter(1, 'Identifiants uniques et non vides', err, [], `${vus.size} identifiants distincts, ${publies.length} déjà publiés suivis.`);
  }

  // 2. Nombre de lignes importees et rejets
  {
    const err = r.rejects.map((x) => `ligne ${x.line} rejetée : ${x.reason}`);
    if (gen.length !== r.records.length) err.push(`données générées : ${gen.length} entrées pour ${r.records.length} lignes source — relancer l'import`);
    const annonce = /\*\*(\d+) entrées de recherche\*\*/.exec(mdText);
    const warn = [];
    if (annonce && +annonce[1] !== r.records.length) warn.push(`le Markdown annonce ${annonce[1]} entrées, le CSV en contient ${r.records.length}`);
    ajouter(2, 'Lignes importées et rejets', err, warn, `${r.records.length} entrées importées, ${r.rejects.length} rejet(s)${annonce ? `, ${annonce[1]} annoncées par le Markdown` : ''}.`);
  }

  // 3. Valeurs autorisees du niveau de recoupement
  {
    const err = r.records.filter(({ data }) => !['A', 'B', 'C'].includes(data.niveau_recoupement))
      .map(({ data }) => `${data.id} : niveau « ${data.niveau_recoupement} »`);
    const warn = [];
    for (const f of r.fiches) {
      const e = r.records.find((x) => x.data.id === f.id)?.data;
      const lettre = (f.entetes.recoupement || '').trim()[0];
      if (e && lettre !== e.niveau_recoupement) warn.push(`${f.id} : la fiche indique « ${f.entetes.recoupement} », le CSV « ${e.niveau_recoupement} »`);
    }
    for (const [id, n] of r.registre) {
      const e = r.records.find((x) => x.data.id === id)?.data;
      if (e && n.niveau !== e.niveau_recoupement) warn.push(`${id} : registre Markdown ${n.niveau}, CSV ${e.niveau_recoupement}`);
      // Lien « Contrôle » du registre : meme URL que le CSV (une parenthese en trop le casse).
      if (e && n.controle != null && e.url_source && n.controle !== e.url_source) err.push(`${id} : lien de contrôle du registre « ${n.controle} » ≠ CSV « ${e.url_source} »`);
    }
    ajouter(3, 'Niveaux de recoupement A / B / C', err, warn, r.stats.niveaux.map((n) => `${n.cle} : ${n.n}`).join(', ') + '.');
  }

  // 4. Liens syntaxiquement valides
  {
    const err = [];
    const ok = (u) => { try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol) && !/\s/.test(u); } catch { return false; } };
    let n = 0;
    for (const { data } of r.records) if (data.url_source) { n++; if (!ok(data.url_source)) err.push(`${data.id} : url_source « ${data.url_source} »`); }
    for (const f of r.fiches) for (const s of f.sources) { n++; if (!ok(s.url)) err.push(`${f.id} : « ${s.url} »`); }
    const diff = r.diffusion;
    const saisons = diff.series.flatMap((x) => x.saisons || []);
    for (const x of [...diff.series, ...saisons, ...diff.films, ...diff.episodes]) if (x.source_url) { n++; if (!ok(x.source_url)) err.push(`diffusion : « ${x.source_url} »`); }
    const dateOk = (d) => d === null || d === undefined || /^\d{4}(-\d{2}(-\d{2})?)?$/.test(d);
    for (const x of [...diff.series, ...saisons]) for (const k of ['debut', 'fin']) if (!dateOk(x[k])) err.push(`diffusion : date « ${x[k]} » mal formée`);
    for (const x of [...diff.films, ...diff.episodes]) if (!dateOk(x.date)) err.push(`diffusion : date « ${x.date} » mal formée`);
    for (const x of [...saisons, ...diff.films, ...diff.episodes]) if (x.date !== undefined ? x.date && !x.source_url : (x.debut && !x.source_url)) err.push(`diffusion : date sans source (${x.titre || 'saison ' + x.numero})`);
    ajouter(4, 'Liens syntaxiquement valides', err, [], `${n} URL contrôlées (syntaxe seulement, pas de requête réseau).`);
  }

  // 5. Presence ou absence de fiche approfondie
  {
    const warn = r.problemesFiches.slice();
    for (const f of r.fiches) if (!f.sources.length) warn.push(`${f.id} : fiche sans source de contrôle`);
    const annonce = /^(\d+) dossiers analysés/m.exec(mdText);
    const err = [];
    if (annonce && +annonce[1] !== r.fiches.length) err.push(`le Markdown annonce ${annonce[1]} dossiers, ${r.fiches.length} extraits`);
    const ids = r.fiches.map((f) => f.id);
    if (new Set(ids).size !== ids.length) err.push('fiche en double');
    const sansFlag = gen.filter((e) => e.fiche !== ids.includes(e.id)).map((e) => e.id);
    if (sansFlag.length) err.push(`indicateur « fiche » incohérent : ${sansFlag.join(', ')}`);
    ajouter(5, 'Présence des fiches approfondies', err, warn, `${r.fiches.length} fiches : ${ids.join(', ')}.`);
  }

  // 6. Coherence fiches <-> evenements
  {
    const err = [];
    const warn = [];
    for (const f of r.fiches) {
      const e = r.records.find((x) => x.data.id === f.id)?.data;
      if (!e) { err.push(`${f.id} : fiche sans entrée CSV`); continue; }
      if (f.titre !== e.event) warn.push(`${f.id} : titre de fiche « ${f.titre} » ≠ CSV « ${e.event} »`);
      if (f.entetes.periode && f.entetes.periode !== e.period) warn.push(`${f.id} : période de fiche « ${f.entetes.periode} » ≠ CSV « ${e.period} »`);
    }
    for (const id of Object.keys(genFiches)) if (!r.fiches.some((f) => f.id === id)) err.push(`${id} : fiche générée sans source`);
    for (const [id, n] of r.registre) {
      const e = r.records.find((x) => x.data.id === id)?.data;
      if (!e) err.push(`${id} : notice du registre sans entrée CSV`);
      else if (n.titre !== e.event) warn.push(`${id} : titre du registre « ${n.titre} » ≠ CSV « ${e.event} »`);
    }
    for (const x of r.citationsInconnues) err.push(`${x.dans} cite ${x.cite}, absent du corpus`);
    // Doublons tranches : cibles existantes, pas de chaine, episode commun.
    const ids = new Set(r.evenements.map((e) => e.id));
    const secondaires = new Set(r.doublons.map((d) => d.secondaire));
    for (const d of r.doublons) {
      if (!ids.has(d.secondaire) || !ids.has(d.principal)) { err.push(`doublon ${d.secondaire} → ${d.principal} : identifiant inconnu`); continue; }
      if (secondaires.has(d.principal)) err.push(`doublon ${d.secondaire} → ${d.principal} : la principale est elle-même secondaire`);
      const a = r.evenements.find((e) => e.id === d.secondaire), b = r.evenements.find((e) => e.id === d.principal);
      if (!a.episodes.some((p) => b.episodes.some((q) => q.titre === p.titre))) warn.push(`doublon ${d.secondaire} → ${d.principal} : aucun épisode commun`);
    }
    for (const e of gen) for (const a of e.associes) if (!gen.some((g) => g.id === a.id)) err.push(`${e.id} : associé ${a.id} inconnu`);
    // Relations documentees : identifiants, types, source, doublons, unicite.
    const vusRel = new Set();
    for (const x of r.relations) {
      const k = `${x.de} → ${x.vers}`;
      if (!ids.has(x.de) || !ids.has(x.vers)) err.push(`relation ${k} : identifiant inconnu`);
      if (x.de === x.vers) err.push(`relation ${k} : boucle`);
      if (!['cause', 'suite', 'meme_arc'].includes(x.type)) err.push(`relation ${k} : type « ${x.type} » inconnu`);
      if (!/^https?:\/\//.test(x.url || '')) err.push(`relation ${k} : source manquante`);
      if (x.url_complementaire != null && !/^https?:\/\//.test(x.url_complementaire)) err.push(`relation ${k} : source complémentaire invalide`);
      const champsInconnus = Object.keys(x).filter((c) => !['de', 'vers', 'type', 'url', 'url_complementaire', 'justification'].includes(c));
      if (champsInconnus.length) err.push(`relation ${k} : champ(s) inconnu(s) ${champsInconnus.join(', ')}`);
      if (secondaires.has(x.de) || secondaires.has(x.vers)) err.push(`relation ${k} : vise un doublon secondaire`);
      if (vusRel.has(k)) err.push(`relation ${k} : en double`);
      vusRel.add(k);
    }
    // « Examinees sans relation » : identifiants connus, et vraiment sans relation.
    const relies = new Set(r.relations.flatMap((x) => [x.de, x.vers]));
    const sansRel = fs.existsSync(path.join(ROOT, 'data/relations.json')) ? (JSON.parse(fs.readFileSync(path.join(ROOT, 'data/relations.json'), 'utf8')).examinees_sans_relation || { ids: [] }).ids : [];
    for (const id of sansRel) {
      if (!ids.has(id)) err.push(`sans relation : ${id} inconnu`);
      else if (relies.has(id)) err.push(`sans relation : ${id} porte pourtant une relation`);
    }
    ajouter(6, 'Cohérence fiches ↔ événements', err, warn, `${r.registre.size} notices de registre comparées au CSV ; ${r.doublons.length} doublons tranchés et ${r.relations.length} relations documentées vérifiés.`);
  }

  // 7. Dates ambigues conservees comme texte
  {
    const err = [];
    for (const { data } of r.records) {
      const g = gen.find((e) => e.id === data.id);
      if (g && g.period !== data.period) err.push(`${data.id} : période modifiée (« ${data.period} » → « ${g.period} »)`);
      if (g && typeof g.period !== 'string') err.push(`${data.id} : période non textuelle`);
    }
    // Coherence : une annee citee par l'intitule ou les faits de la fiche doit
    // figurer dans la periode (avertissement : a trancher sur la source).
    const warn = [];
    for (const { data } of r.records) {
      const f = r.fiches.find((x) => x.id === data.id);
      const hors = anneesHorsPeriode(data.period, [data.event, f?.volets?.faits, f?.volets?.mecanisme]);
      if (hors.length) warn.push(`${data.id} : année(s) ${hors.join(', ')} citée(s) dans l'intitulé ou la fiche, absente(s) de la période « ${data.period} »`);
    }
    const floues = gen.filter((e) => e.ordre.precision !== 'annee');
    ajouter(7, 'Dates ambiguës conservées en texte', err, warn, `${floues.length} périodes non réductibles à une année, conservées telles quelles ; la clé d'ordre ne sert qu'au tri et n'est jamais affichée.`);
  }

  // 8. Pas de fusion entre continuites
  {
    const err = [];
    const warn = [];
    const valides = Object.keys(r.referentiels.continuites);
    for (const e of gen) {
      if (!valides.includes(e.continuite)) err.push(`${e.id} : continuité « ${e.continuite} » inconnue`);
      for (const a of e.associes) if (a.autre_continuite && e.id < a.id) warn.push(`${e.id} ↔ ${a.id} : association entre continuités différentes (affichée comme telle)`);
    }
    ajouter(8, 'Continuités alternatives distinctes', err, warn, r.stats.continuites.map((c) => `${c.nom} : ${c.n}`).join(', ') + '.');
  }

  // 9. Aucun enrichissement invente
  {
    const err = [];
    const derives = new Set(['categories', 'series', 'episodes', 'references_non_rattachees', 'continuite', 'continuite_regle', 'ordre', 'cycle_slug', 'fiche', 'corrections', 'note_editoriale', 'diffusion', 'associes', 'rang_diegetique', 'audit', 'sous_bande', 'amorce', 'analyse_url', 'url_archive', 'bande', 'doublon_de', 'doublons', 'relations']);
    for (const e of gen) for (const k of Object.keys(e)) if (!COLONNES.includes(k) && !derives.has(k)) err.push(`${e.id} : champ « ${k} » non prévu`);
    for (const f of Object.values(genFiches)) {
      for (const [k, v] of [...Object.entries(f.volets), ...Object.entries(f.entetes)]) if (!mdText.includes(v)) err.push(`${f.id} : ${k} absent du Markdown source`);
      for (const [k, v] of Object.entries(f.volets)) if (/<\s*[a-z!/]/i.test(v)) err.push(`${f.id} : HTML brut dans « ${k} » (refusé par le pipeline)`);
    }
    for (const e of gen) for (const d of e.diffusion) if (!d.source_url) err.push(`${e.id} : date de diffusion sans source`);
    // Copies archivees : uniquement des captures web.archive.org.
    const capture = /^https:\/\/web\.archive\.org\/web\/\d{14}\/https?:\/\//;
    for (const e of gen) if (e.url_archive && !capture.test(e.url_archive)) err.push(`${e.id} : copie archivée mal formée`);
    for (const f of Object.values(genFiches)) for (const x of f.sources) if (x.archive && !capture.test(x.archive)) err.push(`${f.id} : copie archivée de source mal formée`);
    for (const e of gen) for (const ep of e.episodes) if (!e.source.includes(ep.titre)) err.push(`${e.id} : épisode « ${ep.titre} » absent du champ source`);
    ajouter(9, 'Aucun enrichissement inventé', err, [], 'Champs dérivés limités à une liste fermée ; textes des fiches = sous-chaînes exactes du Markdown ; dates de diffusion toutes sourcées.');
  }

  // 10. Aucune perte de donnees
  {
    const err = [];
    const src = fs.readFileSync(csv, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\n+$/, '');
    const recon = serializeCsv(r.header, gen.map((e) => Object.fromEntries(r.header.map((h) => [h, e[h]]))));
    if (recon !== src) err.push('le CSV reconstruit depuis _data/evenements.json diffère de la source');
    if (r.header.join(';') !== COLONNES.join(';')) err.push(`colonnes inattendues : ${r.header.join(', ')}`);
    ajouter(10, 'Aucune perte de données', err, [], 'CSV reconstruit à partir des données publiées et comparé octet par octet (hors BOM et fins de ligne).');
  }

  const bilan = {
    // Date de la version du corpus (stable d'un jour a l'autre), pas l'horloge.
    genere_le: (/_(\d{4}-\d{2}-\d{2})\.csv$/.exec(r.meta.csv) || [])[1] || null,
    source: r.meta,
    erreurs: controles.reduce((s, c) => s + c.erreurs.length, 0),
    avertissements: controles.reduce((s, c) => s + c.avertissements.length, 0),
    controles,
    limites: {
      sans_url: r.records.filter(({ data }) => !data.url_source).length,
      niveau_c: r.records.filter(({ data }) => data.niveau_recoupement === 'C').length,
      autre_a_qualifier: r.evenements.filter((e) => e.categories.includes('autre / à qualifier')).length,
      non_rattachees: r.evenements.filter((e) => e.references_non_rattachees.length).map((e) => ({ id: e.id, refs: e.references_non_rattachees })),
      fiches_sans_source: r.fiches.filter((f) => !f.sources.length).map((f) => f.id),
      avec_diffusion: r.evenements.filter((e) => e.diffusion.length).length,
    },
  };
  return bilan;
}

function rapport(b) {
  const L = [`# Rapport de qualité documentaire`, '', `> Généré par \`scripts/validate.mjs\` le ${b.genere_le}. Source : \`${b.source.csv}\`, \`${b.source.md}\`.`, '',
    `**Bilan : ${b.erreurs} erreur(s), ${b.avertissements} avertissement(s).**`, '', '| # | Contrôle | Statut | Détail |', '|---|---|---|---|'];
  for (const c of b.controles) L.push(`| ${c.num} | ${c.titre} | ${c.statut} | ${c.info} |`);
  for (const c of b.controles) {
    if (!c.erreurs.length && !c.avertissements.length) continue;
    L.push('', `## ${c.num}. ${c.titre}`, '');
    for (const e of c.erreurs) L.push(`- **Erreur** — ${e}`);
    for (const w of c.avertissements) L.push(`- Avertissement — ${w}`);
  }
  const l = b.limites;
  L.push('', '## Limites du corpus mesurées', '',
    `- ${l.niveau_c} entrées de niveau C (référence candidate non recoupée individuellement).`,
    `- ${l.sans_url} entrées sans URL de contrôle.`,
    `- ${l.autre_a_qualifier} entrées classées « autre / à qualifier ».`,
    `- ${l.avec_diffusion} entrées reliées à une date de diffusion vérifiée.`,
    `- Fiches approfondies sans source de contrôle : ${l.fiches_sans_source.join(', ') || 'aucune'}.`,
    `- Références de source non rattachées à une série : ${l.non_rattachees.map((x) => `${x.id} (${x.refs.join(', ')})`).join(' ; ') || 'aucune'}.`);
  return L.join('\n') + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const b = valider();
  fs.writeFileSync(path.join(ROOT, '_data/qualite.json'), JSON.stringify(b, null, 1) + '\n');
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs/rapport-qualite.md'), rapport(b));
  for (const c of b.controles) console.log(`${c.statut === 'ok' ? '✓' : c.statut === 'erreur' ? '✗' : '!'} ${c.num}. ${c.titre} — ${c.info}${c.erreurs.length ? ` [${c.erreurs.length} erreur(s)]` : ''}${c.avertissements.length ? ` [${c.avertissements.length} avert.]` : ''}`);
  console.log(`Bilan : ${b.erreurs} erreur(s), ${b.avertissements} avertissement(s). Rapport : docs/rapport-qualite.md`);
  process.exit(b.erreurs ? 1 : 0);
}
