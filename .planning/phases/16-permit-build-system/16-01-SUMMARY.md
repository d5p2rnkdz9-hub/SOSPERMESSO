---
phase: 16-permit-build-system
plan: 01
subsystem: templates
tags: [node, html-generation, templates, escapeHtml]

# Dependency graph
requires:
  - phase: 11-documenti-questura
    provides: helpers.js with escapeHtml, linkToDizionario functions
provides:
  - generatePermessoPage function for building permit HTML pages
  - Template with full navigation dropdowns
  - CTA buttons for document pages (primo/rinnovo)
  - Dynamic section rendering with semantic border colors
affects: [16-02-build-script, permit-pages]

# Tech tracking
tech-stack:
  added: []
  patterns: [template-literal-html-generation, keyword-based-styling]

key-files:
  created:
    - scripts/templates/permesso.js
  modified: []

key-decisions:
  - "Border colors based on section keywords (cos'e=blue, requisiti=yellow, lavoro=red, conversione=teal)"
  - "Self-test block writes to test-permesso-output.html for manual verification"
  - "Template follows permesso-studio.html patterns (not primo.js simplified header)"

patterns-established:
  - "getSectionBorderColor: keyword matching then index fallback for visual variety"
  - "renderSection: card generation with escaped question, raw HTML content"

# Metrics
duration: 2min
completed: 2026-01-28
---

# Phase 16 Plan 01: Permit Template Module Summary

**Node.js template module generating permit pages with full navigation, CTA buttons, and dynamic Q&A sections with semantic border colors**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-28T16:25:30Z
- **Completed:** 2026-01-28T16:27:12Z
- **Tasks:** 2
- **Files created:** 1

## Accomplishments
- Created generatePermessoPage function accepting {tipo, slug, emoji, subtitle, sections}
- Template includes full site navigation with 4 dropdowns (Database, Guide, Test, Collabora)
- CTA buttons link to document pages (documenti-{slug}-primo.html, documenti-{slug}-rinnovo.html)
- Section border colors vary by content type (blue for cos'e, yellow for requisiti, red for lavoro, teal for conversione)
- Self-test block generates test-permesso-output.html for browser verification

## Task Commits

Each task was committed atomically:

1. **Task 1: Create permesso.js template module** - `cf2f06f` (feat)

*Note: Task 2 (self-test) was included in Task 1 as the self-test block was part of initial file creation*

## Files Created/Modified
- `scripts/templates/permesso.js` - Permit page template generator (334 lines)

## Decisions Made
- Border colors based on keywords in question text rather than fixed section order
- Fallback to cycling colors by index when no keyword matches
- Used `escapeHtml()` on question text but raw content insertion for pre-sanitized HTML sections
- Followed permesso-studio.html structure for navigation (full dropdowns, not primo.js simplified)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Template ready for Plan 02 build script integration
- generatePermessoPage accepts structured permit data from Notion parser
- Output HTML matches existing site design

---
*Phase: 16-permit-build-system*
*Completed: 2026-01-28*
