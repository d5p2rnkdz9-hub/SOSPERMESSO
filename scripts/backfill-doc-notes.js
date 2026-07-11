#!/usr/bin/env node
/**
 * Backfill the docNotes property ("Info extra su doc rilascio/rinnovo") on
 * translated permit pages WITHOUT touching their content blocks.
 *
 * This is the safe path for translating notes on pages that already have
 * translated Q&A blocks (a full translate-to-notion.js write would replace
 * blocks and fall back to Italian for anything missing from done.json).
 *
 * Usage:
 *   node scripts/backfill-doc-notes.js --lang en --extract
 *       Reads _cache/permits-it.json + _cache/permits-en.json, collects the IT
 *       notes missing in EN, writes _cache/notes-en-texts.json
 *       ({"IT text": ""} map — fill the values with translations, or let the
 *       Claude Code subagents do it, then save as _cache/notes-en-done.json).
 *
 *   node scripts/backfill-doc-notes.js --lang en
 *       Reads _cache/notes-en-done.json and updates ONLY the notes property of
 *       the matching pages in the EN Notion DB (matched via IT Page ID).
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const CACHE = path.join(__dirname, '..', '_cache');
const NOTES_PROP = 'Info extra su doc rilascio/rinnovo';
const NOTION_DELAY = 350;

const LANG_DBS = {
  en: 'c1dc0271-f1f4-4147-9464-391884f4dfad',
  fr: 'b7955daa-3da7-4a0c-ac9d-0bbe4ba7d70e',
  es: '93ad8b71-73e7-499b-83bc-a1975bda89dd',
  tr: '49d77cd7-b4c7-4c8a-a731-40b6315bc29e',
  bn: '552940da-0783-46dd-9094-b5a2f2e8276d',
  ru: '133cab29-7903-44be-b1c5-551563451fa8',
  ar: '39c16853-a650-4ab6-8cba-36e08a69fab8',
  ur: '42ef74d0-62cf-4c3e-b5d8-eafd4b2155b8',
  fa: 'e350cb8e-515c-45f6-8c72-13175ab574d1',
  zh: 'e78a1d6a-a450-48ec-98dc-459f8a90ca32',
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function loadCache(lang) {
  return JSON.parse(fs.readFileSync(path.join(CACHE, `permits-${lang}.json`), 'utf8'));
}

// IT permits whose notes are missing in the target language cache
function permitsNeedingNotes(lang) {
  const it = loadCache('it');
  const trBySlug = new Map(loadCache(lang).map(p => [p.slug, p]));
  return it.filter(p => {
    if (!p.docNotes || !p.docNotes.trim()) return false;
    const tr = trBySlug.get(p.slug);
    return tr && !(tr.docNotes && tr.docNotes.trim());
  });
}

async function main() {
  const args = process.argv.slice(2);
  const lang = args[args.indexOf('--lang') + 1];
  const extract = args.includes('--extract');
  if (!lang || !LANG_DBS[lang]) {
    console.error(`Usage: node scripts/backfill-doc-notes.js --lang <${Object.keys(LANG_DBS).join('|')}> [--extract]`);
    process.exit(1);
  }

  const needing = permitsNeedingNotes(lang);
  console.log(`[notes] ${needing.length} permits need ${lang.toUpperCase()} notes: ${needing.map(p => p.slug).join(', ') || '—'}`);
  if (!needing.length) return;

  if (extract) {
    const texts = {};
    for (const p of needing) texts[p.docNotes] = '';
    const out = path.join(CACHE, `notes-${lang}-texts.json`);
    fs.writeFileSync(out, JSON.stringify(texts, null, 2), 'utf8');
    console.log(`[notes] Extracted ${Object.keys(texts).length} unique note texts to ${out}`);
    console.log(`[notes] Translate the values, save as _cache/notes-${lang}-done.json, then rerun without --extract`);
    return;
  }

  const donePath = path.join(CACHE, `notes-${lang}-done.json`);
  if (!fs.existsSync(donePath)) {
    console.error(`[notes] ${donePath} not found — run with --extract first and translate it`);
    process.exit(1);
  }
  const done = JSON.parse(fs.readFileSync(donePath, 'utf8'));

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const db = await notion.databases.retrieve({ database_id: LANG_DBS[lang] });
  const ds = db.data_sources?.[0]?.id;

  // Map IT Page ID → target page id
  const byItId = new Map();
  let cursor;
  do {
    await delay(NOTION_DELAY);
    const r = await notion.dataSources.query({ data_source_id: ds, start_cursor: cursor, page_size: 100 });
    for (const p of r.results) {
      const itId = (p.properties['IT Page ID']?.rich_text || []).map(s => s.plain_text).join('');
      if (itId) byItId.set(itId, p.id);
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);

  let updated = 0, skipped = 0;
  for (const p of needing) {
    const translated = done[p.docNotes];
    const pageId = byItId.get(p.id);
    if (!translated || !translated.trim()) { console.warn(`  ⚠ no translation for ${p.slug} — skipped`); skipped++; continue; }
    if (!pageId) { console.warn(`  ⚠ no ${lang.toUpperCase()} page for ${p.slug} (IT Page ID ${p.id}) — skipped`); skipped++; continue; }
    await delay(NOTION_DELAY);
    // Notion rich_text segments cap at 2000 chars
    const chunks = translated.match(/[\s\S]{1,1900}/g) || [];
    await notion.pages.update({
      page_id: pageId,
      properties: { [NOTES_PROP]: { rich_text: chunks.map(c => ({ text: { content: c } })) } },
    });
    updated++;
    console.log(`  ✓ ${p.slug}`);
  }
  console.log(`[notes] Done: ${updated} updated, ${skipped} skipped`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
