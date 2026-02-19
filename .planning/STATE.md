# Project State: SOS Permesso

**Last Updated:** 2026-02-19
**Status:** Milestone v4.1 avviato — requirements definiti, roadmap in creazione

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.1 Prassi & Note Editoriali — Phase 55 (Bug Fixes)

## Current Position

**Current Milestone:** v4.1 Prassi & Note Editoriali
**Phase:** Not started (Phase 55 è il prossimo)
**Plan:** —
**Status:** Defining roadmap
**Last activity:** 2026-02-19 — Milestone v4.1 avviato, requirements approvati

```
Progress: No active phase — run /gsd:plan-phase 55
```

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
- **notion-webhook.mjs**: già scritto ma non necessario per v4.1 — non usare
- **Voting rinviato**: `vote-prassi.mjs` esiste ma non viene attivato in v4.1
- **PRASSI_DB_ID**: env var nelle Netlify Functions (ok), hardcoded in `_data/prassiLocali.js` (da fixare)
- **Build Hook URL**: segreto assoluto — mai in git o client-side code

### Blockers/Concerns

- `@notionhq/client` v5 ha cambiato `parent.database_id` → `parent.data_source_id` in alcuni contesti — `submit-prassi.mjs` usa vecchio pattern, da verificare live prima di tutto il resto (Phase 56)
- Build Hook URL da non esporre pubblicamente — budget 300 min/mese su free tier

## Session Continuity

**Last session:** 2026-02-19
**Stopped at:** Requirements approvati, roadmap in creazione
**Resume with:** `/gsd:plan-phase 55`
**Resume file:** None

---

*This file is the single source of truth for project state. Update after every significant change.*
