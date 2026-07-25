/**
 * 11ty data file: indice full-text delle circolari, slug → testo integrale
 * (minuscolo, per la ricerca). Emesso come /circolari-fulltext.json da
 * src/pages/circolari-fulltext.liquid e caricato dal client
 * (src/scripts/circolari-db.js) solo quando l'utente attiva la checkbox
 * "cerca anche nel testo" — così l'indice base circolari-db.json resta piccolo.
 */

const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, '..', '_cache', 'circolari-site.json');

module.exports = function () {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    const circolari = JSON.parse(raw);
    const index = {};
    circolari.forEach((c) => {
      index[c.slug] = (c.testo || []).join(' ').toLowerCase();
    });
    console.log(`[circolariFulltext.js] Built full-text index for ${circolari.length} circolari`);
    return index;
  } catch (err) {
    console.warn(`[circolariFulltext.js] Cache not found or invalid (${err.message}), returning empty object`);
    return {};
  }
};
