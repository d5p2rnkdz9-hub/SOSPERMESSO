/**
 * 11ty data file for EN permit pages
 * Fetches permit data from EN Notion database, parses Q&A content into HTML
 * Slugs are resolved via IT Page ID → IT slug mapping (EN slugs = IT slugs)
 */

// CRITICAL: Load dotenv before Client instantiation (see MEMORY.md)
require('dotenv').config();

const { Client } = require("@notionhq/client");
const cache = require('../scripts/notion-cache');
const { escapeHtml } = require('../scripts/templates/helpers.js');

// EN Notion database ID (hardcoded like IT — no env var needed)
const EN_DATABASE_ID = "c1dc0271-f1f4-4147-9464-391884f4dfad";

// IT database ID for slug resolution
const IT_DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";

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
 * EN version: no linkToDizionario, just escapeHtml for all text
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
 * Get emoji based on permit type keywords (EN + IT)
 */
function getEmojiForPermit(tipo) {
  if (!tipo) return '📄';
  const t = tipo.toLowerCase();

  // EN keywords
  if (t.includes('study') || t.includes('studio')) return '📖';
  if (t.includes('employed work') || t.includes('self-employment') || t.includes('lavoro subordinato') || t.includes('lavoro autonomo')) return '💼';
  if (t.includes('job seeking') || t.includes('attesa occupazione') || t.includes('attesa lavoro')) return '🔍';
  if (t.includes('protection') || t.includes('asylum') || t.includes('refugee') || t.includes('protezione') || t.includes('asilo') || t.includes('rifugiato')) return '🛡️';
  if (t.includes('family') || t.includes('famiglia') || t.includes('familiare') || t.includes('ricongiungimento')) return '👨‍👩‍👧‍👦';
  if (t.includes('medical') || t.includes('health') || t.includes('pregnancy') || t.includes('medic') || t.includes('salute') || t.includes('gravidanza') || t.includes('cure')) return '🏥';
  if (t.includes('long-term') || t.includes('soggiornanti') || t.includes('lungo')) return '🏠';
  if (t.includes('minor') || t.includes('minore')) return '👶';
  if (t.includes('disaster') || t.includes('calamit')) return '🌊';

  return '📄';
}

/**
 * Fetch and transform EN permit data from Notion
 */
module.exports = async function() {
  if (!process.env.NOTION_API_KEY) {
    console.warn('[permitsEn.js] NOTION_API_KEY not set - returning empty array');
    return [];
  }

  try {
    console.log('[permitsEn.js] Fetching EN permit data from Notion...');
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Build IT page ID → slug map (for resolving EN slugs)
    console.log('[permitsEn.js] Building IT slug map...');
    const itSlugMap = await buildItSlugMap(notion);
    console.log(`[permitsEn.js] IT slug map has ${Object.keys(itSlugMap).length} entries`);

    // Fetch EN pages
    const enPages = await fetchDatabasePages(notion, EN_DATABASE_ID);
    console.log(`[permitsEn.js] Found ${enPages.length} EN permit pages`);

    if (enPages.length === 0) {
      console.warn('[permitsEn.js] No EN permit data found');
      return [];
    }

    // Load cache index
    const pagesIndex = await cache.loadPagesIndex();
    let cacheHits = 0;
    let cacheMisses = 0;

    const processedPermits = [];
    let count = 0;

    for (const page of enPages) {
      const tipo = page.properties["Name"]?.title?.[0]?.plain_text || null;
      if (!tipo) {
        console.warn(`[permitsEn.js] Skipping page ${page.id} - no Name`);
        continue;
      }

      // Resolve slug via IT Page ID
      const itPageId = (page.properties["IT Page ID"]?.rich_text || [])
        .map(s => s.plain_text).join('');
      const slug = itPageId ? itSlugMap[itPageId] : null;

      if (!slug) {
        console.warn(`[permitsEn.js] Skipping "${tipo}" - no IT slug found (IT Page ID: ${itPageId || 'missing'})`);
        continue;
      }

      count++;
      if (count % 10 === 0) {
        console.log(`[permitsEn.js] Processed ${count}/${enPages.length} permits...`);
      }

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
          isPlaceholder: sectionsWithIndex.length === 0
        });

      } catch (err) {
        console.error(`[permitsEn.js] Error processing ${tipo}: ${err.message}`);
        processedPermits.push({
          id: page.id,
          slug,
          tipo,
          emoji: getEmojiForPermit(tipo),
          sections: [],
          isPlaceholder: true
        });
      }
    }

    await cache.savePagesIndex(pagesIndex);
    console.log(`[permitsEn.js] Cache: ${cacheHits} hits, ${cacheMisses} misses`);
    console.log(`[permitsEn.js] Returning ${processedPermits.length} EN permits`);
    return processedPermits;

  } catch (error) {
    console.error(`[permitsEn.js] Notion fetch failed: ${error.message}`);
    return [];
  }
};
