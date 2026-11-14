// Graphe chronologique (/reseau/graphe/) : le dessin est statique (calcule a
// la construction) ; ce script ajoute le survol qui isole un voisinage, la
// recherche et le zoom. Sans JavaScript, le graphe reste lisible et cliquable.
(() => {
  const svg = document.querySelector('svg.graphe');
  if (!svg) return;
  const outils = document.querySelector('.graphe-outils');
  outils.hidden = false;
  const etat = outils.querySelector('.graphe-etat');
  const noeuds = [...svg.querySelectorAll('.g-noeud')];
  const liens = [...svg.querySelectorAll('.g-liens path')];
  const voisins = new Map(noeuds.map((n) => [n.dataset.id, new Set()]));
  for (const l of liens) { voisins.get(l.dataset.de)?.add(l.dataset.vers); voisins.get(l.dataset.vers)?.add(l.dataset.de); }

  // Isoler le voisinage d'un noeud (survol ou focus clavier).
  const isoler = (id) => {
    svg.classList.toggle('isole', Boolean(id));
    const v = id ? voisins.get(id) : null;
    for (const n of noeuds) n.classList.toggle('actif', Boolean(id) && (n.dataset.id === id || v.has(n.dataset.id)));
    for (const l of liens) l.classList.toggle('actif', Boolean(id) && (l.dataset.de === id || l.dataset.vers === id));
  };
  for (const n of noeuds) {
    n.addEventListener('mouseenter', () => isoler(n.dataset.id));
    n.addEventListener('mouseleave', () => isoler(null));
    n.addEventListener('focus', () => isoler(n.dataset.id));
    n.addEventListener('blur', () => isoler(null));
  }

  // Zoom et deplacement par la viewBox.
  const [X0, Y0, W0, H0] = svg.getAttribute('viewBox').split(' ').map(Number);
  let vb = { x: X0, y: Y0, w: W0, h: H0 };
  const appliquer = () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  const zoom = (f, cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2) => {
    const w = Math.min(W0, Math.max(W0 / 12, vb.w / f)), h = w * (H0 / W0);
    vb = { x: cx - (cx - vb.x) * (w / vb.w), y: cy - (cy - vb.y) * (h / vb.h), w, h };
    vb.x = Math.max(X0, Math.min(X0 + W0 - vb.w, vb.x)); vb.y = Math.max(Y0, Math.min(Y0 + H0 - vb.h, vb.y));
    appliquer();
  };
  outils.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    const f = Number(b.dataset.zoom);
    if (f) zoom(f); else { vb = { x: X0, y: Y0, w: W0, h: H0 }; appliquer(); }
  }));
  const point = (ev) => { const r = svg.getBoundingClientRect(); return { x: vb.x + ((ev.clientX - r.left) / r.width) * vb.w, y: vb.y + ((ev.clientY - r.top) / r.height) * vb.h }; };
  svg.addEventListener('wheel', (ev) => { ev.preventDefault(); const p = point(ev); zoom(ev.deltaY < 0 ? 1.2 : 1 / 1.2, p.x, p.y); }, { passive: false });
  let glisse = null;
  svg.addEventListener('pointerdown', (ev) => { if (ev.target.closest('a')) return; glisse = { x: ev.clientX, y: ev.clientY, vb: { ...vb } }; svg.setPointerCapture(ev.pointerId); });
  svg.addEventListener('pointermove', (ev) => {
    if (!glisse) return;
    const r = svg.getBoundingClientRect();
    vb.x = Math.max(X0, Math.min(X0 + W0 - vb.w, glisse.vb.x - ((ev.clientX - glisse.x) / r.width) * vb.w));
    vb.y = Math.max(Y0, Math.min(Y0 + H0 - vb.h, glisse.vb.y - ((ev.clientY - glisse.y) / r.height) * vb.h));
    appliquer();
  });
  svg.addEventListener('pointerup', () => { glisse = null; });

  // Recherche : met en evidence les evenements correspondants et cadre le premier.
  const champ = outils.querySelector('#graphe-recherche');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  champ.addEventListener('input', () => {
    const q = norm(champ.value.trim());
    let premier = null, n = 0;
    for (const nd of noeuds) {
      const ok = q.length >= 2 && norm(nd.getAttribute('aria-label')).includes(q);
      nd.classList.toggle('trouve', ok);
      if (ok) { n++; premier = premier || nd; }
    }
    svg.classList.toggle('recherche', q.length >= 2);
    etat.textContent = q.length >= 2 ? `${n} événement${n > 1 ? 's' : ''} trouvé${n > 1 ? 's' : ''}` : '';
    if (premier) {
      const c = premier.querySelector('circle');
      const cx = Number(c.getAttribute('cx')), cy = Number(c.getAttribute('cy'));
      const w = Math.min(W0, 900), h = w * (H0 / W0);
      vb = { x: Math.max(X0, Math.min(X0 + W0 - w, cx - w / 2)), y: Math.max(Y0, Math.min(Y0 + H0 - h, cy - h / 2)), w, h };
      appliquer();
    }
  });
})();
