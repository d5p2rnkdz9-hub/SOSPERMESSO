/**
 * 11ty data file for permit pages
 * Fetches permit data from Notion, parses Q&A content into HTML
 * Returns array of permit objects with pre-parsed sections
 */

// CRITICAL: Load dotenv before Client instantiation (see MEMORY.md)
require('dotenv').config();

// Import Notion API client
const { Client } = require("@notionhq/client");

// Import helper functions used by parsing functions
const { escapeHtml, linkToDizionario } = require('../scripts/templates/helpers.js');

// Notion database ID for permits
const DATABASE_ID = "1ad7355e-7f7f-8088-a065-e814c92e2cfd";

/**
 * Generate URL-friendly slug from permit name
 * @param {string} name - Permit name in Italian
 * @returns {string} Slugified name
 */
function slugify(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from ends
}

/**
 * Fetch all permit data from Notion database
 * @param {Client} notion - Notion client instance
 * @returns {Promise<Array>} Array of permit objects with document lists
 */
async function fetchPermitData(notion) {
  // Use search API and filter by parent database ID
  // (workaround for dataSources.query permission issues)
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
    });

    // Filter pages that belong to our database
    const dbPages = response.results.filter(page =>
      page.parent?.database_id === DATABASE_ID ||
      page.parent?.data_source_id === DATABASE_ID
    );
    allPages.push(...dbPages);

    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allPages.map(page => {
    // Get permit name from title property "Nome permesso"
    const tipo = page.properties["Nome permesso"]?.title?.[0]?.plain_text || null;

    // Get document notes from "Info extra su doc rilascio" field
    const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];
    const docNotes = docNotesRichText.map(segment => segment.plain_text || '').join('');

    return {
      id: page.id,
      tipo,
      slug: slugify(tipo),
      primoDocuments: page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [],
      rinnovoDocuments: page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [],
      // Mod fields are multi_select, get first value
      primoMethod: page.properties["Mod primo rilascio"]?.multi_select?.[0]?.name || null,
      rinnovoMethod: page.properties["Mod rinnovo"]?.multi_select?.[0]?.name || null,
      // Document notes (extra info about documents)
      docNotes: docNotes || null,
      // Include last_edited_time for change detection
      last_edited_time: page.last_edited_time || null,
    };
  });
}

/**
 * Fetch all blocks (content) from a Notion page
 * Handles pagination and nested children
 * @param {Client} notion - Notion client instance
 * @param {string} pageId - Notion page ID
 * @returns {Promise<Array>} Array of block objects
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

  // Recursively fetch children for blocks that have them
  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchPageBlocks(notion, block.id);
    }
  }

  return blocks;
}

/**
 * Delay helper for rate limiting
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract plain text from Notion rich_text array
 * @param {Array} richText - Notion rich_text array
 * @returns {string} Plain text
 */
function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  // Strip checkmark characters that appear as bullets in Notion content
  // Trim the final result, not each segment (to preserve internal spacing)
  return richText.map(segment => (segment.plain_text || '').replace(/[✓✔☑]/g, '')).join('').trim();
}

/**
 * Convert Notion rich_text array to HTML
 * Handles bold, italic, underline, strikethrough, code, and links
 * @param {Array} richTextArray - Notion rich_text array
 * @returns {string} HTML string
 */
function richTextToHtml(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';

  return richTextArray.map(segment => {
    const annotations = segment.annotations || {};
    let plainText = segment.plain_text || '';

    // Strip checkmark characters that appear as bullets in Notion content
    // NOTE: Do NOT trim - whitespace is significant for spacing between formatted text
    plainText = plainText.replace(/[✓✔☑]/g, '');
    // Fix common typo: "mi da" should be "mi dà" (with accent)
    plainText = plainText.replace(/\bmi da\b/gi, 'mi dà');

    let text;
    // For segments with Notion links or code formatting, use simple escape
    // For plain text, apply dictionary linking (linkToDizionario handles escaping)
    if (segment.href || annotations.code) {
      text = escapeHtml(plainText);
    } else {
      text = linkToDizionario(plainText);
    }

    // Apply formatting in order
    if (annotations.code) text = `<code>${text}</code>`;
    if (annotations.bold) text = `<strong>${text}</strong>`;
    if (annotations.italic) text = `<em>${text}</em>`;
    if (annotations.underline) text = `<u>${text}</u>`;
    if (annotations.strikethrough) text = `<s>${text}</s>`;

    // Handle Notion links
    if (segment.href) {
      text = `<a href="${escapeHtml(segment.href)}">${text}</a>`;
    }

    return text;
  }).join('');
}

/**
 * Detect if a block is a question block
 * Handles 3 Q&A styles from Notion:
 * 1. heading_3 blocks (question is the heading text)
 * 2. Paragraph with first segment bold and ending in ?
 * 3. Inline bold at paragraph start ending in ?
 * @param {Object} block - Notion block
 * @returns {Object|null} { question: string } or null
 */
function isQuestionBlock(block) {
  // Style 1: heading_3 is a question
  if (block.type === 'heading_3') {
    const question = extractPlainText(block.heading_3?.rich_text);
    if (question) {
      return { question: question.trim() };
    }
  }

  // Style 2 & 3: paragraph with bold text at start ending in ?
  if (block.type === 'paragraph') {
    const richText = block.paragraph?.rich_text;
    if (richText && richText.length > 0) {
      const firstSegment = richText[0];
      // Check if first segment is bold and ends with ?
      if (firstSegment.annotations?.bold) {
        const text = (firstSegment.plain_text || '').trim();
        if (text.endsWith('?')) {
          return { question: text };
        }
      }
    }
  }

  return null;
}

/**
 * Convert a single Notion block to HTML
 * @param {Object} block - Notion block
 * @param {boolean} skipQuestion - Whether to skip the question portion of bold paragraph
 * @returns {string} HTML string
 */
function blockToHtml(block, skipQuestion = false) {
  switch (block.type) {
    case 'paragraph': {
      let richText = block.paragraph?.rich_text || [];

      // If this paragraph starts with a bold question, skip the question portion
      if (skipQuestion && richText.length > 0 && richText[0].annotations?.bold) {
        const firstText = (richText[0].plain_text || '').trim();
        if (firstText.endsWith('?')) {
          // Skip the first segment (the question)
          richText = richText.slice(1);
          // Trim leading whitespace from next segment if exists
          if (richText.length > 0 && richText[0].plain_text) {
            richText[0] = {
              ...richText[0],
              plain_text: richText[0].plain_text.trimStart()
            };
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
      // Non-question h3 (rare, but handle it)
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
      // Unknown block type, log and skip
      console.warn(`   Unknown block type: ${block.type}`);
      return '';
  }
}

/**
 * Group consecutive list items and render blocks
 * @param {Array} blocks - Array of Notion blocks
 * @returns {string} HTML string
 */
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
        // Flush previous list if different type
        if (currentList.length > 0) {
          const tag = currentListType;
          result.push(`<${tag}>${currentList.join('')}</${tag}>`);
          currentList = [];
        }
        currentListType = listType;
      }

      currentList.push(blockToHtml(block));
    } else {
      // Non-list block: flush any pending list
      if (currentList.length > 0) {
        const tag = currentListType;
        result.push(`<${tag}>${currentList.join('')}</${tag}>`);
        currentList = [];
        currentListType = null;
      }

      // Check if block should skip the question portion (to avoid duplication)
      const skipQuestion = block._renderSkipQuestion === true;
      const html = blockToHtml(block, skipQuestion);
      if (html) result.push(html);
    }
  }

  // Flush remaining list items
  if (currentList.length > 0) {
    const tag = currentListType;
    result.push(`<${tag}>${currentList.join('')}</${tag}>`);
  }

  return result.join('\n');
}

/**
 * Parse Notion blocks into Q&A sections
 * @param {Array} blocks - Array of Notion blocks
 * @returns {Array} Array of { question: string, content: string }
 */
function parseQASections(blocks) {
  const sections = [];
  let currentQuestion = null;
  let currentContent = [];
  let isFirstBlockAfterQuestion = false;

  for (const block of blocks) {
    const questionInfo = isQuestionBlock(block);

    if (questionInfo) {
      // Save previous section if exists
      if (currentQuestion) {
        // Map _skipQuestion to _renderSkipQuestion for blockToHtml
        const contentHtml = groupAndRenderBlocks(
          currentContent.map(b => b._skipQuestion ? { ...b, _renderSkipQuestion: true } : b)
        );
        sections.push({
          question: currentQuestion,
          content: contentHtml
        });
      }

      // Start new section
      currentQuestion = questionInfo.question;
      currentContent = [];
      isFirstBlockAfterQuestion = true;

      // If it's a bold paragraph question, the answer might be in the same block
      if (block.type === 'paragraph') {
        const richText = block.paragraph?.rich_text || [];
        if (richText.length > 1 || (richText.length === 1 && !richText[0].annotations?.bold)) {
          // There's content after the question in this block
          currentContent.push({ ...block, _skipQuestion: true });
        }
      }
    } else {
      // Content block
      if (currentQuestion) {
        currentContent.push(block);
      }
      isFirstBlockAfterQuestion = false;
    }
  }

  // Save last section
  if (currentQuestion) {
    const contentHtml = groupAndRenderBlocks(
      currentContent.map(b => {
        if (b._skipQuestion) {
          return { ...b, _renderSkipQuestion: true };
        }
        return b;
      })
    );
    sections.push({
      question: currentQuestion,
      content: contentHtml
    });
  }

  return sections;
}

/**
 * Detect permits that are variants of a base permit type
 * Groups by base name when "a seguito di" pattern is found
 * @param {Array} permits - Array of permit objects
 * @returns {Object} { variantGroups: Array, standalone: Array }
 */
function detectVariants(permits) {
  const groups = {};
  const standalone = [];

  for (const permit of permits) {
    if (!permit.tipo) continue;

    // Match "X a seguito di Y" pattern
    const match = permit.tipo.match(/^(.+?)\s+a\s+seguito\s+di\s+(.+)$/i);

    if (match) {
      const baseName = match[1].trim();
      const variantName = match[2].trim();

      if (!groups[baseName]) {
        groups[baseName] = [];
      }
      groups[baseName].push({
        ...permit,
        baseName,
        variantName,
        variantSlug: slugify(variantName)
      });
    } else {
      standalone.push(permit);
    }
  }

  // Only return groups with 2+ variants
  const variantGroups = Object.entries(groups)
    .filter(([_, permits]) => permits.length >= 2)
    .map(([baseName, permits]) => ({
      baseName,
      baseSlug: slugify(baseName),
      variants: permits
    }));

  // Add single-variant items back to standalone
  Object.entries(groups)
    .filter(([_, permits]) => permits.length === 1)
    .forEach(([_, permits]) => standalone.push(permits[0]));

  return { variantGroups, standalone };
}

/**
 * Get emoji based on permit type keywords
 * @param {string} tipo - Permit type name
 * @returns {string} Emoji
 */
function getEmojiForPermit(tipo) {
  if (!tipo) return '📄';
  const t = tipo.toLowerCase();

  if (t.includes('studio')) return '📖';
  if (t.includes('lavoro subordinato') || t.includes('lavoro autonomo')) return '💼';
  if (t.includes('attesa occupazione') || t.includes('attesa lavoro')) return '🔍';
  if (t.includes('protezione') || t.includes('asilo') || t.includes('rifugiato')) return '🛡️';
  if (t.includes('famiglia') || t.includes('familiare') || t.includes('ricongiungimento')) return '👨‍👩‍👧‍👦';
  if (t.includes('medic') || t.includes('salute') || t.includes('gravidanza') || t.includes('cure')) return '🏥';
  if (t.includes('soggiornanti') || t.includes('lungo')) return '🏠';
  if (t.includes('minore')) return '👶';
  if (t.includes('calamit')) return '🌊';

  return '📄';
}

/**
 * Fetch and transform permit data from Notion
 * Exports async function that 11ty will call during build
 */
module.exports = async function() {
  // Graceful degradation: return empty array if no API key
  if (!process.env.NOTION_API_KEY) {
    console.warn('[permits.js] NOTION_API_KEY not set - returning empty permit array');
    return [];
  }

  try {
    console.log('[permits.js] Fetching permit data from Notion...');

    // Create Notion client instance
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Fetch all permit pages
    const permits = await fetchPermitData(notion);
    console.log(`[permits.js] Found ${permits.length} permit types`);

    if (permits.length === 0) {
      console.warn('[permits.js] No permit data found in Notion database');
      return [];
    }

    // Process each permit with content
    const processedPermits = [];
    let count = 0;

    for (const permit of permits) {
      if (!permit.tipo) {
        console.warn(`[permits.js] Skipping permit ${permit.id} - no tipo defined`);
        continue;
      }

      count++;

      // Log progress every 10 permits
      if (count % 10 === 0) {
        console.log(`[permits.js] Processed ${count}/${permits.length} permits...`);
      }

      try {
        // Rate limiting: 350ms delay between requests (stays under 3 req/s)
        await delay(350);

        // Fetch page blocks
        const blocks = await fetchPageBlocks(notion, permit.id);

        // Parse Q&A sections
        const sections = blocks && blocks.length > 0 ? parseQASections(blocks) : [];

        // Add index to each section
        const sectionsWithIndex = sections.map((section, index) => ({
          ...section,
          index
        }));

        // Build permit object
        processedPermits.push({
          id: permit.id,
          slug: permit.slug,
          tipo: permit.tipo,
          emoji: getEmojiForPermit(permit.tipo),
          sections: sectionsWithIndex,
          isPlaceholder: sectionsWithIndex.length === 0
        });

      } catch (err) {
        console.error(`[permits.js] Error processing ${permit.tipo}: ${err.message}`);
        // Still add as placeholder
        processedPermits.push({
          id: permit.id,
          slug: permit.slug,
          tipo: permit.tipo,
          emoji: getEmojiForPermit(permit.tipo),
          sections: [],
          isPlaceholder: true
        });
      }
    }

    console.log(`[permits.js] Processed ${processedPermits.length} permits with content`);

    // Detect variants
    const { variantGroups, standalone } = detectVariants(processedPermits);
    console.log(`[permits.js] Detected ${variantGroups.length} variant groups, ${standalone.length} standalone permits`);

    // Build final array: standalone + variant parents + variant children
    const result = [];

    // Add standalone permits
    result.push(...standalone);

    // Add variant groups
    for (const group of variantGroups) {
      // Add parent (synthetic object)
      result.push({
        slug: group.baseSlug,
        tipo: group.baseName,
        emoji: getEmojiForPermit(group.baseName),
        isVariantParent: true,
        baseName: group.baseName,
        variants: group.variants.map(v => ({
          slug: v.slug,
          tipo: v.tipo,
          emoji: v.emoji,
          variantName: v.variantName
        }))
      });

      // Add variant children with parentSlug
      for (const variant of group.variants) {
        result.push({
          ...variant,
          isVariantChild: true,
          parentSlug: group.baseSlug  // Critical for breadcrumbs
        });
      }
    }

    // Deduplicate by slug (keep first occurrence)
    // This handles edge cases where a permit might be duplicated in standalone array
    const seen = new Set();
    const deduplicated = result.filter(permit => {
      if (seen.has(permit.slug)) {
        console.warn(`[permits.js] Removing duplicate entry for slug: ${permit.slug}`);
        return false;
      }
      seen.add(permit.slug);
      return true;
    });

    console.log(`[permits.js] Returning ${deduplicated.length} total permit objects (standalone + parents + children)`);
    return deduplicated;

  } catch (error) {
    console.error(`[permits.js] Notion fetch failed: ${error.message}`);
    console.warn('[permits.js] Returning empty array (graceful degradation)');
    return [];
  }
};
