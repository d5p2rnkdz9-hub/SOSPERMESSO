# Requirements: SOS Permesso v1.9

**Defined:** 2026-01-31
**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## v1.9 Requirements

Requirements for SEO Foundations milestone. Enable Google to discover and index all pages.

### Crawler Access

- [x] **CRAWL-01**: robots.txt exists in site root allowing search engine crawling
- [x] **CRAWL-02**: robots.txt references sitemap location

### Sitemap

- [x] **SMAP-01**: XML sitemap exists listing all HTML pages
- [x] **SMAP-02**: Sitemap includes lastmod dates based on file modification time
- [x] **SMAP-03**: Build script generates sitemap automatically from file system
- [x] **SMAP-04**: Sitemap excludes redirect pages (meta refresh)

## Future Requirements

Deferred to later milestones.

### SEO Enhancements

- **SEO-01**: Canonical URLs on all pages
- **SEO-02**: Open Graph tags for social sharing
- **SEO-03**: Structured data (Schema.org) for FAQ pages

### Meta Descriptions (deferred)

- **META-01**: Fix placeholder descriptions ("in costruzione")

## Out of Scope

Explicitly excluded from this milestone.

| Feature | Reason |
|---------|--------|
| Google Search Console setup | User action after shipping, not code |
| Canonical URLs | Deferred to future milestone |
| Open Graph tags | Not critical for basic indexing |
| Structured data | Enhancement, not foundation |
| Fix "in costruzione" descriptions | Deferred per user request |

## Traceability

Which phases cover which requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRAWL-01 | Phase 18 | Complete |
| CRAWL-02 | Phase 18 | Complete |
| SMAP-01 | Phase 18 | Complete |
| SMAP-02 | Phase 18 | Complete |
| SMAP-03 | Phase 18 | Complete |
| SMAP-04 | Phase 18 | Complete |

**Coverage:**
- v1.9 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0

---
*Requirements defined: 2026-01-31*
*Last updated: 2026-01-31 — All v1.9 requirements complete*
