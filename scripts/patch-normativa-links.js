#!/usr/bin/env node
/**
 * I testi coordinati interattivi in public/patto-interattivo/ arrivano dalla
 * pipeline di sospatto.it: sono artefatti generati, con la topbar che punta
 * all'hub del bundle ("⌂ Patto UE" → ../index.html). Sui testi italiani, che su
 * sospermesso.it sono linkati da /normativa.html, quel link è un vicolo cieco:
 * lo si riporta al sito.
 *
 * Idempotente: rieseguirlo dopo ogni rinfresco del bundle (`node
 * scripts/patch-normativa-links.js`) e non fa nulla se la patch c'è già.
 * I 10 testi UE restano invariati: il loro "home" è l'hub del bundle.
 */
const fs = require('fs');
const path = require('path');

const BUNDLE = path.join(__dirname, '..', 'public', 'patto-interattivo');
const SLUGS = ['dlgs-286-1998', 'dlgs-25-2008', 'dlgs-142-2015', 'dlgs-251-2007'];

const FROM = '<a class="home" href="../index.html">&#8962; Patto UE</a>';
const TO = '<a class="home" href="/normativa.html">&#8962; SOS Permesso</a>';

let patched = 0;
let already = 0;
let missing = 0;

for (const slug of SLUGS) {
  const file = path.join(BUNDLE, slug, 'index.html');
  if (!fs.existsSync(file)) {
    console.warn(`  ⚠ ${slug}: index.html non trovato`);
    missing++;
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes(TO)) {
    console.log(`  = ${slug}: già patchato`);
    already++;
    continue;
  }
  if (!html.includes(FROM)) {
    console.warn(`  ⚠ ${slug}: topbar diversa dall'atteso — patch da rifare a mano`);
    missing++;
    continue;
  }
  fs.writeFileSync(file, html.replace(FROM, TO));
  console.log(`  ✓ ${slug}: link home → /normativa.html`);
  patched++;
}

console.log(`\npatch-normativa-links: ${patched} patchati, ${already} già a posto, ${missing} da controllare`);
process.exit(missing > 0 ? 1 : 0);
