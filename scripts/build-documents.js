/**
 * Build script for generating document pages from Notion
 * Generates primo rilascio and rinnovo pages for each permit type
 */
const fs = require('fs/promises');
const path = require('path');
const { fetchPermitData, testConnection } = require('./notion-client.js');
const { generatePrimoPage } = require('./templates/primo.js');
const { generateRinnovoPage } = require('./templates/rinnovo.js');

const OUTPUT_DIR = path.join(__dirname, '../src/pages');

/**
 * Generate redirect page HTML
 * Creates meta refresh redirect from display slug to canonical slug
 */
function generateRedirectPage(displaySlug, canonicalSlug, type) {
  const targetFile = `documenti-${canonicalSlug}-${type}.html`;
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${targetFile}">
  <link rel="canonical" href="${targetFile}">
  <title>Redirecting...</title>
</head>
<body>
  <p>Reindirizzamento in corso...</p>
  <script>window.location.replace("${targetFile}");</script>
</body>
</html>`;
}

/**
 * Generate alias/redirect pages for display slugs
 * Loads slug-map.json and creates redirect pages for simplified URLs
 */
async function generateAliasPages() {
  console.log('\n🔗 Generating alias redirect pages...\n');

  const slugMapPath = path.join(__dirname, 'slug-map.json');
  let slugMap;

  try {
    const mapContent = await fs.readFile(slugMapPath, 'utf-8');
    slugMap = JSON.parse(mapContent);
  } catch (err) {
    console.log('   ℹ️  No slug-map.json found, skipping alias generation');
    return { redirectCount: 0, skipped: [] };
  }

  let redirectCount = 0;
  const skipped = [];

  for (const [displaySlug, canonicalSlug] of Object.entries(slugMap.mappings)) {
    // Check if canonical primo exists (required)
    const canonicalPrimoFile = path.join(OUTPUT_DIR, `documenti-${canonicalSlug}-primo.html`);
    const canonicalRinnovoFile = path.join(OUTPUT_DIR, `documenti-${canonicalSlug}-rinnovo.html`);

    try {
      await fs.access(canonicalPrimoFile);
    } catch {
      console.log(`   ⚠️  Skipping ${displaySlug}: canonical primo not found (${canonicalSlug})`);
      skipped.push({ displaySlug, reason: 'Canonical primo not found' });
      continue;
    }

    // Generate primo redirect (always)
    const primoRedirectPath = path.join(OUTPUT_DIR, `documenti-${displaySlug}-primo.html`);

    // Check if display slug file already exists (don't overwrite canonical pages)
    try {
      const existingStat = await fs.stat(primoRedirectPath);
      const existingContent = await fs.readFile(primoRedirectPath, 'utf-8');

      // If it's already a redirect or doesn't contain full document structure, it's safe to overwrite
      if (!existingContent.includes('meta http-equiv="refresh"') && existingContent.length > 1000) {
        console.log(`   ⚠️  Skipping ${displaySlug}-primo: canonical page exists, won't overwrite`);
        skipped.push({ displaySlug: displaySlug + '-primo', reason: 'Canonical page exists' });
        continue;
      }
    } catch {
      // File doesn't exist, safe to create
    }

    const primoHtml = generateRedirectPage(displaySlug, canonicalSlug, 'primo');
    await fs.writeFile(primoRedirectPath, primoHtml, 'utf-8');
    console.log(`   ✓ documenti-${displaySlug}-primo.html -> documenti-${canonicalSlug}-primo.html`);
    redirectCount++;

    // Generate rinnovo redirect if canonical rinnovo exists
    try {
      await fs.access(canonicalRinnovoFile);

      const rinnovoRedirectPath = path.join(OUTPUT_DIR, `documenti-${displaySlug}-rinnovo.html`);

      // Same check for rinnovo
      try {
        const existingStat = await fs.stat(rinnovoRedirectPath);
        const existingContent = await fs.readFile(rinnovoRedirectPath, 'utf-8');

        if (!existingContent.includes('meta http-equiv="refresh"') && existingContent.length > 1000) {
          console.log(`   ⚠️  Skipping ${displaySlug}-rinnovo: canonical page exists, won't overwrite`);
          skipped.push({ displaySlug: displaySlug + '-rinnovo', reason: 'Canonical page exists' });
          continue;
        }
      } catch {
        // File doesn't exist, safe to create
      }

      const rinnovoHtml = generateRedirectPage(displaySlug, canonicalSlug, 'rinnovo');
      await fs.writeFile(rinnovoRedirectPath, rinnovoHtml, 'utf-8');
      console.log(`   ✓ documenti-${displaySlug}-rinnovo.html -> documenti-${canonicalSlug}-rinnovo.html`);
      redirectCount++;
    } catch {
      // Canonical rinnovo doesn't exist, skip rinnovo redirect
      console.log(`   ℹ️  No rinnovo redirect for ${displaySlug} (canonical rinnovo not found)`);
    }
  }

  console.log(`\n   Generated ${redirectCount} redirect pages for URL aliasing`);

  return { redirectCount, skipped };
}

/**
 * Main build function
 * Fetches permit data from Notion and generates HTML pages
 */
async function build() {
  console.log('📄 SOS Permesso - Document Page Builder');
  console.log('========================================\n');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Skipping build - Notion not configured');
    console.log('   Set NOTION_API_KEY in environment variables');
    console.log('   See .env.example for setup instructions\n');
    process.exit(0); // Exit gracefully to not fail build
  }

  // Fetch data from Notion
  console.log('\n📥 Fetching permit data from Notion...');
  const permits = await fetchPermitData();
  console.log(`   Found ${permits.length} permit types\n`);

  if (permits.length === 0) {
    console.log('⚠️  No permit data found in Notion database');
    console.log('   Make sure the database has entries with Tipo, Slug, and document lists\n');
    process.exit(0);
  }

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let primoCount = 0;
  let rinnovoCount = 0;
  const skipped = [];
  const generated = [];

  console.log('📝 Generating document pages...\n');

  for (const permit of permits) {
    // Skip permits without slug
    if (!permit.slug) {
      skipped.push({ tipo: permit.tipo || 'Unknown', reason: 'No slug defined' });
      continue;
    }

    // Generate primo page if documents exist
    if (permit.primoDocuments && permit.primoDocuments.length > 0) {
      try {
        const html = generatePrimoPage(permit);
        const filename = `documenti-${permit.slug}-primo.html`;
        await fs.writeFile(path.join(OUTPUT_DIR, filename), html, 'utf-8');
        console.log(`   ✓ ${filename} (${permit.primoDocuments.length} documenti)`);
        generated.push(filename);
        primoCount++;
      } catch (err) {
        console.error(`   ✗ Failed to generate primo page for ${permit.tipo}: ${err.message}`);
        skipped.push({ tipo: permit.tipo, reason: `Primo error: ${err.message}` });
      }
    } else {
      skipped.push({ tipo: permit.tipo || permit.slug, reason: 'No primo documents' });
    }

    // Generate rinnovo page if documents exist
    if (permit.rinnovoDocuments && permit.rinnovoDocuments.length > 0) {
      try {
        const html = generateRinnovoPage(permit);
        const filename = `documenti-${permit.slug}-rinnovo.html`;
        await fs.writeFile(path.join(OUTPUT_DIR, filename), html, 'utf-8');
        console.log(`   ✓ ${filename} (${permit.rinnovoDocuments.length} documenti)`);
        generated.push(filename);
        rinnovoCount++;
      } catch (err) {
        console.error(`   ✗ Failed to generate rinnovo page for ${permit.tipo}: ${err.message}`);
        skipped.push({ tipo: permit.tipo, reason: `Rinnovo error: ${err.message}` });
      }
    } else {
      skipped.push({ tipo: permit.tipo || permit.slug, reason: 'No rinnovo documents' });
    }
  }

  // Generate alias/redirect pages
  const aliasResult = await generateAliasPages();

  // Summary
  console.log('\n========================================');
  console.log(`✅ Generated ${primoCount + rinnovoCount} document pages`);
  console.log(`   - ${primoCount} primo rilascio pages`);
  console.log(`   - ${rinnovoCount} rinnovo pages`);
  console.log(`   - ${aliasResult.redirectCount} redirect pages for URL aliasing`);

  if (skipped.length > 0) {
    console.log(`\n⚠️  Skipped ${skipped.length} items:`);
    // Group by reason for cleaner output
    const byReason = {};
    skipped.forEach(s => {
      if (!byReason[s.reason]) byReason[s.reason] = [];
      byReason[s.reason].push(s.tipo);
    });
    Object.entries(byReason).forEach(([reason, tipos]) => {
      console.log(`   ${reason}:`);
      tipos.forEach(t => console.log(`     - ${t}`));
    });
  }

  console.log('\n📁 Output directory: ' + OUTPUT_DIR);
  console.log('');

  return { generated, skipped, primoCount, rinnovoCount, redirectCount: aliasResult.redirectCount };
}

// Run build
build().catch(err => {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
});
