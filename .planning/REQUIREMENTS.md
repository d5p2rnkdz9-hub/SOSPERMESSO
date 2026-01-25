# Requirements: SOS Permesso — Documenti Questura

**Defined:** 2026-01-25
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v1 Requirements

Requirements for documenti-questura overhaul. Each maps to roadmap phases.

### Page Structure

- [x] **PAGE-01**: Documenti-questura uses database.html's category section layout (`.category-section`, `.permit-list`)
- [x] **PAGE-02**: Page displays 4 color-coded categories matching database.html (purple, orange, blue, teal)
- [x] **PAGE-03**: Each permit row shows: icon + title + [Primo] + [Rinnovo] badges on single line

### Badge Component

- [x] **BADGE-01**: Primo/Rinnovo badges are clickable, link to respective document pages
- [x] **BADGE-02**: Badges have distinct styling (compact, visible but not dominant)
- [x] **BADGE-03**: Badges indicate which document types are available for each permit

### Document Pages

- [ ] **DOC-01**: Create document page template for first release (primo rilascio)
- [ ] **DOC-02**: Create document page template for renewal (rinnovo)
- [ ] **DOC-03**: Each permit gets 2 document pages (primo + rinnovo) — 46 pages total
- [ ] **DOC-04**: Document pages follow existing site template (header, breadcrumb, content, footer)

### Content Coverage

- [ ] **COV-01**: All 23 permits from database.html represented in documenti-questura
- [ ] **COV-02**: Permits organized in same 4 categories as database.html

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Search & Filter

- **SRCH-01**: User can search permits by keyword on documenti-questura page
- **SRCH-02**: User can filter permits by category

### Translations

- **LANG-01**: Documenti-questura available in English
- **LANG-02**: Document pages available in English

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Document checklists with checkboxes | Keep simple — just display required documents |
| PDF download of document lists | Not needed for v1, can add later |
| Print-friendly styling | Nice to have, not essential |
| Dynamic document loading from JSON | Overengineering — inline HTML is fine for this volume |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAGE-01 | Phase 1 | Complete |
| PAGE-02 | Phase 1 | Complete |
| PAGE-03 | Phase 1 | Complete |
| BADGE-01 | Phase 1 | Complete |
| BADGE-02 | Phase 1 | Complete |
| BADGE-03 | Phase 1 | Complete |
| DOC-01 | Phase 2 | Pending |
| DOC-02 | Phase 2 | Pending |
| DOC-04 | Phase 2 | Pending |
| DOC-03 | Phase 3 | Pending |
| COV-01 | Phase 3 | Pending |
| COV-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12/12 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-01-25*
*Last updated: 2026-01-25 after Phase 1 completion*
