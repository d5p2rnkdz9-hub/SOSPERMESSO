#!/usr/bin/env node
/**
 * Extract all IT permit content for offline translation (NO Claude API).
 * Outputs a JSON file with all translatable text segments.
 *
 * Usage:
 *   node scripts/extract-for-translation.js
 *   → writes scripts/translation-work/it-segments.json
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const cache = require('./notion-cache');

const IT_DATABASE_ID = '3097355e-7f7f-819c-af33-d0fd0739cc5b';
const NOTION_DELAY = 350;
const OUTPUT_DIR = path.join(__dirname, 'translation-work');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function md5(text) { return crypto.createHash('md5').update(text).digest('hex'); }

function slugify(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(s => (s.plain_text || '').replace(/[✓✔☑]/g, '')).join('').trim();
}

function getRichTextArray(block) {
  const typeData = block[block.type];
  if (!typeData) return null;
  return typeData.rich_text || null;
}

function isQuestionBlock(block) {
  if (block.type === 'heading_3') {
    const question = extractPlainText(block.heading_3?.rich_text);
    if (question) return { question: question.trim() };
  }
  if (block.type === 'paragraph') {
    const richText = block.paragraph?.rich_text;
    if (richText && richText.length > 0) {
      const first = richText[0];
      if (first.annotations?.bold) {
        const text = (first.plain_text || '').trim();
        if (text.endsWith('?')) return { question: text };
      }
    }
  }
  return null;
}

async function fetchPageBlocks(notion, pageId) {
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
  } while (cursor);

  for (const block of blocks) {
    if (block.has_children) {
      await delay(NOTION_DELAY);
      block.children = await fetchPageBlocks(notion, block.id);
    }
  }
  return blocks;
}

function extractSectionsFromBlocks(blocks) {
  const sections = [];
  let currentQuestion = null;
  let currentBlocks = [];

  for (const block of blocks) {
    const questionInfo = isQuestionBlock(block);
    if (questionInfo) {
      if (currentQuestion) {
        sections.push({ question: currentQuestion, blocks: currentBlocks });
      }
      currentQuestion = questionInfo.question;
      currentBlocks = [block];
    } else if (currentQuestion) {
      currentBlocks.push(block);
    }
  }
  if (currentQuestion) {
    sections.push({ question: currentQuestion, blocks: currentBlocks });
  }
  return sections;
}

function collectSegmentsFromBlocks(blocks) {
  const segments = [];
  for (const block of blocks) {
    const rt = getRichTextArray(block);
    if (rt) {
      for (const seg of rt) {
        const text = (seg.plain_text || '').trim();
        if (text) segments.push(text);
      }
    }
    if (block.children) {
      for (const child of block.children) {
        const crt = getRichTextArray(child);
        if (crt) {
          for (const seg of crt) {
            const text = (seg.plain_text || '').trim();
            if (text) segments.push(text);
          }
        }
      }
    }
  }
  return segments;
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  console.log('[extract] Fetching IT permits from Notion...');

  // Fetch all IT pages
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;
  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100,
    });
    const dbPages = response.results.filter(page =>
      page.parent?.database_id === IT_DATABASE_ID ||
      page.parent?.data_source_id === IT_DATABASE_ID
    );
    allPages.push(...dbPages);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  const permits = allPages
    .filter(page => {
      const tipo = page.properties['Nome permesso']?.title?.[0]?.plain_text;
      if (!tipo) return false;
      if (tipo.startsWith('[DUPLICATE]')) return false;
      const slug = slugify(tipo);
      if (slug && slug.startsWith('duplicate-')) return false;
      return true;
    })
    .map(page => {
      const tipo = page.properties['Nome permesso']?.title?.[0]?.plain_text;
      return {
        id: page.id,
        tipo,
        slug: slugify(tipo),
        properties: page.properties,
        last_edited_time: page.last_edited_time,
      };
    });

  console.log(`[extract] Found ${permits.length} IT permits`);

  const output = { permits: [], uniqueSegments: {} };

  for (let i = 0; i < permits.length; i++) {
    const permit = permits[i];
    console.log(`[${i + 1}/${permits.length}] ${permit.tipo} (${permit.slug})`);

    // Get blocks (cached)
    const pagesIndex = await cache.loadPagesIndex();
    const cachedEntry = pagesIndex[permit.id];
    const pageChanged = !cachedEntry || cachedEntry.last_edited_time !== permit.last_edited_time;
    let blocks;
    if (!pageChanged) blocks = await cache.getBlocks(permit.id);
    if (!blocks) {
      await delay(NOTION_DELAY);
      blocks = await fetchPageBlocks(notion, permit.id);
      await cache.setBlocks(permit.id, blocks);
      pagesIndex[permit.id] = { last_edited_time: permit.last_edited_time, fetchedAt: new Date().toISOString() };
      await cache.savePagesIndex(pagesIndex);
    }

    const sections = extractSectionsFromBlocks(blocks);
    if (sections.length === 0) {
      console.log(`  → No Q&A sections, skipping`);
      continue;
    }

    // Collect properties to translate
    const props = permit.properties;
    const title = props['Nome permesso']?.title?.[0]?.plain_text || '';
    const primoDocNames = (props['Doc primo rilascio']?.multi_select || []).map(d => d.name);
    const rinnovoDocNames = (props['Doc rinnovo']?.multi_select || []).map(d => d.name);
    const primoMethod = props['Mod primo rilascio']?.multi_select?.[0]?.name || '';
    const rinnovoMethod = props['Mod rinnovo']?.multi_select?.[0]?.name || '';
    const notes = (props['Info extra su doc rilascio']?.rich_text || []).map(s => s.plain_text).join('');

    // Collect all text segments from sections
    const sectionData = sections.map(s => ({
      question: s.question,
      segments: collectSegmentsFromBlocks(s.blocks),
    }));

    // Build permit record
    const permitRecord = {
      id: permit.id,
      slug: permit.slug,
      tipo: permit.tipo,
      title,
      primoDocNames,
      rinnovoDocNames,
      primoMethod,
      rinnovoMethod,
      notes,
      sections: sectionData,
    };
    output.permits.push(permitRecord);

    // Collect unique segments
    const allTexts = [title, ...primoDocNames, ...rinnovoDocNames];
    if (primoMethod) allTexts.push(primoMethod);
    if (rinnovoMethod) allTexts.push(rinnovoMethod);
    if (notes) allTexts.push(notes);
    for (const s of sectionData) {
      allTexts.push(s.question);
      allTexts.push(...s.segments);
    }

    for (const text of allTexts) {
      if (text && text.trim()) {
        const hash = md5(text.trim());
        if (!output.uniqueSegments[hash]) {
          output.uniqueSegments[hash] = text.trim();
        }
      }
    }
  }

  // Write output
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, 'it-segments.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  const uniqueCount = Object.keys(output.uniqueSegments).length;
  console.log(`\n[extract] Done!`);
  console.log(`  Permits with content: ${output.permits.length}`);
  console.log(`  Unique text segments: ${uniqueCount}`);
  console.log(`  Output: ${outputPath}`);
}

main().catch(err => {
  console.error('[extract] Fatal error:', err.message);
  process.exit(1);
});
