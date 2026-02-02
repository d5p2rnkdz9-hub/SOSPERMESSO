#!/usr/bin/env node
/**
 * Remove Contact/Contatti link from all footers
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let filesFixed = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Pattern to match separator + Contact/Contatti link
  // Matches: <span class="footer-separator">|</span> followed by whitespace and the Contatti/Contact link
  const pattern = /\s*<span class="footer-separator">\|<\/span>\s*<a href="https:\/\/form\.typeform\.com\/to\/USx16QN3"[^>]*>(?:Contatti|Contact)<\/a>/g;

  content = content.replace(pattern, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    console.log(`✓ Fixed: ${path.relative(ROOT, filePath)}`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.html')) {
      fixFile(fullPath);
    }
  }
}

// Process root index.html
const rootIndex = path.join(ROOT, 'index.html');
if (fs.existsSync(rootIndex)) {
  fixFile(rootIndex);
}

// Process src/pages/
const srcPages = path.join(ROOT, 'src', 'pages');
if (fs.existsSync(srcPages)) {
  processDirectory(srcPages);
}

// Process en/ folder
const enDir = path.join(ROOT, 'en');
if (fs.existsSync(enDir)) {
  processDirectory(enDir);
}

console.log(`\n✅ Done! Removed Contact/Contatti from ${filesFixed} files`);
