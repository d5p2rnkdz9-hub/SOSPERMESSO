#!/usr/bin/env node
/**
 * Remove duplicate pages from UR/FA/ZH Notion databases.
 * Keeps the page with more content (more blocks), archives the other.
 *
 * Usage: node scripts/cleanup-notion-dupes.js
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');

const DATABASES = {
  ur: '42ef74d0-62cf-4c3e-b5d8-eafd4b2155b8',
  fa: 'e350cb8e-515c-45f6-8c72-13175ab574d1',
  zh: 'e78a1d6a-a450-48ec-98dc-459f8a90ca32',
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllPages(notion, dbId) {
  const allPages = [];
  let hasMore = true;
  let startCursor;
  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100,
    });
    const dbPages = response.results.filter(page =>
      (page.parent?.database_id === dbId || page.parent?.data_source_id === dbId) &&
      !page.archived
    );
    allPages.push(...dbPages);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }
  return allPages;
}

async function countBlocks(notion, pageId) {
  try {
    const response = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
    return response.results.length;
  } catch { return 0; }
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  let totalArchived = 0;

  for (const [lang, dbId] of Object.entries(DATABASES)) {
    console.log(`\n=== ${lang.toUpperCase()} ===`);
    const pages = await fetchAllPages(notion, dbId);
    console.log(`Found ${pages.length} pages`);

    // Group by IT Page ID
    const groups = {};
    for (const page of pages) {
      const itPageId = (page.properties?.['IT Page ID']?.rich_text || [])
        .map(s => s.plain_text).join('');
      if (!itPageId) continue;
      if (!groups[itPageId]) groups[itPageId] = [];
      groups[itPageId].push(page);
    }

    const dupes = Object.entries(groups).filter(([, pages]) => pages.length > 1);
    console.log(`Found ${dupes.length} duplicate groups`);

    for (const [itPageId, dupePages] of dupes) {
      // Count blocks for each duplicate
      const withCounts = [];
      for (const page of dupePages) {
        await delay(200);
        const blockCount = await countBlocks(notion, page.id);
        withCounts.push({ page, blockCount });
      }

      // Sort by block count descending — keep the one with most content
      withCounts.sort((a, b) => b.blockCount - a.blockCount);
      const keep = withCounts[0];
      const title = keep.page.properties?.Name?.title?.[0]?.plain_text || 'unknown';

      for (let i = 1; i < withCounts.length; i++) {
        const toArchive = withCounts[i];
        await delay(350);
        await notion.pages.update({ page_id: toArchive.page.id, archived: true });
        console.log(`  Archived duplicate: "${title}" (${toArchive.blockCount} blocks, kept ${keep.blockCount})`);
        totalArchived++;
      }
    }
  }

  console.log(`\nDone! Archived ${totalArchived} duplicate pages`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
