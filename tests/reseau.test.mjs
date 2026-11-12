// Reseau des relations, doublons et pages de renvoi : calcules depuis les
// sources (pas depuis _data/), pour ne pas dependre d'un import anterieur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { importer, dernieresSources, reseau } from '../scripts/import.mjs';

const src = dernieresSources();
const r = importer(src.csv, src.md);
const R = reseau(r);
const parId = new Map(r.evenements.map((e) => [e.id, e]));

test('reseau : chaque evenement relie appartient a un seul arc, arcs bornes', () => {
  const vus = new Map();
  for (const c of R.composantes) for (const id of c.ids) { assert.ok(!vus.has(id), `${id} dans deux arcs`); vus.set(id, c.cle); }
  for (const x of r.relations.filter((x) => parId.has(x.de) && parId.has(x.vers))) assert.ok(vus.has(x.de) && vus.has(x.vers));
  for (const c of R.composantes) {
    const series = new Set(c.ids.map((id) => parId.get(id).series[0] || 'Film'));
    assert.ok(c.taille <= R.seuil_decoupe || series.size === 1, `arc ${c.cle} trop grand et multi-series`);
    assert.equal(c.cle, [...c.ids].sort()[0]);
  }
});

test('reseau : toute relation est dessinee dans un arc ou listee entre deux arcs', () => {
  for (const x of r.relations.filter((x) => parId.has(x.de) && parId.has(x.vers))) {
    const dedans = R.composantes.some((c) => c.aretes.some((a) => a.de === x.de && a.vers === x.vers));
    const entre = R.composantes.some((c) => c.externes.some((a) => a.de === x.de && a.vers === x.vers));
    assert.ok(dedans || entre, `${x.de} > ${x.vers}`);
  }
});

test('reseau : cause/suite de gauche a droite ; un noeud « meme arc » seul n\'est pas rejete en tete', () => {
  for (const c of R.composantes) {
    const n = new Map(c.noeuds.map((x) => [x.id, x]));
    for (const a of c.aretes.filter((a) => a.type === 'cause' || a.type === 'suite')) assert.ok(n.get(a.de).x < n.get(a.vers).x, `${a.de} > ${a.vers}`);
    const orientes = new Set(c.aretes.filter((a) => a.type === 'cause' || a.type === 'suite').flatMap((a) => [a.de, a.vers]));
    // Un noeud sans relation orientee rejoint la couche de l'un de ses partenaires orientes.
    for (const x of c.noeuds.filter((x) => !orientes.has(x.id))) {
      const partenaires = c.aretes.filter((a) => a.de === x.id || a.vers === x.id).map((a) => (a.de === x.id ? a.vers : a.de)).filter((p) => orientes.has(p));
      if (partenaires.length) assert.ok(partenaires.some((p) => n.get(p).x === x.x), `${x.id} hors des couches de ${partenaires}`);
    }
    for (const x of c.noeuds) assert.ok(x.lignes.length >= 1 && x.lignes.length <= 2 && x.lignes.every((l) => l.t.length <= 31), x.id);
  }
});

test('doublons : secondaire canonique vers la principale, hors sitemap, page conservee', () => {
  const doublons = JSON.parse(fs.readFileSync(new URL('../data/doublons.json', import.meta.url), 'utf8')).doublons;
  for (const d of doublons) {
    const page = fs.readFileSync(new URL(`../_evenements/${d.secondaire}.md`, import.meta.url), 'utf8');
    assert.match(page, new RegExp(`canonical_url: \\S+/evenements/${d.principal}/`));
    assert.match(page, /^sitemap: false$/m);
    assert.equal(parId.get(d.secondaire).doublon_de.id, d.principal);
  }
  assert.equal(r.stats.distincts, r.stats.total - doublons.length);
});

test('renvois : chaque adresse d\'arc deja publiee mene a un arc existant', () => {
  const publiees = JSON.parse(fs.readFileSync(new URL('../data/reseau-cles-publiees.json', import.meta.url), 'utf8'));
  const cles = new Set(R.composantes.map((c) => c.cle));
  for (const k of publiees) {
    const f = new URL(`../reseau/${k}.md`, import.meta.url);
    assert.ok(fs.existsSync(f), `page /reseau/${k}/ absente`);
    const t = fs.readFileSync(f, 'utf8');
    if (!cles.has(k)) {
      const cible = (/^redirect_to: \/reseau\/(STP-\d{3})?\/?$/m.exec(t) || [])[1];
      assert.ok(cible === undefined || cles.has(cible), `renvoi ${k} -> ${cible} vers un arc inexistant`);
      assert.match(t, /^redirect_to: /m);
    }
  }
});

test('import idempotent : deux imports donnent les memes donnees', () => {
  const r2 = importer(src.csv, src.md);
  assert.deepEqual(r2.evenements, r.evenements);
  assert.deepEqual(reseau(r2), R);
});
