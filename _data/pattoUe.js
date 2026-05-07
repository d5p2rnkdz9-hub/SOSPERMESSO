const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'patto-ue');

const regulations = [
  {
    slug: 'direttiva-accoglienza',
    regNumber: '2024/1346',
    regType: 'Direttiva',
    title: 'Direttiva accoglienza',
    shortDescription: "Norme sull'accoglienza dei richiedenti protezione internazionale.",
    icon: '🏠'
  },
  {
    slug: 'regolamento-qualifiche',
    regNumber: '2024/1347',
    regType: 'Regolamento',
    title: 'Regolamento qualifiche',
    shortDescription: 'Criteri per il riconoscimento dello status di rifugiato e della protezione sussidiaria.',
    icon: '✅'
  },
  {
    slug: 'regolamento-procedure',
    regNumber: '2024/1348',
    regType: 'Regolamento',
    title: 'Regolamento procedure',
    shortDescription: 'Procedura comune europea per la protezione internazionale.',
    icon: '📋'
  },
  {
    slug: 'regolamento-rimpatrio-frontiera',
    regNumber: '2024/1349',
    regType: 'Regolamento',
    title: 'Regolamento rimpatrio alla frontiera',
    shortDescription: 'Procedure di rimpatrio applicabili alla frontiera.',
    icon: '↩️'
  },
  {
    slug: 'regolamento-reinsediamento',
    regNumber: '2024/1350',
    regType: 'Regolamento',
    title: 'Regolamento reinsediamento e ammissione umanitaria',
    shortDescription: "Quadro dell'Unione per il reinsediamento e l'ammissione umanitaria.",
    icon: '🤝'
  },
  {
    slug: 'regolamento-ramm',
    regNumber: '2024/1351',
    regType: 'Regolamento',
    title: 'Regolamento RAMM (Dublino)',
    shortDescription: "Gestione dell'asilo e della migrazione: sostituisce il sistema di Dublino.",
    icon: '🗂️'
  },
  {
    slug: 'modifiche-ecris-tcn',
    regNumber: '2024/1352',
    regType: 'Regolamento',
    title: 'Modifiche al regolamento ECRIS-TCN',
    shortDescription: 'Modifiche al sistema europeo di informazione sui casellari giudiziari di cittadini di paesi terzi.',
    icon: '🛂'
  },
  {
    slug: 'regolamento-screening',
    regNumber: '2024/1356',
    regType: 'Regolamento',
    title: 'Regolamento screening',
    shortDescription: 'Accertamenti preliminari (screening) sui cittadini di paesi terzi alle frontiere esterne.',
    icon: '🔍'
  },
  {
    slug: 'regolamento-eurodac',
    regNumber: '2024/1358',
    regType: 'Regolamento',
    title: 'Regolamento Eurodac',
    shortDescription: 'Banca dati biometrica europea per identificare richiedenti asilo e migranti irregolari.',
    icon: '🆔'
  },
  {
    slug: 'regolamento-crisi',
    regNumber: '2024/1359',
    regType: 'Regolamento',
    title: 'Regolamento crisi e forza maggiore',
    shortDescription: "Disposizioni in caso di crisi migratoria, strumentalizzazione o forza maggiore.",
    icon: '⚠️'
  }
];

// Convert the three considerando layouts found across the 10 EU regulation MDs into a single
// "**(N)** text" markdown form, which renders as <p><strong>(N)</strong> text</p>.
//
// Format A (single-line pipe-table row, often with trailing pipe):
//   "| (N) | text |"      e.g. screening, ramm, eurodac
// Format B (two-line pipe-table, no header separator):
//   "| (N)\n| text"        e.g. direttiva-accoglienza, procedure
// Format C (bare number on its own line, then blank, then paragraph):
//   "(N)\n\ntext"          e.g. qualifiche, reinsediamento, ecris-tcn, crisi
function preprocessConsideranda(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Format A: "| (N) | text" or "| \(N\) | text" (eurodac uses backslash-escaped parens)
    let m = line.match(/^\|\s*\\?\((\d+)\\?\)\s*\|\s*(.+?)(?:\s*\|)?\s*$/);
    if (m) {
      out.push(`**(${m[1]})** ${m[2]}`);
      i++;
      continue;
    }

    // Format B: "| (N)" or "| \(N\)" then "| text"
    m = line.match(/^\|\s*\\?\((\d+)\\?\)\s*$/);
    if (m && i + 1 < lines.length) {
      const nm = lines[i + 1].match(/^\|\s*(.+)$/);
      if (nm) {
        out.push(`**(${m[1]})** ${nm[1]}`);
        i += 2;
        continue;
      }
    }

    // Format C: "(N)" alone on line, blank line(s), then text on its own line
    m = line.match(/^\\?\((\d+)\\?\)\s*$/);
    if (m) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j > i + 1 && j < lines.length) {
        out.push(`**(${m[1]})** ${lines[j]}`);
        i = j + 1;
        continue;
      }
    }

    out.push(line);
    i++;
  }
  return out.join('\n');
}

module.exports = function() {
  return regulations.map(r => {
    const mdFile = path.join(ASSETS_DIR, `${r.slug}.md`);
    const pdfFile = path.join(ASSETS_DIR, `${r.slug}.pdf`);
    let mdContent = '';
    try {
      mdContent = fs.readFileSync(mdFile, 'utf8');
    } catch (e) {
      console.warn(`[pattoUe] Missing MD file: ${mdFile}`);
    }
    const hasPdf = fs.existsSync(pdfFile);
    return {
      ...r,
      mdContent: preprocessConsideranda(mdContent),
      pdfPath: hasPdf ? `/public/patto-ue/${r.slug}.pdf` : null,
      mdPath: `/public/patto-ue/${r.slug}.md`
    };
  });
};
