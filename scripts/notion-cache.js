/**
 * Notion API Response Cache Module
 * Stores Notion block responses locally to skip re-fetching unchanged pages
 *
 * Cache structure:
 *   .notion-cache/
 *     pages.json          — index mapping pageId -> { last_edited_time, fetchedAt }
 *     blocks/
 *       {pageId}.json     — block array for that page
 */
const fs = require('fs/promises');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), '.notion-cache');
const PAGES_INDEX_PATH = path.join(CACHE_DIR, 'pages.json');
const BLOCKS_DIR = path.join(CACHE_DIR, 'blocks');

/**
 * Load the pages index from disk
 * @returns {Promise<Object>} Index mapping pageId -> { last_edited_time, fetchedAt }
 */
async function loadPagesIndex() {
  try {
    const data = await fs.readFile(PAGES_INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save the pages index to disk
 * @param {Object} index - Index mapping pageId -> { last_edited_time, fetchedAt }
 */
async function savePagesIndex(index) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(PAGES_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * Get cached blocks for a page
 * @param {string} pageId - Notion page ID
 * @returns {Promise<Array|null>} Cached block array or null if not found
 */
async function getBlocks(pageId) {
  const filePath = path.join(BLOCKS_DIR, `${pageId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Save blocks for a page to cache
 * @param {string} pageId - Notion page ID
 * @param {Array} blocks - Block array to cache
 */
async function setBlocks(pageId, blocks) {
  await fs.mkdir(BLOCKS_DIR, { recursive: true });
  const filePath = path.join(BLOCKS_DIR, `${pageId}.json`);
  await fs.writeFile(filePath, JSON.stringify(blocks, null, 2), 'utf-8');
}

/**
 * Delete the entire cache directory
 */
async function clearCache() {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
    console.log('[notion-cache] Cache cleared');
  } catch (err) {
    console.error(`[notion-cache] Failed to clear cache: ${err.message}`);
  }
}

module.exports = {
  loadPagesIndex,
  savePagesIndex,
  getBlocks,
  setBlocks,
  clearCache,
  CACHE_DIR
};
