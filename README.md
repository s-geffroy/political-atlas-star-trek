# Star Trek Political Atlas

*Atlas politique, historique et sociologique de l'univers Star Trek* -- site
documentaire en francais, publie par **GitHub Pages** (constructeur Jekyll
natif) a l'adresse :

<https://s-geffroy.github.io/political-atlas-star-trek/>

Projet independant, non affilie a Paramount / CBS Studios.

## Contenu

| Page | Adresse | Source des donnees |
|---|---|---|
| Accueil (tableau de bord) | `/` | `_data/stats.json` |
| Explorateur (recherche, filtres, URL partageable) | `/evenements/` | `_data/evenements.json` |
| 305 fiches d'evenement | `/evenements/STP-001/` ... `/evenements/STP-305/` | `_data/evenements.json`, `_data/fiches.json` |
| Chronologie diegetique / de diffusion | `/chronologie/` (`?vue=diffusion`) | `_data/evenements.json`, `_data/diffusion.json` |
| Atlas thematique (10 domaines) | `/atlas/`, `/atlas/<domaine>/` | `_data/atlas.json` |
| Fiction et histoire reelle | `/analyses/`, `/analyses/emeutes-de-bell/` | fiche STP-006, `_data/editorial.json` |
| Methodologie, limites, rapport de qualite | `/methodologie/` | `_data/editorial.json`, `_data/qualite.json` |
| Contribuer | `/contribuer/` | -- |

## Architecture

Le site est construit par **GitHub**, au `git push`, avec Jekyll 3.10 en safe
mode (aucun workflow GitHub Actions). Un import en Node -- **sans aucune
dependance npm** -- transforme les sources en donnees Jekyll, qui sont
commitees :

```
data/source/              CSV + Markdown du corpus (V0.3), copies tels quels
data/diffusion.json       dates de diffusion relevees, chacune avec sa source
data/ids-publies.json     identifiants deja publies (ne fait que grandir)
scripts/lib/csv.mjs       parseur CSV (BOM, guillemets, « ; »)
scripts/lib/fiches.mjs    extraction des 31 fiches et du registre Markdown
scripts/lib/derive.mjs    regles de derivation (serie, continuite, ordre)
scripts/lib/atlas.mjs     table domaines <-> categories
scripts/import.mjs        sources -> _data/*.json, _evenements/*.md, atlas/*.md
scripts/validate.mjs      10 controles documentaires -> docs/rapport-qualite.md
scripts/check-links.mjs   liens internes d'un site construit (prefixe compris)
tests/                    node --test
_layouts/ _includes/      gabarits (pas de theme)
assets/css/atlas.css      systeme graphique
assets/js/                explorateur et chronologie (amelioration progressive)
docs/                     rapports d'import et de qualite (non publies)
```

Les fichiers `_data/*.json`, `_evenements/*.md` et `atlas/*.md` sont
**generes** : ne pas les modifier a la main.

## Commandes

Prerequis : Node 18 ou plus (deja present sur le VPS). Rien a installer.

```bash
npm run import     # sources -> donnees Jekyll et pages
npm run validate   # 10 controles ; sort en erreur si un controle echoue
npm test           # tests automatises
npm run check      # les trois, dans l'ordre
```

Verification optionnelle avec le constructeur officiel de GitHub Pages
(meme image Docker que GitHub, declaree dans `compose.yaml`, profil `cli`) :

```bash
sudo appctl run pages-build                          # construit dans _site/
node scripts/check-links.mjs _site /political-atlas-star-trek
```

`_site/` n'est jamais commite.

## Publier

```bash
npm run check
git add -A && git commit -m "..." && git push
```

**Le push est la publication.** La construction prend une a deux minutes ;
son deroulement et ses echecs sont visibles dans l'onglet **Actions** du depot.

Reglage a faire une fois : depot > **Settings** > **Pages** > *Deploy from a
branch*, branche `main`, dossier `/ (root)`.

## Mettre a jour le corpus (V0.4 et suivantes)

1. Deposer `Star_Trek_Atlas_Politique_V0_4_<date>.csv` et `.md` dans
   `data/source/` (l'import prend automatiquement la version la plus haute).
2. `npm run check`.
3. Lire `docs/rapport-import.md` et `docs/rapport-qualite.md`.
4. Commit, push.

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

La specification (`Star_Trek_Prompt_GitHub_Pages_V1`) demandait Astro,
TypeScript et un deploiement par GitHub Actions. Ce depot est configure pour le
constructeur Jekyll natif, et ses regles interdisent d'y poser un workflow ;
le choix a ete fait de rester en Jekyll. Consequences :

- pas de TypeScript : scripts en JavaScript (modules ES), sans dependance ;
- pas d'integration continue cote GitHub : les tests et la validation se
  lancent avant le push (`npm run check`) ;
- le depot s'appelle `political-atlas-star-trek` (et non
  `star-trek-political-atlas`) : prefixe `/political-atlas-star-trek/` ;
- `robots.txt` est publie, mais sur un site de projet il n'est pas a la racine
  du domaine : les moteurs ne le lisent pas. Il le sera avec un domaine
  personnalise.

Une migration vers Astro passerait par le template `github-pages-ci` et un
changement de Settings > Pages ; elle n'est pas faite.

## Licences

Code : MIT. Contenus documentaires : CC BY-SA 4.0. Voir `LICENSE`.
