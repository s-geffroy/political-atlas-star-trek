#!/usr/bin/env node
// Verifie les liens internes d'un site construit (dossier _site ou autre),
// en tenant compte du prefixe baseurl. Usage :
//   node scripts/check-links.mjs <dossier_site> [/political-atlas-star-trek]
import fs from 'node:fs';
import path from 'node:path';

const racine = path.resolve(process.argv[2] || '_site');
const base = process.argv[3] ?? '/political-atlas-star-trek';
const fichiers = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : fichiers.push(p); } })(racine);
const pages = fichiers.filter((f) => f.endsWith('.html'));
const existe = (url) => {
  const sans = decodeURI(url.split('#')[0].split('?')[0]);
  if (!sans.startsWith(base + '/') && sans !== base) return false;
  let rel = sans.slice(base.length) || '/';
  const p = path.join(racine, rel);
  return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')));
};
const ancres = new Map();
const idsDe = (f) => {
  if (!ancres.has(f)) ancres.set(f, new Set([...fs.readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ancres.get(f);
};
let erreurs = 0;
let n = 0;
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|data:)/.test(u)) continue;
    n++;
    if (u.startsWith('#')) {
      if (u.length > 1 && !idsDe(f).has(u.slice(1))) { erreurs++; console.log(`ancre manquante : ${path.relative(racine, f)} -> ${u}`); }
      continue;
    }
    if (!u.startsWith('/')) { erreurs++; console.log(`lien relatif inattendu : ${path.relative(racine, f)} -> ${u}`); continue; }
    if (!existe(u)) { erreurs++; console.log(`lien cassé : ${path.relative(racine, f)} -> ${u}`); continue; }
    const [chemin, ancre] = u.split('#');
    if (ancre) {
      let cible = path.join(racine, decodeURI(chemin.split('?')[0]).slice(base.length));
      if (!cible.endsWith('.html')) cible = path.join(cible, 'index.html');
      if (fs.existsSync(cible) && !idsDe(cible).has(ancre)) { erreurs++; console.log(`ancre manquante : ${path.relative(racine, f)} -> ${u}`); }
    }
  }
}
console.log(`${pages.length} pages, ${n} liens internes contrôlés, ${erreurs} problème(s).`);
process.exit(erreurs ? 1 : 0);
