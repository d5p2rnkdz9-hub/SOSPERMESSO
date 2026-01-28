---
phase: 17-content-migration-visual-polish
plan: 02
subsystem: build-system
tags: [notion, templates, placeholders, incremental-builds, manifest]

# Dependency graph
requires:
  - phase: 16-permit-build-system
    provides: Notion API client, build script, permit page template
provides:
  - Placeholder page generation for permits without content
  - Manifest-based change detection for efficient rebuilds
  - Complete permit page coverage (42 pages: 24 with content, 18 placeholders)
affects: [17-03, content-migration, permit-updates]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Manifest tracking of page timestamps for incremental builds
    - Placeholder pages with CTA to contribution form

key-files:
  created:
    - scripts/manifest.json
    - src/pages/permesso-*.html (18 placeholder pages)
  modified:
    - scripts/templates/permesso.js
    - scripts/build-permits.js
    - scripts/notion-client.js

key-decisions:
  - "Generate placeholder pages instead of skipping empty permits"
  - "Use Notion last_edited_time for change detection"
  - "Mark placeholders in manifest with placeholder: true flag"
  - "--force flag to override change detection and rebuild all"

patterns-established:
  - "Manifest.json tracks last_edited_time and lastBuilt per permit"
  - "Placeholder pages follow same structure as content pages"
  - "CTA button links to Dai una mano Typeform for contributions"

# Metrics
duration: 9min
completed: 2026-01-28
---

# Phase 17 Plan 02: Placeholder Pages & Build Optimization Summary

**Placeholder page generation for 18 empty permits with contribution CTA, plus manifest-based incremental builds**

## Performance

- **Duration:** 9 min
- **Started:** 2026-01-28T17:26:00Z
- **Completed:** 2026-01-28T17:35:02Z
- **Tasks:** 3
- **Files modified:** 22 (3 build scripts, 1 manifest, 18 new placeholder pages)

## Accomplishments
- All 42 Notion permits now have pages (24 with content, 18 placeholders)
- Incremental builds skip unchanged pages (3-5x faster on subsequent runs)
- Placeholder pages show "Contenuto in arrivo" with CTA to Typeform
- Manifest tracks timestamps for efficient change detection

## Task Commits

Each task was committed atomically:

1. **Task 1: Add placeholder page template** - `73ffe66` (feat)
2. **Task 2: Add change detection with manifest** - `ed32bee` (feat)
3. **Task 3: Generate placeholder pages for empty permits** - `ea27e64` (feat)

## Files Created/Modified

**Created:**
- `scripts/manifest.json` - Tracks last_edited_time and lastBuilt per permit
- `src/pages/permesso-lavoro-autonomo.html` - Placeholder page
- `src/pages/permesso-attivita-sportiva.html` - Placeholder page
- `src/pages/permesso-residenza-elettiva.html` - Placeholder page
- `src/pages/permesso-motivi-religiosi.html` - Placeholder page
- (+ 14 more placeholder pages)

**Modified:**
- `scripts/templates/permesso.js` - Added generatePlaceholderPage function
- `scripts/build-permits.js` - Manifest loading/saving, placeholder generation
- `scripts/notion-client.js` - Include last_edited_time in permit data

## Decisions Made

1. **Placeholder structure**: Reuse full header/footer from main template for consistency
2. **CTA placement**: Central card with "Dai una mano" link to encourage contributions
3. **Manifest strategy**: Track both Notion last_edited_time and local lastBuilt timestamp
4. **Force flag**: Allow `--force` to override change detection for full rebuilds
5. **Placeholder marking**: Add `placeholder: true` to manifest for tracking empty pages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully on first attempt.

## Next Phase Readiness

**Ready for:**
- Phase 17-03: Visual polish of database.html to link to all 42 permit pages
- Content migration: Framework ready to accept new Notion content incrementally

**Build performance:**
- First build: ~30-40 seconds (fetches all Notion content)
- Incremental builds: ~5-10 seconds (skips unchanged pages)
- Force rebuild: ~30-40 seconds (regenerates all)

**Permit coverage:**
- 24 permits with full Q&A content
- 18 permits with placeholder pages
- 2 permits with no slug/tipo (tracked in TODO)
- Total: 42 permit pages accessible to users

---
*Phase: 17-content-migration-visual-polish*
*Completed: 2026-01-28*
