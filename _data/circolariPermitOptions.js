/**
 * 11ty data file: permit filter options for the circolari-db search page.
 * Cross-references the circolari index (which permit slugs are actually
 * referenced) against the IT permit cache (slug -> display name), so the
 * <select> only lists permits that have at least one linked circolare.
 */

const fs = require('fs');
const path = require('path');

const CIRCOLARI_PATH = path.join(__dirname, '..', '_cache', 'circolari-site.json');
const PERMITS_PATH = path.join(__dirname, '..', '_cache', 'permits-it.json');

module.exports = function () {
  let circolari = [];
  let permits = [];
  try {
    circolari = JSON.parse(fs.readFileSync(CIRCOLARI_PATH, 'utf-8'));
  } catch (err) {
    console.warn(`[circolariPermitOptions.js] circolari cache not found (${err.message})`);
  }
  try {
    permits = JSON.parse(fs.readFileSync(PERMITS_PATH, 'utf-8'));
  } catch (err) {
    console.warn(`[circolariPermitOptions.js] permits cache not found (${err.message})`);
  }

  const usedSlugs = new Set();
  circolari.forEach((c) => {
    (c.permessi || []).forEach((p) => usedSlugs.add(p.slug));
  });

  const nameBySlug = {};
  permits.forEach((p) => {
    if (p.slug && p.tipo) nameBySlug[p.slug] = p.tipo;
  });

  const options = Array.from(usedSlugs)
    .filter((slug) => nameBySlug[slug])
    .map((slug) => ({ slug, tipo: nameBySlug[slug] }))
    .sort((a, b) => a.tipo.localeCompare(b.tipo, 'it'));

  return options;
};
