# Project State: SOS Permesso

**Last Updated:** 2026-02-02
**Status:** Milestone v2.1 defining requirements

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v2.1 Localization Infrastructure

## Current Position

**Current Milestone:** v2.1 Localization Infrastructure
**Phase:** Not started (defining requirements)
**Status:** Gathering requirements
**Last activity:** 2026-02-02 — Milestone v2.1 started, v2.0 shipped

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
v2.0 Multilingual Found.   [Shipped 2026-02-02] ##########
v2.1 Localization Infra    [Active]             ○○○○○○○○○○
```

## v2.1 Goal

Build scalable infrastructure for 8-12 languages with:
- Paragraph-level change tracking (detect what changed in IT)
- Diff-based re-translation (only translate changed content)
- Translation memory (reuse unchanged translations)
- Multi-language HTML generation from single pipeline
- hreflang/sitemap index for SEO at scale
- RTL CSS preparation for Arabic

## Technical Debt

### From v2.0
- EN sitemap missing (only IT sitemap exists)
- No hreflang tags (Google treats IT/EN as duplicates)
- Language detection hardcoded for `/en/` only

### From Prior Milestones
- 18 permits need Notion content (placeholder pages exist)
- Dizionario links need revision (partial matching incomplete)
- Desktop header alignment (language switcher baseline)
- No npm script for build-permits.js (manual execution)

## Accumulated Context

### Decisions

| Phase | Decision | Rationale |
|-------|----------|-----------|
| v2.0 | Claude Code subagents for translation | User preferred existing subscription over API setup |
| v2.0 | /en/ subfolder for English pages | Not subdomain |
| v2.1 | Paragraph-level tracking | Enables selective re-translation |
| v2.1 | hreflang in sitemaps, not HTML | Scales better for 8-12 languages |
| v2.1 | RTL CSS with logical properties | Preparation for Arabic support |

### Research Sources

- [W3C i18n guidelines](https://www.w3.org/International/i18n-drafts/nav/about)
- [LinkGraph hreflang guide](https://www.linkgraph.com/blog/hreflang-implementation-guide/)
- [GTECH sitemap best practices](https://www.gtechme.com/insights/best-practices-for-multi-language-and-multi-region-xml-sitemaps-hreflang-support/)

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-02-02
**Stopped at:** Defining v2.1 requirements
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md
2. **Where we are:** v2.1 requirements being defined
3. **What to do next:** Complete requirements → create roadmap

---

*This file is the single source of truth for project state. Update after every significant change.*
