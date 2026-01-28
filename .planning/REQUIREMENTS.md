# Requirements: SOS Permesso v1.6

**Defined:** 2026-01-28
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v1.6 Requirements

Requirements for Document Deduplication milestone.

### Document Section Removal

- [ ] **DEDUP-01**: Remove inline document sections from all 21 permit pages
- [ ] **DEDUP-02**: No duplicate document lists remain in permit pages

### CTA Buttons

- [ ] **CTA-01**: Each permit page has "Documenti per il primo rilascio" button after header
- [ ] **CTA-02**: Each permit page has "Documenti per il rinnovo" button after header
- [ ] **CTA-03**: Buttons link to correct documenti-[permit]-primo.html and documenti-[permit]-rinnovo.html pages
- [ ] **CTA-04**: Button styling consistent with existing site design

### Coverage

- [ ] **COV-01**: All 21 permit pages updated (excluding redirect pages)

## Affected Pages

| Permit Page | Primo Link | Rinnovo Link |
|-------------|------------|--------------|
| permesso-asilo-politico | documenti-asilo-politico-primo | documenti-asilo-politico-rinnovo |
| permesso-assistenza-minore | documenti-assistenza-minore-primo | documenti-assistenza-minore-rinnovo |
| permesso-attesa-occupazione | documenti-attesa-occupazione-primo | documenti-attesa-occupazione-rinnovo |
| permesso-calamita-naturale | documenti-calamita-naturale-primo | documenti-calamita-naturale-rinnovo |
| permesso-coesione-familiare | documenti-coesione-familiare-primo | documenti-coesione-familiare-rinnovo |
| permesso-conviventi-familiari-italiani | documenti-conviventi-familiari-italiani-primo | documenti-conviventi-familiari-italiani-rinnovo |
| permesso-cure-mediche | documenti-cure-mediche-primo | documenti-cure-mediche-rinnovo |
| permesso-genitore-minore-italiano | documenti-genitore-minore-italiano-primo | documenti-genitore-minore-italiano-rinnovo |
| permesso-gravi-motivi-salute | documenti-gravi-motivi-salute-primo | documenti-gravi-motivi-salute-rinnovo |
| permesso-gravidanza | documenti-gravidanza-primo | documenti-gravidanza-rinnovo |
| permesso-lavoro-autonomo | documenti-lavoro-autonomo-primo | documenti-lavoro-autonomo-rinnovo |
| permesso-lavoro-subordinato | documenti-lavoro-subordinato-primo | documenti-lavoro-subordinato-rinnovo |
| permesso-minore-eta | documenti-minore-eta-primo | documenti-minore-eta-rinnovo |
| permesso-minori-stranieri-affidati | documenti-minori-stranieri-affidati-primo | documenti-minori-stranieri-affidati-rinnovo |
| permesso-prosieguo-amministrativo | documenti-prosieguo-amministrativo-primo | documenti-prosieguo-amministrativo-rinnovo |
| permesso-protezione-speciale | documenti-protezione-speciale-primo | documenti-protezione-speciale-rinnovo |
| permesso-protezione-sussidiaria | documenti-protezione-sussidiaria-primo | documenti-protezione-sussidiaria-rinnovo |
| permesso-richiesta-asilo | documenti-richiesta-asilo-primo | documenti-richiesta-asilo-rinnovo |
| permesso-ricongiungimento-familiare | documenti-ricongiungimento-familiare-primo | documenti-ricongiungimento-familiare-rinnovo |
| permesso-studio | documenti-studio-primo | documenti-studio-rinnovo |
| permesso-ue-lungo-periodo | documenti-ue-lungo-periodo-primo | documenti-ue-lungo-periodo-rinnovo |

## Out of Scope

| Feature | Reason |
|---------|--------|
| Modifying documenti-*.html pages | Already correct, Notion-powered |
| Redirect pages (permesso-asilo.html) | Not real content pages |
| Guide pages | Not affected by this change |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEDUP-01 | Phase 15 | Pending |
| DEDUP-02 | Phase 15 | Pending |
| CTA-01 | Phase 15 | Pending |
| CTA-02 | Phase 15 | Pending |
| CTA-03 | Phase 15 | Pending |
| CTA-04 | Phase 15 | Pending |
| COV-01 | Phase 15 | Pending |

**Coverage:**
- v1.6 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
