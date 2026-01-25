# Roadmap: SOS Permesso — Documenti Questura

**Created:** 2026-01-25
**Depth:** Quick (3-5 phases, critical path only)
**Coverage:** 12/12 v1 requirements mapped

## Overview

Transform documenti-questura page into a comprehensive, scannable resource for all 23 permit types with dedicated first release and renewal document pages. Users will find their permit, click primo or rinnovo, and land on a dedicated page with exact document requirements.

## Phases

### Phase 1: Page Foundation
**Goal:** Users can navigate a restructured documenti-questura page with clickable primo/rinnovo badges for every permit type.

**Dependencies:** None (uses existing site infrastructure)

**Plans:** 1 plan

Plans:
- [x] 01-01-PLAN.md — Restructure documenti-questura page with category sections and badge navigation

**Requirements:**
- PAGE-01: Documenti-questura uses database.html's category section layout
- PAGE-02: Page displays 4 color-coded categories matching database.html
- PAGE-03: Each permit row shows icon + title + [Primo] + [Rinnovo] badges
- BADGE-01: Primo/Rinnovo badges are clickable, link to respective document pages
- BADGE-02: Badges have distinct styling (compact, visible but not dominant)
- BADGE-03: Badges indicate which document types are available

**Success Criteria:**
1. User opens documenti-questura and sees 4 color-coded category sections (purple, orange, blue, teal) matching database.html layout
2. User scans permit list and sees inline badges [Primo] [Rinnovo] next to each permit name on a single line
3. User hovers over a badge and sees it's clickable with hover state styling
4. User clicks [Primo] badge and browser navigates to first release document page URL (even if page doesn't exist yet)
5. User clicks [Rinnovo] badge and browser navigates to renewal document page URL (even if page doesn't exist yet)

---

### Phase 2: Document Templates
**Goal:** Two complete document page templates (primo rilascio and rinnovo) exist and can be replicated for all permit types.

**Dependencies:** Phase 1 (badge links need target pages)

**Plans:** 2 plans

Plans:
- [ ] 02-01-PLAN.md — Initialize Node.js build infrastructure with Notion API client
- [ ] 02-02-PLAN.md — Create primo/rinnovo templates with checklist, print CSS, localStorage

**Requirements:**
- DOC-01: Create document page template for first release (primo rilascio)
- DOC-02: Create document page template for renewal (rinnovo)
- DOC-04: Document pages follow existing site template (header, breadcrumb, content, footer)

**Success Criteria:**
1. User clicks [Primo] badge for any permit and lands on a document page with breadcrumb, header, and document list sections
2. User clicks [Rinnovo] badge for any permit and lands on a structurally identical page with renewal-specific content
3. User views document page on mobile and sees responsive layout matching existing site pages
4. User navigates breadcrumb "Home > Documenti Questura > [Permit]" and returns to correct pages

---

### Phase 3: Complete Coverage
**Goal:** All 23 permit types have dedicated primo and rinnovo document pages (46 pages total).

**Dependencies:** Phase 2 (templates must exist)

**Requirements:**
- DOC-03: Each permit gets 2 document pages (primo + rinnovo) — 46 pages total
- COV-01: All 23 permits from database.html represented in documenti-questura
- COV-02: Permits organized in same 4 categories as database.html

**Success Criteria:**
1. User clicks any [Primo] badge on documenti-questura page and lands on a working document page (no 404s)
2. User clicks any [Rinnovo] badge on documenti-questura page and lands on a working document page (no 404s)
3. User counts permit rows on documenti-questura and sees all 23 permits from database.html present
4. User compares category organization between database.html and documenti-questura and sees identical grouping (4 categories, same permits in each)

---

## Progress

| Phase | Status | Requirements | Success Criteria | Notes |
|-------|--------|--------------|------------------|-------|
| 1 - Page Foundation | ✓ Complete | 6/6 | 5/5 | Verified 2026-01-25 |
| 2 - Document Templates | Planned | 0/3 | 0/4 | 2 plans in 2 waves |
| 3 - Complete Coverage | Pending | 0/3 | 0/4 | Generate 46 document pages |

**Overall:** 6/12 requirements complete, 5/13 success criteria met

---

## Next Steps

1. ~~Run `/gsd:plan-phase 1` to create execution plan for page restructuring~~
2. ~~Run `/gsd:execute-phase 1` to restructure documenti-questura page~~
3. ~~Run `/gsd:plan-phase 2` for template creation~~
4. Run `/gsd:execute-phase 2` to create templates and build system
5. After Phase 2 complete, run `/gsd:plan-phase 3` for full page generation

---

*Last updated: 2026-01-25*
*Coverage validated: 12/12 v1 requirements mapped*
