---
phase: 20-batch-translation-pipeline
plan: 02
subsystem: translation
tags: [cheerio, html-parsing, i18n, segmentation, link-transformation]

# Dependency graph
requires:
  - phase: 20-01
    provides: Translation infrastructure (manifest, glossary, CLI scaffolding)
provides:
  - HTML segmentation function extracting translatable text while preserving structure
  - Link and asset path transformation for /en/ subfolder architecture
  - HTML reassembly function inserting translations back into correct positions
  - Glossary post-processing for terminology consistency
  - Test modes for verifying each transformation step
affects: [20-03]

# Tech tracking
tech-stack:
  added: [cheerio@1.0.0-rc.12 (from Plan 01)]
  patterns: [segment-based translation, marker-driven reassembly, path depth adjustment]

key-files:
  created: []
  modified: [scripts/translate-batch.js]

key-decisions:
  - "Use cheerio with decodeEntities: false to preserve HTML entities"
  - "Mark elements with data-translate-id for reassembly matching"
  - "Skip nested text elements - process leaf nodes only"
  - "Path adjustments: ../styles -> ../../styles for EN subfolder depth"
  - "Test modes using uppercase mock translations for structure verification"

patterns-established:
  - "Segment extraction: Extract text, mark position, preserve HTML structure"
  - "Path transformation: Add one level depth for all relative paths to assets"
  - "Reassembly: Map-based lookup by segment ID, preserve inner HTML formatting"

# Metrics
duration: 42min
completed: 2026-02-02
---

# Phase 20 Plan 02: HTML Segmentation & Link Transformation Summary

**Cheerio-based HTML segmentation extracting 60+ translatable segments per page, preserving all formatting, with path transformation for /en/ subfolder architecture**

## Performance

- **Duration:** 42 min
- **Started:** 2026-02-02T08:46:30Z
- **Completed:** 2026-02-02T09:29:23Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments
- Segment extraction function using cheerio extracting title, meta description, and 60+ text segments per typical permit page
- Link and path transformation adjusting CSS/JS/image paths for EN pages one level deeper than IT pages
- HTML reassembly function using Map-based lookup to insert translations while preserving structure
- Three test modes (--test-extract, --test-links, --test-reassemble) for verification
- All test modes verified working on multiple page types

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement HTML segment extraction with cheerio + test mode** - `aef87c6` (feat)
2. **Task 2: Implement link and path transformation + test mode** - `4bca694` (feat)
3. **Task 3: Implement HTML reassembly from translated segments + test mode** - `89154a7` (feat)

**Export updates:** `9c3019a` (chore: export transformation functions)

## Files Created/Modified
- `scripts/translate-batch.js` - Added extractSegments(), transformLinks(), reassembleHtml(), applyGlossaryPostProcess() functions plus three test mode handlers

## Decisions Made

**1. Use cheerio with decodeEntities: false**
- Preserves HTML entities (é, &amp;, etc.) in source
- Prevents double-encoding issues during reassembly

**2. Mark elements with data-translate-id**
- Enables precise reassembly matching segments back to original positions
- Cleaned up after reassembly to avoid polluting output HTML

**3. Skip nested text elements**
- Process leaf nodes only to avoid duplicate extraction
- Parent elements with child text elements are skipped

**4. Path depth adjustment pattern**
- IT pages: src/pages/ (uses ../styles, ../scripts, ../../images)
- EN pages: en/src/pages/ (uses ../../styles, ../../scripts, ../../../images)
- Logo: ../../../images -> ../../../../images

**5. Test modes with uppercase mock translations**
- Allows visual verification of structure preservation
- Easy to spot if content was successfully transformed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all functions implemented and tested successfully on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 03 (Claude API Integration):**
- Segment extraction working: 60+ segments per page
- Link transformation working: lang="en", paths adjusted
- Reassembly working: structure preserved, markers cleaned
- All test modes passing

**Core transformation pipeline complete:**
1. extractSegments(html) → { $, segments, metadata }
2. Send segments to Claude API for translation
3. transformLinks($) → adjust paths and links
4. reassembleHtml($, translations, metadata) → complete EN HTML
5. applyGlossaryPostProcess(html) → ensure terminology consistency

**Functions exported and ready to use:**
- extractSegments
- transformLinks
- reassembleHtml
- applyGlossaryPostProcess

**Verified working with:**
- permesso-studio.html (64 segments)
- database.html (79 segments)
- chi-siamo.html (reassembly verified)

---
*Phase: 20-batch-translation-pipeline*
*Completed: 2026-02-02*
