/**
 * AR (Arabic) translation glossary for review-translations.js
 *
 * register: Arabic doesn't have a formal/informal pronoun split like Turkish.
 *           The site uses أنت (anta/anti) forms — no register check needed.
 * badTerms: known wrong translations { wrong, correct, source }.
 * preservedTerms: Italian/bureaucratic terms that must NOT be translated.
 * artifactPatterns: additional regex patterns beyond the global defaults.
 */

module.exports = {
  // Arabic doesn't distinguish formal/informal pronouns like European languages.
  // No register check needed.
  register: null,

  badTerms: [
    {
      wrong: 'مرسوم التدفقات',
      correct: 'Decreto Flussi',
      source: 'Decreto Flussi',
      note: 'literal translation of decree name — must keep Italian proper name',
    },
    {
      wrong: 'مكتب الشرطة',
      correct: 'Questura',
      source: 'Questura',
      note: 'Questura must be preserved as Italian term',
      preservedViolation: true,
    },
    {
      wrong: 'مكتب المحافظة',
      correct: 'Prefettura',
      source: 'Prefettura',
      note: 'Prefettura must be preserved as Italian term',
      preservedViolation: true,
    },
    {
      wrong: 'الطابع المالي',
      correct: 'marca da bollo',
      source: 'marca da bollo',
      note: 'Italian bureaucratic term should be preserved',
    },
    {
      wrong: 'الحوالة البريدية',
      correct: 'bollettino postale',
      source: 'bollettino postale',
      note: 'Italian bureaucratic term should be preserved',
    },
    {
      wrong: 'النافذة الواحدة',
      correct: 'Sportello Unico',
      source: 'Sportello Unico',
      note: 'Italian institutional name must be preserved',
      preservedViolation: true,
    },
    {
      wrong: 'تصريح عدم ممانعة',
      correct: 'Nulla Osta',
      source: 'Nulla Osta',
      note: 'Italian legal term must be preserved',
      preservedViolation: true,
    },
    {
      wrong: 'طقم البريد',
      correct: 'Kit Postale',
      source: 'Kit Postale',
      note: 'Italian term must be preserved — "طقم البريد" is a back-translation',
      preservedViolation: true,
    },
    {
      wrong: 'اللجنة الإقليمية',
      correct: 'Commissione Territoriale',
      source: 'Commissione Territoriale',
      note: 'Italian institutional name must be preserved',
      preservedViolation: true,
    },
  ],

  // These Italian/bureaucratic terms should appear verbatim in the translation.
  preservedTerms: [
    'Questura',
    'Prefettura',
    'Questore',
    'Commissione Territoriale',
    'Nulla Osta',
    'Decreto Flussi',
    'Kit Postale',
    'Kit postale',
    'C3',
    'Sportello Unico',
    'Codice Fiscale',
    'SSN',
    'INPS',
    'INAIL',
    'Poste Italiane',
    'Permesso di Soggiorno',
    'Carta di Soggiorno',
  ],

  // Arabic-specific incomplete sentence patterns.
  incompleteSentencePatterns: [
    {
      re: /[،,]\s*\.$/gm,
      label: 'sentence ends with comma then period — likely truncated',
    },
  ],

  // Arabic-specific artifact patterns.
  artifactPatterns: [
    {
      re: /[\u0660-\u0669]/g,
      label: 'Arabic-Indic numeral found — site uses Western numerals (0-9)',
    },
  ],
};
