/**
 * 11ty data file for document redirect pages
 * Generates array of redirect objects from slugMap for pagination
 * Each redirect object creates a simple meta refresh page
 */

const slugMap = require('./slugMap.js');

/**
 * Generate redirect objects for pagination
 * Returns flat array of redirect entries for both primo and rinnovo
 */
module.exports = function() {
  const redirects = [];

  for (const [displaySlug, canonicalSlug] of Object.entries(slugMap.mappings)) {
    // Generate primo redirect
    redirects.push({
      displaySlug,
      canonicalSlug,
      type: 'primo',
      targetFile: `documenti-${canonicalSlug}-primo.html`
    });

    // Generate rinnovo redirect
    redirects.push({
      displaySlug,
      canonicalSlug,
      type: 'rinnovo',
      targetFile: `documenti-${canonicalSlug}-rinnovo.html`
    });
  }

  console.log(`[documentRedirects.js] Generated ${redirects.length} redirect entries (${Object.keys(slugMap.mappings).length} slugs × 2 types)`);

  return redirects;
};
