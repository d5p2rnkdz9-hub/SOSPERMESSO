# Roadmap: SOS Permesso

**Current Milestone:** v1.9 SEO Foundations
**Last Shipped:** v1.7 Database Content Reviewed (2026-01-30)

---

## v1.9 SEO Foundations

**Milestone Goal:** Enable Google to discover and index all site pages through essential SEO infrastructure.

### Phase 18: SEO Infrastructure

**Goal:** Search engines can discover and crawl all pages on the site
**Depends on:** Nothing (standalone milestone)
**Requirements:** CRAWL-01, CRAWL-02, SMAP-01, SMAP-02, SMAP-03, SMAP-04

**Success Criteria** (what must be TRUE):
1. robots.txt exists at site root and allows Googlebot to crawl
2. robots.txt includes Sitemap directive pointing to sitemap.xml
3. sitemap.xml exists and lists all non-redirect HTML pages with lastmod dates
4. Running `npm run build:sitemap` regenerates the sitemap from current files
5. Redirect pages (meta refresh) are not included in sitemap.xml

**Plans:** TBD

Plans:
- [ ] 18-01: Create robots.txt and sitemap build script

---

## Previous Milestones

### v1.7 Database Content Reviewed (Shipped 2026-01-30)
> See `.planning/milestones/v1.7-ROADMAP.md`

### v1.6 Document Deduplication (Shipped 2026-01-28)
> See `.planning/milestones/v1.6-ROADMAP.md`

### v1.5 Footer + Collabora (Shipped 2026-01-28)
> See `.planning/milestones/v1.5-ROADMAP.md`

### v1.4 Error + Dropdowns (Shipped 2026-01-27)
> See `.planning/milestones/v1.4-ROADMAP.md`

### v1.2 Visual Refresh (Shipped 2026-01-26)
> See `.planning/milestones/v1.2-ROADMAP.md`

### v1.1 Documenti Questura (Shipped 2026-01-25)
> See `.planning/milestones/v1.1-ROADMAP.md`

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 18. SEO Infrastructure | v1.9 | 0/1 | Not started | - |

---

*Last updated: 2026-01-31*
