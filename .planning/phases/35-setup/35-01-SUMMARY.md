---
phase: 35-setup
plan: 01
subsystem: infra
tags: [11ty, eleventy, ssg, build, passthrough-copy, permalink]

# Dependency graph
requires: []
provides:
  - 11ty v3.1.2 installed as devDependency
  - Build infrastructure that generates _site/ directory
  - URL preservation for all 415 HTML pages
  - Passthrough copy for all static assets
affects: [36-components, 37-pages, 38-deployment]

# Tech tracking
tech-stack:
  added: ["@11ty/eleventy@3.1.2"]
  patterns:
    - "ESM config file (eleventy.config.mjs)"
    - "Computed permalink via _data/eleventyComputed.js"
    - "Directory data files for nested page URLs"

key-files:
  created:
    - eleventy.config.mjs
    - _data/eleventyComputed.js
    - src/pages/pages.11tydata.json
    - en/src/pages/pages.11tydata.json
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Used .mjs extension for ESM support with existing CommonJS project"
  - "Global computed permalink function for all HTML files"
  - "Directory data files retained for explicitness even with global function"

patterns-established:
  - "Ignore pattern: .planning/, node_modules/, scripts/, *.md"
  - "Passthrough copy for asset directories (src/styles, src/scripts, etc.)"
  - "URL preservation: {{ page.filePathStem }}.html"

# Metrics
duration: 5min
completed: 2026-02-04
---

# Phase 35 Plan 01: 11ty Setup Summary

**11ty v3.1.2 installed with passthrough copy for assets and URL preservation for all 415 HTML pages**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-04T20:12:51Z
- **Completed:** 2026-02-04T20:17:55Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Installed 11ty v3.1.2 as devDependency with npm run build/dev scripts
- Configured passthrough copy for all static assets (styles, scripts, components, data, IMAGES, public, sitemaps)
- Implemented URL preservation using global computed permalink function
- All 415 HTML files build to identical paths (SEO/backward compatibility preserved)
- Build completes in ~0.28 seconds

## Task Commits

Each task was committed atomically:

1. **Task 1: Install 11ty and create configuration** - `105a30a` (feat)
2. **Task 2: Create directory data files for URL preservation** - `1b582d6` (feat)
3. **Task 3: Verify build and URL preservation** - `f657f94` (feat)

## Files Created/Modified
- `eleventy.config.mjs` - 11ty configuration with passthrough copy and ignores
- `_data/eleventyComputed.js` - Global computed permalink for URL preservation
- `src/pages/pages.11tydata.json` - IT page URL template
- `en/src/pages/pages.11tydata.json` - EN page URL template
- `package.json` - Added dev/build scripts and @11ty/eleventy devDependency
- `.gitignore` - Added _site/ to ignored directories

## Decisions Made
- **ESM config file:** Used `.mjs` extension because project has `"type": "commonjs"` in package.json. This allows 11ty config to use ESM syntax while keeping existing CommonJS scripts working.
- **Global computed permalink:** Created `_data/eleventyComputed.js` to handle all HTML files globally (including root-level 404.html and google*.html), rather than relying solely on directory data files.
- **Retained directory data files:** Kept `pages.11tydata.json` files for explicitness even though global function handles them, as defense-in-depth.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npm cache permission issue**
- **Found during:** Task 1 (11ty installation)
- **Issue:** npm cache directory had root ownership causing EACCES permission error
- **Fix:** Used `--cache /tmp/npm-cache-temp` flag to bypass corrupted cache
- **Verification:** Installation completed successfully
- **Committed in:** 105a30a (Task 1 commit)

**2. [Rule 3 - Blocking] ESM syntax error in CommonJS project**
- **Found during:** Task 1 (initial build)
- **Issue:** `export default` syntax failed because package.json has `"type": "commonjs"`
- **Fix:** Renamed config file from `.js` to `.mjs` for ESM support
- **Verification:** Build command executes without syntax errors
- **Committed in:** 105a30a (Task 1 commit)

**3. [Rule 3 - Blocking] .planning directory YAML parsing error**
- **Found during:** Task 1 (initial build)
- **Issue:** 11ty tried to process markdown files in .planning/ as templates, causing YAML front matter errors
- **Fix:** Added ignore rules for .planning/, node_modules/, scripts/, *.md, etc.
- **Verification:** Build skips documentation directories
- **Committed in:** 105a30a (Task 1 commit)

**4. [Rule 1 - Bug] Root HTML files getting directory-style URLs**
- **Found during:** Task 3 (verification)
- **Issue:** 404.html and google*.html were output as 404/index.html instead of 404.html
- **Fix:** Created _data/eleventyComputed.js with global permalink function
- **Verification:** All root-level HTML files now preserve .html extension
- **Committed in:** f657f94 (Task 3 commit)

**5. [Rule 2 - Missing Critical] EN asset passthrough attempted for non-existent directories**
- **Found during:** Task 1 (config creation)
- **Issue:** EN site doesn't have separate styles/scripts/components/data directories - uses IT assets via relative paths
- **Fix:** Removed passthrough copy for en/src/styles, en/src/scripts, etc.
- **Verification:** Build completes without errors for missing directories
- **Committed in:** 105a30a (Task 1 commit)

---

**Total deviations:** 5 auto-fixed (3 blocking, 1 bug, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for build to complete. No scope creep - all changes directly support the core objective of URL preservation.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 11ty build infrastructure complete and verified
- Ready for Phase 36 (Components) to extract header/footer/nav
- Build script ready: `npm run build`
- Dev server ready: `npm run dev`

---
*Phase: 35-setup*
*Completed: 2026-02-04*
