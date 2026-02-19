# Project State: SOS Permesso

**Last Updated:** 2026-02-19
**Status:** Phase 55 plan 01 complete — editorial notes fix applied, build passing

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.1 Prassi & Note Editoriali — Phase 55 complete (1/1 plan done)

## Current Position

**Current Milestone:** v4.1 Prassi & Note Editoriali
**Phase:** Phase 55 — Bug Fixes (complete)
**Plan:** 1 of 1 in current phase
**Status:** Phase 55 complete, ready for Phase 56
**Last activity:** 2026-02-19 — Completed 55-01-PLAN.md

```
Progress: [##--------] 1/5 phases complete
Next: /gsd:plan-phase 56
```

## Phases at a Glance

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 55 | Bug Fixes | BUG-01, BUG-02 | Complete |
| 56 | Function Smoke Tests | PRAS-01, PRAS-04 | Pending |
| 57 | Security Controls | PRAS-02, PRAS-03 | Pending |
| 58 | Rebuild Automation | AUTO-01, AUTO-02, MOD-01 | Pending |
| 59 | End-to-End Validation | AUTO-03 | Pending |

## Accumulated Context

### Carried Forward

- Content validation pass (deferred da v3.1) — dizionario links funzionano IT/EN/FR
- 2 permits senza Q&A in Notion (Tirocinio, Lavoro artistico) — solo IT, non tradotti EN/FR
- Old `scripts/build-sitemap.js` preservato ma inutilizzato
- `_includes/components/language-switcher.liquid` esiste ma non incluso
- "Segnala errore" button mancante su pagine documento (primo/rinnovo) — tech debt v4.2
- Language switcher da spostare in main nav — tech debt v4.2
- ES Translation rinviato a v4.2

### Decisioni chiave per v4.1

- **Notion Automation → Build Hook direttamente**: workspace su piano a pagamento, opzione semplice (no code)
- **notion-webhook.mjs**: già scritto ma non necessario per v4.1 — non usare, non puntare Notion Automation a questo endpoint (manca X-Notion-Signature, ritornerebbe 401)
- **Voting rinviato**: `vote-prassi.mjs` esiste ma non viene attivato in v4.1
- **PRASSI_DB_ID**: env var nelle Netlify Functions (ok), hardcoded in `_data/prassiLocali.js` (FIXATO in 55-01)
- **Build Hook URL**: segreto assoluto — mai in git o client-side code; se esposto, ruotarlo subito in Netlify Dashboard
- **Tutti i DB ID hardcoded in _data/**: pattern confermato (documents.js, permits.js, prassiLocali.js)
- **Field name Notion**: `"Info extra su doc rilascio/rinnovo"` (con /rinnovo) è il nome corretto — fix applicato a documents.js, permits.js, documentsEn.js, documentsFr.js

### Blockers/Concerns

- `@notionhq/client` v5 ha cambiato `parent.database_id` → `parent.data_source_id` in alcuni contesti — `submit-prassi.mjs` usa vecchio pattern, da verificare live in Phase 56 con curl prima di procedere
- CORS headers potrebbero mancare sui path di errore (400, 429, 500) — verificare ogni `return new Response(...)` in `submit-prassi.mjs` incluso il `catch` block
- Budget build Netlify: 300 min/mese free tier, ogni rebuild ~72s — Build Hook URL deve restare segreto

## Session Continuity

**Last session:** 2026-02-19
**Stopped at:** Completed 55-01-PLAN.md
**Resume with:** `/gsd:plan-phase 56`
**Resume file:** .planning/ROADMAP.md

---

*This file is the single source of truth for project state. Update after every significant change.*
