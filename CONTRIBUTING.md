# Contribuer

## Signaler ou verifier une entree

Ouvrir une issue avec le modele « Verification ou correction d'une entree ».
Chaque fiche du site propose un bouton qui pre-remplit l'identifiant.

Une proposition utile donne : l'identifiant `STP-NNN`, ce qui est affirme
actuellement, ce que montre la source (episode, scene ou minute ; ou URL et
phrase concordante). Pas de capture d'ecran ni d'extrait des oeuvres.

## Regles editoriales

- Les identifiants `STP-NNN` sont **perennes** : jamais renumerotes, jamais
  supprimes. Un doublon est signale dans la note d'audit.
- Aucune donnee n'est corrigee silencieusement : toute correction porte son
  motif (note d'audit, section « Corrections documentees » du Markdown) ; la
  valeur precedente reste dans l'historique Git.
- Niveaux : **A** recoupement officiel sur le point central ; **B** recoupement
  par une source independante ; **C** reference candidate non recoupee. Aucune
  entree n'est dite « verifiee a l'ecran » sur la foi d'un resume.
- Les periodes floues restent du texte. Pas d'annee inventee.
- Les continuites (Miroir, Kelvin, temporalites modifiees) ne se fusionnent pas.
- Une analogie avec l'histoire reelle s'accompagne toujours d'une objection et
  d'une limite. Pas de formulation « Star Trek a predit ».

## Modifier les donnees

On ne modifie que les sources, dans `data/source/` (ou une nouvelle version du
corpus), puis :

```bash
npm run check
```

Les fichiers de `_data/`, `_evenements/` et `atlas/` sont generes. Les dates
de diffusion se modifient dans `data/diffusion.json`, chacune avec une
`source_url` consultee.

## Modifier le site

Gabarits dans `_layouts/` et `_includes/`, styles dans `assets/css/atlas.css`.
Avant de pousser : `npm run check`, puis si possible
`sudo appctl run pages-build` et
`node scripts/check-links.mjs _site /political-atlas-star-trek`.

Ne pas ajouter de workflow dans `.github/workflows/`, ni de greffon hors de la
liste blanche de GitHub Pages, ni de fichier `CNAME`.
