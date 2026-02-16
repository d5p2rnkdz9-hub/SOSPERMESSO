---
phase: 44-costi-section
plan: 01
subsystem: ui
tags: [notion, liquid, css, costs, document-pages]

# Dependency graph
requires:
  - phase: 39-document-pages
    provides: "Document page templates and data layer"
provides:
  - "Cost breakdown section on all document pages (primo + rinnovo)"
  - "extractCost() helper for parsing costs from Notion multi_select values"
affects: [content-validation, document-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Parse structured data from Notion multi_select labels (regex extraction)"

key-files:
  created: []
  modified:
    - "_data/documents.js"
    - "src/pages/documents-primo.liquid"
    - "src/pages/documents-rinnovo.liquid"
    - "src/styles/document-page.css"

key-decisions:
  - "Cost data parsed from existing multi_select fields (no new Notion columns needed)"
  - "Kit postale 30€ hardcoded in template when method is KIT"
  - "Variable bollettino amounts: extract first number from entries like '70.46 o 80.46'"

patterns-established:
  - "extractCost(documents, keyword): regex-based cost extraction from document name lists"

# Metrics
duration: 10min
completed: 2026-02-16
---

# Phase 44 Plan 01: Costi Section Summary

**Cost breakdown section on document pages — bollettino, marca da bollo, and conditional kit postale parsed from Notion multi_select values with itemized list and bold total**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-16
- **Completed:** 2026-02-16
- **Tasks:** 2 auto + 1 checkpoint (approved)
- **Files modified:** 4

## Accomplishments
- Cost data extracted from existing Notion "Doc primo rilascio" / "Doc rinnovo" multi_select fields
- 35 of 65 primo pages show cost section (those with cost data); 30 correctly hidden
- Itemized breakdown: bollettino postale, marca da bollo, conditional kit postale (30€ for KIT method)
- Bold total sums all applicable costs
- "Quanto costa" anchor link in page header for quick navigation
- Responsive CSS with mobile and print support

## Task Commits

1. **Task 1: Extract cost data from Notion** - `25949a7` (feat)
2. **Task 2: Add costi section to templates and CSS** - `b740c82` (feat)

## Files Created/Modified
- `_data/documents.js` — Added `extractCost()` helper and costBollettino/costMarcaBollo fields to primo/rinnovo arrays
- `src/pages/documents-primo.liquid` — Costi section HTML + anchor link
- `src/pages/documents-rinnovo.liquid` — Costi section HTML + anchor link
- `src/styles/document-page.css` — Cost list, total, anchor link styles + responsive + print

## Decisions Made
- **Cost data source:** Parse amounts from existing Notion multi_select values using regex (e.g., "bollettino postale da 70.46€" → 70.46). No new Notion columns needed.
- **Variable amounts:** For entries like "70.46 o 80.46", extract first number
- **Kit postale:** Fixed 30€ in template, not from Notion, conditional on method containing "kit"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cost columns don't exist as separate Notion properties**
- **Found during:** Task 1 (Notion column discovery)
- **Issue:** Plan assumed cost data in dedicated Notion columns. Actual data is embedded in multi_select document name entries.
- **Fix:** Created `extractCost()` helper that parses amounts from multi_select values using regex
- **Files modified:** _data/documents.js
- **Verification:** 35/65 pages correctly extract costs
- **Committed in:** 25949a7

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Extraction approach changed but end result identical. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Costi section complete, cost data renders on all document pages with data
- Ready for Phase 45 (Content Validation)

---
*Phase: 44-costi-section*
*Completed: 2026-02-16*
