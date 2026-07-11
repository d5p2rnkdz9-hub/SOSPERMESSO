/**
 * Fix Notion internal links in permit page content.
 * Shared across all language data files.
 */

const { escapeHtml } = require('./templates/helpers.js');

// Static map for Notion internal page IDs that don't match current database IDs.
// These come from cross-page links added in Notion's editor (block-level IDs).
const NOTION_LINK_OVERRIDES = {
  '2187355e7f7f81d38a54d111fa27f45f': 'attesa-occupazione',
  '2187355e7f7f818b843df8b6a7fd30b7': 'minore-eta-per-msna',
  '2187355e7f7f819c8fc8fd2ef36a09d1': 'famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare',
  '2187355e7f7f81a3a444f6c6bd8a13ae': 'cure-mediche-dopo-ingresso-con-visto-per-cure-mediche',
  '2187355e7f7f81b6a119f485cc340e1c': 'studio-dopo-ingresso-con-visto',
  '2187355e7f7f81e48862e58bff4681dc': 'lavoro-subordinato-dopo-ingresso-con-visto-per-flussi',
  '20a7355e7f7f8173bffccbb2a93bae6f': 'lavoro-subordinato-dopo-ingresso-con-visto-per-flussi',
  '2967355e7f7f8006a790da7e5b938d1b': 'integrazione-prosieguo-amministrativo',
  '2187355e7f7f81e99a9fe39b1b1ffc62': null,  // "centro di assistenza legale" — not a permit
  '2187355e7f7f8148ac7efe618d4b0ae9': null,  // "certificato di idoneità alloggiativa" — not a permit
  '2187355e7f7f814989cbc7ee16321ee8': null,  // "guida" / "Centro di accoglienza" — not a permit
  '2187355e7f7f81198cd1c609d77bd25b': null,  // "abbia diritto" — not a permit
  '29a7355e7f7f80e197abfcb177f04f21': null,  // anchor fragment
  '2187355e7f7f81309acaea84e0903cf8': null,  // anchor fragment
};

// "Che documenti servono?" Q&A sections in Notion just link the standalone
// document pages — with pre-flattening slugs that 404 today. The permit
// template now has its own documents CTA + inline checklists, so these
// sections are dropped at build time in every language (they still exist in
// the Notion source and its translations). Matched by exact question text.
const DOC_SECTION_QUESTIONS = new Set([
  'che documenti servono?',              // it (left untranslated in some ru pages)
  'what documents are needed?',          // en
  'quels documents sont nécessaires ?',  // fr
  '¿qué documentos se necesitan?',       // es
  'hangi belgeler gerekli?',             // tr
  'কী কী কাগজপত্র লাগবে?',                    // bn
  'چه مدارکی لازم است؟',                   // fa
  'کون سی دستاویزات درکار ہیں؟',              // ur
  '需要什么文件？',                        // zh
]);

// NOTE: exact match on purpose — "📋 Che documenti servono?" (minore-eta-per-msna)
// is a real document LIST with info not yet in the permit's checklist fields,
// not the link box; it must survive until that content moves to Notion's Doc fields.
function isDocumentsSection(question) {
  const normalized = (question || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return DOC_SECTION_QUESTIONS.has(normalized);
}

// Old document-page slugs still referenced by Notion Q&A content (written
// before the flat slug scheme) and by translations made from it. Rewritten
// to the current slugs at build time so the links stop 404ing.
const STALE_DOC_SLUGS = {
  'lavoro-subordinato-a-seguito-di-ingresso-per-flussi': 'lavoro-subordinato-dopo-ingresso-con-visto-per-flussi',
  'cure-mediche-art-19-padre': 'cure-mediche-padre-di-bambino-minore-di-6-mesi-o-che-sta-per-nascere-in-italia',
  'cure-mediche-art-19-donna-in-stato-di-gravidanza': 'cure-mediche-donna-in-stato-di-gravidanza-o-con-figlio-minore-di-6-mesi',
  'cure-mediche-dopo-ingresso-con-visto-art-36': 'cure-mediche-dopo-ingresso-con-visto-per-cure-mediche',
  'apolidia-art-17-d-p-r-n-572-93': 'apolidia',
  'attivita-sportiva-art-27': 'attivita-sportiva',
  'ricerca-scientifica-art-27ter': 'ricerca-scientifica',
  'protezione-sociale-vittime-di-violenza-domestica-art-18-bis': 'protezione-sociale-vittime-di-violenza-domestica',
};

function fixStaleDocLinks(html) {
  if (!html || !html.includes('documenti-')) return html;
  return html.replace(/documenti-([a-z0-9-]+)-(primo|rinnovo)\.html/g, (match, slug, type) =>
    STALE_DOC_SLUGS[slug] ? `documenti-${STALE_DOC_SLUGS[slug]}-${type}.html` : match
  );
}

let notionIdToSlug = {};

/**
 * Build the ID → slug map from permits array + static overrides.
 * @param {Array} permits - Array of permit objects with id and slug
 */
function buildMap(permits) {
  notionIdToSlug = { ...NOTION_LINK_OVERRIDES };
  for (const p of permits) {
    if (p.id && p.slug) {
      const cleanId = p.id.replace(/-/g, '');
      notionIdToSlug[cleanId] = p.slug;
    }
  }
}

/**
 * Fix a single Notion href.
 * @param {string} href
 * @param {string} langPrefix - e.g. '' for IT, 'en/' for EN
 * @returns {string|null} Fixed URL, null to strip link, or original href
 */
function fixHref(href, langPrefix) {
  if (!href) return href;
  const idMatch = href.match(/([0-9a-f]{32})/);
  if (!idMatch) return href;
  const notionId = idMatch[1];
  if (!(notionId in notionIdToSlug)) return href;
  const slug = notionIdToSlug[notionId];
  if (slug === null) return null;
  const hashIdx = href.indexOf('#');
  const fragment = hashIdx !== -1 ? href.slice(hashIdx) : '';
  return `${langPrefix}permesso-${slug}.html${fragment}`;
}

/**
 * Fix Notion links in pre-rendered HTML.
 * @param {string} html
 * @param {string} langPrefix - e.g. '' for IT, 'en/' for EN
 * @returns {string}
 */
function fixLinksInHtml(html, langPrefix = '') {
  if (!html) return html;
  return html.replace(/<a href="([^"]*)">(.*?)<\/a>/g, (match, href, inner) => {
    const fixed = fixHref(href, langPrefix);
    if (fixed === null) return inner;
    if (fixed !== href) return `<a href="${escapeHtml(fixed)}">${inner}</a>`;
    return match;
  });
}

/**
 * Post-process an array of permits to fix all Notion links in sections.
 * @param {Array} permits
 * @param {string} langPrefix
 * @returns {Array}
 */
function fixLinksInPermits(permits, langPrefix = '') {
  buildMap(permits);
  return permits.map(p => ({
    ...p,
    sections: (p.sections || [])
      .filter(s => !isDocumentsSection(s.question))
      .map(s => ({
        ...s,
        content: fixStaleDocLinks(fixLinksInHtml(s.content, langPrefix)),
      })),
  }));
}

module.exports = { buildMap, fixHref, fixLinksInHtml, fixLinksInPermits, isDocumentsSection };
