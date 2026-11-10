import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCsv, readRecords, serializeCsv } from '../scripts/lib/csv.mjs';
import { parseFiches, paragraphesApresPoint } from '../scripts/lib/fiches.mjs';
import { episodesDe, continuite, ordreDiegetique } from '../scripts/lib/derive.mjs';
import { importer, dernieresSources } from '../scripts/import.mjs';
import { valider } from '../scripts/validate.mjs';

const src = dernieresSources();
const r = importer(src.csv, src.md);
const gen = JSON.parse(fs.readFileSync(new URL('../_data/evenements.json', import.meta.url), 'utf8'));

test('parseur CSV : BOM, guillemets, separateur et retours a la ligne', () => {
  const rows = parseCsv('﻿a;b;c\r\n1;"x; y";"dit ""non"""\n2;"multi\nligne";\n');
  assert.deepEqual(rows, [['a', 'b', 'c'], ['1', 'x; y', 'dit "non"'], ['2', 'multi\nligne', '']]);
});

test('parseur CSV : une ligne au mauvais nombre de champs est rejetee, pas tronquee', () => {
  const { records, rejects } = readRecords('a;b\n1;2\n3;4;5\n');
  assert.equal(records.length, 1);
  assert.equal(rejects.length, 1);
  assert.equal(rejects[0].line, 3);
});

test('305 entrees importees, aucun rejet, identifiants STP-001..STP-305', () => {
  assert.equal(r.records.length, 305);
  assert.equal(r.rejects.length, 0);
  const ids = r.records.map((x) => x.data.id);
  assert.equal(new Set(ids).size, 305);
  for (let i = 1; i <= 305; i++) assert.ok(ids.includes(`STP-${String(i).padStart(3, '0')}`));
});

test('aller-retour sans perte : CSV reconstruit depuis les donnees publiees', () => {
  const text = fs.readFileSync(src.csv, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\n+$/, '');
  assert.equal(serializeCsv(r.header, gen.map((e) => Object.fromEntries(r.header.map((h) => [h, e[h]])))), text);
});

test('31 fiches approfondies, chacune associee a une entree existante et complete', () => {
  assert.equal(r.fiches.length, 31);
  for (const f of r.fiches) {
    assert.ok(r.records.some((x) => x.data.id === f.id), f.id);
    assert.equal(Object.keys(f.volets).length, 5, f.id);
    assert.equal(gen.find((e) => e.id === f.id).fiche, true);
  }
  assert.equal(gen.filter((e) => e.fiche).length, 31);
});

test('fiche : extraction exacte sur un exemple minimal', () => {
  const md = '## Cas approfondis\n\n### STP-999 — Titre\n\n**Période diégétique :** 2400  \n**Source audiovisuelle :** X «Y»  \n**Recoupement documentaire :** C — test\n\n**Faits canoniques et acteurs.** F.\n\n**Mécanisme politique.** M.\n\n**Parallèle réel à étudier.** P.\n\n**Objection et limites de l’analogie.** O.\n\n**Contexte de création et diffusion.** C.\n\n**Source secondaire/éditoriale de contrôle :** https://exemple.org/a  \n\n## Suite\n';
  const { fiches, problems } = parseFiches(md);
  assert.deepEqual(problems, []);
  assert.equal(fiches[0].id, 'STP-999');
  assert.equal(fiches[0].volets.objections, 'O.');
  assert.deepEqual(fiches[0].sources, [{ libelle: 'Source secondaire/éditoriale de contrôle', url: 'https://exemple.org/a' }]);
});

test('serie : heritage du sigle precedent, aucun rattachement par connaissance exterieure', () => {
  assert.deepEqual(episodesDe('ENT «Demons»; «Terra Prime»').episodes, [{ serie: 'ENT', titre: 'Demons' }, { serie: 'ENT', titre: 'Terra Prime' }]);
  assert.deepEqual(episodesDe('ENT; First Contact').nonRattaches, ['First Contact']);
  assert.deepEqual(episodesDe('PIC fin de saison 1; S3').nonRattaches, []);
});

test('continuites : Miroir, Kelvin et temporalites modifiees separees', () => {
  const c = (period, cycle = '', event = '') => continuite({ period, cycle, event }).code;
  assert.equal(c('2258 (Kelvin)'), 'kelvin');
  assert.equal(c('XXIIIe siècle Miroir'), 'miroir');
  assert.equal(c('2266, branche temporelle', 'Univers Miroir et réalités parallèles'), 'modifiee');
  assert.equal(c('2373'), 'principale');
  const parCode = Object.groupBy ? Object.groupBy(gen, (e) => e.continuite) : null;
  if (parCode) assert.equal(Object.values(parCode).reduce((s, a) => s + a.length, 0), 305);
});

test('periodes floues : jamais converties, cle de tri seulement', () => {
  assert.deepEqual(ordreDiegetique('XXIVe siècle'), { cle: 2301, precision: 'siecle' });
  assert.deepEqual(ordreDiegetique('Passé lointain'), { cle: null, precision: 'passe_lointain' });
  assert.equal(ordreDiegetique('2260s').precision, 'decennie');
  for (const e of gen) assert.equal(e.period, r.records.find((x) => x.data.id === e.id).data.period);
});

test('dates de diffusion : toutes sourcees', () => {
  for (const e of gen) for (const d of e.diffusion) assert.match(d.source_url, /^https:\/\//);
});

test('validateur : aucune erreur bloquante', () => {
  const b = valider(src);
  assert.equal(b.erreurs, 0, JSON.stringify(b.controles.filter((c) => c.erreurs.length), null, 1));
  assert.equal(b.controles.length, 10);
});

test('pages generees : une par identifiant, front matter coherent', () => {
  const dir = new URL('../_evenements/', import.meta.url);
  const files = fs.readdirSync(dir);
  assert.equal(files.length, 305);
  for (const f of files) {
    const t = fs.readFileSync(new URL(f, dir), 'utf8');
    assert.match(t, new RegExp(`^stp: ${f.replace('.md', '')}$`, 'm'));
    assert.match(t, /^layout: evenement$/m);
    assert.match(t, new RegExp(`^permalink: /evenements/${f.replace('.md', '')}/$`, 'm'));
    assert.match(t, /^title: ".+"$/m);
  }
});

test('mise en page : paragraphe apres un point, listes et tableaux intacts, texte inchange', () => {
  const md = '**Point 1 :** a. Fin.\n**Point 2 :** b\nsuite.\n- x.\n- y.\n| a |\n| b |';
  const out = paragraphesApresPoint(md);
  assert.equal(out, '**Point 1 :** a. Fin.\n\n**Point 2 :** b\nsuite.\n- x.\n- y.\n| a |\n| b |');
  assert.equal(out.replace(/\n+/g, ' '), md.replace(/\n+/g, ' '));
});
