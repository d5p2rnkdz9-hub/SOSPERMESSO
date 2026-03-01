---
phase: 60-it-template-restructure
plan: 03
subsystem: ui
tags: [liquid, template, cta, alert, permits, 11ty]

# Dependency graph
requires:
  - phase: 60-01
    provides: sticky tab bar with Prassi locali badge
  - phase: 60-02
    provides: compact prassi accordion in permits.liquid
provides:
  - CTA "Hai altre domande? Scrivici" relocated to bottom of page content, before Related links section
  - "Ricorda: entro 60 giorni" alert moved to before the Rinnovo checklist (not after it)
  - Phase 60 IT template restructure complete — all LAYOUT-01–04 and PRASSI-01–03 requirements satisfied
affects:
  - 61-01 (EN template — same CTA relocation and Ricorda move applies to permits-en.liquid)
  - 61-02 (FR template — same structural changes apply to permits-fr.liquid)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CTA wrapped in <section class='section'> with max-width: 700px container for consistent spacing at bottom of page"
    - "Ricorda alert placed before checklist with margin-bottom: 1rem (not margin-top) since it now precedes content"

key-files:
  created: []
  modified:
    - src/pages/permits.liquid

key-decisions:
  - "CTA placed inside {% else %} branch (non-placeholder pages only) — after prassi section, before {% endif %} and before Related links"
  - "JS scrollToSection function with runtime sticky-height measurement replaces CSS scroll-margin-top (visual review fix: scroll-margin-top was insufficient for dynamically stacked sticky bars)"
  - "Tab bar icons removed — text-only badges are cleaner and more readable at all sizes"
  - "Prassi locali badge uses orange color (#FF9800) to visually distinguish it from the blue functional tabs"

patterns-established:
  - "CTA pattern: standalone <section class='section'> with <div class='container' style='max-width: 700px;'> wrapping alert"
  - "Same CTA position and Ricorda position should be reproduced in EN/FR templates (61-01, 61-02)"

requirements-completed:
  - LAYOUT-02
  - LAYOUT-03

# Metrics
duration: ~20min
completed: 2026-03-01
---

# Phase 60 Plan 03: CTA Relocation + Ricorda Alert Move Summary

**CTA "Hai altre domande?" moved to page bottom before Related links; "Ricorda: entro 60 giorni" moved before the Rinnovo checklist — completing the Phase 60 IT template restructure**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-01T19:10:49Z
- **Completed:** 2026-03-01T19:29:36Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 1

## Accomplishments
- CTA block cut from inside the Cos'e Q&A section and pasted into its own `<section>` after the prassi section, before Related links — users who scroll through all content now see the CTA at the right moment
- "Ricorda: entro 60 giorni" alert moved from after the Rinnovo checklist to before it — users see the 60-day deadline warning before starting document preparation
- Visual review revealed and fixed three issues: sticky offset miscalculation, icons cluttering tab badges, and orange color needed for Prassi tab
- Scroll-to-section navigation upgraded from CSS `scroll-margin-top` to JS `scrollToSection()` with runtime sticky-height measurement — handles dynamic stacking of breadcrumb bar + permit tab bar reliably

## Task Commits

Each task was committed atomically:

1. **Task 1: Move CTA to bottom and Ricorda alert before checklist** - `ee6844f` (feat)

Visual review fixes (part of Task 2 verification):

2. **Fix: adjust tab bar per visual review** - `88ddabf` (fix) — fix sticky offset, remove icons, orange prassi badge, bigger badges
3. **Fix: increase scroll-margin-top** - `7eb6e66` (fix) — section headings no longer hidden behind sticky bars
4. **Fix: JS scrollToSection with measured sticky heights** - `10a33c5` (fix) — replaces CSS scroll-margin-top with runtime measurement

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/pages/permits.liquid` — CTA block relocated to bottom of `{% else %}` branch before `{% endif %}`; Ricorda alert moved before `<!-- CHECKLIST -->` in Rinnovo section with `margin-bottom: 1rem`; tab bar icons removed; Prassi badge colored orange; `scrollToSection()` JS function replaces `scroll-margin-top` CSS on section targets

## Decisions Made
- CTA wrapped in standalone `<section class="section">` with `max-width: 700px` container — matches visual weight of other full-width sections without extending edge-to-edge
- CTA placed inside the `{% else %}` branch (non-placeholder permits only) — placeholder pages don't need the CTA since they have no content
- `scrollToSection()` calculates sticky bar heights at call time rather than using static `scroll-margin-top` values — eliminates offset drift when bar visibility changes on resize
- Tab bar icons (emoji) removed — cleaner appearance; badge text alone is readable at all sizes
- Prassi locali badge uses orange (#FF9800) — visually separates community content from the four structural tabs

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Sticky tab scroll offset miscalculated**
- **Found during:** Task 2 (visual review)
- **Issue:** Clicking a tab badge scrolled the section heading under the sticky tab bar — `scroll-margin-top` was set to a fixed value that didn't account for the stacked breadcrumb bar + permit tab bar height
- **Fix:** Replaced static `scroll-margin-top` CSS with a `scrollToSection(id)` JS function that reads actual sticky element heights at call time and subtracts them from the scroll target position
- **Files modified:** `src/pages/permits.liquid`
- **Verification:** Each tab scrolls to the correct section with the heading visible below the sticky bar
- **Committed in:** `10a33c5` (visual review fix)

**2. [Rule 1 - Bug] Tab badge icons cluttering the bar**
- **Found during:** Task 2 (visual review)
- **Issue:** Emoji icons in tab badges made the bar visually noisy and reduced readability at mobile widths
- **Fix:** Removed icons from tab badge labels — text-only badges
- **Files modified:** `src/pages/permits.liquid`
- **Verification:** Tab bar renders cleanly at all viewport widths
- **Committed in:** `88ddabf` (visual review fix)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug; found during visual review)
**Impact on plan:** Both fixes improved UX correctness. No scope creep.

## Issues Encountered
- CSS `scroll-margin-top` approach was insufficient because the permit page has two stacked sticky elements (breadcrumb bar + permit tab bar). The combined height is not a fixed value and changes on resize. Switching to JS runtime measurement resolved this cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 60 (IT Template Restructure) is fully complete — all 3 plans done
- Phase 61 can begin: apply the same structural changes (sticky tabs, prassi accordion, CTA at bottom, Ricorda before checklist) to `en/src/pages/permits-en.liquid` (61-01) and `fr/src/pages/permits-fr.liquid` (61-02)
- The `scrollToSection()` JS pattern must be copied to EN and FR templates as well
- No blockers

---
*Phase: 60-it-template-restructure*
*Completed: 2026-03-01*
