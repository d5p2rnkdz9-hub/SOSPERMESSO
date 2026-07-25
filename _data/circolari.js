/**
 * 11ty data file for self-hosted circolari pages (not yet published: no nav
 * link, no sitemap entry, no index page — see data-pipeline/export_circolari_site.py).
 * Reads the already-cleaned/paragraphized JSON produced by the export script;
 * no Notion involved here.
 */

const fs = require('fs');
const path = require('path');
const { normalizeEnte } = require('../scripts/normalize-ente');

const CACHE_PATH = path.join(__dirname, '..', '_cache', 'circolari-site.json');

module.exports = function () {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    const circolari = JSON.parse(raw);
    circolari.forEach((c) => { c.ente = normalizeEnte(c.ente); });
    console.log(`[circolari.js] Returning ${circolari.length} circolari from cache`);
    return circolari;
  } catch (err) {
    console.warn(`[circolari.js] Cache not found or invalid (${err.message}), returning empty array`);
    return [];
  }
};
