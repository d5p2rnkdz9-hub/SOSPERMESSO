#!/usr/bin/env node
/**
 * Fix RU translation issues in Notion.
 * Applies: per-permit critical fixes, duplicate block removal, bad terms.
 * RU is the cleanest language — no register issues, no broken links.
 *
 * Usage:
 *   node scripts/fix-ru-translations.js                # full run
 *   node scripts/fix-ru-translations.js --dry-run      # preview only
 *   node scripts/fix-ru-translations.js --slug attesa-occupazione  # single permit
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const RU_DB_ID = '133cab29-7903-44be-b1c5-551563451fa8';
const NOTION_DELAY = 350;
const DRY_RUN = process.argv.includes('--dry-run');
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf('--slug');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── BAD TERM replacements ──────────────────────────────────────────────────

const BAD_TERMS = [
  // C2: "comune" (common) mistranslated as "муниципалитет" (municipality)
  ['situazione molto муниципалитет (comune)', 'situazione molto frequente'],
  ['situazione molto муниципалитет', 'situazione molto frequente'],

  // protezione sociale confused with especial (same issue as all languages)
  ['специальная защита (protezione speciale) è richiesto', 'социальная защита (protezione sociale) è richiesto'],
  ['специальная защита (protezione speciale) è richiesta', 'социальная защита (protezione sociale) è richiesta'],
  ['разрешение (permesso) per специальная защита (protezione speciale)', 'разрешение (permesso) per социальная защита (protezione sociale)'],
  ['per motivi umanitari', 'per социальная защита (protezione sociale, art. 18 T.U. Immigrazione)'],

  // Imprecise legal threshold
  ['più o meno', ''],
  [', più o meno', ''],
];

// ─── Per-permit specific fixes ──────────────────────────────────────────────

const PERMIT_SPECIFIC_FIXES = {
  // Truncated sentence
  'calamita-naturale': {
    textReplacements: [
      [
        'rinnovabile per altri sei месяцев qualora',
        'rinnovabile per altri sei месяцев qualora la situazione di emergenza nel Paese di origine persista'
      ],
    ],
  },

  // Outdated year
  'richiesta-asilo': {
    textReplacements: [
      [
        'nel 2025',
        'nell\'ultimo anno fiscale'
      ],
    ],
  },
};

// ─── Permits with duplicate Q&A blocks ──────────────────────────────────────

const DUPLICATE_PERMITS = new Set([
  'carta-di-soggiorno-per-familiari-di-italiani-dinamici',
  'lavoro-subordinato-conversione-da-altro-permesso',
  'motivi-religiosi',
  'residenza-elettiva',
]);

// ─── Notion helpers ─────────────────────────────────────────────────────────

function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(s => s.plain_text || '').join('');
}

async function fetchPageBlocks(pageId, depth = 0) {
  const blocks = [];
  let cursor = undefined;
  do {
    const response = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor, page_size: 100 });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
    await delay(NOTION_DELAY);
  } while (cursor);
  if (depth < 3) {
    for (const block of blocks) {
      if (block.has_children) block._children = await fetchPageBlocks(block.id, depth + 1);
    }
  }
  return blocks;
}

function applyTextFixes(text, slug) {
  let result = text;
  let changes = [];

  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (result.includes(from)) {
        result = result.split(from).join(to);
        changes.push(`SPECIFIC: "${from.substring(0, 50)}..." → "${to.substring(0, 50)}..."`);
      }
    }
  }

  for (const [from, to] of BAD_TERMS) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
      changes.push(`BAD_TERM: "${from.substring(0, 40)}..." → "${to.substring(0, 40)}..."`);
    }
  }

  return { text: result, changes };
}

function applyToRichText(richTextArray, slug) {
  if (!richTextArray || !Array.isArray(richTextArray)) return { updated: false, changes: [] };
  let anyChanged = false;
  const allChanges = [];

  const combinedText = richTextArray.map(s => s.plain_text || s.text?.content || '').join('');
  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (combinedText.includes(from)) {
        const newText = combinedText.split(from).join(to);
        allChanges.push(`SPECIFIC: "${from.substring(0, 50)}..." → "${to.substring(0, 50)}..."`);
        return { richText: [{ text: { content: newText }, plain_text: newText, annotations: {} }], updated: true, changes: allChanges };
      }
    }
  }

  const newRichText = richTextArray.map(segment => {
    const content = segment.plain_text || segment.text?.content || '';
    if (!content.trim()) return segment;
    const { text: fixed, changes } = applyTextFixes(content, slug);
    if (fixed !== content) {
      anyChanged = true;
      allChanges.push(...changes);
      return { ...segment, text: { ...(segment.text || {}), content: fixed }, plain_text: fixed };
    }
    return segment;
  });
  return { richText: newRichText, updated: anyChanged, changes: allChanges };
}

async function updateBlock(block, slug) {
  const type = block.type;
  const typeData = block[type];
  if (!typeData?.rich_text) return { updated: false, changes: [] };
  const { richText, updated, changes } = applyToRichText(typeData.rich_text, slug);
  if (!updated) return { updated: false, changes: [] };
  if (!DRY_RUN) {
    await notion.blocks.update({
      block_id: block.id,
      [type]: { rich_text: richText.map(seg => ({ type: 'text', text: { content: seg.text?.content || seg.plain_text || '', link: seg.text?.link || null }, annotations: seg.annotations || {} })) },
    });
    await delay(NOTION_DELAY);
  }
  return { updated: true, changes };
}

function findDuplicateBlocks(blocks) {
  const questionPositions = {};
  blocks.forEach((block, idx) => {
    const typeData = block[block.type];
    if (!typeData?.rich_text) return;
    const text = extractPlainText(typeData.rich_text).trim();
    if (!text || !text.endsWith('?')) return;
    if (!questionPositions[text]) questionPositions[text] = [];
    questionPositions[text].push(idx);
  });
  const dupes = Object.entries(questionPositions).filter(([_, p]) => p.length > 1);
  if (!dupes.length) return [];
  let startIdx = Infinity;
  for (const [, positions] of dupes) { if (positions[1] < startIdx) startIdx = positions[1]; }
  return blocks.slice(startIdx).map(b => b.id);
}

async function processPermit(pageId, slug) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Processing: ${slug} (${pageId})`);
  const blocks = await fetchPageBlocks(pageId);
  console.log(`  Fetched ${blocks.length} blocks`);

  let totalChanges = 0;
  const changeLog = [];

  if (DUPLICATE_PERMITS.has(slug)) {
    const duplicateIds = findDuplicateBlocks(blocks);
    if (duplicateIds.length > 0) {
      console.log(`  Found ${duplicateIds.length} duplicate blocks to remove`);
      changeLog.push(`DUPLICATE_REMOVAL: ${duplicateIds.length} blocks`);
      if (!DRY_RUN) {
        for (const blockId of duplicateIds) {
          try { await notion.blocks.delete({ block_id: blockId }); await delay(NOTION_DELAY); totalChanges++; }
          catch (err) { console.error(`    Error: ${err.message}`); }
        }
      } else { totalChanges += duplicateIds.length; }
    }
  }

  const skipIds = new Set();
  if (DUPLICATE_PERMITS.has(slug)) findDuplicateBlocks(blocks).forEach(id => skipIds.add(id));

  async function processBlocks(blockList) {
    for (const block of blockList) {
      if (skipIds.has(block.id)) continue;
      try {
        const { updated, changes } = await updateBlock(block, slug);
        if (updated) { totalChanges++; changeLog.push(...changes); }
      } catch (err) { console.error(`    Error: ${err.message}`); }
      if (block._children) await processBlocks(block._children);
    }
  }
  await processBlocks(blocks);

  if (totalChanges > 0) {
    console.log(`  Applied ${totalChanges} changes:`);
    [...new Set(changeLog)].forEach(c => console.log(`    - ${c}`));
  } else { console.log(`  No changes needed`); }
  return { slug, changes: totalChanges, details: changeLog };
}

async function main() {
  console.log(`\n=== RU Translation Fix Script ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (SLUG_FILTER) console.log(`Filter: ${SLUG_FILTER}`);

  const cache = JSON.parse(fs.readFileSync(path.join(__dirname, '../_cache/permits-ru.json'), 'utf-8'));
  console.log(`Loaded ${cache.length} permits from cache`);

  const slugToPageId = {};
  for (const entry of cache) { const pageId = entry.notionPageId || entry.id; if (pageId) slugToPageId[entry.slug] = pageId; }
  console.log(`Mapped ${Object.keys(slugToPageId).length} slugs\n`);

  const slugs = SLUG_FILTER ? [SLUG_FILTER] : cache.map(c => c.slug);
  const results = []; let totalFixed = 0;

  for (const slug of slugs) {
    const pageId = slugToPageId[slug];
    if (!pageId) { console.log(`  SKIP: ${slug}`); continue; }
    const result = await processPermit(pageId, slug);
    results.push(result); totalFixed += result.changes;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUMMARY: ${results.length} permits, ${results.filter(r => r.changes > 0).length} with changes, ${totalFixed} total`);
  if (DRY_RUN) console.log(`DRY RUN — no changes made.`);

  const logContent = [
    `# RU Translation Fix Log\n\nDate: ${new Date().toISOString().split('T')[0]}`,
    `Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`,
    `## Summary\n- Permits: ${results.length}\n- With changes: ${results.filter(r => r.changes > 0).length}\n- Total: ${totalFixed}\n`,
    `## Changes\n`,
    ...results.filter(r => r.changes > 0).map(r =>
      `### ${r.slug}\nChanges: ${r.changes}\n${[...new Set(r.details)].map(d => `- ${d}`).join('\n')}\n`
    ),
  ].join('\n');
  fs.writeFileSync(path.join(__dirname, '../review-reports/ru-fix-log.md'), logContent);
  console.log(`Log: review-reports/ru-fix-log.md`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
