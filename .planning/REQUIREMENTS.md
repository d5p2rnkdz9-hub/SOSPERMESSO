# Requirements: SOS Permesso v4.1

**Defined:** 2026-02-19
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v4.1 Requirements

### Bug Fixes

- [ ] **BUG-01**: Note editoriali visibili su pagine documento — fix nome campo `"Info extra su doc rilascio"` → `"Info extra su doc rilascio/rinnovo"` in `_data/documents.js` e `_data/permits.js`
- [ ] **BUG-02**: `PRASSI_DB_ID` hardcoded in `_data/prassiLocali.js` (consistente con pattern dei data file; resta env var nelle Netlify Functions)

### Prassi — Submission

- [ ] **PRAS-01**: `submit-prassi.mjs` funzionante in produzione — env var `PRASSI_DB_ID` configurata in Netlify, parent field `@notionhq/client` v5 verificato (`database_id` vs `data_source_id`) e corretto se necessario
- [ ] **PRAS-02**: Endpoint resistente allo spam — honeypot field nel form HTML + validazione server-side (lunghezza minima/massima descrizione)
- [ ] **PRAS-03**: Rate limiting configurato su `submit-prassi` via Netlify config export
- [ ] **PRAS-04**: CORS headers presenti su tutti i response path (200, 400, 429, 500) — non solo happy path

### Prassi — Automation

- [ ] **AUTO-01**: Netlify Build Hook creato, URL salvato come segreto in Netlify dashboard (mai in git o client-side)
- [ ] **AUTO-02**: Notion Automation configurata: quando "Status" → "Approvato" → POST al Build Hook → rebuild automatico del sito
- [ ] **AUTO-03**: Flow end-to-end validato: submit form → Notion row "Pending" → admin approva → rebuild → voce compare sul sito nella pagina documento corretta

### Moderation

- [ ] **MOD-01**: Notion DB prassi ha view "Da approvare" filtrata su Status=Pending (facilita review admin)

### Note Editoriali dai Blocchi Notion

- [ ] **NOTES-01**: `documents.js` fetcha i blocchi di ogni pagina Notion (stessa logica di `permits.js`) e li parsa in sezioni Q&A, con supporto cache per non aumentare il build time
- [ ] **NOTES-02**: Pagine documento (primo + rinnovo) mostrano sezione "Note" in fondo con Q&A provenienti dai blocchi — sezione assente se la pagina non ha blocchi (graceful degradation)

## Future Requirements (v4.2+)

### Voting

- **VOTE-01**: `vote-prassi.mjs` funzionante in produzione — vote confermo/non confermo aggiornano contatori Notion
- **VOTE-02**: Server-side rate limiting su `vote-prassi` (prevenzione vote bombing)
- **VOTE-03**: Verifica che l'ID votato appartenga al DB prassi (sicurezza)

### Tech Debt

- **DEBT-01**: "Segnala errore" button ripristinato su pagine documento (primo/rinnovo)
- **DEBT-02**: Language switcher integrato nella main nav bar (attualmente dropdown separato)
- **DEBT-03**: `prassiLocali.js` migrato da `notion.search()` a `notion.databases.query()` (efficienza)

## Out of Scope

| Feature | Motivo |
|---------|--------|
| `vote-prassi.mjs` activation | Rinviato a v4.2 — priorità bassa, submission è il flusso critico |
| `notion-webhook.mjs` (Notion API webhook) | Non necessario — Notion Automation (piano a pagamento) è più semplice e già sufficiente |
| ES Translation (v4.1 originale) | Rinviato a v4.2 — priorità inferiore rispetto a far funzionare prassi |
| Real-time vote counts senza rebuild | Non allineato con architettura build-time |
| User accounts / autenticazione | Fuori scope — sistema anonimo per design |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 55 | Pending |
| BUG-02 | Phase 55 | Pending |
| PRAS-01 | Phase 56 | Pending |
| PRAS-02 | Phase 57 | Pending |
| PRAS-03 | Phase 57 | Pending |
| PRAS-04 | Phase 56 | Pending |
| AUTO-01 | Phase 58 | Pending |
| AUTO-02 | Phase 58 | Pending |
| AUTO-03 | Phase 59 | Pending |
| MOD-01 | Phase 58 | Pending |
| NOTES-01 | Phase 60 | Pending |
| NOTES-02 | Phase 60 | Pending |

**Coverage:**
- v4.1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 — added NOTES-01, NOTES-02 (Phase 60: note editoriali da blocchi Notion)*
