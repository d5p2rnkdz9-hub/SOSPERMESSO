---
phase: 13-collabora-dropdown
plan: 01
subsystem: ui
tags: [navigation, typeform, dropdown, header]

# Dependency graph
requires:
  - phase: 12-footer-redesign
    provides: Updated footer with contact link
provides:
  - Collabora dropdown template in index.html
  - Corrected Typeform URL documentation
  - New forms: Segnala un errore (FsqvzdXI), Dai una mano (USx16QN3)
affects: [14-propagation]

# Tech tracking
tech-stack:
  added: []
  patterns: [dropdown navigation with external links]

key-files:
  created: []
  modified:
    - src/pages/index.html
    - CLAUDE.md
    - .planning/codebase/INTEGRATIONS.md

key-decisions:
  - "Collabora dropdown follows existing Database/Guide/Test pattern"
  - "href=#collabora makes trigger non-navigating"
  - "External Typeform links use target=_blank"

patterns-established:
  - "Collabora dropdown: trigger-only with 3 items (Segnala un errore, Dai una mano, Il progetto)"
  - "Typeform URL pattern: form.typeform.com/to/[form_id]"

# Metrics
duration: 4min
completed: 2026-01-27
---

# Phase 13 Plan 01: Collabora Dropdown Summary

**Collabora dropdown with Segnala un errore and Dai una mano Typeform links, plus fixed broken contact URL references**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-27T08:48:26Z
- **Completed:** 2026-01-27T08:52:30Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Replaced "Il progetto" nav link with Collabora dropdown in index.html
- Added Segnala un errore form link (FsqvzdXI) for error reporting
- Added Dai una mano form link (USx16QN3) for contact/help
- Removed broken sospermesso.typeform.com/contatti references from documentation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Collabora dropdown to index.html header** - `d7bb8bd` (feat)
2. **Task 2: Clean up broken Typeform URL in CLAUDE.md** - `abd076c` (docs)
3. **Task 3: Update INTEGRATIONS.md Typeform documentation** - `befa986` (docs)

## Files Created/Modified
- `src/pages/index.html` - Added Collabora dropdown replacing Il progetto link
- `CLAUDE.md` - Fixed broken Typeform URL (sospermesso.typeform.com/contatti -> form.typeform.com/to/USx16QN3)
- `.planning/codebase/INTEGRATIONS.md` - Updated Typeform documentation with all current forms

## Decisions Made
- Followed existing dropdown pattern (Database/Guide/Test) for consistency
- Used `href="#collabora"` for trigger to prevent navigation (matches existing dropdowns)
- External links (Typeform) use `target="_blank"` for new tab
- Internal link (chi-siamo.html) has no target attribute

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Filename case: File tracked as `claude.md` in git but referenced as `CLAUDE.md` in plan. macOS filesystem is case-insensitive but git uses lowercase. Used correct git path for commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- index.html has working Collabora dropdown template
- Ready for Phase 14 to propagate dropdown to all 90+ pages
- Existing CSS handles dropdown styling automatically

---
*Phase: 13-collabora-dropdown*
*Completed: 2026-01-27*
