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

  // Summary
  console.log('\n========================================');
  console.log(`✅ Generated ${primoCount + rinnovoCount} document pages`);
  console.log(`   - ${primoCount} primo rilascio pages`);
  console.log(`   - ${rinnovoCount} rinnovo pages`);

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

  return { generated, skipped, primoCount, rinnovoCount };
}

// Run build
build().catch(err => {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
});
