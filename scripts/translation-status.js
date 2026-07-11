#!/usr/bin/env node
/**
 * Translation completeness audit across all 10 site languages.
 *
 * Reads the committed _cache/permits-*.json files and reports, per language:
 *   - MISSING ROW:   IT permit with no row in the translated DB
 *   - NO SECTIONS:   translated row exists but has no Q&A content while IT does
 *   - FEWER SECTIONS: translated row has fewer Q&A sections than IT
 *   - MISSING NOTES: IT has docNotes but the translation doesn't
 *   - UNTRANSLATED TITLE: translated title is byte-identical to the IT title
 *                    (legit for words like "Apolidia" — treat as a hint)
 *
 * IT placeholders (no content in the source) are listed separately: their
 * translations are expected to be placeholder rows too.
 *
 * Usage:
 *   npm run translations              # human-readable report
 *   npm run translations -- --json    # machine-readable (used by the pipeline)
 *
 * IMPORTANT: the caches must be fresh (npm run fetch) for this to reflect
 * Notion reality. Exits 1 if any gap is found (hints excluded).
 */
const fs = require('fs');
const path = require('path');

const LANGS = ['en', 'fr', 'es', 'tr', 'bn', 'ru', 'ar', 'ur', 'fa', 'zh'];
const CACHE = path.join(__dirname, '..', '_cache');

function load(lang) {
  const file = path.join(CACHE, `permits-${lang}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const asJson = process.argv.includes('--json');
  const it = load('it');
  if (!it || !it.length) {
    console.error('No IT cache found (or empty). Run: npm run fetch -- --lang it');
    process.exit(2);
  }

  const placeholders = it.filter(p => p.isPlaceholder);
  const report = { itPermits: it.length, itPlaceholders: placeholders.map(p => p.slug), langs: {} };
  let gapCount = 0;

  for (const lang of LANGS) {
    const data = load(lang);
    const entry = { missingRows: [], noSections: [], fewerSections: [], missingNotes: [], sameTitleHint: [] };
    report.langs[lang] = entry;
    if (!data) {
      entry.error = 'cache file missing — run npm run fetch';
      gapCount++;
      continue;
    }
    const bySlug = new Map(data.map(p => [p.slug, p]));
    for (const itP of it) {
      const tr = bySlug.get(itP.slug);
      if (!tr) { entry.missingRows.push(itP.slug); continue; }
      const itSections = (itP.sections || []).length;
      const trSections = (tr.sections || []).length;
      if (itSections > 0 && trSections === 0) entry.noSections.push(itP.slug);
      else if (trSections < itSections) entry.fewerSections.push(`${itP.slug} (${trSections}/${itSections})`);
      if (itP.docNotes && itP.docNotes.trim() && !(tr.docNotes && tr.docNotes.trim())) {
        entry.missingNotes.push(itP.slug);
      }
      if (itP.tipo && tr.tipo === itP.tipo && !itP.isPlaceholder) entry.sameTitleHint.push(itP.slug);
    }
    gapCount += entry.missingRows.length + entry.noSections.length
      + entry.fewerSections.length + entry.missingNotes.length;
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`IT source: ${it.length} permits, ${placeholders.length} placeholders (no content yet: ${report.itPlaceholders.join(', ') || '—'})\n`);
    for (const lang of LANGS) {
      const e = report.langs[lang];
      if (e.error) { console.log(`${lang.toUpperCase()}: ⚠ ${e.error}`); continue; }
      const gaps = e.missingRows.length + e.noSections.length + e.fewerSections.length + e.missingNotes.length;
      if (gaps === 0) {
        console.log(`${lang.toUpperCase()}: ✓ complete${e.sameTitleHint.length ? ` (title-identical hint: ${e.sameTitleHint.join(', ')})` : ''}`);
        continue;
      }
      console.log(`${lang.toUpperCase()}: ${gaps} gap(s)`);
      if (e.missingRows.length) console.log(`  missing rows:    ${e.missingRows.join(', ')}`);
      if (e.noSections.length) console.log(`  no sections:     ${e.noSections.join(', ')}`);
      if (e.fewerSections.length) console.log(`  fewer sections:  ${e.fewerSections.join(', ')}`);
      if (e.missingNotes.length) console.log(`  missing notes:   ${e.missingNotes.join(', ')}`);
      if (e.sameTitleHint.length) console.log(`  title = IT hint: ${e.sameTitleHint.join(', ')}`);
    }
    console.log(gapCount === 0
      ? '\nAll translations complete.'
      : `\n${gapCount} total gap(s). Run the "translate" pipeline (say "translate" in Claude Code) to fill them.`);
  }
  process.exit(gapCount === 0 ? 0 : 1);
}

main();
