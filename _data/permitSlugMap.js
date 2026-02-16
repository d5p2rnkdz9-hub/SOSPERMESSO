/**
 * Slug map for permit page redirects
 * Provides mappings from old/short slugs to full canonical slugs
 * Used by permitRedirects.js to generate redirect pages
 */

module.exports = {
  mappings: {
    // Short slug -> canonical slug
    "assistenza-minore": "assistenza-minore-art-31",
    "attesa-occupazione": "attesa-occupazione-art-22",
    "calamita-naturale": "calamita-naturale-art-20-bis",
    "protezione-speciale": "protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008",
    "prosieguo-amministrativo": "integrazione-prosieguo-amministrativo",
    "minori-stranieri-affidati": "affidamento-a-familiari-entro-il-quarto-grado",
    "genitore-minore-italiano": "famiglia-per-genitore-di-cittadino-italiano-art-30",
    "genitore-di-cittadino-italiano": "famiglia-per-genitore-di-cittadino-italiano-art-30",
    "ricongiungimento-familiare": "famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare",
    "conviventi-familiari-italiani": "famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19",
    "coesione-familiare": "famiglia-o-motivi-familiari-senza-nullaosta-per-ricongiungimento-coesione",
    "gravi-motivi-salute": "cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia",
    "persona-gravemente-malata-che-si-trova-gia-in-italia": "cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia",

    // Typo corrections
    "prosieguo-amministravo": "integrazione-prosieguo-amministrativo",
    "famiglia-motivi-familiari-convivente-con-parente-cittaadino-italiano-art-19": "famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19",
    "famit-per-familiari-di-cittidini-statici": "famit-per-familiari-di-cittadini-italiani-statici",

    // Old spelling (famigliari -> familiari)
    "famiglia-motivi-famigliari-art-19": "famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19",
    "famiglia-motivi-famigliari-art-30-dopo-ingresso-con-nullaosta": "famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare",

    // Old article-number slugs
    "famiglia-motivi-familiari-art-30-dopo-ingresso-con-nullaosta": "famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare",
    "famiglia-motivi-familiari-art-30-senza-nullaosta-coesione": "famiglia-o-motivi-familiari-senza-nullaosta-per-ricongiungimento-coesione",
    "protezione-speciale-art-32-d-lgs-25-2008": "protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008",

    // Renamed permits
    "asilo-politico": "asilo-status-rifugiato",
    "cure-mediche": "cure-mediche-dopo-ingresso-con-visto-art-36",
    "cure-mediche-art-36-d-lgs-286-1998": "cure-mediche-dopo-ingresso-con-visto-art-36",
    "cure-mediche-ex-art-19-comma-2-lett-d-bis": "cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia",

    // Old card names -> canonical
    "familiari-di-cittadini-ue-carta-ue": "carta-di-soggiorno-per-familiari-di-cittadini-ue-d-lgs-30-07",
    "familiari-di-italiani-dinamici-carta-ue": "carta-di-soggiorno-per-familiari-di-italiani-dinamici-d-lgs-30-07",
    "famit-familiari-italiani-statici": "famit-per-familiari-di-cittadini-italiani-statici",

    // Gravidanza variants -> specific child or parent
    "gravidanza": "cure-mediche-art-19-donna-in-stato-di-gravidanza",
    "donna-in-stato-di-gravidanza-e-padre-del-bambino": "cure-mediche-art-19",
    "cure-mediche-per-donna-in-stato-di-gravidanza-e-padre-del-bambino-art-19": "cure-mediche-art-19"
  }
};
