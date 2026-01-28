/**
 * Build script for generating permit pages from Notion
 * Fetches permit content (Q&A sections) and generates permesso-*.html pages
 */
const fs = require('fs/promises');
const path = require('path');
const { fetchPermitData, fetchPageBlocks, testConnection } = require('./notion-client.js');
const { generatePermessoPage } = require('./templates/permesso.js');
const { escapeHtml } = require('./templates/helpers.js');

const OUTPUT_DIR = path.join(__dirname, '../src/pages');
const TODO_PATH = path.join(__dirname, '../.planning/TODO-permits.md');

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
  return richText.map(segment => segment.plain_text || '').join('');
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
    let text = escapeHtml(segment.plain_text || '');
    const annotations = segment.annotations || {};

    // Apply formatting in order
    if (annotations.code) text = `<code>${text}</code>`;
    if (annotations.bold) text = `<strong>${text}</strong>`;
    if (annotations.italic) text = `<em>${text}</em>`;
    if (annotations.underline) text = `<u>${text}</u>`;
    if (annotations.strikethrough) text = `<s>${text}</s>`;

    // Handle links
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

      const html = blockToHtml(block);
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
        const contentHtml = groupAndRenderBlocks(currentContent);
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
 * Extract subtitle from first content paragraph or use default
 * @param {Array} sections - Q&A sections
 * @param {string} tipo - Permit type
 * @returns {string} Subtitle
 */
function getSubtitle(sections, tipo) {
  if (sections.length > 0) {
    // Try to get first paragraph text from first section
    const firstContent = sections[0].content || '';
    // Extract text from first paragraph (remove tags, get plain text)
    const match = firstContent.match(/<p>([^<]+)</);
    if (match && match[1].length < 100) {
      return match[1].trim();
    }
  }
  return `Informazioni sul permesso di soggiorno per ${tipo || 'questo motivo'}`;
}

/**
 * Main build function
 */
async function build() {
  console.log('📄 SOS Permesso - Permit Page Builder');
  console.log('=====================================\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Skipping build - Notion not configured');
    console.log('   Set NOTION_API_KEY in environment variables');
    console.log('   See .env.example for setup instructions\n');
    process.exit(0);
  }

  // Fetch permit data
  console.log('\n📥 Fetching permit data from Notion...');
  const permits = await fetchPermitData();
  console.log(`   Found ${permits.length} permit types\n`);

  if (permits.length === 0) {
    console.log('⚠️  No permit data found in Notion database');
    process.exit(0);
  }

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let generatedCount = 0;
  const generated = [];
  const emptyPermits = [];
  const errors = [];

  console.log('📝 Generating permit pages...\n');

  for (const permit of permits) {
    if (!permit.slug || !permit.tipo) {
      emptyPermits.push({
        tipo: permit.tipo || 'Unknown',
        id: permit.id,
        reason: 'No slug or tipo defined'
      });
      continue;
    }

    try {
      // Fetch page blocks with rate limiting
      await delay(350); // Stay under 3 req/s
      console.log(`   Fetching content for: ${permit.tipo}...`);

      const blocks = await fetchPageBlocks(permit.id);

      if (!blocks || blocks.length === 0) {
        emptyPermits.push({
          tipo: permit.tipo,
          id: permit.id,
          reason: 'No blocks (empty page)'
        });
        console.log(`   ⚠️  ${permit.tipo}: No content blocks`);
        continue;
      }

      // Parse Q&A sections
      const sections = parseQASections(blocks);

      if (sections.length === 0) {
        emptyPermits.push({
          tipo: permit.tipo,
          id: permit.id,
          reason: 'No Q&A sections found'
        });
        console.log(`   ⚠️  ${permit.tipo}: No Q&A sections detected`);
        continue;
      }

      // Build permit object for template
      const permitData = {
        tipo: permit.tipo,
        slug: permit.slug,
        emoji: getEmojiForPermit(permit.tipo),
        subtitle: getSubtitle(sections, permit.tipo),
        sections: sections
      };

      // Generate HTML
      const html = generatePermessoPage(permitData);

      // Write file
      const filename = `permesso-${permit.slug}.html`;
      await fs.writeFile(path.join(OUTPUT_DIR, filename), html, 'utf-8');

      console.log(`   ✓ ${filename} (${sections.length} sections)`);
      generated.push(filename);
      generatedCount++;

    } catch (err) {
      console.error(`   ✗ Error processing ${permit.tipo}: ${err.message}`);
      errors.push({ tipo: permit.tipo, error: err.message });
    }
  }

  // Generate TODO-permits.md
  await writeTodoFile(emptyPermits, errors);

  // Summary
  console.log('\n=====================================');
  console.log(`✅ Generated ${generatedCount} permit pages`);

  if (emptyPermits.length > 0) {
    console.log(`\n⚠️  ${emptyPermits.length} permits need content:`);
    emptyPermits.forEach(p => console.log(`   - ${p.tipo}: ${p.reason}`));
  }

  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} errors:`);
    errors.forEach(e => console.log(`   - ${e.tipo}: ${e.error}`));
  }

  console.log('\n📁 Output: ' + OUTPUT_DIR);
  console.log('📋 TODO: ' + TODO_PATH);
  console.log('');

  return { generated, emptyPermits, errors };
}

/**
 * Write TODO-permits.md with empty permit tracking
 */
async function writeTodoFile(emptyPermits, errors) {
  const date = new Date().toISOString().split('T')[0];

  let content = `# Permits Needing Notion Content

**Generated:** ${date}
**Source:** build-permits.js run

## Empty Permits

These permits have no Q&A content in Notion and need to be filled in:

| Permit | Notion Page ID | Reason |
|--------|----------------|--------|
`;

  if (emptyPermits.length === 0) {
    content += '| (none) | - | All permits have content |\n';
  } else {
    for (const p of emptyPermits) {
      content += `| ${p.tipo} | ${p.id} | ${p.reason} |\n`;
    }
  }

  if (errors.length > 0) {
    content += `
## Errors

These permits failed to process:

| Permit | Error |
|--------|-------|
`;
    for (const e of errors) {
      content += `| ${e.tipo} | ${e.error} |\n`;
    }
  }

  content += `
## Notes

- Edit permits in Notion database: https://www.notion.so/
- Re-run \`node scripts/build-permits.js\` after adding content
- Standard Q&A sections: Cos'e, Durata, Requisiti, Documenti, Lavoro, Conversione, Costi, Aspetti pratici
`;

  await fs.writeFile(TODO_PATH, content, 'utf-8');
}

// Run build
build().catch(err => {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
});
