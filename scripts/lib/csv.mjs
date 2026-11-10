// Parseur CSV minimal et strict : BOM UTF-8, separateur configurable,
// champs entre guillemets (avec "" pour un guillemet et retours a la ligne).
// Aucune normalisation du contenu des champs : ce qui est lu est rendu tel quel.

export function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function parseCsv(text, sep = ';') {
  const src = stripBom(text);
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === '') { quoted = true; i++; continue; }
    if (c === sep) { row.push(field); field = ''; i++; continue; }
    if (c === '\r' && src[i + 1] === '\n') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (quoted) throw new Error('CSV : guillemet non ferme en fin de fichier');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Retourne { header, records, rejects } ; un enregistrement dont le nombre de
// champs differe de l'en-tete est rejete, jamais tronque ni complete.
export function readRecords(text, sep = ';') {
  const rows = parseCsv(text, sep).filter((r) => !(r.length === 1 && r[0] === ''));
  const [header, ...body] = rows;
  const records = [];
  const rejects = [];
  body.forEach((r, idx) => {
    const line = idx + 2;
    if (r.length !== header.length) {
      rejects.push({ line, reason: `${r.length} champs au lieu de ${header.length}`, raw: r });
      return;
    }
    const o = {};
    header.forEach((h, k) => { o[h] = r[k]; });
    records.push({ line, data: o });
  });
  return { header, records, rejects };
}

// Re-serialise (pour le test d'aller-retour sans perte).
export function serializeCsv(header, records, sep = ';') {
  const esc = (v) => (/["\n\r]/.test(v) || v.includes(sep) ? '"' + v.replace(/"/g, '""') + '"' : v);
  return [header, ...records.map((r) => header.map((h) => r[h]))]
    .map((r) => r.map(esc).join(sep))
    .join('\n');
}
