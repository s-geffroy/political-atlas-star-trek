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

// Cles des volets de fiche (journal) -> intitules du Markdown.
const VOLETS = {
  faits: 'Faits canoniques et acteurs', mecanisme: 'Mécanisme politique', parallele: 'Parallèle réel à étudier',
  objections: 'Objection et limites de l’analogie', contexte: 'Contexte de création et diffusion',
};
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
  const avertissements = [];
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
  // Remplacement exact d'UNE occurrence (le texte « apres » est insere tel quel :
  // pas d'interpretation de « $& »). `fins` : caracteres admis juste apres le
  // texte « avant », pour ne pas corriger le debut d'un texte plus long.
  const uneFois = (texte, avant, apres, quoi, signaler, fins = null) => {
    const pos = [];
    for (let i = texte.indexOf(avant); i !== -1; i = texte.indexOf(avant, i + 1)) {
      if (!fins || fins.includes(texte[i + avant.length] ?? '\n')) pos.push(i);
    }
    if (pos.length !== 1) { signaler(`${quoi} : ${pos.length ? 'plusieurs occurrences' : 'introuvable'}`); return texte; }
    return texte.slice(0, pos[0]) + apres + texte.slice(pos[0] + avant.length);
  };
  const erreur = (m) => erreurs.push(m);
  const avertir = (m) => avertissements.push(m);
  for (const [id, cs] of touches) {
    const d = parId.get(id);
    // Notice du registre integral : bloc « **STP-NNN — ... ** ... jusqu'a la notice suivante.
    const reBloc = new RegExp(`(\\*\\*${id} — [\\s\\S]*?)(?=\\n\\n\\*\\*STP-\\d{3} — |\\n\\n## |\\n\\n### |$)`);
    remplacer(reBloc, (bloc) => {
      let b = bloc;
      for (const c of cs) {
        if (c.champs.source) b = uneFois(b, `*Épisodes :* ${c.champs.source.avant}.`, `*Épisodes :* ${c.champs.source.apres}.`, `${id} : épisodes du registre`, erreur);
        if (c.champs.event) b = uneFois(b, `**${id} — ${c.champs.event.avant}**`, `**${id} — ${c.champs.event.apres}**`, `${id} : intitulé du registre`, erreur);
        if (c.champs.politics) b = uneFois(b, `*Problématique :* ${c.champs.politics.avant}`, `*Problématique :* ${c.champs.politics.apres}`, `${id} : problématique du registre`, erreur, ['.', ' ', '\n', '\r']);
        if (c.champs.period) b = uneFois(b, `*Temps fictionnel :* ${c.champs.period.avant}.`, `*Temps fictionnel :* ${c.champs.period.apres}.`, `${id} : période du registre`, erreur);
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
        // Titre de la fiche : suit l'intitule corrige.
        for (const c of cs) if (c.champs.event) g = uneFois(g, `### ${id} — ${c.champs.event.avant}\n`, `### ${id} — ${c.champs.event.apres}\n`, `${id} : titre de la fiche`, avertir);
        for (const c of cs) if (c.champs.period) g = uneFois(g, `**Période diégétique :** ${c.champs.period.avant}`, `**Période diégétique :** ${c.champs.period.apres}`, `${id} : période de la fiche`, avertir, [' ', '\n']);
        for (const c of cs) if (c.champs.source) g = uneFois(g, `**Source audiovisuelle :** ${c.champs.source.avant}`, `**Source audiovisuelle :** ${c.champs.source.apres}`, `${id} : source de la fiche`, avertir, [' ', '\n']);
        // Volets de fiche corriges : texte « avant » exact, present une seule fois.
        for (const c of cs) for (const [k, { avant, apres }] of Object.entries(c.volets || {})) {
          const label = VOLETS[k];
          if (!label) { erreurs.push(`${id} : volet ${k} inconnu`); continue; }
          const ancien = `**${label}.** ${avant}\n`;
          if (g.split(ancien).length !== 2) { erreurs.push(`${id} : volet « ${label} », texte « avant » introuvable ou multiple`); continue; }
          g = g.replace(ancien, () => `**${label}.** ${apres}\n`);
        }
        if (d.url_source && !g.includes(d.url_source)) g = g.replace(/\s+$/, '') + `\n\n**Source secondaire/éditoriale de contrôle (${v}) :** ${d.url_source}  \n`;
        // Sources ajoutees a la fiche (libelle commencant par « Source »).
        for (const c of cs) for (const src of c.sources_fiche || []) {
          if (!/^Source/.test(src.libelle) || !/^https?:\/\//.test(src.url)) { erreurs.push(`${id} : source de fiche mal formee`); continue; }
          if (!g.includes(src.url)) g = g.replace(/\s+$/, '') + `\n\n**${src.libelle} (${v}) :** ${src.url}  \n`;
        }
        return g;
      });
    }
  }

  // Textes editoriaux hors fiches (ex. « Lignes de force ») : remplacement exact, unique.
  for (const t of journal.textes || []) {
    if (md.split(t.avant).length !== 2) { erreurs.push(`Markdown : texte « ${t.avant.slice(0, 50)}… » introuvable ou multiple`); continue; }
    md = md.replace(t.avant, () => t.apres);
  }

  // Corrections factuelles (hors recoupement) : section dediee, sous-titre de version.
  const factuelles = journal.corrections.filter((c) => c.type === 'correction');
  if (factuelles.length) {
    const lignes = factuelles.map((c) => `- **${c.id}** — ${parId.get(c.id).event}. *Motif :* ${c.motif}`).join('\n');
    remplacer(/(## Corrections documentées[^\n]*\n[\s\S]*?)(\n## )/, (m, corps, suite) =>
      `${corps.replace(/\s+$/, '')}\n\n### ${v} (${journal.date})\n\n${lignes}\n${suite}`, 'section des corrections');
  }

  // Titre, etat et synthese chiffree de la nouvelle version.
  // Repartition sur les evenements distincts (doublons secondaires exclus), comme les statistiques du site.
  const pD = path.join(ROOT, 'data/doublons.json');
  const secondaires = new Set(fs.existsSync(pD) ? JSON.parse(fs.readFileSync(pD, 'utf8')).doublons.map((d) => d.secondaire) : []);
  const n = (lettre) => records.filter((r) => !secondaires.has(r.data.id) && r.data.niveau_recoupement === lettre).length;
  remplacer(/^# Atlas politique de Star Trek — V\d+\.\d+ : .*$/m, () => `# ${journal.titre}`, 'titre');
  remplacer(/^> État : [^.]*\./m, () => `> État : ${journal.date_longue}.`, 'ligne d’état');
  const synth = `**Mise à jour ${v} (${journal.date_longue}).** ${journal.resume} Répartition ${v} (événements distincts, doublons exclus) : **${n('A')} de niveau A**, **${n('B')} de niveau B**, **${n('C')} de niveau C** ; ${touches.size} entrées modifiées, chacune avec une note d’audit ${v}.`;
  remplacer(/(## Synthèse vérifiable\n\n)/, (m) => `${m}${synth}\n\n`, 'synthese');

  if (erreurs.length) throw new Error('Markdown :\n' + erreurs.join('\n'));
  const cible = `Star_Trek_Atlas_Politique_${v.replace('.', '_')}_${journal.date}`;
  return { avertissements, cible, csv: '﻿' + serializeCsv(header, records.map((r) => r.data)).replace(/\n/g, '\r\n') + '\r\n', md, touches: touches.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const journal = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
  const r = appliquer(journal);
  for (const ext of ['csv', 'md']) {
    const p = path.join(SRC, `${r.cible}.${ext}`);
    fs.writeFileSync(p, r[ext]);
    console.log('écrit :', path.relative(ROOT, p));
  }
  for (const a of r.avertissements) console.warn('avertissement :', a);
  console.log(`${r.touches} entrées modifiées. Lancer ensuite : npm run check`);
}
