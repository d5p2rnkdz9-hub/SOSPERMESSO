/**
 * 11ty data file: contenuti "Versione PRO" (sintesi professionale, norme,
 * sentenze con teaser, circolari chiave) per le pagine permesso.
 *
 * Fonte canonica CONDIVISA con l'app Next.js:
 *   ../pro-content-shared/pro-content.json  (sibling di Sito_Nuovo/)
 * L'app la consuma via app/scripts/generate-pro-content.js.
 *
 * Chiavi di `permits` = slug permesso IT (da _cache/permits-it.json).
 * `draft: true` mostra il badge BOZZA (contenuti in validazione legale).
 */

const fs = require('fs');
const path = require('path');

const CANONICAL = path.join(
  __dirname,
  '..',
  '..',
  'pro-content-shared',
  'pro-content.json',
);

// Copia committata nel repo: unica fonte disponibile su Netlify (il sibling
// pro-content-shared/ vive fuori dal repo). Quando il canonical è presente
// (dev locale) viene sincronizzata automaticamente qui.
const SNAPSHOT = path.join(__dirname, '..', '_cache', 'pro-content.json');

module.exports = function () {
  let raw = null;
  let source = 'canonical';
  try {
    raw = fs.readFileSync(CANONICAL, 'utf-8');
    // Tieni allineata la copia committata (best effort)
    try {
      if (!fs.existsSync(SNAPSHOT) || fs.readFileSync(SNAPSHOT, 'utf-8') !== raw) {
        fs.writeFileSync(SNAPSHOT, raw);
        console.log('[proContent.js] snapshot _cache/pro-content.json aggiornato');
      }
    } catch (syncErr) {
      console.warn(`[proContent.js] sync snapshot fallito (${syncErr.message})`);
    }
  } catch (err) {
    try {
      raw = fs.readFileSync(SNAPSHOT, 'utf-8');
      source = 'snapshot';
    } catch (err2) {
      console.warn(`[proContent.js] pro content non trovato (${err.message})`);
      return { draft: true, permits: {} };
    }
  }

  const data = JSON.parse(raw);
  console.log(
    `[proContent.js] ${Object.keys(data.permits).length} schede PRO da ${source} (draft=${data.draft})`,
  );
  return data;
};
