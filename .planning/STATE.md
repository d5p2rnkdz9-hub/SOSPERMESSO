# Project State: SOS Permesso

**Last Updated:** 2026-01-28
**Status:** v1.7 Database Content Reviewed — IN PROGRESS

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-28)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** Phase 16 — Permit Build System

## Current Position

**Milestone:** v1.7 Permit Page Redesign + Homepage Cleanup
**Phase:** 16 (in progress)
**Plan:** 1 of 3 complete
**Status:** Plan 01 complete, Plan 02 next
**Last activity:** 2026-01-28 — Completed 16-01-PLAN.md

```
Milestones:

v1.1 Documenti Questura    [Shipped 2026-01-25] ##########
v1.2 Visual Refresh        [Shipped 2026-01-26] ##########
v1.3 Header/Nav Fix        [Shipped 2026-01-26] ##########
v1.4 Error + Dropdowns     [Shipped 2026-01-27] ##########
v1.5 Footer + Collabora    [Shipped 2026-01-28] ##########
v1.6 Document Dedup        [Shipped 2026-01-28] ##########
v1.7 Permit Redesign       [Active]             ###-------
```

Progress: [###-------] 33% (1/3 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 3 (this milestone)
- Average duration: 2.2min
- Total execution time: 6.6min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 15-document-deduplication | 2 | 4.6min | 2.3min |
| 16-permit-build-system | 1 | 2min | 2min |

*Updated after each plan completion*

## Shipped Milestones

**v1.6 Document Deduplication (2026-01-28):**
- 1 phase, 2 plans
- Key: CTA buttons on all 21 permit pages, zero inline document sections, 100% centralized document info

**v1.5 Footer + Collabora Navigation (2026-01-28):**
- 3 phases, 4 plans
- Key: Yellow footer with Il Progetto link (98 pages), Collabora dropdown with 4 items (98 pages)

**v1.4 Error + Dropdowns (2026-01-27):**
- 1 phase, 3 plans
- Key: Error reporting button (86 pages), dropdown navigation (98 pages)

**v1.3 Header/Nav Fix (2026-01-26):**
- Mobile-only fixes
- Key: Hamburger menu working, white block removed, header sticks on scroll

**v1.2 Visual Refresh (2026-01-26):**
- 6 phases, 7 plans
- Key: Warm teal palette, new logo, reorganized homepage, white header

**v1.1 Documenti Questura (2026-01-25):**
- 3 phases, 4 plans
- Key: 63 document pages, Notion integration, interactive checklists

## Technical Debt

- Dizionario links need revision (partial matching works but coverage incomplete)
- Language switcher dropdown layout broken

## Design Patterns to Follow

- **Footer (IMPLEMENTED):** Yellow background (#FFD700), centered, copyright + "Il Progetto" link only
- **Navigation dropdowns:** CSS :hover + :focus-within, flat list on mobile
- **Collabora dropdown (IMPLEMENTED):** Trigger only (href=#collabora), four items: Segnala un errore, Posso convertire, Dai una mano, Il progetto
- **Typeform URLs:** form.typeform.com/to/[form_id] pattern
- **Layout:** Use `.category-section` and `.permit-list` structure
- **Color palette:** White header (#FFFFFF), teal menu text (#1A6B5F), warm gradients
- **CTA buttons (IMPLEMENTED):** Section with primary + secondary buttons linking to dedicated document pages, placed after page header
- **Permit template (NEW):** Use scripts/templates/permesso.js for generating permit pages

## Accumulated Context

### Decisions

Recent decisions affecting current work:
- Keep old footer-links CSS for backward compatibility during propagation (12-01)
- Use 0.8 opacity on footer copyright for subtle visual hierarchy (12-01)
- Collabora dropdown follows existing Database/Guide/Test pattern (13-01)
- href=#collabora makes trigger non-navigating (13-01)
- External Typeform links use target=_blank (13-01)
- Python regex for automated footer replacement ensures consistency (14-01)
- Relative path strategy: all Il Progetto links use same-directory chi-siamo.html (14-01)
- Posso CONVERTIRE added to Test dropdown (not Collabora) across all pages (14-02)
- Collabora dropdown has 3 items: Segnala un errore, Dai una mano, Il progetto (14-02)
- Single nav-menu structure for both desktop and mobile (14-02)
- Footer simplified to block+text-align layout for proper centering (14-fix)
- CTA buttons placed after page header (before content) for high visibility (15-01)
- Primary button for primo rilascio, secondary for rinnovo (15-01)
- Redirect stubs (documenti-X-primo.html) allow clean URLs while maintaining full content pages (15-01)
- Python automation for bulk HTML processing ensures consistency (15-02)
- Nested document subsections removed to avoid partial info contradicting CTA buttons (15-02)
- Visa documents (embassy) vs permit documents (Questura) are different, kept distinct (15-02)
- Border colors based on section keywords (cos'e=blue, requisiti=yellow, lavoro=red, conversione=teal) (16-01)
- Self-test block writes to test-permesso-output.html for manual verification (16-01)
- Template follows permesso-studio.html patterns (not primo.js simplified header) (16-01)

### Pending Todos

None — all v1.5 issues resolved.

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-01-28
**Stopped at:** Completed 16-01-PLAN.md
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md, ROADMAP.md
2. **Where we are:** v1.7 Phase 16 Plan 01 complete
3. **What to do next:** Run `/gsd:execute-phase 16` to continue with Plan 02 (build script)

---

*This file is the single source of truth for project state. Update after every significant change.*
