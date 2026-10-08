# PermitCard

Scheda di un singolo permesso nella pagina Database (`src/pages/database.html`).

- Fascia superiore `cat-*` con l'occhiello della categoria (Poppins 700, 13px, maiuscolo), poi il corpo bianco con il nome del permesso (h3, Poppins 800, 21px).
- Contorno `border-ui`, raggio `radius-lg`, ombra `sticker-md`.
- In fondo i pulsanti-pill (min 40px, bordo 2px `sp-ink`): **Cos'è** su `cat-*-tint`, poi **Primo rilascio** e **Rinnovo** su `sp-white`, ciascuno solo se esiste (`primoDocuments.size > 0`, `rinnovoDocuments.size > 0` oppure `rinnovoNonApplicabile`).
- Permesso segnaposto (`isPlaceholder`): corpo `sp-paper` con contorno tratteggiato, nessuna ombra, badge «In costruzione» tratteggiato e nessun pulsante.
- La categoria viene dal campo Notion `Categoria`: Studio/Lavoro → `cat-work`, Protezione → `cat-protection`, Cure Mediche → `cat-health`, Motivi Familiari → `cat-family`.
