/**
 * Batch Translation Script - Phase 20
 *
 * Translates all IT pages to EN using Anthropic Claude API.
 * Uses Message Batches API for 50% cost savings.
 *
 * Usage: npm run translate:en [options]
 * Options:
 *   --help            Show this help
 *   --dry-run         List pages without translating
 *   --force           Retranslate all pages
 *   --batch-size N    Pages per API batch (default: 50)
 *   --file path       Translate single file
 *   --show-prompt     Display populated translation prompt
 *   --test-extract    Test segment extraction (Plan 02)
 *   --test-links      Test link transformation (Plan 02)
 *   --test-reassemble Test HTML reassembly (Plan 02)
 */

const fs = require('fs/promises');
const path = require('path');
const cheerio = require('cheerio');

const PAGES_DIR = path.join(__dirname, '../src/pages');
const MANIFEST_PATH = path.join(__dirname, 'translation-manifest.json');
const GLOSSARY_PATH = path.join(__dirname, 'translation-glossary.json');

/**
 * Load translation manifest from disk
 * @returns {Promise<Object>} Manifest data or default structure
 */
async function loadManifest() {
  try {
    const data = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default structure if file doesn't exist
    return {
      meta: {
        created: new Date().toISOString().split('T')[0],
        lastRun: null,
        totalTranslated: 0
      },
      pages: {}
    };
  }
}

/**
 * Save translation manifest to disk
 * @param {Object} manifest - Manifest data
 */
async function saveManifest(manifest) {
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Check if page needs translation based on source file modification time
 * @param {Object} page - Page object with filepath and mtime
 * @param {Object} manifest - Current manifest
 * @returns {boolean} True if needs translation
 */
function needsTranslation(page, manifest) {
  const entry = manifest.pages[page.filename];
  if (!entry) return true; // Never translated

  const lastTranslated = new Date(entry.lastTranslated);
  const sourceMtime = new Date(page.mtime);

  return sourceMtime > lastTranslated;
}

/**
 * Check if HTML file is a redirect page (meta refresh)
 * @param {string} filepath - Path to HTML file
 * @returns {Promise<boolean>} True if redirect page
 */
async function isRedirectPage(filepath) {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    // Check for meta refresh tag (redirect pages)
    return content.includes('<meta http-equiv="refresh"');
  } catch {
    return false;
  }
}

/**
 * Discover all IT pages that need translation
 * @returns {Promise<Array>} Array of { filename, filepath, mtime }
 */
async function discoverPages() {
  const files = await fs.readdir(PAGES_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html'));

  const pages = [];
  for (const filename of htmlFiles) {
    const filepath = path.join(PAGES_DIR, filename);
    const stats = await fs.stat(filepath);

    // Skip redirect pages
    if (await isRedirectPage(filepath)) {
      continue;
    }

    pages.push({
      filename,
      filepath,
      mtime: stats.mtime
    });
  }

  return pages;
}

/**
 * Build system prompt with glossary terms substituted
 * @returns {Promise<string>} Populated system prompt
 */
async function buildSystemPrompt() {
  const template = await fs.readFile(
    path.join(__dirname, 'templates/translation-prompt.txt'),
    'utf-8'
  );
  const glossary = require(GLOSSARY_PATH);

  const termsStr = Object.entries(glossary.terms)
    .map(([it, en]) => `- "${it}" -> "${en}"`)
    .join('\n');

  const doNotTranslateStr = glossary.doNotTranslate
    .map(t => `- ${t}`)
    .join('\n');

  return template
    .replace('{GLOSSARY_TERMS}', termsStr)
    .replace('{DO_NOT_TRANSLATE}', doNotTranslateStr);
}

/**
 * Extract translatable text segments from HTML
 * @param {string} html - Source HTML content
 * @returns {{ $: CheerioAPI, segments: Array, metadata: Object }}
 */
function extractSegments(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const segments = [];
  let segmentId = 0;

  // Extract metadata first
  const metadata = {
    title: $('title').text(),
    description: $('meta[name="description"]').attr('content') || ''
  };

  // Mark metadata elements for later update
  $('title').attr('data-translate-id', 'title');
  $('meta[name="description"]').attr('data-translate-id', 'description');

  // Elements containing translatable text
  const textSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'li', 'td', 'th',
    'span:not(.no-translate)',
    'a:not([href^="http"]):not([href^="mailto"])',
    'button', 'label',
    '.alert', '.card-title', '.card-text',
    '.breadcrumb-item'
  ].join(', ');

  $(textSelectors).each((i, el) => {
    const $el = $(el);

    // Skip if inside script, style, or already processed parent
    if ($el.parents('script, style, noscript').length) return;
    if ($el.attr('data-translate-id')) return;

    // Skip empty or whitespace-only
    const text = $el.html();
    if (!text || !text.trim()) return;

    // Skip if translate="no" attribute
    if ($el.attr('translate') === 'no') return;

    // Skip children that will be processed separately
    if ($el.find(textSelectors).length > 0) {
      // Has child text elements - skip, they'll be processed
      return;
    }

    // Store segment with unique ID
    const id = segmentId++;
    $el.attr('data-translate-id', id.toString());

    segments.push({
      id,
      text: text.trim(),
      tagName: el.tagName.toLowerCase(),
      selector: generateSelector($el)
    });
  });

  return { $, segments, metadata };
}

/**
 * Generate a unique selector for an element
 */
function generateSelector($el) {
  const tag = $el[0].tagName.toLowerCase();
  const id = $el.attr('id');
  if (id) return `#${id}`;

  const classes = $el.attr('class');
  if (classes) {
    const firstClass = classes.split(' ')[0];
    return `${tag}.${firstClass}`;
  }

  return tag;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Batch Translation Script - Phase 20

Translates all IT pages to EN using Anthropic Claude API.

Usage: npm run translate:en [options]

Options:
  --help            Show this help
  --dry-run         List pages without translating
  --force           Retranslate all pages (ignore manifest)
  --batch-size N    Pages per API batch (default: 50)
  --file path       Translate single file for testing
  --show-prompt     Display populated translation prompt
  --test-extract path    Test segment extraction (Plan 02)
  --test-links path      Test link transformation (Plan 02)
  --test-reassemble path Test HTML reassembly (Plan 02)

Examples:
  npm run translate:en -- --dry-run
  npm run translate:en -- --file src/pages/chi-siamo.html
  npm run translate:en -- --show-prompt
  `);
}

/**
 * Parse CLI arguments
 * @param {Array} args - Process arguments
 * @returns {Object} Parsed options
 */
function parseArgs(args) {
  const options = {
    help: false,
    dryRun: false,
    force: false,
    batchSize: 50,
    file: null,
    showPrompt: false,
    testExtract: null,
    testLinks: null,
    testReassemble: null
  };

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--show-prompt') options.showPrompt = true;
    else if (arg === '--batch-size' && i + 1 < args.length) {
      options.batchSize = parseInt(args[++i], 10);
    }
    else if (arg === '--file' && i + 1 < args.length) {
      options.file = args[++i];
    }
    else if (arg === '--test-extract' && i + 1 < args.length) {
      options.testExtract = args[++i];
    }
    else if (arg === '--test-links' && i + 1 < args.length) {
      options.testLinks = args[++i];
    }
    else if (arg === '--test-reassemble' && i + 1 < args.length) {
      options.testReassemble = args[++i];
    }
  }

  return options;
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs(process.argv);

  // Handle --help
  if (options.help) {
    showHelp();
    return;
  }

  // Handle --show-prompt
  if (options.showPrompt) {
    const prompt = await buildSystemPrompt();
    console.log('=== Translation System Prompt ===\n');
    console.log(prompt);
    return;
  }

  // Handle test mode flags
  if (options.testExtract) {
    const html = await fs.readFile(options.testExtract, 'utf-8');
    const { segments, metadata } = extractSegments(html);

    console.log(`\n=== SEGMENT EXTRACTION TEST ===`);
    console.log(`File: ${options.testExtract}`);
    console.log(`Title: ${metadata.title}`);
    console.log(`Description: ${metadata.description.slice(0, 50)}...`);
    console.log(`\nExtracted ${segments.length} segments:\n`);

    segments.slice(0, 15).forEach(seg => {
      const preview = seg.text.slice(0, 60).replace(/\n/g, ' ');
      console.log(`  [${seg.id}] <${seg.tagName}> ${preview}${seg.text.length > 60 ? '...' : ''}`);
    });

    if (segments.length > 15) {
      console.log(`  ... and ${segments.length - 15} more segments`);
    }

    return;
  }

  if (options.testLinks) {
    console.log('Test links mode - will be implemented in Plan 02');
    console.log(`File: ${options.testLinks}`);
    return;
  }

  if (options.testReassemble) {
    console.log('Test reassemble mode - will be implemented in Plan 02');
    console.log(`File: ${options.testReassemble}`);
    return;
  }

  // Load manifest
  const manifest = await loadManifest();

  // Discover pages
  const allPages = await discoverPages();

  // Filter pages that need translation
  const pagesToTranslate = options.force
    ? allPages
    : allPages.filter(page => needsTranslation(page, manifest));

  // Report summary
  console.log(`\nFound ${allPages.length} pages`);
  console.log(`${pagesToTranslate.length} need translation`);

  if (options.dryRun) {
    console.log('\n=== Pages to translate (--dry-run) ===');
    pagesToTranslate.forEach((page, i) => {
      console.log(`${i + 1}. ${page.filename}`);
    });
    return;
  }

  // Single file mode
  if (options.file) {
    console.log(`\nSingle file mode: ${options.file}`);
    console.log('Translation logic will be implemented in Plan 03');
    return;
  }

  // Batch translation (placeholder)
  if (pagesToTranslate.length > 0) {
    console.log('\nBatch translation logic will be implemented in Plan 03');
  } else {
    console.log('\nAll pages are up to date!');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = {
  loadManifest,
  saveManifest,
  needsTranslation,
  discoverPages,
  buildSystemPrompt
};
