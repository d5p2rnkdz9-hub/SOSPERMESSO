---
phase: 16-permit-build-system
plan: 02
subsystem: build-infrastructure
tags: [notion-api, node-js, html-generation, q&a-parsing]

dependency_graph:
  requires: [16-01]
  provides: [notion-block-fetching, permit-page-generation, empty-permit-tracking]
  affects: [16-03, future-permit-content]

tech_stack:
  added: []
  patterns: [q&a-parsing, block-recursion, rate-limiting]

file_tracking:
  key_files:
    created:
      - scripts/build-permits.js
      - .planning/TODO-permits.md
      - src/pages/permesso-studio-art-39.html
      - src/pages/permesso-richiesta-asilo.html
      - src/pages/permesso-protezione-speciale-art-32-d-lgs-25-2008.html
    modified:
      - scripts/notion-client.js

decisions:
  - id: qa-detection
    choice: "Three-pattern detection for Q&A: heading_3, bold paragraph, inline bold"
    reason: "Notion content uses all three formats across different permits"
  - id: emoji-keywords
    choice: "Keyword-based emoji selection with fallback"
    reason: "No emoji field in Notion; permits naturally group by type keywords"
  - id: heading2-support
    choice: "Added heading_2 block support during execution"
    reason: "Some permit pages use h2 for structure (e.g., sfruttamento-lavorativo)"
  - id: rate-limiting
    choice: "350ms delay between page block fetches"
    reason: "Stay under Notion API 3 req/s limit"

metrics:
  duration: 3min 36sec
  completed: 2026-01-28
---

# Phase 16 Plan 02: Build Script Implementation Summary

Build-permits.js fetches Notion Q&A content and generates permesso-*.html pages using the template from Plan 01.

## Completed Tasks

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Extend notion-client.js with block fetching | d009d32 | scripts/notion-client.js |
| 2 | Create build-permits.js with Q&A parsing | 8039eb2 | scripts/build-permits.js |
| 3 | Run build and create TODO-permits.md | f1daa30 | 24 permit pages, TODO-permits.md |

## What Was Built

**Extended notion-client.js:**
- Added `fetchPageBlocks(pageId)` function
- Handles pagination with cursor loop
- Recursively fetches nested children (has_children)
- Exported alongside existing functions

**Created build-permits.js (517 lines):**
- Q&A parsing handles 3 formats from Notion:
  - Style 1: heading_3 blocks (question is heading text)
  - Style 2: Bold paragraph questions (bold text ending in ?)
  - Style 3: Inline bold at paragraph start
- Rich text conversion: bold, italic, underline, strikethrough, code, links
- List grouping: consecutive bulleted/numbered items wrapped in ul/ol
- Block support: paragraph, heading_2, heading_3, lists, divider, quote, callout
- Rate limiting: 350ms delay between API calls
- Emoji assignment by keyword matching
- Subtitle extraction from first content paragraph

**Generated 24 permit pages:**
- permesso-studio-art-39.html (7 sections)
- permesso-richiesta-asilo.html (7 sections)
- permesso-protezione-speciale-art-32-d-lgs-25-2008.html (9 sections)
- permesso-asilo-status-rifugiato.html (8 sections)
- permesso-protezione-sussidiaria.html (9 sections)
- And 19 more family/medical/work permit pages

**Created TODO-permits.md:**
- Tracks 20 permits needing Notion content
- Includes Notion page IDs for easy editing
- Documents reasons (empty page, no Q&A sections)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added heading_2 block support**
- Found during: Task 2 verification
- Issue: Some pages use heading_2 for structure, was logging "Unknown block type"
- Fix: Added heading_2 case to blockToHtml switch statement
- Files modified: scripts/build-permits.js
- Commit: 8039eb2

## Verification

1. notion-client.js exports fetchPageBlocks: PASS
2. build-permits.js runs without errors: PASS (24 pages generated)
3. Generated permit pages exist: PASS (43 total files)
4. TODO-permits.md exists with tracking: PASS (20 permits listed)
5. Generated pages render correctly: PASS (verified permesso-studio-art-39.html)

## Success Criteria Met

- [x] Build script fetches all permits from Notion (BUILD-01)
- [x] Script parses Q&A format correctly (TMPL-03)
- [x] At least one permit page generated as proof of concept (BUILD-02)
- [x] Empty permits logged to TODO-permits.md (BUILD-03)
- [x] Generated pages use template from 16-01 (TMPL-01)
- [x] Additional Q&A content preserved (TMPL-02)

## Next Phase Readiness

**For 16-03 (Database Update):**
- Generated pages use long slugs (e.g., `permesso-studio-art-39.html`)
- database.html still links to old slugs (e.g., `permesso-studio.html`)
- Plan 03 will update database.html to link to new generated pages
- Consider slug-map.json for aliasing if backward compatibility needed

**Permits needing attention:**
- 20 permits in TODO-permits.md need Notion content
- 6 permits have content but no Q&A detected (different structure)
- Consider Phase 17 to handle non-Q&A permit content
