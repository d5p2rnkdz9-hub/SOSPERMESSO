#!/usr/bin/env node
/**
 * Add rtl.css and cjk.css links to all HTML pages
 * Phase 34.1: CSS Integration Fix
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = path.join(__dirname, '..');
let filesProcessed = 0;
let filesSkipped = 0;

function getCSSPath(filePath) {
  // EN root index.html (check BEFORE root index to avoid false match)
  if (filePath.includes('/en/index.html')) {
    return '../src/styles/';
  }
  // Root index.html
  if (filePath.endsWith('index.html') && !filePath.includes('/src/')) {
    return 'src/styles/';
  }
  // EN pages: en/src/pages/*.html
  if (filePath.includes('/en/src/pages/')) {
    return '../../../src/styles/';
  }
  // IT pages: src/pages/*.html (includes subdirectories)
  if (filePath.includes('/src/pages/')) {
    return '../styles/';
  }
  return 'src/styles/'; // Fallback
}

function addCSSLinks(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  // Idempotency check
  if ($('link[href*="rtl.css"]').length > 0 || $('link[href*="cjk.css"]').length > 0) {
    filesSkipped++;
    return;
  }

  const cssPath = getCSSPath(filePath);

  // Find last existing stylesheet link
  const lastLink = $('head link[rel="stylesheet"]').last();

  if (lastLink.length > 0) {
    // Insert after last stylesheet (maintains order)
    lastLink.after(`\n  <link rel="stylesheet" href="${cssPath}rtl.css">`);
    $('head link[href*="rtl.css"]').after(`\n  <link rel="stylesheet" href="${cssPath}cjk.css">`);
  } else {
    // No stylesheets found - append to head
    $('head').append(`\n  <link rel="stylesheet" href="${cssPath}rtl.css">`);
    $('head').append(`\n  <link rel="stylesheet" href="${cssPath}cjk.css">`);
  }

  fs.writeFileSync(filePath, $.html(), 'utf8');
  filesProcessed++;
  console.log(`✓ ${path.relative(ROOT_DIR, filePath)}`);
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.html')) {
      addCSSLinks(fullPath);
    }
  }
}

console.log('📝 Adding rtl.css and cjk.css links to all HTML pages...\n');

// Process root index.html
const rootIndex = path.join(ROOT_DIR, 'index.html');
if (fs.existsSync(rootIndex)) {
  addCSSLinks(rootIndex);
}

// Process IT pages
const itPages = path.join(ROOT_DIR, 'src', 'pages');
if (fs.existsSync(itPages)) {
  processDirectory(itPages);
}

// Process EN index.html
const enIndex = path.join(ROOT_DIR, 'en', 'index.html');
if (fs.existsSync(enIndex)) {
  addCSSLinks(enIndex);
}

// Process EN pages
const enPages = path.join(ROOT_DIR, 'en', 'src', 'pages');
if (fs.existsSync(enPages)) {
  processDirectory(enPages);
}

console.log(`\n✅ Done! Processed ${filesProcessed} files, skipped ${filesSkipped} (already have links)`);
