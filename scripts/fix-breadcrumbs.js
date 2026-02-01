#!/usr/bin/env node
/**
 * Fix breadcrumb structure across all pages
 * Converts inline-styled breadcrumbs to proper .breadcrumb-bar structure
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../src/pages');

// Pattern to match the old breadcrumb structure
const OLD_BREADCRUMB_PATTERN = /<!-- BREADCRUMB -->\s*<section class="section" style="padding: 1rem 0;">\s*<div class="container"(?: style="position: relative;")?>\s*<div style="font-size: 0\.875rem; color: var\(--gray-medium\);">\s*<a href="([^"]+)"[^>]*>Home<\/a> →\s*(?:<a href="([^"]+)"[^>]*>([^<]+)<\/a> →\s*)?<span>([^<]+)<\/span>\s*<\/div>\s*(?:<!-- ERROR BUTTON -->\s*<a href="([^"]+)"\s*class="error-report-btn"[^>]*>\s*[^<]*<\/a>\s*)?<\/div>\s*<\/section>/s;

function generateNewBreadcrumb(homePath, parentPath, parentText, pageTitle, errorUrl) {
  const hasParent = parentPath && parentText;
  const hasError = !!errorUrl;

  let breadcrumbNav = `<a href="${homePath}">Home</a> →\n`;
  if (hasParent) {
    breadcrumbNav += `          <a href="${parentPath}">${parentText}</a> →\n          `;
  } else {
    breadcrumbNav += '          ';
  }
  breadcrumbNav += `<span>${pageTitle}</span>`;

  let errorButton = '';
  if (hasError) {
    errorButton = `
        <a href="${errorUrl}"
           class="error-report-btn"
           target="_blank"
           rel="noopener noreferrer">
          🚨 Segnala errore
        </a>`;
  }

  return `<!-- BREADCRUMB -->
  <div class="breadcrumb-bar">
    <div class="container">
      <div class="breadcrumb-content">
        <div class="breadcrumb-nav">
          ${breadcrumbNav}
        </div>${errorButton}
      </div>
    </div>
  </div>`;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if already using breadcrumb-bar
  if (content.includes('class="breadcrumb-bar"')) {
    return { skipped: true, reason: 'already fixed' };
  }

  // Check if has old breadcrumb pattern
  const match = content.match(OLD_BREADCRUMB_PATTERN);
  if (!match) {
    return { skipped: true, reason: 'no matching pattern' };
  }

  const [fullMatch, homePath, parentPath, parentText, pageTitle, errorUrl] = match;

  const newBreadcrumb = generateNewBreadcrumb(homePath, parentPath, parentText, pageTitle, errorUrl);
  const newContent = content.replace(fullMatch, newBreadcrumb);

  fs.writeFileSync(filePath, newContent, 'utf8');
  return { fixed: true, pageTitle };
}

function getAllHtmlFiles(dir) {
  const files = [];

  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

// Main
console.log('Fixing breadcrumb structure...\n');

const htmlFiles = getAllHtmlFiles(PAGES_DIR);
let fixed = 0;
let skipped = 0;
const fixedFiles = [];
const skippedFiles = [];

for (const file of htmlFiles) {
  const relativePath = path.relative(PAGES_DIR, file);
  const result = processFile(file);

  if (result.fixed) {
    fixed++;
    fixedFiles.push(relativePath);
    console.log(`✅ Fixed: ${relativePath}`);
  } else {
    skipped++;
    skippedFiles.push({ path: relativePath, reason: result.reason });
  }
}

console.log(`\n========================================`);
console.log(`Fixed: ${fixed} files`);
console.log(`Skipped: ${skipped} files`);

if (skippedFiles.length > 0 && skippedFiles.length <= 20) {
  console.log('\nSkipped files:');
  for (const { path: p, reason } of skippedFiles) {
    console.log(`  - ${p} (${reason})`);
  }
}
