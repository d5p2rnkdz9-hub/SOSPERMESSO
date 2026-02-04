# Project State: SOS Permesso

**Last Updated:** 2026-02-04
**Status:** Milestone v2.2 in progress

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-04)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v2.2 Language Infrastructure — Phase 33 (RTL Infrastructure) next

## Current Position

**Current Milestone:** v2.2 Language Infrastructure
**Phase:** Phase 33 in progress (Plan 01 complete)
**Status:** In Progress
**Last activity:** 2026-02-04 — Phase 33 Plan 01 complete (RTL CSS infrastructure with logical properties)

```
Milestones:

v1.1 Documenti Questura    [Shipped 2026-01-25] ##########
v1.2 Visual Refresh        [Shipped 2026-01-26] ##########
v1.3 Header/Nav Fix        [Shipped 2026-01-26] ##########
v1.4 Error + Dropdowns     [Shipped 2026-01-27] ##########
v1.5 Footer + Collabora    [Shipped 2026-01-28] ##########
v1.6 Document Dedup        [Shipped 2026-01-28] ##########
v1.7 Database Content      [Shipped 2026-01-30] ##########
v1.8 Homepage + Costi      [Skipped]            ..........
v1.9 SEO Foundations       [Shipped 2026-01-31] ##########
v2.0 Translations          [Shipped 2026-02-02] ##########
v2.1 Homepage Redesign     [Shipped 2026-02-03] ##########
v2.2 Language Infra        [In Progress]        ###.......
v3.0 Human Review + Tests  [Queued]             ..........
```

## v2.1 Phases (SHIPPED)

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 28 | Foundation | QUAL-01, TYPO-02, TYPO-03, VISL-01 | **Complete** |
| 29 | Hero Section | LAYT-01, LAYT-02, TYPO-01, VISL-02 | **Complete** |
| 30 | Header/Footer | HEAD-01, HEAD-02 | Deferred to v3.0 |
| 31 | Polish | VISL-03, VISL-04, QUAL-02 | Deferred to v3.0 |

## v2.1 Summary

**Phase 28 delivered:**
- DM Serif Display font for hero headings
- White/black/yellow color palette in CSS
- Clean minimal header with updated nav styling
- Fluid typography using clamp() for hero title
- Mobile hamburger menu scrolls to homepage sections (#test, #database, #guide)

**Phase 29 delivered:**
- Split hero layout (text left, illustration right)
- Organic wave divider below hero (yellow SVG)
- Bold display heading with DM Serif Display
- Dark rounded CTA button
- Mobile stacked layout

**Deferred to v3.0:**
- Phase 30: Header/Footer propagation to all pages
- Phase 31: Hover effects, scroll fade-ins, mobile polish

## v2.2 Phases (Current)

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 32 | Translation Workflow | TRANS-01 to TRANS-04, SEO-01, SEO-02 | **Complete** |
| 33 | RTL Infrastructure | RTL-01 to RTL-04 | **In Progress (Plan 01 Complete)** |
| 34 | CJK Infrastructure | CJK-01 to CJK-04 | Queued |

## v2.2 Summary

**Phase 32 delivered:**
- MD5 content hashing for accurate change detection in build-permits.js
- Translation memory module (scripts/translation-memory.js)
- Multilingual sitemap index (sitemap-index.xml)
- Per-language sitemaps with hreflang tags (sitemap-it.xml, sitemap-en.xml)
- robots.txt updated to point to sitemap-index.xml
- npm run tm:stats script for translation memory statistics

**Phase 33 Plan 01 delivered:**
- CSS logical properties foundation (inline-start/end, block-start/end)
- --text-x-direction variable system for RTL calculations
- rtl.css with [dir="rtl"] and [lang="ar"]/[lang="he"] selectors
- Arabic font stack (Noto Sans Arabic, Tajawal)
- Automatic icon mirroring for RTL contexts

**Goal:** Scalable translation workflow with Notion-based change detection + CSS foundations for RTL (Arabic) and CJK (Chinese).

**Key approach decisions:**
- **Page-level hashing** (not paragraph-level) — simpler, sufficient for current needs
- **Hybrid change detection** — use Notion `last_edited_time` as cheap filter, then hash content to confirm actual changes
- **Translation memory as JSON** — no database, version-controlled with git
- **Sitemap index architecture** — master sitemap pointing to per-language sitemaps with hreflang

**Verification method:**
1. Edit a test page in Notion, run build → only that page rebuilds
2. Run build again without changes → no pages rebuild (hashes match)
3. Add `lang="ar"` to test page → layout mirrors correctly
4. Add `lang="zh"` to test page → Chinese fonts render correctly
5. Check sitemap-index.xml links to all language sitemaps with correct hreflang

## v2.0 Status (Complete)

Phase 20 complete — all 209 pages translated to English.
CSS/JS paths fixed.
Remaining phases (21-27) moved to v3.0.

## Technical Debt

From prior milestones:
- Dizionario links need revision (partial matching works but coverage incomplete)
- Desktop header alignment (language switcher baseline)
- No npm script for build-permits.js (manual execution)
- 18 permits still need Notion content (placeholder pages)

## Design Patterns to Follow

**v2.1 Target Aesthetic (from research):**
- Clean white background with generous whitespace
- Bold display typography (Playfair Display for hero)
- Split hero layout (text left, illustration right)
- Organic wave divider (SVG, yellow/orange)
- Dark rounded CTA button
- CSS-only hover interactions
- Scroll-triggered fade-ins (IntersectionObserver)

**Existing patterns to preserve:**
- CSS variables system in main.css
- Mobile-first responsive design
- Dropdown navigation structure

## Accumulated Context

### Decisions

| Phase | Decision | Rationale |
|-------|----------|-----------|
| v2.1 | Modern SaaS aesthetic | Visual refresh inspired by WeDu/Wix template |
| v2.1 | Playfair Display + Inter | Serif display for contrast, keep Inter for body |
| v2.1 | Homepage-first | Test design before 416-page rollout |
| v2.1 | Skip feature badge row | Not essential for initial redesign |
| 20 | Claude Code subagents for translation | User preferred existing subscription over API setup |
| v2.0 | /en/ subfolder for English pages | Not subdomain |
| v2.2 | Page-level hashing (not paragraph) | Simpler, sufficient for current content change frequency |
| v2.2 | Hybrid Notion change detection | Timestamp filter (cheap) + hash confirm (accurate) |
| v2.2 | Translation memory as JSON | No database, version-controlled with git |
| v2.2 | hreflang in sitemaps, not HTML | Scales better for 8-12 languages |
| v2.2 | RTL CSS with logical properties | Preparation for Arabic support |
| v2.2 | CJK font stack + typography | Preparation for Chinese support |
| 33-01 | CSS logical properties everywhere | Automatic RTL support without property overrides |
| 33-01 | Direction variable system | Mathematical direction calculations (--text-x-direction: 1/-1) |
| 33-01 | Noto Sans Arabic primary font | Comprehensive glyph support with Tajawal fallback |
| 33-01 | Automatic icon mirroring | transform: scaleX(-1) on directional icons in RTL |

### Research Completed

**v2.1 research** in `.planning/research/`:
- STACK-homepage-css.md — CSS techniques (clamp, Grid, SVG waves)
- FEATURES.md — Table stakes, differentiators, anti-features
- ARCHITECTURE-CSS-REDESIGN.md — File structure, propagation strategy
- PITFALLS-homepage-css.md — Visual regression, contrast, mobile issues
- SUMMARY.md — Synthesized findings

**v2.2 research sources** (from 2026-02-02 discussion):
- [W3C i18n guidelines](https://www.w3.org/International/i18n-drafts/nav/about)
- [LinkGraph hreflang guide](https://www.linkgraph.com/blog/hreflang-implementation-guide/)
- [GTECH sitemap best practices](https://www.gtechme.com/insights/best-practices-for-multi-language-and-multi-region-xml-sitemaps-hreflang-support/)

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-02-04
**Stopped at:** Phase 33 Plan 01 complete (RTL CSS infrastructure)
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md + .planning/phases/33-rtl-infrastructure/33-01-SUMMARY.md
2. **Where we are:** Phase 33 Plan 01 complete, ready for Phase 34
3. **What to do next:**
   - Phase 34: CJK Infrastructure (Chinese CSS)
   - Or continue Phase 33 if additional RTL plans exist

---

*This file is the single source of truth for project state. Update after every significant change.*
