# Images

Seulement si les images comptent pour le metier (e-commerce, media, portfolio,
immobilier, recettes...) ou pour la performance.

## Controles (HTML initial)

- `alt` present sur les images porteuses de sens (`images_without_alt`) ;
  alt vide (`alt=""`) correct pour les images decoratives ; pas de bourrage ;
- `width`/`height` ou `aspect-ratio` (`images_without_dimensions`) : CLS ;
- `loading="lazy"` sous la ligne de flottaison seulement, **jamais** sur
  l'image principale (LCP) ; `fetchpriority="high"` sur l'image LCP ;
- `srcset`/`sizes` pour servir la bonne taille ; formats modernes
  (WebP/AVIF) avec repli ;
- noms de fichiers descriptifs plutot que `IMG_1234.jpg` (P3) ;
- images de contenu en `<img>` (pas uniquement en `background-image` CSS) si
  elles doivent etre trouvees en recherche d'images ;
- poids : seulement si mesure (en-tete `Content-Length` lu, ou Lighthouse) ;
  les seuils de poids de claude-seo ne sont pas sources -- ne pas en faire
  une regle.

## Faux positifs

- lazy-loading par bibliotheque JS (`data-src`, `lazyload`, `data-ewww-src`,
  `data-perfmatters-src`) : l'absence de `loading` est voulue ;
- logos et icones decoratifs sans alt descriptif : normal ;
- images injectees par JS absentes du HTML initial : ne pas conclure sans
  rendu.

## Ecarte de claude-seo

Generation/conversion d'images (cwebp, ImageMagick, exiftool) et `sudo apt
install` : contraire aux regles du VPS et hors audit.
