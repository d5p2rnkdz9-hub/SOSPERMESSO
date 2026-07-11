// Build the chatbot knowledge base: _cache/permits-it.json + guide pages
// → netlify/functions/chat-kb.mjs (a string module bundled into the chat function).
//
// Run: npm run chatbot:kb   (also runs automatically as part of `npm run build`)
// NOTE: `netlify dev` does NOT run the build command — run this script manually
// before testing the chat function locally.
//
// The output must be DETERMINISTIC (no timestamps, no randomness): the string
// becomes Claude's cached system prompt, and any byte change invalidates the
// prompt cache. Permits are sorted by slug for the same reason.

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { isDocumentsSection } = require('./fix-notion-links');

const ROOT = path.join(__dirname, '..');
const CACHE_FILE = path.join(ROOT, '_cache', 'permits-it.json');
const OUTPUT_FILE = path.join(ROOT, 'netlify', 'functions', 'chat-kb.mjs');
const SITE_URL = 'https://www.sospermesso.it';

// Guide pages included in the KB (output at root level, same filename)
const GUIDE_PAGES = [
  'dizionario.html',
  'protezione-internazionale.html',
  'ricongiungimento-familiare.html',
  'lavorare-in-italia.html',
  'kit-postale.html',
  'aiuto-legale.html',
  'controlla-permesso.html',
  'documenti-questura.html',
  'decreto-flussi.html',
];

// HTML → plain text, preserving list bullets and paragraph breaks
function htmlToText(html) {
  if (!html) return '';
  const prepared = String(html)
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/(p|ul|ol|li|h[1-6]|blockquote|tr|div|section)>/gi, '\n')
    .replace(/<(br|hr)\s*\/?>/gi, '\n');
  const $ = cheerio.load(prepared);
  return $.root()
    .text()
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatCost(value) {
  if (value === null || value === undefined) return null;
  return `${value} €`;
}

function buildPermitBlock(permit) {
  const lines = [];
  lines.push(`## Permesso: ${permit.tipo}`);
  lines.push(`Categoria: ${permit.categoria || 'n/d'}`);
  lines.push(`Pagina: ${SITE_URL}/permesso-${permit.slug}.html`);
  lines.push('');

  for (const section of permit.sections || []) {
    if (isDocumentsSection(section.question)) continue;
    const text = htmlToText(section.content);
    if (!text) continue;
    lines.push(`### ${section.question}`);
    lines.push(text);
    lines.push('');
  }

  if (Array.isArray(permit.primoDocuments) && permit.primoDocuments.length > 0) {
    lines.push(`### Documenti per la prima richiesta (modalità: ${permit.primoMethod || 'n/d'})`);
    for (const doc of permit.primoDocuments) lines.push(`- ${doc}`);
    const costs = [];
    if (formatCost(permit.costBollettinoPrimo)) costs.push(`bollettino postale ${formatCost(permit.costBollettinoPrimo)}`);
    if (formatCost(permit.costBollettinoAltPrimo)) costs.push(`bollettino alternativo ${formatCost(permit.costBollettinoAltPrimo)}`);
    if (formatCost(permit.costMarcaBolloPrimo)) costs.push(`marca da bollo ${formatCost(permit.costMarcaBolloPrimo)}`);
    if (costs.length > 0) lines.push(`Costi prima richiesta: ${costs.join(', ')}.`);
    lines.push(`Lista completa: ${SITE_URL}/documenti-${permit.slug}-primo.html`);
    lines.push('');
  }

  if (permit.rinnovoNotApplicable) {
    lines.push('### Rinnovo');
    lines.push('Il rinnovo non è applicabile per questo permesso.');
    lines.push('');
  } else if (Array.isArray(permit.rinnovoDocuments) && permit.rinnovoDocuments.length > 0) {
    lines.push(`### Documenti per il rinnovo (modalità: ${permit.rinnovoMethod || 'n/d'})`);
    for (const doc of permit.rinnovoDocuments) lines.push(`- ${doc}`);
    const costs = [];
    if (formatCost(permit.costBollettinoRinnovo)) costs.push(`bollettino postale ${formatCost(permit.costBollettinoRinnovo)}`);
    if (formatCost(permit.costBollettinoAltRinnovo)) costs.push(`bollettino alternativo ${formatCost(permit.costBollettinoAltRinnovo)}`);
    if (formatCost(permit.costMarcaBolloRinnovo)) costs.push(`marca da bollo ${formatCost(permit.costMarcaBolloRinnovo)}`);
    if (costs.length > 0) lines.push(`Costi rinnovo: ${costs.join(', ')}.`);
    lines.push(`Lista completa: ${SITE_URL}/documenti-${permit.slug}-rinnovo.html`);
    lines.push('');
  }

  const notes = htmlToText(permit.docNotes);
  if (notes) {
    lines.push('### Note sui documenti');
    lines.push(notes);
    lines.push('');
  }

  return lines.join('\n').trim();
}

function buildGuideBlock(filename) {
  const filePath = path.join(ROOT, 'src', 'pages', filename);
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.warn(`[build-chatbot-kb] Skipping missing guide page: ${filename}`);
    return null;
  }

  // Strip 11ty front matter
  const body = raw.replace(/^---[\s\S]*?---/, '');

  // Remove style/script/noscript, then extract text
  const $ = cheerio.load(body);
  $('style, script, noscript, svg').remove();
  const title = $('h1').first().text().trim() || filename.replace('.html', '');
  const text = htmlToText($.root().html());
  if (!text) return null;

  return [`## Guida: ${title}`, `Pagina: ${SITE_URL}/${filename}`, '', text].join('\n');
}

const CAVEATS = `## Avvertenze generali (importanti per ogni risposta)
- Le informazioni di questa base di conoscenza sono generali e informative: non sostituiscono una consulenza legale.
- Le leggi sull'immigrazione cambiano spesso: le informazioni potrebbero non essere aggiornate all'ultima modifica normativa.
- I costi e le prassi possono variare da Questura a Questura (le cosiddette "prassi locali").
- L'idoneità a un permesso dipende sempre dalla situazione personale: per casi specifici serve un operatore legale o un avvocato.
- Per trovare aiuto legale gratuito: ${SITE_URL}/aiuto-legale.html`;

function main() {
  const permits = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

  const permitBlocks = permits
    .filter((p) => !p.isPlaceholder)
    .sort((a, b) => a.slug.localeCompare(b.slug, 'en'))
    .map(buildPermitBlock);

  const guideBlocks = GUIDE_PAGES.map(buildGuideBlock).filter(Boolean);

  const kbText = [
    '# Base di conoscenza SOS Permesso (permessi di soggiorno in Italia)',
    '',
    '# PARTE 1 — Schede dei permessi di soggiorno',
    '',
    permitBlocks.join('\n\n---\n\n'),
    '',
    '# PARTE 2 — Guide del sito',
    '',
    guideBlocks.join('\n\n---\n\n'),
    '',
    CAVEATS,
  ].join('\n');

  const moduleSource =
    '// GENERATED by scripts/build-chatbot-kb.js — do not edit, do not commit.\n' +
    `export const KB_TEXT = ${JSON.stringify(kbText)};\n`;

  fs.writeFileSync(OUTPUT_FILE, moduleSource, 'utf8');

  const kb = Buffer.byteLength(kbText, 'utf8');
  console.log(
    `[build-chatbot-kb] Wrote ${path.relative(ROOT, OUTPUT_FILE)} — ` +
      `${permitBlocks.length} permits, ${guideBlocks.length} guides, ${(kb / 1024).toFixed(1)} KB of text` +
      ` (~${Math.round(kb / 3.5 / 1000)}k tokens est.)`
  );
}

main();
