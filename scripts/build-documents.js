/**
 * Build script for generating document pages from Notion
 * Full implementation in 02-02-PLAN.md
 */
const { fetchPermitData, testConnection } = require('./notion-client.js');

async function build() {
  console.log('SOS Permesso - Document Page Builder');
  console.log('----------------------------------------');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('Skipping build - Notion not configured');
    console.log('Set NOTION_API_KEY in environment variables');
    process.exit(0); // Exit gracefully to not fail build
  }

  // Fetch data (template generation comes in Plan 02)
  const permits = await fetchPermitData();
  console.log(`Found ${permits.length} permit types`);

  // Placeholder for template generation
  console.log('Template generation will be added in next plan...');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
