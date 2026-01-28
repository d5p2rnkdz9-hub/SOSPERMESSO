/**
 * Notion API client for fetching permit document data
 * Database ID: 1ad7355e-7f7f-8088-a065-e814c92e2cfd
 */
const { Client } = require("@notionhq/client");
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = "1ad7355e-7f7f-8088-a065-e814c92e2cfd";

/**
 * Generate URL-friendly slug from permit name
 * @param {string} name - Permit name in Italian
 * @returns {string} Slugified name
 */
function slugify(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from ends
}

/**
 * Fetch all permit data from Notion database
 * @returns {Promise<Array>} Array of permit objects with document lists
 */
async function fetchPermitData() {
  // Use search API and filter by parent database ID
  // (workaround for dataSources.query permission issues)
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
    });

    // Filter pages that belong to our database
    const dbPages = response.results.filter(page =>
      page.parent?.database_id === DATABASE_ID ||
      page.parent?.data_source_id === DATABASE_ID
    );
    allPages.push(...dbPages);

    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allPages.map(page => {
    // Get permit name from title property "Nome permesso"
    const tipo = page.properties["Nome permesso"]?.title?.[0]?.plain_text || null;

    return {
      id: page.id,
      tipo,
      slug: slugify(tipo),
      primoDocuments: page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [],
      rinnovoDocuments: page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [],
      // Mod fields are multi_select, get first value
      primoMethod: page.properties["Mod primo rilascio"]?.multi_select?.[0]?.name || null,
      rinnovoMethod: page.properties["Mod rinnovo"]?.multi_select?.[0]?.name || null,
    };
  });
}

/**
 * Fetch all blocks (content) from a Notion page
 * Handles pagination and nested children
 * @param {string} pageId - Notion page ID
 * @returns {Promise<Array>} Array of block objects
 */
async function fetchPageBlocks(pageId) {
  const blocks = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  // Recursively fetch children for blocks that have them
  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchPageBlocks(block.id);
    }
  }

  return blocks;
}

/**
 * Test connection to Notion API
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
  try {
    // Try dataSources.retrieve first (v5+ API), fall back to databases.retrieve
    let response;
    try {
      response = await notion.dataSources.retrieve({
        database_id: DATABASE_ID
      });
    } catch (e) {
      response = await notion.databases.retrieve({
        database_id: DATABASE_ID
      });
    }
    console.log(`Connected to Notion database: ${response.title?.[0]?.plain_text || 'Untitled'}`);
    return true;
  } catch (error) {
    console.error(`Notion connection failed: ${error.message}`);
    return false;
  }
}

module.exports = { fetchPermitData, fetchPageBlocks, testConnection, DATABASE_ID };
