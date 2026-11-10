// Explorateur : recherche, filtres combinables, tri, etat dans l'URL.
// Amelioration progressive : sans ce script, la liste complete reste lisible.
(function () {
  'use strict';
  var form = document.getElementById('filtres');
  var liste = document.getElementById('liste');
  var etat = document.getElementById('etat');
  if (!form || !liste) return;
  form.hidden = false;

  var cartes = Array.prototype.slice.call(liste.children);
  var norm = function (s) {
    return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  };
  cartes.forEach(function (c) { c._texte = norm(c.textContent + ' ' + c.dataset.cat); });

  var CHAMPS = ['q', 'serie', 'cat', 'epoque', 'cycle', 'niv', 'cont', 'tri'];
  var champ = function (n) { return form.elements[n]; };

  function lireUrl() {
    var p = new URLSearchParams(location.search);
    CHAMPS.forEach(function (n) {
      var v = p.get(n);
      var el = champ(n);
      if (v === null) return;
      if (el.tagName === 'SELECT' && !Array.prototype.some.call(el.options, function (o) { return o.value === v; })) return;
      el.value = v;
    });
  }

  function ecrireUrl() {
    var p = new URLSearchParams();
    CHAMPS.forEach(function (n) {
      var v = champ(n).value;
      if (v && !(n === 'tri' && v === 'id')) p.set(n, v);
    });
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  function appliquer() {
    var q = norm(champ('q').value.trim());
    var mots = q ? q.split(/\s+/) : [];
    var f = {
      serie: champ('serie').value, cat: champ('cat').value, epoque: champ('epoque').value,
      cycle: champ('cycle').value, niv: champ('niv').value, cont: champ('cont').value
    };
    var n = 0;
    cartes.forEach(function (c) {
      var d = c.dataset;
      var ok = (!f.serie || d.serie.indexOf('|' + f.serie + '|') >= 0) &&
        (!f.cat || d.cat.indexOf('|' + f.cat + '|') >= 0) &&
        (!f.epoque || d.epoque === f.epoque) &&
        (!f.cycle || d.cycle === f.cycle) &&
        (!f.niv || d.niv === f.niv) &&
        (!f.cont || d.cont === f.cont) &&
        mots.every(function (m) { return c._texte.indexOf(m) >= 0; });
      c.hidden = !ok;
      if (ok) n++;
    });
    var tri = champ('tri').value;
    var cmp = {
      id: function (a, b) { return a.dataset.id < b.dataset.id ? -1 : 1; },
      periode: function (a, b) { return a.dataset.rang - b.dataset.rang; },
      titre: function (a, b) { return a.dataset.titre.localeCompare(b.dataset.titre, 'fr', { sensitivity: 'base' }); }
    }[tri] || null;
    if (cmp) {
      var frag = document.createDocumentFragment();
      cartes.slice().sort(cmp).forEach(function (c) { frag.appendChild(c); });
      liste.appendChild(frag);
    }
    etat.innerHTML = '<strong>' + n + '</strong> entrée' + (n > 1 ? 's' : '') + ' sur ' + cartes.length + '.';
    ecrireUrl();
  }

  var minuteur;
  form.addEventListener('input', function (ev) {
    clearTimeout(minuteur);
    minuteur = setTimeout(appliquer, ev.target.name === 'q' ? 150 : 0);
  });
  form.addEventListener('submit', function (ev) { ev.preventDefault(); appliquer(); });
  form.addEventListener('reset', function () { setTimeout(appliquer, 0); });
  lireUrl();
  appliquer();
})();
