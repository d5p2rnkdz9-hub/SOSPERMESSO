/**
 * NORMATIVA ITALIANA — testi coordinati interattivi (pagina /normativa.html).
 *
 * I testi sono il bundle statico in `public/patto-interattivo/`, servito a
 * `/patto-interattivo/<slug>/` (mapping in eleventy.config.mjs). Ogni testo è
 * un'app autonoma: sommario, rinvii cliccabili, modifiche evidenziate.
 * Provengono dalla pipeline di sospatto.it — per aggiornarli si risostituisce
 * la cartella del bundle, non si modifica l'HTML a mano.
 *
 * `verificaData` è la data dell'ultimo controllo dei testi su Normattiva.
 */
module.exports = {
  verificaData: '10 luglio 2026',

  // Il decreto che ha introdotto le modifiche evidenziate nei testi coordinati
  decreto: {
    label: 'd.l. 12 giugno 2026, n. 100',
    nota: 'in corso di conversione',
  },

  testi: [
    {
      slug: 'dlgs-286-1998',
      titolo: 'D.Lgs. 286/1998',
      sotto: "Testo unico dell'immigrazione",
      coord: 'Testo coordinato con il d.l. 100/2026 (art. 12) — modifiche evidenziate',
      evidenza: true,
    },
    {
      slug: 'dlgs-25-2008',
      titolo: 'D.Lgs. 25/2008',
      sotto: 'Procedure per il riconoscimento della protezione internazionale',
      coord: 'Testo coordinato con il d.l. 100/2026 (art. 11) — modifiche evidenziate',
    },
    {
      slug: 'dlgs-142-2015',
      titolo: 'D.Lgs. 142/2015',
      sotto: 'Accoglienza dei richiedenti protezione internazionale',
      coord: 'Testo coordinato con il d.l. 100/2026 (art. 10) — modifiche evidenziate',
    },
    {
      slug: 'dlgs-251-2007',
      titolo: 'D.Lgs. 251/2007',
      sotto: 'Qualifiche: status di rifugiato e protezione sussidiaria',
      coord: 'Testo vigente con rinvii navigabili',
    },
  ],
};
