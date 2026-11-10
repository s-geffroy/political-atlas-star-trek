# political-atlas-star-trek

Site **Jekyll** publie par **GitHub Pages**. **Rien n'est heberge ici.**

## Ce que ce depot est

Un espace de travail versionne, isole des autres applications du VPS, avec son
propre Claude Code authentifie. Le site, lui, est construit par GitHub a chaque
`git push` et servi depuis les serveurs de GitHub.

`sudo appctl validate` repondra « 0 service », et c'est normal : `app.yaml` et
`compose.yaml` declarent explicitement qu'il n'y a rien a demarrer.

Si quelqu'un demande de « deployer le site ici », c'est qu'il s'est trompe de
template : `static` est celui d'un site servi par ce VPS.

## Prerequis, a trancher AVANT de creer le depot distant

GitHub Pages est disponible :

- sur un depot **public**, avec un compte **GitHub Free** ;
- sur un depot **prive**, seulement a partir de **GitHub Pro** (payant).

Et dans les deux cas, **le site publie est public**. Un depot prive protege les
sources, pas le site. Restreindre l'acces au site lui-meme demande une
organisation sur GitHub Enterprise Cloud.

C'est a decider avant l'etape « Rattacher un depot GitHub prive ? » de
`workon new` : apres, le depot existe.

## Activer Pages

1. Creer le depot sur GitHub, y pousser ce projet.
2. Depot > **Settings** > **Pages**.
3. **Source** : *Deploy from a branch*.
4. **Branch** : `main`, dossier `/ (root)`.

Aucun workflow GitHub Actions n'est necessaire : le constructeur Jekyll natif
fait le travail. Le modele inverse -- Jekyll 4 et greffons libres, batis par un
workflow de ce depot -- est le template `github-pages-ci` ; les deux s'excluent,
puisqu'ils demandent des reglages differents dans Settings > Pages.

## Publier

```bash
git add -A
git commit -m "..."
git push
```

C'est tout. La construction prend une a deux minutes ; son deroulement et ses
echecs sont visibles dans l'onglet **Actions** du depot, meme sans workflow --
le constructeur natif s'y affiche.

## Organisation

```
_config.yml        reglages du site (titre, url, baseurl, greffons, exclusions)
index.md           page d'accueil
404.html           page servie sur une adresse inconnue
_posts/            articles : AAAA-MM-JJ-titre.md
_drafts/           brouillons : jamais publies (a creer au besoin)
assets/            images, fichiers joints
specs/             specifications du projet, exclues du site
```

Un article porte un front matter :

```markdown
---
layout: post
title: "Titre de l'article"
date: 2026-08-25
categories: [notes]
---
```

## Domaine personnalise

Saisir le domaine dans **Settings > Pages** : GitHub cree lui-meme le commit du
fichier `CNAME`. Cote DNS, chez le registrar :

- apex (`exemple.fr`) : quatre enregistrements **A** vers `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153` ;
- sous-domaine (`www`) : un **CNAME** vers `<utilisateur>.github.io`.

Puis cocher **Enforce HTTPS** -- disponible jusqu'a 24 h apres la
configuration, le temps que le certificat soit emis.

**Rien de tout cela ne passe par ce VPS** : ni Traefik, ni `app.yaml`, ni
`app-exposure.py`, ni la zone publique de `/opt/infra/.env`.

Ne pas oublier de vider `baseurl` dans `_config.yml` en meme temps.

## Ce que le constructeur natif ne sait pas faire

- Il tourne en **safe mode** : les greffons deposes dans `_plugins/` sont
  **ignores**, sans erreur ni avertissement.
- Seule la liste blanche de <https://pages.github.com/versions.json> est
  chargeable -- `jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`,
  `jekyll-redirect-from`, `jekyll-remote-theme` et quelques autres.
- La version de Jekyll est **3.10**, pas Jekyll 4. Les recettes du web qui
  supposent Jekyll 4 ne marchent pas ici.
- Pour changer de theme sans sortir du constructeur natif : `remote_theme:`,
  qui est dans la liste blanche.

## Commandes

`sudo appctl validate` repond « 0 service » ; `build`, `up`, `down`, `rebuild`
et `restart` sortent en 0 sans rien faire.
