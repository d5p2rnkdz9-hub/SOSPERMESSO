#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

const USER_DB = '1a27355e-7f7f-80cc-96ff-e9d109d7f8f9';
const CODE_DB = '3097355e-7f7f-819c-af33-d0fd0739cc5b';

async function fetchAllPages() {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;
  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
    });
    allPages.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }
  return allPages;
}

function getDbId(page) {
  return page.parent?.database_id || page.parent?.data_source_id || null;
}

async function main() {
  console.log('Fetching all pages...');
  const allPages = await fetchAllPages();
  console.log('Total pages found: ' + allPages.length);

  const userPages = allPages.filter(p => getDbId(p) === USER_DB);
  const codePages = allPages.filter(p => getDbId(p) === CODE_DB);

  function getName(p) {
    return p.properties['Nome permesso']?.title?.[0]?.plain_text || '[no name]';
  }

  const userNames = userPages.map(getName).sort();
  const codeNames = codePages.map(getName).sort();

  console.log('\n=== YOUR DATABASE ===');
  console.log('ID: ' + USER_DB);
  console.log('Total: ' + userNames.length);
  userNames.forEach(n => console.log('  - ' + n));

  console.log('\n=== CODE DATABASE ===');
  console.log('ID: ' + CODE_DB);
  console.log('Total: ' + codeNames.length);
  codeNames.forEach(n => console.log('  - ' + n));

  const onlyInUser = userNames.filter(n => codeNames.indexOf(n) === -1);
  const onlyInCode = codeNames.filter(n => userNames.indexOf(n) === -1);

  console.log('\n=== DIFFERENCES ===');
  console.log('Only in YOUR DB (' + onlyInUser.length + '):');
  onlyInUser.forEach(n => console.log('  + ' + n));
  console.log('Only in CODE DB (' + onlyInCode.length + '):');
  onlyInCode.forEach(n => console.log('  - ' + n));

  // Also check: are they maybe the same DB with different IDs?
  console.log('\n=== DB ID CHECK ===');
  const allDbIds = [...new Set(allPages.map(getDbId).filter(Boolean))];
  console.log('All unique database IDs found:');
  allDbIds.forEach(id => {
    const count = allPages.filter(p => getDbId(p) === id).length;
    console.log('  ' + id + ' (' + count + ' pages)');
  });
}
main().catch(e => console.error(e));
