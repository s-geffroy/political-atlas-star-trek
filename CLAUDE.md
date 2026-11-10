# Regles du projet political-atlas-star-trek

Ce fichier est lu par Claude Code au demarrage. Il fixe les regles non
negociables de ce projet sur ce VPS.

## Ce projet n'heberge rien

Le site est un **Jekyll construit par GitHub Pages**. Ici, il n'y a ni
conteneur, ni base, ni URL a verifier. `sudo appctl validate` repondra
« 0 service », et c'est normal : `app.yaml` et `compose.yaml` declarent
explicitement qu'il n'y a rien a demarrer.

Ce que ce repertoire apporte : un espace de travail versionne, isole des autres
applications du VPS, avec son propre Claude Code authentifie.

Si quelqu'un demande de « deployer le site ici », c'est qu'il s'est trompe de
template : `static` est celui d'un site servi par ce VPS.

## Publier, c'est pousser

Il n'y a pas d'autre geste. Pas de `appctl up`, pas de build a lancer, pas de
workflow GitHub Actions a ecrire : le constructeur natif de GitHub Pages fait
le travail au moment du `git push`.

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

- **Travaille en brouillon dans `_drafts/`** : Jekyll ne les publie pas. Un
  article n'entre dans `_posts/` que quand il est pret.
- Aucune **suppression** de page existante, aucune **refonte de structure**
  -- permaliens, categories, arborescence -- sans demande explicite. Une URL
  qui disparait laisse des liens morts partout ailleurs.
- Avant toute modification en masse -- retag, recategorisation, reecriture de
  metadonnees, passage sur les images -- annonce le nombre d'elements touches
  et attends l'accord.

## Ecrire le contenu

- Les articles vont dans `_posts/`, nommes `AAAA-MM-JJ-titre.md`. **Le nom du
  fichier n'est pas decoratif** : Jekyll en tire la date et l'URL de l'article.
- Front matter obligatoire : `layout`, `title`, `date`, et `categories` si le
  site en utilise.
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

- N'ajoute aucun service dans `compose.yaml` sans demande explicite. Construire
  le site en local donnerait un resultat different de ce que GitHub publie :
  deux verites au lieu d'une.
- Ne commite pas `_site/` : c'est la sortie du constructeur, GitHub la
  refabrique.
- **Ne cree pas le fichier `CNAME` avant que le DNS resolve.** GitHub sert
  alors une erreur a la place du site. Le bon geste est de saisir le domaine
  dans Settings > Pages : GitHub cree le commit lui-meme, une fois le DNS
  verifie.
- Ne retire pas les entrees de `exclude:` dans `_config.yml` : sans elles,
  `CLAUDE.md`, `app.yaml` et `compose.yaml` sont publies sur le site.
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

1. relire le front matter des fichiers touches -- une date ou un `layout`
   errone fait disparaitre une page sans message d'erreur ;
2. `git add` + `git commit` ;
3. `git push` -- **c'est cela, la publication**, dis-le clairement ;
4. donner l'URL des pages touchees ;
5. rappeler que la construction prend une a deux minutes, et que son echec
   eventuel est visible dans l'onglet **Actions** du depot, meme sans workflow ;
6. signaler tout echec restant sans le masquer.
