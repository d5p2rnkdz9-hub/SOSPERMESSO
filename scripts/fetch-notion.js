#!/usr/bin/env node
/**
 * Fetch all Notion data and write to _cache/ as JSON
 *
 * Usage:
 *   npm run fetch          — fetch all languages
 *   npm run fetch -- --lang it,en  — fetch specific languages
 *
 * The _cache/ directory is committed to git so Netlify builds
 * never need to hit Notion API (build goes from ~96s to ~3s).
 */

require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', '_cache');

// Map of cache filename → data file path (relative to project root)
const DATA_FILES = {
  'permits-it':     '../_data/permits',
  'permits-en':     '../_data/permitsEn',
  'permits-es':     '../_data/permitsEs',
  'permits-fr':     '../_data/permitsFr',
  'permits-tr':     '../_data/permitsTr',
  'permits-bn':     '../_data/permitsBn',
  'permits-ru':     '../_data/permitsRu',
  'prassi-locali':  '../_data/prassiLocali',
};

// Language code extracted from cache key (permits-XX → XX)
function langFromKey(key) {
  if (key === 'prassi-locali') return 'prassi';
  return key.replace('permits-', '');
}

async function main() {
  // Parse --lang flag for selective fetch
  const args = process.argv.slice(2);
  const langIdx = args.indexOf('--lang');
  const selectedLangs = langIdx >= 0 && args[langIdx + 1]
    ? args[langIdx + 1].split(',').map(l => l.trim().toLowerCase())
    : null;

  await fs.mkdir(CACHE_DIR, { recursive: true });

  // Tell data files to skip cache and fetch from Notion
  process.env.NOTION_FETCH = '1';

  const entries = Object.entries(DATA_FILES).filter(([key]) => {
    if (!selectedLangs) return true;
    const lang = langFromKey(key);
    return selectedLangs.includes(lang);
  });

  if (entries.length === 0) {
    console.log('No matching data files. Available: it, en, es, fr, tr, bn, prassi');
    process.exit(1);
  }

  console.log(`Fetching ${entries.length} data source(s) from Notion...\n`);
  const startTime = Date.now();

  for (const [name, modulePath] of entries) {
    const fileStart = Date.now();
    console.log(`→ ${name}`);

    try {
      const fetchFn = require(modulePath);
      const data = await fetchFn();

      const outPath = path.join(CACHE_DIR, `${name}.json`);
      await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf-8');

      const count = Array.isArray(data) ? data.length : Object.keys(data).length;
      const elapsed = ((Date.now() - fileStart) / 1000).toFixed(1);
      console.log(`  ✓ ${count} entries cached (${elapsed}s)\n`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`);
    }
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Done in ${totalElapsed}s`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
