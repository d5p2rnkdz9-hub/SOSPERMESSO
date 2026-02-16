/**
 * 11ty data file for permit redirect pages
 * Generates array of redirect objects from permitSlugMap for pagination
 * Each redirect object creates a simple meta refresh page
 */

const permitSlugMap = require('./permitSlugMap.js');

/**
 * Generate redirect objects for pagination
 * Returns flat array of redirect entries for permit pages
 */
module.exports = function() {
  const redirects = [];

  for (const [oldSlug, canonicalSlug] of Object.entries(permitSlugMap.mappings)) {
    // Generate permit redirect
    redirects.push({
      oldSlug,
      canonicalSlug,
      targetFile: `permesso-${canonicalSlug}.html`
    });
  }

  console.log(`[permitRedirects.js] Generated ${redirects.length} permit redirect entries`);

  return redirects;
};
