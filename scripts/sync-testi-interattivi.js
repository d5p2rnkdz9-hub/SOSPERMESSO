#!/usr/bin/env node
/**
 * Aggiorna i testi normativi interattivi (public/patto-interattivo/) copiandoli dal
 * bundle di SOS Patto e li adatta al sito SOS Permesso.
 *
 *   node scripts/sync-testi-interattivi.js             # copia da ../../SOSPATTO + brand
 *   node scripts/sync-testi-interattivi.js --no-copy   # solo brand (bundle già copiato)
 *   SOSPATTO_BUNDLE=/percorso/patto-interattivo node scripts/sync-testi-interattivi.js
 *
 * Il bundle lo genera la pipeline di sospatto.it (`npm run testi` in SOSPATTO, cartella
 * tools/testi-interattivi/). Qui:
 *
 * 1. COPIA i file di contenuto (pagine, data.js, data-ext/, app.js). Restano quelli di
 *    SOS Permesso: gli style.css e amend.css già presenti (tema giallo/teal; su SOS Patto
 *    sono ritinti in blu) e la hub index.html alla radice (su SOS Patto è un redirect a
 *    /testi.html, che qui non esiste). Una cartella nuova prende lo style.css delle leggi.
 * 2. SEO: toglie il blocco «seo:begin … seo:end» (canonical e og:* puntano a sospatto.it).
 * 3. TOPBAR: il link «⌂ …» in alto a sinistra diventa il logo di SOS Permesso verso la home.
 * 4. PANNELLO a comparsa: il link in fondo diventa «⌂ SOS Permesso» verso la home.
 * 5. CSS: blocco marcato «sospermesso:brand» in ogni style.css (logo, font, sticky).
 * 6. CACHE-BUSTER: ?v=<hash del CSS> nel link allo style.css di ogni pagina.
 *
 * Idempotente. Dopo: aggiornare _data/normativa.js (verificaData, nuovi testi).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const BUNDLE = path.join(ROOT, 'public', 'patto-interattivo');
const SOURCE = process.env.SOSPATTO_BUNDLE
  || path.join(ROOT, '..', '..', 'SOSPATTO', 'public', 'patto-interattivo');

// File che restano di SOS Permesso se già presenti
const KEEP_LOCAL = new Set(['style.css', 'amend.css']);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.DS_Store') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// --- 1. copia --------------------------------------------------------------
function copyBundle() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`bundle di SOS Patto non trovato: ${SOURCE}`);
    process.exit(1);
  }
  let copied = 0, same = 0, kept = 0;
  const added = [];
  for (const src of walk(SOURCE)) {
    const rel = path.relative(SOURCE, src);
    const dst = path.join(BUNDLE, rel);
    if (rel === 'index.html') { kept++; continue; }
    if (KEEP_LOCAL.has(path.basename(rel)) && fs.existsSync(dst)) { kept++; continue; }
    if (path.basename(rel) === 'style.css') {
      // cartella nuova: parte dal tema SOS Permesso delle leggi
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(path.join(BUNDLE, 'dlgs-251-2007', 'assets', 'style.css'), dst);
      added.push(rel + ' (tema da dlgs-251-2007)');
      continue;
    }
    if (fs.existsSync(dst) && fs.readFileSync(dst).equals(fs.readFileSync(src))) { same++; continue; }
    if (!fs.existsSync(dst)) added.push(rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    copied++;
  }
  console.log(`copia:    ${copied} file aggiornati, ${same} invariati, ${kept} tenuti di SOS Permesso`);
  const dirs = [...new Set(added.map((r) => r.split(path.sep)[0]))];
  if (added.length) console.log(`          nuovi: ${added.length} file (${dirs.slice(0, 6).join(', ')}${dirs.length > 6 ? ' …' : ''})`);
}

// --- 2–4. pagine -----------------------------------------------------------
const SEO_RE = /<!-- seo:begin -->[\s\S]*?<!-- seo:end -->\n?/;
const HOME_RE = /<a class="home" href="[^"]*"[^>]*>(?:&#8962; [^<]*|<img class="topbar-logo"[^>]*>)<\/a>/;
const NEW_HOME = '<a class="home" href="/" aria-label="SOS Permesso — torna alla home">'
  + '<img class="topbar-logo" src="/IMAGES/logo-header.png" alt="SOS Permesso" width="317" height="160">'
  + '</a>';
const PANEL_RE = /<a class="panel-home" href="[^"]*">&#8962; [^<]*<\/a>/;
const NEW_PANEL = '<a class="panel-home" href="/">&#8962; SOS Permesso</a>';

function patchPage(file) {
  const text = fs.readFileSync(file, 'utf8');
  let out = text.replace(SEO_RE, '');
  const hasTopbar = HOME_RE.test(out);
  out = out.replace(HOME_RE, NEW_HOME).replace(PANEL_RE, NEW_PANEL);
  if (out !== text) fs.writeFileSync(file, out);
  return { changed: out !== text, hasTopbar };
}

// --- 5. CSS ----------------------------------------------------------------
const BRAND_BEGIN = '/* sospermesso:brand begin */';
const BRAND_END = '/* sospermesso:brand end */';
const CSS_RULE = `${BRAND_BEGIN}
/* logo SOS Permesso in alto a sinistra (link alla home) + topbar con i font del sito */
.topbar { padding: 6px 16px; gap: 14px; }
.topbar .home { display: block; flex-shrink: 0; line-height: 0; border-radius: 8px; }
.topbar .home:focus-visible { outline: 3px solid var(--yellow); outline-offset: 2px; }
.topbar-logo { display: block; height: 56px; width: auto; }
.home-here { font-family: var(--head); font-size: 17px; font-weight: 700; color: var(--ink); }
.topttl { font-family: var(--sans); font-size: 13px; color: var(--muted); line-height: 1.35; }
.topttl b { color: var(--ink); }
.actnav a { font-family: var(--sans); }
/* la topbar ora e' alta ~69px: riallinea gli sticky (prima 41px) */
.toc { top: 69px; max-height: calc(100vh - 69px); }
.ext-banner { top: 69px; }
@media (max-width: 1000px) {
  .toc { top: 69px; max-height: none; }
  #toc-toggle {
    border: 2px solid var(--ink);
    background: #fff;
    border-radius: 10px;
    padding: 6px 14px;
    font-family: var(--head);
    font-size: 13px;
    font-weight: 700;
    box-shadow: var(--pop-sm);
  }
}
@media (max-width: 700px) {
  .topbar { gap: 10px; }
  .topbar-logo { height: 48px; }
  .home-here { font-size: 15px; }
  .topttl { font-size: 12px; }
  .toc { top: 61px; }
  .ext-banner { top: 61px; }
}
${BRAND_END}
`;

function patchCss(file) {
  const text = fs.readFileSync(file, 'utf8');
  const re = new RegExp(`${BRAND_BEGIN.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}[\\s\\S]*?${BRAND_END.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\n?`);
  const out = re.test(text) ? text.replace(re, CSS_RULE) : text.replace(/\n*$/, '\n') + CSS_RULE;
  if (out !== text) fs.writeFileSync(file, out);
  return out !== text;
}

// --- main ------------------------------------------------------------------
if (!process.argv.includes('--no-copy')) copyBundle();

const files = walk(BUNDLE);
const pages = files.filter((f) => f.endsWith('.html') && !f.split(path.sep).includes('assets')
  && f !== path.join(BUNDLE, 'index.html'));
const cssFiles = files.filter((f) => f.endsWith(path.join('assets', 'style.css')));

let changedPages = 0;
const noTopbar = [];
for (const p of pages) {
  const r = patchPage(p);
  if (r.changed) changedPages++;
  if (!r.hasTopbar) noTopbar.push(path.relative(BUNDLE, p));
}
const changedCss = cssFiles.filter(patchCss).length;

// --- 6. cache-buster (anche la hub) ------------------------------------------
let bumped = 0;
for (const p of [...pages, path.join(BUNDLE, 'index.html')]) {
  const css = path.join(path.dirname(p), 'assets', 'style.css');
  if (!fs.existsSync(css)) continue;
  const v = crypto.createHash('md5').update(fs.readFileSync(css)).digest('hex').slice(0, 8);
  const text = fs.readFileSync(p, 'utf8');
  const out = text.replace(/(href="assets\/style\.css)(?:\?v=[0-9a-f]+)?(")/, `$1?v=${v}$2`);
  if (out !== text) { fs.writeFileSync(p, out); bumped++; }
}

console.log(`pagine:   ${changedPages}/${pages.length} adattate (SEO SOS Patto tolta, logo, pannello)`);
console.log(`CSS:      ${changedCss}/${cssFiles.length} style.css aggiornati; cache-buster: ${bumped} pagine`);
const unexpected = noTopbar.filter((r) => r !== 'audit.html');
if (unexpected.length) {
  console.warn(`ATTENZIONE: ${unexpected.length} pagine senza link home in topbar: ${unexpected.slice(0, 8).join(', ')}`);
  process.exit(1);
}
