#!/usr/bin/env node
/**
 * Fix language switcher and home links in English pages
 *
 * Issues fixed:
 * 1. Missing language dropdown menu in header
 * 2. Wrong home/logo links pointing to Italian instead of English
 */

const fs = require('fs');
const path = require('path');

const EN_PAGES_DIR = path.join(__dirname, '../en/src/pages');
const EN_INDEX = path.join(__dirname, '../en/index.html');

// The complete language dropdown HTML that should be in every page
const LANGUAGE_DROPDOWN_HTML = `<div class="language-switcher">
          <button class="language-button" id="language-toggle">
            <span id="current-language">EN 🇬🇧</span>
            <span>▾</span>
          </button>
          <div class="language-dropdown" id="language-dropdown">
            <div class="language-option" data-lang="it">
              <span>🇮🇹</span>
              <span>Italiano</span>
            </div>
            <div class="language-option" data-lang="en">
              <span>🇬🇧</span>
              <span>English</span>
            </div>
            <div class="language-option" data-lang="fr">
              <span>🇫🇷</span>
              <span>Français</span>
            </div>
            <div class="language-option" data-lang="es">
              <span>🇪🇸</span>
              <span>Español</span>
            </div>
            <div class="language-option" data-lang="zh">
              <span>🇨🇳</span>
              <span>中文</span>
            </div>
          </div>
        </div>`;

// Pattern to match incomplete language switcher (missing dropdown)
const INCOMPLETE_SWITCHER_PATTERN = /<div class="language-switcher">\s*<button class="language-button" id="language-toggle">\s*<span id="current-language">EN[^<]*<\/span>\s*<span>▾<\/span>\s*<\/button>\s*<\/div>/gs;

// Pattern to match complete language switcher (to avoid double-fixing)
const COMPLETE_SWITCHER_PATTERN = /language-dropdown/;

let stats = {
  totalFiles: 0,
  fixedDropdown: 0,
  fixedHomeLinks: 0,
  alreadyCorrect: 0,
  errors: []
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const fileName = path.basename(filePath);

    // Check if dropdown is missing
    if (!COMPLETE_SWITCHER_PATTERN.test(content) && INCOMPLETE_SWITCHER_PATTERN.test(content)) {
      content = content.replace(INCOMPLETE_SWITCHER_PATTERN, LANGUAGE_DROPDOWN_HTML);
      modified = true;
      stats.fixedDropdown++;
      console.log(`  ✓ Fixed dropdown: ${fileName}`);
    }

    // Fix wrong home links (logo and breadcrumb)
    // For pages in /en/src/pages/, the correct path is ../../../en/index.html

    // Fix logo link
    if (content.includes('href="../../../index.html" class="logo"')) {
      content = content.replace(
        'href="../../../index.html" class="logo"',
        'href="../../../en/index.html" class="logo"'
      );
      modified = true;
      stats.fixedHomeLinks++;
      console.log(`  ✓ Fixed logo link: ${fileName}`);
    }

    // Fix breadcrumb Home link
    const breadcrumbPattern = /<a href="\.\.\/\.\.\/\.\.\/index\.html"([^>]*)>Home<\/a>/g;
    if (breadcrumbPattern.test(content)) {
      content = content.replace(breadcrumbPattern, '<a href="../../../en/index.html"$1>Home</a>');
      modified = true;
      console.log(`  ✓ Fixed breadcrumb: ${fileName}`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    } else {
      stats.alreadyCorrect++;
    }

  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`  ✗ Error: ${path.basename(filePath)} - ${error.message}`);
  }
}

function main() {
  console.log('🔧 Fixing English pages language switcher and home links...\n');

  // Get all HTML files in EN pages directory
  const files = fs.readdirSync(EN_PAGES_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(EN_PAGES_DIR, f));

  // Also check subdirectories (like permesso-lavoro-subordinato/index.html)
  const subdirs = fs.readdirSync(EN_PAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const subdir of subdirs) {
    const subdirPath = path.join(EN_PAGES_DIR, subdir);
    const subdirFiles = fs.readdirSync(subdirPath)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(subdirPath, f));
    files.push(...subdirFiles);
  }

  stats.totalFiles = files.length;
  console.log(`Found ${files.length} HTML files to check\n`);

  for (const file of files) {
    fixFile(file);
  }

  // Also fix EN index.html if needed
  if (fs.existsSync(EN_INDEX)) {
    console.log('\nChecking en/index.html...');
    fixFile(EN_INDEX);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total files checked: ${stats.totalFiles}`);
  console.log(`Fixed dropdowns: ${stats.fixedDropdown}`);
  console.log(`Fixed home links: ${stats.fixedHomeLinks}`);
  console.log(`Already correct: ${stats.alreadyCorrect}`);

  if (stats.errors.length > 0) {
    console.log(`\nErrors: ${stats.errors.length}`);
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }

  console.log('\n✅ Done!');
}

main();
