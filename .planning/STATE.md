# Project State: SOS Permesso

**Last Updated:** 2026-02-05
**Status:** Phase 36-02 complete (Header/Footer component includes), ready for 36-03 or Phase 37

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-04)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v3.0 11ty Migration - Component extraction

## Current Position

**Current Milestone:** v3.0 11ty Migration
**Phase:** 36 of 38 (Components)
**Plan:** 2 of 3 complete
**Status:** In progress
**Last activity:** 2026-02-05 — Completed 36-02-PLAN.md (Header/Footer Includes)

```
Progress: [█████░░░░░] 50% (3/6 plans complete: 35-01, 36-01, 36-02)
```

## v3.0 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 35 | Setup | SETUP-01 to SETUP-04 | COMPLETE |
| 36 | Components | COMP-01 to COMP-05 | Plan 02 complete |
| 37 | Pages | PAGE-01 to PAGE-04, I18N-01 to I18N-03 | Queued |
| 38 | Deployment | DEPLOY-01 to DEPLOY-03 | Queued |

## Performance Metrics

**Velocity:**
- Total plans completed: 4 (v2.2 + v3.0 milestones)
- Average duration: 4.25 min
- Total execution time: 17 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 34.1 | 1 | 5 min | 5 min |
| 35 | 1 | 5 min | 5 min |
| 36 | 2 | 7 min | 3.5 min |

**Recent Trend:**
- Phase 34.1 Plan 01: 5 min (2 tasks, 1 deviation auto-fixed)
- Phase 35 Plan 01: 5 min (3 tasks, 5 deviations auto-fixed)
- Phase 36 Plan 01: 3 min (3 tasks, 0 deviations)
- Phase 36 Plan 02: 4 min (4 tasks, 0 deviations, checkpoint verified)
- Trend: Fast execution, plans executing cleanly

*Updated after each plan completion*

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

**11ty patterns (established in Phase 35):**
- Passthrough copy for static assets
- ESM config file (eleventy.config.mjs)
- Global computed permalink via _data/eleventyComputed.js
- Directory data files for URL preservation
- Ignore pattern for non-template directories

**Data layer patterns (established in Phase 36-01):**
- CommonJS format for data files (`module.exports = {}`)
- Language-keyed data structures (it/en) for nav/footer
- url filter for all asset paths in templates

**Component patterns (established in Phase 36-02):**
- Liquid includes for reusable components: `{% include "components/name.liquid" %}`
- Lang variable from page front matter for language detection
- Loop through data: `{% for item in nav[lang] %}`
- Fallback defaults: `{% assign data = footer[lang] | default: footer.it %}`

**Existing patterns to preserve:**
- CSS variables system in main.css
- Mobile-first responsive design
- Dropdown navigation structure

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v3.0: 11ty migration (structural) — Eliminate duplicated headers/footers in 469 files
- v3.0: Liquid over Nunjucks — Nunjucks unmaintained since June 2022
- v3.0: Incremental migration — Convert pages gradually, not big-bang
- v3.0: Structural only — Keep Notion integration separate (v3.1)
- **34.1-01: CSS link order matters** — Check en/index.html path BEFORE root index.html to avoid greedy matching
- **35-01: ESM config file (.mjs)** — Used .mjs extension for 11ty config because project is CommonJS
- **35-01: Global computed permalink** — _data/eleventyComputed.js handles all HTML files
- **35-01: Retained directory data files** — Kept for explicitness as defense-in-depth
- **36-01: CommonJS for data files** — Matches existing eleventyComputed.js
- **36-01: Language-keyed data** — nav.js and footer.js keyed by language code (it/en)
- **36-01: external flag for links** — Typeform links marked with `external: true`
- **36-02: Component includes** — Header, nav, footer, language-switcher as Liquid includes
- **36-02: Language detection** — Uses HTML lang attribute, not URL path parsing

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

**Last session:** 2026-02-05
**Stopped at:** Completed 36-02-PLAN.md (Header/Footer Includes)
**Resume file:** None

**Next Action:** Ready for Phase 36 Plan 03 (Hero sections) or Phase 37 (Page conversion).

---

*This file is the single source of truth for project state. Update after every significant change.*
