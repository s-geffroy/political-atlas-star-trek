#!/usr/bin/env node
// Dates stellaires dites a l'ecran (enrichissement hors corpus). Usage :
//
//   node scripts/stardates.mjs            # garde les dates deja retenues, reinterroge le reste
//   node scripts/stardates.mjs --tout     # releve tout de nouveau
//
// Pour chaque episode cite par le corpus, une date stellaire n'est retenue que
// si deux sources concordent :
// - elle est prononcee dans un journal de bord de l'episode (« Captain's log,
//   stardate 42523.7 » dans la transcription chakoteya.net ; l'en-tete
//   « Stardate: », ajoute par le transcripteur, et les dates citees en dialogue
//   sont ignores) ;
// - elle figure aussi sur la page de l'episode de Memory Alpha (API MediaWiki).
// L'annee n'est jamais ecrite ici : elle est deduite a l'affichage, pour les
// seules dates de l'ere TNG (anneeDeduite, scripts/lib/derive.mjs). Lecture seule, User-Agent
// honnete, une requete par seconde environ. Ecrit data/stardates.json, lu par
// scripts/import.mjs. Ce script appelle le reseau : il ne fait pas partie de
// `npm run check`.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SORTIE = path.join(ROOT, 'data/stardates.json');
const UA = 'political-atlas-star-trek/1.0 (verification des sources)';
const CK = 'http://www.chakoteya.net/';
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// Index des transcriptions par serie (codes du corpus).
const INDEX = {
  TOS: 'StarTrek/episodes.htm', TAS: 'StarTrek/episodes.htm', TNG: 'NextGen/episodes.htm', DS9: 'DS9/episodes.htm',
  VOY: 'Voyager/episode_listing.htm', ENT: 'Enterprise/episodes.htm', DIS: 'STDisco17/episodes.html',
  PIC: 'StarTrekPIC/episodes.html', SNW: 'StarTrekSNW/episodes.html', LD: 'StarTrekLD/episodes.html',
  PRO: 'STProdigy/episodes.html', SFA: 'SFAcad/episodes.html', Film: 'movies/index.htm',
};


const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’']/g, '').replace(/&amp;/g, 'and').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ')
  .replace(/^(star trek )?(the )?/, '').replace(/ part (i+|\d)\b/, ' part $1')
  .replace(/\bhonour\b/g, 'honor').replace(/\bfavour\b/g, 'favor').replace(/ (\d)/g, '$1').trim();

async function texte(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.ok) return Buffer.from(await r.arrayBuffer()).toString('latin1');
      if (r.status === 404) return null;
    } catch {}
    await dormir(4000);
  }
  return null;
}

const indexes = new Map();
async function indexDe(serie) {
  const p = INDEX[serie];
  if (!p) return new Map();
  if (indexes.has(p)) return indexes.get(p);
  const html = (await texte(CK + p)) || '';
  const base = CK + p.replace(/[^/]*$/, '');
  const m = new Map();
  for (const x of html.matchAll(/<a\s+href="([^"#]+\.html?)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const titre = x[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (titre && !/episodes|index|listing/i.test(x[1])) m.set(norm(titre), new URL(x[1], base).href);
  }
  indexes.set(p, m);
  await dormir(1000);
  return m;
}

async function memoryAlpha(titre, serie) {
  // Films : la page porte le titre complet (« Star Trek: First Contact ») ; « First Contact (episode) » est un episode de TNG.
  const maj = titre.replace(/\b([a-z])/g, (c) => c.toUpperCase());
  const pages = serie === 'Film' ? [`Star Trek: ${titre}`, `Star Trek ${titre}`, titre] : [`${titre} (episode)`, `${maj} (episode)`, titre];
  for (const page of pages) {
    const u = `https://memory-alpha.fandom.com/api.php?action=parse&page=${encodeURIComponent(page.replace(/ /g, '_'))}&prop=wikitext&format=json&formatversion=2&redirects=1`;
    const t = await texte(u);
    await dormir(1000);
    if (!t) continue;
    try {
      const j = JSON.parse(t);
      if (j.parse?.wikitext) return { url: `https://memory-alpha.fandom.com/wiki/${encodeURIComponent(j.parse.title.replace(/ /g, '_'))}`, wikitext: j.parse.wikitext };
    } catch {}
  }
  return null;
}

async function main() {
  const tout = process.argv.includes('--tout');
  const prec = fs.existsSync(SORTIE) ? JSON.parse(fs.readFileSync(SORTIE, 'utf8')).episodes : [];
  const cle = (e) => `${e.serie}|${e.titre}`;
  const deja = new Map(prec.map((e) => [cle(e), e]));
  const evts = JSON.parse(fs.readFileSync(path.join(ROOT, '_data/evenements.json'), 'utf8'));
  const eps = new Map();
  for (const e of evts) for (const p of e.episodes) eps.set(cle(p), { serie: p.serie, titre: p.titre });
  const sortie = [];
  let n = 0;
  for (const ep of [...eps.values()].sort((a, b) => cle(a).localeCompare(cle(b)))) {
    n++;
    if (!tout && deja.has(cle(ep)) && deja.get(cle(ep)).dates_stellaires.length) { sortie.push(deja.get(cle(ep))); continue; }
    const r = { ...ep, dates_stellaires: [], transcription_url: null, memory_alpha_url: null, releve_le: new Date().toISOString().slice(0, 10) };
    const idx = await indexDe(ep.serie);
    // Titre exact, sinon toutes les parties d'un episode en plusieurs parties.
    const t = norm(ep.titre);
    const urls = idx.has(t) ? [idx.get(t)] : [...idx].filter(([k]) => k.startsWith(t + ' part')).map(([, u]) => u);
    const ma = await memoryAlpha(ep.titre, ep.serie);
    if (ma) r.memory_alpha_url = ma.url;
    if (!urls.length) r.note = 'transcription introuvable';
    else {
      r.transcription_url = urls.length === 1 ? urls[0] : urls;
      let corps = '';
      for (const u of urls) { corps += ' ' + ((await texte(u)) || ''); await dormir(1000); }
      corps = corps.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      // Dates de journal de bord (« Captain's log, stardate 42523.7 ») : une date citee
      // dans un dialogue peut renvoyer a un autre evenement ; l'en-tete « Stardate: » est ignore.
      const dites = [...new Set([...corps.matchAll(/\blog\b[^.!?]{0,60}?\bstardate,?\s+(\d{1,6}(?:\.\d+)?)/gi)].map((m) => m[1]))];
      const confirmees = dites.filter((d) => ma && new RegExp(`(^|[^\\d.])${d.replace('.', '\\.')}($|[^\\d])`).test(ma.wikitext));
      r.dates_stellaires = confirmees;
      if (dites.length && !confirmees.length) r.note = `date(s) prononcee(s) non confirmee(s) par Memory Alpha : ${dites.join(', ')}`;
      else if (!dites.length) r.note = 'aucune date stellaire prononcee dans la transcription';
      else if (confirmees.length < dites.length) r.note = `non confirmee(s) par Memory Alpha, ecartee(s) : ${dites.filter((d) => !confirmees.includes(d)).join(', ')}`;
    }
    sortie.push(r);
    process.stdout.write(`${n}/${eps.size} ${cle(ep)} -> ${r.dates_stellaires.join(', ') || '-'}${r.note ? ` (${r.note})` : ''}\n`);
  }
  const doc = {
    _lisez_moi: [
      'Genere par scripts/stardates.mjs (ne pas modifier a la main). Une date stellaire n est retenue que si elle est prononcee dans l episode (transcription chakoteya.net) ET figure sur la page Memory Alpha de l episode.',
      'L annee n est pas stockee : elle est deduite a l affichage pour les dates de 41000 a 79999 (convention de l ere TNG, 41xxx = 2364).',
    ],
    episodes: sortie,
  };
  fs.writeFileSync(SORTIE, JSON.stringify(doc, null, 1) + '\n');
  const avec = sortie.filter((e) => e.dates_stellaires.length).length;
  console.log(`${sortie.length} episodes ; ${avec} avec au moins une date stellaire retenue ; ${sortie.filter((e) => !e.transcription_url).length} sans transcription trouvee.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
