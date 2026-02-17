---
phase: 47-notion-cache
plan: 01
subsystem: infra
tags: [notion, cache, build-performance, fs, commonjs, node]

# Dependency graph
requires: []
provides:
  - scripts/notion-cache.js — shared cache module (loadPagesIndex, savePagesIndex, getBlocks, setBlocks, clearCache)
  - cache-aware _data/permits.js — skips block fetches when last_edited_time unchanged
  - npm run cache:clear — deletes .notion-cache/ for fresh re-fetch
affects:
  - 47-02 (documents.js block cache, if added)
  - 48-translate (will use cache to detect which permits need re-translation)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Notion cache pattern: compare last_edited_time string equality to skip block fetches"
    - "Cache module follows translation-memory.js pattern: fs/promises, graceful miss, CommonJS"

key-files:
  created:
    - scripts/notion-cache.js
  modified:
    - _data/permits.js
    - _data/documents.js
    - package.json
    - .gitignore

key-decisions:
  - "Cache blocks only (not search results) — search is fast, blocks are slow"
  - "Compare last_edited_time with strict string !== (not Date objects) to avoid timezone parsing issues"
  - "If getBlocks() returns null despite index hit, treat as miss and re-fetch (safety net)"
  - "documents.js gets only a log line — no block cache needed since it fetches no blocks"
  - "Cache dir at project root (.notion-cache/), not inside scripts/ — matches .gitignore convention"

patterns-established:
  - "Cache module pattern: CACHE_DIR constant, loadIndex/saveIndex, get/setBlocks, clearCache — reuse for Phase 48"
  - "Hit/miss logging: [permits.js] Cache: N hits, N misses — visible in every build output"

# Metrics
duration: 3min
completed: 2026-02-17
---

# Phase 47 Plan 01: Notion Cache Summary

**File-based Notion block cache using last_edited_time comparison, reducing repeat builds from ~15s to near-zero Notion API calls (41 hits, 0 misses on second build)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-17T23:27:24Z
- **Completed:** 2026-02-17T23:30:00Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Created `scripts/notion-cache.js` with 6 exports following the translation-memory.js CommonJS pattern
- Integrated cache into `_data/permits.js`: compares `last_edited_time` string to decide hit/miss, saves/loads block JSON per page
- Second build confirmed: 41 cache hits, 0 Notion API block calls
- `npm run cache:clear` deletes `.notion-cache/` cleanly
- `.notion-cache/` gitignored, never committed

## Task Commits

Each task was committed atomically:

1. **Task 1: Create notion-cache.js module and wire into permits.js** - `6b788ff` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `scripts/notion-cache.js` — Shared Notion response cache module (new)
- `_data/permits.js` — Cache-aware block fetching with hit/miss logging
- `_data/documents.js` — Added log line noting search-only (no blocks)
- `package.json` — Added `cache:clear` script
- `.gitignore` — Added `.notion-cache/` exclusion

## Decisions Made
- Cache blocks only, not search results: search is fast (~1 API call), block fetching is the bottleneck (41 calls × 350ms = ~15s)
- Strict string equality for `last_edited_time`: avoids timezone parsing edge cases
- Safety net: if `getBlocks()` returns null despite index match, re-fetch from Notion (guards against corrupted/deleted cache files)
- `documents.js` gets no block cache — it only runs a search, not block fetches

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cache infrastructure is in place and verified working for Phase 47-02 and Phase 48
- Phase 48 (translation pipeline) can use `loadPagesIndex()` to detect which permits changed since last translation run
- `CACHE_DIR` is exported for external scripts that need to inspect cache state

---
*Phase: 47-notion-cache*
*Completed: 2026-02-17*
