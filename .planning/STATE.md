# Project State: SOS Permesso

**Last Updated:** 2026-02-09
**Status:** v3.1 Notion-11ty Integration — Phase 40 complete

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v3.1 Notion-11ty Integration — Convert build scripts to 11ty data files

## Current Position

**Current Milestone:** v3.1 Notion-11ty Integration
**Phase:** 40 (Permit Pages) — complete
**Plan:** —
**Status:** Phase 40 verified, ready for Phase 41
**Last activity:** 2026-02-09 — Phase 40 complete and verified

```
Progress: [██████░░░░] 67% (2/3 phases complete)
```

## v3.1 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 39 | Document Pages | DOC-01 to DOC-04 | ✓ Complete |
| 40 | Permit Pages | PERM-01 to PERM-04 | ✓ Complete |
| 41 | Build Pipeline | BUILD-01 to BUILD-04 | ○ Pending |

## Performance Metrics

**Velocity:**
- Total plans completed: 12 (v2.2 + v3.0 + v3.1 milestones)
- Average duration: 4.75 min
- Total execution time: 57 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 34.1 | 1 | 5 min | 5 min |
| 35 | 1 | 5 min | 5 min |
| 36 | 2 | 7 min | 3.5 min |
| 37 | 3 | 13 min | 4.3 min |
| 38 | 1 | 8 min | 8 min |
| 39 | 2 | 8 min | 4 min |
| 40 | 2 | 12 min | 6 min |

**Recent Trend:**
- Phase 37 Plan 01: 8 min (3 tasks, 1 deviation - 404 cleanup)
- Phase 37 Plan 02: 3 min (2 tasks, 0 deviations)
- Phase 37 Plan 03: 2 min (2 tasks, verification only - work done in 37-02)
- Phase 38 Plan 01: 8 min (3 tasks, 0 deviations, checkpoint verified)
- Phase 39 Plan 01: 3 min (3 tasks, 0 deviations)
- Phase 39 Plan 02: 5 min (3 tasks, 1 deviation - ignore conflict)
- Phase 40 Plan 01: 5 min (2 tasks, 0 deviations)
- Phase 40 Plan 02: 7 min (3 tasks, 1 deviation - duplicate slug fix, checkpoint verified)
- Trend: Permit pages complete, Liquid boolean == true pattern discovered

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
- **37-03: EN migration bundled with IT** — EN pages were migrated in fc11fc2 along with IT pages
- **38-01: Node 22 LTS for Netlify** — Latest stable version with long support window (until Apr 2027)
- **38-01: Combined build script** — Chains Notion content generation before 11ty compilation
- **38-01: No build caching** — Build completes in 13.5s locally, caching adds complexity without benefit
- **39-01: Separate primo/rinnovo arrays** — documents.js returns {primo: [], rinnovo: []} for direct pagination
- **39-01: Graceful degradation** — Return empty arrays when NOTION_API_KEY missing, don't fail build
- **39-01: createRequire pattern** — Use createRequire to import CommonJS helpers from ESM config
- **39-02: Inline header/footer for documents** — Document pages use simpler nav, kept inline not includes
- **39-02: Ignore old redirect HTML** — Dynamic ignore patterns via slugMap prevent permalink conflicts
- **40-01: Function copying from build scripts** — Copy parsing functions instead of import to avoid side-effect execution
- **40-01: parentSlug pre-computation** — Variant children get parentSlug from detectVariants baseSlug for breadcrumbs
- **40-01: Section index for styling** — Add index field to sections for getSectionBorderColor fallback rotation
- **40-02: Explicit boolean comparison in Liquid** — Use `== true` for JS booleans passed via 11ty data (truthy eval unreliable)
- **40-02: Dynamic permit file ignore** — readdirSync to ignore all permesso-*.html files, matching Phase 39 redirect pattern

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

**Last session:** 2026-02-09
**Stopped at:** Phase 40 complete and verified
**Resume file:** None

**Next Action:** Run `/gsd:discuss-phase 41` or `/gsd:plan-phase 41` to start Build Pipeline phase.

---

*This file is the single source of truth for project state. Update after every significant change.*
