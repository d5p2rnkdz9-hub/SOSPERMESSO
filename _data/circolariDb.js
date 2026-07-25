/**
 * 11ty data file: compact search index for the public circolari section.
 * Consumed by src/pages/circolari-db.liquid to emit /circolari-db.json,
 * which src/scripts/circolari-db.js fetches for client-side search + filters.
 * Kept separate from _data/circolari.js (full per-page records with full
 * `testo`) to keep the index small — only a short 't' excerpt for search.
 */

const fs = require('fs');
const path = require('path');
const { normalizeEnte } = require('../scripts/normalize-ente');

const CACHE_PATH = path.join(__dirname, '..', '_cache', 'circolari-site.json');

function truncate(str, max) {
  if (!str) return '';
  const s = String(str);
  return s.length > max ? s.slice(0, max) : s;
}

module.exports = function () {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    const circolari = JSON.parse(raw);

    const index = circolari.map((c) => ({
      slug: c.slug,
      titolo: c.titolo_pubblico,
      ente: normalizeEnte(c.ente) || null,
      numero: c.numero || null,
      data: c.data || null,
      anno: c.data ? c.data.slice(0, 4) : null,
      oggetto: truncate(c.oggetto, 260),
      tema: c.tema || null,
      permessi: c.permessi || [],
      trasversale: !!c.trasversale,
      // il testo integrale cercabile vive in circolari-fulltext.json
      // (_data/circolariFulltext.js), caricato dal client solo quando la
      // checkbox "cerca anche nel testo" viene attivata.
    }));

    // Ordina per data decrescente (più recenti prima) per il rendering di default
    index.sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    console.log(`[circolariDb.js] Built search index with ${index.length} entries`);
    return index;
  } catch (err) {
    console.warn(`[circolariDb.js] Cache not found or invalid (${err.message}), returning empty array`);
    return [];
  }
};
