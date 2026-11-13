# Rapport de qualité documentaire

> Généré par `scripts/validate.mjs` le 2026-11-13. Source : `data/source/Star_Trek_Atlas_Politique_V0_18_2026-11-13.csv`, `data/source/Star_Trek_Atlas_Politique_V0_18_2026-11-13.md`.

**Bilan : 0 erreur(s), 2 avertissement(s).**

| # | Contrôle | Statut | Détail |
|---|---|---|---|
| 1 | Identifiants uniques et non vides | ok | 305 identifiants distincts, 305 déjà publiés suivis. |
| 2 | Lignes importées et rejets | ok | 305 entrées importées, 0 rejet(s), 305 annoncées par le Markdown. |
| 3 | Niveaux de recoupement A / B / C | ok | A : 209, B : 89, C : 1. |
| 4 | Liens syntaxiquement valides | ok | 723 URL contrôlées (syntaxe seulement, pas de requête réseau). |
| 5 | Présence des fiches approfondies | ok | 31 fiches : STP-006, STP-034, STP-048, STP-061, STP-077, STP-094, STP-101, STP-107, STP-125, STP-126, STP-129, STP-139, STP-149, STP-153, STP-157, STP-172, STP-194, STP-197, STP-230, STP-239, STP-267, STP-271, STP-274, STP-281, STP-282, STP-286, STP-293, STP-295, STP-297, STP-298, STP-300. |
| 6 | Cohérence fiches ↔ événements | ok | 305 notices de registre comparées au CSV ; 6 doublons tranchés et 159 relations documentées vérifiés. |
| 7 | Dates ambiguës conservées en texte | ok | 91 périodes non réductibles à une année, conservées telles quelles ; la clé d'ordre ne sert qu'au tri et n'est jamais affichée. |
| 8 | Continuités alternatives distinctes | avertissement | Continuité principale : 282, Univers Miroir : 8, Chronologie Kelvin : 4, Temporalité ou réalité modifiée : 5. |
| 9 | Aucun enrichissement inventé | ok | Champs dérivés limités à une liste fermée ; textes des fiches = sous-chaînes exactes du Markdown ; dates de diffusion toutes sourcées. |
| 10 | Aucune perte de données | ok | CSV reconstruit à partir des données publiées et comparé octet par octet (hors BOM et fins de ligne). |

## 8. Continuités alternatives distinctes

- Avertissement — STP-047 ↔ STP-240 : association entre continuités différentes (affichée comme telle)
- Avertissement — STP-194 ↔ STP-239 : association entre continuités différentes (affichée comme telle)

## Limites du corpus mesurées

- 3 entrées de niveau C (référence candidate non recoupée individuellement).
- 2 entrées sans URL de contrôle.
- 0 entrées classées « autre / à qualifier ».
- 290 entrées reliées à une date de diffusion vérifiée.
- Fiches approfondies sans source de contrôle : aucune.
- Références de source non rattachées à une série : aucune.
