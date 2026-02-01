/**
 * Build script for generating permit pages from Notion
 * Fetches permit content (Q&A sections) and generates permesso-*.html pages
 */
const fs = require('fs/promises');
const path = require('path');
const { fetchPermitData, fetchPageBlocks, testConnection } = require('./notion-client.js');
const {
  generatePermessoPage,
  generatePlaceholderPage,
  generateVariantParentPage,
  generateVariantChildPage,
  generateVariantPlaceholderPage
} = require('./templates/permesso.js');
const { escapeHtml, linkToDizionario } = require('./templates/helpers.js');

const OUTPUT_DIR = path.join(__dirname, '../src/pages');
const TODO_PATH = path.join(__dirname, '../.planning/TODO-permits.md');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

/**
 * Delay helper for rate limiting
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load build manifest from disk
 * @returns {Promise<Object>} Manifest data or empty object
 */
async function loadManifest() {
  try {
    const data = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save build manifest to disk
 * @param {Object} manifest - Manifest data
 */
async function saveManifest(manifest) {
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Check if permit needs rebuild based on Notion timestamp
 * @param {Object} permit - Permit with last_edited_time
 * @param {Object} manifest - Current manifest
 * @returns {boolean} True if needs rebuild
 */
function needsRebuild(permit, manifest) {
  const entry = manifest[permit.id];
  if (!entry) return true; // Never built

  const lastBuilt = new Date(entry.lastEdited);
  const lastEdited = new Date(permit.last_edited_time || 0);

  return lastEdited > lastBuilt;
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
 * Simple slugify function for variant names
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
 * Main build function
 */
async function build() {
  console.log('📄 SOS Permesso - Permit Page Builder');
  console.log('=====================================\n');

  // Check for --force flag
  const forceRebuild = process.argv.includes('--force');
  if (forceRebuild) {
    console.log('🔄 Force rebuild mode: regenerating all pages\n');
  }

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Skipping build - Notion not configured');
    console.log('   Set NOTION_API_KEY in environment variables');
    console.log('   See .env.example for setup instructions\n');
    process.exit(0);
  }

  // Load manifest
  const manifest = await loadManifest();
  console.log(`📋 Loaded manifest (${Object.keys(manifest).length} entries)\n`);

  // Fetch permit data
  console.log('📥 Fetching permit data from Notion...');
  const permits = await fetchPermitData();
  console.log(`   Found ${permits.length} permit types\n`);

  if (permits.length === 0) {
    console.log('⚠️  No permit data found in Notion database');
    process.exit(0);
  }

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let generatedCount = 0;
  let placeholderCount = 0;
  let skippedCount = 0;
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

    // Check if rebuild needed (skip if unchanged and not forced)
    if (!forceRebuild && !needsRebuild(permit, manifest)) {
      console.log(`   ⏭️  ${permit.tipo}: skipped (unchanged)`);
      skippedCount++;
      continue;
    }

    try {
      // Fetch page blocks with rate limiting
      await delay(350); // Stay under 3 req/s
      console.log(`   Fetching content for: ${permit.tipo}...`);

      const blocks = await fetchPageBlocks(permit.id);

      if (!blocks || blocks.length === 0) {
        // Generate placeholder page instead of skipping
        const permitData = {
          tipo: permit.tipo,
          slug: permit.slug,
          emoji: getEmojiForPermit(permit.tipo)
        };

        const html = generatePlaceholderPage(permitData);
        const filename = `permesso-${permit.slug}.html`;
        await fs.writeFile(path.join(OUTPUT_DIR, filename), html, 'utf-8');

        console.log(`   ⚠️  ${filename} (placeholder - needs content)`);
        placeholderCount++;

        // Update manifest for placeholder
        manifest[permit.id] = {
          tipo: permit.tipo,
          slug: permit.slug,
          lastEdited: permit.last_edited_time || new Date().toISOString(),
          lastBuilt: new Date().toISOString(),
          placeholder: true
        };

        // Still track for TODO but mark as placeholder
        emptyPermits.push({
          tipo: permit.tipo,
          id: permit.id,
          reason: 'No blocks (empty page)',
          hasPlaceholder: true
        });
        continue;
      }

      // Parse Q&A sections
      const sections = parseQASections(blocks);

      if (sections.length === 0) {
        // Generate placeholder page instead of skipping
        const permitData = {
          tipo: permit.tipo,
          slug: permit.slug,
          emoji: getEmojiForPermit(permit.tipo)
        };

        const html = generatePlaceholderPage(permitData);
        const filename = `permesso-${permit.slug}.html`;
        await fs.writeFile(path.join(OUTPUT_DIR, filename), html, 'utf-8');

        console.log(`   ⚠️  ${filename} (placeholder - needs content)`);
        placeholderCount++;

        // Update manifest for placeholder
        manifest[permit.id] = {
          tipo: permit.tipo,
          slug: permit.slug,
          lastEdited: permit.last_edited_time || new Date().toISOString(),
          lastBuilt: new Date().toISOString(),
          placeholder: true
        };

        // Still track for TODO but mark as placeholder
        emptyPermits.push({
          tipo: permit.tipo,
          id: permit.id,
          reason: 'No Q&A sections found',
          hasPlaceholder: true
        });
        continue;
      }

      // Build permit object for template
      const permitData = {
        tipo: permit.tipo,
        slug: permit.slug,
        emoji: getEmojiForPermit(permit.tipo),
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

      // Update manifest
      manifest[permit.id] = {
        tipo: permit.tipo,
        slug: permit.slug,
        lastEdited: permit.last_edited_time || new Date().toISOString(),
        lastBuilt: new Date().toISOString()
      };

    } catch (err) {
      console.error(`   ✗ Error processing ${permit.tipo}: ${err.message}`);
      errors.push({ tipo: permit.tipo, error: err.message });
    }
  }

  // Save manifest
  await saveManifest(manifest);

  // Generate TODO-permits.md
  await writeTodoFile(emptyPermits, errors);

  // Summary
  console.log('\n=====================================');
  console.log(`✅ Generated ${generatedCount} permit pages`);
  if (placeholderCount > 0) {
    console.log(`⚠️  Generated ${placeholderCount} placeholder pages (need content)`);
  }
  if (skippedCount > 0) {
    console.log(`⏭️  Skipped ${skippedCount} unchanged pages`);
  }

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

/**
 * Detect and propose variant structure without generating pages
 */
async function detectAndProposeVariants() {
  console.log('📄 SOS Permesso - Variant Detection');
  console.log('====================================\n');

  const connected = await testConnection();
  if (!connected) {
    console.log('⚠️  Cannot connect to Notion');
    console.log('   Set NOTION_API_KEY in environment variables\n');
    process.exit(1);
  }

  console.log('📥 Fetching permit data from Notion...');
  const permits = await fetchPermitData();
  console.log(`   Found ${permits.length} permit types\n`);

  const { variantGroups, standalone } = detectVariants(permits);

  console.log('===========================================');
  console.log('PROPOSED VARIANT STRUCTURE');
  console.log('===========================================\n');

  if (variantGroups.length === 0) {
    console.log('No variant groups detected.\n');
    console.log('All permits are standalone (no "a seguito di" pattern found).\n');
    return;
  }

  for (const group of variantGroups) {
    console.log(`📁 ${group.baseName} (${group.variants.length} variants)`);
    console.log(`   Folder: src/pages/permesso-${group.baseSlug}/`);
    console.log('   Pages:');
    console.log(`   - index.html (parent page with links)`);
    for (const v of group.variants) {
      console.log(`   - ${v.variantSlug}.html → "${v.tipo}"`);
    }
    console.log('');
  }

  console.log('-------------------------------------------');
  console.log(`Standalone permits: ${standalone.length}`);
  console.log('-------------------------------------------\n');
  console.log('To generate, confirm this structure is correct and run:');
  console.log('  node scripts/build-permits.js --generate-variants\n');
}

/**
 * Generate variant pages with parent/child structure
 */
async function generateVariantPages() {
  console.log('📄 SOS Permesso - Variant Page Generator');
  console.log('=========================================\n');

  const connected = await testConnection();
  if (!connected) {
    console.log('⚠️  Cannot connect to Notion');
    console.log('   Set NOTION_API_KEY in environment variables\n');
    process.exit(1);
  }

  console.log('📥 Fetching permit data from Notion...');
  const permits = await fetchPermitData();
  console.log(`   Found ${permits.length} permit types\n`);

  const { variantGroups } = detectVariants(permits);

  if (variantGroups.length === 0) {
    console.log('⚠️  No variant groups detected. Nothing to generate.\n');
    process.exit(0);
  }

  console.log('📝 Generating variant pages...\n');

  let generatedFolders = 0;
  let generatedParents = 0;
  let generatedChildren = 0;
  let generatedPlaceholders = 0;

  for (const group of variantGroups) {
    console.log(`\n📁 ${group.baseName}`);

    // Create subfolder
    const folderPath = path.join(OUTPUT_DIR, `permesso-${group.baseSlug}`);
    await fs.mkdir(folderPath, { recursive: true });
    generatedFolders++;

    // Generate parent page (with placeholder general content for now)
    const parentHtml = generateVariantParentPage(group, [], getEmojiForPermit(group.baseName));
    await fs.writeFile(path.join(folderPath, 'index.html'), parentHtml, 'utf-8');
    console.log(`   ✓ index.html (parent page)`);
    generatedParents++;

    // Generate variant pages
    for (const variant of group.variants) {
      await delay(350); // Rate limiting

      // Special handling for sanatoria - always placeholder
      if (variant.variantSlug === 'sanatoria') {
        const placeholderHtml = generateVariantPlaceholderPage({
          ...variant,
          emoji: getEmojiForPermit(variant.tipo)
        });
        await fs.writeFile(
          path.join(folderPath, `${variant.variantSlug}.html`),
          placeholderHtml,
          'utf-8'
        );
        console.log(`   ⚠️  ${variant.variantSlug}.html (placeholder - per user request)`);
        generatedPlaceholders++;
        continue;
      }

      // Fetch content for other variants
      console.log(`   Fetching content for: ${variant.variantName}...`);
      const blocks = await fetchPageBlocks(variant.id);

      if (!blocks || blocks.length === 0) {
        // Generate placeholder if no content
        const placeholderHtml = generateVariantPlaceholderPage({
          ...variant,
          emoji: getEmojiForPermit(variant.tipo)
        });
        await fs.writeFile(
          path.join(folderPath, `${variant.variantSlug}.html`),
          placeholderHtml,
          'utf-8'
        );
        console.log(`   ⚠️  ${variant.variantSlug}.html (placeholder - no content)`);
        generatedPlaceholders++;
        continue;
      }

      // Parse Q&A sections
      const sections = parseQASections(blocks);

      if (sections.length === 0) {
        // Generate placeholder if no sections
        const placeholderHtml = generateVariantPlaceholderPage({
          ...variant,
          emoji: getEmojiForPermit(variant.tipo)
        });
        await fs.writeFile(
          path.join(folderPath, `${variant.variantSlug}.html`),
          placeholderHtml,
          'utf-8'
        );
        console.log(`   ⚠️  ${variant.variantSlug}.html (placeholder - no sections)`);
        generatedPlaceholders++;
        continue;
      }

      // Generate full variant child page
      const childHtml = generateVariantChildPage({
        ...variant,
        baseSlug: group.baseSlug,
        emoji: getEmojiForPermit(variant.tipo),
        sections
      });

      await fs.writeFile(
        path.join(folderPath, `${variant.variantSlug}.html`),
        childHtml,
        'utf-8'
      );

      console.log(`   ✓ ${variant.variantSlug}.html (${sections.length} sections)`);
      generatedChildren++;
    }
  }

  // Summary
  console.log('\n=========================================');
  console.log(`✅ Generated ${generatedFolders} variant folders`);
  console.log(`✅ Generated ${generatedParents} parent pages`);
  console.log(`✅ Generated ${generatedChildren} variant child pages`);
  if (generatedPlaceholders > 0) {
    console.log(`⚠️  Generated ${generatedPlaceholders} placeholder variant pages (need content)`);
  }
  console.log('\n📁 Output: ' + OUTPUT_DIR);
  console.log('');
}

// Check for special flags before running build
if (process.argv.includes('--detect-variants')) {
  detectAndProposeVariants().catch(err => {
    console.error('\n❌ Detection failed:', err);
    process.exit(1);
  });
} else if (process.argv.includes('--generate-variants')) {
  generateVariantPages().catch(err => {
    console.error('\n❌ Variant generation failed:', err);
    process.exit(1);
  });
} else {
  // Run build
  build().catch(err => {
    console.error('\n❌ Build failed:', err);
    process.exit(1);
  });
}
