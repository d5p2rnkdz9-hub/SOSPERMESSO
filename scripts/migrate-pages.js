/**
 * Migration Script for SOS Permesso HTML Pages
 *
 * Transforms HTML pages to use 11ty layouts by:
 * 1. Extracting title, description, inline styles
 * 2. Removing header, footer, head elements
 * 3. Removing standard scripts (app.js, mobile.js)
 * 4. Generating front matter with layout, title, lang, description, extraStyles
 * 5. Preserving page-specific content and scripts
 *
 * Usage: node scripts/migrate-pages.js "pattern"
 * Examples:
 *   node scripts/migrate-pages.js "index.html"
 *   node scripts/migrate-pages.js "src/pages/permesso-*.html"
 *   node scripts/migrate-pages.js "en/src/pages/*.html"
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const glob = require('glob');

/**
 * Extract title from HTML, removing " - SOS Permesso" suffix
 */
function extractTitle($) {
  const fullTitle = $('title').text() || '';
  // Remove various site name suffixes
  return fullTitle
    .replace(/\s*[-|]\s*SOS Permesso$/i, '')
    .replace(/\s*\|\s*SOS Permesso$/i, '')
    .trim();
}

/**
 * Extract meta description content
 */
function extractDescription($) {
  const meta = $('meta[name="description"]');
  return meta.attr('content') || '';
}

/**
 * Extract inline <style> blocks from head
 * Returns the full <style>...</style> tags as a string
 */
function extractInlineStyles($) {
  const styles = [];
  $('head style').each((i, el) => {
    const styleContent = $(el).html();
    if (styleContent && styleContent.trim()) {
      styles.push(`<style>\n${styleContent}\n</style>`);
    }
  });
  // Also check for inline styles in body (like in index.html)
  $('body > style').each((i, el) => {
    const styleContent = $(el).html();
    if (styleContent && styleContent.trim()) {
      styles.push(`<style>\n${styleContent}\n</style>`);
    }
  });
  return styles.join('\n');
}

/**
 * Extract page content by removing layout elements
 */
function extractContent($) {
  // Remove elements handled by layout
  $('head').remove();
  $('header').remove();
  $('footer').remove();

  // Remove only standard scripts (keep page-specific scripts and inline scripts)
  $('script[src*="app.js"]').remove();
  $('script[src*="mobile.js"]').remove();

  // Remove inline styles (they'll be passed via extraStyles)
  $('body > style').remove();

  // Get remaining body content
  let content = $('body').html();
  if (!content) return '';

  // Clean up leading/trailing whitespace but preserve internal formatting
  content = content.replace(/^\s*\n/, '').replace(/\n\s*$/, '');

  return content;
}

/**
 * Escape a string for YAML - handles special characters
 */
function escapeYaml(str) {
  if (!str) return '';
  // If contains quotes or special chars, wrap in double quotes and escape internal quotes
  if (str.includes('"') || str.includes(':') || str.includes('#') || str.includes('\n')) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  // Otherwise just return as-is
  return `"${str}"`;
}

/**
 * Determine language from file path
 */
function detectLanguage(filePath) {
  // If path starts with en/ or contains /en/, it's English
  if (filePath.startsWith('en/') || filePath.includes('/en/')) {
    return 'en';
  }
  return 'it';
}

/**
 * Generate front matter YAML
 */
function generateFrontMatter(title, lang, description, extraStyles) {
  let fm = `---\n`;
  fm += `layout: layouts/base.liquid\n`;
  fm += `title: ${escapeYaml(title)}\n`;
  fm += `lang: ${lang}\n`;
  if (description) {
    fm += `description: ${escapeYaml(description)}\n`;
  }
  if (extraStyles) {
    // extraStyles as a Liquid variable - needs to be a raw string
    // Use YAML multiline syntax for the style block
    fm += `extraStyles: |\n`;
    // Indent each line by 2 spaces for YAML block scalar
    extraStyles.split('\n').forEach(line => {
      fm += `  ${line}\n`;
    });
  }
  fm += `---\n`;
  return fm;
}

/**
 * Check if a file is already migrated (has front matter)
 */
function isAlreadyMigrated(content) {
  return content.trim().startsWith('---');
}

/**
 * Migrate a single HTML file
 */
function migrateFile(filePath) {
  // Read file
  const html = fs.readFileSync(filePath, 'utf8');

  // Skip if already migrated
  if (isAlreadyMigrated(html)) {
    console.log(`Skipped (already migrated): ${filePath}`);
    return { status: 'skipped', reason: 'already migrated' };
  }

  // Parse HTML
  const $ = cheerio.load(html, { decodeEntities: false });

  // Extract metadata
  const lang = detectLanguage(filePath);
  const title = extractTitle($);
  const description = extractDescription($);
  const inlineStyles = extractInlineStyles($);

  // Extract content (removes header, footer, standard scripts)
  const content = extractContent($);

  // Generate front matter
  const frontMatter = generateFrontMatter(title, lang, description, inlineStyles);

  // Combine front matter and content
  const newContent = frontMatter + '\n' + content;

  // Write file
  fs.writeFileSync(filePath, newContent, 'utf8');

  console.log(`Migrated: ${filePath}`);
  console.log(`  - Title: ${title}`);
  console.log(`  - Lang: ${lang}`);
  console.log(`  - Description: ${description ? 'Yes' : 'No'}`);
  console.log(`  - Inline styles: ${inlineStyles ? 'Yes' : 'No'}`);

  return { status: 'migrated', title, lang, hasDescription: !!description, hasStyles: !!inlineStyles };
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
Migration Script for SOS Permesso HTML Pages

Usage: node scripts/migrate-pages.js <pattern>

Arguments:
  pattern    Glob pattern for files to migrate

Examples:
  node scripts/migrate-pages.js "index.html"
  node scripts/migrate-pages.js "404.html"
  node scripts/migrate-pages.js "en/index.html"
  node scripts/migrate-pages.js "src/pages/permesso-*.html"
  node scripts/migrate-pages.js "src/pages/*.html"
  node scripts/migrate-pages.js "en/src/pages/*.html"

What it does:
  - Extracts title from <title> tag (removes " - SOS Permesso" suffix)
  - Extracts description from <meta name="description">
  - Extracts inline <style> blocks and passes via extraStyles
  - Removes <head>, <header>, <footer> elements
  - Removes standard scripts (app.js, mobile.js)
  - Preserves page-specific scripts and content
  - Adds front matter with layout, title, lang, description, extraStyles
  - Writes migrated content back to the same file

Note: Files already containing front matter (---) are skipped.
`);
}

// Main execution
const pattern = process.argv[2];

if (!pattern) {
  printUsage();
  process.exit(0);
}

// Find files matching pattern
const files = glob.sync(pattern);

if (files.length === 0) {
  console.log(`No files found matching pattern: ${pattern}`);
  process.exit(1);
}

console.log(`Found ${files.length} file(s) matching pattern: ${pattern}\n`);

// Process each file
const results = { migrated: 0, skipped: 0, errors: [] };

files.forEach(file => {
  try {
    const result = migrateFile(file);
    if (result.status === 'migrated') {
      results.migrated++;
    } else {
      results.skipped++;
    }
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
    results.errors.push({ file, error: error.message });
  }
  console.log('');
});

// Summary
console.log('---');
console.log(`Summary: ${results.migrated} migrated, ${results.skipped} skipped, ${results.errors.length} errors`);
if (results.errors.length > 0) {
  console.log('Errors:');
  results.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
}
