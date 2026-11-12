# Journal de corrections : format de `data/corrections/V0.N.json`

Un journal décrit le passage d'une version du corpus à la suivante. Le script
`scripts/nouvelle-version.mjs` le lit, contrôle chaque valeur « avant », puis
écrit la nouvelle version (CSV + Markdown) dans `data/source/`, à côté des
anciennes. Les versions précédentes ne sont jamais modifiées.

```bash
node scripts/nouvelle-version.mjs data/corrections/V0.14.json
```

La procédure complète (contrôles, commit, tag) est décrite dans
[`procedures.md`](procedures.md#1-publier-une-nouvelle-version-du-corpus).

## Structure générale

```json
{
 "version": "V0.14",
 "date": "2026-11-20",
 "date_longue": "20 novembre 2026",
 "base": "V0_13_2026-11-12",
 "titre": "Atlas politique de Star Trek — V0.14 : …",
 "resume": "Une ou deux phrases sur ce que change la version.",
 "methode": { "…": "…" },
 "comptes": { "…": 0 },
 "corrections": [ … ],
 "textes": [ … ]
}
```

| Clé | Obligatoire | Rôle dans le script |
|---|---|---|
| `version` | oui | Libellé `V0.N`. Il sert dans la note d'audit (`V0.N (date) : …`), dans `version_entree` (`V0.N révisé`), dans le sous-titre de la section « Corrections documentées », dans la synthèse et dans le nom des fichiers produits (`V0.N` devient `V0_N`). |
| `date` | oui | Date `AAAA-MM-JJ`. Elle sert dans la note d'audit, dans le sous-titre des corrections et dans le nom des fichiers produits. |
| `date_longue` | oui | Date en toutes lettres (`20 novembre 2026`). Elle remplace la ligne `> État : …` jusqu'au premier point et sert dans la synthèse. |
| `base` | oui | Suffixe des fichiers de la version précédente : `V0_13_2026-11-12` désigne `data/source/Star_Trek_Atlas_Politique_V0_13_2026-11-12.csv` et `.md`. Si l'un des deux fichiers manque, le script s'arrête. |
| `titre` | oui | Nouveau titre de niveau 1, sans le `# `. Il remplace toute la ligne de titre. **Gardez la forme `Atlas politique de Star Trek — V0.N : …`** : la version suivante cherche le titre avec ce motif et s'arrête si elle ne le trouve pas. |
| `resume` | oui | Texte inséré en tête de la section « Synthèse vérifiable » (voir plus bas). |
| `methode` | non | Champ libre (objet). Aucun script ne le lit : c'est de la documentation. Les journaux existants l'utilisent pour citer la proposition validée ou la date de relecture. |
| `comptes` | non | Champ libre (objet). Aucun script ne le lit. |
| `corrections` | oui | Liste des modifications entrée par entrée (voir ci-dessous). Elle peut être vide si seuls des `textes` changent. |
| `textes` | non | Remplacements de texte éditorial hors fiches (voir ci-dessous). |

Le nom du fichier journal (`data/corrections/V0.14.json`) n'est pas lu par le
script. Par convention, il reprend `version`.

## `corrections[]` : une modification sur une entrée

```json
{
 "id": "STP-153",
 "type": "correction",
 "champs": { "source": { "avant": "…", "apres": "…" } },
 "volets": { "faits": { "avant": "…", "apres": "…" } },
 "sources_fiche": [ { "libelle": "Source — Wikipedia — …", "url": "https://…" } ],
 "motif": "…"
}
```

| Clé | Obligatoire | Contenu |
|---|---|---|
| `id` | oui | Identifiant `STP-NNN` existant. Un identifiant inconnu fait refuser le journal. |
| `type` | oui en pratique | Seul `correction` a un effet propre : l'entrée apparaît dans la section « Corrections documentées » du Markdown, puis sur sa fiche du site. Toute autre valeur est acceptée sans contrôle. Valeurs employées jusqu'ici : `signalement` (réserve ou décision consignée sans correction factuelle), `recoupement` (changement de niveau ou de source de contrôle), `categorie` (catégories politiques). |
| `champs` | oui (`{}` permis) | Colonnes du CSV à modifier : `{ "colonne": { "avant": "…", "apres": "…" } }`. Un objet vide est permis : l'entrée reçoit quand même sa note d'audit. C'est le cas d'un doublon tranché ou d'un simple signalement. |
| `volets` | non | Textes de la fiche approfondie à remplacer. Clés possibles : `faits`, `mecanisme`, `parallele`, `objections`, `contexte`. Même forme `{ "avant", "apres" }`. |
| `sources_fiche` | non | Sources à ajouter à la fiche approfondie : `[{ "libelle", "url" }]`. |
| `motif` | oui | Justification lisible. Elle est publiée (note d'audit, section « Corrections documentées », fiche du site). Le point final est retiré puis rajouté par le script : ne terminez pas par `..` ou `…`. |

Une même entrée peut apparaître plusieurs fois dans `corrections`. Ses motifs
sont alors réunis, séparés par « ; », dans une seule note d'audit.

### `champs` : colonnes du CSV

Colonnes du CSV : `id`, `cycle`, `period`, `event`, `source`, `politics`,
`categories_politiques`, `niveau_recoupement`, `nature_source`, `url_source`,
`note_audit`, `version_entree`.

- `avant` doit être **exactement** la valeur actuelle du champ dans la version
  `base` : caractère pour caractère, guillemets « » et apostrophes ’ compris.
  Sinon le journal est refusé, avec la valeur réellement trouvée.
- `id` ne se modifie pas. Une colonne inconnue fait refuser le journal.
- Ne mettez pas `note_audit` ni `version_entree` dans `champs` : le script les
  écrit lui-même.
- `categories_politiques` : valeurs séparées par `;`, comme dans le CSV.
- `niveau_recoupement` : `A`, `B` ou `C`. Changez `nature_source` et
  `url_source` en même temps quand la source de contrôle change.

### `volets` et `sources_fiche` : fiche approfondie

Ces deux clés n'agissent que si l'entrée a une fiche approfondie
(`### STP-NNN — …` dans la section « Cas approfondis »). **Sans fiche, elles
sont ignorées sans message.** La liste des fiches est dans
`_data/fiches.json`.

- Pour un volet, le texte cherché est `**Intitulé.** avant` suivi d'un retour à
  la ligne. Il doit apparaître une seule fois dans la fiche. Sinon, ou si la clé
  n'est pas l'une des cinq, le journal est refusé. Le texte `avant` doit couvrir
  tout le paragraphe du volet.

  | Clé | Intitulé dans le Markdown |
  |---|---|
  | `faits` | Faits canoniques et acteurs |
  | `mecanisme` | Mécanisme politique |
  | `parallele` | Parallèle réel à étudier |
  | `objections` | Objection et limites de l’analogie |
  | `contexte` | Contexte de création et diffusion |

- Le `libelle` d'une source doit commencer par `Source`, et l'`url` par
  `http://` ou `https://` : sinon le journal est refusé. La source est ajoutée
  en fin de fiche sous la forme `**libellé (V0.N) :** url`, sauf si l'URL y
  figure déjà.

## `textes[]` : texte éditorial hors fiches

```json
"textes": [ { "avant": "L’influence de la détente, de la fin de l’URSS", "apres": "L’influence de la fin de la guerre froide, de la dissolution de l’URSS" } ]
```

Le remplacement est exact et porte sur tout le Markdown, par exemple sur la
section « Lignes de force ». Le texte `avant` doit apparaître **une seule
fois** : choisissez un extrait assez long pour être unique. Sinon le journal est
refusé. Un remplacement de `textes` ne produit ni note d'audit ni ligne dans
« Corrections documentées » : expliquez-le dans `resume`.

## Ce que le script vérifie

Le journal est refusé, et **rien n'est écrit**, dans les cas suivants :

1. le CSV `base` contient une ligne rejetée par le parseur ;
2. un `id` est inconnu, une colonne inconnue, une tentative de modifier `id`,
   ou une valeur `avant` différente de la valeur actuelle ;
3. dans la notice du registre intégral, le texte `avant` d'un champ `source`,
   `event`, `politics` ou `period` est introuvable ou présent plusieurs fois ;
4. un volet est inconnu, ou son texte `avant` est introuvable ou multiple ;
5. une source de fiche est mal formée ;
6. un texte de `textes` est introuvable ou multiple ;
7. un élément attendu du Markdown est introuvable : la notice du registre de
   l'entrée, la section « Corrections documentées » (dès qu'il y a une
   `correction`), le titre `# Atlas politique de Star Trek — V… : …`, la ligne
   `> État :`, ou la section `## Synthèse vérifiable`.

Si l'en-tête `### STP-NNN — …`, la `**Période diégétique :**` ou la
`**Source audiovisuelle :**` de la fiche ne contient pas exactement la valeur
`avant`, le script écrit quand même les fichiers et affiche un
`avertissement :`. Le contrôle 6 de `npm run validate` signale ensuite l'écart
de titre ou de période entre la fiche et le CSV.

Le script **ne vérifie pas** :

- que `version` suit `base`, ni qu'une version de même nom n'existe pas déjà
  (les fichiers cibles sont réécrits) ;
- le contenu de `motif`, `methode`, `comptes` ou `type` ;
- les URL au-delà de leur préfixe.

Relancer le script après avoir corrigé le journal ne pose pas de problème : la
version `base` n'a pas changé et les fichiers cibles sont réécrits.

## Ce que le script modifie

Dans le **CSV** de la nouvelle version :

- les champs listés dans `champs` ;
- `note_audit` de chaque entrée touchée : `V0.N (date) : motif1 ; motif2.`,
  ajouté à la suite de la note existante ;
- `version_entree` de chaque entrée touchée : `V0.N révisé`.

Aucune entrée n'est ajoutée ni retirée, et l'ordre des lignes est conservé.

Dans le **Markdown** de la nouvelle version :

| Où | Quoi |
|---|---|
| Titre `# …` | remplacé par `titre` |
| `> État : …` | date remplacée par `date_longue` |
| `## Synthèse vérifiable` | nouveau paragraphe en tête : `**Mise à jour V0.N (date_longue).** resume Répartition V0.N (événements distincts, doublons exclus) : A / B / C ; n entrées modifiées…`. Les comptes A/B/C sont calculés sur le CSV corrigé, sans les doublons secondaires listés dans `data/doublons.json` **au moment où le script tourne**. |
| `## Corrections documentées …` | nouveau sous-titre `### V0.N (date)` en fin de section, une ligne `- **STP-NNN** — intitulé. *Motif :* motif` par élément de type `correction` |
| Registre intégral, notice `**STP-NNN — …**` | `*Épisodes :*` (champ `source`), intitulé (`event`), `*Problématique :*` (`politics`), `*Temps fictionnel :*` (`period`) ; ligne `*Recoupement :*` réécrite depuis `niveau_recoupement` et `url_source` ; ligne `*Note d’audit V0.N :* motifs` ajoutée en fin de notice |
| Fiche approfondie `### STP-NNN — …` (si elle existe) | `**Recoupement documentaire :**` réécrit (`niveau — nature_source`) ; titre, `**Période diégétique :**` et `**Source audiovisuelle :**` alignés sur `event`, `period` et `source` ; volets remplacés ; `url_source` ajoutée en fin de fiche si elle n'y figure pas (`**Source secondaire/éditoriale de contrôle (V0.N) :** url`) ; `sources_fiche` ajoutées |
| Tout le document | remplacements de `textes` |

Les autres colonnes (`cycle`, `categories_politiques`, `nature_source`) ne
changent que dans le CSV : le registre du Markdown ne les reprend pas.

Fichiers écrits :
`data/source/Star_Trek_Atlas_Politique_V0_N_<date>.csv` (BOM, fins de ligne
CRLF) et `.md`. Le script ne lance pas l'import : c'est l'étape suivante
(`npm run check`). L'import retient automatiquement la version la plus haute
de `data/source/`.

## Exemple minimal

Ce journal fictif modifie la problématique de STP-012 dans la version V0.13.
Il a été passé à `appliquer()` en mémoire le 12 novembre 2026, sans rien
écrire, et accepté.

```json
{
 "version": "V0.14",
 "date": "2026-11-20",
 "date_longue": "20 novembre 2026",
 "base": "V0_13_2026-11-12",
 "titre": "Atlas politique de Star Trek — V0.14 : exemple de journal",
 "resume": "Exemple : une problématique reformulée (STP-012).",
 "corrections": [
  {
   "id": "STP-012",
   "type": "correction",
   "champs": {
    "politics": {
     "avant": "Début de la diplomatie interstellaire terrestre; point de bifurcation civilisationnel.",
     "apres": "Début de la diplomatie interstellaire terrestre ; point de bifurcation civilisationnel."
    }
   },
   "motif": "exemple de documentation : typographie de la problématique"
  }
 ]
}
```

Résultat, en résumé :

- CSV : `politics` corrigé ; `note_audit` se termine par
  `V0.14 (2026-11-20) : exemple de documentation : typographie de la problématique.` ;
  `version_entree` vaut `V0.14 révisé` ;
- registre : `*Problématique :*` corrigée, ligne
  `*Note d’audit V0.14 :* …` ajoutée ;
- « Corrections documentées » : sous-titre `### V0.14 (2026-11-20)` et une ligne
  pour STP-012 ;
- titre, ligne d'état et paragraphe `**Mise à jour V0.14 …**` de la synthèse.

Pour un doublon, recopiez le modèle de `data/corrections/V0.11.json` : une
`correction` sur la secondaire, un `signalement` sur la principale, `champs`
vides. Pour des volets, des sources de fiche et des `textes`, recopiez celui de
`data/corrections/V0.13.json`.

## Tester un journal sans rien écrire

```bash
node -e 'import("./scripts/nouvelle-version.mjs").then(({ appliquer }) => {
  const r = appliquer(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")));
  console.log(r.cible, r.touches, "entrées", r.avertissements || []);
})' data/corrections/V0.14.json
```

`appliquer()` lève la même erreur que le script quand le journal est refusé,
et n'écrit aucun fichier.
