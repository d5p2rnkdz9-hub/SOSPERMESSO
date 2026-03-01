# Project State: SOS Permesso

**Last Updated:** 2026-03-01
**Status:** v4.2 roadmap created — ready to plan Phase 60

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.2 Page Restructure — Phase 60 (IT Template Restructure)

## Current Position

Phase: 60 of 61 (IT Template Restructure)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-03-01 — v4.2 roadmap created, 9/9 requirements mapped

Progress: [░░░░░░░░░░] 0% (0/5 plans complete across phases 60-61)

## Accumulated Context

### Carried Forward

- Content validation pass (deferred da v3.1) — dizionario links funzionano IT/EN/FR
- 2 permits senza Q&A in Notion (Tirocinio, Lavoro artistico) — solo IT, non tradotti EN/FR
- "Segnala errore" button mancante su pagine documento (primo/rinnovo) — tech debt, fuori scope v4.2
- Language switcher da spostare in main nav — tech debt, fuori scope v4.2
- Prassi locali backend (submit, moderation, automation) — dropped da v4.1, codice esiste non wired

### Phase 60 Context

- 3 templates da modificare: `src/pages/permits.liquid` (IT), `en/src/pages/permits-en.liquid` (EN), `fr/src/pages/permits-fr.liquid` (FR)
- Prassi JS esiste in `src/scripts/prassi.js` — accordion può riusarlo
- Tab badges esistenti: Cos'è / Primo / Rinnovo — aggiungere Prassi locali come 4° badge
- CSS sticky: `position: sticky; top: 0` sul contenitore dei badge (verificare z-index vs header)
- Accordion: collassato di default; label "Nessuna segnalazione finora" quando vuoto

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-03-01
**Stopped at:** Roadmap created for v4.2
**Resume with:** `/gsd:plan-phase 60`
**Resume file:** .planning/ROADMAP.md

---

*This file is the single source of truth for project state. Update after every significant change.*
