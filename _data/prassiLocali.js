/**
 * 11ty data file for prassi locali (local questura practices)
 * Fetches approved community submissions from Notion during build
 * Returns object grouped by page slug, then by city
 */

const { Client } = require("@notionhq/client");

const PRASSI_DB_ID = process.env.PRASSI_DB_ID;

/**
 * Fetch and transform prassi locali data from Notion
 * Exports async function that 11ty will call during build
 */
module.exports = async function() {
  // Graceful degradation: return empty object if no API key or DB ID
  if (!process.env.NOTION_API_KEY) {
    console.warn('[prassiLocali.js] NOTION_API_KEY not set - returning empty object');
    return {};
  }

  if (!PRASSI_DB_ID) {
    console.warn('[prassiLocali.js] PRASSI_DB_ID not set - returning empty object');
    return {};
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

      // Filter pages that belong to our prassi database
      const dbPages = response.results.filter(page =>
        page.parent?.database_id === PRASSI_DB_ID ||
        page.parent?.data_source_id === PRASSI_DB_ID
      );
      allPages.push(...dbPages);

      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    console.log(`[prassiLocali.js] Fetched ${allPages.length} pages from Prassi Locali database`);

    // Transform and filter to approved only
    const approvedPractices = [];

    for (const page of allPages) {
      // Get Status property
      const status = page.properties["Status"]?.select?.name || null;

      // Only include Approved submissions
      if (status !== "Approved") {
        continue;
      }

      // Extract properties
      const city = page.properties["Citta"]?.title?.[0]?.plain_text || null;
      const descriptionRichText = page.properties["Descrizione"]?.rich_text || [];
      const description = descriptionRichText.map(segment => segment.plain_text || '').join('');
      const date = page.properties["Data esperienza"]?.date?.start || null;
      const category = page.properties["Categoria"]?.rich_text?.[0]?.plain_text || null;
      const pageSlug = page.properties["Slug pagina"]?.rich_text?.[0]?.plain_text || null;
      const votiConfermo = page.properties["Voti Confermo"]?.number || 0;
      const votiNonConfermo = page.properties["Voti Non Confermo"]?.number || 0;

      // Skip if missing critical fields
      if (!city || !description || !pageSlug) {
        console.warn(`[prassiLocali.js] Skipping page ${page.id} - missing required fields`);
        continue;
      }

      approvedPractices.push({
        id: page.id,
        city,
        description,
        date,
        category,
        pageSlug,
        votiConfermo,
        votiNonConfermo
      });
    }

    console.log(`[prassiLocali.js] Found ${approvedPractices.length} approved practices`);

    // Group by pageSlug, then by city
    const grouped = {};

    for (const practice of approvedPractices) {
      const { pageSlug, city } = practice;

      // Initialize page slug group if doesn't exist
      if (!grouped[pageSlug]) {
        grouped[pageSlug] = {};
      }

      // Initialize city array if doesn't exist
      if (!grouped[pageSlug][city]) {
        grouped[pageSlug][city] = [];
      }

      // Add practice to city array
      grouped[pageSlug][city].push(practice);
    }

    // Convert city objects to sorted arrays [cityName, practices[]]
    // This makes iteration easier in Liquid templates
    for (const pageSlug in grouped) {
      const cities = grouped[pageSlug];
      const sortedCities = Object.keys(cities).sort();
      grouped[pageSlug] = sortedCities.map(cityName => [cityName, cities[cityName]]);
    }

    const pageCount = Object.keys(grouped).length;
    console.log(`[prassiLocali.js] Fetched ${approvedPractices.length} approved practices for ${pageCount} document pages`);

    return grouped;

  } catch (error) {
    console.error(`[prassiLocali.js] Notion fetch failed: ${error.message}`);
    console.warn('[prassiLocali.js] Returning empty object (graceful degradation)');
    return {};
  }
};
