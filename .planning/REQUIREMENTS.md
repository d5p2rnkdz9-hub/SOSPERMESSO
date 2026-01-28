# Requirements: SOS Permesso

**Defined:** 2026-01-27
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v1.5 Requirements

Requirements for Footer + Collabora Navigation milestone.

### Footer

- [x] **FOOT-01**: Footer has yellow background ✓
- [x] **FOOT-02**: Footer contains "Il Progetto" link (to chi-siamo.html) ✓
- [x] **FOOT-03**: Footer layout is centered ✓
- [x] **FOOT-04**: Footer displays copyright only (remove Database, Contatti, Chi siamo links) ✓

### Navigation

- [x] **NAV-01**: Replace "Il progetto" nav item with "Collabora" dropdown ✓
- [x] **NAV-02**: "Collabora" is dropdown trigger only (not clickable link) ✓
- [x] **NAV-03**: Dropdown contains "Segnala un errore" → https://form.typeform.com/to/FsqvzdXI ✓
- [x] **NAV-03b**: Dropdown contains "Posso convertire" → https://form.typeform.com/to/oc9jhdkJ ✓
- [x] **NAV-04**: Dropdown contains "Dai una mano" → https://form.typeform.com/to/USx16QN3 ✓
- [x] **NAV-05**: Dropdown contains "Il progetto" → chi-siamo.html ✓

### Cleanup

- [x] **CLEAN-01**: Remove/replace broken sospermesso.typeform.com/contatti URL from codebase ✓

### Propagation

- [x] **PROP-01**: All pages have consistent header with Collabora dropdown ✓
- [x] **PROP-02**: All pages have consistent yellow footer ✓

## Future Requirements

Deferred to later milestones.

### Document Deduplication (v1.6)

- **DEDUP-01**: Remove "Che documenti porto in Questura" sections from permit pages
- **DEDUP-02**: Link permit pages directly to corresponding documenti-questura pages

### Header Alignment (v1.7)

- **ALIGN-01**: Fix desktop header alignment (language switcher baseline)

### Navigation & Anchors (TBD)

- **NAV-ANCHOR-01**: Fix page anchor functioning - links currently don't scroll to precise section on page
- **NAV-LANG-01**: Investigate feasibility of moving language toggle into main navigation menu

### Dictionary Improvements (TBD)

- **DICT-01**: Break dictionary entries into individual blocks to enable direct hyperlinking to specific terms

### Visual Consistency (TBD)

- **VISUAL-01**: Review "documenti questura" text display - ensure proper capitalization and spacing
- **VISUAL-02**: Ensure consistent spacing and indentation of bullet points across all pages

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiple footer layouts | Single centered design per user spec |
| Collabora as clickable link | User specified dropdown trigger only |
| New "Il Progetto" page | Use existing chi-siamo.html |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOOT-01 | Phase 12 | Complete |
| FOOT-02 | Phase 12 | Complete |
| FOOT-03 | Phase 12 | Complete |
| FOOT-04 | Phase 12 | Complete |
| NAV-01 | Phase 13 | Complete |
| NAV-02 | Phase 13 | Complete |
| NAV-03 | Phase 13 | Complete |
| NAV-03b | Phase 14 | Complete |
| NAV-04 | Phase 13 | Complete |
| NAV-05 | Phase 13 | Complete |
| CLEAN-01 | Phase 13 | Complete |
| PROP-01 | Phase 14 | Complete |
| PROP-02 | Phase 14 | Complete |

**Coverage:**
- v1.5 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-01-27*
*Traceability updated: 2026-01-27 after roadmap creation*
