---
phase: 40-permit-pages
plan: 01
subsystem: data-layer
tags: [notion-api, eleventy, liquid, data-files, parsing]

# Dependency graph
requires:
  - phase: 39-document-pages
    provides: "documents.js data file pattern, graceful degradation, createRequire for ESM config"
  - phase: build-permits.js
    provides: "Q&A parsing functions, variant detection logic, emoji assignment"
provides:
  - "permits.js 11ty data file fetching and parsing permit Q&A from Notion"
  - "getSectionBorderColor Liquid filter for section card styling"
  - "Variant detection with parentSlug pre-computation for breadcrumbs"
affects: [40-02, 40-03, database.html]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Async data file pattern from Phase 39 adapted for permit pages"
    - "Function copying from build scripts (side-effect workaround)"

key-files:
  created:
    - _data/permits.js
  modified:
    - eleventy.config.mjs

key-decisions:
  - "Copied 9 parsing functions from build-permits.js instead of importing (side-effect issue)"
  - "Pre-compute parentSlug from detectVariants baseSlug for variant children"
  - "Add index field to sections for getSectionBorderColor filter"

patterns-established:
  - "Variant detection: parent objects have isVariantParent:true and variants array"
  - "Variant children include parentSlug field for breadcrumb navigation"
  - "Colored section borders via getSectionBorderColor filter matching keywords"

# Metrics
duration: 5min
completed: 2026-02-09
---

# Phase 40 Plan 01: Permit Data Layer Summary

**11ty data file fetching permit Q&A from Notion with variant detection and pre-parsed HTML sections**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-09T12:10:10Z
- **Completed:** 2026-02-09T12:15:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created permits.js data file fetching 41 permits from Notion with Q&A parsing
- Detected 1 variant group (3 children) and 38 standalone permits
- Registered getSectionBorderColor filter for keyword-based section card styling
- Pre-computed parentSlug field on variant children for breadcrumb navigation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create _data/permits.js data file** - `91b57bc` (feat)
2. **Task 2: Register getSectionBorderColor filter in eleventy.config.mjs** - `116e63e` (feat)

## Files Created/Modified
- `_data/permits.js` - Async data file returning array of permit objects with pre-parsed Q&A HTML, variant detection, graceful degradation
- `eleventy.config.mjs` - Added getSectionBorderColor filter for section card border colors

## Decisions Made

1. **Function copying strategy:** Copied 9 parsing functions from build-permits.js instead of importing because build-permits.js has side-effect code (`build().catch(...)` at bottom) that runs on require. Direct copy avoids unintended execution.

2. **parentSlug pre-computation:** Added parentSlug field to variant children during detectVariants processing (set to baseSlug from group). Critical for Liquid template breadcrumbs - templates can't compute this dynamically.

3. **Section index field:** Added index to each section during processing so getSectionBorderColor filter can use it for fallback color rotation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - parsing functions copied cleanly, variant detection worked on first run (detected 1 group with 3 children: "Lavoro subordinato a seguito di..." variants).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- permits.js data file ready for permit template (Plan 02)
- getSectionBorderColor filter registered and available in Liquid templates
- Variant structure matches existing HTML structure (parent pages in subfolders)
- Data includes isPlaceholder flag for permits without Q&A content

Blockers: None

---
*Phase: 40-permit-pages*
*Completed: 2026-02-09*
