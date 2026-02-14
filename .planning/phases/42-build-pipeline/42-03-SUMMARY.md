---
phase: 42-build-pipeline
plan: 03
subsystem: content-quality
tags: [notion-api, content-audit, quality-assurance, markdown-reports]

# Dependency graph
requires:
  - phase: 42-01
    provides: Build script unification with npm audit command
provides:
  - Content audit script (scripts/audit-content.js)
  - Structured audit report (.planning/AUDIT-content.md)
  - Quality issue categorization for Phase 43 and Phase 45
  - Reusable audit infrastructure via npm run audit
affects: [43-populate-permits, 45-content-validation, notion-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Content quality auditing via Notion API"
    - "Issue categorization with clickable Notion URLs"
    - "Rate-limited Notion pagination (350ms delay)"

key-files:
  created:
    - scripts/audit-content.js
    - .planning/AUDIT-content.md
  modified: []

key-decisions:
  - "Audit covers 7 quality issue types (capitalization, synthetic text, vague wording, missing docs, duplicates, long names, variants)"
  - "Report uses clickable Notion URLs for easy fixing"
  - "Rate limiting at 350ms (under 3 req/sec) to avoid API throttling"
  - "Both documents and permits come from same Notion database ID"

patterns-established:
  - "Quality audits generate structured markdown reports with issue categorization"
  - "Audit scripts use same Notion fetching pattern as data files (notion.search with pagination)"
  - "Reports prioritize actionability with direct links to problematic pages"

# Metrics
duration: 8min
completed: 2026-02-14
---

# Phase 42 Plan 03: Content Quality Audit Summary

**Automated content quality audit identifies 28 issues across 47 Notion pages with categorized reports and direct Notion links**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-14T13:45:38Z
- **Completed:** 2026-02-14T13:53:45Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created reusable content audit script fetching from Notion database
- Generated structured audit report with 7 quality issue categories
- Identified 8 permits missing document lists (critical for Phase 43)
- Flagged 11 overly long document names and 4 variant patterns
- Provided actionable Notion URLs for every issue

## Task Commits

Each task was committed atomically:

1. **Task 1: Create content audit script** - `72ae6ef` (feat)
2. **Task 2: Run audit and generate report** - `9292286` (docs)

## Files Created/Modified

- `scripts/audit-content.js` - Content audit script with 7 quality checks
- `.planning/AUDIT-content.md` - Generated audit report (47 pages, 28 issues)

## Audit Results

**Total pages audited:** 47
**Total issues found:** 28

### Issue Breakdown

| Issue Type | Count | Priority for Phase |
|------------|-------|-------------------|
| Missing document lists | 8 | Phase 43 (Populate Blank Permits) |
| Overly long document names | 11 | Phase 45 (Content Validation) |
| Variant patterns to verify | 4 | Phase 43 (verify structure) |
| Vague/unclear wording | 3 | Phase 45 (content cleanup) |
| Duplicate names | 2 | Phase 45 (deduplication) |
| Missing capitalization | 0 | None |
| Overly synthetic text | 0 | None |

### Critical Findings

**8 permits need document lists:**
- Figlio minore di più di 14 anni che vive con i genitori
- Ricerca scientifica (art.27ter)
- Acquisto cittadinanza o stato di apolide
- Attività sportiva
- Lavoro artistico
- Lavoro subordinato a seguito di sanatoria
- Residenza elettiva
- Motivi religiosi

**4 variant patterns detected:**
- Lavoro subordinato a seguito di ingresso per flussi
- Lavoro subordinato a seguito di conversione da altro permesso
- Lavoro autonomo a seguito di conversione da altro permesso
- Lavoro subordinato a seguito di sanatoria

## Decisions Made

**1. Single database for both documents and permits**
- Confirmed both `_data/documents.js` and `_data/permits.js` use same Notion database ID
- Audit script queries once and checks all relevant properties
- Simplifies fetching logic and reduces API calls

**2. Rate limiting at 350ms per request**
- Stays safely under Notion's 3 req/sec limit
- Prevents 429 throttling errors during pagination
- Same delay pattern used in permits.js data file

**3. Seven quality check categories**
- Missing capitalization: First character uppercase check
- Overly synthetic text: 3+ legal reference patterns
- Vague wording: Generic terms like "generico", "altro", "ecc."
- Missing documents: Empty Doc primo rilascio or Doc rinnovo
- Duplicate names: Case/whitespace normalized comparison
- Long document names: 80+ character threshold
- Variant patterns: "X a seguito di Y" structure detection

**4. Report format prioritizes actionability**
- Every issue links to specific Notion page (https://notion.so/{pageId})
- Issues categorized by type for phased cleanup
- Summary table shows counts for quick triage
- "No issues found" explicitly stated for empty categories

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - audit ran successfully without API errors or permission issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 43 (Populate Blank Permits):**
- 8 permits identified as missing document lists
- Direct Notion URLs provided for each blank permit
- Variant patterns flagged for structure verification

**Ready for Phase 45 (Content Validation):**
- 11 overly long document names need shortening
- 3 permits with vague wording need clarification
- 2 duplicate entries need deduplication
- Full audit report available at `.planning/AUDIT-content.md`

**Reusable infrastructure:**
- Audit script can be re-run via `npm run audit` after Notion changes
- Future validation passes will generate updated reports
- Same pattern can be extended for additional quality checks

---
*Phase: 42-build-pipeline*
*Completed: 2026-02-14*
