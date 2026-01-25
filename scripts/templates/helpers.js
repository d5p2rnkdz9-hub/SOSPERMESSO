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
 * Wrap document name in link to dizionario if term exists
 * @param {string} documentName - Document name from Notion
 * @returns {string} HTML string, either linked or plain text
 */
function linkToDizionario(documentName) {
  if (!documentName) return '';

  const anchorId = dizionarioMap[documentName];
  if (anchorId) {
    return `<a href="dizionario.html#${anchorId}" class="doc-link">${escapeHtml(documentName)}</a>`;
  }
  return escapeHtml(documentName);
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

module.exports = {
  linkToDizionario,
  getDocumentClass,
  isDisputed,
  escapeHtml,
  DISPUTED_DOCUMENTS
};
