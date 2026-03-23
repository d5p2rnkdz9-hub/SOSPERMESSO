/**
 * 11ty data file for TR permit pages
 * Fetches permit data from TR Notion database, parses Q&A content into HTML
 * Slugs are resolved via IT Page ID → IT slug mapping (TR slugs = IT slugs)
 */

// CRITICAL: Load dotenv before Client instantiation (see MEMORY.md)
require('dotenv').config();

const { Client } = require("@notionhq/client");
const cache = require('../scripts/notion-cache');
const { escapeHtml } = require('../scripts/templates/helpers.js');

// TR Notion database ID (hardcoded like IT — no env var needed)
const TR_DATABASE_ID = '49d77cd7-b4c7-4c8a-a731-40b6315bc29e';

/**
 * Extract cost from document list multi_select values
 */
function extractCost(documents, keyword) {
  if (!documents || !documents.length) return null;
  const item = documents.find(d => d.toLowerCase().includes(keyword));
  if (!item) return null;
  const match = item.match(/(\d+[\.,]?\d*)\s*€/) || item.match(/da\s+(\d+[\.,]?\d*)/);
  if (!match) return null;
  return parseFloat(match[1].replace(',', '.'));
}

/**
 * Extract alternative cost when item contains "X o Y" pattern
 */
function extractCostAlt(documents, keyword) {
  if (!documents || !documents.length) return null;
  const item = documents.find(d => d.toLowerCase().includes(keyword));
  if (!item) return null;
  const match = item.match(/(\d+[\.,]?\d*)\s+o\s+(\d+[\.,]?\d*)/);
  if (!match) return null;
  return parseFloat(match[2].replace(',', '.'));
}

// IT database ID for slug resolution
const IT_DATABASE_ID = '3097355e-7f7f-819c-af33-d0fd0739cc5b';

/**
 * Generate URL-friendly slug from permit name (IT name)
 */
function slugify(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetch all pages from a Notion database using search API
 */
async function fetchDatabasePages(notion, databaseId) {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
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

/**
 * Build IT page ID → slug map by fetching IT database
 */
async function buildItSlugMap(notion) {
  const itPages = await fetchDatabasePages(notion, IT_DATABASE_ID);
  const slugMap = {};

  for (const page of itPages) {
    const tipo = page.properties["Nome permesso"]?.title?.[0]?.plain_text || null;
    if (tipo) {
      slugMap[page.id] = slugify(tipo);
    }
  }

  return slugMap;
}

/**
 * Fetch all blocks (content) from a Notion page with nested children
 */
async function fetchPageBlocks(notion, pageId) {
  const blocks = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(segment => (segment.plain_text || '').replace(/[✓✔☑]/g, '')).join('').trim();
}

/**
 * Convert Notion rich_text array to HTML
 * TR version: no linkToDizionario, just escapeHtml for all text
 */
function richTextToHtml(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';

  return richTextArray.map(segment => {
    const annotations = segment.annotations || {};
    let plainText = segment.plain_text || '';

    plainText = plainText.replace(/[✓✔☑]/g, '');

    let text = escapeHtml(plainText);

    if (annotations.code) text = `<code>${text}</code>`;
    if (annotations.bold) text = `<strong>${text}</strong>`;
    if (annotations.italic) text = `<em>${text}</em>`;
    if (annotations.underline) text = `<u>${text}</u>`;
    if (annotations.strikethrough) text = `<s>${text}</s>`;

    if (segment.href) {
      text = `<a href="${escapeHtml(segment.href)}">${text}</a>`;
    }

    return text;
  }).join('');
}

function isQuestionBlock(block) {
  if (block.type === 'heading_3') {
    const question = extractPlainText(block.heading_3?.rich_text);
    if (question) return { question: question.trim() };
  }

  if (block.type === 'paragraph') {
    const richText = block.paragraph?.rich_text;
    if (richText && richText.length > 0) {
      const firstSegment = richText[0];
      if (firstSegment.annotations?.bold) {
        const text = (firstSegment.plain_text || '').trim();
        if (text.endsWith('?')) return { question: text };
      }
    }
  }

  return null;
}

function blockToHtml(block, skipQuestion = false) {
  switch (block.type) {
    case 'paragraph': {
      let richText = block.paragraph?.rich_text || [];

      if (skipQuestion && richText.length > 0 && richText[0].annotations?.bold) {
        const firstText = (richText[0].plain_text || '').trim();
        if (firstText.endsWith('?')) {
          richText = richText.slice(1);
          if (richText.length > 0 && richText[0].plain_text) {
            richText[0] = { ...richText[0], plain_text: richText[0].plain_text.trimStart() };
          }
        }
      }

      const html = richTextToHtml(richText);
      return html ? `<p>${html}</p>` : '';
    }

    case 'heading_2': {
      const html = richTextToHtml(block.heading_2?.rich_text);
      return html ? `<h2>${html}</h2>` : '';
    }

    case 'heading_3': {
      const html = richTextToHtml(block.heading_3?.rich_text);
      return html ? `<h3>${html}</h3>` : '';
    }

    case 'bulleted_list_item': {
      const html = richTextToHtml(block.bulleted_list_item?.rich_text);
      let childrenHtml = '';
      if (block.children && block.children.length > 0) {
        childrenHtml = groupAndRenderBlocks(block.children);
      }
      return `<li>${html}${childrenHtml}</li>`;
    }

    case 'numbered_list_item': {
      const html = richTextToHtml(block.numbered_list_item?.rich_text);
      let childrenHtml = '';
      if (block.children && block.children.length > 0) {
        childrenHtml = groupAndRenderBlocks(block.children);
      }
      return `<li>${html}${childrenHtml}</li>`;
    }

    case 'divider':
      return '<hr>';

    case 'quote': {
      const html = richTextToHtml(block.quote?.rich_text);
      return html ? `<blockquote>${html}</blockquote>` : '';
    }

    case 'callout': {
      const html = richTextToHtml(block.callout?.rich_text);
      const icon = block.callout?.icon?.emoji || '';
      return html ? `<div class="alert alert-info"><span class="alert-icon">${icon}</span><div>${html}</div></div>` : '';
    }

    default:
      return '';
  }
}

function groupAndRenderBlocks(blocks) {
  const result = [];
  let currentList = [];
  let currentListType = null;

  for (const block of blocks) {
    const isBullet = block.type === 'bulleted_list_item';
    const isNumbered = block.type === 'numbered_list_item';

    if (isBullet || isNumbered) {
      const listType = isBullet ? 'ul' : 'ol';

      if (currentListType !== listType) {
        if (currentList.length > 0) {
          result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`);
          currentList = [];
        }
        currentListType = listType;
      }

      currentList.push(blockToHtml(block));
    } else {
      if (currentList.length > 0) {
        result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`);
        currentList = [];
        currentListType = null;
      }

      const skipQuestion = block._renderSkipQuestion === true;
      const html = blockToHtml(block, skipQuestion);
      if (html) result.push(html);
    }
  }

  if (currentList.length > 0) {
    result.push(`<${currentListType}>${currentList.join('')}</${currentListType}>`);
  }

  return result.join('\n');
}

function parseQASections(blocks) {
  const sections = [];
  let currentQuestion = null;
  let currentContent = [];

  for (const block of blocks) {
    const questionInfo = isQuestionBlock(block);

    if (questionInfo) {
      if (currentQuestion) {
        const contentHtml = groupAndRenderBlocks(
          currentContent.map(b => b._skipQuestion ? { ...b, _renderSkipQuestion: true } : b)
        );
        sections.push({ question: currentQuestion, content: contentHtml });
      }

      currentQuestion = questionInfo.question;
      currentContent = [];

      if (block.type === 'paragraph') {
        const richText = block.paragraph?.rich_text || [];
        if (richText.length > 1 || (richText.length === 1 && !richText[0].annotations?.bold)) {
          currentContent.push({ ...block, _skipQuestion: true });
        }
      }
    } else {
      if (currentQuestion) {
        currentContent.push(block);
      }
    }
  }

  if (currentQuestion) {
    const contentHtml = groupAndRenderBlocks(
      currentContent.map(b => b._skipQuestion ? { ...b, _renderSkipQuestion: true } : b)
    );
    sections.push({ question: currentQuestion, content: contentHtml });
  }

  return sections;
}

/**
 * Get emoji based on permit type keywords (TR + IT)
 */
function getEmojiForPermit(tipo) {
  if (!tipo) return '📄';
  const t = tipo.toLowerCase();

  // TR keywords
  if (t.includes('eğitim') || t.includes('öğrenim') || t.includes('staj') || t.includes('studio')) return '📚';
  if (t.includes('çalışma') || t.includes('iş') || t.includes('lavoro subordinato') || t.includes('lavoro autonomo')) return '💼';
  if (t.includes('arama') || t.includes('bekleme') || t.includes('attesa occupazione') || t.includes('attesa lavoro')) return '🔍';
  if (t.includes('koruma') || t.includes('sığınma') || t.includes('mülteci') || t.includes('protezione') || t.includes('rifugiato') || t.includes('asilo')) return '🛡️';
  if (t.includes('aile') || t.includes('birleşim') || t.includes('eş') || t.includes('famiglia') || t.includes('familiare') || t.includes('ricongiungimento')) return '👨‍👩‍👧‍👦';
  if (t.includes('sağlık') || t.includes('tedavi') || t.includes('hamilelik') || t.includes('medic') || t.includes('salute') || t.includes('gravidanza') || t.includes('cure')) return '🏥';
  if (t.includes('uzun süreli') || t.includes('soggiornante') || t.includes('lungo')) return '🏠';
  if (t.includes('din')) return '⛪';
  if (t.includes('spor')) return '⚽';
  if (t.includes('sanat')) return '🎭';
  if (t.includes('araştırma') || t.includes('bilim')) return '🔬';
  if (t.includes('menor') || t.includes('minore')) return '👶';
  if (t.includes('calamit')) return '🌊';

  return '📋';
}

/**
 * Fetch and transform TR permit data from Notion
 */
module.exports = async function() {
  if (!process.env.NOTION_FETCH) {
    try {
      const cached = JSON.parse(require('fs').readFileSync(
        require('path').join(__dirname, '..', '_cache', 'permits-tr.json'), 'utf-8'
      ));
      console.log(`[permitsTr.js] Using cached data (${cached.length} permits)`);
      return cached.map(p => ({ ...p, rinnovoDocuments: (p.rinnovoDocuments || []).filter(d => d.toLowerCase() !== 'n/a') }));
    } catch { /* no cache, fall through to Notion fetch */ }
  }

  if (!process.env.NOTION_API_KEY) {
    console.warn('[permitsTr.js] NOTION_API_KEY not set - returning empty array');
    return [];
  }

  if (!TR_DATABASE_ID) {
    console.warn('[permitsTr.js] TR_DATABASE_ID not set - returning empty array');
    return [];
  }

  try {
    console.log('[permitsTr.js] Fetching TR permit data from Notion...');
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Build IT page ID → slug map (for resolving TR slugs)
    console.log('[permitsTr.js] Building IT slug map...');
    const itSlugMap = await buildItSlugMap(notion);
    console.log(`[permitsTr.js] IT slug map has ${Object.keys(itSlugMap).length} entries`);

    // Fetch TR pages
    const trPages = await fetchDatabasePages(notion, TR_DATABASE_ID);
    console.log(`[permitsTr.js] Found ${trPages.length} TR permit pages`);

    if (trPages.length === 0) {
      console.warn('[permitsTr.js] No TR permit data found');
      return [];
    }

    // Load cache index
    const pagesIndex = await cache.loadPagesIndex();
    let cacheHits = 0;
    let cacheMisses = 0;

    const processedPermits = [];
    let count = 0;

    for (const page of trPages) {
      const tipo = page.properties["Name"]?.title?.[0]?.plain_text || null;
      if (!tipo) {
        console.warn(`[permitsTr.js] Skipping page ${page.id} - no Name`);
        continue;
      }

      // Resolve slug via IT Page ID
      const itPageId = (page.properties["IT Page ID"]?.rich_text || [])
        .map(s => s.plain_text).join('');
      const slug = itPageId ? itSlugMap[itPageId] : null;

      if (!slug) {
        console.warn(`[permitsTr.js] Skipping "${tipo}" - no IT slug found (IT Page ID: ${itPageId || 'missing'})`);
        continue;
      }

      count++;
      if (count % 10 === 0) {
        console.log(`[permitsTr.js] Processed ${count}/${trPages.length} permits...`);
      }

      // Extract doc fields from TR page properties
      const primoDocuments = page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [];
      const rinnovoDocuments = (page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || []).filter(d => d.toLowerCase() !== 'n/a');
      const primoMethod = page.properties["Mod primo rilascio"]?.multi_select?.[0]?.name || null;
      const rinnovoMethod = page.properties["Mod rinnovo"]?.multi_select?.[0]?.name || null;
      const docNotesRichText = page.properties["Info extra su doc rilascio/rinnovo"]?.rich_text || [];
      const docNotes = docNotesRichText.map(s => s.plain_text || '').join('') || null;

      try {
        // Check cache
        const cachedEntry = pagesIndex[page.id];
        const pageChanged = !cachedEntry || cachedEntry.last_edited_time !== page.last_edited_time;

        let blocks;
        if (!pageChanged) {
          blocks = await cache.getBlocks(page.id);
        }

        if (blocks) {
          cacheHits++;
        } else {
          cacheMisses++;
          await delay(350);
          blocks = await fetchPageBlocks(notion, page.id);
          await cache.setBlocks(page.id, blocks);
          pagesIndex[page.id] = {
            last_edited_time: page.last_edited_time,
            fetchedAt: new Date().toISOString()
          };
        }

        const sections = blocks && blocks.length > 0 ? parseQASections(blocks) : [];
        const sectionsWithIndex = sections.map((section, index) => ({ ...section, index }));

        processedPermits.push({
          id: page.id,
          slug,
          tipo,
          emoji: getEmojiForPermit(tipo),
          sections: sectionsWithIndex,
          isPlaceholder: sectionsWithIndex.length === 0,
          primoDocuments,
          primoMethod,
          costBollettinoPrimo: extractCost(primoDocuments, 'bollettino'),
          costBollettinoAltPrimo: extractCostAlt(primoDocuments, 'bollettino'),
          costMarcaBolloPrimo: extractCost(primoDocuments, 'marca da bollo'),
          rinnovoDocuments,
          rinnovoMethod,
          costBollettinoRinnovo: extractCost(rinnovoDocuments, 'bollettino'),
          costBollettinoAltRinnovo: extractCostAlt(rinnovoDocuments, 'bollettino'),
          costMarcaBolloRinnovo: extractCost(rinnovoDocuments, 'marca da bollo'),
          docNotes,
        });

      } catch (err) {
        console.error(`[permitsTr.js] Error processing ${tipo}: ${err.message}`);
        processedPermits.push({
          id: page.id,
          slug,
          tipo,
          emoji: getEmojiForPermit(tipo),
          sections: [],
          isPlaceholder: true,
          primoDocuments,
          primoMethod,
          costBollettinoPrimo: null,
          costBollettinoAltPrimo: null,
          costMarcaBolloPrimo: null,
          rinnovoDocuments,
          rinnovoMethod,
          costBollettinoRinnovo: null,
          costBollettinoAltRinnovo: null,
          costMarcaBolloRinnovo: null,
          docNotes,
        });
      }
    }

    await cache.savePagesIndex(pagesIndex);
    console.log(`[permitsTr.js] Cache: ${cacheHits} hits, ${cacheMisses} misses`);
    console.log(`[permitsTr.js] Returning ${processedPermits.length} TR permits`);
    return processedPermits;

  } catch (error) {
    console.error(`[permitsTr.js] Notion fetch failed: ${error.message}`);
    return [];
  }
};
