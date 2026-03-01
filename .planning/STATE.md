# Project State: SOS Permesso

**Last Updated:** 2026-03-01
**Status:** Phase 60 in progress — 60-02 complete (prassi accordion)

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.2 Page Restructure — Phase 60 (IT Template Restructure)

## Current Position

Phase: 60 of 61 (IT Template Restructure)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-03-01 — Completed 60-02 (prassi accordion — compact collapsible, CSS-only toggle)

Progress: [████░░░░░░] 40% (2/5 plans complete across phases 60-61)

## Accumulated Context

### Carried Forward

- Content validation pass (deferred da v3.1) — dizionario links funzionano IT/EN/FR
- 2 permits senza Q&A in Notion (Tirocinio, Lavoro artistico) — solo IT, non tradotti EN/FR
- "Segnala errore" button mancante su pagine documento (primo/rinnovo) — tech debt, fuori scope v4.2
- Language switcher da spostare in main nav — tech debt, fuori scope v4.2
- Prassi locali backend (submit, moderation, automation) — dropped da v4.1, codice esiste non wired

### Phase 60 Context

- 3 templates da modificare: `src/pages/permits.liquid` (IT) ✓, `en/src/pages/permits-en.liquid` (EN), `fr/src/pages/permits-fr.liquid` (FR)
- Prassi JS esiste in `src/scripts/prassi.js` — accordion riusa `.prassi-card[data-prassi-id]`, nessuna modifica JS necessaria
- Tab badges esistenti: Cos'è / Primo / Rinnovo — Prassi locali badge aggiunto in 60-01 ✓
- CSS sticky: implementato in 60-01 ✓
- Accordion pattern stabilito in 60-02: `button.prassi-accordion-header[aria-expanded] + div.prassi-accordion-body`, inline onclick, `max-height: 0/2000px` CSS transition
- EN/FR templates devono replicare lo stesso pattern accordion (usare stessa struttura HTML e classi CSS)

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-03-01
**Stopped at:** Completed 60-02-PLAN.md (prassi accordion)
**Resume with:** `/gsd:execute-phase 60 03`
**Resume file:** .planning/phases/60-it-template-restructure/60-03-PLAN.md

---

*This file is the single source of truth for project state. Update after every significant change.*
