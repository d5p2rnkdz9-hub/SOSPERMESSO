#!/usr/bin/env node
/**
 * Update Privacy Policy label:
 * - IT pages: "Privacy Policy" → "Privacy e altro"
 * - EN pages: "Privacy Policy" → "Privacy and more"
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let itFilesFixed = 0;
let enFilesFixed = 0;
let itReplacements = 0;
let enReplacements = 0;

function fixFile(filePath, isEnglish) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  const matches = (content.match(/Privacy Policy/g) || []).length;

  if (isEnglish) {
    content = content.replace(/Privacy Policy/g, 'Privacy and more');
    if (content !== originalContent) {
      enFilesFixed++;
      enReplacements += matches;
    }
  } else {
    content = content.replace(/Privacy Policy/g, 'Privacy e altro');
    if (content !== originalContent) {
      itFilesFixed++;
      itReplacements += matches;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${path.relative(ROOT, filePath)} (${matches} replacements)`);
  }
}

function processDirectory(dir, isEnglish) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      processDirectory(fullPath, isEnglish);
    } else if (entry.name.endsWith('.html')) {
      fixFile(fullPath, isEnglish);
    }
  }
}

// Process IT: root index.html
const rootIndex = path.join(ROOT, 'index.html');
if (fs.existsSync(rootIndex)) {
  fixFile(rootIndex, false);
}

// Process IT: src/pages/
const srcPages = path.join(ROOT, 'src', 'pages');
if (fs.existsSync(srcPages)) {
  processDirectory(srcPages, false);
}

// Process EN: en/ folder
const enDir = path.join(ROOT, 'en');
if (fs.existsSync(enDir)) {
  processDirectory(enDir, true);
}

console.log(`\n✅ Done!`);
console.log(`   IT files: ${itFilesFixed} (${itReplacements} replacements) → "Privacy e altro"`);
console.log(`   EN files: ${enFilesFixed} (${enReplacements} replacements) → "Privacy and more"`);
