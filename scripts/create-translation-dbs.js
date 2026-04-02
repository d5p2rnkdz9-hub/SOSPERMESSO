#!/usr/bin/env node
/**
 * Create Notion databases for new translation languages (UR, FA, ZH)
 * Creates empty databases with the correct schema under the Traduzioni parent page
 *
 * Usage: node scripts/create-translation-dbs.js
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const PARENT_PAGE_ID = '30b7355e-7f7f-8184-975d-fb18ca69875c';

const LANGUAGES = [
  { code: 'ur', title: 'UR - Permits Database', name: 'Urdu' },
  { code: 'fa', title: 'FA - Permits Database', name: 'Farsi' },
  { code: 'zh', title: 'ZH - Permits Database', name: 'Chinese (Simplified)' },
];

async function createDatabase(notion, lang) {
  console.log(`Creating ${lang.code.toUpperCase()} database...`);

  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
    title: [{ text: { content: lang.title } }],
    properties: {
      'Name': { title: {} },
    },
  });

  const targetDbId = db.id;
  const targetDataSourceId = db.data_sources?.[0]?.id;
  console.log(`  Created: ${targetDbId} (data source: ${targetDataSourceId})`);

  // Add properties to the data source
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
    console.log(`  Added properties to data source`);
  }

  return { dbId: targetDbId, dataSourceId: targetDataSourceId };
}

async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error('NOTION_API_KEY not set in .env');
    process.exit(1);
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const results = {};

  for (const lang of LANGUAGES) {
    try {
      const result = await createDatabase(notion, lang);
      results[lang.code] = result;
    } catch (err) {
      console.error(`Failed to create ${lang.code} database: ${err.message}`);
    }
  }

  console.log('\n=== Database IDs ===');
  for (const [code, { dbId }] of Object.entries(results)) {
    console.log(`${code.toUpperCase()}: ${dbId}`);
  }

  // Append to .env
  const envPath = path.join(process.cwd(), '.env');
  let envAppend = '';
  for (const [code, { dbId }] of Object.entries(results)) {
    envAppend += `\nNOTION_DATABASE_${code.toUpperCase()}_ID=${dbId}`;
  }
  fs.appendFileSync(envPath, envAppend + '\n');
  console.log('\nSaved to .env');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
