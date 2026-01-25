---
phase: 02-document-templates
plan: 02
subsystem: ui
tags: [nodejs, notion, templates, html, css, print-styles, localstorage, javascript]

# Dependency graph
requires:
  - phase: 02-document-templates
    plan: 01
    provides: Notion client module, build infrastructure
  - phase: 01-page-foundation
    provides: restructured documenti-questura.html with badge links, dizionario.html
provides:
  - Primo rilascio and rinnovo HTML templates with interactive checklists
  - Document page CSS with print styles
  - Dizionario term linking (partial matching)
  - 63 generated document pages from Notion data
  - localStorage persistence for checkbox state
affects: [03-complete-coverage, documenti-questura-landing]

# Tech tracking
tech-stack:
  added: []
  patterns: [template-modules, localstorage-checklist, partial-term-matching, print-css]

key-files:
  created:
    - scripts/templates/primo.js
    - scripts/templates/rinnovo.js
    - scripts/templates/dizionario-map.json
    - scripts/templates/helpers.js
    - src/styles/document-page.css
    - src/pages/documenti-*-primo.html (31 files)
    - src/pages/documenti-*-rinnovo.html (32 files)
  modified:
    - scripts/notion-client.js
    - scripts/build-documents.js

key-decisions:
  - "Partial matching for dizionario links - term 'Kit postale' matches 'kit postale' or 'KIT POSTALE'"
  - "Checkbox only triggers on checkbox click, not label text - using <span> instead of <label>"
  - "Removed non-existent permit info link from templates - only valid links included"
  - "Compact layout for document page - smaller callout, tighter spacing"
  - "Softer page title styling - not black, using gray-dark"

patterns-established:
  - "Template modules: generatePrimoPage() and generateRinnovoPage() functions"
  - "Dizionario linking: linkToDizionario() with partial matching and case normalization"
  - "Checklist persistence: localStorage keyed by permit slug and type"
  - "Print styles: hide header/footer, show checkbox symbols, optimize for A4/Letter"

# Metrics
duration: ~25min
completed: 2026-01-25
---

# Phase 2 Plan 2: Document Templates Summary

**63 document pages generated from Notion data with interactive checklists, localStorage persistence, print styles, and dizionario term linking**

## Performance

- **Duration:** ~25 min (across checkpoint pause)
- **Started:** 2026-01-25T13:XX:XXZ
- **Completed:** 2026-01-25T14:XX:XXZ
- **Tasks:** 5 (4 auto + 1 checkpoint)
- **Files created:** 70 (5 source files + 63 generated pages + 2 config files)

## Accomplishments

- Created document page CSS with checklist styles, submission callouts, print styles, and mobile responsiveness
- Built dizionario mapping with partial term matching for linking document names to definitions
- Implemented primo and rinnovo template modules generating complete HTML pages
- Generated 63 document pages (31 primo + 32 rinnovo) from Notion database
- Applied checkpoint review fixes: compact layout, softer titles, checkbox-only click behavior, working dizionario links

## Task Commits

Each task was committed atomically:

1. **Task 1: Create document page CSS with print styles** - `5d4d1cd` (feat)
2. **Task 2: Create dizionario mapping and helper functions** - `fefabd3` (feat)
3. **Task 3: Create primo and rinnovo template modules** - `2a303d3` (feat)
4. **Task 4: Complete build script with page generation** - `ea85bc8` (feat)
5. **Task 5 (checkpoint): Human verification and fixes** - `de13731` (fix)

## Files Created/Modified

**Created:**
- `src/styles/document-page.css` - Document page styles with checklist, callout, print CSS, responsive design
- `scripts/templates/dizionario-map.json` - Mapping of document names to dizionario anchor IDs
- `scripts/templates/helpers.js` - Helper functions: linkToDizionario(), getDocumentClass(), isDisputed()
- `scripts/templates/primo.js` - Primo rilascio template with generatePrimoPage() function
- `scripts/templates/rinnovo.js` - Rinnovo template with generateRinnovoPage() function
- `src/pages/documenti-*-primo.html` - 31 primo rilascio document pages
- `src/pages/documenti-*-rinnovo.html` - 32 rinnovo document pages

**Modified:**
- `scripts/notion-client.js` - Fixed database ID and API calls for @notionhq/client v5
- `scripts/build-documents.js` - Complete implementation with page generation

## Decisions Made

- **Partial matching for dizionario links:** Changed from exact match to partial matching with case normalization. This allows terms like "Kit postale" to match "kit postale" or "KIT POSTALE" in the dizionario.
- **Checkbox-only click behavior:** Changed `<label>` to `<span>` for document names so only clicking the actual checkbox toggles the check state, not clicking the text.
- **Removed permit info link:** Templates originally included a "Vuoi sapere di piu su questo permesso?" link, but since permit info pages don't exist for all types, this was removed to avoid broken links.
- **Compact layout:** Reduced callout size, tightened spacing, and used softer (not black) title styling per review feedback.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed notion-client.js API calls for v5**
- **Found during:** Task 4 (Build script testing)
- **Issue:** API calls using wrong method names for @notionhq/client v5
- **Fix:** Updated to use correct v5 API methods and database ID
- **Files modified:** scripts/notion-client.js
- **Committed in:** de13731

**2. [Rule 1 - Bug] Fixed checkbox triggering on text click**
- **Found during:** Task 5 (Checkpoint verification)
- **Issue:** Clicking document name text toggled checkbox due to `<label for="">` behavior
- **Fix:** Changed `<label>` to `<span>` for document name display
- **Files modified:** scripts/templates/primo.js, scripts/templates/rinnovo.js
- **Committed in:** de13731

**3. [Rule 1 - Bug] Fixed dizionario links not working**
- **Found during:** Task 5 (Checkpoint verification)
- **Issue:** linkToDizionario() used exact string matching, failed for case differences
- **Fix:** Implemented partial matching with case normalization
- **Files modified:** scripts/templates/helpers.js
- **Committed in:** de13731

**4. [Rule 1 - Bug] Removed broken permit info link**
- **Found during:** Task 5 (Checkpoint verification)
- **Issue:** Template linked to permesso-{slug}.html pages that don't exist for all permit types
- **Fix:** Removed the "Vuoi sapere di piu" link section from templates
- **Files modified:** scripts/templates/primo.js, scripts/templates/rinnovo.js
- **Committed in:** de13731

---

**Total deviations:** 4 auto-fixed (4 bugs)
**Impact on plan:** All fixes necessary for correct functionality. No scope creep.

## Issues Encountered

- Notion client API changed between versions - required updating method calls
- Dizionario term matching was too strict - resolved with partial matching
- Checkpoint verification revealed several UX issues that were fixed before approval

## User Setup Required

Same as 02-01 - Notion API key must be configured for build to generate pages.

## Next Phase Readiness

- 63 document pages now exist and are accessible from documenti-questura.html
- All primo/rinnovo badges should now link to working pages
- Print styles functional for users who want paper checklists
- Ready for Phase 3: Complete Coverage (any remaining permit types, additional features)

**Verified by user:**
- Compact layout working
- Title/subtitle styling correct (not black, softer font)
- Smaller Kit postale card
- Checkbox only ticks on box click, not text
- Dizionario links working with partial matching

---
*Phase: 02-document-templates*
*Completed: 2026-01-25*
