# Project State: SOS Permesso

**Last Updated:** 2026-03-01
**Status:** Milestone v4.2 started — defining requirements

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.2 Page Restructure

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-01 — Milestone v4.2 started

## Accumulated Context

### Carried Forward

- Content validation pass (deferred da v3.1) — dizionario links funzionano IT/EN/FR
- 2 permits senza Q&A in Notion (Tirocinio, Lavoro artistico) — solo IT, non tradotti EN/FR
- Old `scripts/build-sitemap.js` preservato ma inutilizzato
- `_includes/components/language-switcher.liquid` esiste ma non incluso
- "Segnala errore" button mancante su pagine documento (primo/rinnovo) — tech debt v4.2
- Language switcher da spostare in main nav — tech debt v4.2
- ES Translation rinviato a v4.2

### Notes

- v4.1 phases 56-59 (prassi backend, security, automation) dropped — code exists but not wired up
- Prassi locali MVP frontend (submit form, display) exists in `src/scripts/prassi.js`
- 3 language templates need parallel changes: IT (`permits.liquid`), EN (`permits-en.liquid`), FR (`permits-fr.liquid`)

## Session Continuity

**Last session:** 2026-03-01
**Stopped at:** Milestone v4.2 started
**Resume with:** Define requirements, then `/gsd:plan-phase`
**Resume file:** .planning/ROADMAP.md

---

*This file is the single source of truth for project state. Update after every significant change.*
