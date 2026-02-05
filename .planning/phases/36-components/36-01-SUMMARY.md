---
phase: 36-components
plan: 01
subsystem: ui
tags: [11ty, liquid, data-files, layouts]

# Dependency graph
requires:
  - phase: 35-setup
    provides: 11ty configuration with passthrough copy and HTML processing
provides:
  - Base layout template with complete HTML document structure
  - Site configuration data (name, URL, year)
  - Navigation data for IT/EN languages
  - Footer links data for IT/EN languages
  - _includes directory structure for component includes
affects: [36-02, 36-03, 37-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Liquid templates for layouts"
    - "CommonJS data files for global site data"
    - "Language-keyed data structures (it/en)"
    - "url filter for all asset paths"

key-files:
  created:
    - "_data/site.js"
    - "_data/nav.js"
    - "_data/footer.js"
    - "_includes/layouts/base.liquid"
  modified:
    - "eleventy.config.mjs"

key-decisions:
  - "CommonJS format for data files (matches existing eleventyComputed.js)"
  - "Language-keyed data structures for nav.js and footer.js"
  - "Root-relative paths for IT (/src/pages/...), EN prefix for EN (/en/src/pages/...)"
  - "external: true flag for Typeform links"

patterns-established:
  - "Data files use module.exports = {} CommonJS format"
  - "Nav/footer keyed by language code (it/en)"
  - "Base layout uses {{ '...' | url }} for all asset paths"

# Metrics
duration: 3min
completed: 2026-02-05
---

# Phase 36 Plan 01: Foundation Summary

**11ty data layer and base layout template for component extraction with IT/EN navigation and footer content**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-05T08:50:09Z
- **Completed:** 2026-02-05T08:53:30Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Site configuration data (name, URL, year, default description) accessible in templates
- Navigation dropdowns with IT/EN labels, including external link flags for Typeform
- Footer links keyed by language with root-relative paths
- Base layout template with complete HTML document structure
- 11ty config updated with explicit includes directory

## Task Commits

Each task was committed atomically:

1. **Task 1: Create data files for site config, navigation, and footer** - `e50ed50` (feat)
2. **Task 2: Create base layout template** - `66d4e6d` (feat)
3. **Task 3: Update 11ty config and verify build** - `ebd246c` (chore)

## Files Created/Modified
- `_data/site.js` - Site-wide configuration (name, URL, year, defaultDescription)
- `_data/nav.js` - Navigation items keyed by language (it/en) with 4 dropdowns each
- `_data/footer.js` - Footer links keyed by language (it/en)
- `_includes/layouts/base.liquid` - HTML document wrapper with doctype, head, body, scripts
- `eleventy.config.mjs` - Added includes: "_includes" to dir config

## Decisions Made
- Used CommonJS format (`module.exports = {}`) to match existing `_data/eleventyComputed.js`
- Navigation and footer data keyed by language code for easy access (`nav.it.dropdowns`, `footer.en.links`)
- All Typeform links marked with `external: true` for target="_blank" handling in Plan 02
- Base layout includes placeholder comments for header/footer includes (to be added in Plan 02)
- All asset paths use `{{ '...' | url }}` filter (12 usages in base.liquid) for proper path resolution

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Data files ready for template consumption
- Base layout ready for header/footer includes (Plan 02)
- `_includes/components/` directory created (empty, awaiting Plan 02)
- Build verified: 415 files in 0.29 seconds

---
*Phase: 36-components*
*Completed: 2026-02-05*
