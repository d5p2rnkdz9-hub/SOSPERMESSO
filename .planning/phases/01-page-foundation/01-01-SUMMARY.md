---
phase: 01-page-foundation
plan: 01
subsystem: ui
tags: [html, css, navigation, badges, responsive-design]

# Dependency graph
requires:
  - phase: none
    provides: Initial codebase with database.html layout pattern
provides:
  - Restructured documenti-questura.html with 4 category sections
  - Badge navigation pattern for document pages (Primo/Rinnovo)
  - URL pattern: documenti-{tipo}-primo.html and documenti-{tipo}-rinnovo.html
  - 46 badge links ready for Phase 2 target pages
affects: [02-document-templates, 03-complete-coverage]

# Tech tracking
tech-stack:
  added: []
  patterns: [category-section-layout, inline-badge-navigation, mobile-touch-targets]

key-files:
  created: []
  modified: [src/pages/documenti-questura.html]

key-decisions:
  - "Badge URL pattern: documenti-{tipo}-primo.html and documenti-{tipo}-rinnovo.html (23 permits × 2 types = 46 pages)"
  - "Badge colors: blue gradient for Primo, orange gradient for Rinnovo"
  - "Mobile: badges wrap below permit name with 44x44px minimum touch targets"

patterns-established:
  - "Badge component: .doc-badge with .badge-primo/.badge-rinnovo variants"
  - "Permit row structure: .permit-link-wrapper > .permit-info + .badge-group"
  - "Category sections: category-purple, category-orange, category-blue, category-teal"

# Metrics
duration: 5min
completed: 2026-01-25
---

# Phase 1 Plan 1: Page Restructuring Summary

**Documenti-questura page restructured with 4 color-coded category sections and 46 clickable badge links for document navigation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-25T12:31:00Z
- **Completed:** 2026-01-25T11:41:43Z
- **Tasks:** 1 + checkpoint (approved)
- **Files modified:** 1

## Accomplishments
- Restructured documenti-questura.html using database.html's category section layout pattern
- Implemented 4 color-coded category sections (purple: STUDIO/LAVORO, orange: PROTEZIONE, blue: CURE MEDICHE, teal: MOTIVI FAMILIARI)
- Added all 23 permit types from database.html organized in correct categories
- Created 46 clickable badge links (Primo + Rinnovo for each of 23 permits)
- Implemented mobile-responsive badge layout with proper touch targets (44x44px minimum)
- Established badge URL pattern for Phase 2: documenti-{tipo}-primo.html and documenti-{tipo}-rinnovo.html

## Task Commits

1. **Task 1: Add Badge CSS and Restructure Page** - `99299d9` (feat)
   - Copied category section CSS from database.html
   - Added new badge component CSS with gradient styling
   - Restructured entire page with 4 category sections
   - Added 46 badge anchor links

**Plan metadata:** (to be committed with this SUMMARY)

## Files Created/Modified
- `src/pages/documenti-questura.html` - Complete restructure with category sections (STUDIO/LAVORO: 5, PROTEZIONE: 7, CURE MEDICHE: 3, MOTIVI FAMILIARI: 8), inline badge navigation for all 23 permits

## Badge URL Pattern for Phase 2

Phase 2 will create 46 document detail pages using this naming convention:

**Pattern:** `documenti-{tipo}-{variante}.html`
- **{tipo}**: permit slug (e.g., studio, lavoro-subordinato, ricongiungimento-familiare)
- **{variante}**: primo | rinnovo

**Examples:**
- `documenti-studio-primo.html` - First release study permit documents
- `documenti-studio-rinnovo.html` - Renewal study permit documents
- `documenti-lavoro-subordinato-primo.html` - First release employed work documents
- `documenti-ricongiungimento-familiare-rinnovo.html` - Renewal family reunification documents

**Complete List (46 pages):**
1. documenti-studio-primo.html / documenti-studio-rinnovo.html
2. documenti-lavoro-subordinato-primo.html / documenti-lavoro-subordinato-rinnovo.html
3. documenti-lavoro-autonomo-primo.html / documenti-lavoro-autonomo-rinnovo.html
4. documenti-ue-lungo-periodo-primo.html / documenti-ue-lungo-periodo-rinnovo.html
5. documenti-attesa-occupazione-primo.html / documenti-attesa-occupazione-rinnovo.html
6. documenti-richiesta-asilo-primo.html / documenti-richiesta-asilo-rinnovo.html
7. documenti-asilo-politico-primo.html / documenti-asilo-politico-rinnovo.html
8. documenti-protezione-sussidiaria-primo.html / documenti-protezione-sussidiaria-rinnovo.html
9. documenti-protezione-speciale-primo.html / documenti-protezione-speciale-rinnovo.html
10. documenti-minore-eta-primo.html / documenti-minore-eta-rinnovo.html
11. documenti-calamita-naturale-primo.html / documenti-calamita-naturale-rinnovo.html
12. documenti-prosieguo-amministrativo-primo.html / documenti-prosieguo-amministrativo-rinnovo.html
13. documenti-gravidanza-primo.html / documenti-gravidanza-rinnovo.html
14. documenti-cure-mediche-primo.html / documenti-cure-mediche-rinnovo.html
15. documenti-gravi-motivi-salute-primo.html / documenti-gravi-motivi-salute-rinnovo.html
16. documenti-ricongiungimento-familiare-primo.html / documenti-ricongiungimento-familiare-rinnovo.html
17. documenti-coesione-familiare-primo.html / documenti-coesione-familiare-rinnovo.html
18. documenti-genitore-minore-italiano-primo.html / documenti-genitore-minore-italiano-rinnovo.html
19. documenti-conviventi-familiari-italiani-primo.html / documenti-conviventi-familiari-italiani-rinnovo.html
20. documenti-assistenza-minore-primo.html / documenti-assistenza-minore-rinnovo.html
21. documenti-minori-stranieri-affidati-primo.html / documenti-minori-stranieri-affidati-rinnovo.html
22. documenti-carta-soggiorno-familiare-ue-primo.html / documenti-carta-soggiorno-familiare-ue-rinnovo.html
23. documenti-carta-soggiorno-familiare-italiano-primo.html / documenti-carta-soggiorno-familiare-italiano-rinnovo.html

## Requirements Satisfied

**Phase 1 Requirements:**
- ✅ **PAGE-01:** Category section layout from database.html - Copied CSS structure and applied to documenti-questura.html
- ✅ **PAGE-02:** 4 color-coded categories - Implemented with category-purple, category-orange, category-blue, category-teal classes
- ✅ **PAGE-03:** Icon + title + badges per row - Structured with .permit-link-wrapper containing .permit-info and .badge-group
- ✅ **BADGE-01:** Clickable badges - Implemented as anchor tags with href to document pages
- ✅ **BADGE-02:** Distinct styling - Blue gradient for Primo, orange gradient for Rinnovo, with hover effects
- ✅ **BADGE-03:** Badge availability - All 23 permits have both Primo and Rinnovo badges (46 total)

## Decisions Made

1. **Badge color scheme:** Blue gradient (#E3F2FD → #BBDEFB) for Primo badges, orange gradient (#FFF3E0 → #FFE0B2) for Rinnovo badges - chosen to maintain visual consistency with site's bright color palette while providing clear distinction

2. **Mobile touch targets:** Badges expand to 44x44px minimum on mobile and wrap below permit name - ensures accessibility per mobile design guidelines

3. **URL slug pattern:** Converted permit names to kebab-case slugs (e.g., "Lavoro subordinato" → "lavoro-subordinato") - maintains consistency with existing site pages like permesso-studio.html

4. **Category distribution:** Maintained exact same 23 permits and 4 categories as database.html - ensures user familiarity with navigation structure

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - page restructure completed without issues. Human verification checkpoint approved on first submission.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 2:**
- Badge navigation pattern established and tested
- All 46 badge links in place with correct URLs
- Category sections visually verified by user
- Mobile responsive behavior confirmed
- URL pattern documented for template creation

**For Phase 2 reference:**
- Use documenti-questura.html as reference for header/footer structure
- Badge URL pattern: documenti-{tipo}-primo.html / documenti-{tipo}-rinnovo.html
- Content structure: breadcrumb → page header → document sections → related links → footer
- Maintain existing site CSS classes and component patterns

**No blockers identified.**

---
*Phase: 01-page-foundation*
*Completed: 2026-01-25*
