---
phase: 08-homepage-consolidation
plan: 01
subsystem: frontend
tags: [homepage, navigation, sections, contact-modal]
completed: 2026-01-26
duration: ~15 minutes

dependency_graph:
  requires:
    - "Phase 6: Homepage structure (source of truth)"
  provides:
    - "Synced nested homepage with Phase 6 sections"
    - "Fixed navigation paths across src/pages/"
  affects:
    - "All future nested page navigation"
    - "Contact modal accessibility from nested pages"

tech_stack:
  added: []
  patterns:
    - "Fetch-based contact form loading in nested context"
    - "Relative path navigation (../../index.html for root)"

key_files:
  created: []
  modified:
    - src/pages/index.html
    - src/pages/chi-siamo.html

decisions:
  - decision: "Use ../../index.html for root homepage links from nested pages"
    context: "Nested pages are 2 levels deep from root"
    outcome: "Consistent navigation to root homepage"
  - decision: "Fetch contact form from ../components/ path"
    context: "Nested pages need relative path up one level to src/"
    outcome: "Contact modal works from nested homepage"
---

# Phase 08 Plan 01: Homepage Consolidation Summary

**One-liner:** Synced nested homepage with Phase 6 sections structure and fixed all src/pages/ navigation to root homepage.

## What Changed

### src/pages/index.html - Complete Restructure

The nested homepage was significantly outdated compared to the root homepage. This update synced it with Phase 6 structure:

**Before:**
- Old hero with lighthouse component fetch
- Tests section without gradient
- Guides section with 5 cards (including Database permessi, Documenti questura)
- Link utili section with 3 cards (including Aiuto legale)
- CTA with direct typeform link
- No contact modal integration

**After:**
- New hero with decorative SVG elements (document, passport, calendar, papers, suitcase, map pin)
- Tests section with green gradient background
- NEW: Database section (2 cards) with teal gradient
- Guides section reduced to 3 cards (protezione, ricongiungimento, dizionario)
- NEW: Standalone Aiuto legale section with coral gradient and prominent card
- Link utili reduced to 2 cards (kit postale, controlla permesso)
- CTA with openContactModal() button integration
- Contact form loaded via fetch('../components/contact-form.html')
- Lighthouse animation CSS inline
- mobile-fix.css stylesheet added

### src/pages/chi-siamo.html - Navigation Fix

Fixed broken navigation links:

| Link | Before | After |
|------|--------|-------|
| Home | `href="index.html"` | `href="../../index.html"` |
| Test | `href="index.html#test"` | `href="../../index.html#test"` |

### Navigation Audit

Audited all `src/pages/*.html` files for broken `href="index.html"` patterns.
Result: 0 files found with broken pattern after chi-siamo.html fix.

## Tasks Completed

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1a | Update nested homepage Hero, Tests, Database sections | Complete | 53f01c8 |
| 1b | Update nested homepage Aiuto legale, Link utili, CTA, nav/footer | Complete | 53f01c8 |
| 2 | Fix chi-siamo.html navigation links | Complete | 7444bdd |
| 3 | Audit all src/pages/*.html for broken navigation | Complete | N/A (no fixes needed) |

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Section count (root) | 7 | 7 | PASS |
| Section count (nested) | 7 | 7 | PASS |
| Database section exists | 1 match | 1 match | PASS |
| Aiuto legale section exists | 1 match | 2 matches | PASS |
| openContactModal wired | 1+ match | 1 match | PASS |
| Contact form fetch path | ../components/ | ../components/ | PASS |
| Broken index.html links | 0 files | 0 files | PASS |
| chi-siamo.html root links | 2 | 2 | PASS |

## Success Criteria Met

1. [x] src/pages/index.html has 6 content sections matching root index.html
2. [x] "I NOSTRI DATABASE" section present with 2 cards
3. [x] "AIUTO LEGALE" section present as standalone prominent section
4. [x] Guides section has 3 cards (not 5)
5. [x] Link utili section has 2 cards (not 3), uses grid-2
6. [x] Contact modal integration working - openContactModal() wired and fetch loads form
7. [x] chi-siamo.html "Home" and "Test" links navigate to root homepage
8. [x] All internal navigation paths consistent across ALL src/pages/*.html files

## Deviations from Plan

None - plan executed exactly as written.

## Key Path Notes (for future reference)

When working with nested pages in `src/pages/`:

| Resource | Path from src/pages/ |
|----------|---------------------|
| Root homepage | `../../index.html` |
| Root homepage section | `../../index.html#section` |
| Sibling page | `page.html` (no prefix) |
| Contact form component | `../components/contact-form.html` |
| Images | `../../images/filename` |
| Styles | `../styles/filename` |
| Scripts | `../scripts/filename` |

## Commits

- `53f01c8`: feat(08-01): sync nested homepage with root Phase 6 structure
- `7444bdd`: fix(08-01): fix chi-siamo.html navigation links to root homepage

## Next Phase Readiness

Phase 8 complete. The homepage consolidation gap is now closed:
- Root and nested homepages have identical section structure
- All navigation from nested pages correctly points to root homepage
- Contact modal accessible from both homepages

v1.2 Visual Refresh milestone should now be complete pending final audit.
