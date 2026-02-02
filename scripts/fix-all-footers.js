#!/usr/bin/env node
/**
 * Fix ALL non-standard footers to use the correct template
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let itFilesFixed = 0;
let enFilesFixed = 0;

const IT_FOOTER = `<footer class="footer">
    <div class="container">
      <div class="footer-content">
        <a href="il-progetto.html" class="footer-project-link">Il Progetto</a>
        <span class="footer-separator">|</span>
        <a href="chi-siamo.html" class="footer-project-link">Chi Siamo</a>
        <span class="footer-separator">|</span>
        <a href="privacy-policy.html" class="footer-project-link">Privacy e altro</a>
        <span class="footer-separator">|</span>
        <p class="footer-copyright">© 2026 SOS Permesso</p>
      </div>
    </div>
  </footer>`;

const EN_FOOTER = `<footer class="footer">
    <div class="container">
      <div class="footer-content">
        <a href="il-progetto.html" class="footer-project-link">The Project</a>
        <span class="footer-separator">|</span>
        <a href="chi-siamo.html" class="footer-project-link">About Us</a>
        <span class="footer-separator">|</span>
        <a href="privacy-policy.html" class="footer-project-link">Privacy and more</a>
        <span class="footer-separator">|</span>
        <p class="footer-copyright">© 2026 SOS Permesso</p>
      </div>
    </div>
  </footer>`;

// Generic pattern to match any footer
const FOOTER_PATTERN = /<footer class="footer">[\s\S]*?<\/footer>/;

function fixFile(filePath, isEnglish) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Skip redirect pages (no footer needed)
  if (content.includes('http-equiv="refresh"')) {
    return false;
  }

  // Check if file has a footer
  if (!content.includes('<footer')) {
    return false;
  }

  // Check if already has the correct footer
  const correctText = isEnglish ? 'Privacy and more' : 'Privacy e altro';
  if (content.includes(correctText) && content.includes('il-progetto.html') && content.includes('chi-siamo.html')) {
    return false;
  }

  const newFooter = isEnglish ? EN_FOOTER : IT_FOOTER;
  content = content.replace(FOOTER_PATTERN, newFooter);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    if (isEnglish) {
      enFilesFixed++;
    } else {
      itFilesFixed++;
    }
    console.log(`✓ ${path.relative(ROOT, filePath)}`);
    return true;
  }
  return false;
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
console.log(`   IT files fixed: ${itFilesFixed}`);
console.log(`   EN files fixed: ${enFilesFixed}`);
