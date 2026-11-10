// Bascule entre les deux chronologies (onglets ARIA). Sans JavaScript, les
// deux sections restent affichees l'une sous l'autre.
(function () {
  'use strict';
  var liste = document.querySelector('[role="tablist"]');
  if (!liste) return;
  var onglets = Array.prototype.slice.call(liste.querySelectorAll('[role="tab"]'));
  liste.hidden = false;

  function choisir(o, focus) {
    onglets.forEach(function (t) {
      var actif = t === o;
      t.setAttribute('aria-selected', actif ? 'true' : 'false');
      t.tabIndex = actif ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !actif;
    });
    if (focus) o.focus();
    var vue = o.id.replace('t-', '');
    var p = new URLSearchParams(location.search);
    if (vue === 'diegetique') p.delete('vue'); else p.set('vue', vue);
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  onglets.forEach(function (t, i) {
    t.addEventListener('click', function () { choisir(t, false); });
    t.addEventListener('keydown', function (ev) {
      var j = null;
      if (ev.key === 'ArrowRight') j = (i + 1) % onglets.length;
      if (ev.key === 'ArrowLeft') j = (i - 1 + onglets.length) % onglets.length;
      if (ev.key === 'Home') j = 0;
      if (ev.key === 'End') j = onglets.length - 1;
      if (j !== null) { ev.preventDefault(); choisir(onglets[j], true); }
    });
  });
  var vue = new URLSearchParams(location.search).get('vue');
  choisir(document.getElementById('t-' + (vue === 'diffusion' ? 'diffusion' : 'diegetique')), false);
})();
