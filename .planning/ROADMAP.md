# Roadmap: SOS Permesso v1.5

## Overview

This milestone redesigns the footer with a yellow background and introduces a "Collabora" dropdown in the header navigation, replacing the "Il progetto" link. The work progresses from footer styling to header navigation changes, then propagates both to all pages.

## Milestones

- v1.1 Documenti Questura (Phases 1-3) - Shipped 2026-01-25
- v1.2 Visual Refresh (Phases 4-9) - Shipped 2026-01-26
- v1.3 Header/Nav Fix (Phase 10) - Shipped 2026-01-26
- v1.4 Error + Dropdowns (Phases 11) - Shipped 2026-01-27
- **v1.5 Footer + Collabora (Phases 12-14)** - Shipped 2026-01-28

## Phases

**Phase Numbering:**
- Continues from v1.4 (Phase 11)
- Phases 12-14 cover v1.5 scope

- [x] **Phase 12: Footer Redesign** - Yellow footer with centered layout ✓
- [x] **Phase 13: Collabora Dropdown** - Replace "Il progetto" with Collabora dropdown ✓
- [x] **Phase 14: Propagation** - Apply changes to all pages ✓

## Phase Details

### Phase 12: Footer Redesign
**Goal**: Footer displays yellow background with centered copyright and "Il Progetto" link
**Depends on**: Nothing (first phase of v1.5)
**Requirements**: FOOT-01, FOOT-02, FOOT-03, FOOT-04
**Success Criteria** (what must be TRUE):
  1. Footer has yellow (#FFD700 or theme yellow) background visible on all pages
  2. Footer contains a clickable "Il Progetto" link that navigates to chi-siamo.html
  3. Footer content is horizontally centered
  4. Footer shows copyright text only (no Database, Contatti, Chi siamo links)
**Plans**: 1 plan

Plans:
- [x] 12-01-PLAN.md — Update footer CSS styling and template HTML ✓

### Phase 13: Collabora Dropdown
**Goal**: Header navigation includes "Collabora" dropdown with error reporting and contribution links
**Depends on**: Phase 12 (footer complete before header changes)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, CLEAN-01
**Success Criteria** (what must be TRUE):
  1. "Collabora" appears in header navigation where "Il progetto" was
  2. Clicking "Collabora" does NOT navigate (it's a dropdown trigger only)
  3. Hovering/clicking "Collabora" reveals dropdown with three items
  4. "Segnala un errore" link opens https://form.typeform.com/to/FsqvzdXI
  5. "Dai una mano" link opens https://form.typeform.com/to/USx16QN3
  6. "Il progetto" link in dropdown navigates to chi-siamo.html
  7. No references to sospermesso.typeform.com/contatti remain in codebase
**Plans**: 1 plan

Plans:
- [x] 13-01-PLAN.md — Collabora dropdown in index.html + URL cleanup ✓

### Phase 14: Propagation
**Goal**: All pages have consistent header (Collabora dropdown with 4 items) and footer (yellow centered)
**Depends on**: Phase 12, Phase 13 (both templates ready)
**Requirements**: PROP-01, PROP-02, NAV-03b
**Success Criteria** (what must be TRUE):
  1. Every page in src/pages/ displays the yellow footer with "Il Progetto" link
  2. Every page in src/pages/ displays the Collabora dropdown with 4 items (Segnala un errore, Posso convertire, Dai una mano, Il progetto)
  3. "Posso convertire" link opens https://form.typeform.com/to/oc9jhdkJ
  4. Navigation works correctly from any page (relative paths handled)
  5. Mobile navigation displays Collabora items in flat list format (matching existing pattern)
**Plans**: 2 plans

Plans:
- [x] 14-01-PLAN.md — Footer propagation to all 97 pages ✓
- [x] 14-02-PLAN.md — Header propagation to all 97 pages (Collabora dropdown) ✓

## Progress

**Execution Order:** 12 -> 13 -> 14

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 12. Footer Redesign | v1.5 | 1/1 | Complete | 2026-01-27 |
| 13. Collabora Dropdown | v1.5 | 1/1 | Complete | 2026-01-27 |
| 14. Propagation | v1.5 | 2/2 | Complete | 2026-01-28 |

---
*Roadmap created: 2026-01-27*
*Continues from v1.4 (Phase 11)*
