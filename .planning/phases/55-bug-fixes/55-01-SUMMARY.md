---
phase: 55-bug-fixes
plan: 01
subsystem: data
tags: [notion, 11ty, data-files, field-name, hardcoded-id]

# Dependency graph
requires:
  - phase: 44-costs
    provides: "documents.js pattern for Notion property access (docNotes field introduced)"
provides:
  - "Correct Notion field name for editorial notes in all IT/EN/FR document data files"
  - "Hardcoded PRASSI_DB_ID constant in prassiLocali.js"
affects: [56-smoke-tests, 58-rebuild-automation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hardcode Notion DB IDs in _data/ files (consistent with documents.js, permits.js pattern)"

key-files:
  created: []
  modified:
    - "_data/documents.js"
    - "_data/permits.js"
    - "_data/documentsEn.js"
    - "_data/documentsFr.js"
    - "_data/prassiLocali.js"

key-decisions:
  - "Fix applied to EN/FR data files (documentsEn.js, documentsFr.js) even though not in plan — same bug, same root cause"

patterns-established:
  - "All Notion DB IDs hardcoded in _data/ files; only NOTION_API_KEY comes from process.env"

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 55 Plan 01: Bug Fixes Summary

**Corrected Notion property name `"Info extra su doc rilascio/rinnovo"` in 4 data files and hardcoded `PRASSI_DB_ID` in `prassiLocali.js`, unblocking editorial notes from appearing on document pages**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-19T16:33:26Z
- **Completed:** 2026-02-19T16:36:50Z
- **Tasks:** 3/3
- **Files modified:** 5

## Accomplishments

- Fixed Notion field name mismatch (`"Info extra su doc rilascio"` → `"Info extra su doc rilascio/rinnovo"`) so editorial notes actually populate on document pages (primo and rinnovo)
- Applied same fix to `documentsEn.js` and `documentsFr.js` (same bug, discovered during task 1)
- Replaced `process.env.PRASSI_DB_ID` with hardcoded constant in `prassiLocali.js`, matching the pattern used by all other data files
- Full build completed cleanly: 405 pages written in 80.5 seconds, no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Notion field name in documents.js and permits.js** - `ea0bb10` (fix)
2. **Task 2: Hardcode PRASSI_DB_ID in prassiLocali.js** - `9e00967` (fix)
3. **Task 3: Verify build passes** - *(no commit — verification only task)*

**Plan metadata:** *(docs commit follows)*

## Files Created/Modified

- `_data/documents.js` - Corrected Notion property name for `docNotesRichText` to `"Info extra su doc rilascio/rinnovo"`
- `_data/permits.js` - Same fix for permit page data file
- `_data/documentsEn.js` - Same fix for EN document data file (deviation auto-fix)
- `_data/documentsFr.js` - Same fix for FR document data file (deviation auto-fix)
- `_data/prassiLocali.js` - Replaced `process.env.PRASSI_DB_ID` with hardcoded `"3027355e7f7f80f6957ec3107a5f7aa4"`

## Decisions Made

- Applied the field name fix to `documentsEn.js` and `documentsFr.js` even though not in plan — they had the identical bug (same old field name) and leaving them broken would silently drop editorial notes from EN/FR document pages too.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Same Notion field name bug in documentsEn.js and documentsFr.js**

- **Found during:** Task 1 (fixing documents.js and permits.js)
- **Issue:** Grep of `_data/` revealed that `_data/documentsEn.js` and `_data/documentsFr.js` both had the same wrong field name `"Info extra su doc rilascio"` (without `/rinnovo`), causing EN and FR document pages to also silently receive no editorial notes
- **Fix:** Applied the same `"Info extra su doc rilascio/rinnovo"` correction to both files
- **Files modified:** `_data/documentsEn.js`, `_data/documentsFr.js`
- **Verification:** `grep "Info extra su doc rilascio" _data/` shows `/rinnovo` suffix in all four files; build passes
- **Committed in:** `ea0bb10` (same Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — same root cause, extended scope)
**Impact on plan:** Fix extended to 4 files instead of 2. All EN/FR document pages now benefit from editorial notes. No scope creep.

## Issues Encountered

None — build passed cleanly on first attempt. `prassiLocali.js` correctly returned 0 pages (no approved prassi in DB yet, which is expected at this stage).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 55 plan 01 complete; editorial notes now flow from Notion to all IT/EN/FR document pages
- `PRASSI_DB_ID` is hardcoded and consistent with the rest of the codebase
- Phase 56 (Function Smoke Tests: PRAS-01, PRAS-04) is the next phase to plan and execute

---
*Phase: 55-bug-fixes*
*Completed: 2026-02-19*
