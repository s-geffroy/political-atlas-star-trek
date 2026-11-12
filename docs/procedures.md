# Procédures de maintenance des données

Ce document décrit pas à pas les gestes qui changent le contenu publié. Chaque
procédure se termine par un `git push`, et **pousser, c'est publier** : le site
public est reconstruit par GitHub en une à cinq minutes. Une construction en
échec apparaît dans l'onglet **Actions** du dépôt.

Prérequis communs :

- Node 18 ou plus, sans `npm install` : les scripts n'ont aucune dépendance ;
- hook de vérification activé une fois par clone :
  `git config core.hooksPath .githooks` ;
- ne jamais modifier à la main un fichier généré : `_data/`, `_evenements/`,
  `atlas/*.md`, `analyses/STP-*.md`, `reseau/STP-*.md`,
  `docs/rapport-import.md`, `docs/rapport-qualite.md`, `data/ids-publies.json`,
  `data/reseau-cles-publiees.json`. Le prochain import écraserait la
  modification. La liste complète est dans le README.

Sommaire :

1. [Publier une nouvelle version du corpus](#1-publier-une-nouvelle-version-du-corpus)
2. [Trancher un doublon](#2-trancher-un-doublon)
3. [Ajouter une relation documentée](#3-ajouter-une-relation-documentée)
4. [Ajouter ou corriger une date de diffusion](#4-ajouter-ou-corriger-une-date-de-diffusion)
5. [Revenir en arrière](#5-revenir-en-arrière)

---

## 1. Publier une nouvelle version du corpus

Toute correction d'une entrée (intitulé, période, épisodes, niveau de
recoupement, catégories, volets de fiche) passe par une nouvelle version.
Les fichiers de `data/source/` ne se modifient jamais en place.

**Avant de commencer.** Une correction qui touche beaucoup d'entrées, comme une
passe de recoupement ou une recatégorisation, se propose d'abord dans
`docs/proposition-*.md`, avec le nombre d'entrées touchées, et attend la
validation. Le journal cite ensuite cette proposition dans `methode`.

1. **Repérer la version courante.** C'est le fichier le plus récent de
   `data/source/` (par exemple `Star_Trek_Atlas_Politique_V0_13_2026-11-12.md`)
   et le tag le plus haut :

   ```bash
   ls data/source/ && git tag -l 'corpus-*'
   ```

2. **Écrire le journal** `data/corrections/V0.N.json`, où N est la version
   suivante, avec `base` égal au suffixe de la version courante. Le format est
   décrit dans [`journal-corrections.md`](journal-corrections.md). Recopiez les
   valeurs `avant` depuis le CSV de la version `base`, pas depuis le site : le
   site peut afficher un texte mis en forme.

3. **Produire la version :**

   ```bash
   node scripts/nouvelle-version.mjs data/corrections/V0.N.json
   ```

   Si le journal est refusé, rien n'est écrit : corrigez le journal et
   relancez. Lisez les lignes `avertissement :` éventuelles.

4. **Importer, valider, tester :**

   ```bash
   npm run check
   ```

   La commande enchaîne `import`, `validate` (10 contrôles) et `node --test`,
   et s'arrête à la première étape en échec. `validate` échoue dès qu'un
   contrôle est en erreur ; les avertissements ne bloquent pas.

5. **Relire** `docs/rapport-qualite.md` (avertissements compris) et
   `docs/rapport-import.md`, puis `git diff --stat` : seuls les fichiers
   attendus doivent avoir changé.

6. **Commiter les données seules**, sans code ni gabarit dans le même commit,
   pour garder un retour arrière ciblé :

   ```bash
   git add data/ _data/ _evenements/ atlas/ analyses/ reseau/ docs/rapport-import.md docs/rapport-qualite.md
   git status            # vérifier qu'aucun script ni gabarit n'est indexé
   git commit -m "Corpus V0.N : <objet>"
   ```

7. **Vérifier :**

   ```bash
   npm run verify
   ```

   `verify` relance l'import et échoue si un fichier généré diffère de ce qui
   est commité. **Lancé avant le commit, il échoue toujours** dès que l'import a
   changé quelque chose : c'est pourquoi il vient après. Le hook `pre-push` le
   relance de toute façon.

8. **Publier :** `git push`.

9. **Poser le tag de version** sur ce commit, puis le pousser :

   ```bash
   git tag -a corpus-v0.N -m "Corpus V0.N : <objet>"
   git push origin corpus-v0.N
   ```

10. **Écrire le billet du journal des versions** : `_posts/AAAA-MM-JJ-corpus-v0-N.md`
    (date du journal), front matter `layout: post`, `title: "Corpus V0.N : …"`,
    `date: AAAA-MM-JJ 00:NN:00 +0000` (l'heure `00:NN` = numéro de version,
    pour ordonner les billets d'un même jour), `categories: [corpus]`,
    `description`. Le corps reprend le champ `resume` du journal, sans chiffre
    qui n'y figure pas, avec des liens vers les fiches citées. Il est publié à
    `/journal/corpus-v0-N/` et repris par le flux Atom. Commit et push.

11. **Contrôler en ligne**, après la construction : la fiche d'une entrée
    touchée (`/evenements/STP-NNN/`), la page `/methodologie/` et `/journal/`.

Au besoin, complétez ensuite `docs/ameliorations.md`, qui tient l'historique
des passes, dans un commit séparé.

---

## 2. Trancher un doublon

Un doublon est une entrée **secondaire** qui décrit le même fait, dans le même
épisode, qu'une entrée **principale**. Rien n'est supprimé : la secondaire
garde son identifiant et sa page, qui renvoie à la principale. Elle n'est plus
comptée parmi les événements distincts (statistiques, explorateur, atlas,
chronologies). Le commit `cbe0039` (V0.11) en donne un exemple complet.

1. **Établir le doublon** : même fait, même épisode, vérifiés dans les champs
   `source` des deux entrées. Choisissez la principale selon les critères déjà
   employés : fiche approfondie, niveau de recoupement supérieur, période plus
   précise, arc mieux couvert. La principale ne peut pas être elle-même une
   secondaire.

2. **Ajouter la décision** à `data/doublons.json`, dans le tableau
   `doublons` :

   ```json
   { "secondaire": "STP-238", "principal": "STP-176", "motif": "Même épisode (…) et même fait : … STP-176 est retenue comme principale : …" }
   ```

   Faites-le **avant** l'étape 4 : la synthèse de la nouvelle version compte
   les niveaux A/B/C sans les secondaires présentes dans ce fichier au moment
   où le script tourne.

3. **Reporter les relations.** Dans `data/relations.json`, une relation qui
   vise la secondaire (en `de` ou en `vers`) :
   - se reporte sur la principale si elle n'y existe pas déjà ;
   - se retire si elle y existe déjà ;
   - se retire si le report créerait une boucle (principale vers principale).

   Si la principale figure dans `examinees_sans_relation.ids` et reçoit une
   relation par ce report, retirez-la de la liste. La validation refuse une
   relation qui vise une secondaire, une relation en double et un identifiant
   « sans relation » qui en porte une.

4. **Consigner la décision dans le corpus** par un journal (voir la
   procédure 1), sur le modèle de `data/corrections/V0.11.json` :
   - pour la secondaire : `"type": "correction"`, `"champs": {}`, motif
     commençant par « doublon tranché : entrée secondaire de STP-XXX… » ;
   - pour la principale : `"type": "signalement"`, `"champs": {}`, motif
     « doublon tranché : entrée principale ; STP-YYY lui est rattachée comme
     doublon. »

5. **Suivre la procédure 1** à partir de l'étape 3. Le contrôle 6 de la
   validation vérifie que les deux identifiants existent et qu'il n'y a pas de
   chaîne. Il avertit si les deux entrées n'ont aucun épisode en commun.

6. Mettez à jour, si besoin, la dernière ligne du `_lisez_moi` de
   `data/doublons.json`, qui cite les versions où les décisions sont
   consignées.

L'import gère seul le réseau. Si la secondaire était la tête d'un groupe déjà
publié, son adresse `/reseau/STP-NNN/` devient une page de renvoi vers l'arc de
la principale.

---

## 3. Ajouter une relation documentée

Les relations de `data/relations.json` sont un **enrichissement hors corpus** :
leur ajout ne demande pas de nouvelle version du corpus. Elles sont affichées
sur les deux fiches, avec leur source, et dessinées dans `/reseau/`.

### Règle de preuve : rien d'inventé

- Une relation n'est retenue que si **une page lue l'établit explicitement**.
  Une proximité thématique ne suffit pas, une déduction non plus.
- Deux événements d'un même épisode ne sont reliés que si la source décrit un
  enchaînement entre eux.
- Une relation entre continuités différentes (Miroir, Kelvin…) n'est admise
  que si la source établit le franchissement.
- Les sources écartées jusqu'ici sont les récapitulatifs de fans, les sites de
  critique, un « arc » défini par un critique et les extraits dont la page
  n'est pas citée (voir `docs/proposition-relations-3.md`).

### Format

```json
{
 "de": "STP-120",
 "vers": "STP-125",
 "type": "cause",
 "url": "https://en.wikipedia.org/wiki/Duet_(Star_Trek:_Deep_Space_Nine)",
 "justification": "Ce que dit la page, avec la citation en anglais entre « » qui établit le lien."
}
```

| Champ | Contenu | Contrôlé par la validation |
|---|---|---|
| `de`, `vers` | identifiants `STP-NNN` existants, différents, et non secondaires d'un doublon | oui |
| `type` | `cause` : `de` est présenté par la source comme une cause de `vers`. `suite` : `vers` prolonge directement l'intrigue de `de`. `meme_arc` : même arc narratif ou même conflit nommé par la source ; le sens n'a pas de portée | oui (trois valeurs) |
| `url` | page consultée qui établit la relation, en `http(s)://` | présence et préfixe seulement |
| `justification` | phrase publiée sur les fiches, avec la citation qui établit le lien | **non** : à relire |

Le couple `de → vers` doit être unique. La validation ne détecte pas le couple
inverse (`vers → de`) : cherchez-le vous-même avant d'ajouter.

### Étapes

1. **Proposer** les relations candidates dans un fichier
   `docs/proposition-relations-N.md` : tableau De / Relation / Vers /
   Justification / Source, relations écartées avec leur raison, et une ligne
   de statut. Attendez la validation.
2. **Ajouter** chaque relation validée au tableau `relations` de
   `data/relations.json`.
3. **Mettre à jour `examinees_sans_relation`** : retirez de `ids` tout
   identifiant qui porte désormais une relation, sinon la validation échoue
   (« sans relation : STP-NNN porte pourtant une relation »). Ne modifiez
   `date` et `passes` que si une nouvelle passe complète a été faite.
4. **Mettre à jour le `_lisez_moi`** de `data/relations.json` : ajoutez la
   passe et le fichier de proposition.
5. Lancez `npm run check`, relisez `docs/rapport-qualite.md` (contrôle 6), puis
   commitez `data/relations.json`, les fichiers générés et la proposition :
   `git commit -m "Relations : <objet>"`. Lancez ensuite `npm run verify`,
   puis `git push`.
6. **Contrôler en ligne** : les deux fiches, et la page du groupe concerné
   dans `/reseau/`.

Une relation peut fusionner deux groupes du réseau. La clé d'un groupe est son
plus petit identifiant : si elle change, l'ancienne adresse `/reseau/STP-NNN/`
devient automatiquement une page de renvoi, grâce au registre
`data/reseau-cles-publiees.json`.

---

## 4. Ajouter ou corriger une date de diffusion

`data/diffusion.json` est lui aussi un enrichissement hors corpus, sans
nouvelle version du corpus. Il contient quatre clés utiles :

| Clé | Contenu |
|---|---|
| `releve_le` | date du dernier relevé (`AAAA-MM-JJ`), affichée sur les chronologies et la page Méthodologie |
| `series[]` | catalogue de toutes les séries : `code`, `nom`, `diffuseur`, `debut`, `fin`, `statut`, `source_url`, `note`, `saisons[]` (`numero`, `debut`, `fin`, `episodes` = nombre d'épisodes, `source_url`, `note`) |
| `films[]` | tous les films : `titre`, `date`, `mode` (`salle`, `streaming` ou `null`), `continuite` (`principale`, `Kelvin` ou `null`), `source_url`, `note`, `titre_corpus` |
| `episodes[]` | dates des épisodes cités par le corpus : `serie`, `titre`, `titre_corpus`, `date`, `source_url`, `note` |

### Règles

- Une date n'est retenue que si elle a été **lue sur la page citée** en
  `source_url`.
- Si deux pages divergent, réduisez la précision (`AAAA-MM`, puis `AAAA`) ou
  mettez `date` à `null`, et expliquez la divergence dans `note`. Les
  diffusions en syndication de TNG et DS9 sont le cas le plus courant.
- Dates de première diffusion aux États-Unis ; sortie US en salle pour les
  films.

### Rattachement à une entrée

Une date d'épisode ou de film s'attache à une entrée par le couple
(`serie`, `titre_corpus`) :

- `serie` est le sigle employé dans le champ `source` du CSV : `TOS`, `TAS`,
  `TNG`, `DS9`, `VOY`, `ENT`, `DIS`, `Short Treks`, `PIC`, `LD`, `PRO`, `SNW`
  ou `SFA`. Les films n'ont pas de `serie` : l'import leur attribue `Film`.
- `titre_corpus` est le libellé **exact** de l'épisode dans le champ `source`.
  La comparaison ignore la casse, unifie les apostrophes et retire les points
  ou points de suspension finaux. `titre`, lui, est le titre officiel affiché.
- Une ligne sans `date`, sans `source_url` ou sans `titre_corpus` est ignorée
  par l'import.

Exemple, deux parties d'un épisode cité sous un seul libellé :

```json
{ "serie": "DS9", "titre": "Past Tense, Part II", "titre_corpus": "Past Tense", "date": "1995-01",
  "source_url": "https://en.wikipedia.org/wiki/Past_Tense_(Star_Trek:_Deep_Space_Nine)",
  "note": "Article 1995-01-09 ; liste 1995-01-07." }
```

### Étapes

1. Ajoutez ou corrigez la ligne dans `episodes`, `films` ou `series`.
2. Mettez `releve_le` à la date du jour si vous avez fait un nouveau relevé.
3. `npm run check`. Contrôlez :
   - dans `docs/rapport-import.md`, la section « Dates de diffusion
     rattachées » : le nombre d'entrées datées doit augmenter si vous avez
     ajouté une date ;
   - la console de l'import : « Séries citées absentes du catalogue de
     diffusion » signale un sigle cité par le corpus sans entrée dans
     `series` ;
   - le contrôle 9 de la validation, qui refuse une date rattachée sans source.
4. Commitez `data/diffusion.json` et les fichiers générés
   (`git commit -m "Diffusion : <objet>"`), lancez `npm run verify`, puis
   `git push`.
5. Contrôlez en ligne `/chronologie/diffusion/` et la fiche d'une entrée
   concernée.

---

## 5. Revenir en arrière

Règle : **jamais de `git push --force` sur `main`**. On annule par un nouveau
commit, ce qui laisse l'erreur et sa correction dans l'historique.

### Annuler un commit publié

```bash
git log --oneline -10                 # repérer le commit fautif
git revert <commit>                   # crée le commit d'annulation
npm run check                         # les fichiers générés doivent suivre
git status                            # si l'import a changé quelque chose : git add + git commit --amend
npm run verify
git push
```

Si les commits de données sont séparés des commits de code (procédure 1,
étape 6), le revert d'une version du corpus ne touche pas aux scripts.

### Point d'attention : les registres

`data/ids-publies.json` et `data/reseau-cles-publiees.json` ne font que
grandir. Ils garantissent qu'une adresse publiée ne disparaît pas. Un revert
remet ces fichiers dans leur état antérieur. Les adresses ajoutées par le
commit annulé peuvent alors sortir du registre :

- pour `ids-publies.json`, sans effet en pratique : `nouvelle-version.mjs`
  n'ajoute jamais d'entrée ;
- pour `reseau-cles-publiees.json`, un groupe créé par le commit annulé perd sa
  page `/reseau/STP-NNN/` sans page de renvoi.

Contrôle après le revert :

```bash
git diff <commit>~1 <commit> -- data/reseau-cles-publiees.json
```

Si des clés ont été ajoutées par le commit annulé, remettez-les dans le
registre, qui est une liste triée, puis relancez `npm run check` : l'import
produit pour chacune une page de renvoi. Commitez le tout avec le revert.

### Revenir à une version du corpus

Chaque version porte un tag annoté `corpus-vX.Y`. Pour voir ce qui a changé
depuis :

```bash
git tag -l 'corpus-*'
git diff corpus-v0.12 -- data/
```

Revenir au contenu d'une version, c'est annuler par `git revert` les commits
de données postérieurs, pas déplacer `main` sur le tag. Une fois la version
annulée, ne réutilisez pas son numéro : le tag existe déjà. La version
suivante prend le numéro d'après, avec pour `base` la dernière version restée
dans `data/source/`.
