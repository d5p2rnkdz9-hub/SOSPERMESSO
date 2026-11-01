/**
 * Indice della ricerca nel menu (src/scripts/search.js), uno per lingua.
 * Pubblicato da src/pages/search-index.liquid come /search-index.json (IT) e
 * /{lang}/search-index.json.
 *
 * Fonti, tutte già nel repo (nessuna chiamata a Notion):
 *  - permessi: _cache/permits-{lang}.json (titolo + inizio della prima risposta);
 *    nelle altre lingue il nome italiano entra nelle parole chiave, così chi
 *    conosce già i termini italiani («asilo», «carta di soggiorno») li ritrova;
 *  - guide e pagine pratiche: _data/home.js (stessi testi delle schede in home),
 *    più la pagina database con l'etichetta che ha nel menu (_data/nav.js);
 *  - dizionario: i termini di {lang}/src/pages/dizionario.html (h3 + prima riga);
 *  - normativa: _data/normativa.js (solo IT, i testi coordinati sono in italiano).
 * Le circolari (oltre mille) NON sono qui: search.js aggiunge in IT una voce
 * fissa che rimanda alla ricerca di /circolari.html?q=…
 *
 * Forma di ogni voce (chiavi corte per tenere il file leggero):
 *   { t: titolo, u: url assoluto, k: tipo, s: sottotitolo,
 *     a: altro titolo (pesa quasi come t), w: parole chiave extra (pesano come s) }
 * k ∈ permesso | guida | dizionario | normativa (etichette tradotte in nav.js, `search`).
 */
const fs = require('fs');
const path = require('path');
const home = require('./home.js');
const nav = require('./nav.js');
const normativa = require('./normativa.js');

const ROOT = path.join(__dirname, '..');
const LANGS = ['it', 'en', 'fr', 'es', 'tr', 'ru', 'bn', 'ar', 'ur', 'fa', 'zh'];
const SNIPPET = 150;

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf-8'));
  } catch (e) {
    return [];
  }
}

function plain(html) {
  return String(html || '')
    .replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cut(text, max = SNIPPET) {
  if (text.length <= max) return text;
  const short = text.slice(0, max);
  const space = short.lastIndexOf(' ');
  return (space > max * 0.6 ? short.slice(0, space) : short) + '…';
}

function prefix(lang) {
  return lang === 'it' ? '/' : `/${lang}/`;
}

function permitEntries(lang, itTitles) {
  return readJson(`_cache/permits-${lang}.json`).map((p) => {
    const first = (p.sections || [])[0];
    const entry = {
      t: p.tipo,
      u: `${prefix(lang)}permesso-${p.slug}.html`,
      k: 'permesso',
      s: first ? cut(plain(first.content)) : ''
    };
    if (lang !== 'it' && itTitles[p.slug] && itTitles[p.slug] !== p.tipo) entry.a = itTitles[p.slug];
    if (p.categoria) entry.w = p.categoria;
    return entry;
  });
}

function guideEntries(lang) {
  const h = home[lang] || home.it;
  // La domanda della scheda («Come compilo il kit postale?») dice più del testo
  // del tasto («Moduli passo passo»): titolo = domanda, sottotitolo = tasto.
  const out = (h.guides || []).map((g) => ({
    t: g.q,
    u: prefix(lang) + g.href,
    k: 'guida',
    s: g.cta,
    a: g.cta,
    w: g.tag
  }));
  // Elenco completo dei permessi: etichetta presa dal menu della lingua
  const navLinks = (nav[lang] || nav.it).dropdowns.flatMap((d) => [d, ...(d.items || [])]);
  const db = navLinks.find((l) => /\/database\.html$/.test(l.href || ''));
  if (db) out.unshift({ t: db.label, u: `${prefix(lang)}database.html`, k: 'guida', s: '' });
  const legal = h.legal || home.it.legal;
  if (legal) out.push({ t: legal.title, u: `${prefix(lang)}aiuto-legale.html`, k: 'guida', s: plain(legal.desc).replace(/\s*→$/, '') });
  const dict = h.dict || home.it.dict;
  if (dict) out.push({ t: dict.title, u: `${prefix(lang)}dizionario.html`, k: 'guida', s: plain(dict.desc || '').replace(/\s*→$/, '') });
  return out;
}

function dictionaryEntries(lang) {
  const file = lang === 'it' ? 'src/pages/dizionario.html' : `${lang}/src/pages/dizionario.html`;
  let html = '';
  try {
    html = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  } catch (e) {
    return [];
  }
  const out = [];
  const re = /<div class="dictionary-term" id="([^"]+)">\s*<h3>([\s\S]*?)<\/h3>\s*(?:<p>([\s\S]*?)<\/p>)?/g;
  let m;
  while ((m = re.exec(html))) {
    const title = plain(m[2].replace(/<a [^>]*class="anchor-link"[^>]*>[\s\S]*?<\/a>/, ''));
    if (!title) continue;
    out.push({
      t: title,
      u: `${prefix(lang)}dizionario.html#${m[1]}`,
      k: 'dizionario',
      s: cut(plain(m[3] || ''))
    });
  }
  return out;
}

function normativaEntries() {
  return (normativa.testi || []).map((t) => ({
    t: t.titolo,
    u: `/patto-interattivo/${t.slug}/`,
    k: 'normativa',
    s: t.sotto || ''
  }));
}

module.exports = function () {
  const itTitles = {};
  for (const p of readJson('_cache/permits-it.json')) itTitles[p.slug] = p.tipo;

  return LANGS.map((lang) => ({
    lang,
    permalink: lang === 'it' ? 'search-index.json' : `${lang}/search-index.json`,
    items: [
      ...permitEntries(lang, itTitles),
      ...guideEntries(lang),
      ...(lang === 'it' ? normativaEntries() : []),
      ...dictionaryEntries(lang)
    ]
  }));
};
