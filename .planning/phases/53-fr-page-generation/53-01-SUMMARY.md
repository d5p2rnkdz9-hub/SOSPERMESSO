---
phase: 53-fr-page-generation
plan: 01
subsystem: ui
tags: [11ty, liquid, fr, pagination, multilingual, eleventy]

# Dependency graph
requires:
  - phase: 52-notion-database
    provides: permitsFr and documentsFr data files in _data/
  - phase: 40-permit-pages
    provides: EN permit pagination template pattern (permits-en.liquid)
  - phase: 39-document-pages
    provides: EN document pagination template pattern (documents-primo-en.liquid, documents-rinnovo-en.liquid)
provides:
  - FR permit pagination template (fr/src/pages/permits-fr.liquid)
  - FR document primo pagination template (fr/src/pages/documents-primo-fr.liquid)
  - FR document rinnovo pagination template (fr/src/pages/documents-rinnovo-fr.liquid)
  - FR pages.11tydata.js with fr/ permalink prefix
  - EN permesso-* DuplicatePermalinkOutputError fix
  - FR safety nets in eleventy.config.mjs
affects: [53-02, 53-03, build-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FR templates are structurally identical copies of EN templates with targeted en->fr substitutions"
    - "Language-suffixed localStorage keys (slug-primo-fr, slug-rinnovo-fr) isolate per-language checklist state"
    - "4-hreflang pattern: canonical + it + en + fr + x-default on all document templates"
    - "pages.11tydata.js language override: if pagination return permalink as-is, else return lang/slug.html"
    - "eleventy.config.mjs safety nets: read dir, filter by prefix, ignores.add each file to prevent DuplicatePermalinkOutputError"

key-files:
  created:
    - fr/src/pages/pages.11tydata.js
    - fr/src/pages/permits-fr.liquid
    - fr/src/pages/documents-primo-fr.liquid
    - fr/src/pages/documents-rinnovo-fr.liquid
  modified:
    - eleventy.config.mjs

key-decisions:
  - "Copy-then-edit approach: FR templates are exact copies of EN with targeted substitutions (no structural divergence)"
  - "rinnovo unless block adds copie du permis check alongside existing EN/IT checks to prevent dedup errors"
  - "EN permit safety net added inside existing EN try block (same enFiles variable reused)"
  - "FR safety net is a separate try/catch block after EN block (frPagesDir may not exist yet)"

patterns-established:
  - "New language = 4 files in {lang}/src/pages/: pages.11tydata.js + 3 liquid pagination templates"
  - "Safety net pattern: try { readdir, filter, ignores.add each } catch { /* dir may not exist */ }"

# Metrics
duration: 3min
completed: 2026-02-18
---

# Phase 53 Plan 01: FR Pagination Pipeline Summary

**FR pagination pipeline created via copy-then-edit from EN templates, plus EN permesso-* DuplicatePermalinkOutputError blocker fixed in eleventy.config.mjs**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-18T22:29:18Z
- **Completed:** 2026-02-18T22:32:30Z
- **Tasks:** 2 of 2
- **Files modified:** 5

## Accomplishments

- Fixed EN permesso-* DuplicatePermalinkOutputError by adding a safety net block inside the existing EN try block
- Added FR safety net in eleventy.config.mjs to pre-emptively ignore static documenti-* and permesso-* files
- Created all 4 FR page generation files: pages.11tydata.js, permits-fr.liquid, documents-primo-fr.liquid, documents-rinnovo-fr.liquid
- FR document templates include 4 hreflang alternates (it, en, fr, x-default)
- FR rinnovo template extends unless block to also check for "copie du permis" (French common doc name)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix EN permesso-* blocker + add FR safety nets in eleventy.config.mjs** - `d51288e` (fix)
2. **Task 2: Create FR pagination templates and pages.11tydata.js** - `72ef9ef` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `eleventy.config.mjs` - Added EN permesso-* ignore block + new FR safety net try/catch block
- `fr/src/pages/pages.11tydata.js` - FR permalink override: pagination pass-through, static pages get fr/ prefix
- `fr/src/pages/permits-fr.liquid` - FR permit pagination template referencing permitsFr data
- `fr/src/pages/documents-primo-fr.liquid` - FR primo docs template referencing documentsFr.primo data
- `fr/src/pages/documents-rinnovo-fr.liquid` - FR rinnovo docs template referencing documentsFr.rinnovo data

## Decisions Made

- EN permesso-* safety net reuses the existing `enFiles` variable from the already-open EN try block rather than doing a second `readdirSync` call - more efficient.
- FR safety net is a separate `try/catch` block because `fr/src/pages/` may not exist at build time; this is handled gracefully.
- The `unless` dedup check in documents-rinnovo-fr.liquid adds `or lowerDoc contains "copie du permis"` alongside existing EN/IT checks, so if Notion returns a French-language copy of the previous permit name it won't duplicate.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- FR pagination pipeline complete: 11ty will generate FR permit and document pages once `permitsFr` and `documentsFr` data files are populated from the FR Notion database
- Plan 53-02 (FR static pages: index.html, database.html, documenti-questura.html) can now proceed in parallel with plan 53-01 results
- Plan 53-03 (language switcher update) depends on both 53-01 and 53-02 completing

---
*Phase: 53-fr-page-generation*
*Completed: 2026-02-18*
