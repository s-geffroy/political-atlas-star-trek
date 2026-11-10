# Preuves, statuts, priorites -- le contrat de findings.json

Principe repris de seo-agent-skills (gaguero, MIT) : `preuve -> constat ->
quality gate -> action`, et etendu par le prompt maitre SEO Architect v1.0.

## Niveaux de preuve (`evidence_level`)

| Niveau | Sens | Exemple |
|---|---|---|
| `OBSERVE` | lu directement dans une reponse HTTP, un HTML, un robots.txt, un sitemap, un DOM rendu | `x-robots-tag: noindex` dans `evidence/pages/0003.json` |
| `MESURE` | sorti d'un instrument, conditions notees | LCP lab median de 3 runs Lighthouse, mobile, cache froid |
| `INFERE` | deduit de plusieurs observations ; mecanisme plausible, pas prouve | « le blog semble rendu cote client » (12 mots dans le HTML initial) |
| `FOURNI_PAR_UTILISATEUR` | donne par l'utilisateur (export GSC, objectif metier) | |
| `NON_VERIFIABLE` | impossible a etablir avec les acces du run | indexation reelle sans GSC |

## Statuts (`status`)

- `CONFIRME` : preuve directe (OBSERVE, MESURE, FOURNI) identifiable, et le
  constat survit a la revue contradictoire.
- `SUSPECTE` : indices, pas de preuve suffisante. Jamais P0.
- `NON_VERIFIABLE` : on ne peut pas savoir ici ; l'action est « obtenir X ».
- `REJETE` : examine puis ecarte (on le garde, c'est utile au lecteur).

## Priorites (`priority`) -- quatre dimensions independantes

Chaque finding porte **impact plausible** (dans `impact_hypothesis`),
**confiance** (`confidence`), **effort** (`effort`, fourchette conditionnelle
au framework et a la competence), **risque** (`risk`).

- `P0` : probleme CONFIRME qui touche substantiellement une zone strategique
  (blocage d'indexation accidentel generalise, site en 5xx). Urgent.
- `P1` : forte valeur attendue, preuves satisfaisantes.
- `P2` : amelioration reelle, moins urgente ou dependante.
- `P3` : secondaire ou conditionnelle.
- `INVESTIGUER` : potentiellement critique mais non prouve : on priorise la
  collecte de preuve, pas un correctif premature.

Regles :
- un Lighthouse rouge ou un grand nombre de petites erreurs ne fait pas un P0 ;
- une anomalie facile ne passe pas devant une faiblesse majeure de valeur ;
- les **cinq gestes** du rapport sont les plus rentables ET defendables ; si
  les preuves manquent, ce sont des verifications ou des demandes d'acces.

## Le contrat (un objet par finding)

```json
{
  "id": "SEO-001",
  "category": "indexation | crawl | canonical | redirections | sitemap | international | contenu | intention | architecture | maillage | donnees-structurees | performance | mobile | images | ia | local | ecommerce | securite | autre",
  "status": "CONFIRME | SUSPECTE | NON_VERIFIABLE | REJETE",
  "evidence_level": "OBSERVE | MESURE | INFERE | FOURNI_PAR_UTILISATEUR | NON_VERIFIABLE",
  "confidence": "elevee | moyenne | faible",
  "priority": "P0 | P1 | P2 | P3 | INVESTIGUER",
  "url_examples": ["URL reelles du run"],
  "scope": "page | template | site | inconnu",
  "observation": "le fait, sans interpretation",
  "evidence": [{"source": "HTTP | HTML | DOM | robots | sitemap | CrUX | Lighthouse | GSC | analytics | Git | utilisateur | autre",
                "captured_at": "ISO-8601",
                "detail": "extrait expurge",
                "reference": "evidence/pages/0003.json ou URL"}],
  "impact_hypothesis": "mecanisme possible ET ses limites",
  "action": "geste precis",
  "implementation_location": "CMS / fichier:ligne / serveur / inconnu",
  "effort": "fourchette + hypothese",
  "risk": "regression possible et gravite",
  "dependencies": ["SEO-00x"],
  "owner_role": "contenu | developpeur | SEO | administrateur | metier",
  "verification": "test reproductible et resultat attendu",
  "review_status": "ACCEPTE | A_VERIFIER | REJETE | RISQUE_MAJEUR",
  "human_review_required": true
}
```

Racine du fichier : `{"audited_url": ..., "generated_at": ..., "mode": "public|source|connected", "findings": [...]}`.

- `reference` relative = chemin dans le dossier du run (le validateur verifie
  qu'il existe et qu'il ne sort pas du run).
- Aucune valeur d'exemple ne reste ; aucun secret, cookie, en-tete
  Authorization, URL signee ou donnee personnelle.
- `human_review_required: true` des que l'action touche noindex, robots,
  canonical, redirection, hreflang, migration, balisage transverse.

## Donnees proprietaires (mode CONNECTED)

- Indiquer periode, granularite, pays/appareil, echantillonnage/anonymisation.
- Position moyenne : avec precaution (moyenne ponderee par impressions).
- Separer marque / non-marque ; tenir compte de la saisonnalite, d'une
  migration, d'un changement produit.
- Correlation n'est pas causalite.
- L'absence d'une URL dans un `site:` ou dans l'echantillon public ne prouve
  pas la non-indexation. Le canonique **choisi par Google** ne se lit que dans
  l'inspection d'URL GSC.
- API d'inspection d'URL : quelques URL choisies, quotas respectes, jamais
  tout le site.
