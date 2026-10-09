/**
 * NORMATIVA ITALIANA — testi coordinati interattivi (pagina /normativa.html).
 *
 * I testi sono il bundle statico in `public/patto-interattivo/`, servito a
 * `/patto-interattivo/<slug>/` (mapping in eleventy.config.mjs). Ogni testo è
 * un'app autonoma: sommario, rinvii cliccabili, modifiche evidenziate.
 * Provengono dalla pipeline di sospatto.it — per aggiornarli si lancia
 * `node scripts/sync-testi-interattivi.js`, non si modifica l'HTML a mano.
 *
 * `verificaData` è la data dell'ultimo controllo dei testi su Normattiva.
 */
module.exports = {
  verificaData: '10 luglio 2026',

  // Il decreto che ha introdotto le modifiche evidenziate nei testi coordinati
  decreto: {
    label: 'd.l. 12 giugno 2026, n. 100',
    nota: 'convertito senza modificazioni dalla l. 145/2026',
  },

  testi: [
    {
      slug: 'dlgs-286-1998',
      titolo: 'D.Lgs. 286/1998',
      sotto: "Testo unico dell'immigrazione",
      coord: 'Testo coordinato con il d.l. 100/2026 (art. 12) e d.lgs. 115/2026 — versione precedente e modifiche per articolo',
      evidenza: true,
    },
    {
      slug: 'dlgs-25-2008',
      titolo: 'D.Lgs. 25/2008',
      sotto: 'Procedure per il riconoscimento della protezione internazionale',
      coord: 'Testo coordinato con il d.l. 100/2026 (art. 11) e d.lgs. 115/2026 — versione precedente e modifiche per articolo',
    },
    {
      slug: 'dlgs-142-2015',
      titolo: 'D.Lgs. 142/2015',
      sotto: 'Accoglienza dei richiedenti protezione internazionale',
      coord: 'Testo coordinato con il d.l. 100/2026 (art. 10) e d.lgs. 115/2026 — versione precedente e modifiche per articolo',
    },
    {
      slug: 'dlgs-251-2007',
      titolo: 'D.Lgs. 251/2007',
      sotto: 'Qualifiche: status di rifugiato e protezione sussidiaria',
      coord: 'Testo vigente con rinvii navigabili',
    },
    {
      slug: 'dl-100-2026',
      titolo: 'D.L. 100/2026',
      sotto: 'Prima attuazione italiana del Patto UE su migrazione e asilo',
      coord: 'Testo vigente — convertito senza modificazioni dalla l. 145/2026; artt. 1, 2 e 16 modificati dal d.l. 144/2026, art. 17 dal d.l. 168/2026',
    },
    {
      slug: 'dl-168-2026',
      titolo: 'D.L. 168/2026',
      sotto: 'Regime transitorio del Patto prorogato al 30 aprile 2027; il documento rilasciato alla registrazione vale un anno e consente il lavoro',
      coord: "Testo vigente, in conversione — l'art. 4 modifica l'art. 17 del d.l. 100/2026",
    },
    {
      slug: 'dlgs-115-2026',
      titolo: 'D.Lgs. 115/2026',
      sotto: 'Tratta di esseri umani: attuazione della direttiva (UE) 2024/1712',
      coord: 'Testo vigente — modifica gli artt. 18 T.U. immigrazione, 17 d.lgs. 142/2015 e 32 d.lgs. 25/2008',
    },
  ],
};
