// Garde-fou avant publication : les fichiers generes doivent correspondre aux
// sources. Relance l'import, puis echoue si le depot differe (fichier genere
// modifie, ajoute ou supprime sans avoir ete commite), puis valide et teste.
// Lance par `npm run verify` et par le hook .githooks/pre-push.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit', ...opts });

// Sorties de scripts/import.mjs. _data/qualite.json et docs/rapport-qualite.md
// (scripts/validate.mjs) portent la date du jour : exclus de la comparaison.
const GENERES = ['_data', '_evenements', 'atlas', 'analyses', 'reseau', 'docs/rapport-import.md',
  'data/ids-publies.json', 'data/reseau-cles-publiees.json', ':(exclude)_data/qualite.json'];

run('node', ['scripts/import.mjs'], { stdio: ['ignore', 'ignore', 'inherit'] });
const ecarts = execFileSync('git', ['status', '--porcelain', '--', ...GENERES], { cwd: ROOT, encoding: 'utf8' }).trim();
if (ecarts) {
  console.error('Fichiers generes differents des sources (relancer `npm run import` puis commiter) :\n' + ecarts);
  process.exit(1);
}
console.log('Fichiers generes a jour.');
run('node', ['scripts/validate.mjs']);
run('node', ['--test', 'tests/']);
