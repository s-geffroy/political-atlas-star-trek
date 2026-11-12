import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCsv, readRecords, serializeCsv } from '../scripts/lib/csv.mjs';
import { parseFiches, paragraphesApresPoint, liensCliquables } from '../scripts/lib/fiches.mjs';
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
  // Chaque entree recoit exactement une continuite connue (sans Object.groupBy, absent de Node 20).
  for (const e of gen) assert.ok(['principale', 'miroir', 'kelvin', 'modifiee'].includes(e.continuite), e.id);
  assert.equal(gen.length, 305);
});

test('periodes floues : jamais converties, cle de tri seulement', () => {
  assert.deepEqual(ordreDiegetique('XXIVe siècle'), { cle: 2301, precision: 'siecle', siecle: 24, imprecis: true, qualif: 4 });
  assert.equal(ordreDiegetique('Milieu XXIe siècle').qualif, 2);
  assert.equal(ordreDiegetique('Fin XXIe–début XXIIe').siecle_fin, 22);
  assert.equal(ordreDiegetique('Entre 2267 et la fin du XXIVe siècle, Miroir').siecle_fin, 24);
  assert.equal(ordreDiegetique('Début XXIIe siècle–2150').siecle_fin, undefined);
  assert.equal(ordreDiegetique('Entre 2267 et la fin du XXIVe siècle (événement relaté en 3191)').siecle_fin, 24);
  assert.equal(ordreDiegetique('Avant 2369').avant, true);
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

test('mise en page : URL nues rendues cliquables, ponctuation finale preservee', () => {
  assert.equal(liensCliquables('- Site : https://a.org/x et https://b.org.'), '- Site : <https://a.org/x> et <https://b.org>.');
  assert.equal(liensCliquables('[deja](https://c.org)'), '[deja](https://c.org)');
  assert.equal(liensCliquables('(voir https://en.wikipedia.org/wiki/Cardassians_(episode)).'), '(voir <https://en.wikipedia.org/wiki/Cardassians_(episode)>).');
  assert.equal(liensCliquables('(https://a.org/x)'), '(<https://a.org/x>)');
  assert.equal(liensCliquables('Source https://a.org/b_(c)_d, puis'), 'Source <https://a.org/b_(c)_d>, puis');
});

test('note d\'audit lisible : une etape par version, sans chemins internes, URL isolees', async () => {
  const { historiqueAudit } = await import('../scripts/lib/derive.mjs');
  const h = historiqueAudit('V0.4 (2026-11-10) : catégories (proposition validée le 2026-11-10, docs/proposition-categories.md) — recoupement B — voir https://en.wikipedia.org/wiki/A_(b). V0.5 (2026-11-10) : recoupement A (source officielle) — ok.');
  assert.equal(h.length, 2);
  assert.equal(h[0].version, 'V0.4');
  assert.equal(h[0].date, '10 novembre 2026');
  const t0 = h[0].segments.map((s) => s.texte || s.url).join('');
  assert.ok(!t0.includes('docs/'));
  assert.ok(t0.includes('niveau B'));
  assert.deepEqual(h[0].segments.filter((s) => s.url).map((s) => s.url), ['https://en.wikipedia.org/wiki/A_(b)']);
  assert.ok(h[1].segments[0].texte.startsWith('passage au niveau A'));
  // Tout le texte non technique est conserve.
  for (const e of gen) if (e.note_audit) assert.ok(e.audit.length > 0, e.id);
});

test('note d\'audit lisible : aucun texte perdu (hors chemins internes)', async () => {
  const { historiqueAudit } = await import('../scripts/lib/derive.mjs');
  const h = historiqueAudit('Constat initial. V0.4 (2026-11-10) : suite.');
  assert.equal(h.length, 2);
  assert.equal(h[0].version, null);
  assert.equal(h[0].segments[0].texte, 'Constat initial.');
  const mots = (t) => t.replace(/https?:\/\/\S+|docs\/\S+|\(source officielle\)|recoupement|corrigé\(s\)|corrigé|niveau|passage|au|Source|du|précédent|précédente|[ABC]\b/g, ' ').split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3);
  for (const e of gen) {
    if (!e.note_audit) continue;
    const affiche = e.audit.flatMap((x) => [x.version || '', ...x.segments.map((s) => s.texte || s.url)]).join(' ');
    for (const w of mots(e.note_audit)) assert.ok(affiche.includes(w) || /^\d{4}$/.test(w) || /^V\d/.test(w), `${e.id} : « ${w} » perdu`);
  }
});

test('ordre diegetique : imprecis apres les dates du siecle, « Avant N » avant N, intervalles entre siecles', () => {
  const rang = (id) => gen.find((e) => e.id === id).rang_diegetique;
  const parPeriode = (re) => gen.filter((e) => re.test(e.period) && e.continuite === 'principale');
  const max = (l) => Math.max(...l.map((e) => e.rang_diegetique)), min = (l) => Math.min(...l.map((e) => e.rang_diegetique));
  // « Milieu XXIe siecle » apres toutes les annees 20xx datees.
  assert.ok(min(parPeriode(/^Milieu XXIe/)) > max(parPeriode(/^20\d\d/)));
  // « Avant 2369 » avant les entrees de 2369.
  assert.ok(max(parPeriode(/^Avant 2369/)) < min(parPeriode(/^2369/)));
  // « Fin XXIe–debut XXIIe » apres le XXIe siecle, avant les dates du XXIIe.
  assert.ok(min(parPeriode(/^Fin XXIe/)) > max(parPeriode(/^20\d\d/)) && max(parPeriode(/^Fin XXIe/)) < min(parPeriode(/^21\d\d/)));
  for (const e of gen) assert.ok(rang(e.id) >= 1);
});

test('nouvelle-version : volets de fiche et textes corriges seulement si le texte « avant » est exact', async () => {
  const { appliquer } = await import('../scripts/nouvelle-version.mjs');
  const fs = await import('node:fs');
  const base = fs.readdirSync(new URL('../data/source/', import.meta.url)).filter((f) => f.endsWith('.csv'))
    .map((f) => f.replace(/^Star_Trek_Atlas_Politique_|\.csv$/g, ''))
    .sort((a, b) => { const [a1, a2] = a.split('_').map(Number), [b1, b2] = b.split('_').map(Number); return a1 - b1 || a2 - b2; })
    .pop(); // version la plus recente, ex. « 0_12_2026-11-12 »
  const md = fs.readFileSync(new URL(`../data/source/Star_Trek_Atlas_Politique_${base}.md`, import.meta.url), 'utf8');
  const avant = /^\*\*Contexte de création et diffusion\.\*\* (.+)$/m.exec(md.slice(md.indexOf('### STP-077')))[1];
  const lf = /^\*\*1966–1969 \(TOS\)\.\*\* (.{20})/m.exec(md)[1];
  const j = (av, t) => ({ version: 'V9.9', date: '2026-01-01', date_longue: '1er janvier 2026', base, titre: 'Atlas politique de Star Trek — V9.9 : test', resume: 'Test.',
    textes: [{ avant: t, apres: 'TEXTE-LF' }],
    corrections: [{ id: 'STP-077', type: 'correction', champs: {}, volets: { contexte: { avant: av, apres: 'NOUVEAU CONTEXTE.' } },
      sources_fiche: [{ libelle: 'Source de production', url: 'https://example.org/p' }], motif: 'test' }] });
  const r = appliquer(j(avant, lf));
  assert.ok(r.md.includes('**Contexte de création et diffusion.** NOUVEAU CONTEXTE.'));
  assert.ok(r.md.includes('**Source de production (V9.9) :** https://example.org/p'));
  assert.ok(r.md.includes('TEXTE-LF'));
  assert.throws(() => appliquer(j('texte inexistant', lf)), /introuvable/);
  assert.throws(() => appliquer(j(avant, 'texte absent du document')), /introuvable/);
});

test('nouvelle-version : chaque journal rejoue redonne le CSV publie a l\'identique', async () => {
  const { appliquer } = await import('../scripts/nouvelle-version.mjs');
  const fs = await import('node:fs');
  const dir = new URL('../data/corrections/', import.meta.url);
  for (const f of fs.readdirSync(dir).filter((x) => /^V\d+\.\d+\.json$/.test(x))) {
    const r = appliquer(JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8')));
    const publie = fs.readFileSync(new URL(`../data/source/${r.cible}.csv`, import.meta.url), 'utf8');
    assert.equal(r.csv, publie, f);
  }
});
