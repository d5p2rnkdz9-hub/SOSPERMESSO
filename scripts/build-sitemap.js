/**
 * Build script for generating sitemap index with hreflang support
 * Creates sitemap-index.xml pointing to per-language sitemaps (sitemap-it.xml, sitemap-en.xml)
 * Each language sitemap includes hreflang alternates for SEO
 */
const fs = require('fs/promises');
const path = require('path');

const SITE_URL = 'https://www.sospermesso.it';
const LANGUAGES = ['it', 'en'];
const DEFAULT_LANG = 'it';
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Check if file is a redirect page
 * Reads first 500 chars and checks for meta refresh
 */
async function isRedirect(filePath) {
  try {
    const handle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(500);
    const { bytesRead } = await handle.read(buffer, 0, 500, 0);
    await handle.close();

    const content = buffer.toString('utf-8', 0, bytesRead);
    return content.includes('http-equiv="refresh"') || content.includes("http-equiv='refresh'");
  } catch (err) {
    console.error(`   Error checking redirect for ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Recursively find all HTML files in a directory
 */
async function findHtmlFiles(dir, baseDir = dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await findHtmlFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // Exclude 404.html and PREVIEW.html
      if (entry.name === '404.html' || entry.name === 'PREVIEW.html') {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get all pages for a language
 * @param {string} lang - Language code ('it' or 'en')
 * @returns {Promise<Array>} Array of { path, lastmod }
 */
async function getPagesForLanguage(lang) {
  const pages = [];

  if (lang === 'it') {
    // Italian pages: root index.html and src/pages/
    const rootIndex = path.join(ROOT_DIR, 'index.html');
    try {
      const stats = await fs.stat(rootIndex);
      pages.push({
        path: 'index.html',
        lastmod: stats.mtime.toISOString().split('T')[0]
      });
    } catch {
      // Root index not found
    }

    // Get all pages from src/pages
    const pagesDir = path.join(ROOT_DIR, 'src/pages');
    const pageFiles = await findHtmlFiles(pagesDir, ROOT_DIR);

    for (const filePath of pageFiles) {
      const isRedirectPage = await isRedirect(filePath);
      if (isRedirectPage) continue;

      const stats = await fs.stat(filePath);
      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      pages.push({
        path: relativePath,
        lastmod: stats.mtime.toISOString().split('T')[0]
      });
    }
  } else {
    // Other languages: /en/index.html and /en/src/pages/
    const langDir = path.join(ROOT_DIR, lang);

    // Check if language directory exists
    try {
      await fs.access(langDir);
    } catch {
      // Language directory doesn't exist yet
      return pages;
    }

    // Language root index
    const langIndex = path.join(langDir, 'index.html');
    try {
      const stats = await fs.stat(langIndex);
      pages.push({
        path: `${lang}/index.html`,
        lastmod: stats.mtime.toISOString().split('T')[0]
      });
    } catch {
      // Language index not found
    }

    // Language pages
    const langPagesDir = path.join(langDir, 'src/pages');
    const pageFiles = await findHtmlFiles(langPagesDir, ROOT_DIR);

    for (const filePath of pageFiles) {
      const isRedirectPage = await isRedirect(filePath);
      if (isRedirectPage) continue;

      const stats = await fs.stat(filePath);
      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      pages.push({
        path: relativePath,
        lastmod: stats.mtime.toISOString().split('T')[0]
      });
    }
  }

  return pages;
}

/**
 * Get URL for a page path (already includes language prefix if not IT)
 * @param {string} pagePath - Page path (e.g., 'src/pages/chi-siamo.html' or 'en/src/pages/chi-siamo.html')
 * @returns {string} Full URL
 */
function getUrlForPath(pagePath) {
  return `${SITE_URL}/${pagePath}`;
}

/**
 * Get equivalent page path in another language
 * Paths already include language prefix for non-IT (e.g., 'en/src/pages/...')
 * @param {string} pagePath - Page path in source language
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string} Equivalent path in target language
 */
function getEquivalentPath(pagePath, sourceLang, targetLang) {
  if (sourceLang === targetLang) {
    return pagePath;
  }

  if (sourceLang === 'it') {
    // Italian to other: add language prefix
    return `${targetLang}/${pagePath}`;
  } else if (targetLang === 'it') {
    // Other to Italian: remove language prefix
    return pagePath.replace(new RegExp(`^${sourceLang}/`), '');
  } else {
    // Other to other: swap language prefix
    return pagePath.replace(new RegExp(`^${sourceLang}/`), `${targetLang}/`);
  }
}

/**
 * Generate XML for sitemap index
 * @returns {string} XML string
 */
function generateSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const lang of LANGUAGES) {
    xml += '  <sitemap>\n';
    xml += `    <loc>${SITE_URL}/sitemap-${lang}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }

  xml += '</sitemapindex>\n';
  return xml;
}

/**
 * Generate XML for language sitemap with hreflang alternates
 * @param {string} lang - Language code
 * @param {Array} pages - Pages for this language
 * @param {Object} allPages - All pages by language { it: [...], en: [...] }
 * @returns {string} XML string
 */
function generateLanguageSitemap(lang, pages, allPages) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  for (const page of pages) {
    // page.path already includes language prefix for non-IT (e.g., 'en/src/pages/...')
    const url = getUrlForPath(page.path);

    xml += '  <url>\n';
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;

    // Add hreflang alternates for all languages
    for (const altLang of LANGUAGES) {
      const altPath = getEquivalentPath(page.path, lang, altLang);
      const altUrl = getUrlForPath(altPath);

      // Check if alternate page exists
      const altPages = allPages[altLang] || [];
      const altExists = altPages.some(p => p.path === altPath);

      if (altExists || altLang === lang) {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>\n`;
      }
    }

    // Add x-default pointing to Italian (default language)
    const defaultPath = getEquivalentPath(page.path, lang, 'it');
    const defaultUrl = getUrlForPath(defaultPath);
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>\n`;

    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return xml;
}

/**
 * Main build function
 */
async function build() {
  console.log('🗺️  SOS Permesso - Multilingual Sitemap Builder');
  console.log('================================================\n');

  // Collect pages for all languages
  console.log('📥 Scanning HTML files by language...\n');

  const allPages = {};
  let totalPages = 0;

  for (const lang of LANGUAGES) {
    const pages = await getPagesForLanguage(lang);
    allPages[lang] = pages;
    console.log(`   ${lang.toUpperCase()}: ${pages.length} pages`);
    totalPages += pages.length;
  }

  console.log(`\n   Total: ${totalPages} pages across ${LANGUAGES.length} languages`);

  // Generate sitemap index
  console.log('\n📝 Generating sitemap-index.xml...');
  const indexXml = generateSitemapIndex();
  await fs.writeFile(path.join(ROOT_DIR, 'sitemap-index.xml'), indexXml, 'utf-8');
  console.log('   ✓ sitemap-index.xml');

  // Generate per-language sitemaps
  console.log('\n📝 Generating language sitemaps with hreflang...');

  for (const lang of LANGUAGES) {
    const pages = allPages[lang];
    const sitemapXml = generateLanguageSitemap(lang, pages, allPages);
    const filename = `sitemap-${lang}.xml`;
    await fs.writeFile(path.join(ROOT_DIR, filename), sitemapXml, 'utf-8');
    console.log(`   ✓ ${filename} (${pages.length} URLs)`);
  }

  // Summary
  console.log('\n================================================');
  console.log(`✅ Generated sitemap index with ${LANGUAGES.length} language sitemaps`);
  console.log(`   Total URLs: ${totalPages}`);
  console.log('\n📁 Output files:');
  console.log('   - sitemap-index.xml (master sitemap)');
  for (const lang of LANGUAGES) {
    console.log(`   - sitemap-${lang}.xml (${allPages[lang].length} URLs with hreflang)`);
  }
  console.log('');

  return { totalPages, languages: LANGUAGES.length };
}

// Run build
build().catch(err => {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
});
