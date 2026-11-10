# Performance et Core Web Vitals -- labo contre terrain

Methode reprise de web-quality-skills (addyosmani, MIT,
`skills/performance/references/MEASUREMENT.md`), adaptee au VPS.

## Les types de preuve ne se melangent pas

| Preuve | Ce que c'est | Usage |
|---|---|---|
| CrUX (terrain) | experiences reelles agregees, p75, fenetre glissante de 28 jours | decider si les utilisateurs ont un probleme CWV |
| RUM du site | mesures des sessions du site | segmenter, diagnostiquer la prod |
| Lighthouse / trace (labo) | une navigation synthetique, conditions fixees | reproduire, trouver la cause, eviter les regressions |
| `elapsed_ms` de seo_fetch | temps de reponse vu **depuis le VPS** | indice serveur seulement ; jamais une metrique utilisateur |
| inspection statique | hypotheses tirees du HTML | INFERE |

Seuils CWV « bon » au p75 (web.dev) : **LCP <= 2,5 s, INP <= 200 ms,
CLS <= 0,1**. INP a remplace FID en mars 2024 : ne jamais citer FID.

## Regles

- Sans CrUX ni RUM : `INP : NON MESURE EN CONDITIONS REELLES`. CrUX absent =
  **indisponible**, jamais « bon ». Frequent sur les sites a faible trafic.
- CrUX au niveau de l'origine seulement : le dire, ce n'est pas une preuve
  pour une URL precise.
- Mobile et desktop separes.
- Lighthouse ne mesure pas l'INP reel. Un score Lighthouse n'est pas un
  facteur de classement ni une garantie de trafic ; citer les **metriques**,
  pas le score.
- Decision sur une metrique labo : median de 3 navigations equivalentes,
  avec l'etendue. Noter version, form factor, bridage CPU/reseau, cache.
- CrUX ne reflete pas un deploiement d'il y a quelques minutes.

| Terrain | Labo | Lecture |
|---|---|---|
| mauvais | mauvais | probleme reproductible : tracer la cause dominante |
| mauvais | bon | le labo rate les conditions reelles : RUM, appareils, parcours |
| bon | mauvais | cas synthetique fragile ; ne pas dire que les utilisateurs souffrent |
| indisponible | quelconque | labo pour diagnostiquer ; recommander du RUM |

## Indices observables dans le HTML (INFERE)

grosse image hero sans `fetchpriority`, `loading="lazy"` sur l'image LCP,
images sans `width`/`height` (CLS), CSS/JS bloquants dans `<head>`, beaucoup de
scripts tiers synchrones, polices sans `font-display`. Ce sont des hypotheses
a mesurer, pas des constats.

## Outils sur ce VPS

1. **CrUX API** : seulement si l'utilisateur fournit une cle ; la cle ne
   s'ecrit jamais dans le run. Envoie l'URL a Google : le dire.
2. **PageSpeed Insights** : interface web publique, ou API sans cle pour un
   usage ponctuel ; envoie l'URL a Google -- le dire dans le manifest.
3. **Lighthouse** : jamais `npx` ni Node sur l'hote. Seulement en conteneur
   jetable, image **figee par digest** dans `VENDOR-LOCK.json`
   (`lighthouse_image`), une page a la fois, au plus 3 pages mobiles :
   ```bash
   docker run --rm --cpus 1 --memory 1g --security-opt no-new-privileges \
     <image@sha256:...> lighthouse '<URL deja validee par seo_fetch>' \
     --output=json --quiet --chrome-flags="--headless=new --no-sandbox" > "$RUN/evidence/lh-<id>.json"
   ```
   Le premier telechargement de l'image se fait **avec l'accord de
   l'utilisateur**. Si `lighthouse_image` n'est pas renseigne dans
   VENDOR-LOCK.json : pas de Lighthouse, et le rapport le dit.
   Limite : le conteneur n'a pas le garde anti-SSRF de seo_fetch ; ne lui
   passer qu'une URL publique deja atteinte, sans redirection vers un autre
   hote.
4. Rien de disponible : chaque constat de performance reste INFERE, avec la
   mesure exacte qui le confirmerait.
