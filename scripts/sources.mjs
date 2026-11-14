#!/usr/bin/env node
// Copies archivees des sources (enrichissement hors corpus). Usage :
//
//   npm run import && npm run sources && npm run check
//   node scripts/sources.mjs            # reprend les URL deja archivees, reinterroge les autres
//   node scripts/sources.mjs --tout     # reinterroge toutes les URL (statuts HTTP a jour ; copies jamais perdues)
//
// Pour chaque URL citee par le corpus (source de controle, sources des fiches),
// les relations et les dates de diffusion :
// - copie archivee : derniere capture web.archive.org en statut 200 (API CDX,
//   lecture seule ; aucune demande d'archivage n'est envoyee) ;
// - statut HTTP de la page vivante (User-Agent honnete ; une page qui refuse
//   les clients automatises est notee telle quelle, sans contournement).
// Ecrit data/archives.json, lu par scripts/import.mjs. Ce script appelle le
// reseau : il ne fait pas partie de `npm run check`.

import fs from 'node:fs';
import path from 'node:path';
import { importer, dernieresSources } from './import.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SORTIE = path.join(ROOT, 'data/archives.json');
const UA = 'political-atlas-star-trek/1.0 (verification des sources)';
const PAUSE = 1500;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

export function urlsCitees() {
  const r = importer(...Object.values(dernieresSources()));
  const urls = new Set();
  for (const { data } of r.records) if (/^https?:\/\//.test(data.url_source)) urls.add(data.url_source);
  for (const f of r.fiches) for (const s of f.sources) urls.add(s.url);
  const rel = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/relations.json'), 'utf8'));
  for (const x of rel.relations) { if (x.url) urls.add(x.url); if (x.url_complementaire) urls.add(x.url_complementaire); }
  const diff = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/diffusion.json'), 'utf8'));
  const tous = [...(diff.series || []), ...(diff.films || []), ...(diff.episodes || []), ...(diff.series || []).flatMap((s) => s.saisons || [])];
  for (const x of tous) if (x.source_url) urls.add(x.source_url);
  // Une copie d'archive citee directement est deja une archive.
  return [...urls].filter((u) => !/^https?:\/\/web\.archive\.org\//.test(u)).sort();
}

async function obtenir(url, opts = {}) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 30000);
  try { return await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: c.signal, ...opts }); }
  finally { clearTimeout(t); }
}

// startrek.com sert les memes articles sous /news/ et /en-un/news/ : une copie de
// l'une vaut pour l'autre (meme page, autre prefixe de langue).
const variantes = (url) => {
  const v = [url];
  const m = /^https?:\/\/(?:www\.)?startrek\.com\/(en-un\/)?(.*)$/.exec(url);
  if (m) v.push(`https://www.startrek.com/${m[1] ? '' : 'en-un/'}${m[2]}`);
  return v;
};

async function archive(url) {
  let r;
  for (const u of variantes(url)) { r = await archive1(u); if (r.archive) return r; }
  return r;
}

async function archive1(url) {
  const q = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=-1&filter=statuscode:200&fl=timestamp,original`;
  for (let essai = 0; essai < 3; essai++) {
    try {
      const r = await obtenir(q);
      if (r.status === 429 || r.status >= 500) { await dormir(10000 * (essai + 1)); continue; }
      if (r.status === 403) return { archive: null, archive_exclue: true }; // site exclu de la Wayback Machine
      const j = await r.json();
      if (j.length < 2) return { archive: null };
      const [ts, orig] = j[j.length - 1];
      return { archive: `https://web.archive.org/web/${ts}/${orig}`, archive_date: `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}` };
    } catch { await dormir(5000); }
  }
  return { archive: undefined }; // non determine (service indisponible)
}

async function vivant(url) {
  try {
    const r = await obtenir(url);
    return { statut_http: r.status };
  } catch (e) { return { statut_http: null, erreur: e.name === 'AbortError' ? 'delai' : 'reseau' }; }
}

async function main() {
  const tout = process.argv.includes('--tout');
  const prec = fs.existsSync(SORTIE) ? JSON.parse(fs.readFileSync(SORTIE, 'utf8')).sources : {};
  const urls = urlsCitees();
  const sources = {};
  let n = 0;
  for (const url of urls) {
    n++;
    if (!tout && prec[url]?.archive) { sources[url] = prec[url]; continue; }
    const a = await archive(url);
    await dormir(PAUSE);
    const v = await vivant(url);
    // Jamais de perte sur echec : une copie deja connue est gardee si le service ne repond pas
    // ou ne la retrouve plus (la Wayback Machine ne supprime pas ses captures).
    const garde = prec[url]?.archive && !a.archive ? { archive: prec[url].archive, archive_date: prec[url].archive_date } : a;
    sources[url] = { ...garde, ...v, teste_le: new Date().toISOString().slice(0, 10) };
    process.stdout.write(`${n}/${urls.length} ${v.statut_http ?? v.erreur} ${a.archive ? 'archive' : a.archive === null ? 'SANS copie' : 'archive ?'} ${url}\n`);
    await dormir(PAUSE);
  }
  const doc = {
    _lisez_moi: 'Genere par scripts/sources.mjs (ne pas modifier a la main). archive : derniere copie web.archive.org en statut 200 (null : aucune copie ; archive_exclue : site exclu de la Wayback Machine ; absent : non determine). statut_http : reponse de la page vivante a un client automatise honnete.',
    sources,
  };
  fs.writeFileSync(SORTIE, JSON.stringify(doc, null, 1) + '\n');
  const v = Object.values(sources);
  console.log(`${v.length} URL ; ${v.filter((x) => x.archive).length} avec copie archivee, ${v.filter((x) => x.archive === null).length} sans, ${v.filter((x) => x.archive === undefined).length} non determinees ; ${v.filter((x) => x.statut_http !== 200).length} pages vivantes hors statut 200.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
