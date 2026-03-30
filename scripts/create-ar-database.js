#!/usr/bin/env node
/**
 * Create Arabic (AR) Notion database under the Traduzioni parent page.
 * Then populate it with translated permit pages.
 *
 * Usage:
 *   node scripts/create-ar-database.js                  # Create DB only
 *   node scripts/create-ar-database.js --populate       # Create DB + populate from translated JSON
 *   node scripts/create-ar-database.js --populate-only  # Populate existing DB (skip creation)
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const PARENT_PAGE_ID = '30b7355e-7f7f-8184-975d-fb18ca69875c'; // Traduzioni del Database
const TRANSLATED_JSON = path.join(__dirname, '..', '_cache', 'permits-ar-translated.json');
const NOTION_DELAY = 350;
const MAX_BLOCKS_PER_APPEND = 100;

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createDatabase(notion) {
  console.log('[AR] Creating AR database under Traduzioni parent...');

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ text: { content: 'AR - Permits Database' } }],
    properties: {
      'Name': { title: {} },
    },
  });

  const targetDbId = db.id;
  const targetDataSourceId = db.data_sources?.[0]?.id;
  console.log(`[AR] Created database: ${targetDbId}`);
  console.log(`[AR] Data source: ${targetDataSourceId}`);

  // Add custom properties
  if (targetDataSourceId) {
    await notion.dataSources.update({
      data_source_id: targetDataSourceId,
      properties: {
        'Doc primo rilascio': { multi_select: {} },
        'Doc rinnovo': { multi_select: {} },
        'Mod primo rilascio': { multi_select: {} },
        'Mod rinnovo': { multi_select: {} },
        'Info extra su doc rilascio/rinnovo': { rich_text: {} },
        'IT Page ID': { rich_text: {} },
      },
    });
    console.log('[AR] Added properties to data source');
  }

  // Save to .env
  const envPath = path.join(process.cwd(), '.env');
  fs.appendFileSync(envPath, `\nNOTION_DATABASE_AR_ID=${targetDbId}\n`);
  console.log(`[AR] Saved NOTION_DATABASE_AR_ID to .env`);

  return { targetDbId, targetDataSourceId };
}

/**
 * Convert a translated section to Notion blocks
 */
function sectionToBlocks(section) {
  const blocks = [];

  // Question as heading_3
  blocks.push({
    heading_3: {
      rich_text: [{ text: { content: section.question } }],
    },
  });

  // Answer as paragraphs (split by newlines for readability)
  if (section.answerPlain) {
    const paragraphs = section.answerPlain.split('\n').filter(p => p.trim());
    for (const para of paragraphs) {
      if (para.startsWith('- ') || para.startsWith('• ')) {
        blocks.push({
          bulleted_list_item: {
            rich_text: [{ text: { content: para.replace(/^[-•]\s*/, '') } }],
          },
        });
      } else {
        blocks.push({
          paragraph: {
            rich_text: [{ text: { content: para } }],
          },
        });
      }
    }
  }

  return blocks;
}

async function populateDatabase(notion, targetDbId, targetDataSourceId) {
  if (!fs.existsSync(TRANSLATED_JSON)) {
    console.error(`[AR] Translated JSON not found: ${TRANSLATED_JSON}`);
    console.error('[AR] Run the translation step first.');
    process.exit(1);
  }

  const permits = JSON.parse(fs.readFileSync(TRANSLATED_JSON, 'utf8'));
  console.log(`[AR] Populating ${permits.length} permits...`);

  for (let i = 0; i < permits.length; i++) {
    const permit = permits[i];
    console.log(`[AR] ${i + 1}/${permits.length}: ${permit.arName}`);

    // Build properties
    const properties = {
      'Name': { title: [{ text: { content: permit.arName } }] },
      'IT Page ID': { rich_text: [{ text: { content: permit.itPageId } }] },
    };

    // Copy doc fields from IT (these are not translated - they're Italian bureaucratic terms)
    if (permit.primoDocuments?.length) {
      properties['Doc primo rilascio'] = {
        multi_select: permit.primoDocuments.map(d => ({ name: d })),
      };
    }
    if (permit.rinnovoDocuments?.length) {
      properties['Doc rinnovo'] = {
        multi_select: permit.rinnovoDocuments.map(d => ({ name: d })),
      };
    }
    if (permit.primoMethod) {
      properties['Mod primo rilascio'] = {
        multi_select: [{ name: permit.primoMethod }],
      };
    }
    if (permit.rinnovoMethod) {
      properties['Mod rinnovo'] = {
        multi_select: [{ name: permit.rinnovoMethod }],
      };
    }

    // Create page
    await delay(NOTION_DELAY);
    const created = await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: targetDataSourceId },
      properties,
    });

    // Write content blocks
    if (permit.sections?.length) {
      const allBlocks = [];
      for (const section of permit.sections) {
        allBlocks.push(...sectionToBlocks(section));
      }

      // Write in batches
      for (let j = 0; j < allBlocks.length; j += MAX_BLOCKS_PER_APPEND) {
        const batch = allBlocks.slice(j, j + MAX_BLOCKS_PER_APPEND);
        await delay(NOTION_DELAY);
        await notion.blocks.children.append({
          block_id: created.id,
          children: batch,
        });
      }
    }
  }

  console.log(`[AR] Done! Populated ${permits.length} permits.`);
}

async function main() {
  const args = process.argv.slice(2);
  const populateOnly = args.includes('--populate-only');
  const populate = args.includes('--populate') || populateOnly;

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  let targetDbId, targetDataSourceId;

  if (!populateOnly) {
    const result = await createDatabase(notion);
    targetDbId = result.targetDbId;
    targetDataSourceId = result.targetDataSourceId;
  } else {
    // Read from env
    targetDbId = process.env.NOTION_DATABASE_AR_ID;
    if (!targetDbId) {
      console.error('[AR] NOTION_DATABASE_AR_ID not set in .env');
      process.exit(1);
    }
    const db = await notion.databases.retrieve({ database_id: targetDbId });
    targetDataSourceId = db.data_sources?.[0]?.id;
    console.log(`[AR] Using existing database: ${targetDbId} (ds: ${targetDataSourceId})`);
  }

  if (populate) {
    await populateDatabase(notion, targetDbId, targetDataSourceId);
  }

  console.log(`\n[AR] Database ID: ${targetDbId}`);
  console.log('[AR] Next steps:');
  if (!populate) {
    console.log('  1. Run translation to generate _cache/permits-ar-translated.json');
    console.log('  2. Run: node scripts/create-ar-database.js --populate-only');
  }
}

main().catch(err => {
  console.error('[AR] Error:', err.message);
  process.exit(1);
});
