---
phase: 42-build-pipeline
plan: 01
subsystem: infra
tags: [eleventy, notion-api, build-automation, refactoring]

# Dependency graph
requires:
  - phase: 39-document-pages
    provides: _data/documents.js pattern for self-contained data files
  - phase: 40-permit-pages
    provides: _data/permits.js using notion-client.js
provides:
  - Single-step build command (npm run build)
  - Self-contained permits.js with inlined Notion client
  - Clean scripts/ directory with only active code
affects: [43-populate-blank-permits, 44-costi-section, all-future-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Self-contained data files with dotenv.config() at top
    - Single build command pattern (11ty only, no pre-build steps)

key-files:
  created: []
  modified:
    - _data/permits.js
    - package.json
    - .env.example

key-decisions:
  - "Inline notion-client.js into permits.js for self-contained pattern"
  - "Single build command eliminates two-step build (build:docs + build:11ty)"
  - "Delete 20 obsolete scripts to reduce maintenance confusion"

patterns-established:
  - "Data files are self-contained with inline Notion client instantiation"
  - "Build command is single-step: npx @11ty/eleventy"
  - "All obsolete migration/fix scripts deleted after changes committed"

# Metrics
duration: 11min
completed: 2026-02-14
---

# Phase 42 Plan 01: Build Pipeline Unification Summary

**Single-step build with self-contained permits.js, 20 obsolete scripts deleted, and documented environment variables**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-14T14:30:46+01:00
- **Completed:** 2026-02-14T14:41:35+01:00
- **Tasks:** 2
- **Files modified:** 23 (3 modified, 20 deleted)

## Accomplishments
- Unified build into single `npm run build` command (eliminates two-step build)
- Inlined notion-client.js functions into permits.js (self-contained like documents.js)
- Removed 20 obsolete scripts (build scripts, templates, one-time fix scripts)
- Documented all required environment variables in .env.example

## Task Commits

Each task was committed atomically:

1. **Task 1: Inline notion-client.js into permits.js and simplify build** - `9c8e033` (refactor)
   - Inlined fetchPermitData() and fetchPageBlocks() into _data/permits.js
   - Added require('dotenv').config() at top (CRITICAL - see MEMORY.md)
   - Created Notion client instance inside module.exports function
   - Simplified package.json build command to single step
   - Updated .env.example with all required env vars

2. **Task 2: Remove obsolete scripts and verify build** - `4c93290` (chore)
   - Deleted 5 build scripts (build-documents.js, build-permits.js, notion-client.js, manifest.json, slug-map.json)
   - Deleted 4 template files (primo.js, rinnovo.js, permesso.js, translation-prompt.txt)
   - Deleted 11 one-time fix scripts (already committed changes)
   - Verified helpers.js and dizionario-map.json remain (actively imported)
   - Verified build generates expected pages (43 permit pages, 81 document primo pages)

## Files Created/Modified

**Modified:**
- `_data/permits.js` - Inlined Notion client functions, removed notion-client.js dependency
- `package.json` - Single build command, removed build:docs and build:11ty scripts
- `.env.example` - Documented NOTION_API_KEY, NOTION_WEBHOOK_SECRET, NETLIFY_BUILD_HOOK_URL

**Deleted (20 files):**
- Build scripts: build-documents.js, build-permits.js, notion-client.js, manifest.json, slug-map.json
- Templates: primo.js, rinnovo.js, permesso.js, translation-prompt.txt
- Fix scripts: fix-all-footers.js, fix-breadcrumbs.js, fix-en-language-switcher.js, fix-en-paths.js, fix-header-structure.js, add-css-links.js, migrate-pages.js, remove-contact-footer.js, update-document-footers.js, update-emojis.js, update-privacy-label.js

**Preserved (actively imported):**
- `scripts/templates/helpers.js` - imported by eleventy.config.mjs and _data/permits.js
- `scripts/templates/dizionario-map.json` - imported by eleventy.config.mjs and helpers.js

## Decisions Made

**1. Inline notion-client.js into permits.js**
- Rationale: Matches the self-contained pattern established in documents.js (Phase 39)
- Benefits: No shared module dependency, easier to understand data file in isolation
- Pattern: Create Notion client inside module.exports function (after API key check)

**2. Delete all one-time fix scripts**
- Rationale: All changes from these scripts are committed to git history
- Benefits: Reduces confusion about which scripts are active vs. obsolete
- Pattern: Delete migration/fix scripts after their changes are committed

**3. Document all environment variables**
- Rationale: .env.example only had NOTION_API_KEY, missing webhook vars
- Benefits: Clear documentation of all required env vars for local development
- Added: NOTION_WEBHOOK_SECRET, NETLIFY_BUILD_HOOK_URL

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - both tasks executed as planned with all verifications passing.

## User Setup Required

None - no external service configuration required. Environment variables are already documented in .env.example.

## Next Phase Readiness

**Ready for:**
- Phase 42-02 (Webhook debouncing) - already complete (commit da43c84)
- Phase 42-03 (Content audit) - requires audit-content.js implementation
- Phase 42-04 (Build optimization) - build pipeline is now unified and ready for optimization

**Build performance baseline:**
- Current: ~6 minutes for full build (Notion API rate limiting at 350ms/permit)
- Bottleneck: Notion API requests for 60+ permits
- Optimization potential: Implement incremental builds based on last_edited_time

**Technical debt resolved:**
- ✓ Single-step build (was: two-step build:docs + build:11ty)
- ✓ Clean scripts/ directory (was: 20+ obsolete scripts)
- ✓ Self-contained data files (was: shared notion-client.js dependency)

---
*Phase: 42-build-pipeline*
*Completed: 2026-02-14*
