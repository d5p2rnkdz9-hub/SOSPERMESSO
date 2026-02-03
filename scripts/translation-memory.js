/**
 * Translation Memory Module
 * Stores translations keyed by content hash for reuse across builds
 */
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const MEMORY_DIR = path.join(__dirname, 'translation-memory');

/**
 * Load translation memory for language pair
 * @param {string} sourceLang - Source language code (e.g., 'it')
 * @param {string} targetLang - Target language code (e.g., 'en')
 * @returns {Promise<Object>} Translation memory object
 */
async function loadTranslationMemory(sourceLang, targetLang) {
  const filePath = path.join(MEMORY_DIR, `${sourceLang}-${targetLang}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save translation memory for language pair
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @param {Object} memory - Translation memory object
 */
async function saveTranslationMemory(sourceLang, targetLang, memory) {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
  const filePath = path.join(MEMORY_DIR, `${sourceLang}-${targetLang}.json`);
  await fs.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf-8');
}

/**
 * Get cached translation by source text
 * @param {string} sourceText - Source text to look up
 * @param {Object} memory - Translation memory object
 * @returns {string|null} Cached translation or null if not found
 */
function getTranslation(sourceText, memory) {
  const hash = crypto.createHash('md5').update(sourceText).digest('hex');
  return memory[hash]?.target || null;
}

/**
 * Store translation in memory
 * @param {string} sourceText - Original text
 * @param {string} targetText - Translated text
 * @param {Object} memory - Translation memory object
 */
function storeTranslation(sourceText, targetText, memory) {
  const hash = crypto.createHash('md5').update(sourceText).digest('hex');
  memory[hash] = {
    source: sourceText,
    target: targetText,
    sourceHash: hash,
    translatedAt: new Date().toISOString()
  };
}

/**
 * Get translation memory statistics
 * @param {Object} memory - Translation memory object
 * @returns {Object} Stats object with entries count, total chars, and estimated KB
 */
function getMemoryStats(memory) {
  const entries = Object.keys(memory).length;
  const totalChars = Object.values(memory).reduce((sum, entry) =>
    sum + (entry.source?.length || 0) + (entry.target?.length || 0), 0);
  return {
    entries,
    totalChars,
    estimatedKB: Math.round(totalChars / 1024)
  };
}

/**
 * Check if translation exists for source text
 * @param {string} sourceText - Source text to check
 * @param {Object} memory - Translation memory object
 * @returns {boolean} True if translation exists
 */
function hasTranslation(sourceText, memory) {
  const hash = crypto.createHash('md5').update(sourceText).digest('hex');
  return hash in memory;
}

/**
 * Get hash for source text (for external use)
 * @param {string} text - Text to hash
 * @returns {string} MD5 hash
 */
function getHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = {
  loadTranslationMemory,
  saveTranslationMemory,
  getTranslation,
  storeTranslation,
  getMemoryStats,
  hasTranslation,
  getHash,
  MEMORY_DIR
};
