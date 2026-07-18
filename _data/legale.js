/**
 * Dati per la sezione "Giurisprudenza e circolari" (per operatori).
 *
 * Fonti (generate da data-pipeline/):
 *   - data-pipeline/data/corpus.json          — corpus unificato (4.338 doc)
 *   - data-pipeline/data/classificazione.json — tagging documento → permesso
 *
 * Filtri di pubblicazione (conservativi, da rivedere con Alberto):
 *   - solo documenti classificati, in ambito, con permessi o trasversali
 *   - ESCLUSI tipi "dottrina", "prassi", "altro" (possibile copyright /
 *     corrispondenza privata nella KB IMMIGRAZBOT)
 *   - link esterni SOLO verso fonti pubbliche scrapate; i documenti KB
 *     compaiono come metadati senza link (i gdrive_url restano privati)
 */

const fs = require('fs');
const path = require('path');

const PIPELINE_DATA = path.join(__dirname, '..', 'data-pipeline', 'data');

// tipi pubblicabili: atti ufficiali e decisioni
const TIPI_PUBBLICI = new Set([
  'sentenza', 'ordinanza', 'circolare', 'nota', 'messaggio', 'decreto',
  'direttiva', 'normativa', 'regolamento', 'telegramma', 'comunicato',
  'parere', 'delibera', 'protocollo',
]);
const TIPI_GIURISPRUDENZA = new Set(['sentenza', 'ordinanza']);

const MAX_PER_PERMIT = 15; // per lista (sentenze e circolari separate)

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(PIPELINE_DATA, file), 'utf-8'));
  } catch (e) {
    console.warn(`[legale] impossibile leggere ${file}: ${e.message} — sezione vuota`);
    return null;
  }
}

function displayTitle(rec) {
  if (rec.origine !== 'immigrazbot') return rec.titolo || '';
  // KB: i titoli sono nomi file — componi un titolo pulito dai metadati
  if (TIPI_GIURISPRUDENZA.has(rec.tipo) && rec.ente) {
    let t = rec.ente;
    if (rec.numero) t += ` n. ${rec.numero}`;
    else if (rec.data) t += ` (${rec.data.slice(0, 4)})`;
    return t;
  }
  return rec.titolo || '';
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

module.exports = function () {
  const corpus = loadJson('corpus.json');
  const classificazione = loadJson('classificazione.json');
  if (!corpus || !classificazione) {
    return { records: [], perPermit: {}, searchIndexJson: '[]', stats: {} };
  }

  const records = [];
  for (const rec of corpus) {
    const cls = classificazione[rec.id];
    if (!cls || cls.status !== 'classificato') continue;
    if (cls.fuori_ambito) continue;
    if (!cls.permessi.length && !cls.trasversale) continue;
    if (!TIPI_PUBBLICI.has(rec.tipo)) continue;
    if (rec.dup_of) continue; // tieni una sola copia dei duplicati cross-fonte

    const isKb = rec.origine === 'immigrazbot';
    records.push({
      id: rec.id,
      tipo: rec.tipo,
      giurisprudenza: TIPI_GIURISPRUDENZA.has(rec.tipo),
      data: rec.data || null,
      anno: rec.data ? rec.data.slice(0, 4) : null,
      ente: rec.ente || null,
      numero: rec.numero || null,
      titolo: displayTitle(rec),
      oggetto: truncate(rec.oggetto, 260),
      tema: cls.tema || null,
      esito: rec.esito || null,
      permessi: cls.permessi, // [{slug, rilevanza}]
      trasversale: cls.trasversale,
      url: isKb ? null : rec.url, // niente link privati (gdrive) per la KB
      pdf_url: isKb ? null : rec.pdf_url || null,
    });
  }

  records.sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  // raggruppa per permesso: solo rilevanza 3, sentenze e prassi separate
  const perPermit = {};
  for (const rec of records) {
    for (const p of rec.permessi) {
      if (p.rilevanza !== 3) continue;
      if (!perPermit[p.slug]) perPermit[p.slug] = { sentenze: [], circolari: [] };
      const bucket = rec.giurisprudenza ? 'sentenze' : 'circolari';
      if (perPermit[p.slug][bucket].length < MAX_PER_PERMIT) {
        perPermit[p.slug][bucket].push(rec);
      }
    }
  }

  // metadati permessi (slug → titolo) dalla cache Notion IT
  let permitsMeta = [];
  try {
    permitsMeta = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '_cache', 'permits-it.json'), 'utf-8')
    );
  } catch (e) {
    console.warn(`[legale] permits-it.json non leggibile: ${e.message}`);
  }

  // una pagina per ogni permesso che ha almeno un documento a rilevanza 3
  const permitPages = [];
  const permitBySlug = {};
  for (const p of permitsMeta) {
    const docs = perPermit[p.slug];
    if (!docs || (!docs.sentenze.length && !docs.circolari.length)) continue;
    const page = {
      slug: p.slug,
      tipo: p.tipo,
      sentenze: docs.sentenze,
      circolari: docs.circolari,
    };
    permitPages.push(page);
    permitBySlug[p.slug] = page;
  }

  const stats = {
    totale: records.length,
    sentenze: records.filter((r) => r.giurisprudenza).length,
    circolari: records.filter((r) => !r.giurisprudenza).length,
    permessiCoperti: permitPages.length,
  };

  // opzioni filtro per la pagina database (solo permessi presenti nei record)
  const slugSet = new Set();
  for (const r of records) for (const p of r.permessi) slugSet.add(p.slug);
  const permitOptions = permitsMeta
    .filter((p) => slugSet.has(p.slug))
    .map((p) => ({ slug: p.slug, tipo: p.tipo }));

  return {
    records,
    perPermit,
    permitPages,
    permitBySlug,
    permitOptions,
    stats,
    searchIndexJson: JSON.stringify(records),
  };
};
