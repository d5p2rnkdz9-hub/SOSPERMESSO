#!/usr/bin/env node
/**
 * Push pre-translated content to Notion databases (NO Claude API).
 * Reads IT structure from it-segments.json + translated chunks, writes to target Notion DB.
 *
 * Usage:
 *   node scripts/push-translations.js --lang tr
 *   node scripts/push-translations.js --lang bn
 *   node scripts/push-translations.js --lang tr --dry-run
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const cache = require('./notion-cache');

const IT_DATABASE_ID = '3097355e-7f7f-819c-af33-d0fd0739cc5b';
const NOTION_DELAY = 350;
const MAX_BLOCKS_PER_APPEND = 100;
const WORK_DIR = path.join(__dirname, 'translation-work');

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

// ─── Config ──────────────────────────────────────────────────────────────────

const LANG_CONFIG = {
  tr: {
    dbId: '49d77cd7-b4c7-4c8a-a731-40b6315bc29e',
    langName: 'Turkish',
    chunkPrefix: 'tr-chunk-',
  },
  bn: {
    dbId: '552940da-0783-46dd-9094-b5a2f2e8276d',
    langName: 'Bangla',
    chunkPrefix: 'bn-chunk-',
  },
};

// ─── Load translations ──────────────────────────────────────────────────────

async function loadTranslations(lang) {
  const config = LANG_CONFIG[lang];
  const merged = {};

  for (let i = 0; i < 4; i++) {
    const chunkPath = path.join(WORK_DIR, `${config.chunkPrefix}${i}.json`);
    try {
      const data = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));
      Object.assign(merged, data);
    } catch (err) {
      console.error(`[push] Missing chunk file: ${chunkPath}`);
      throw err;
    }
  }

  console.log(`[push] Loaded ${Object.keys(merged).length} ${config.langName} translations`);
  return merged;
}

function translate(text, translations) {
  if (!text || !text.trim()) return text;
  const hash = md5(text.trim());
  return translations[hash] || text;
}

// ─── Notion helpers ─────────────────────────────────────────────────────────

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
    if (question) return true;
  }
  if (block.type === 'paragraph') {
    const richText = block.paragraph?.rich_text;
    if (richText && richText.length > 0) {
      const first = richText[0];
      if (first.annotations?.bold) {
        const text = (first.plain_text || '').trim();
        if (text.endsWith('?')) return true;
      }
    }
  }
  return false;
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

// ─── Block translation + conversion ────────────────────────────────────────

function segmentToCreateFormat(segment) {
  const result = {
    text: {
      content: segment.plain_text || segment.text?.content || '',
    },
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

function translateBlock(block, translations) {
  const createBlock = blockToCreateFormat(block);
  const type = block.type;
  const typeData = createBlock[type];

  if (typeData?.rich_text) {
    typeData.rich_text = typeData.rich_text.map(seg => {
      const original = (seg.text?.content || '').trim();
      if (original) {
        const translated = translate(original, translations);
        if (translated !== original && seg.text) {
          const leading = (seg.text.content.match(/^(\s*)/) || ['', ''])[1];
          const trailing = (seg.text.content.match(/(\s*)$/) || ['', ''])[1];
          return { ...seg, text: { ...seg.text, content: leading + translated + trailing } };
        }
      }
      return seg;
    });
  }

  if (block.children) {
    createBlock.children = block.children.map(child => translateBlock(child, translations));
  }

  return createBlock;
}

function blockToCreateFormat(block) {
  const result = {};
  const type = block.type;

  switch (type) {
    case 'paragraph':
      result.paragraph = {
        rich_text: (block.paragraph?.rich_text || []).map(segmentToCreateFormat),
      };
      break;
    case 'heading_2':
      result.heading_2 = {
        rich_text: (block.heading_2?.rich_text || []).map(segmentToCreateFormat),
      };
      break;
    case 'heading_3':
      result.heading_3 = {
        rich_text: (block.heading_3?.rich_text || []).map(segmentToCreateFormat),
      };
      break;
    case 'bulleted_list_item':
      result.bulleted_list_item = {
        rich_text: (block.bulleted_list_item?.rich_text || []).map(segmentToCreateFormat),
      };
      if (block.children) {
        result.bulleted_list_item.children = block.children.map(c => blockToCreateFormat(c));
      }
      break;
    case 'numbered_list_item':
      result.numbered_list_item = {
        rich_text: (block.numbered_list_item?.rich_text || []).map(segmentToCreateFormat),
      };
      if (block.children) {
        result.numbered_list_item.children = block.children.map(c => blockToCreateFormat(c));
      }
      break;
    case 'divider':
      result.divider = {};
      break;
    case 'quote':
      result.quote = {
        rich_text: (block.quote?.rich_text || []).map(segmentToCreateFormat),
      };
      break;
    case 'callout':
      result.callout = {
        rich_text: (block.callout?.rich_text || []).map(segmentToCreateFormat),
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
    if (block.children) {
      result[type].children = block.children.map(child =>
        flattenChildrenForWrite([child])[0]
      );
    }
    return result;
  });
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const langIdx = args.indexOf('--lang');
  const lang = langIdx >= 0 ? args[langIdx + 1] : null;
  const dryRun = args.includes('--dry-run');
  const permitFilter = args.indexOf('--permit') >= 0 ? args[args.indexOf('--permit') + 1] : null;

  if (!lang || !LANG_CONFIG[lang]) {
    console.error('Usage: node scripts/push-translations.js --lang <tr|bn> [--dry-run] [--permit <slug>]');
    process.exit(1);
  }

  const config = LANG_CONFIG[lang];
  const langLabel = lang.toUpperCase();

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  // Load translations
  const translations = await loadTranslations(lang);

  // Load IT structure
  const itData = JSON.parse(await fs.readFile(path.join(WORK_DIR, 'it-segments.json'), 'utf-8'));
  console.log(`[push] ${itData.permits.length} IT permits with content`);

  // Get target DB data source ID
  const db = await notion.databases.retrieve({ database_id: config.dbId });
  const targetDataSourceId = db.data_sources?.[0]?.id;
  if (!targetDataSourceId) {
    console.error(`[push] Could not find data source for ${langLabel} database ${config.dbId}`);
    process.exit(1);
  }
  console.log(`[push] ${langLabel} database: ${config.dbId} (data source: ${targetDataSourceId})`);

  // Fetch all IT permits from Notion (for blocks)
  console.log('[push] Fetching IT permits from Notion...');
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

  const itPermitMap = new Map();
  for (const page of allPages) {
    const tipo = page.properties['Nome permesso']?.title?.[0]?.plain_text;
    if (!tipo || tipo.startsWith('[DUPLICATE]')) continue;
    const slug = slugify(tipo);
    if (slug && slug.startsWith('duplicate-')) continue;
    itPermitMap.set(page.id, { page, tipo, slug });
  }

  console.log(`[push] Found ${itPermitMap.size} IT permits`);

  // Find existing target pages
  console.log('[push] Checking existing target pages...');
  const existingTargetPages = new Map(); // itPageId -> targetPageId
  let searchCursor = undefined;
  let searchMore = true;
  while (searchMore) {
    await delay(NOTION_DELAY);
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: searchCursor,
      page_size: 100,
    });
    for (const page of response.results) {
      const parentDs = page.parent?.data_source_id || page.parent?.database_id;
      if (parentDs !== targetDataSourceId && parentDs !== config.dbId) continue;
      if (page.archived) continue;
      const itId = (page.properties?.['IT Page ID']?.rich_text || []).map(s => s.plain_text).join('');
      if (itId) existingTargetPages.set(itId, page.id);
    }
    searchMore = response.has_more;
    searchCursor = response.next_cursor;
  }
  console.log(`[push] Found ${existingTargetPages.size} existing ${langLabel} pages`);

  // Process permits
  let created = 0, updated = 0, skipped = 0, errors = 0;

  const permitsToProcess = itData.permits.filter(p =>
    !permitFilter || p.slug === permitFilter || p.slug?.includes(permitFilter)
  );

  for (let i = 0; i < permitsToProcess.length; i++) {
    const permit = permitsToProcess[i];
    const progress = `[${i + 1}/${permitsToProcess.length}]`;
    console.log(`${progress} ${permit.tipo} (${permit.slug})`);

    if (dryRun) {
      const existing = existingTargetPages.has(permit.id);
      console.log(`  → ${existing ? 'Would UPDATE' : 'Would CREATE'}`);
      continue;
    }

    try {
      // Get IT blocks (cached)
      const itInfo = itPermitMap.get(permit.id);
      if (!itInfo) {
        console.log(`  → IT permit not found, skipping`);
        skipped++;
        continue;
      }

      const pagesIndex = await cache.loadPagesIndex();
      const cachedEntry = pagesIndex[permit.id];
      let blocks = cachedEntry ? await cache.getBlocks(permit.id) : null;
      if (!blocks) {
        await delay(NOTION_DELAY);
        blocks = await fetchPageBlocks(notion, permit.id);
        await cache.setBlocks(permit.id, blocks);
        pagesIndex[permit.id] = {
          last_edited_time: itInfo.page.last_edited_time,
          fetchedAt: new Date().toISOString(),
        };
        await cache.savePagesIndex(pagesIndex);
      }

      if (!blocks || blocks.length === 0) {
        console.log(`  → No blocks, skipping`);
        skipped++;
        continue;
      }

      // Translate all blocks
      const translatedBlocks = blocks.map(block => translateBlock(block, translations));
      const flatBlocks = flattenChildrenForWrite(translatedBlocks);

      // Build translated properties
      const props = itInfo.page.properties;
      const title = props['Nome permesso']?.title?.[0]?.plain_text || '';
      const primoDocNames = (props['Doc primo rilascio']?.multi_select || []).map(d => d.name);
      const rinnovoDocNames = (props['Doc rinnovo']?.multi_select || []).map(d => d.name);
      const primoMethod = props['Mod primo rilascio']?.multi_select?.[0]?.name || '';
      const rinnovoMethod = props['Mod rinnovo']?.multi_select?.[0]?.name || '';
      const notes = (props['Info extra su doc rilascio']?.rich_text || []).map(s => s.plain_text).join('');

      function sanitize(text) {
        return translate(text, translations).replace(/,/g, ';');
      }

      const translatedProps = {
        'Name': { title: [{ text: { content: translate(title, translations) } }] },
        'Doc primo rilascio': { multi_select: primoDocNames.map(n => ({ name: sanitize(n) })) },
        'Doc rinnovo': { multi_select: rinnovoDocNames.map(n => ({ name: sanitize(n) })) },
        'Mod primo rilascio': { multi_select: primoMethod ? [{ name: sanitize(primoMethod) }] : [] },
        'Mod rinnovo': { multi_select: rinnovoMethod ? [{ name: sanitize(rinnovoMethod) }] : [] },
        'IT Page ID': { rich_text: [{ text: { content: permit.id } }] },
      };

      if (notes) {
        translatedProps['Info extra su doc rilascio'] = {
          rich_text: [{ text: { content: translate(notes, translations) } }],
        };
      }

      // Check for existing page
      const existingPageId = existingTargetPages.get(permit.id);

      if (existingPageId) {
        // Update existing page
        await delay(NOTION_DELAY);
        await notion.pages.update({ page_id: existingPageId, properties: translatedProps });

        // Delete existing blocks
        await delay(NOTION_DELAY);
        const existing = await notion.blocks.children.list({ block_id: existingPageId, page_size: 100 });
        for (const block of existing.results) {
          await delay(200);
          await notion.blocks.delete({ block_id: block.id });
        }

        // Write translated blocks
        for (let b = 0; b < flatBlocks.length; b += MAX_BLOCKS_PER_APPEND) {
          const batch = flatBlocks.slice(b, b + MAX_BLOCKS_PER_APPEND);
          await delay(NOTION_DELAY);
          await notion.blocks.children.append({ block_id: existingPageId, children: batch });
        }

        console.log(`  OK: Updated ${existingPageId}`);
        updated++;
      } else {
        // Create new page
        await delay(NOTION_DELAY);
        const newPage = await notion.pages.create({
          parent: { type: 'data_source_id', data_source_id: targetDataSourceId },
          properties: translatedProps,
        });

        // Write translated blocks
        for (let b = 0; b < flatBlocks.length; b += MAX_BLOCKS_PER_APPEND) {
          const batch = flatBlocks.slice(b, b + MAX_BLOCKS_PER_APPEND);
          await delay(NOTION_DELAY);
          await notion.blocks.children.append({ block_id: newPage.id, children: batch });
        }

        console.log(`  OK: Created ${newPage.id}`);
        created++;
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n─── Push Report (${langLabel}) ───────────────────────`);
  console.log(`  Total permits:  ${permitsToProcess.length}`);
  console.log(`  Created:        ${created}`);
  console.log(`  Updated:        ${updated}`);
  console.log(`  Skipped:        ${skipped}`);
  console.log(`  Errors:         ${errors}`);
  console.log('───────────────────────────────────────────────\n');
}

main().catch(err => {
  console.error('[push] Fatal error:', err.message);
  process.exit(1);
});
