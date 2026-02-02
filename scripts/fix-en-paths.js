#!/usr/bin/env node
/**
 * Fix CSS/JS paths in EN pages
 *
 * Problem: EN pages were created with incorrect relative paths
 * - en/src/pages/*.html use ../../styles/ but should use ../../../src/styles/
 * - en/src/pages/subdir/*.html use ../../../styles/ but should use ../../../../src/styles/
 */

const fs = require('fs');
const path = require('path');

const EN_DIR = path.join(__dirname, '..', 'en');

// Track changes for reporting
let filesFixed = 0;
let totalReplacements = 0;

function fixFile(filePath, depth) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let replacements = 0;

  // Calculate correct prefix based on depth from root
  // depth 3 = en/src/pages/*.html → ../../../
  // depth 4 = en/src/pages/subdir/*.html → ../../../../
  const toRoot = '../'.repeat(depth);

  // Wrong prefix patterns based on depth
  // Files at depth 3 incorrectly use ../../ (depth 2)
  // Files at depth 4 incorrectly use ../../../ (depth 3)
  const wrongToRoot = '../'.repeat(depth - 1);

  // Fix CSS paths: ../../styles/ → ../../../src/styles/
  const cssPattern = new RegExp(`href="${wrongToRoot.replace(/\//g, '\\/')}styles\\/`, 'g');
  const cssReplacement = `href="${toRoot}src/styles/`;
  const cssMatches = content.match(cssPattern);
  if (cssMatches) {
    content = content.replace(cssPattern, cssReplacement);
    replacements += cssMatches.length;
  }

  // Fix JS paths: ../../scripts/ → ../../../src/scripts/
  const jsPattern = new RegExp(`src="${wrongToRoot.replace(/\//g, '\\/')}scripts\\/`, 'g');
  const jsReplacement = `src="${toRoot}src/scripts/`;
  const jsMatches = content.match(jsPattern);
  if (jsMatches) {
    content = content.replace(jsPattern, jsReplacement);
    replacements += jsMatches.length;
  }

  // Fix image paths: normalize to IMAGES (uppercase)
  // Pattern: images/ → IMAGES/ (case insensitive match)
  const imgPattern = /\/images\//gi;
  content = content.replace(imgPattern, '/IMAGES/');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    totalReplacements += replacements;
    console.log(`✓ Fixed: ${path.relative(EN_DIR, filePath)} (${replacements} CSS/JS replacements)`);
  }
}

function processDirectory(dir, depth) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath, depth + 1);
    } else if (entry.name.endsWith('.html')) {
      fixFile(fullPath, depth);
    }
  }
}

// Fix en/index.html separately (depth 1)
const indexPath = path.join(EN_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  const originalContent = content;

  // Fix image case: ../images/ → ../IMAGES/
  content = content.replace(/\/images\//gi, '/IMAGES/');

  if (content !== originalContent) {
    fs.writeFileSync(indexPath, content, 'utf8');
    filesFixed++;
    console.log(`✓ Fixed: index.html (image case)`);
  }
}

// Process en/src/pages/ (depth 3 from root)
const pagesDir = path.join(EN_DIR, 'src', 'pages');
if (fs.existsSync(pagesDir)) {
  processDirectory(pagesDir, 3);
}

console.log(`\n✅ Done! Fixed ${filesFixed} files with ${totalReplacements} CSS/JS path replacements`);
