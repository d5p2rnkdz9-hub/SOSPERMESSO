#!/usr/bin/env node
/**
 * Fix AR Notion pages: re-write blocks using IT block structure + AR translated text.
 *
 * Problem: AR pages were created with all-paragraph blocks, losing bullet/numbered lists.
 * Solution: Read IT blocks for structure, match with AR translated text, rewrite AR pages.
 *
 * Usage: node scripts/fix-ar-blocks.js
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const NOTION_DELAY = 350;
const MAX_BLOCKS = 100;

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Parse blocks into sections: [{question, blocks}]
 * A section starts with a heading_3 or a bold paragraph ending in ?
 */
function parseBlocksIntoSections(blocks) {
  const sections = [];
  let current = null;

  for (const block of blocks) {
    const type = block.type;
    const richText = block[type]?.rich_text || [];
    const plainText = richText.map(r => r.plain_text || '').join('').trim();

    // Detect question block
    let isQuestion = false;
    if (type === 'heading_3' && plainText) {
      isQuestion = true;
    } else if (type === 'paragraph' && richText.length > 0 && richText[0].annotations?.bold) {
      const firstText = (richText[0].plain_text || '').trim();
      if (firstText.endsWith('?')) isQuestion = true;
    }

    if (isQuestion) {
      if (current) sections.push(current);
      current = { question: plainText, blocks: [] };
      // If bold paragraph question has trailing content, include it
      if (type === 'paragraph' && richText.length > 1) {
        current.blocks.push(block);
      }
    } else if (current) {
      current.blocks.push(block);
    }
  }
  if (current) sections.push(current);
  return sections;
}

/**
 * Build a Notion block from type and plain text
 */
function makeBlock(type, text) {
  if (type === 'divider') return { divider: {} };
  if (type === 'paragraph' && !text) return { paragraph: { rich_text: [] } };

  return {
    [type]: {
      rich_text: [{ text: { content: text || '' } }],
    },
  };
}

/**
 * Split AR answer text into blocks matching IT block types
 */
function mapArTextToItBlocks(arText, itBlocks) {
  if (!arText || !itBlocks.length) return [];

  // Split AR text into lines
  const lines = arText.split('\n').filter(l => l.trim());

  // Collect IT block types (skip empty paragraphs)
  const itTypes = [];
  for (const block of itBlocks) {
    const type = block.type;
    const richText = block[type]?.rich_text || [];
    const plainText = richText.map(r => r.plain_text || '').join('').trim();

    if (type === 'divider') {
      itTypes.push({ type: 'divider', text: '' });
    } else if (type === 'paragraph' && !plainText) {
      itTypes.push({ type: 'paragraph', text: '' }); // empty separator
    } else {
      itTypes.push({ type, text: plainText });
    }
  }

  // If AR has same number of content lines as IT content blocks, map 1:1
  const itContentBlocks = itTypes.filter(b => b.text || b.type === 'divider');

  if (lines.length === itContentBlocks.length) {
    // Perfect 1:1 mapping
    const result = [];
    let lineIdx = 0;
    for (const itBlock of itTypes) {
      if (itBlock.type === 'divider') {
        result.push(makeBlock('divider'));
        lineIdx++;
      } else if (!itBlock.text) {
        result.push(makeBlock('paragraph', ''));
      } else {
        result.push(makeBlock(itBlock.type, lines[lineIdx]));
        lineIdx++;
      }
    }
    return result;
  }

  // Otherwise, use heuristic: assign AR lines to IT types
  // First pass: separate bullets from paragraphs in AR text
  const arBullets = [];
  const arParagraphs = [];
  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('✅')) {
      arBullets.push(line.replace(/^[-•]\s*/, ''));
    } else {
      arParagraphs.push(line);
    }
  }

  // Build result following IT structure
  const result = [];
  let bulletIdx = 0;
  let paraIdx = 0;

  for (const itBlock of itTypes) {
    if (itBlock.type === 'divider') {
      result.push(makeBlock('divider'));
    } else if (!itBlock.text) {
      result.push(makeBlock('paragraph', ''));
    } else if (itBlock.type === 'bulleted_list_item' || itBlock.type === 'numbered_list_item') {
      if (bulletIdx < arBullets.length) {
        result.push(makeBlock(itBlock.type, arBullets[bulletIdx++]));
      } else if (paraIdx < arParagraphs.length) {
        // Fallback: use paragraph text as bullet
        result.push(makeBlock(itBlock.type, arParagraphs[paraIdx++]));
      }
    } else {
      // paragraph, callout, quote, heading
      if (paraIdx < arParagraphs.length) {
        result.push(makeBlock(itBlock.type, arParagraphs[paraIdx++]));
      } else if (bulletIdx < arBullets.length) {
        result.push(makeBlock(itBlock.type, arBullets[bulletIdx++]));
      }
    }
  }

  // Append any remaining AR text as paragraphs
  while (paraIdx < arParagraphs.length) {
    result.push(makeBlock('paragraph', arParagraphs[paraIdx++]));
  }
  while (bulletIdx < arBullets.length) {
    result.push(makeBlock('bulleted_list_item', arBullets[bulletIdx++]));
  }

  return result;
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  // Load data
  const itPermits = JSON.parse(fs.readFileSync('_cache/permits-it.json', 'utf8'));
  const arPermits = JSON.parse(fs.readFileSync('_cache/permits-ar.json', 'utf8'));
  const arTranslated = JSON.parse(fs.readFileSync('_cache/permits-ar.json', 'utf8'));

  // Build IT id→slug map
  const itById = {};
  for (const p of itPermits) {
    itById[p.slug] = p;
  }

  let fixed = 0;
  let skipped = 0;

  for (let i = 0; i < arPermits.length; i++) {
    const arPermit = arPermits[i];
    const itPermit = itById[arPermit.slug];

    if (!itPermit) {
      console.log(`[${i+1}/${arPermits.length}] SKIP ${arPermit.slug} — no IT match`);
      skipped++;
      continue;
    }

    // Read IT blocks from cache
    const itBlocksPath = path.join('.notion-cache', 'blocks', `${itPermit.id}.json`);
    if (!fs.existsSync(itBlocksPath)) {
      console.log(`[${i+1}/${arPermits.length}] SKIP ${arPermit.slug} — no IT blocks cached`);
      skipped++;
      continue;
    }

    const itBlocks = JSON.parse(fs.readFileSync(itBlocksPath, 'utf8'));
    if (!itBlocks.length) {
      skipped++;
      continue;
    }

    // Parse IT blocks into sections
    const itSections = parseBlocksIntoSections(itBlocks);

    // Get AR sections (from cached HTML, but we need the plain text translations)
    const arSections = arPermit.sections || [];

    if (!arSections.length) {
      console.log(`[${i+1}/${arPermits.length}] SKIP ${arPermit.slug} — placeholder`);
      skipped++;
      continue;
    }

    console.log(`[${i+1}/${arPermits.length}] Fixing ${arPermit.slug} (${itSections.length} IT sections, ${arSections.length} AR sections)`);

    // Delete existing blocks from AR page
    await delay(NOTION_DELAY);
    let existingBlocks;
    try {
      existingBlocks = await notion.blocks.children.list({ block_id: arPermit.id, page_size: 100 });
    } catch (err) {
      console.log(`  ERROR listing blocks: ${err.message}`);
      skipped++;
      continue;
    }

    for (const block of existingBlocks.results) {
      await delay(200);
      try {
        await notion.blocks.delete({ block_id: block.id });
      } catch (err) {
        // Ignore deletion errors
      }
    }

    // Build new blocks using IT structure + AR text
    const newBlocks = [];

    // Match AR sections to IT sections by index
    const maxSections = Math.min(itSections.length, arSections.length);

    for (let s = 0; s < maxSections; s++) {
      const itSection = itSections[s];
      const arSection = arSections[s];

      // Question heading
      newBlocks.push(makeBlock('heading_3', arSection.question));

      // Strip HTML from AR content to get plain text
      const arPlainText = (arSection.content || '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\n{2,}/g, '\n')
        .trim();

      // Map AR text to IT block structure
      const answerBlocks = mapArTextToItBlocks(arPlainText, itSection.blocks);
      newBlocks.push(...answerBlocks);
    }

    // Handle extra AR sections (not in IT)
    for (let s = maxSections; s < arSections.length; s++) {
      const arSection = arSections[s];
      newBlocks.push(makeBlock('heading_3', arSection.question));
      const arPlainText = (arSection.content || '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/\n{2,}/g, '\n').trim();

      for (const line of arPlainText.split('\n').filter(l => l.trim())) {
        if (line.startsWith('- ') || line.startsWith('• ')) {
          newBlocks.push(makeBlock('bulleted_list_item', line.replace(/^[-•]\s*/, '')));
        } else {
          newBlocks.push(makeBlock('paragraph', line));
        }
      }
    }

    // Write blocks in batches
    for (let j = 0; j < newBlocks.length; j += MAX_BLOCKS) {
      const batch = newBlocks.slice(j, j + MAX_BLOCKS);
      await delay(NOTION_DELAY);
      try {
        await notion.blocks.children.append({
          block_id: arPermit.id,
          children: batch,
        });
      } catch (err) {
        console.log(`  ERROR writing batch: ${err.message}`);
      }
    }

    fixed++;
    if (fixed % 10 === 0) {
      console.log(`  Progress: ${fixed} fixed`);
    }
  }

  console.log(`\nDone! Fixed: ${fixed}, Skipped: ${skipped}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
