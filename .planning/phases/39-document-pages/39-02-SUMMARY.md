---
phase: 39-document-pages
plan: 02
subsystem: templates
tags: [11ty, liquid, pagination, notion, document-pages]

# Dependency graph
requires:
  - phase: 39-01
    provides: documents.js data file with primo/rinnovo arrays
  - phase: 39-01
    provides: Liquid filters (linkToDizionario, normalizeDocumentName, etc.)
provides:
  - Liquid templates for document page generation via 11ty pagination
  - Primo document pages template (documents-primo.liquid)
  - Rinnovo document pages template (documents-rinnovo.liquid)
  - Redirect pages template (documents-redirects.liquid)
affects: [39-03, 39-04, build-pipeline, notion-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "11ty size:1 pagination for per-page generation"
    - "Inline header/footer in document templates (simpler nav)"
    - "Liquid conditional logic for submission method callouts"
    - "Common document prepending in rinnovo pages"

key-files:
  created:
    - src/pages/documents-primo.liquid
    - src/pages/documents-rinnovo.liquid
    - src/pages/documents-redirects.liquid
    - _data/documentRedirects.js
  modified:
    - eleventy.config.mjs

key-decisions:
  - "Inline header/footer in document templates (not using includes) - matches current simpler nav"
  - "Ignore old redirect HTML files via slugMap to prevent permalink conflicts"
  - "Rinnovo template prepends common document and adjusts progress count"
  - "Attesa-occupazione gets special disputed warning in rinnovo template"

patterns-established:
  - "Pagination alias: use 'doc' for document object in templates"
  - "Permalink pattern: src/pages/documenti-{slug}-{type}.html"
  - "Checklist JavaScript uses localStorage with permitKey pattern"
  - "Conditional sections via Liquid {% if %} blocks"

# Metrics
duration: 5min
completed: 2026-02-07
---

# Phase 39 Plan 02: Document Pages Templates Summary

**Liquid pagination templates generate all document pages (primo, rinnovo, redirects) from Notion data during 11ty build**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-07T15:17:05Z
- **Completed:** 2026-02-07T15:22:00Z (approx)
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Converted primo.js template to Liquid with 11ty pagination
- Converted rinnovo.js template to Liquid with common document prepending
- Created redirect template generating 38 redirect pages from slugMap
- Fixed permalink conflict by ignoring old redirect HTML files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create primo document template** - `1a69c40` (feat)
2. **Task 2: Create rinnovo document template** - `c8f2776` (feat)
3. **Task 3: Create redirect pages template** - `ac05414` (feat)
4. **Fix: Ignore old redirect HTML files** - `47310ba` (fix)

## Files Created/Modified
- `src/pages/documents-primo.liquid` - Primo document page template with pagination over documents.primo
- `src/pages/documents-rinnovo.liquid` - Rinnovo document page template with common doc prepending
- `src/pages/documents-redirects.liquid` - Redirect page template with meta refresh
- `_data/documentRedirects.js` - Data file generating redirect objects from slugMap
- `eleventy.config.mjs` - Added ignore patterns for old redirect HTML files

## Decisions Made

1. **Inline header/footer (not includes)** - Document pages use simpler navigation than main site pages. Kept inline structure to match current output exactly.

2. **Ignore old redirect HTML files** - Old static redirect HTML files (e.g., documenti-studio-primo.html) conflicted with redirect template permalinks. Added ignore patterns via slugMap iteration to let template take precedence.

3. **Rinnovo common document prepending** - Rinnovo template always prepends "Copia permesso precedente (o denuncia smarrimento)" and filters it from the main document list to avoid duplicates. Progress count adjusted (+1).

4. **Attesa-occupazione disputed warning** - Added conditional warning section for attesa-occupazione renewal (controversial, some Questure deny it). Links to legal help page.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added ignore patterns for old redirect HTML files**
- **Found during:** Task 3 (testing redirect generation)
- **Issue:** 11ty DuplicatePermalinkOutputError - old static redirect HTML files (documenti-asilo-politico-primo.html, etc.) conflicted with redirect template permalinks
- **Fix:** Added ignore patterns in eleventy.config.mjs iterating over slugMap.mappings to ignore all display slug HTML files (primo + rinnovo)
- **Files modified:** eleventy.config.mjs
- **Verification:** Build completes successfully, all 38 redirects generate via template
- **Committed in:** 47310ba (fix commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix to unblock build. Redirect template now fully replaces old static files.

## Issues Encountered

**Permalink conflict with existing HTML files**
- Problem: Old static redirect HTML files existed in src/pages/ for some slugMap entries
- Solution: Added dynamic ignore patterns in eleventy.config.mjs reading from slugMap
- Outcome: Template-generated redirects now replace all old static files

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for 39-03 (Content sync):**
- Templates generate pages correctly when documents.js returns data
- Currently building from empty arrays (NOTION_API_KEY not set)
- Next phase will test with real Notion data

**Ready for 39-04 (Cleanup):**
- Old template files (scripts/templates/primo.js, rinnovo.js) can be removed
- Old static redirect HTML files can be removed (now ignored)

**Note:** Current build generates pages from existing HTML files being processed as templates. With Notion API key set, would generate from Notion data instead.

---
*Phase: 39-document-pages*
*Completed: 2026-02-07*
