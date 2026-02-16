# Requirements: SOS Permesso v3.1

**Defined:** 2026-02-07
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v3.1 Requirements

Requirements for Notion-11ty integration, prassi locali, and content completion.

### Documents

- [x] **DOC-01**: 11ty data file fetches document data from Notion
- [x] **DOC-02**: Liquid template renders document pages (primo/rinnovo)
- [x] **DOC-03**: Generated pages have same URLs as current (`documenti-*-primo.html`, `documenti-*-rinnovo.html`)
- [x] **DOC-04**: Redirect pages generated via 11ty for URL aliases

### Permits

- [x] **PERM-01**: 11ty data file fetches permit data and page blocks from Notion
- [x] **PERM-02**: Liquid template renders permit Q&A pages
- [x] **PERM-03**: Variant pages (parent/child) generated correctly
- [x] **PERM-04**: Generated pages have same URLs as current (`permesso-*.html`)

### Build Pipeline

- [x] **BUILD-01**: Single `npm run build` command generates all pages
- [x] **BUILD-02**: Netlify configured with `NOTION_API_KEY` env var
- [x] **BUILD-03**: Build completes in under 120 seconds
- [x] **BUILD-04**: Old build scripts removed after migration verified

### Prassi Locali

- [x] **PRASSI-01**: Submission form on document pages sends data via Netlify Function to Notion DB
- [x] **PRASSI-02**: "Prassi locali" section on document pages displays approved notes, filterable by city
- [x] **PRASSI-03**: Upvote/downvote system (anonymous, localStorage + IP rate limiting)
- [x] **PRASSI-04**: Manual moderation workflow (approve in Notion, rebuild to publish)

### Content Population

- [x] **CONTENT-01**: All placeholder permit pages have Q&A content in Notion (8 populated, 3 skipped per user decision)
- [x] **CONTENT-02**: Generated pages render correctly with new content

### Costi Section

- [x] **COSTI-01**: Cost data sourced from Notion database properties
- [x] **COSTI-02**: Costi section rendered on document pages (primo and rinnovo)

### Content Validation

- [ ] **VALID-01**: All document pages reviewed for content accuracy
- [ ] **VALID-02**: All permit pages reviewed for content accuracy

### Dizionario Links

- [ ] **DIZIO-01**: Glossary term matching improved (covers all relevant terms)
- [ ] **DIZIO-02**: All relevant terms linked correctly across pages

## Out of Scope

| Feature | Reason |
|---------|--------|
| Translation integration | Separate concern, existing translation memory works |
| Sitemap regeneration | Existing sitemap script works, update in v3.2 |
| Content editing | Notion remains the content source |
| New page types | Focus on migrating existing document + permit pages |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOC-01 | Phase 39 | Complete |
| DOC-02 | Phase 39 | Complete |
| DOC-03 | Phase 39 | Complete |
| DOC-04 | Phase 39 | Complete |
| PERM-01 | Phase 40 | Complete |
| PERM-02 | Phase 40 | Complete |
| PERM-03 | Phase 40 | Complete |
| PERM-04 | Phase 40 | Complete |
| BUILD-01 | Phase 42 | Complete |
| BUILD-02 | Phase 42 | Complete |
| BUILD-03 | Phase 42 | Complete |
| BUILD-04 | Phase 42 | Complete |

| PRASSI-01 | Phase 41 + 42.1 | Complete |
| PRASSI-02 | Phase 41 + 42.1 | Complete |
| PRASSI-03 | Phase 41 + 42.1 | Complete |
| PRASSI-04 | Phase 41 + 42.1 | Complete |
| CONTENT-01 | Phase 43 | Complete |
| CONTENT-02 | Phase 43 | Complete |
| COSTI-01 | Phase 44 | Complete |
| COSTI-02 | Phase 44 | Complete |
| VALID-01 | Phase 45 | Pending |
| VALID-02 | Phase 45 | Pending |
| DIZIO-01 | Phase 46 | Pending |
| DIZIO-02 | Phase 46 | Pending |

**Coverage:**
- v3.1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-07*
*Last updated: 2026-02-16 — COSTI-01, COSTI-02 marked Complete (Phase 44)*
