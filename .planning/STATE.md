---
gsd_state_version: 1.0
milestone: v4.2
milestone_name: Page Restructure
status: completed
stopped_at: Completed 61-03-PLAN.md — EN permit template gap closure; Phase 61 done
last_updated: "2026-03-02T16:44:24.674Z"
progress:
  total_phases: 46
  completed_phases: 41
  total_plans: 82
  completed_plans: 77
---

# Project State: SOS Permesso

**Last Updated:** 2026-03-02
**Status:** v4.2 milestone complete

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** Planning next milestone

## Current Position

Milestone: v4.2 Page Restructure — SHIPPED 2026-03-02
Status: Between milestones
Last activity: 2026-03-02 — v4.2 milestone archived

Progress: [██████████] 100%

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

### Phase 61 Context (Complete)

Phase 61 propagated all Phase 60 changes to EN and FR templates:
- 61-02: FR permit template updated (permits-fr.liquid) — same structural changes with French strings, added missing "Pratiques locales" tab badge
- 61-03: EN permit template updated (permits-en.liquid) — sticky tab bar with scrollToSection, prassi accordion (English strings), CTA at bottom, Remember alert before checklist, missing 4th badge "Local practices" added, extraStyles removed

**Key pattern:** All three language templates (IT/EN/FR) now have identical structure. Only text strings differ. extraStyles frontmatter blocks removed from EN/FR (CSS in shared stylesheet).

### Decisions (Phase 61)

| Decision | Rationale | Plan |
|----------|-----------|------|
| Remove extraStyles frontmatter from EN/FR | Tab-badge CSS is in shared stylesheet; inline block was a holdover | 61-02, 61-03 |
| permit-tab-bar appears twice (HTML + getElementById) | Same as IT reference — not a bug | 61-02 |
| EN had only 3 tab badges (missing "Local practices") | Gap closure added 4th badge to match IT/FR | 61-03 |

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-03-02
**Stopped at:** v4.2 milestone archived
**Resume with:** `/gsd:new-milestone`
**Resume file:** None

---

*This file is the single source of truth for project state. Update after every significant change.*
