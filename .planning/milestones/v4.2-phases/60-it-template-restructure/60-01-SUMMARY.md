---
phase: 60-it-template-restructure
plan: 01
subsystem: ui
tags: [liquid, css, sticky, tab-navigation, permits]

# Dependency graph
requires: []
provides:
  - Standalone sticky permit-tab-bar container below breadcrumb
  - Prassi locali as 4th tab badge (teal, links to #prassi-locali)
  - Tab-badge styles in components.css (single source of truth)
  - scroll-margin-top offsets on all four section IDs
affects:
  - 60-02 (Prassi accordion — tab bar already links to #prassi-locali)
  - 60-03 (CTA relocation — tab bar structure is final)
  - 61-01 (EN template propagation — copy tab bar pattern)
  - 61-02 (FR template propagation — copy tab bar pattern)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual sticky bars: breadcrumb (z-index 100, top 130px) stacks above tab bar (z-index 99, top 170px)"
    - "Tab-badge colors: yellow (Cos'è), dark-blue (Primo), light-blue (Rinnovo), teal (Prassi locali)"
    - "scroll-margin-top: 220px desktop / 160px mobile to clear header + breadcrumb + tab bar"

key-files:
  created: []
  modified:
    - src/pages/permits.liquid
    - src/styles/components.css

key-decisions:
  - "z-index 99 for permit-tab-bar (just below breadcrumb at 100) so breadcrumb always visible above tab bar"
  - "top: 170px desktop (breadcrumb 130px + ~40px height); top: 110px mobile (70px + ~40px)"
  - "Tab-badge styles moved to components.css — no inline extraStyles in front matter"
  - "Prassi locali badge always shown (not conditional on data); consistent 4-tab experience"

patterns-established:
  - "Sticky stacking: position sticky with increasing top values and decreasing z-index values"
  - "Tab badge HTML lives in permits.liquid; all tab badge CSS lives in components.css"

requirements-completed:
  - LAYOUT-01
  - LAYOUT-04

# Metrics
duration: ~5min
completed: 2026-03-01
---

# Phase 60 Plan 01: Sticky Tab Badges + Prassi Badge Summary

**Sticky tab bar extracted from page header into standalone container; Prassi locali added as 4th teal badge; all badge styles consolidated into components.css**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-01T18:00:00Z
- **Completed:** 2026-03-01T19:07:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Tab badges extracted from page header into a standalone `permit-tab-bar` div positioned after the page header
- `permit-tab-bar` is sticky with `top: 170px` desktop / `top: 110px` mobile, stacking below the breadcrumb bar
- Prassi locali added as 4th badge with teal (#26A69A) styling, linking to `#prassi-locali`
- All `.tab-badge*` styles consolidated in `components.css` — no inline styles remain in front matter
- `scroll-margin-top` added to all four section IDs to prevent content hidden behind sticky bars
- `scroll-behavior: smooth` was already present in main.css (no action needed)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract tab badges into sticky bar and add Prassi badge** - `0275fe0` (feat)
2. **Task 2: Add sticky tab bar CSS with correct stacking and scroll offsets** - `44e8610` (feat)

**Plan metadata:** (included in docs commit below)

## Files Created/Modified
- `src/pages/permits.liquid` - Tab badges moved to standalone permit-tab-bar; Prassi locali 4th badge; extraStyles removed
- `src/styles/components.css` - New PERMIT TAB BAR section with sticky positioning, badge variants, scroll-margin-top, mobile breakpoints

## Decisions Made
- z-index 99 for permit-tab-bar (breadcrumb stays at 100) so breadcrumb always appears on top when both are sticky simultaneously
- top offsets calculated as: breadcrumb top + breadcrumb height (~40px) = 130+40=170px desktop, 70+40=110px mobile
- Prassi locali badge shown unconditionally (not gated on data presence) — consistent 4-tab experience regardless of content
- Tab badge styles fully moved to components.css as single source of truth

## Deviations from Plan

None - plan executed exactly as written. Task 1 (permits.liquid) had already been committed in a previous session (`0275fe0`); Task 2 (components.css CSS) was in the working tree uncommitted and was committed as `44e8610`.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Tab bar is finalized and sticky. Plan 60-02 (Prassi accordion) can proceed — the `#prassi-locali` anchor target already exists in the template.
- No blockers.

---
*Phase: 60-it-template-restructure*
*Completed: 2026-03-01*
