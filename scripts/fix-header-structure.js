#!/usr/bin/env node
/**
 * Fix header structure on all inner pages
 *
 * Current (wrong) structure:
 *   <a class="logo">...</a>
 *   <button class="menu-toggle">...</button>
 *   <div class="nav-wrapper">
 *     <ul class="nav-menu">...</ul>
 *     <div class="language-switcher">...</div>  <-- WRONG: hidden on mobile
 *   </div>
 *
 * Correct structure (like homepage):
 *   <a class="logo">...</a>
 *   <div class="language-switcher">...</div>     <-- STANDALONE
 *   <button class="menu-toggle">...</button>
 *   <div class="nav-wrapper">
 *     <ul class="nav-menu">...</ul>
 *   </div>
 */

const fs = require('fs');
const path = require('path');

const DIRS = [
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../en/src/pages'),
];

const EXTRA_FILES = [
  path.join(__dirname, '../en/index.html'),
];

// Language switcher templates
const getLangSwitcher = (isEnglish) => {
  const currentLang = isEnglish ? 'EN 🇬🇧' : 'IT 🇮🇹';
  return `
        <!-- Language Switcher (standalone) -->
        <div class="language-switcher">
          <button class="language-button" id="language-toggle">
            <span id="current-language">${currentLang}</span>
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
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="menu-toggle" id="menu-toggle" aria-label="Menu">
          ☰
        </button>`;
};

let stats = { total: 0, fixed: 0, skipped: 0, errors: [] };

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const isEnglish = filePath.includes('/en/');

    // Check if already has correct structure
    if (content.includes('<!-- Language Switcher (standalone) -->')) {
      stats.skipped++;
      return;
    }

    let modified = false;

    // Step 1: Remove language-switcher from inside nav-wrapper
    // Match: </ul> followed by whitespace, then language-switcher div, then </div> closing nav-wrapper
    const langSwitcherInNavWrapper = /(<\/ul>)\s*\n\s*<div class="language-switcher">[\s\S]*?<\/div>\s*\n(\s*<\/div>\s*\n\s*<\/nav>)/;

    if (langSwitcherInNavWrapper.test(content)) {
      content = content.replace(langSwitcherInNavWrapper, '$1\n        $2');
      modified = true;
    }

    // Step 2: Replace menu-toggle with language-switcher + menu-toggle
    // Match: </a> (logo close) followed by whitespace, then <button class="menu-toggle"
    const menuTogglePattern = /(<\/a>)\s*\n(\s*)<button class="menu-toggle"[^>]*>[^<]*<\/button>/;

    if (menuTogglePattern.test(content)) {
      const langSwitcher = getLangSwitcher(isEnglish);
      content = content.replace(menuTogglePattern, `$1\n${langSwitcher}`);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.fixed++;
      console.log(`  ✓ Fixed: ${fileName}`);
    } else {
      stats.skipped++;
      console.log(`  - Skipped: ${fileName} (structure not matched)`);
    }

  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`  ✗ Error: ${path.basename(filePath)}`);
  }
}

function getAllHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  let files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));

  // Check subdirectories
  const subdirs = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(dir, d.name));

  for (const subdir of subdirs) {
    const subFiles = fs.readdirSync(subdir)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(subdir, f));
    files.push(...subFiles);
  }

  return files;
}

function main() {
  console.log('🔧 Fixing header structure (moving language switcher outside nav-wrapper)...\n');

  const allFiles = [];

  for (const dir of DIRS) {
    allFiles.push(...getAllHtmlFiles(dir));
  }

  for (const file of EXTRA_FILES) {
    if (fs.existsSync(file)) allFiles.push(file);
  }

  stats.total = allFiles.length;
  console.log(`Found ${allFiles.length} HTML files\n`);

  for (const file of allFiles) {
    fixFile(file);
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total: ${stats.total}`);
  console.log(`Fixed: ${stats.fixed}`);
  console.log(`Skipped: ${stats.skipped}`);
  if (stats.errors.length > 0) {
    console.log(`Errors: ${stats.errors.length}`);
  }
  console.log('\n✅ Done!');
}

main();
