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
 * @param {string} [lang] - Language code ('it', 'en', 'fr'). Defaults to 'it'.
 *   EN/FR pages use absolute path (/dizionario.html) since they're served from /en/ or /fr/.
 *   IT pages use relative path (dizionario.html) since they're at root level.
 * @returns {string} HTML string with terms linked to dizionario
 */
function linkToDizionario(documentName, lang) {
  if (!lang) lang = 'it';  // Internal calls without lang default to IT
  if (!documentName) return '';

  // Determine dizionario URL base based on language
  // EN/FR pages are at /en/ or /fr/ prefix, so need absolute path to reach root dizionario
  const dizionarioBase = (lang === 'en' || lang === 'fr')
    ? '/dizionario.html'
    : 'dizionario.html';

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
    const link = `<a href="${dizionarioBase}#${r.anchorId}" class="doc-link">${escapeHtml(r.original)}</a>`;
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

/**
 * Parse document notes from Notion into Q&A sections
 * Notes format: Question?\n• bullet\n• bullet\n\nQuestion?\n...
 * @param {string} notesText - Raw notes text from Notion
 * @returns {Array<{question: string, content: string}>} Parsed sections
 */
function parseDocNotes(notesText) {
  if (!notesText || typeof notesText !== 'string') return [];

  const sections = [];

  // First, extract questions that might be embedded in lines
  // Look for pattern: "...text...Quali/Come/Devo/Posso...?"
  // Note: "Ricorda" removed because it's typically a reminder statement, not a question
  const questionPattern = /(Quali|Come|Devo|Posso|Cosa|Quanto)[^?]+\?/g;
  const allQuestions = [];
  let match;
  while ((match = questionPattern.exec(notesText)) !== null) {
    allQuestions.push({
      question: match[0].trim(),
      index: match.index
    });
  }

  // For each question, extract content until the next question
  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    const nextQ = allQuestions[i + 1];

    // Get content between this question and the next (or end of text)
    const startIdx = q.index + q.question.length;
    const endIdx = nextQ ? nextQ.index : notesText.length;
    const contentText = notesText.substring(startIdx, endIdx).trim();

    // Parse content lines
    const contentLines = contentText.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.includes('blocks deleted') && !l.startsWith('Moved ') && !l.startsWith('Stesso database'));

    if (contentLines.length > 0) {
      sections.push({
        question: q.question,
        content: formatNotesContent(contentLines)
      });
    }
  }

  return sections;
}

/**
 * Format notes content lines into HTML
 * @param {Array<string>} lines - Content lines
 * @returns {string} HTML formatted content
 */
function formatNotesContent(lines) {
  if (!lines || lines.length === 0) return '';

  const bulletLines = [];
  const introText = [];  // Text before bullets (e.g., "Sì, devi:")
  const afterText = [];  // Text after bullets (e.g., "Ricorda che...")

  let foundFirstBullet = false;
  let foundLastBullet = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if it's a bullet point (starts with •, -, *, or similar)
    if (/^[•\-\*]\s*/.test(trimmed)) {
      const content = trimmed.replace(/^[•\-\*]\s*/, '').trim();
      if (content) {
        bulletLines.push(content);
        foundFirstBullet = true;
        foundLastBullet = true;
      }
    } else {
      // It's a text line
      if (!foundFirstBullet) {
        // Text before any bullets - only keep if meaningful (starts with "Sì," or similar)
        if (/^(Sì|Si|In Questura)/i.test(trimmed)) {
          introText.push(trimmed);
        }
      } else if (foundLastBullet) {
        // Text after bullets - keep important reminders
        if (/^(Ricorda|Nota|Attenzione|Se passa)/i.test(trimmed)) {
          afterText.push(trimmed);
        }
        foundLastBullet = false; // Reset to track if more bullets come
      }
    }
  }

  let html = '';

  // Add intro text first (e.g., "Sì, devi:")
  for (const text of introText) {
    html += `<p>${escapeHtml(text)}</p>`;
  }

  // Add bullet list if any
  if (bulletLines.length > 0) {
    html += '<ul>';
    for (const bullet of bulletLines) {
      html += `<li>${linkToDizionario(bullet)}</li>`;
    }
    html += '</ul>';
  }

  // Add after-text (e.g., "Ricorda che...")
  for (const text of afterText) {
    html += `<p class="note-reminder"><em>${escapeHtml(text)}</em></p>`;
  }

  return html;
}

module.exports = {
  linkToDizionario,
  getDocumentClass,
  isDisputed,
  escapeHtml,
  normalizeDocumentName,
  parseDocNotes,
  DISPUTED_DOCUMENTS
};
