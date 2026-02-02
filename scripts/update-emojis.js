#!/usr/bin/env node
/**
 * Update emojis for permit types:
 * - Status di rifugiato (asilo politico): 🏆 → 🛡️
 * - Protezione speciale: ⚡ → ✨
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let filesFixed = 0;
let trophyReplacements = 0;
let lightningReplacements = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace 🏆 with 🛡️ (rifugiato/asilo politico)
  const trophyMatches = (content.match(/🏆/g) || []).length;
  content = content.replace(/🏆/g, '🛡️');

  // Replace ⚡ with ✨ (protezione speciale)
  const lightningMatches = (content.match(/⚡/g) || []).length;
  content = content.replace(/⚡/g, '✨');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesFixed++;
    trophyReplacements += trophyMatches;
    lightningReplacements += lightningMatches;

    const changes = [];
    if (trophyMatches > 0) changes.push(`🏆→🛡️: ${trophyMatches}`);
    if (lightningMatches > 0) changes.push(`⚡→✨: ${lightningMatches}`);
    console.log(`✓ ${path.relative(ROOT, filePath)} (${changes.join(', ')})`);
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

console.log(`\n✅ Done!`);
console.log(`   Files updated: ${filesFixed}`);
console.log(`   🏆→🛡️ (rifugiato): ${trophyReplacements} replacements`);
console.log(`   ⚡→✨ (speciale): ${lightningReplacements} replacements`);
