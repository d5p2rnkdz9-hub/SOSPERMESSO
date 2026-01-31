/**
 * Helper functions for document page templates
 * Provides dizionario linking and disputed document detection
 */

const dizionarioMap = require('./dizionario-map.json');

// List of disputed documents that may vary by Questura
// These documents are sometimes required, sometimes not, depending on the specific Questura
// Note: This list can be expanded based on user feedback or future Notion field
const DISPUTED_DOCUMENTS = [
  // Add known disputed documents here as they are identified
  // Example: "Certificato di residenza" if it varies by Questura
];

/**
 * Find dizionario terms within text and wrap them in links
 * Searches for partial matches (terms contained within the document name)
 * @param {string} documentName - Document name from Notion
 * @returns {string} HTML string with terms linked to dizionario
 */
function linkToDizionario(documentName) {
  if (!documentName) return '';

  // Sort terms by length (longest first) to match longer phrases before shorter ones
  const terms = Object.keys(dizionarioMap).sort((a, b) => b.length - a.length);

  let result = documentName;
  const replacements = [];

  // Find all matching terms and their positions
  for (const term of terms) {
    // Case-insensitive search with word boundaries to avoid partial matches
    // e.g., "Minore" should not match inside "Minorenni"
    const regex = new RegExp(`\\b(${escapeRegex(term)})\\b`, 'gi');
    let match;
    while ((match = regex.exec(documentName)) !== null) {
      // Check if this position overlaps with an existing replacement
      const start = match.index;
      const end = start + match[1].length;
      const overlaps = replacements.some(r =>
        (start >= r.start && start < r.end) || (end > r.start && end <= r.end)
      );
      if (!overlaps) {
        replacements.push({
          start,
          end,
          original: match[1],
          anchorId: dizionarioMap[term]
        });
      }
    }
  }

  // Sort replacements by position (reverse order for safe replacement)
  replacements.sort((a, b) => b.start - a.start);

  // Apply replacements
  for (const r of replacements) {
    const before = result.slice(0, r.start);
    const after = result.slice(r.end);
    const link = `<a href="dizionario.html#${r.anchorId}" class="doc-link">${escapeHtml(r.original)}</a>`;
    result = before + link + after;
  }

  // Escape any remaining unlinked text
  // We need to be careful not to double-escape the HTML we just added
  if (replacements.length === 0) {
    return escapeHtml(documentName);
  }

  return result;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get CSS class for document item based on certainty
 * @param {string} documentName - Document name
 * @returns {string} CSS class string
 */
function getDocumentClass(documentName) {
  if (DISPUTED_DOCUMENTS.includes(documentName)) {
    return 'doc-item doc-disputed';
  }
  return 'doc-item';
}

/**
 * Check if document is disputed (varies by Questura)
 * @param {string} documentName - Document name
 * @returns {boolean}
 */
function isDisputed(documentName) {
  return DISPUTED_DOCUMENTS.includes(documentName);
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Normalize document name: capitalize first letter, fix spacing issues
 * Handles edge cases like "4fototessere" → "4 fototessere"
 * @param {string} documentName - Raw document name from Notion
 * @returns {string} Normalized document name
 */
function normalizeDocumentName(documentName) {
  if (!documentName) return '';

  let normalized = documentName.trim();

  // Fix "4fototessere" → "4 fototessere" (number stuck to word)
  normalized = normalized.replace(/^(\d+)([a-zA-Z])/, '$1 $2');

  // Fix double spaces
  normalized = normalized.replace(/\s+/g, ' ');

  // Capitalize first letter (handle numbers at start)
  normalized = normalized.replace(/^(\d*\s*)([a-z])/, (match, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });

  // If still starts with lowercase (no number prefix), capitalize
  if (/^[a-z]/.test(normalized)) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  return normalized;
}

module.exports = {
  linkToDizionario,
  getDocumentClass,
  isDisputed,
  escapeHtml,
  normalizeDocumentName,
  DISPUTED_DOCUMENTS
};
