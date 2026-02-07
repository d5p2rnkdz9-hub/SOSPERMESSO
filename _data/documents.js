/**
 * 11ty data file for document pages
 * Fetches permit document data from Notion during build
 * Returns object with separate primo and rinnovo arrays for pagination
 */

const { Client } = require("@notionhq/client");

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
 * Fetch and transform permit data from Notion
 * Exports async function that 11ty will call during build
 */
module.exports = async function() {
  // Graceful degradation: return empty arrays if no API key or fetch fails
  if (!process.env.NOTION_API_KEY) {
    console.warn('[documents.js] NOTION_API_KEY not set - returning empty document arrays');
    return { primo: [], rinnovo: [] };
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Fetch all pages using search API (workaround for dataSources.query permission)
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

    console.log(`[documents.js] Fetched ${allPages.length} permit pages from Notion`);

    // Transform to separate primo and rinnovo arrays
    const primo = [];
    const rinnovo = [];

    for (const page of allPages) {
      // Get permit name from title property "Nome permesso"
      const tipo = page.properties["Nome permesso"]?.title?.[0]?.plain_text || null;

      if (!tipo) {
        console.warn(`[documents.js] Skipping page ${page.id} - no permit name`);
        continue;
      }

      const slug = slugify(tipo);

      // Get document notes from "Info extra su doc rilascio" field
      const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];
      const docNotes = docNotesRichText.map(segment => segment.plain_text || '').join('');

      // Extract document lists
      const primoDocuments = page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [];
      const rinnovoDocuments = page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [];

      // Extract methods (first value from multi_select)
      const primoMethod = page.properties["Mod primo rilascio"]?.multi_select?.[0]?.name || null;
      const rinnovoMethod = page.properties["Mod rinnovo"]?.multi_select?.[0]?.name || null;

      // Create primo entry
      primo.push({
        tipo,
        slug,
        documents: primoDocuments,
        method: primoMethod,
        docNotes: docNotes || null
      });

      // Create rinnovo entry
      rinnovo.push({
        tipo,
        slug,
        documents: rinnovoDocuments,
        method: rinnovoMethod,
        docNotes: docNotes || null
      });
    }

    console.log(`[documents.js] Prepared ${primo.length} primo entries, ${rinnovo.length} rinnovo entries`);

    return { primo, rinnovo };

  } catch (error) {
    console.error(`[documents.js] Notion fetch failed: ${error.message}`);
    console.warn('[documents.js] Returning empty arrays (graceful degradation)');
    return { primo: [], rinnovo: [] };
  }
};
