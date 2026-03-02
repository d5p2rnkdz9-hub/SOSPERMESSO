---
phase: 61-language-template-propagation
plan: "02"
subsystem: ui
tags: [liquid, 11ty, multilingual, french, permits, prassi, tab-bar]

# Dependency graph
requires:
  - phase: 60-page-restructure
    provides: IT permit template with sticky tab bar, prassi accordion, repositioned CTA and Rappel alert
  - phase: 61-01
    provides: EN permit template updated as pattern reference for FR
provides:
  - FR permit template (fr/src/pages/permits-fr.liquid) with all Phase 60 structural changes
  - Sticky tab bar with 4 French badges (Qu'est-ce que c'est / Premier Titre / Renouvellement / Pratiques locales)
  - scrollToSection JS with measured offsets in FR template
  - Prassi accordion section with French strings
  - CTA at page bottom after prassi (not inline after Q&A)
  - Rappel alert before rinnovo checklist (not after it)
  - prassi.js script include
affects:
  - any future FR template changes
  - language consistency audits

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FR permit template structure now matches IT/EN exactly: sticky tab bar → Q&A → Primo → Rinnovo → Prassi accordion → checklist script → prassi.js → CTA → Related"
    - "scrollToSection measures actual header/breadcrumb/tabbar heights at runtime for precise scroll offset"
    - "Tab badge CSS in shared stylesheet (no inline extraStyles in frontmatter)"

key-files:
  created: []
  modified:
    - fr/src/pages/permits-fr.liquid

key-decisions:
  - "Removed extraStyles frontmatter block — tab-badge CSS is already in shared stylesheet, matches IT pattern"
  - "permit-tab-bar appears twice in template (HTML element + getElementById JS reference) — this is correct, matching IT"

patterns-established:
  - "All language permit templates (IT/EN/FR) now share identical structure, only text strings differ"

requirements-completed:
  - I18N-02

# Metrics
duration: 2min
completed: 2026-03-02
---

# Phase 61 Plan 02: FR Permit Template Propagation Summary

**FR permit template updated to match IT/EN structure: sticky tab bar with 4 French badges, prassi accordion, CTA at page bottom, Rappel alert before checklist**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-02T15:32:41Z
- **Completed:** 2026-03-02T15:35:24Z
- **Tasks:** 2 (Task 1: apply changes, Task 2: verify structure)
- **Files modified:** 1

## Accomplishments
- Extracted tab badges from page header into sticky `permit-tab-bar` div outside the header section
- Added `scrollToSection` JS function that measures actual DOM heights (header + breadcrumb + tabbar) for smooth scroll
- Added 4th tab badge "Pratiques locales" (was missing from old FR template which only had 3)
- Moved CTA "Contactez-nous" from inside Q&A section to page bottom after prassi accordion
- Moved "Rappel" alert from after checklist card to before it (correct order: alert → checklist)
- Added full prassi locali accordion section with French strings (city groups, vote counts, empty state)
- Added `prassi.js` script include after checklist persistence script
- Removed `extraStyles` frontmatter block (CSS is in shared stylesheet, not needed inline)

## Task Commits

Each task was committed atomically:

1. **Task 1+2: Apply Phase 60 structural changes to FR permit template** - `b5b070b` (feat)

**Plan metadata:** (see docs commit below)

## Files Created/Modified
- `fr/src/pages/permits-fr.liquid` - FR permit template with all Phase 60 structural changes: sticky tab bar, scrollToSection JS, prassi accordion, repositioned CTA and Rappel alert

## Decisions Made
- Removed `extraStyles` from frontmatter — the `.tab-badge` CSS is already in the shared stylesheet. The old FR template had this as an inline style block which was a holdover from when the stylesheet hadn't been updated yet.
- `permit-tab-bar` appears twice (HTML div + getElementById) — same as IT reference, not a bug.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The plan's automated verify for Task 1 checked `grep -c "permit-tab-bar" | grep -q "1"` expecting count 1, but count is 2 (HTML div + getElementById call). This matches the IT reference template exactly. The Task 2 node structural check is the authoritative verification and passes fully.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 61 is now complete: both EN (61-01) and FR (61-02) permit templates have been updated with all Phase 60 structural changes
- All three language permit templates (IT/EN/FR) now have identical structure
- v4.2 Page Restructure milestone is complete
- No blockers for future work

---
*Phase: 61-language-template-propagation*
*Completed: 2026-03-02*
