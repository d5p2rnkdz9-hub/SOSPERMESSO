---
phase: 40-permit-pages
plan: 02
subsystem: templates
tags: [liquid, pagination, 11ty, permits, variant-pages]

# Dependency graph
requires:
  - phase: 40-permit-pages plan 01
    provides: "permits.js data file, getSectionBorderColor filter, variant detection"
  - phase: 39-document-pages plan 02
    provides: "Pagination template pattern, dynamic ignore pattern"
provides:
  - "permits.liquid pagination template generating all permit page types"
  - "Dynamic ignore patterns for 66 old static permit HTML files"
affects: [41-build-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single template with conditional rendering for 4 page types"
    - "Dynamic file ignore via fs.readdirSync in eleventy config"

key-files:
  created:
    - src/pages/permits.liquid
  modified:
    - eleventy.config.mjs
    - _data/permits.js

key-decisions:
  - "Single template with conditionals vs separate templates per type — single is cleaner"
  - "Dynamic ignore via readdirSync matches Phase 39 pattern for redirect conflicts"
  - "Deduplicate permits by slug to prevent permalink conflicts"

patterns-established:
  - "Conditional page rendering: isVariantParent / isPlaceholder / isVariantChild / standard"
  - "parentSlug usage in Liquid breadcrumbs (no slugify filter needed)"

# Metrics
duration: 7min
completed: 2026-02-09
---

# Phase 40 Plan 02: Permit Template Summary

**Liquid pagination template generating 4 permit page types with conditional rendering and old file conflict handling**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-09T12:20:00Z
- **Completed:** 2026-02-09T12:27:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 3

## Accomplishments
- Created permits.liquid template handling standard, placeholder, variant parent, and variant child pages
- Added dynamic ignore for 66 existing static permit HTML files preventing permalink conflicts
- User verified visual parity with current live pages
- Fixed duplicate slug bug in permits.js data (residenza-elettiva, motivi-religiosi)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create permits.liquid template** - `95168b4` (feat)
2. **Task 2: Handle permalink conflicts** - `11884ee` (feat)
3. **Task 3: Visual verification checkpoint** - approved by user

**Plan metadata:** (this commit)

## Files Created/Modified
- `src/pages/permits.liquid` - Single pagination template with conditional rendering for 4 page types
- `eleventy.config.mjs` - Dynamic ignore patterns for permesso-*.html files
- `_data/permits.js` - Deduplication fix for duplicate slugs

## Decisions Made

1. **Single template approach:** Used one permits.liquid with if/elsif/else for all 4 page types rather than separate templates. Cleaner and easier to maintain.

2. **Dynamic ignore via readdirSync:** Matches Phase 39 pattern. Reads src/pages/ directory and ignores all permesso-*.html files dynamically.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate slugs in permits data**
- **Found during:** Task 2 (permalink conflict verification)
- **Issue:** permits.js returned duplicate entries for `residenza-elettiva` and `motivi-religiosi`, causing DuplicatePermalinkOutputError even after ignoring static files
- **Fix:** Added deduplication logic at end of permits.js filtering by slug
- **Files modified:** `_data/permits.js`
- **Verification:** Build succeeds, logs show deduplication
- **Committed in:** `11884ee` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix necessary for build to succeed. No scope creep.

## Issues Encountered

None beyond the duplicate slug bug (auto-fixed).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All permit page types generate correctly via 11ty
- Build produces permesso-*.html files matching current URLs
- Visual parity verified by user
- Phase 40 complete, ready for Phase 41 (Build Pipeline)

Blockers: None

---
*Phase: 40-permit-pages*
*Completed: 2026-02-09*
