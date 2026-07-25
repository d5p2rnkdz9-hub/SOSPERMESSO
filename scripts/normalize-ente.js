/**
 * Normalizzazione semantica dei nomi degli enti emananti delle circolari.
 * Il cache circolari-site.json arriva dalla pipeline esterna con varianti
 * diverse dello stesso ente (sigla vs denominazione estesa, congiunzioni,
 * maiuscole); qui le riconduciamo a un nome canonico unico, usato sia nel
 * filtro/badge della sezione circolari sia nelle pagine di dettaglio.
 * Usato da _data/circolari.js e _data/circolariDb.js.
 */

const ALIASES = {
  'ANCI Lombardia': 'ANCI',
  'ANPAL - Agenzia Nazionale Politiche Attive del Lavoro': 'ANPAL',
  'CONI - Comitato Olimpico Nazionale Italiano': 'CONI',
  'Ente Nazionale di Previdenza e Assistenza per i Lavoratori dello Spettacolo': 'ENPALS',
  'Ente Nazionale di previdenza e di Assistenza per i Lavoratori dello Spettacolo': 'ENPALS',
  'FIGC - Federazione Italiana Giuoco Calcio': 'FIGC',
  'Federazione Italiana Giuoco Calcio': 'FIGC',
  'F.I.G.C. - Lega Nazionale Dilettanti': 'FIGC',
  'INCA - CAAF': 'Patronato INCA',
  "Ministero dell'Interno - Ministero della Solidarietà Sociale":
    "Ministero dell'Interno e Ministero della Solidarietà Sociale",
  "Ministero dell'Interno e della Solidarietà Sociale":
    "Ministero dell'Interno e Ministero della Solidarietà Sociale",
  'Presidenza del Consiglio dei Ministri - Dipartimento per le Pari Opportunità':
    'Presidenza del Consiglio dei Ministri',
  'Prefettura - Ufficio Territoriale del Governo di Milano': 'Prefettura di Milano',
};

function normalizeEnte(ente) {
  if (!ente) return ente;
  const trimmed = String(ente).trim();
  return ALIASES[trimmed] || trimmed;
}

module.exports = { normalizeEnte, ALIASES };
