# Project State: SOS Permesso

**Last Updated:** 2026-02-04
**Status:** Milestone v3.0 starting

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-04)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v3.0 11ty Migration — Structural migration to eliminate duplicated headers/footers

## Current Position

**Current Milestone:** v3.0 11ty Migration
**Phase:** Defining roadmap
**Status:** Starting
**Last activity:** 2026-02-04 — Milestone v3.0 initialized, requirements defined

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
v3.0 11ty Migration        [Starting]           ..........
```

## v3.0 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 35 | Setup & Config | SETUP-01 to SETUP-04 | Queued |
| 36 | Component Extraction | COMP-01 to COMP-05 | Queued |
| 37 | Page Conversion | PAGE-01 to PAGE-04, I18N-01 to I18N-03 | Queued |
| 38 | Deployment | DEPLOY-01 to DEPLOY-03 | Queued |

## v3.0 Summary

**Goal:** Migrate from pure HTML (469 pages) to 11ty SSG for maintainable architecture.

**Key approach decisions:**
- **Liquid templates** (not Nunjucks — unmaintained since June 2022)
- **Incremental migration** (not big-bang)
- **URL preservation** critical (all 469 URLs must work)
- **Structural only** — same content, keep existing Notion scripts

**What changes:**
- Header/footer/nav extracted to reusable includes
- Pages use shared layouts via front matter
- Build via `npx @11ty/eleventy`

**What stays the same:**
- All CSS files unchanged
- All JS files unchanged
- All content unchanged
- Notion build scripts unchanged
- URL structure unchanged

## Technical Debt

From prior milestones (carry forward):
- Dizionario links need revision (partial matching works but coverage incomplete)
- Desktop header alignment (language switcher baseline)
- No npm script for build-permits.js (manual execution)
- 18 permits still need Notion content (placeholder pages)

## Design Patterns to Follow

**11ty patterns (from research):**
- Passthrough copy for static assets
- Base layout with `{{ content }}` slot
- Includes for reusable components
- Front matter for page metadata
- Computed permalinks for URL preservation

**Existing patterns to preserve:**
- CSS variables system in main.css
- Mobile-first responsive design
- Dropdown navigation structure

## Accumulated Context

### Decisions

| Phase | Decision | Rationale |
|-------|----------|-----------|
| v3.0 | 11ty over other SSGs | Minimal config, works with existing HTML, low learning curve |
| v3.0 | Liquid over Nunjucks | Nunjucks unmaintained since June 2022 |
| v3.0 | Incremental migration | Lower risk, site stays functional throughout |
| v3.0 | Structural only | Keep Notion integration separate (v3.1) |

### Research Completed

**v3.0 research** in `.planning/research/`:
- STACK-11ty-migration.md — 11ty v3.1.2, Liquid templates, minimal dependencies
- FEATURES-11ty-migration.md — Table stakes, differentiators, anti-features
- ARCHITECTURE-11ty-migration.md — Directory structure, integration points
- PITFALLS-11ty-migration.md — Common mistakes, prevention strategies
- SUMMARY-11ty-migration.md — Synthesized findings

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-02-04
**Stopped at:** Requirements defined, roadmap creation next
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md + ROADMAP.md
2. **Where we are:** Milestone v3.0 initialized, requirements defined
3. **What to do next:**
   - Create roadmap with 4 phases
   - Then: `/gsd:discuss-phase 35` to plan first phase

---

*This file is the single source of truth for project state. Update after every significant change.*
