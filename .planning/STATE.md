---
gsd_state_version: 1.0
milestone: v4.2
milestone_name: Page Restructure
status: completed
stopped_at: Completed 60-03-PLAN.md — Phase 60 fully done
last_updated: "2026-03-02T13:57:19.622Z"
progress:
  total_phases: 45
  completed_phases: 40
  total_plans: 80
  completed_plans: 75
---

# Project State: SOS Permesso

**Last Updated:** 2026-03-01
**Status:** Milestone complete

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v4.2 Page Restructure — Phase 61 (Language Template Propagation)

## Current Position

Phase: 61 of 61 (Language Template Propagation)
Plan: 0 of 2 in current phase (not started)
Status: Phase 60 complete — ready to start Phase 61
Last activity: 2026-03-01 — Completed 60-03-PLAN.md (CTA relocation, Ricorda alert move, visual verification)

Progress: [█████░░░░░] 60% (3/5 plans complete across phases 60-61)

## Accumulated Context

### Carried Forward

- Content validation pass (deferred da v3.1) — dizionario links funzionano IT/EN/FR
- 2 permits senza Q&A in Notion (Tirocinio, Lavoro artistico) — solo IT, non tradotti EN/FR
- "Segnala errore" button mancante su pagine documento (primo/rinnovo) — tech debt, fuori scope v4.2
- Language switcher da spostare in main nav — tech debt, fuori scope v4.2
- Prassi locali backend (submit, moderation, automation) — dropped da v4.1, codice esiste non wired

### Phase 60 Context (Complete)

Phase 60 delivered the full IT template restructure across 3 plans:
- 60-01: Sticky tab bar with 4 badges (Cos'è / Primo / Rinnovo / Prassi locali), CSS stacking
- 60-02: Prassi section replaced with compact collapsible accordion, CSS-only toggle via aria-expanded + max-height transition
- 60-03: CTA "Hai altre domande?" moved to page bottom before Related links; "Ricorda: entro 60 giorni" moved before Rinnovo checklist

### Phase 61 Context

Apply all Phase 60 changes to EN and FR templates:
- Templates to modify: `en/src/pages/permits-en.liquid` (61-01), `fr/src/pages/permits-fr.liquid` (61-02)
- Sticky tab bar: same CSS already applies (shared stylesheet), need to add HTML tab-bar markup and update section IDs
- Accordion pattern: `button.prassi-accordion-header[aria-expanded] + div.prassi-accordion-body`, inline onclick, `max-height: 0/2000px` transition — same as IT
- CTA: same Typeform URL (G6YT01Vj), text in target language
- Ricorda alert: text in target language, same position (before checklist)
- `scrollToSection()` JS function must be copied to EN/FR templates — replaces CSS scroll-margin-top
- Language-specific strings: keep EN/FR text, do not let Italian leak

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-03-01
**Stopped at:** Completed 60-03-PLAN.md — Phase 60 fully done
**Resume with:** `/gsd:execute-phase 61 01`
**Resume file:** .planning/phases/61-language-template-propagation/61-01-PLAN.md (to be created)

---

*This file is the single source of truth for project state. Update after every significant change.*
