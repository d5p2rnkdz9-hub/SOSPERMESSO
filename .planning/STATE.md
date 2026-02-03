# Project State: SOS Permesso

**Last Updated:** 2026-02-03
**Status:** Milestone v2.1 shipped

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v2.1 Homepage CSS Redesign — SHIPPED

## Current Position

**Current Milestone:** v2.1 Homepage CSS Redesign — COMPLETE
**Phase:** All phases complete (28-29), remaining deferred to v3.0
**Status:** Shipped
**Last activity:** 2026-02-03 — v2.1 shipped, Phases 30-31 deferred to v3.0

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
v2.2 Localization Infra    [Queued]             ..........
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

## v2.2 Preview (Queued)

**Goal:** Scalable infrastructure for 8-12 languages with paragraph-level change tracking.

Key features planned:
- Content extraction from Notion with paragraph-level IDs
- Hash-based change detection + selective translation
- Translation memory (store translations by content hash)
- Multi-language HTML generation from single pipeline
- hreflang in sitemaps, sitemap index architecture
- RTL CSS preparation for Arabic

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
| v2.2 | Paragraph-level tracking | Enables selective re-translation, not full page |
| v2.2 | hreflang in sitemaps, not HTML | Scales better for 8-12 languages |
| v2.2 | RTL CSS with logical properties | Preparation for Arabic support |

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

**Last session:** 2026-02-03
**Stopped at:** v2.1 shipped
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md
2. **Where we are:** v2.1 complete, ready for v2.2 or v3.0
3. **What to do next:**
   - v2.2: Localization Infrastructure (paragraph-level tracking, translation memory)
   - v3.0: Human review + tests + deferred polish (Phases 30-31)

---

*This file is the single source of truth for project state. Update after every significant change.*
