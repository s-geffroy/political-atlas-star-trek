// Garde-fou avant publication. Lance par `npm run verify` et par le hook
// .githooks/pre-push. Il echoue si :
// 1. l'arbre de travail n'est pas propre (ce qui est verifie doit etre ce qui
//    est pousse : un fichier modifie ou supprime sans commit fausserait tout) ;
// 2. une adresse deja publiee disparait par rapport a origin/main (registres
//    des identifiants et des arcs, billets du journal, pages ecrites a la main) :
//    un retour arriere ne doit pas casser de liens ;
// 3. les fichiers generes different des sources (import relance) ;
// 4. la validation ou les tests echouent, ou le rapport de qualite commite
//    differe de celui que produit la validation.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts });
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const echec = (msg) => { console.error(msg); process.exit(1); };

// 1. Arbre propre. Seuls des brouillons non suivis dans docs/ sont toleres
// (docs/ est exclu du site).
const sale = git('status', '--porcelain').split('\n').filter((l) => l && !/^\?\? docs\//.test(l));
if (sale.length) echec('Arbre de travail non propre : commiter ou annuler avant de publier.\n' + sale.join('\n'));

// 2. Aucune adresse publiee ne disparait.
const ref = (() => { try { git('rev-parse', '--verify', '--quiet', 'origin/main'); return 'origin/main'; } catch { return null; } })();
if (!ref) console.warn('origin/main introuvable : controle des adresses publiees saute.');
else {
  const json = (r, p) => { try { return JSON.parse(git('show', `${r}:${p}`)); } catch { return []; } };
  const fichiers = (r, d) => git('ls-tree', '-r', '--name-only', r, '--', d).split('\n').filter(Boolean);
  const permaliens = (r) => {
    const out = new Set();
    for (const f of git('ls-tree', '-r', '--name-only', r).split('\n')) {
      if (!/\.(md|html)$/.test(f) || /^(_|docs\/|data\/|specs\/|node_modules\/|\.)/.test(f) || /^(README|CLAUDE|CONTRIBUTING)\.md$/.test(f)) continue;
      const m = /^---\n[\s\S]*?^permalink:\s*(\S+)/m.exec(git('show', `${r}:${f}`));
      if (m) out.add(m[1]);
    }
    return out;
  };
  const manque = [];
  for (const p of ['data/ids-publies.json', 'data/reseau-cles-publiees.json']) {
    const ici = new Set(json('HEAD', p));
    for (const k of json(ref, p)) if (!ici.has(k)) manque.push(`${p} : ${k}`);
  }
  const posts = new Set(fichiers('HEAD', '_posts'));
  for (const f of fichiers(ref, '_posts')) if (!posts.has(f)) manque.push(`billet supprime : ${f}`);
  const ici = permaliens('HEAD');
  for (const p of permaliens(ref)) if (!ici.has(p)) manque.push(`adresse disparue : ${p}`);
  if (manque.length) echec('Des adresses deja publiees disparaitraient (corriger en avant plutot que revenir en arriere) :\n' + manque.join('\n'));
  console.log('Adresses publiees conservees.');
}

// 3. Fichiers generes a jour.
const GENERES = ['_data', '_evenements', 'atlas', 'analyses', 'reseau', 'docs/rapport-import.md',
  'data/ids-publies.json', 'data/reseau-cles-publiees.json'];
run('node', ['scripts/import.mjs'], { stdio: ['ignore', 'ignore', 'inherit'] });
let ecarts = git('status', '--porcelain', '--', ...GENERES).trim();
if (ecarts) echec('Fichiers generes differents des sources (relancer `npm run import` puis commiter ; une page ecrite a la main non commitee apparait aussi ici) :\n' + ecarts);
console.log('Fichiers generes a jour.');

// 4. Validation (qui reecrit le rapport de qualite, date de la version du corpus) et tests.
run('node', ['scripts/validate.mjs']);
ecarts = git('status', '--porcelain', '--', '_data/qualite.json', 'docs/rapport-qualite.md').trim();
if (ecarts) echec('Rapport de qualite commite different de celui de la validation (relancer `npm run check` puis commiter) :\n' + ecarts);
run('node', ['--test', 'tests/']);
