# Regles du projet political-atlas-star-trek

Ce fichier est lu par Claude Code au demarrage. Il fixe les regles non
negociables de ce projet sur ce VPS.

## Ce projet n'heberge rien

Le site est un **Jekyll construit par GitHub Pages**. Ici, il n'y a ni
conteneur permanent, ni base, ni URL a verifier. `sudo appctl validate`
annonce « 1 service » : c'est `pages-build`, un outil de verification (profil
`cli`, jamais lance par `up`) qui construit `_site/` avec l'image du
constructeur de GitHub Pages. `app.yaml` ne declare aucune exposition.

Ce que ce repertoire apporte : un espace de travail versionne, isole des autres
applications du VPS, avec son propre Claude Code authentifie.

Si quelqu'un demande de « deployer le site ici », c'est qu'il s'est trompe de
template : `static` est celui d'un site servi par ce VPS.

## Publier, c'est pousser

Le push reste le seul geste de *publication* : pas de `appctl up`, pas de
workflow GitHub Actions a ecrire ; le constructeur natif de GitHub Pages fait
le travail au moment du `git push`. Mais les donnees du site sont generees par
des scripts Node que GitHub ne lance pas : avant de pousser, `npm run check`
(import, validation, tests), commit des fichiers generes, puis
`npm run verify`. Le hook `.githooks/pre-push` relance `verify` et bloque le
push en cas d'ecart.

**N'ecris pas de `.github/workflows/`.** Un workflow de deploiement *remplace*
le constructeur natif : c'est un autre modele, avec ses versions a maintenir.
Si le besoin apparait (un greffon hors liste blanche, Jekyll 4, un autre
generateur), dis-le et attends l'accord -- ne bascule pas de toi-meme.

Ce basculement est deja ecrit, et c'est un AUTRE template : `github-pages-ci`.
Il ne se greffe pas sur un projet en cours -- poser son workflow ici couperait
la publication tant que Settings > Pages n'est pas passe sur « GitHub Actions ».

## Le constructeur est en safe mode

Trois consequences, toutes verifiables et toutes silencieuses si on les ignore :

1. **Jekyll 3.10**, pas Jekyll 4. Les recettes du web qui supposent Jekyll 4
   -- nouveau convertisseur Sass, certaines options de collections -- ne
   marchent pas ici.
2. **Seuls les greffons de la liste blanche sont chargeables.** La liste a jour
   est sur <https://pages.github.com/versions.json>. Va la lire.
3. **Ce qui est depose dans `_plugins/` est ignore.** Pas d'erreur, pas
   d'avertissement : la fonctionnalite manque, simplement. Ne construis jamais
   rien la-dessus.

Pour changer l'apparence du site, `remote_theme:` est dans la liste blanche :
c'est la porte de sortie propre, elle evite d'avoir a copier un theme entier
dans le depot.

## Le site est en ligne

Chaque push est une publication immediate et publique.

- Le contenu vient du corpus versionne (`data/source/`, jamais modifie en
  place, voir `docs/procedures.md`) et des enrichissements (`data/*.json`).
  Le brouillon d'une modification de contenu est une proposition (non
  publiee : `docs/` est exclu), validee avant d'etre integree.
- Ne modifie jamais a la main un fichier genere : `_data/`, `_evenements/`,
  `atlas/*.md`, `analyses/STP-*.md`, `reseau/STP-*.md`, rapports de `docs/`,
  registres `data/ids-publies.json` et `data/reseau-cles-publiees.json`
  (liste dans le README).
- Aucune **suppression** de page existante, aucune **refonte de structure**
  -- permaliens, categories, arborescence -- sans demande explicite. Une URL
  qui disparait laisse des liens morts partout ailleurs. Ici, deux registres
  garantissent cette regle : `data/ids-publies.json` (la validation echoue si
  un identifiant publie disparait) et `data/reseau-cles-publiees.json` (une
  ancienne adresse d'arc devient une page de renvoi). On ne retire jamais une
  cle de ces registres.
- Avant toute modification en masse -- retag, recategorisation, reecriture de
  metadonnees, passage sur les images -- annonce le nombre d'elements touches
  et attends l'accord.

## Ecrire le contenu

- `_posts/` ne contient que le journal des versions du corpus : un billet par
  version, `AAAA-MM-JJ-corpus-v0-N.md`, publie a `/journal/corpus-v0-N/` et
  repris par le flux Atom. **Le nom du fichier n'est pas decoratif** : Jekyll
  en tire la date et l'URL. Front matter : `layout: post`, `title`, `date`,
  `categories: [corpus]`, `description`.
- **Le contenu publie s'ecrit en francais normal, avec ses accents.** La regle
  « sans accents » de ce depot vise les fichiers d'infrastructure
  -- `CLAUDE.md`, `README.md`, les YAML -- pas ce que liront les visiteurs.
- Sur un site existant, commence par le lire : articles recents, categories
  reellement utilisees, ton employe, gabarits de titres. Aligne-toi dessus
  plutot que d'imposer une nouvelle mise en forme.

## Perimetre

- Travaille uniquement dans /srv/apps/political-atlas-star-trek.
- Ne touche jamais a /opt/infra.
- Ne tente jamais d'acceder aux autres applications du VPS.
- N'installe aucun runtime sur l'hote : ni Ruby, ni Jekyll, ni Bundler.
- Ne touche a rien dans `~/.claude/` : ce qui s'y trouve est pose par le socle
  du VPS.

## Interdictions

- N'ajoute aucun service dans `compose.yaml` sans demande explicite. Le seul
  build local admis est `sudo appctl run pages-build` (image du constructeur
  de GitHub Pages, version epinglee : la comparer a
  <https://pages.github.com/versions.json> en cas d'ecart). Un build avec un
  autre Jekyll ou d'autres greffons donnerait deux verites au lieu d'une.
- Ne commite pas `_site/` : c'est la sortie du constructeur, GitHub la
  refabrique.
- **Ne cree pas le fichier `CNAME` avant que le DNS resolve.** GitHub sert
  alors une erreur a la place du site. Le bon geste est de saisir le domaine
  dans Settings > Pages : GitHub cree le commit lui-meme, une fois le DNS
  verifie.
- Ne retire pas les entrees de `exclude:` dans `_config.yml` : sans elles,
  les fichiers d'infrastructure (`CLAUDE.md`, `app.yaml`, `compose.yaml`),
  les scripts, les journaux de `data/` et les documents de travail de `docs/`
  sont publies sur le site.
- Le domaine du site ne passe **pas** par Traefik. Ne cherche ni `app.yaml`, ni
  `app-exposure.py`, ni la zone publique du VPS : ils ne servent a rien ici.

## Secrets

- Aucun jeton, mot de passe ou URL d'administration dans le depot, dans un
  prompt ou dans les logs. Un depot Pages est souvent public : ce qui y entre
  est definitif, l'historique le garde.
- Rien a mettre dans /etc/app-secrets/political-atlas-star-trek/ : ce repertoire sert a injecter
  des secrets dans des conteneurs, et il n'y en a pas ici.
- Un depot prive ne rend pas le site prive. Le site publie reste public.

## Fin de tache

1. si des donnees ont change : `npm run check`, puis lire
   `docs/rapport-qualite.md` (avertissements compris) ;
2. si une page ecrite a la main a change : relire son front matter -- une date
   ou un `layout` errone fait disparaitre une page sans message d'erreur ;
3. `git add` + `git commit` -- donnees et code dans des commits separes ;
4. `npm run verify` (apres le commit : avant, il echoue des que l'import a
   change un fichier) ;
5. `git push` -- **c'est cela, la publication**, dis-le clairement ;
6. nouvelle version du corpus : tag annote `corpus-vX.Y` sur le commit,
   pousse avec `git push origin corpus-vX.Y`, et billet du journal des
   versions dans `_posts/` ;
7. donner l'URL des pages touchees ;
8. rappeler que la construction prend de une a cinq minutes, et que son echec
   eventuel est visible dans l'onglet **Actions** du depot, meme sans
   workflow ;
9. signaler tout echec restant sans le masquer.
