---
phase: 03-complete-coverage
plan: 01
subsystem: routing
tags: [redirects, slug-mapping, url-coverage, html]

# Dependency graph
requires:
  - phase: 02-document-templates
    provides: 63 generated document pages with canonical slugs
provides:
  - Slug mapping configuration (scripts/slug-map.json)
  - 36 redirect pages for URL aliasing
  - Complete URL coverage for all 46 badge links
  - Common "Copia permesso precedente" on all rinnovo pages
  - Disputed renewal warning for attesa occupazione
affects: [documenti-questura-landing, user-navigation]

# Tech tracking
tech-stack:
  added: []
  patterns: [meta-refresh-redirects, slug-aliasing, template-special-cases]

key-files:
  created:
    - scripts/slug-map.json
    - src/pages/documenti-*-primo.html (redirect pages)
    - src/pages/documenti-*-rinnovo.html (redirect pages)
  modified:
    - scripts/build-documents.js
    - scripts/templates/rinnovo.js

key-decisions:
  - "Use meta refresh redirects (0-second delay) for SEO-friendly URL aliasing"
  - "Map lavoro-subordinato to flussi variant (most common entry path)"
  - "Preserve intentional typo 'prosieguo-amministravo' from Notion source"
  - "Add common doc 'Copia permesso precedente' to ALL rinnovo pages via template"
  - "Hardcode attesa occupazione disputed warning in template (not Notion field)"

patterns-established:
  - "Slug mapping: JSON config file maps display slugs to canonical slugs"
  - "Redirect generation: generateAliasPages() runs after canonical page generation"
  - "Template special cases: isAttesaOccupazione flag for permit-specific warnings"

# Metrics
duration: ~30min (including checkpoint)
completed: 2026-01-25
---

# Phase 3 Plan 1: Complete Coverage Summary

**36 redirect pages created + template enhancements for 100% URL coverage and improved UX**

## Performance

- **Duration:** ~30 min (including checkpoint pause)
- **Started:** 2026-01-25
- **Completed:** 2026-01-25
- **Tasks:** 3 (2 auto + 1 checkpoint)

## Accomplishments

- Created slug-map.json with 19 display-to-canonical slug mappings
- Extended build script with redirect page generation capability
- Generated 36 redirect pages for URL aliasing
- Added "Copia permesso precedente (o denuncia smarrimento)" to all rinnovo pages
- Added disputed renewal warning for attesa occupazione with aiuto-legale link

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create slug mapping configuration | 0eeb97d | scripts/slug-map.json |
| 2 | Add redirect page generation | deb2b79 | scripts/build-documents.js, 36 redirect pages |
| 3 | Checkpoint + enhancements | 3fc18fb, 2aab501 | scripts/templates/rinnovo.js, 29 rinnovo pages |

## Files Created/Modified

**Created:**
- `scripts/slug-map.json` - 19 display-to-canonical slug mappings with notes
- 36 redirect pages (HTML meta refresh to canonical URLs)

**Modified:**
- `scripts/build-documents.js` - Added generateRedirectPage() and generateAliasPages()
- `scripts/templates/rinnovo.js` - Added common doc and attesa occupazione warning

## Decisions Made

- **Slug mapping via JSON config:** Centralized, auditable, version-controlled
- **Meta refresh redirects:** SEO-friendly, works without JS, 0-second delay
- **lavoro-subordinato → flussi:** Most common entry path for subordinate work
- **Template-level common doc:** "Copia permesso precedente" added to all rinnovo via template (not Notion)
- **Hardcoded warning for attesa occupazione:** Special case in template rather than new Notion field

## Deviations from Plan

### Added During Checkpoint

**1. [User Request] Common document for all rinnovo pages**
- **Request:** Add "Copia permesso precedente (o denuncia smarrimento)" to all rinnovo
- **Implementation:** Added to rinnovo.js template as first document
- **Files modified:** scripts/templates/rinnovo.js
- **Committed in:** 3fc18fb

**2. [User Request] Disputed renewal warning for attesa occupazione**
- **Request:** Show warning that renewal is disputed + link to aiuto legale
- **Implementation:** Conditional warning block in rinnovo.js template
- **Files modified:** scripts/templates/rinnovo.js
- **Committed in:** 3fc18fb

---

**Total deviations:** 2 user-requested enhancements
**Impact on plan:** Enhanced UX, no scope creep

## Verification Results

- All 46 badge links on documenti-questura.html now work (no 404s)
- Redirect pages use instant meta refresh (0-second delay)
- Attesa occupazione rinnovo shows disputed warning
- All rinnovo pages show common document first

## Next Phase Readiness

Phase 3 is the final phase. All requirements complete:
- PAGE-01 through BADGE-03: Phase 1 ✓
- DOC-01 through DOC-04: Phase 2 ✓
- DOC-03, COV-01, COV-02: Phase 3 ✓

**Ready for:** Milestone verification and completion

---
*Phase: 03-complete-coverage*
*Completed: 2026-01-25*
