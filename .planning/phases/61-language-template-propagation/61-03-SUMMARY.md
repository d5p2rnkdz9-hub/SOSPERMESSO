---
phase: 61-language-template-propagation
plan: "03"
subsystem: ui
tags: [liquid, 11ty, multilingual, en, permit-pages, prassi, tab-bar]

# Dependency graph
requires:
  - phase: 60-permit-page-restructure
    provides: IT template restructure (sticky tab bar, prassi accordion, CTA/Remember repositioning)
  - phase: 61-02
    provides: FR template as second reference for translation pattern
provides:
  - EN permit template (permits-en.liquid) with full Phase 60 structural parity
  - Sticky permit-tab-bar div with 4 English badges (What is it / First Issue / Renewal / Local practices)
  - scrollToSection JS measuring header+breadcrumb+tabbar height offsets
  - Prassi accordion section with English strings (No reports yet, I confirm, I do not confirm, Be the first to share)
  - CTA at page bottom, Remember alert before checklist in rinnovo section
  - extraStyles frontmatter block removed (CSS in shared stylesheet)
affects:
  - future language templates (pattern established: IT/EN/FR all structurally identical, only text differs)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Language template parity: all three language templates (IT/EN/FR) have identical structure; only text strings differ"
    - "prassiLocali data binding via prassiLocali[permit.slug] — same pattern across all languages"
    - "Prassi modal URL uses language-prefixed path: https://sospermesso.it/en/permesso-{slug}.html"

key-files:
  created: []
  modified:
    - en/src/pages/permits-en.liquid

key-decisions:
  - "extraStyles frontmatter block removed — tab-badge CSS was already in shared stylesheet, inline block was a holdover from earlier work"
  - "4th badge 'Local practices' added — original EN template was missing this badge entirely (only 3 badges vs IT's 4)"
  - "Remember alert moved before checklist — matches IT and FR order (submit context before the list)"

patterns-established:
  - "All language templates (IT/EN/FR) are structurally identical — only text strings differ. Enforced by this gap closure."

requirements-completed:
  - I18N-01
  - I18N-02

# Metrics
duration: 2min
completed: 2026-03-02
---

# Phase 61 Plan 03: EN Permit Template Phase 60 Gap Closure Summary

**EN permit template restructured to match IT/FR structure: sticky 4-badge tab bar with scrollToSection, prassi accordion with English strings, CTA moved to page bottom, Remember alert moved before rinnovo checklist, extraStyles removed**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-02T16:26:38Z
- **Completed:** 2026-03-02T16:28:58Z
- **Tasks:** 2 (1 code change + 1 read-only verification)
- **Files modified:** 1

## Accomplishments

- Applied all 6 Phase 60 structural gaps to `en/src/pages/permits-en.liquid`
- Removed `extraStyles` frontmatter block (CSS in shared stylesheet)
- Replaced inline tab badges in page header with sticky `permit-tab-bar` div outside section, adding missing 4th "Local practices" badge
- Added `scrollToSection` JS function measuring actual header/breadcrumb/tabbar heights for accurate scroll offset
- Removed CTA from inside `<section id="cose">` and placed at page bottom after prassi section
- Moved Remember alert from after checklist to before it in rinnovo section
- Added full prassi accordion section with English strings (heading, subtitle, vote labels, empty/populated states, modal button)
- Added `prassi.js` script include
- Confirmed no Italian text leaks and no structural order violations

## Task Commits

1. **Task 1: Restructure EN permit template with all Phase 60 changes** - `44d812f` (feat)
2. **Task 2: Verify structural parity with IT and FR templates** - read-only, no commit needed

## Files Created/Modified

- `en/src/pages/permits-en.liquid` - Full restructure to match IT/FR structure with English strings

## Decisions Made

- extraStyles block removed since tab-badge CSS ships in the shared stylesheet. The inline block was a holdover that differed from how IT and FR already work.
- The 4th badge ("Local practices") was missing from the original EN template — added to match IT/FR (both have 4 badges). This is a gap, not a new feature.
- Remember alert moved before the `doc-checklist` div to match IT/FR order — users should see the 60-day reminder before starting to check off documents.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The existing EN content (checklist, cost calculations, submission callouts, related links) was preserved exactly — only structural reordering and additions were needed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three language templates (IT/EN/FR) now have identical structure
- Phase 61 gap closure complete (61-01 was incorrectly recorded in STATE.md as done; 61-03 was the actual EN gap closure plan)
- Ready for next milestone planning

---
*Phase: 61-language-template-propagation*
*Completed: 2026-03-02*
