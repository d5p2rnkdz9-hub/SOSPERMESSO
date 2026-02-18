#!/usr/bin/env node
/**
 * Translate IT Notion permit content to EN via Claude API
 * Creates/maintains an EN Notion database with translated content
 *
 * Phase 48: Translation Script
 *
 * Usage:
 *   node scripts/translate-notion.js              # Full run
 *   node scripts/translate-notion.js --dry-run    # List permits, no API calls
 *   node scripts/translate-notion.js --permit studio  # Single permit
 *   node scripts/translate-notion.js --force      # Re-translate everything
 *   node scripts/translate-notion.js --verify     # Verify EN pages after write
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const Anthropic = require('@anthropic-ai/sdk');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const cache = require('./notion-cache');
const tm = require('./translation-memory');
const glossary = require('./translation-glossary.json');

// ─── Constants ───────────────────────────────────────────────────────────────

const IT_DATABASE_ID = '3097355e-7f7f-819c-af33-d0fd0739cc5b';
const TRANSLATION_INDEX_PATH = path.join(cache.CACHE_DIR, 'translation-index.json');
const NOTION_DELAY = 350;
const CLAUDE_DELAY = 500;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_BLOCKS_PER_APPEND = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function md5(text) { return crypto.createHash('md5').update(text).digest('hex'); }

function slugify(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    dryRun: false,
    force: false,
    verify: false,
    permit: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run': opts.dryRun = true; break;
      case '--force': opts.force = true; break;
      case '--verify': opts.verify = true; break;
      case '--help': case '-h': opts.help = true; break;
      case '--permit':
        opts.permit = args[++i];
        break;
    }
  }

  return opts;
}

function showHelp() {
  console.log(`
Translate IT Notion permits to EN via Claude API

Usage: node scripts/translate-notion.js [options]

Options:
  --dry-run          List permits, no API calls
  --permit <slug>    Translate a single permit
  --force            Re-translate everything (ignore hashes)
  --verify           Verify EN pages after writing
  --help, -h         Show this help
`);
}

// ─── Translation Index (Plan 48-02) ─────────────────────────────────────────

/**
 * Load translation index mapping IT pages to EN pages + section hashes
 * Schema: { pages: { itPageId: { enPageId, lastEditedTime, propertyHash, sectionHashes: { question: hash } } } }
 */
async function loadTranslationIndex() {
  try {
    const data = await fs.readFile(TRANSLATION_INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { pages: {} };
  }
}

async function saveTranslationIndex(index) {
  await fs.mkdir(path.dirname(TRANSLATION_INDEX_PATH), { recursive: true });
  await fs.writeFile(TRANSLATION_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
}

// ─── Notion Helpers ──────────────────────────────────────────────────────────

/**
 * Fetch all permit pages from the IT database
 */
async function fetchPermitPages(notion) {
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

  return allPages
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
}

/**
 * Fetch all blocks for a Notion page (with nested children)
 */
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
      block.children = await fetchPageBlocks(notion, block.id);
    }
  }

  return blocks;
}

/**
 * Get blocks for a page — from cache first, then Notion API
 */
async function getPageBlocks(notion, pageId, lastEditedTime) {
  const pagesIndex = await cache.loadPagesIndex();
  const cachedEntry = pagesIndex[pageId];
  const pageChanged = !cachedEntry || cachedEntry.last_edited_time !== lastEditedTime;

  let blocks;
  if (!pageChanged) {
    blocks = await cache.getBlocks(pageId);
  }

  if (blocks) return blocks;

  // Fetch from Notion
  await delay(NOTION_DELAY);
  blocks = await fetchPageBlocks(notion, pageId);
  await cache.setBlocks(pageId, blocks);
  pagesIndex[pageId] = {
    last_edited_time: lastEditedTime,
    fetchedAt: new Date().toISOString(),
  };
  await cache.savePagesIndex(pagesIndex);
  return blocks;
}

// ─── Section Extraction & Hashing (Plan 48-02) ──────────────────────────────

/**
 * Extract plain text from Notion rich_text array
 */
function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(s => (s.plain_text || '').replace(/[✓✔☑]/g, '')).join('').trim();
}

/**
 * Detect if a block is a question block (same logic as permits.js)
 */
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

/**
 * Extract Q&A sections from raw blocks — returns raw block arrays per section
 * Unlike permits.js parseQASections which returns HTML, this returns raw blocks
 */
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
      currentBlocks = [block]; // Include question block
    } else if (currentQuestion) {
      currentBlocks.push(block);
    }
    // Blocks before first question are ignored (shouldn't exist in our data)
  }

  if (currentQuestion) {
    sections.push({ question: currentQuestion, blocks: currentBlocks });
  }

  return sections;
}

/**
 * Hash a section: MD5 of question + all block plain text
 */
function hashSection(question, blocks) {
  const texts = [question];
  for (const block of blocks) {
    const rt = getRichTextArray(block);
    if (rt) texts.push(extractPlainText(rt));
    if (block.children) {
      for (const child of block.children) {
        const crt = getRichTextArray(child);
        if (crt) texts.push(extractPlainText(crt));
      }
    }
  }
  return md5(texts.join('|'));
}

/**
 * Hash page properties for change detection
 */
function hashProperties(page) {
  const props = page.properties;
  const parts = [
    props['Nome permesso']?.title?.[0]?.plain_text || '',
    (props['Doc primo rilascio']?.multi_select || []).map(d => d.name).sort().join(','),
    (props['Doc rinnovo']?.multi_select || []).map(d => d.name).sort().join(','),
    (props['Mod primo rilascio']?.multi_select || []).map(d => d.name).sort().join(','),
    (props['Mod rinnovo']?.multi_select || []).map(d => d.name).sort().join(','),
    (props['Info extra su doc rilascio']?.rich_text || []).map(s => s.plain_text).join(''),
  ];
  return md5(parts.join('||'));
}

/**
 * Detect changes between current content and stored index
 */
function detectChanges(itPageId, sections, propHash, index, force) {
  if (force) {
    return { isNew: true, propertiesChanged: true, changedSections: sections.map((_, i) => i) };
  }

  const stored = index.pages[itPageId];
  if (!stored) {
    return { isNew: true, propertiesChanged: true, changedSections: sections.map((_, i) => i) };
  }

  const propertiesChanged = stored.propertyHash !== propHash;

  const changedSections = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionHash = hashSection(section.question, section.blocks);
    const storedHash = stored.sectionHashes?.[section.question];
    if (storedHash !== sectionHash) {
      changedSections.push(i);
    }
  }

  return { isNew: false, propertiesChanged, changedSections };
}

// ─── Rich Text Helpers ───────────────────────────────────────────────────────

/**
 * Get the rich_text array from a block regardless of type
 */
function getRichTextArray(block) {
  const typeData = block[block.type];
  if (!typeData) return null;
  return typeData.rich_text || null;
}

/**
 * Collect all translatable text segments from a section's blocks
 * Returns array of { text, blockIdx, segIdx, isChild, childIdx, childSegIdx }
 */
function collectTranslatableSegments(blocks) {
  const segments = [];

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    const rt = getRichTextArray(block);
    if (rt) {
      for (let si = 0; si < rt.length; si++) {
        const text = (rt[si].plain_text || '').trim();
        if (text && text.length > 0) {
          segments.push({ text, blockIdx: bi, segIdx: si, isChild: false });
        }
      }
    }

    // Handle nested children (e.g., nested bullets)
    if (block.children) {
      for (let ci = 0; ci < block.children.length; ci++) {
        const child = block.children[ci];
        const crt = getRichTextArray(child);
        if (crt) {
          for (let csi = 0; csi < crt.length; csi++) {
            const text = (crt[csi].plain_text || '').trim();
            if (text && text.length > 0) {
              segments.push({
                text,
                blockIdx: bi,
                segIdx: csi,
                isChild: true,
                childIdx: ci,
              });
            }
          }
        }
      }
    }
  }

  return segments;
}

// ─── EN Database Management (Plan 48-01) ─────────────────────────────────────

/**
 * Ensure the EN database exists. Create if missing.
 * Returns { enDbId, enDataSourceId }
 */
async function ensureEnDatabase(notion) {
  // Check if already stored in env
  if (process.env.NOTION_DATABASE_EN_ID) {
    try {
      const db = await notion.databases.retrieve({ database_id: process.env.NOTION_DATABASE_EN_ID });
      const dsId = db.data_sources?.[0]?.id;
      if (dsId) return { enDbId: process.env.NOTION_DATABASE_EN_ID, enDataSourceId: dsId };
    } catch {
      console.warn('[translate] Stored EN database ID is invalid, will create new');
    }
  }

  if (!process.env.NOTION_EN_PARENT_PAGE_ID) {
    throw new Error(
      'NOTION_EN_PARENT_PAGE_ID not set in .env. ' +
      'Create a page in Notion to host the EN database, then add its ID to .env'
    );
  }

  console.log('[translate] Creating EN database...');

  // Step 1: Create database (SDK v5 — properties go on data source)
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: process.env.NOTION_EN_PARENT_PAGE_ID },
    title: [{ text: { content: 'EN - Permits Database' } }],
    properties: {
      'Name': { title: {} },
    },
  });

  const enDbId = db.id;
  const enDataSourceId = db.data_sources?.[0]?.id;
  console.log(`[translate] Created EN database: ${enDbId} (data source: ${enDataSourceId})`);

  // Step 2: Add custom properties to the data source
  if (enDataSourceId) {
    await notion.dataSources.update({
      data_source_id: enDataSourceId,
      properties: {
        'Doc primo rilascio': { multi_select: {} },
        'Doc rinnovo': { multi_select: {} },
        'Mod primo rilascio': { multi_select: {} },
        'Mod rinnovo': { multi_select: {} },
        'Info extra su doc rilascio': { rich_text: {} },
        'IT Page ID': { rich_text: {} },
      },
    });
    console.log('[translate] Added properties to EN data source');
  }

  // Step 3: Save to .env
  const envPath = path.join(process.cwd(), '.env');
  await fs.appendFile(envPath, `\nNOTION_DATABASE_EN_ID=${enDbId}\n`);
  console.log('[translate] Saved NOTION_DATABASE_EN_ID to .env');

  return { enDbId, enDataSourceId };
}

// ─── Claude Translation (Plan 48-01) ─────────────────────────────────────────

/**
 * Build the system prompt for Claude with glossary terms
 */
function buildTranslationPrompt() {
  const termLines = Object.entries(glossary.terms)
    .map(([it, en]) => `  "${it}" → "${en}"`)
    .join('\n');

  const dntLines = glossary.doNotTranslate
    .map(t => `  - ${t}`)
    .join('\n');

  return `You are a professional translator specializing in Italian immigration law and bureaucracy. Translate Italian text to English.

RULES:
1. Use the glossary consistently for all occurrences.
2. Preserve ALL numbers, costs (€ amounts), URLs, and email addresses exactly.
3. Keep the same tone: simple, clear, helpful — like explaining to someone unfamiliar with Italian bureaucracy.
4. Do NOT add explanations or notes — just translate.
5. Preserve any markdown-like formatting markers.
6. Keep Italian legal references (D.Lgs., D.P.R., art., comma) in Italian.

GLOSSARY (always use these translations):
${termLines}

DO NOT TRANSLATE these terms:
${dntLines}

FORMAT:
- You will receive numbered lines.
- Return ONLY the translated lines with the same numbers.
- One translation per line. Keep the "N: " prefix format.`;
}

/**
 * Call Claude API to translate text with retries
 */
async function translateText(client, systemPrompt, text, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: text }],
      });

      const result = response.content[0].text;

      // Validate response length (0.3x–3x source)
      if (result.length < text.length * 0.2 || result.length > text.length * 4) {
        console.warn(`[translate] Response length suspicious (${result.length} vs ${text.length} source)`);
        if (attempt < retries) {
          await delay(CLAUDE_DELAY * attempt);
          continue;
        }
      }

      return result;
    } catch (err) {
      console.error(`[translate] Claude API error (attempt ${attempt}/${retries}): ${err.message}`);
      if (attempt < retries) {
        await delay(CLAUDE_DELAY * Math.pow(2, attempt));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Batch translate multiple text segments via one Claude call
 * Returns Map<originalText, translatedText>
 */
async function batchTranslateSegments(client, systemPrompt, texts) {
  if (texts.length === 0) return new Map();

  // Protect cost amounts by replacing with placeholders before translation
  const costPattern = /(\d+[\.,]?\d*)\s*€/g;
  const placeholderMap = []; // array of { index, originals, placeholders }

  const protectedTexts = texts.map((t, i) => {
    const costs = [];
    let idx = 0;
    const replaced = t.replace(costPattern, (match) => {
      const placeholder = `__COST${idx}__`;
      costs.push({ placeholder, original: match });
      idx++;
      return placeholder;
    });
    if (costs.length > 0) placeholderMap[i] = costs;
    return replaced;
  });

  // Format as numbered lines
  const numbered = protectedTexts.map((t, i) => `${i + 1}: ${t}`).join('\n');
  const prompt = `Translate these ${texts.length} lines from Italian to English:\n\n${numbered}`;

  await delay(CLAUDE_DELAY);
  const response = await translateText(client, systemPrompt, prompt);

  // Parse numbered response and restore cost placeholders
  const translations = new Map();
  const lines = response.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const match = line.match(/^(\d+):\s*(.+)$/);
    if (match) {
      const idx = parseInt(match[1]) - 1;
      if (idx >= 0 && idx < texts.length) {
        let translated = match[2].trim();
        // Restore cost placeholders
        if (placeholderMap[idx]) {
          for (const { placeholder, original } of placeholderMap[idx]) {
            translated = translated.replace(placeholder, original);
          }
        }
        translations.set(texts[idx], translated);
      }
    }
  }

  // Warn about missing translations
  for (const text of texts) {
    if (!translations.has(text)) {
      console.warn(`[translate] Missing translation for: "${text.substring(0, 60)}..."`);
    }
  }

  return translations;
}

/**
 * Translate all segments in a section's blocks using translation memory
 * Returns translated blocks in Notion create format
 */
async function translateSectionBlocks(client, systemPrompt, blocks, memory) {
  const segments = collectTranslatableSegments(blocks);

  // Check translation memory for each segment
  const uncached = [];
  const cached = new Map();

  for (const seg of segments) {
    const existing = tm.getTranslation(seg.text, memory);
    if (existing) {
      cached.set(seg.text, existing);
    } else {
      uncached.push(seg.text);
    }
  }

  // Batch translate uncached segments
  let newTranslations = new Map();
  if (uncached.length > 0) {
    // Deduplicate
    const unique = [...new Set(uncached)];
    newTranslations = await batchTranslateSegments(client, systemPrompt, unique);

    // Store in translation memory
    for (const [source, target] of newTranslations) {
      tm.storeTranslation(source, target, memory);
    }
  }

  // Merge cached + new
  const allTranslations = new Map([...cached, ...newTranslations]);

  // Rebuild blocks with translated text
  return blocks.map(block => translateBlock(block, allTranslations));
}

/**
 * Translate a single block's rich_text segments, returning Notion create format
 */
function translateBlock(block, translations) {
  const createBlock = blockToCreateFormat(block);

  // Translate rich_text in the block
  const typeData = createBlock[block.type];
  if (typeData?.rich_text) {
    typeData.rich_text = typeData.rich_text.map(seg => {
      const original = (seg.text?.content || '').trim();
      const translated = translations.get(original);
      if (translated && seg.text) {
        return { ...seg, text: { ...seg.text, content: replacePreservingWhitespace(seg.text.content, translated) } };
      }
      return seg;
    });
  }

  // Translate children recursively
  if (block.children && createBlock.children) {
    createBlock.children = block.children.map(child => translateBlock(child, translations));
  } else if (block.children) {
    createBlock.children = block.children.map(child => translateBlock(child, translations));
  }

  return createBlock;
}

/**
 * Replace text content preserving leading/trailing whitespace from original
 */
function replacePreservingWhitespace(original, translated) {
  const leadingMatch = original.match(/^(\s*)/);
  const trailingMatch = original.match(/(\s*)$/);
  const leading = leadingMatch ? leadingMatch[1] : '';
  const trailing = trailingMatch ? trailingMatch[1] : '';
  return leading + translated + trailing;
}

/**
 * Convert a Notion response block to Notion create format
 */
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
      // Unknown type — pass through as paragraph with empty text
      result.paragraph = { rich_text: [] };
      break;
  }

  return result;
}

/**
 * Convert a rich_text segment from response format to create format
 */
function segmentToCreateFormat(segment) {
  const result = {
    text: {
      content: segment.plain_text || segment.text?.content || '',
    },
  };

  // Preserve link
  if (segment.href || segment.text?.link) {
    result.text.link = { url: segment.href || segment.text.link.url };
  }

  // Preserve non-default annotations
  const ann = segment.annotations;
  if (ann) {
    const annotations = {};
    if (ann.bold) annotations.bold = true;
    if (ann.italic) annotations.italic = true;
    if (ann.underline) annotations.underline = true;
    if (ann.strikethrough) annotations.strikethrough = true;
    if (ann.code) annotations.code = true;
    if (ann.color && ann.color !== 'default') annotations.color = ann.color;
    if (Object.keys(annotations).length > 0) {
      result.annotations = annotations;
    }
  }

  return result;
}

// ─── Property Translation (Plan 48-01 & 48-03) ──────────────────────────────

/**
 * Translate all permit properties (title, doc names, methods, notes)
 * Returns properties object ready for Notion page create/update
 */
async function translateAllProperties(client, systemPrompt, itPage, memory) {
  const props = itPage.properties;
  const textsToTranslate = [];

  // Collect title
  const title = props['Nome permesso']?.title?.[0]?.plain_text || '';
  if (title) textsToTranslate.push(title);

  // Collect doc names (multi_select values)
  const primoDocNames = (props['Doc primo rilascio']?.multi_select || []).map(d => d.name);
  const rinnovoDocNames = (props['Doc rinnovo']?.multi_select || []).map(d => d.name);
  const allDocNames = [...new Set([...primoDocNames, ...rinnovoDocNames])];

  // Collect methods
  const primoMethod = props['Mod primo rilascio']?.multi_select?.[0]?.name;
  const rinnovoMethod = props['Mod rinnovo']?.multi_select?.[0]?.name;

  // Collect notes
  const notes = (props['Info extra su doc rilascio']?.rich_text || [])
    .map(s => s.plain_text).join('');

  // Add unique doc names
  for (const name of allDocNames) textsToTranslate.push(name);
  if (primoMethod) textsToTranslate.push(primoMethod);
  if (rinnovoMethod && rinnovoMethod !== primoMethod) textsToTranslate.push(rinnovoMethod);
  if (notes) textsToTranslate.push(notes);

  // Check memory, translate uncached
  const uncached = [];
  const cached = new Map();

  for (const text of textsToTranslate) {
    const existing = tm.getTranslation(text, memory);
    if (existing) {
      cached.set(text, existing);
    } else {
      uncached.push(text);
    }
  }

  let newTranslations = new Map();
  if (uncached.length > 0) {
    newTranslations = await batchTranslateSegments(client, systemPrompt, uncached);
    for (const [source, target] of newTranslations) {
      tm.storeTranslation(source, target, memory);
    }
  }

  const t = new Map([...cached, ...newTranslations]);

  // Helper to get translation with cost preservation check
  function tr(text) {
    if (!text) return text;
    const translated = t.get(text) || text;
    // Validate € amounts preserved
    const sourceAmounts = (text.match(/\d+[\.,]?\d*\s*€/g) || []).sort();
    const targetAmounts = (translated.match(/\d+[\.,]?\d*\s*€/g) || []).sort();
    if (sourceAmounts.join() !== targetAmounts.join()) {
      console.warn(`[translate] Cost mismatch in "${text.substring(0, 40)}": ${sourceAmounts} vs ${targetAmounts}`);
    }
    return translated;
  }

  // Notion multi_select values cannot contain commas — replace with semicolons
  function sanitizeMultiSelect(text) {
    return (tr(text) || text).replace(/,/g, ';');
  }

  // Build translated properties (EN DB uses "Name" as title, not "Nome permesso")
  const result = {
    'Name': {
      title: [{ text: { content: tr(title) || title } }],
    },
    'Doc primo rilascio': {
      multi_select: primoDocNames.map(name => ({ name: sanitizeMultiSelect(name) })),
    },
    'Doc rinnovo': {
      multi_select: rinnovoDocNames.map(name => ({ name: sanitizeMultiSelect(name) })),
    },
    'Mod primo rilascio': {
      multi_select: primoMethod ? [{ name: sanitizeMultiSelect(primoMethod) }] : [],
    },
    'Mod rinnovo': {
      multi_select: rinnovoMethod ? [{ name: sanitizeMultiSelect(rinnovoMethod) }] : [],
    },
    'IT Page ID': {
      rich_text: [{ text: { content: itPage.id } }],
    },
  };

  if (notes) {
    result['Info extra su doc rilascio'] = {
      rich_text: [{ text: { content: tr(notes) || notes } }],
    };
  }

  return result;
}

// ─── EN Page Write (Plan 48-01) ──────────────────────────────────────────────

/**
 * Find existing EN page for an IT page (uses search API — SDK v5 compat)
 */
async function findEnPage(notion, enDataSourceId, itPageId) {
  await delay(NOTION_DELAY);
  const response = await notion.search({
    filter: { property: 'object', value: 'page' },
    page_size: 100,
  });

  // Filter to pages in our EN data source with matching IT Page ID
  const match = response.results.find(page => {
    const parentDs = page.parent?.data_source_id || page.parent?.database_id;
    if (parentDs !== enDataSourceId) return false;
    const storedId = (page.properties?.['IT Page ID']?.rich_text || [])
      .map(s => s.plain_text).join('');
    return storedId === itPageId;
  });

  return match || null;
}

/**
 * Write (create or update) an EN page
 */
async function writeEnPage(notion, enDataSourceId, itPage, translatedProps, translatedBlocks, index) {
  const itPageId = itPage.id;

  // Check if EN page already exists
  let enPageId = index.pages[itPageId]?.enPageId;
  let enPage = null;

  if (enPageId) {
    try {
      enPage = await notion.pages.retrieve({ page_id: enPageId });
      if (enPage.archived) enPage = null;
    } catch {
      enPage = null;
    }
  }

  if (!enPage) {
    // Try to find by IT Page ID property
    enPage = await findEnPage(notion, enDataSourceId, itPageId);
    if (enPage) enPageId = enPage.id;
  }

  if (enPage) {
    // Update existing page properties
    await delay(NOTION_DELAY);
    await notion.pages.update({
      page_id: enPage.id,
      properties: translatedProps,
    });

    // Delete existing blocks
    await delay(NOTION_DELAY);
    const existing = await notion.blocks.children.list({ block_id: enPage.id, page_size: 100 });
    for (const block of existing.results) {
      await delay(200);
      await notion.blocks.delete({ block_id: block.id });
    }

    enPageId = enPage.id;
  } else {
    // Create new page (SDK v5: use data_source_id)
    await delay(NOTION_DELAY);
    const created = await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: enDataSourceId },
      properties: translatedProps,
    });
    enPageId = created.id;
  }

  // Write translated blocks in batches
  const flatBlocks = flattenChildrenForWrite(translatedBlocks);

  for (let i = 0; i < flatBlocks.length; i += MAX_BLOCKS_PER_APPEND) {
    const batch = flatBlocks.slice(i, i + MAX_BLOCKS_PER_APPEND);
    await delay(NOTION_DELAY);
    await notion.blocks.children.append({
      block_id: enPageId,
      children: batch,
    });
  }

  return enPageId;
}

/**
 * Flatten blocks that have children into Notion's expected format
 * Notion API expects children as a nested property on the block, not as separate blocks
 */
function flattenChildrenForWrite(blocks) {
  return blocks.map(block => {
    // For list items with children, Notion expects children as a nested property
    const type = Object.keys(block).find(k =>
      ['paragraph', 'heading_2', 'heading_3', 'bulleted_list_item',
       'numbered_list_item', 'quote', 'callout', 'divider'].includes(k)
    );

    if (!type) return block;

    const result = { [type]: { ...block[type] } };

    // If the block has children (from recursive translateBlock), nest them properly
    if (block.children) {
      result[type].children = block.children.map(child => {
        // Recursively handle nested children
        return flattenChildrenForWrite([child])[0];
      });
    }

    return result;
  });
}

// ─── Deleted Permit Handling (Plan 48-03) ─────────────────────────────────────

/**
 * Archive EN pages whose IT source has been removed
 */
async function handleDeletedPermits(notion, enDbId, currentItIds, index) {
  let archived = 0;
  const storedIds = Object.keys(index.pages);

  for (const itPageId of storedIds) {
    if (!currentItIds.has(itPageId)) {
      const enPageId = index.pages[itPageId]?.enPageId;
      if (enPageId) {
        try {
          await delay(NOTION_DELAY);
          await notion.pages.update({ page_id: enPageId, archived: true });
          console.log(`[translate] Archived EN page for deleted IT permit ${itPageId}`);
          archived++;
        } catch (err) {
          console.warn(`[translate] Failed to archive EN page ${enPageId}: ${err.message}`);
        }
      }
      delete index.pages[itPageId];
    }
  }

  return archived;
}

// ─── Verification (Plan 48-03) ───────────────────────────────────────────────

/**
 * Verify an EN page has expected content
 */
async function verifyEnPage(notion, enPageId, expectedBlockCount) {
  const errors = [];

  try {
    await delay(NOTION_DELAY);
    const page = await notion.pages.retrieve({ page_id: enPageId });

    // Check title
    const title = page.properties['Nome permesso']?.title?.[0]?.plain_text;
    if (!title) errors.push('Missing title');

    // Check blocks
    await delay(NOTION_DELAY);
    const blocks = await notion.blocks.children.list({ block_id: enPageId, page_size: 100 });
    const actualCount = blocks.results.length;

    if (actualCount === 0) {
      errors.push('No blocks found');
    } else if (expectedBlockCount > 0 && Math.abs(actualCount - expectedBlockCount) > 5) {
      errors.push(`Block count mismatch: expected ~${expectedBlockCount}, got ${actualCount}`);
    }
  } catch (err) {
    errors.push(`Failed to read page: ${err.message}`);
  }

  return errors;
}

// ─── Report (Plan 48-03) ─────────────────────────────────────────────────────

function generateReport(stats) {
  console.log('\n─── Translation Report ───────────────────────');
  console.log(`  Total IT permits:      ${stats.total}`);
  console.log(`  Translated:            ${stats.translated}`);
  console.log(`  Skipped (unchanged):   ${stats.skipped}`);
  console.log(`  Skipped (placeholder): ${stats.placeholder}`);
  console.log(`  Errors:                ${stats.errors}`);
  console.log(`  Archived (deleted):    ${stats.archived}`);
  console.log(`  Claude API calls:      ${stats.apiCalls}`);
  console.log(`  Translation memory:    ${stats.memoryHits} hits, ${stats.memoryMisses} misses`);
  if (stats.verifyErrors > 0) {
    console.log(`  Verification errors:   ${stats.verifyErrors}`);
  }
  console.log('───────────────────────────────────────────────\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    showHelp();
    return;
  }

  // Validate env vars
  if (!process.env.NOTION_API_KEY) {
    console.error('Error: NOTION_API_KEY not set in .env');
    process.exit(1);
  }

  if (!opts.dryRun && !process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set in .env');
    console.error('Add your Anthropic API key to .env: ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  // Create clients
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const anthropic = opts.dryRun ? null : new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Fetch IT permits
  console.log('[translate] Fetching IT permits from Notion...');
  const itPermits = await fetchPermitPages(notion);
  console.log(`[translate] Found ${itPermits.length} IT permits`);

  // Filter by --permit flag if set
  let permits = itPermits;
  if (opts.permit) {
    permits = itPermits.filter(p => p.slug === opts.permit || p.slug?.includes(opts.permit));
    if (permits.length === 0) {
      console.error(`Error: No permit matching "${opts.permit}"`);
      console.log('Available permits:');
      itPermits.forEach(p => console.log(`  ${p.slug}`));
      process.exit(1);
    }
    console.log(`[translate] Filtered to ${permits.length} permit(s): ${permits.map(p => p.slug).join(', ')}`);
  }

  // Dry run: just list permits and exit
  if (opts.dryRun) {
    console.log('\n─── Dry Run: IT Permits ───────────────────────');
    for (const p of permits) {
      console.log(`  ${p.slug} — ${p.tipo} (${p.id})`);
    }
    console.log(`\n  Total: ${permits.length} permits`);
    console.log('  No API calls made (--dry-run)\n');
    return;
  }

  // Ensure EN database exists
  const { enDbId, enDataSourceId } = await ensureEnDatabase(notion);
  console.log(`[translate] EN database: ${enDbId} (data source: ${enDataSourceId})`);

  // Load translation state
  const index = await loadTranslationIndex();
  const memory = await tm.loadTranslationMemory('it', 'en');
  const systemPrompt = buildTranslationPrompt();

  // Track stats
  const stats = {
    total: permits.length,
    translated: 0,
    skipped: 0,
    placeholder: 0,
    errors: 0,
    archived: 0,
    apiCalls: 0,
    memoryHits: 0,
    memoryMisses: 0,
    verifyErrors: 0,
  };

  // Process each permit
  for (let i = 0; i < permits.length; i++) {
    const permit = permits[i];
    const progress = `[${i + 1}/${permits.length}]`;

    try {
      console.log(`\n${progress} ${permit.tipo} (${permit.slug})`);

      // Get blocks
      const blocks = await getPageBlocks(notion, permit.id, permit.last_edited_time);

      if (!blocks || blocks.length === 0) {
        console.log(`  → Placeholder (no content), skipping`);
        stats.placeholder++;
        continue;
      }

      // Extract sections and compute hashes
      const sections = extractSectionsFromBlocks(blocks);
      if (sections.length === 0) {
        console.log(`  → No Q&A sections found, skipping`);
        stats.placeholder++;
        continue;
      }

      const propHash = hashProperties(permit);

      // Detect changes
      const changes = detectChanges(permit.id, sections, propHash, index, opts.force);

      if (!changes.isNew && !changes.propertiesChanged && changes.changedSections.length === 0) {
        console.log(`  → No changes, skipping`);
        stats.skipped++;
        continue;
      }

      const changeDesc = changes.isNew ? 'new' :
        `${changes.propertiesChanged ? 'props' : ''}${changes.changedSections.length > 0 ? ` ${changes.changedSections.length} sections` : ''}`.trim();
      console.log(`  → Changes: ${changeDesc}`);

      // Count memory state before translation
      const memoryBefore = Object.keys(memory).length;

      // Translate properties (if changed or new)
      let translatedProps;
      if (changes.isNew || changes.propertiesChanged) {
        translatedProps = await translateAllProperties(anthropic, systemPrompt, permit, memory);
        stats.apiCalls++;
      } else {
        // Re-use existing properties (fetch from EN page)
        const enPageId = index.pages[permit.id]?.enPageId;
        if (enPageId) {
          const enPage = await notion.pages.retrieve({ page_id: enPageId });
          translatedProps = enPage.properties;
        }
      }

      // Translate blocks — translate all sections (changed ones via API, unchanged reuse memory)
      const allTranslatedBlocks = [];
      for (let si = 0; si < sections.length; si++) {
        const section = sections[si];

        if (changes.isNew || changes.changedSections.includes(si)) {
          // Translate this section
          const translated = await translateSectionBlocks(anthropic, systemPrompt, section.blocks, memory);
          allTranslatedBlocks.push(...translated);
          stats.apiCalls++;
        } else {
          // Re-translate using memory (all segments should be cached)
          const translated = await translateSectionBlocks(anthropic, systemPrompt, section.blocks, memory);
          allTranslatedBlocks.push(...translated);
          // This shouldn't make API calls if memory has everything
        }
      }

      // Count memory hits/misses
      const memoryAfter = Object.keys(memory).length;
      const newEntries = memoryAfter - memoryBefore;
      stats.memoryMisses += newEntries;
      stats.memoryHits += (collectTranslatableSegments(blocks).length - newEntries);

      // Write to EN database
      const enPageId = await writeEnPage(notion, enDataSourceId, permit, translatedProps, allTranslatedBlocks, index);

      // Update index
      const sectionHashes = {};
      for (const section of sections) {
        sectionHashes[section.question] = hashSection(section.question, section.blocks);
      }
      index.pages[permit.id] = {
        enPageId,
        lastEditedTime: permit.last_edited_time,
        propertyHash: propHash,
        sectionHashes,
      };

      // Verify if requested
      if (opts.verify) {
        const errors = await verifyEnPage(notion, enPageId, allTranslatedBlocks.length);
        if (errors.length > 0) {
          console.log(`  ⚠ Verification issues: ${errors.join('; ')}`);
          stats.verifyErrors += errors.length;
        } else {
          console.log(`  ✓ Verified`);
        }
      }

      console.log(`  ✓ Written to EN page ${enPageId}`);
      stats.translated++;

    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      stats.errors++;
    }
  }

  // Handle deleted permits (only on full runs)
  if (!opts.permit) {
    const currentItIds = new Set(itPermits.map(p => p.id));
    stats.archived = await handleDeletedPermits(notion, enDbId, currentItIds, index);
  }

  // Save state
  await saveTranslationIndex(index);
  await tm.saveTranslationMemory('it', 'en', memory);

  // Report
  generateReport(stats);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
