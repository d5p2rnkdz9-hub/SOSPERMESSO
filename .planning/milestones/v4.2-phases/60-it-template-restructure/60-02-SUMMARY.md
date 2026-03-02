---
phase: 60-it-template-restructure
plan: 02
subsystem: ui
tags: [liquid, css, accordion, prassi, permits, 11ty]

# Dependency graph
requires:
  - phase: 60-01
    provides: sticky tab bar with Prassi locali badge linking to #prassi-locali anchor
provides:
  - Compact collapsible accordion replacing full-width prassi section in permits.liquid
  - Accordion CSS with collapsed-by-default, smooth expand/collapse, chevron rotation
  - Empty state "Nessuna segnalazione finora" with CTA for no-content permits
  - Mobile responsive accordion at 768px and 480px breakpoints
affects:
  - 60-03 (EN template — same accordion pattern applies to permits-en.liquid)
  - Any future plan touching prassi display or prassi.js integration

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Accordion via aria-expanded + max-height CSS transition — no extra JS file needed"
    - "Inline onclick toggle: setAttribute + classList.toggle in one line"
    - "Collapsed-by-default: max-height: 0 + overflow: hidden; expanded: max-height: 2000px"
    - "Chevron rotation via CSS attribute selector: [aria-expanded='true'] .chevron"

key-files:
  created: []
  modified:
    - src/pages/permits.liquid
    - src/styles/prassi.css

key-decisions:
  - "Used inline onclick for toggle instead of separate JS — keeps accordion self-contained with 1 line"
  - "max-height: 2000px for expanded state — large enough for any content, transition handles visuals"
  - "Preserved .prassi-card structure inside accordion body so prassi.js enhanceVotingUI still works"
  - "Empty state wrapped in .prassi-accordion container for visual consistency"

patterns-established:
  - "Accordion pattern: button.prassi-accordion-header[aria-expanded] + div.prassi-accordion-body"
  - "Same pattern should be used in EN/FR template equivalents (60-03+)"

requirements-completed:
  - PRASSI-01
  - PRASSI-02
  - PRASSI-03

# Metrics
duration: 1min
completed: 2026-03-01
---

# Phase 60 Plan 02: Prassi Accordion Summary

**Compact collapsible accordion with city-grouped cards, CSS-only toggle via aria-expanded + max-height transition, and empty-state placeholder — no new JS required**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-01T18:05:43Z
- **Completed:** 2026-03-01T18:07:12Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced full-width prassi section with compact accordion collapsed by default
- City names are keyboard-accessible `<button>` headers with count badge and animated chevron
- Empty state shows "Nessuna segnalazione finora" with emoji and CTA button
- Vote JS (`prassi.js enhanceVotingUI`) still works — `.prassi-card[data-prassi-id]` preserved
- Mobile responsive breakpoints added at 768px and 480px

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace prassi section with compact accordion in template** - `dfcf197` (feat)
2. **Task 2: Add accordion CSS styles to prassi.css** - `9307d45` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/pages/permits.liquid` - Prassi section replaced with accordion HTML (collapsed by default, empty state, city headers, card bodies)
- `src/styles/prassi.css` - Accordion styles added: `.prassi-accordion`, `.prassi-accordion-item`, `.prassi-accordion-header`, `.prassi-accordion-body`, `.prassi-accordion-city`, `.prassi-accordion-count`, `.prassi-accordion-chevron`, `.prassi-accordion-empty`; mobile breakpoints updated

## Decisions Made
- Used inline onclick for toggle (`this.setAttribute` + `this.nextElementSibling.classList.toggle`) instead of a named JS function — keeps the accordion fully self-contained without needing prassi.js changes
- `max-height: 2000px` for expanded state (instead of `auto`) because CSS transitions cannot animate to `auto` — large fixed value ensures all content is visible while still animating from 0
- Empty state wrapped in `.prassi-accordion` container (not standalone `prassi-empty-state`) for visual consistency — single white card appearance whether empty or populated

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- IT template accordion complete
- 60-03 (EN template) should apply same pattern to `en/src/pages/permits-en.liquid`
- No blockers

---
*Phase: 60-it-template-restructure*
*Completed: 2026-03-01*
