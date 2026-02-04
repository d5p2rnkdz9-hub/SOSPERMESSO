# Project State: SOS Permesso

**Last Updated:** 2026-02-04
**Status:** Milestone v2.2 complete

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-04)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v2.2 Language Infrastructure complete — ready for v3.0

## Current Position

**Current Milestone:** v2.2 Language Infrastructure
**Phase:** Phase 34 complete — milestone complete
**Status:** Complete
**Last activity:** 2026-02-04 — Phase 34 complete (CJK CSS infrastructure) — v2.2 milestone complete

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
v2.2 Language Infra        [Shipped 2026-02-04] ##########
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

## v2.2 Phases (SHIPPED)

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 32 | Translation Workflow | TRANS-01 to TRANS-04, SEO-01, SEO-02 | **Complete** |
| 33 | RTL Infrastructure | RTL-01 to RTL-04 | **Complete** |
| 34 | CJK Infrastructure | CJK-01 to CJK-04 | **Complete** |

## v2.2 Summary

**Phase 32 delivered:**
- MD5 content hashing for accurate change detection in build-permits.js
- Translation memory module (scripts/translation-memory.js)
- Multilingual sitemap index (sitemap-index.xml)
- Per-language sitemaps with hreflang tags (sitemap-it.xml, sitemap-en.xml)
- robots.txt updated to point to sitemap-index.xml
- npm run tm:stats script for translation memory statistics

**Phase 33 delivered:**
- CSS logical properties (inline-start/end) across all stylesheets
- --text-x-direction variable for RTL calculations
- rtl.css with [dir="rtl"], [lang="ar"], [lang="he"] selectors
- Arabic font stack (Geeza Pro, Arabic Typesetting, Tahoma)
- Automatic icon mirroring for RTL contexts
- Mobile navigation RTL support

**Phase 34 Plan 01 delivered:**
- cjk.css with CJK typography infrastructure (260 lines)
- Chinese font stacks (Simplified: PingFang SC, YaHei; Traditional: PingFang TC, JhengHei)
- Japanese font stack (Hiragino Sans, Yu Gothic, Noto Sans JP)
- Korean font stack (Noto Sans KR, Nanum Gothic, Malgun Gothic)
- Line-height adjustments (1.8 body, 1.5 headings) for dense CJK characters
- Global italic override (font-style: normal) for all CJK languages
- Text-emphasis marks (Japanese dots above, Chinese sesame below, Korean bold)
- Word-break rules for character-level wrapping in Chinese/Japanese

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
| 34-01 | System fonts over web fonts | PingFang, YaHei, Hiragino avoid 15MB+ downloads |
| 34-01 | Global italic override for CJK | font-style: normal !important (CJK doesn't use slanted text) |
| 34-01 | Line-height 1.8 for CJK | Dense characters need more vertical space than Latin |
| 34-01 | Text-emphasis as enhancement | Japanese dots above, Chinese sesame below, Korean bold |
| 34-01 | Multi-region Chinese support | Separate stacks for Simplified (zh-CN) and Traditional (zh-TW, zh-HK) |

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
**Stopped at:** v2.2 Language Infrastructure milestone complete
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md
2. **Where we are:** v2.2 milestone complete (Phases 32, 33, 34)
3. **What to do next:**
   - `/gsd:audit-milestone` — verify cross-phase integration before archiving
   - Or `/gsd:complete-milestone` — archive v2.2 and start v3.0

---

*This file is the single source of truth for project state. Update after every significant change.*
