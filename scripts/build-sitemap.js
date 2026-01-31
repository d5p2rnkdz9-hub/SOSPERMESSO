/**
 * Build script for generating sitemap.xml
 * Scans all HTML files and creates sitemap with lastmod dates
 */
const fs = require('fs/promises');
const path = require('path');
const xml = require('xml');

const SITE_URL = 'https://sospermesso.it';
const OUTPUT_FILE = path.join(__dirname, '../sitemap.xml');

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
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      const subFiles = await findHtmlFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // Exclude 404.html
      if (entry.name === '404.html') {
        continue;
      }

      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Convert file path to URL
 */
function filePathToUrl(filePath, rootDir) {
  const relativePath = path.relative(rootDir, filePath);
  return `${SITE_URL}/${relativePath.replace(/\\/g, '/')}`;
}

/**
 * Main build function
 */
async function build() {
  console.log('🗺️  SOS Permesso - Sitemap Builder');
  console.log('=====================================\n');

  const rootDir = path.join(__dirname, '..');
  const pagesDir = path.join(rootDir, 'src/pages');

  console.log('📥 Scanning HTML files...\n');

  // Collect all HTML files
  const allFiles = [];

  // Add root index.html
  const rootIndex = path.join(rootDir, 'index.html');
  try {
    await fs.access(rootIndex);
    allFiles.push(rootIndex);
  } catch {
    console.log('   ⚠️  Root index.html not found');
  }

  // Add all files from src/pages
  try {
    const pageFiles = await findHtmlFiles(pagesDir, rootDir);
    allFiles.push(...pageFiles);
  } catch (err) {
    console.log(`   ⚠️  Could not scan src/pages: ${err.message}`);
  }

  console.log(`   Found ${allFiles.length} HTML files`);

  // Filter out redirects
  console.log('\n🔍 Checking for redirect pages...\n');

  const urls = [];
  let redirectCount = 0;

  for (const filePath of allFiles) {
    const isRedirectPage = await isRedirect(filePath);

    if (isRedirectPage) {
      redirectCount++;
      const relativePath = path.relative(rootDir, filePath);
      console.log(`   ⤷ Excluded: ${relativePath} (redirect)`);
      continue;
    }

    // Get file stats for lastmod
    const stats = await fs.stat(filePath);
    const lastmod = stats.mtime.toISOString().split('T')[0];
    const url = filePathToUrl(filePath, rootDir);

    urls.push({ url, lastmod });
  }

  console.log(`\n   Excluded ${redirectCount} redirect pages`);
  console.log(`   Included ${urls.length} pages in sitemap`);

  // Build XML structure
  console.log('\n📝 Generating sitemap.xml...\n');

  const urlElements = urls.map(({ url, lastmod }) => ({
    url: [
      { loc: url },
      { lastmod: lastmod }
    ]
  }));

  const sitemapXml = xml({
    urlset: [
      {
        _attr: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
        }
      },
      ...urlElements
    ]
  }, { declaration: true, indent: '  ' });

  // Write sitemap file
  await fs.writeFile(OUTPUT_FILE, sitemapXml, 'utf-8');

  console.log('=====================================');
  console.log(`✅ Generated sitemap with ${urls.length} URLs`);
  console.log(`   - ${urls.length - redirectCount} content pages`);
  console.log(`   - ${redirectCount} redirects excluded`);
  console.log('\n📁 Output file: ' + OUTPUT_FILE);
  console.log('');

  return { totalPages: urls.length, redirectCount };
}

// Run build
build().catch(err => {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
});
