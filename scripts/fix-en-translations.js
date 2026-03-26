#!/usr/bin/env node
/**
 * Fix EN translation issues in Notion.
 * Applies: bad term fixes, per-permit critical fixes,
 * duplicate block removal.
 *
 * Usage:
 *   node scripts/fix-en-translations.js                # full run
 *   node scripts/fix-en-translations.js --dry-run      # preview only
 *   node scripts/fix-en-translations.js --slug attesa-occupazione  # single permit
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const EN_DB_ID = 'c1dc0271-f1f4-4147-9464-391884f4dfad';
const NOTION_DELAY = 350;
const DRY_RUN = process.argv.includes('--dry-run');
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf('--slug');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── BAD TERM replacements (global) ─────────────────────────────────────────

const BAD_TERMS = [
  // Italian calques
  ['legal operator', 'legal advisor'],
  ['Legal operator', 'Legal advisor'],
  ['Can apply whoever', 'The following people can apply'],
  ['can apply whoever', 'the following people can apply'],
  ['in state of pregnancy', 'who are pregnant'],
  ['In state of pregnancy', 'Who are pregnant'],
  ['property transfer notification', 'housing declaration (cessione di fabbricato)'],
  ['property transfer declaration', 'housing declaration (cessione di fabbricato)'],
  ['Property transfer declaration', 'Housing declaration (cessione di fabbricato)'],

  // Duplicate words
  ['job seeking job seeking', 'job seeking'],
  ['Job seeking job seeking', 'Job seeking'],

  // Imprecise legal language
  [', more or less', ''],
  ['more or less', 'approximately'],

  // Calques
  ['a work clearance seasonal', 'a seasonal work clearance'],
  ['hardly convertible', 'very difficult to convert'],
];

// ─── Per-permit specific fixes ──────────────────────────────────────────────

const PERMIT_SPECIFIC_FIXES = {
  // Truncated sentence
  'calamita-naturale': {
    textReplacements: [
      [
        'renewable for another six months if',
        'renewable for another six months if the emergency situation in your country persists'
      ],
      [
        'renewable for six months if',
        'renewable for six months if the emergency situation in your country persists'
      ],
    ],
  },

  // "more or less" on legal threshold
  'lavoro-subordinato-conversione-da-altro-permesso': {
    textReplacements: [
      [
        '538 euros per month, more or less',
        '538 euros per month (the social allowance amount, updated annually)'
      ],
    ],
  },

  // Outdated year for legal aid
  'richiesta-asilo': {
    textReplacements: [
      [
        'If in 2025 you earned less than',
        'If in the last fiscal year you earned less than'
      ],
      [
        'if in 2025 you earned less than',
        'if in the last fiscal year you earned less than'
      ],
    ],
  },

  // protezione sociale confused with other types
  'protezione-sociale-vittime-di-tratta': {
    textReplacements: [
      [
        'residence permit for humanitarian reasons',
        'residence permit for social protection (Art. 18 T.U. Immigrazione)'
      ],
      [
        'permit for special protection',
        'permit for social protection'
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
  'figlio-minore-di-piu-di-14-anni-che-vive-con-i-genitori',
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
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
    await delay(NOTION_DELAY);
  } while (cursor);
  if (depth < 3) {
    for (const block of blocks) {
      if (block.has_children) {
        block._children = await fetchPageBlocks(block.id, depth + 1);
      }
    }
  }
  return blocks;
}

// ─── Text transformation ────────────────────────────────────────────────────

function applyTextFixes(text, slug) {
  let result = text;
  let changes = [];

  const specific = PERMIT_SPECIFIC_FIXES[slug];
  if (specific && specific.textReplacements) {
    for (const [from, to] of specific.textReplacements) {
      if (result.includes(from)) {
        result = result.split(from).join(to);
        changes.push(`SPECIFIC: "${from.substring(0, 60)}..." → "${to.substring(0, 60)}..."`);
      }
    }
  }

  for (const [from, to] of BAD_TERMS) {
    if (result.includes(from)) {
      result = result.split(from).join(to);
      changes.push(`BAD_TERM: "${from}" → "${to}"`);
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
        allChanges.push(`SPECIFIC: "${from.substring(0, 60)}..." → "${to.substring(0, 60)}..."`);
        anyChanged = true;
        const newRichText = [{ text: { content: newText }, plain_text: newText, annotations: {} }];
        return { richText: newRichText, updated: true, changes: allChanges };
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

// ─── Block update ───────────────────────────────────────────────────────────

async function updateBlock(block, slug) {
  const type = block.type;
  const typeData = block[type];
  if (!typeData?.rich_text) return { updated: false, changes: [] };

  const { richText, updated, changes } = applyToRichText(typeData.rich_text, slug);
  if (!updated) return { updated: false, changes: [] };

  if (!DRY_RUN) {
    await notion.blocks.update({
      block_id: block.id,
      [type]: {
        rich_text: richText.map(seg => ({
          type: 'text',
          text: { content: seg.text?.content || seg.plain_text || '', link: seg.text?.link || null },
          annotations: seg.annotations || {},
        })),
      },
    });
    await delay(NOTION_DELAY);
  }

  return { updated: true, changes };
}

// ─── Duplicate detection ────────────────────────────────────────────────────

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
  for (const [, positions] of dupes) {
    if (positions[1] < startIdx) startIdx = positions[1];
  }
  return blocks.slice(startIdx).map(b => b.id);
}

// ─── Main ───────────────────────────────────────────────────────────────────

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
          try {
            await notion.blocks.delete({ block_id: blockId });
            await delay(NOTION_DELAY);
            totalChanges++;
          } catch (err) {
            console.error(`    Error deleting block ${blockId}: ${err.message}`);
          }
        }
      } else {
        totalChanges += duplicateIds.length;
      }
    }
  }

  const skipIds = new Set();
  if (DUPLICATE_PERMITS.has(slug)) {
    findDuplicateBlocks(blocks).forEach(id => skipIds.add(id));
  }

  async function processBlocks(blockList) {
    for (const block of blockList) {
      if (skipIds.has(block.id)) continue;
      try {
        const { updated, changes } = await updateBlock(block, slug);
        if (updated) { totalChanges++; changeLog.push(...changes); }
      } catch (err) {
        console.error(`    Error updating block ${block.id}: ${err.message}`);
      }
      if (block._children) await processBlocks(block._children);
    }
  }
  await processBlocks(blocks);

  if (totalChanges > 0) {
    console.log(`  Applied ${totalChanges} changes:`);
    [...new Set(changeLog)].forEach(c => console.log(`    - ${c}`));
  } else {
    console.log(`  No changes needed`);
  }
  return { slug, changes: totalChanges, details: changeLog };
}

async function main() {
  console.log(`\n=== EN Translation Fix Script ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (SLUG_FILTER) console.log(`Filter: ${SLUG_FILTER}`);

  const cache = JSON.parse(fs.readFileSync(path.join(__dirname, '../_cache/permits-en.json'), 'utf-8'));
  console.log(`Loaded ${cache.length} permits from cache`);

  const slugToPageId = {};
  for (const entry of cache) {
    const pageId = entry.notionPageId || entry.id;
    if (pageId) slugToPageId[entry.slug] = pageId;
  }
  console.log(`Mapped ${Object.keys(slugToPageId).length} slugs\n`);

  const slugs = SLUG_FILTER ? [SLUG_FILTER] : cache.map(c => c.slug);
  const results = [];
  let totalFixed = 0;

  for (const slug of slugs) {
    const pageId = slugToPageId[slug];
    if (!pageId) { console.log(`  SKIP: ${slug}`); continue; }
    const result = await processPermit(pageId, slug);
    results.push(result);
    totalFixed += result.changes;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUMMARY: ${results.length} permits, ${results.filter(r => r.changes > 0).length} with changes, ${totalFixed} total`);
  if (DRY_RUN) console.log(`DRY RUN — no changes made.`);

  const logContent = [
    `# EN Translation Fix Log\n\nDate: ${new Date().toISOString().split('T')[0]}`,
    `Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`,
    `## Summary\n- Permits: ${results.length}\n- With changes: ${results.filter(r => r.changes > 0).length}\n- Total: ${totalFixed}\n`,
    `## Changes\n`,
    ...results.filter(r => r.changes > 0).map(r =>
      `### ${r.slug}\nChanges: ${r.changes}\n${[...new Set(r.details)].map(d => `- ${d}`).join('\n')}\n`
    ),
  ].join('\n');
  fs.writeFileSync(path.join(__dirname, '../review-reports/en-fix-log.md'), logContent);
  console.log(`Log: review-reports/en-fix-log.md`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
