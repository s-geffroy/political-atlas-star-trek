// Extraction des sections du Markdown analytique. Le texte est conserve tel
// quel (sous-chaines exactes du fichier source) ; rien n'est reformule.

const VOLETS = [
  ['faits', 'Faits canoniques et acteurs'],
  ['mecanisme', 'Mécanisme politique'],
  ['parallele', 'Parallèle réel à étudier'],
  ['objections', 'Objection et limites de l’analogie'],
  ['contexte', 'Contexte de création et diffusion'],
];
const ENTETES = [
  ['periode', 'Période diégétique'],
  ['source_audiovisuelle', 'Source audiovisuelle'],
  ['recoupement', 'Recoupement documentaire'],
];

// Decoupe le document en sections de niveau 2 et 3 : [{level, title, start, body}]
export function sections(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let cur = null;
  lines.forEach((l, i) => {
    const m = /^(#{1,3}) (.+)$/.exec(l);
    if (m) {
      cur = { level: m[1].length, title: m[2].trim(), line: i + 1, lines: [] };
      out.push(cur);
    } else if (cur) cur.lines.push(l);
  });
  return out.map((s) => ({ ...s, body: s.lines.join('\n').trim() }));
}

export function parseFiches(md) {
  const secs = sections(md);
  const startIdx = secs.findIndex((s) => s.level === 2 && s.title.startsWith('Cas approfondis'));
  if (startIdx < 0) return { fiches: [], problems: ['Section « Cas approfondis » introuvable'] };
  const fiches = [];
  const problems = [];
  for (let i = startIdx + 1; i < secs.length && secs[i].level > 2; i++) {
    const s = secs[i];
    const m = /^(STP-\d{3}) — (.+)$/.exec(s.title);
    if (!m) continue;
    const f = { id: m[1], titre: m[2], ligne: s.line, entetes: {}, volets: {}, sources: [], brut: s.body };
    for (const [k, label] of ENTETES) {
      const r = new RegExp('^\\*\\*' + label + ' :\\*\\* (.+?)\\s*$', 'm').exec(s.body);
      if (r) f.entetes[k] = r[1]; else problems.push(`${f.id} : en-tête « ${label} » absent`);
    }
    for (const [k, label] of VOLETS) {
      const r = new RegExp('^\\*\\*' + label + '\\.\\*\\* (.+)$', 'm').exec(s.body);
      if (r) f.volets[k] = r[1].trim(); else problems.push(`${f.id} : volet « ${label} » absent`);
    }
    for (const r of s.body.matchAll(/^\*\*(Source[^*]*?) :\*\* (\S+)\s*$/gm)) {
      f.sources.push({ libelle: r[1], url: r[2] });
    }
    fiches.push(f);
  }
  return { fiches, problems };
}

// Registre integral : une notice par STP, pour controle croise avec le CSV.
export function parseRegistre(md) {
  const secs = sections(md);
  const i0 = secs.findIndex((s) => s.level === 2 && s.title.startsWith('Registre intégral'));
  const out = new Map();
  for (let i = i0 + 1; i0 >= 0 && i < secs.length && secs[i].level > 2; i++) {
    const s = secs[i];
    for (const block of s.body.split(/\n(?=\*\*STP-\d{3} — )/)) {
      const m = /^\*\*(STP-\d{3}) — (.+?)\*\*/.exec(block.trim());
      if (!m) continue;
      const niv = /\*Recoupement :\* \*\*([ABC])\*\*/.exec(block);
      const note = /\*Note éditoriale :\* (.+)$/m.exec(block);
      out.set(m[1], { id: m[1], titre: m[2], cycle: s.title.replace(/ — \d+ entrées$/, ''), niveau: niv && niv[1], note_editoriale: note && note[1].trim() });
    }
  }
  return out;
}

// Mise en page uniquement : deux lignes consecutives du source, dont la
// premiere finit une phrase (point...), forment deux paragraphes au lieu d'un
// bloc fusionne par Markdown. Listes, tableaux et titres sont laisses tels quels.
// Le texte n'est pas modifie (seul un saut de ligne est ajoute).
export function paragraphesApresPoint(md) {
  const bloc = /^\s*([-*+]\s|>|\||#|\d+\.\s)/;
  const lignes = md.split('\n');
  const out = [];
  lignes.forEach((l, i) => {
    out.push(l);
    const suiv = lignes[i + 1];
    if (suiv !== undefined && l.trim() && suiv.trim() && /[.!?»]\s*$/.test(l) && !bloc.test(l) && !bloc.test(suiv)) out.push('');
  });
  return out.join('\n');
}

// Sections de niveau 2 utiles aux pages editoriales (methodologie, analyses).
export function sectionsEditoriales(md) {
  const secs = sections(md);
  const get = (prefix) => {
    const i = secs.findIndex((s) => s.level === 2 && s.title.startsWith(prefix));
    if (i < 0) return null;
    let body = secs[i].body;
    for (let j = i + 1; j < secs.length && secs[j].level > 2; j++) body += `\n\n### ${secs[j].title}\n\n${secs[j].body}`;
    return { titre: secs[i].title, markdown: paragraphesApresPoint(body.trim()) };
  };
  const intro = /^> (.+)$/m.exec(md);
  return {
    etat: intro ? intro[1].trim() : null,
    titre_document: (/^# (.+)$/m.exec(md) || [])[1] || null,
    synthese: get('Synthèse vérifiable'),
    protocole: get('Protocole d’audit'),
    corrections: get('Corrections documentées'),
    lignes_de_force: get('Lignes de force'),
    sources_methodo: get('Sources méthodologiques'),
    reserves: get('Réserves, falsifiabilité'),
  };
}
