# Star Trek Political Atlas

*Atlas politique, historique et sociologique de l'univers Star Trek* -- site
documentaire en francais, publie par **GitHub Pages** (constructeur Jekyll
natif) a l'adresse :

<https://s-geffroy.github.io/political-atlas-star-trek/>

Projet independant, non affilie a Paramount / CBS Studios.

Les chiffres du corpus (entrees, evenements distincts, niveaux, relations)
changent a chaque version : ils sont calcules dans `_data/stats.json` et
affiches sur la page d'accueil. Ce README n'en recopie aucun.

## Contenu

| Page | Adresse | Source des donnees |
|---|---|---|
| Accueil (tableau de bord) | `/` | `_data/stats.json` |
| Explorateur (recherche, filtres, URL partageable) | `/evenements/` | `_data/evenements.json` |
| Une fiche par entree du corpus | `/evenements/STP-NNN/` | `_data/evenements.json`, `_data/fiches.json` |
| Chronologie diegetique / de diffusion / series / films | `/chronologie/`, `/chronologie/diffusion/`, `/chronologie/series/`, `/chronologie/films/` | `_data/evenements.json`, `_data/diffusion.json` |
| Atlas thematique (un domaine par page) | `/atlas/`, `/atlas/<domaine>/` | `_data/atlas.json` |
| Fiction et histoire reelle | `/analyses/`, `/analyses/emeutes-de-bell/`, `/analyses/STP-NNN/` (une par fiche approfondie) | `_data/fiches.json`, `_data/periodes.json` |
| Graphiques comparatifs | `/graphiques/` | `_data/graphiques.json` |
| Reseau des relations | `/reseau/` (vue d'ensemble), `/reseau/STP-NNN/` (un graphe par groupe, ou page de renvoi) | `_data/reseau.json` (calcule depuis `data/relations.json`) |
| Methodologie, limites, rapport de qualite | `/methodologie/` | `_data/editorial.json`, `_data/qualite.json`, `_data/stats.json` |
| Contribuer | `/contribuer/` | -- |

## Architecture

Le site est construit par **GitHub**, au `git push`, avec Jekyll 3.10 en safe
mode (aucun workflow GitHub Actions). Le constructeur natif ne peut pas
executer Node : un import en Node -- **sans aucune dependance npm** --
transforme donc les sources en donnees et pages Jekyll, qui sont commitees.

### Entrees (modifiees a la main)

```
data/source/              CSV + Markdown du corpus, une paire par version ; jamais modifies en place
data/corrections/         journaux V0.N.json : passage d'une version du corpus a la suivante
data/doublons.json        doublons tranches (secondaire -> principale), sans suppression
data/relations.json       relations documentees (cause, suite, meme arc), chacune sourcee
data/diffusion.json       dates de diffusion relevees, chacune avec sa source
data/analyses-redigees.json  analyses redigees a la main (fiche, fichier, adresse) : voir docs/procedures.md, 6
```

Doublons, relations et diffusion sont des enrichissements hors corpus : les
modifier ne demande pas de nouvelle version du corpus.

### Releves reseau (generes par un script, commites comme instantanes)

```
data/archives.json        copies archivees des sources et statut HTTP (scripts/sources.mjs)
data/stardates.json       dates stellaires des journaux de bord (scripts/stardates.mjs ; annee deduite a l affichage, ere TNG seulement)
```

Ne pas les modifier a la main ; les relancer selon `docs/procedures.md`, 7.
Un nouveau releve peut differer du precedent (sites modifies ou indisponibles) :
le fichier commite est l'instantane de reference, et aucun des deux scripts
n'efface une donnee deja retenue sur un echec reseau.

### Fichiers generes (ne pas modifier a la main)

Le prochain import ecrase toute modification manuelle.

| Fichier | Produit par | Contenu |
|---|---|---|
| `_data/*.json` (sauf `qualite.json`) | `scripts/import.mjs` | donnees lues par les gabarits |
| `_data/qualite.json` | `scripts/validate.mjs` | bilan des controles (date de la version du corpus) |
| `_evenements/STP-*.md` | `scripts/import.mjs` | une page par entree |
| `atlas/*.md` | `scripts/import.mjs` | une page par domaine (`atlas/index.html` est ecrit a la main) |
| `analyses/STP-*.md` | `scripts/import.mjs` | une page par fiche approfondie, sauf les analyses redigees a la main (`analyses/*.html`, liste dans `data/analyses-redigees.json`) ; `analyses/index.html` est ecrit a la main |
| `reseau/STP-*.md` | `scripts/import.mjs` | une page par groupe du reseau, et une page de renvoi par adresse de groupe deja publiee qui n'est plus tete de groupe |
| `docs/rapport-import.md` | `scripts/import.mjs` | rapport d'import |
| `docs/rapport-qualite.md` | `scripts/validate.mjs` | rapport des 10 controles (date de la version du corpus) |

### Registres (generes, ne font que grandir)

| Fichier | Role |
|---|---|
| `data/ids-publies.json` | identifiants deja publies. Si l'un d'eux disparait de la source, la validation echoue : une URL publiee ne doit pas disparaitre. |
| `data/reseau-cles-publiees.json` | adresses `/reseau/STP-NNN/` deja publiees. Quand une cle n'est plus tete de groupe, l'import produit une page de renvoi vers l'arc qui contient desormais l'evenement. |

Ne « nettoyez » jamais un registre : chaque cle retiree fait disparaitre une
URL publiee.

### Code et presentation

```
scripts/lib/csv.mjs       parseur CSV (BOM, guillemets, « ; »)
scripts/lib/fiches.mjs    extraction des fiches approfondies et du registre Markdown
scripts/lib/derive.mjs    regles de derivation (serie, continuite, ordre)
scripts/lib/atlas.mjs     table domaines <-> categories
scripts/import.mjs        sources -> fichiers generes (voir tableau ci-dessus)
scripts/nouvelle-version.mjs  version N + journal -> version N+1
scripts/validate.mjs      10 controles documentaires
scripts/verify.mjs        garde-fou avant push (npm run verify, hook pre-push)
scripts/check-links.mjs   liens internes d'un site construit (prefixe compris)
scripts/sources.mjs       copies archivees (web.archive.org) et statut des sources -> data/archives.json (reseau, hors check)
scripts/stardates.mjs     dates stellaires des journaux de bord (transcription + Memory Alpha) -> data/stardates.json (reseau, hors check)
tests/                    node --test
.githooks/pre-push        hook versionne (lance scripts/verify.mjs)
_layouts/ _includes/      gabarits (pas de theme)
assets/css/atlas.css      systeme graphique
assets/js/explorateur.js  filtres de l'explorateur (amelioration progressive)
```

### Documentation (`docs/`, non publiee sur le site)

| Fichier | Contenu |
|---|---|
| `docs/procedures.md` | pas-a-pas : nouvelle version du corpus, doublon, relation, date de diffusion, retour arriere |
| `docs/journal-corrections.md` | format de `data/corrections/V0.N.json`, controles et effets de `nouvelle-version.mjs` |
| `docs/ameliorations.md` | historique des passes et travaux restants |
| `docs/proposition-*.md` | propositions editoriales soumises a validation, chacune avec sa ligne de statut |
| `docs/revue-*.md` | revues completes du projet |
| `docs/rapport-import.md`, `docs/rapport-qualite.md` | rapports generes |

## Commandes

Prerequis : Node 18 ou plus (deja present sur le VPS). Rien a installer.

```bash
npm run import     # sources -> fichiers generes
npm run validate   # 10 controles ; sort en erreur si un controle echoue
npm test           # tests automatises
npm run check      # les trois, dans l'ordre
npm run verify     # avant publication : fichiers generes a jour et commites, validation, tests
```

Verification optionnelle avec le constructeur officiel de GitHub Pages,
declare dans `compose.yaml` (service `pages-build`, profil `cli`, image
`ghcr.io/actions/jekyll-build-pages` en version epinglee). GitHub fait
avancer la sienne : en cas d'ecart, comparer avec
<https://pages.github.com/versions.json>.

```bash
sudo appctl run pages-build                          # construit dans _site/
node scripts/check-links.mjs _site /political-atlas-star-trek
```

`_site/` n'est jamais commite.

## Publier

```bash
npm run check
git add ... && git commit -m "..."
npm run verify
git push
```

**Le push est la publication.** La construction prend de une a cinq minutes ;
son deroulement et ses echecs sont visibles dans l'onglet **Actions** du depot.

### Garde-fou avant push

`npm run verify` relance l'import et echoue si un fichier genere (`_data/`,
`_evenements/`, `atlas/`, `analyses/`, `reseau/`, registres de `data/`,
`docs/rapport-import.md`) differe de ce qui est commite : donnee modifiee
sans import, ou import non commite. Il enchaine validation et tests. Il se
lance donc **apres** le commit : avant, il echoue des que l'import a change
un fichier.

Le hook versionne `.githooks/pre-push` lance cette verification a chaque push.
Activation, une fois par clone :

```bash
git config core.hooksPath .githooks
```

Contournement explicite et exceptionnel : `git push --no-verify`.

### Versions du corpus et retour arriere

Chaque version du corpus publiee porte un tag annote `corpus-vX.Y` sur son
commit (`git tag -l 'corpus-*'`). Separer les commits de donnees (corpus,
relations, doublons, diffusion) des commits de code ou de gabarits : un
retour arriere reste alors cible. Jamais de `push --force` sur `main`.

Les etapes completes (journal, commit, tag, `git revert`, precautions sur les
registres) sont dans [`docs/procedures.md`](docs/procedures.md).

Reglage a faire une fois : depot > **Settings** > **Pages** > *Deploy from a
branch*, branche `main`, dossier `/ (root)`.

## Mettre a jour le corpus

Deux voies, qui aboutissent au meme resultat :

- **Corrections tracees (recommande)** : ecrire un journal
  `data/corrections/V0.N.json` pour la version suivante, puis
  `node scripts/nouvelle-version.mjs data/corrections/V0.N.json`. Le script
  refuse toute valeur « avant » inattendue, ajoute une note d'audit a chaque
  entree modifiee et ecrit la nouvelle version a cote des anciennes. Format et
  effets : [`docs/journal-corrections.md`](docs/journal-corrections.md).
- **Fichiers fournis** : deposer `Star_Trek_Atlas_Politique_V0_N_<date>.csv`
  et `.md` dans `data/source/`. Chaque modification doit alors porter
  elle-meme sa note d'audit.

L'import prend automatiquement la version la plus haute de `data/source/`.
La suite (controles, commit, tag) est la procedure 1 de
[`docs/procedures.md`](docs/procedures.md). Doublons, relations et dates de
diffusion y ont aussi leur procedure.

Aucun fichier de presentation n'est a toucher. Garanties :

- un identifiant deja publie qui disparait de la source **fait echouer** la
  validation (une URL ne doit pas disparaitre) ;
- le CSV est reconstruit a partir des donnees publiees et compare a la source :
  toute perte est detectee ;
- les textes des fiches doivent etre des sous-chaines exactes du Markdown ;
- le format attendu du Markdown est celui de V0.3 : section
  `## Cas approfondis`, fiches `### STP-NNN — Titre`, volets en gras. Un volet
  manquant est signale.

## Ecarts assumes avec la specification

La specification de depart (`Star_Trek_Prompt_GitHub_Pages_V1`) n'est pas
versionnee : le repertoire `specs/` est exclu par `.gitignore`. Les
« sections » de la specification citees dans les scripts renvoient a ce
document. La specification demandait Astro, TypeScript et un deploiement par
GitHub Actions. Ce depot est configure pour le constructeur Jekyll natif, et
ses regles interdisent d'y poser un workflow ; le choix a ete fait de rester
en Jekyll. Consequences :

- pas de TypeScript : scripts en JavaScript (modules ES), sans dependance ;
- pas d'integration continue cote GitHub : les tests et la validation se
  lancent avant le push (`npm run check`, `npm run verify`, hook `pre-push`) ;
- le depot s'appelle `political-atlas-star-trek` (et non
  `star-trek-political-atlas`) : prefixe `/political-atlas-star-trek/` ;
- `robots.txt` est publie, mais sur un site de projet il n'est pas a la racine
  du domaine : les moteurs ne le lisent pas. Il le sera avec un domaine
  personnalise.

Une migration vers Astro passerait par le template `github-pages-ci` et un
changement de Settings > Pages ; elle n'est pas faite.

## Licences

Code : MIT. Contenus documentaires : CC BY-SA 4.0. Voir `LICENSE`.
