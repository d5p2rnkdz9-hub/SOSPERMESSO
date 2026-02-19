/**
 * 11ty data file for EN document pages
 * Fetches permit document data from EN Notion database
 * Slugs are resolved via IT Page ID → IT slug mapping (EN slugs = IT slugs)
 */

require('dotenv').config();
const { Client } = require("@notionhq/client");

// EN Notion database ID (hardcoded like IT — no env var needed)
const EN_DATABASE_ID = "c1dc0271-f1f4-4147-9464-391884f4dfad";
const IT_DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";

function slugify(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract cost from document list multi_select values
 */
function extractCost(documents, keyword) {
  if (!documents || !documents.length) return null;
  const item = documents.find(d => d.toLowerCase().includes(keyword));
  if (!item) return null;
  const match = item.match(/(\d+[\.,]?\d*)\s*€/) || item.match(/da\s+(\d+[\.,]?\d*)/);
  if (!match) return null;
  return parseFloat(match[1].replace(',', '.'));
}

/**
 * Extract alternative cost when item contains "X o Y" pattern
 */
function extractCostAlt(documents, keyword) {
  if (!documents || !documents.length) return null;
  const item = documents.find(d => d.toLowerCase().includes(keyword));
  if (!item) return null;
  const match = item.match(/(\d+[\.,]?\d*)\s+o\s+(\d+[\.,]?\d*)/);
  if (!match) return null;
  return parseFloat(match[2].replace(',', '.'));
}

/**
 * Fetch all pages from a Notion database using search API
 */
async function fetchDatabasePages(notion, databaseId) {
  const allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      start_cursor: startCursor,
      page_size: 100
    });

    const dbPages = response.results.filter(page =>
      page.parent?.database_id === databaseId ||
      page.parent?.data_source_id === databaseId
    );
    allPages.push(...dbPages);

    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allPages;
}

/**
 * Build IT page ID → slug map by fetching IT database
 */
async function buildItSlugMap(notion) {
  const itPages = await fetchDatabasePages(notion, IT_DATABASE_ID);
  const slugMap = {};

  for (const page of itPages) {
    const tipo = page.properties["Nome permesso"]?.title?.[0]?.plain_text || null;
    if (tipo) {
      slugMap[page.id] = slugify(tipo);
    }
  }

  return slugMap;
}

module.exports = async function() {
  if (!process.env.NOTION_API_KEY) {
    console.warn('[documentsEn.js] NOTION_API_KEY not set - returning empty arrays');
    return { primo: [], rinnovo: [] };
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Build IT slug map
    console.log('[documentsEn.js] Building IT slug map...');
    const itSlugMap = await buildItSlugMap(notion);

    // Fetch EN pages
    const enPages = await fetchDatabasePages(notion, EN_DATABASE_ID);
    console.log(`[documentsEn.js] Fetched ${enPages.length} EN pages from Notion`);

    const primo = [];
    const rinnovo = [];
    const seenSlugs = new Set();

    for (const page of enPages) {
      const tipo = page.properties["Name"]?.title?.[0]?.plain_text || null;
      if (!tipo) continue;

      // Resolve slug via IT Page ID
      const itPageId = (page.properties["IT Page ID"]?.rich_text || [])
        .map(s => s.plain_text).join('');
      const slug = itPageId ? itSlugMap[itPageId] : null;

      if (!slug) {
        console.warn(`[documentsEn.js] Skipping "${tipo}" - no IT slug found`);
        continue;
      }

      if (seenSlugs.has(slug)) {
        console.warn(`[documentsEn.js] Skipping duplicate slug: ${slug}`);
        continue;
      }
      seenSlugs.add(slug);

      // Get document notes
      const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];
      const docNotes = docNotesRichText.map(segment => segment.plain_text || '').join('');

      // Extract document lists
      const primoDocuments = page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [];
      const rinnovoDocuments = page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [];

      // Extract methods
      const primoMethod = page.properties["Mod primo rilascio"]?.multi_select?.[0]?.name || null;
      const rinnovoMethod = page.properties["Mod rinnovo"]?.multi_select?.[0]?.name || null;

      // Extract costs
      const costBollettinoPrimo = extractCost(primoDocuments, 'bollettino') || extractCost(primoDocuments, 'postal payment');
      const costMarcaBolloPrimo = extractCost(primoDocuments, 'marca da bollo') || extractCost(primoDocuments, 'revenue stamp');
      const costBollettinoAltPrimo = extractCostAlt(primoDocuments, 'bollettino') || extractCostAlt(primoDocuments, 'postal payment');
      const costBollettinoRinnovo = extractCost(rinnovoDocuments, 'bollettino') || extractCost(rinnovoDocuments, 'postal payment');
      const costMarcaBolloRinnovo = extractCost(rinnovoDocuments, 'marca da bollo') || extractCost(rinnovoDocuments, 'revenue stamp');
      const costBollettinoAltRinnovo = extractCostAlt(rinnovoDocuments, 'bollettino') || extractCostAlt(rinnovoDocuments, 'postal payment');

      primo.push({
        tipo, slug,
        documents: primoDocuments,
        method: primoMethod,
        docNotes: docNotes || null,
        costBollettino: costBollettinoPrimo,
        costBollettinoAlt: costBollettinoAltPrimo,
        costMarcaBollo: costMarcaBolloPrimo
      });

      rinnovo.push({
        tipo, slug,
        documents: rinnovoDocuments,
        method: rinnovoMethod,
        docNotes: docNotes || null,
        costBollettino: costBollettinoRinnovo,
        costBollettinoAlt: costBollettinoAltRinnovo,
        costMarcaBollo: costMarcaBolloRinnovo
      });
    }

    console.log(`[documentsEn.js] Prepared ${primo.length} primo, ${rinnovo.length} rinnovo entries`);
    return { primo, rinnovo };

  } catch (error) {
    console.error(`[documentsEn.js] Notion fetch failed: ${error.message}`);
    return { primo: [], rinnovo: [] };
  }
};
