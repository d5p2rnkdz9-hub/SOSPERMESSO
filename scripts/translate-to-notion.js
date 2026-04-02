#!/usr/bin/env node
/**
 * Translate IT permit content and write to target language Notion databases.
 *
 * This script:
 * 1. Reads IT permit pages + cached blocks
 * 2. Reads translations from a pre-built JSON file
 * 3. Writes translated pages to the target Notion database
 *
 * Usage:
 *   node scripts/translate-to-notion.js --lang ur     # Write Urdu translations
 *   node scripts/translate-to-notion.js --lang fa     # Write Farsi translations
 *   node scripts/translate-to-notion.js --lang zh     # Write Chinese translations
 *   node scripts/translate-to-notion.js --lang ur --extract  # Extract text to translate
 *   node scripts/translate-to-notion.js --lang ur --permit studio  # Single permit
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const cache = require('./notion-cache');

// ── Constants ──
const IT_DATABASE_ID = '3097355e-7f7f-819c-af33-d0fd0739cc5b';
const NOTION_DELAY = 350;
const MAX_BLOCKS_PER_APPEND = 100;

const LANG_CONFIG = {
  ur: { dbId: '42ef74d0-62cf-4c3e-b5d8-eafd4b2155b8', name: 'Urdu' },
  fa: { dbId: 'e350cb8e-515c-45f6-8c72-13175ab574d1', name: 'Farsi' },
  zh: { dbId: 'e78a1d6a-a450-48ec-98dc-459f8a90ca32', name: 'Chinese' },
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(name) {
  if (!name) return null;
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── CLI ──
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { lang: null, extract: false, permit: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang') opts.lang = args[++i];
    if (args[i] === '--extract') opts.extract = true;
    if (args[i] === '--permit') opts.permit = args[++i];
  }
  return opts;
}

// ── Notion Helpers ──
async function fetchDatabasePages(notion, databaseId) {
  const allPages = [];
  let hasMore = true;
  let startCursor;
  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100,
    });
    const dbPages = response.results.filter(page =>
      page.parent?.database_id === databaseId ||
      page.parent?.data_source_id === databaseId
    );
    allPages.push(...dbPages);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }
  return allPages;
}

async function fetchPageBlocks(notion, pageId) {
  const blocks = [];
  let cursor;
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId, start_cursor: cursor, page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchPageBlocks(notion, block.id);
    }
  }
  return blocks;
}

// ── Text Extraction ──
function extractTextFromRichText(richText) {
  if (!richText || !Array.isArray(richText)) return [];
  return richText
    .map(s => (s.plain_text || s.text?.content || '').trim())
    .filter(t => t.length > 0);
}

function extractTextFromBlocks(blocks) {
  const texts = new Set();
  for (const block of blocks) {
    const type = block.type;
    const typeData = block[type];
    if (typeData?.rich_text) {
      for (const t of extractTextFromRichText(typeData.rich_text)) {
        texts.add(t);
      }
    }
    if (block.children) {
      for (const t of extractTextFromBlocks(block.children)) {
        texts.add(t);
      }
    }
  }
  return texts;
}

// ── Block Translation ──
function segmentToCreateFormat(segment) {
  const result = {
    text: { content: segment.plain_text || segment.text?.content || '' },
  };
  if (segment.href || segment.text?.link) {
    result.text.link = { url: segment.href || segment.text.link.url };
  }
  const ann = segment.annotations;
  if (ann) {
    const annotations = {};
    if (ann.bold) annotations.bold = true;
    if (ann.italic) annotations.italic = true;
    if (ann.underline) annotations.underline = true;
    if (ann.strikethrough) annotations.strikethrough = true;
    if (ann.code) annotations.code = true;
    if (ann.color && ann.color !== 'default') annotations.color = ann.color;
    if (Object.keys(annotations).length > 0) result.annotations = annotations;
  }
  return result;
}

function translateSegment(segment, translations) {
  const result = segmentToCreateFormat(segment);
  const original = (segment.plain_text || segment.text?.content || '').trim();
  const translated = translations[original];
  if (translated && result.text) {
    // Preserve leading/trailing whitespace
    const rawContent = segment.plain_text || segment.text?.content || '';
    const leadingMatch = rawContent.match(/^(\s*)/);
    const trailingMatch = rawContent.match(/(\s*)$/);
    const leading = leadingMatch ? leadingMatch[1] : '';
    const trailing = trailingMatch ? trailingMatch[1] : '';
    result.text.content = leading + translated + trailing;
  }
  return result;
}

function blockToCreateFormat(block, translations) {
  const type = block.type;
  const result = {};

  switch (type) {
    case 'paragraph':
      result.paragraph = {
        rich_text: (block.paragraph?.rich_text || []).map(s => translateSegment(s, translations)),
      };
      break;
    case 'heading_2':
      result.heading_2 = {
        rich_text: (block.heading_2?.rich_text || []).map(s => translateSegment(s, translations)),
      };
      break;
    case 'heading_3':
      result.heading_3 = {
        rich_text: (block.heading_3?.rich_text || []).map(s => translateSegment(s, translations)),
      };
      break;
    case 'bulleted_list_item':
      result.bulleted_list_item = {
        rich_text: (block.bulleted_list_item?.rich_text || []).map(s => translateSegment(s, translations)),
      };
      if (block.children) {
        result.bulleted_list_item.children = block.children.map(c => blockToCreateFormat(c, translations));
      }
      break;
    case 'numbered_list_item':
      result.numbered_list_item = {
        rich_text: (block.numbered_list_item?.rich_text || []).map(s => translateSegment(s, translations)),
      };
      if (block.children) {
        result.numbered_list_item.children = block.children.map(c => blockToCreateFormat(c, translations));
      }
      break;
    case 'divider':
      result.divider = {};
      break;
    case 'quote':
      result.quote = {
        rich_text: (block.quote?.rich_text || []).map(s => translateSegment(s, translations)),
      };
      break;
    case 'callout':
      result.callout = {
        rich_text: (block.callout?.rich_text || []).map(s => translateSegment(s, translations)),
        icon: block.callout?.icon || undefined,
      };
      break;
    default:
      result.paragraph = { rich_text: [] };
      break;
  }
  return result;
}

function flattenChildrenForWrite(blocks) {
  return blocks.map(block => {
    const type = Object.keys(block).find(k =>
      ['paragraph', 'heading_2', 'heading_3', 'bulleted_list_item',
       'numbered_list_item', 'quote', 'callout', 'divider'].includes(k)
    );
    if (!type) return block;
    const result = { [type]: { ...block[type] } };
    if (block[type]?.children) {
      result[type].children = block[type].children.map(child =>
        flattenChildrenForWrite([child])[0]
      );
    }
    return result;
  });
}

// ── Main ──
async function main() {
  const opts = parseArgs();
  if (!opts.lang || !LANG_CONFIG[opts.lang]) {
    console.error('Usage: node scripts/translate-to-notion.js --lang <ur|fa|zh> [--extract] [--permit <slug>]');
    process.exit(1);
  }

  const lang = opts.lang;
  const config = LANG_CONFIG[lang];
  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  // Step 1: Get IT permit pages
  console.log('[translate] Fetching IT permit pages...');
  const itPages = (await fetchDatabasePages(notion, IT_DATABASE_ID))
    .filter(p => {
      const tipo = p.properties['Nome permesso']?.title?.[0]?.plain_text;
      if (!tipo) return false;
      if (tipo.startsWith('[DUPLICATE]')) return false;
      const slug = slugify(tipo);
      if (slug && slug.startsWith('duplicate-')) return false;
      if (opts.permit && !slug.includes(opts.permit)) return false;
      return true;
    })
    .map(p => ({
      id: p.id,
      tipo: p.properties['Nome permesso'].title[0].plain_text,
      slug: slugify(p.properties['Nome permesso'].title[0].plain_text),
      properties: p.properties,
      last_edited_time: p.last_edited_time,
    }));

  console.log(`[translate] Found ${itPages.length} IT permits`);

  // Step 2: Get blocks for each IT page (from cache)
  const pagesIndex = await cache.loadPagesIndex();
  const allTexts = new Set();
  const permitBlocks = {};

  for (const permit of itPages) {
    let blocks = await cache.getBlocks(permit.id);
    if (!blocks) {
      console.log(`[translate] Fetching blocks for ${permit.slug}...`);
      await delay(NOTION_DELAY);
      blocks = await fetchPageBlocks(notion, permit.id);
      await cache.setBlocks(permit.id, blocks);
      pagesIndex[permit.id] = {
        last_edited_time: permit.last_edited_time,
        fetchedAt: new Date().toISOString(),
      };
    }
    permitBlocks[permit.id] = blocks;

    // Collect translatable text
    allTexts.add(permit.tipo);
    for (const t of extractTextFromBlocks(blocks)) allTexts.add(t);

    // Collect property texts
    const props = permit.properties;
    for (const d of (props['Doc primo rilascio']?.multi_select || [])) allTexts.add(d.name);
    for (const d of (props['Doc rinnovo']?.multi_select || [])) allTexts.add(d.name);
    const pm = props['Mod primo rilascio']?.multi_select?.[0]?.name;
    const rm = props['Mod rinnovo']?.multi_select?.[0]?.name;
    if (pm) allTexts.add(pm);
    if (rm) allTexts.add(rm);
    const notes = (props['Info extra su doc rilascio']?.rich_text || []).map(s => s.plain_text).join('');
    if (notes) allTexts.add(notes);
  }

  await cache.savePagesIndex(pagesIndex);

  // Extract mode: dump texts for translation
  if (opts.extract) {
    const textsArray = [...allTexts].sort();
    const outPath = path.join(__dirname, '..', `_cache/translate-${lang}-texts.json`);
    await fs.writeFile(outPath, JSON.stringify(textsArray, null, 2), 'utf-8');
    console.log(`[translate] Extracted ${textsArray.length} unique text segments to ${outPath}`);
    console.log(`[translate] Next: translate these and save to _cache/translate-${lang}-done.json as {original: translated} map`);
    return;
  }

  // Step 3: Load translation map
  const translationPath = path.join(__dirname, '..', `_cache/translate-${lang}-done.json`);
  if (!fsSync.existsSync(translationPath)) {
    console.error(`[translate] Translation file not found: ${translationPath}`);
    console.error(`[translate] Run with --extract first, then create the translation file`);
    process.exit(1);
  }
  const translations = JSON.parse(fsSync.readFileSync(translationPath, 'utf-8'));
  console.log(`[translate] Loaded ${Object.keys(translations).length} translations`);

  // Step 4: Get target database data source ID
  const targetDb = await notion.databases.retrieve({ database_id: config.dbId });
  const targetDataSourceId = targetDb.data_sources?.[0]?.id;
  console.log(`[translate] Target DB: ${config.dbId} (DS: ${targetDataSourceId})`);

  // Step 5: Write translated pages
  let written = 0;
  let existingPages = null;
  for (const permit of itPages) {
    const blocks = permitBlocks[permit.id];
    const props = permit.properties;

    // Translate properties
    function tr(text) { return translations[text] || text; }
    function sanitize(text) { return tr(text).replace(/,/g, ';'); }

    const primoDocNames = (props['Doc primo rilascio']?.multi_select || []).map(d => d.name);
    const rinnovoDocNames = (props['Doc rinnovo']?.multi_select || []).map(d => d.name);
    const primoMethod = props['Mod primo rilascio']?.multi_select?.[0]?.name;
    const rinnovoMethod = props['Mod rinnovo']?.multi_select?.[0]?.name;
    const notes = (props['Info extra su doc rilascio']?.rich_text || []).map(s => s.plain_text).join('');

    const translatedProps = {
      'Name': { title: [{ text: { content: tr(permit.tipo) } }] },
      'Doc primo rilascio': { multi_select: primoDocNames.map(n => ({ name: sanitize(n) })) },
      'Doc rinnovo': { multi_select: rinnovoDocNames.map(n => ({ name: sanitize(n) })) },
      'Mod primo rilascio': { multi_select: primoMethod ? [{ name: sanitize(primoMethod) }] : [] },
      'Mod rinnovo': { multi_select: rinnovoMethod ? [{ name: sanitize(rinnovoMethod) }] : [] },
      'IT Page ID': { rich_text: [{ text: { content: permit.id } }] },
    };
    if (notes) {
      translatedProps['Info extra su doc rilascio/rinnovo'] = {
        rich_text: [{ text: { content: tr(notes) } }],
      };
    }

    // Translate blocks
    const translatedBlocks = blocks.map(b => blockToCreateFormat(b, translations));
    const flatBlocks = flattenChildrenForWrite(translatedBlocks);

    // Find existing page or create new
    console.log(`[translate] Writing ${lang.toUpperCase()}: ${permit.slug} (${flatBlocks.length} blocks)...`);
    await delay(NOTION_DELAY);

    let pageId;

    // Search for existing page by IT Page ID
    if (!existingPages) {
      existingPages = await fetchDatabasePages(notion, config.dbId);
    }
    const existingPage = existingPages.find(p => {
      const storedId = (p.properties?.['IT Page ID']?.rich_text || [])
        .map(s => s.plain_text).join('');
      return storedId === permit.id;
    });

    try {
      if (existingPage) {
        // Update existing page
        pageId = existingPage.id;
        await notion.pages.update({ page_id: pageId, properties: translatedProps });

        // Delete existing blocks
        await delay(NOTION_DELAY);
        const existing = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
        for (const block of existing.results) {
          await delay(200);
          try { await notion.blocks.delete({ block_id: block.id }); } catch {}
        }
      } else {
        // Create new page
        const created = await notion.pages.create({
          parent: { type: 'data_source_id', data_source_id: targetDataSourceId },
          properties: translatedProps,
        });
        pageId = created.id;
      }
    } catch (err) {
      console.error(`  ✗ Failed to create/update page: ${err.message}`);
      continue;
    }

    // Write blocks in batches
    for (let i = 0; i < flatBlocks.length; i += MAX_BLOCKS_PER_APPEND) {
      const batch = flatBlocks.slice(i, i + MAX_BLOCKS_PER_APPEND);
      await delay(NOTION_DELAY);
      try {
        await notion.blocks.children.append({ block_id: pageId, children: batch });
      } catch (err) {
        console.error(`  ✗ Failed to append blocks: ${err.message}`);
      }
    }

    written++;
    console.log(`  ✓ ${permit.slug} (${written}/${itPages.length})`);
  }

  console.log(`\n[translate] Done! Wrote ${written} ${lang.toUpperCase()} permits to Notion`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
