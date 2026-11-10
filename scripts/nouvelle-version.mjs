#!/usr/bin/env node
// Produit une nouvelle version du corpus (CSV + Markdown) a partir de la
// precedente et d'un journal de corrections versionne. Usage :
//
//   node scripts/nouvelle-version.mjs data/corrections/V0.4.json
//
// Garanties :
// - la version precedente n'est jamais modifiee ; la nouvelle est ecrite a cote ;
// - chaque champ modifie est verifie contre sa valeur « avant » (refus sinon) ;
// - chaque entree modifiee recoit une note d'audit datee et son motif ;
// - les identifiants ne changent pas, aucune entree n'est ajoutee ni retiree.

import fs from 'node:fs';
import path from 'node:path';
import { readRecords, serializeCsv } from './lib/csv.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'data/source');

// Motifs d'une meme entree : separes par « ; », sans point en double.
const joindre = (cs) => cs.map((c) => c.motif.trim().replace(/\.$/, '')).join(' ; ') + '.';

export function appliquer(journal) {
  const base = `Star_Trek_Atlas_Politique_${journal.base}`;
  const csvText = fs.readFileSync(path.join(SRC, base + '.csv'), 'utf8');
  let md = fs.readFileSync(path.join(SRC, base + '.md'), 'utf8').replace(/\r\n/g, '\n');
  const { header, records, rejects } = readRecords(csvText, ';');
  if (rejects.length) throw new Error('CSV source : lignes rejetees');
  const parId = new Map(records.map((r) => [r.data.id, r.data]));
  const v = journal.version;
  const erreurs = [];
  const touches = new Map();

  for (const c of journal.corrections) {
    const d = parId.get(c.id);
    if (!d) { erreurs.push(`${c.id} : identifiant inconnu`); continue; }
    for (const [champ, { avant, apres }] of Object.entries(c.champs)) {
      if (!header.includes(champ)) { erreurs.push(`${c.id} : champ ${champ} inconnu`); continue; }
      if (champ === 'id') { erreurs.push(`${c.id} : l'identifiant ne se modifie pas`); continue; }
      if (d[champ] !== avant) { erreurs.push(`${c.id}.${champ} : valeur « avant » inattendue (« ${d[champ]} »)`); continue; }
      d[champ] = apres;
    }
    if (!touches.has(c.id)) touches.set(c.id, []);
    touches.get(c.id).push(c);
  }
  if (erreurs.length) throw new Error('Journal refuse :\n' + erreurs.join('\n'));

  for (const [id, cs] of touches) {
    const d = parId.get(id);
    const note = `${v} (${journal.date}) : ${joindre(cs)}`;
    d.note_audit = d.note_audit ? `${d.note_audit} ${note}` : note;
    d.version_entree = `${v} révisé`;
  }

  // --- Markdown : registre, fiches, corrections, synthese -------------------
  const remplacer = (re, f, quoi) => {
    // Erreur si le motif est absent (et non si le remplacement est identique).
    if (!new RegExp(re.source, re.flags.replace('g', '')).test(md)) { erreurs.push(`Markdown : ${quoi} introuvable`); return; }
    md = md.replace(re, f);
  };
  const echap = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const [id, cs] of touches) {
    const d = parId.get(id);
    // Notice du registre integral : bloc « **STP-NNN — ... ** ... jusqu'a la notice suivante.
    const reBloc = new RegExp(`(\\*\\*${id} — [\\s\\S]*?)(?=\\n\\n\\*\\*STP-\\d{3} — |\\n\\n## |\\n\\n### |$)`);
    remplacer(reBloc, (bloc) => {
      let b = bloc;
      for (const c of cs) {
        if (c.champs.source) b = b.replace(`*Épisodes :* ${c.champs.source.avant}.`, `*Épisodes :* ${c.champs.source.apres}.`);
        if (c.champs.event) b = b.replace(`**${id} — ${c.champs.event.avant}**`, `**${id} — ${c.champs.event.apres}**`);
        if (c.champs.politics) b = b.replace(`*Problématique :* ${c.champs.politics.avant}`, `*Problématique :* ${c.champs.politics.apres}`);
        if (c.champs.period) b = b.replace(`*Temps fictionnel :* ${c.champs.period.avant}.`, `*Temps fictionnel :* ${c.champs.period.apres}.`);
      }
      b = b.replace(/\*Recoupement :\* \*\*[ABC]\*\*\.( \[Contrôle\]\([^)]*\))?/, () =>
        `*Recoupement :* **${d.niveau_recoupement}**.` + (d.url_source ? ` [Contrôle](${d.url_source})` : ''));
      const ligneNote = `*Note d’audit ${v} :* ${joindre(cs)}`;
      return b.replace(/\s+$/, '') + `  \n${ligneNote}`;
    }, `notice de registre ${id}`);
    // Fiche approfondie eventuelle : en-tete de recoupement et source.
    const reFiche = new RegExp(`(### ${id} — [^\\n]*\\n[\\s\\S]*?)(?=\\n### |\\n## )`);
    if (reFiche.test(md)) {
      md = md.replace(reFiche, (f) => {
        let g = f.replace(/\*\*Recoupement documentaire :\*\* [^\n]*/, `**Recoupement documentaire :** ${d.niveau_recoupement} — ${d.nature_source}`);
        for (const c of cs) if (c.champs.period) g = g.replace(`**Période diégétique :** ${c.champs.period.avant}`, `**Période diégétique :** ${c.champs.period.apres}`);
        if (d.url_source && !g.includes(d.url_source)) g = g.replace(/\s+$/, '') + `\n\n**Source secondaire/éditoriale de contrôle (${v}) :** ${d.url_source}  \n`;
        return g;
      });
    }
  }

  // Corrections factuelles (hors recoupement) : section dediee, sous-titre de version.
  const factuelles = journal.corrections.filter((c) => c.type === 'correction');
  if (factuelles.length) {
    const lignes = factuelles.map((c) => `- **${c.id}** — ${parId.get(c.id).event}. *Motif :* ${c.motif}`).join('\n');
    remplacer(/(## Corrections documentées[^\n]*\n[\s\S]*?)(\n## )/, (m, corps, suite) =>
      `${corps.replace(/\s+$/, '')}\n\n### ${v} (${journal.date})\n\n${lignes}\n${suite}`, 'section des corrections');
  }

  // Titre, etat et synthese chiffree de la nouvelle version.
  const n = (lettre) => records.filter((r) => r.data.niveau_recoupement === lettre).length;
  remplacer(/^# Atlas politique de Star Trek — V\d+\.\d+ : .*$/m, () => `# ${journal.titre}`, 'titre');
  remplacer(/^> État : [^.]*\./m, () => `> État : ${journal.date_longue}.`, 'ligne d’état');
  const synth = `**Mise à jour ${v} (${journal.date_longue}).** ${journal.resume} Répartition ${v} : **${n('A')} entrées de niveau A**, **${n('B')} de niveau B**, **${n('C')} de niveau C** ; ${touches.size} entrées modifiées, chacune avec une note d’audit ${v}. Les chiffres ci-dessous sont ceux de la version précédente.`;
  remplacer(/(## Synthèse vérifiable\n\n)/, (m) => `${m}${synth}\n\n`, 'synthese');

  if (erreurs.length) throw new Error('Markdown :\n' + erreurs.join('\n'));
  const cible = `Star_Trek_Atlas_Politique_${v.replace('.', '_')}_${journal.date}`;
  return { cible, csv: '﻿' + serializeCsv(header, records.map((r) => r.data)).replace(/\n/g, '\r\n') + '\r\n', md, touches: touches.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const journal = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
  const r = appliquer(journal);
  for (const ext of ['csv', 'md']) {
    const p = path.join(SRC, `${r.cible}.${ext}`);
    fs.writeFileSync(p, r[ext]);
    console.log('écrit :', path.relative(ROOT, p));
  }
  console.log(`${r.touches} entrées modifiées. Lancer ensuite : npm run check`);
}
