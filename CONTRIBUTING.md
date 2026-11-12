# Contribuer

## Signaler ou verifier une entree

Ouvrir une issue avec le modele « Verification ou correction d'une entree ».
Chaque fiche du site propose un bouton qui pre-remplit l'identifiant.

Une proposition utile donne : l'identifiant `STP-NNN`, ce qui est affirme
actuellement, ce que montre la source (episode, scene ou minute ; ou URL et
phrase concordante). Pas de capture d'ecran ni d'extrait des oeuvres.

## Regles editoriales

- Les identifiants `STP-NNN` sont **perennes** : jamais renumerotes, jamais
  supprimes. Un doublon se tranche dans `data/doublons.json` : l'entree
  secondaire garde son identifiant et sa page, qui renvoie a l'entree
  principale.
- Aucune donnee n'est corrigee silencieusement : toute correction porte son
  motif (note d'audit, section « Corrections documentees » du Markdown) ; la
  valeur precedente reste dans la version precedente du corpus et dans
  l'historique Git.
- Niveaux : **A** recoupement officiel sur le point central ; **B** recoupement
  par une source independante ; **C** reference candidate non recoupee. Aucune
  entree n'est dite « verifiee a l'ecran » sur la foi d'un resume.
- Les periodes floues restent du texte. Pas d'annee inventee.
- Les continuites (Miroir, Kelvin, temporalites modifiees) ne se fusionnent pas.
- Une analogie avec l'histoire reelle s'accompagne toujours d'une objection et
  d'une limite. Pas de formulation « Star Trek a predit ».
- Une relation entre evenements, ou une date de diffusion, n'est retenue que si
  une page consultee l'etablit explicitement ; cette page est citee.

## Modifier les donnees

Les fichiers de `data/source/` ne se modifient **jamais en place** : chaque
version du corpus est conservee telle quelle. Une correction passe par un
journal `data/corrections/V0.N.json`, que `scripts/nouvelle-version.mjs`
transforme en nouvelle version, ecrite a cote des precedentes.

| Pour... | Fichier a modifier | Procedure |
|---|---|---|
| corriger une entree (intitule, periode, episodes, niveau, categories, volets de fiche) | `data/corrections/V0.N.json` (nouveau) | `docs/procedures.md`, procedure 1 ; format : `docs/journal-corrections.md` |
| trancher un doublon | `data/doublons.json`, `data/relations.json`, puis un journal | `docs/procedures.md`, procedure 2 |
| ajouter une relation | `data/relations.json` | `docs/procedures.md`, procedure 3 |
| ajouter ou corriger une date de diffusion | `data/diffusion.json` | `docs/procedures.md`, procedure 4 |
| annuler une publication | -- (`git revert`) | `docs/procedures.md`, procedure 5 |

Dans tous les cas :

```bash
npm run check      # import, validation, tests
git add ... && git commit -m "..."
npm run verify     # apres le commit : fichiers generes a jour et commites
git push           # publie le site
```

Les fichiers generes (`_data/`, `_evenements/`, `atlas/*.md`,
`analyses/STP-*.md`, `reseau/STP-*.md`, rapports de `docs/`, registres
`data/ids-publies.json` et `data/reseau-cles-publiees.json`) ne se modifient
pas a la main. La liste complete est dans le README.

## Modifier le site

Gabarits dans `_layouts/` et `_includes/`, styles dans `assets/css/atlas.css`.
Avant de pousser : `npm run check`, puis si possible
`sudo appctl run pages-build` et
`node scripts/check-links.mjs _site /political-atlas-star-trek`.

Commiter les changements de code ou de gabarits a part des changements de
donnees : un retour arriere reste alors cible.

Ne pas ajouter de workflow dans `.github/workflows/`, ni de greffon hors de la
liste blanche de GitHub Pages, ni de fichier `CNAME`.
