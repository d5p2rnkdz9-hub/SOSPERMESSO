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

- [ ] **NAV-01**: Replace "Il progetto" nav item with "Collabora" dropdown
- [ ] **NAV-02**: "Collabora" is dropdown trigger only (not clickable link)
- [ ] **NAV-03**: Dropdown contains "Segnala un errore" → https://form.typeform.com/to/FsqvzdXI
- [ ] **NAV-04**: Dropdown contains "Dai una mano" → https://form.typeform.com/to/USx16QN3
- [ ] **NAV-05**: Dropdown contains "Il progetto" → chi-siamo.html

### Cleanup

- [ ] **CLEAN-01**: Remove/replace broken sospermesso.typeform.com/contatti URL from codebase

### Propagation

- [ ] **PROP-01**: All pages have consistent header with Collabora dropdown
- [ ] **PROP-02**: All pages have consistent yellow footer

## Future Requirements

Deferred to later milestones.

### Document Deduplication (v1.6)

- **DEDUP-01**: Remove "Che documenti porto in Questura" sections from permit pages
- **DEDUP-02**: Link permit pages directly to corresponding documenti-questura pages

### Header Alignment (v1.7)

- **ALIGN-01**: Fix desktop header alignment (language switcher baseline)

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
| NAV-01 | Phase 13 | Pending |
| NAV-02 | Phase 13 | Pending |
| NAV-03 | Phase 13 | Pending |
| NAV-04 | Phase 13 | Pending |
| NAV-05 | Phase 13 | Pending |
| CLEAN-01 | Phase 13 | Pending |
| PROP-01 | Phase 14 | Pending |
| PROP-02 | Phase 14 | Pending |

**Coverage:**
- v1.5 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-01-27*
*Traceability updated: 2026-01-27 after roadmap creation*
