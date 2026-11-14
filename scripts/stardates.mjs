#!/usr/bin/env node
// Dates stellaires dites a l'ecran (enrichissement hors corpus). Usage :
//
//   npm run import && npm run stardates && npm run check
//   node scripts/stardates.mjs            # garde les dates deja retenues, reinterroge le reste
//   node scripts/stardates.mjs --tout     # releve tout de nouveau (sans rien perdre sur echec)
//
// Le fichier commite est l'instantane de reference : un nouveau releve peut
// differer (pages modifiees, sites indisponibles). Une date deja retenue n'est
// jamais effacee par un releve en echec ; elle n'est retiree qu'a la main.
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


export const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’']/g, '').replace(/…/g, '...').replace(/&amp;/g, 'and').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ')
  .replace(/^(star trek )?(the )?/, '').replace(/ part (i+|\d)\b/, ' part $1')
  .replace(/\bhonour\b/g, 'honor').replace(/\bfavour\b/g, 'favor').replace(/ (\d)/g, '$1')
  .replace(/ part ii\b/, ' part 2').replace(/ part i\b/, ' part 1').trim();

// Dates de journal de bord (« Captain's log, stardate 42523.7 ») : une date citee
// dans un dialogue peut renvoyer a un autre evenement ; l'en-tete « Stardate: »
// ajoute par le transcripteur est ignore.
export function datesDeJournal(corps) {
  return [...new Set([...corps.matchAll(/\blog\b[^.!?]{0,60}?\bstardate,?\s+(\d{1,6}(?:\.\d+)?)/gi)].map((m) => m[1]))];
}
// Confirmation : la date figure telle quelle (nombre entier, pas un fragment) dans la page de l'episode.
export const confirmee = (d, wikitext) => new RegExp(`(^|[^\\d.])${d.replace('.', '\\.')}($|[^\\d])`).test(wikitext);
// Page d'episode ou de film, jamais une page d'homonymie ou de notion.
export const pageEpisode = (wikitext) => /\{\{sidebar (episode|film)/i.test(wikitext) && !/\{\{disambig/i.test(wikitext);

// Lecture avec delai d'expiration et trois essais. Renvoie { corps } ou
// { echec: true } (indisponible) ou { absent: true } (404). Les transcriptions
// sont en latin1, l'API Memory Alpha en UTF-8.
async function texte(url, enc = 'latin1') {
  for (let i = 0; i < 3; i++) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 30000);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: c.signal });
      if (r.ok) return { corps: Buffer.from(await r.arrayBuffer()).toString(enc) };
      if (r.status === 404) return { absent: true };
    } catch {} finally { clearTimeout(t); }
    await dormir(4000);
  }
  return { echec: true };
}

const indexes = new Map();
async function indexDe(serie) {
  const p = INDEX[serie];
  if (!p) return new Map();
  if (indexes.has(p)) return indexes.get(p);
  const lu = await texte(CK + p);
  if (!lu.corps) return null; // index indisponible : pas mis en cache, l'episode garde son releve
  const html = lu.corps;
  const base = CK + p.replace(/[^/]*$/, '');
  const m = new Map();
  for (const x of html.matchAll(/<a\s+href="([^"#]+\.html?)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const titre = x[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (titre && !/episodes|index|listing/i.test(x[1]) && !m.has(norm(titre))) m.set(norm(titre), new URL(x[1], base).href);
  }
  indexes.set(p, m);
  await dormir(1000);
  return m;
}

async function memoryAlpha(titre, serie, parties = 1) {
  // Films : la page porte le titre complet (« Star Trek: First Contact ») ; « First Contact (episode) » est un episode de TNG.
  // Episodes en plusieurs parties : une page par partie, dont les textes sont reunis.
  const t0 = titre.replace(/’/g, "'").replace(/…/g, '...');
  const maj = t0.replace(/\b([a-z])/g, (c) => c.toUpperCase());
  if (parties > 1) {
    const pages = [];
    for (const n of ['I', 'II', 'III'].slice(0, parties)) {
      const p = await unePage([`${t0}, Part ${n} (episode)`, `${maj}, Part ${n} (episode)`]);
      if (p) pages.push(p);
    }
    return pages.length ? { url: pages[0].url, wikitext: pages.map((p) => p.wikitext).join('\n') } : { echec: true };
  }
  const p = await unePage(serie === 'Film' ? [`Star Trek: ${t0}`, `Star Trek ${t0}`, t0] : [`${t0} (episode)`, `${maj} (episode)`, t0]);
  return p || { echec: true };
}
async function unePage(pages) {
  for (const page of pages) {
    const u = `https://memory-alpha.fandom.com/api.php?action=parse&page=${encodeURIComponent(page.replace(/ /g, '_'))}&prop=wikitext&format=json&formatversion=2&redirects=1`;
    const lu = await texte(u, 'utf8');
    await dormir(1000);
    if (!lu.corps) continue;
    try {
      const j = JSON.parse(lu.corps);
      if (j.parse?.wikitext && pageEpisode(j.parse.wikitext)) return { url: `https://memory-alpha.fandom.com/wiki/${encodeURIComponent(j.parse.title.replace(/ /g, '_'))}`, wikitext: j.parse.wikitext };
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
  for (const ep of [...eps.values()].sort((a, b) => cle(a).localeCompare(cle(b), 'en'))) {
    n++;
    if (!tout && deja.has(cle(ep)) && deja.get(cle(ep)).dates_stellaires.length) { sortie.push(deja.get(cle(ep))); continue; }
    const avant = deja.get(cle(ep));
    const r = { ...ep, dates_stellaires: [], transcription_url: null, memory_alpha_url: null, releve_le: new Date().toISOString().slice(0, 10) };
    const idx = await indexDe(ep.serie);
    if (!idx) { sortie.push(avant || { ...r, note: 'index des transcriptions indisponible' }); console.log(`${n}/${eps.size} ${cle(ep)} -> index indisponible, releve conserve`); continue; }
    // Titre exact, sinon toutes les parties d'un episode en plusieurs parties, dans l'ordre.
    const t = norm(ep.titre);
    const urls = idx.has(t) ? [idx.get(t)] : [...idx].filter(([k]) => k.startsWith(t + ' part')).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([, u]) => u);
    const ma = await memoryAlpha(ep.titre, ep.serie, urls.length);
    let echec = Boolean(ma.echec);
    if (!ma.echec) r.memory_alpha_url = ma.url;
    if (!urls.length) r.note = 'transcription introuvable';
    else {
      r.transcription_url = urls.length === 1 ? urls[0] : urls;
      let corps = '';
      for (const u of urls) { const lu = await texte(u); if (lu.echec) echec = true; corps += ' ' + (lu.corps || ''); await dormir(1000); }
      corps = corps.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      const dites = datesDeJournal(corps);
      const confirmees = dites.filter((d) => !ma.echec && confirmee(d, ma.wikitext));
      r.dates_stellaires = confirmees;
      if (dites.length && !confirmees.length) r.note = `date(s) prononcee(s) non confirmee(s) par Memory Alpha : ${dites.join(', ')}`;
      else if (!dites.length) r.note = 'aucune date stellaire prononcee dans la transcription';
      else if (confirmees.length < dites.length) r.note = `non confirmee(s) par Memory Alpha, ecartee(s) : ${dites.filter((d) => !confirmees.includes(d)).join(', ')}`;
    }
    // Jamais de perte sur echec : un releve incomplet ne remplace pas des dates deja retenues.
    if (avant?.dates_stellaires.length && (echec || !r.dates_stellaires.length)) { sortie.push(avant); console.log(`${n}/${eps.size} ${cle(ep)} -> releve ${echec ? 'en echec' : 'vide'}, dates conservees`); continue; }
    // Releve inchange : on garde sa date de releve.
    if (avant && JSON.stringify({ ...avant, releve_le: 0 }) === JSON.stringify({ ...r, releve_le: 0 })) r.releve_le = avant.releve_le;
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
