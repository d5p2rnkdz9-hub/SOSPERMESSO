---
phase: 52-notion-database
plan: 01
subsystem: database
tags: [notion, translation, french, fr, 11ty, data-files]

# Dependency graph
requires:
  - phase: 51-translation-infrastructure
    provides: translate-notion.js script parameterized for multi-language, FR glossary, translation memory infrastructure
provides:
  - FR Notion database populated with translated permit content (39/41 permits)
  - _data/permitsFr.js fetching FR permit data with IT slug resolution
  - _data/documentsFr.js fetching FR document data with FR cost keyword fallbacks
  - scripts/translation-memory/it-fr.json with 1333 cached IT→FR translations
affects: [53-page-generation, fr language templates, language switcher]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FR data files mirror EN pattern: hardcoded DB ID constant, IT slug resolution via IT Page ID property"
    - "FR cost extraction: bollettino || bordereau || postal payment; marca da bollo || timbre || revenue stamp"

key-files:
  created:
    - _data/permitsFr.js
    - _data/documentsFr.js
    - scripts/translation-memory/it-fr.json
  modified:
    - .env (NOTION_DATABASE_FR_ID appended)
    - .notion-cache/translation-index-fr.json (created by translate script)
    - .notion-cache/translation-index-en.json (migrated from translation-index.json)

key-decisions:
  - "52-01: fr-db-id=b7955daa — FR Notion database hardcoded in data files (not env var), matches Netlify deployment pattern"

patterns-established:
  - "FR keyword fallbacks: Add language-specific cost keywords as || fallback chains in extractCost calls"

# Metrics
duration: 45min
completed: 2026-02-18
---

# Phase 52 Plan 01: FR Notion Database Summary

**FR Notion database created and populated with 39 translated permits; `_data/permitsFr.js` and `_data/documentsFr.js` feed 11ty with hardcoded DB ID `b7955daa-3da7-4a0c-ac9d-0bbe4ba7d70e`**

## Performance

- **Duration:** ~45 min (including 15-20 min translation API time)
- **Started:** 2026-02-18T00:00:00Z
- **Completed:** 2026-02-18
- **Tasks:** 3 (Task 1 = checkpoint resolved before this session; Tasks 2-3 executed)
- **Files modified:** 3 created, 2 auto-updated by script

## Accomplishments
- Ran `npm run translate:fr` — created FR Notion database under same parent as EN (b7955daa-3da7-4a0c-ac9d-0bbe4ba7d70e)
- Translated 39/41 IT permits to French via Claude API (2 skipped: no Q&A content — Lavoro artistico, Tirocinio)
- Created `_data/permitsFr.js` mirroring `permitsEn.js` pattern with FR-specific emoji keywords
- Created `_data/documentsFr.js` with FR cost keyword fallbacks (bordereau, timbre)
- Build confirmed: 39 FR permits and 39 primo/rinnovo document entries fetched without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Checkpoint decision (resolved by user)** — no commit
2. **Task 2: Run FR translation and create data files** - `fbb2958` (feat)
3. **Task 3: Verify build fetches FR data** — no file changes (build verification only)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `_data/permitsFr.js` — 11ty data file for FR permit pages; hardcoded FR_DATABASE_ID; IT slug resolution
- `_data/documentsFr.js` — 11ty data file for FR document pages; FR cost keyword fallbacks (bordereau, timbre)
- `scripts/translation-memory/it-fr.json` — 1333 cached IT→FR translations for incremental re-translation
- `.env` — NOTION_DATABASE_FR_ID=b7955daa-3da7-4a0c-ac9d-0bbe4ba7d70e appended by translate script
- `.notion-cache/translation-index-fr.json` — FR translation state (39 entries)
- `.notion-cache/translation-index-en.json` — migrated from old translation-index.json by translate script

## Decisions Made
- **FR_DATABASE_ID hardcoded** as string constant `"b7955daa-3da7-4a0c-ac9d-0bbe4ba7d70e"` in both data files (not env var), consistent with IT and EN pattern

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- Pre-existing `DuplicatePermalinkOutputError` in `en/src/pages/permits-en.liquid` caused 11ty build to fail after data fetch step. This is unrelated to FR data files (confirmed present before any FR changes) — it's caused by untracked EN static HTML files conflicting with the liquid pagination template. FR data fetching itself completed without errors (39 permits, 39 documents). This pre-existing issue is out of scope for this plan.

## User Setup Required
None — no external service configuration required. FR DB ID is hardcoded in data files.

## Next Phase Readiness
- FR data files ready for Phase 53 (FR page generation via Liquid templates)
- Need to create: `fr/src/pages/permits-fr.liquid`, `fr/src/pages/documents-primo-fr.liquid`, `fr/src/pages/documents-rinnovo-fr.liquid`
- Need static pages: `fr/index.html`, `fr/src/pages/database.html`, `fr/src/pages/documenti-questura.html`
- Pre-existing `DuplicatePermalinkOutputError` should be investigated before Phase 53 deployment

---
*Phase: 52-notion-database*
*Completed: 2026-02-18*
