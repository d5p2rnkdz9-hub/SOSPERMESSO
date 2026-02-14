# Project State: SOS Permesso

**Last Updated:** 2026-02-10
**Status:** v3.1 — Phase 41 complete, Phase 42 pending

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v3.1 Prassi Locali + Notion-11ty Completion

## Current Position

**Current Milestone:** v3.1 Prassi Locali + Notion-11ty Completion
**Phase:** 41 (Prassi Locali MVP) — complete
**Status:** All 4 plans complete, visually verified in browser
**Last activity:** 2026-02-10 — Fixed dotenv loading order in documents.js and prassiLocali.js (commit 5c8a318), prassi section renders correctly on both primo and rinnovo pages

```
Progress: [████░░░░░░] 38% (3/8 phases complete)
```

## v3.1 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 39 | Document Pages | DOC-01 to DOC-04 | ✓ Complete |
| 40 | Permit Pages | PERM-01 to PERM-04 | ✓ Complete |
| 41 | Prassi Locali MVP | PRASSI-01 to PRASSI-04 | ✓ Complete |
| 42 | Build Pipeline | BUILD-01 to BUILD-04 | ○ Pending |
| 43 | Populate Blank Permits | CONTENT-01 to CONTENT-02 | ○ Pending |
| 44 | Costi Section | COSTI-01 to COSTI-02 | ○ Pending |
| 45 | Content Validation | VALID-01 to VALID-02 | ○ Pending |
| 46 | Dizionario Link Revision | DIZIO-01 to DIZIO-02 | ○ Pending |

## Phase 41 Summary

**Goal:** Add crowdsourced prassi locali (local questura practices) to document pages.

**Delivered:**
- `_data/prassiLocali.js` — Notion data file for approved practices (grouped by slug then city)
- `src/styles/prassi.css` — Complete styling (section, cards, votes, empty state, modal, responsive)
- `src/scripts/prassi.js` — Client-side modal, voting UI, city autocomplete (105 questure)
- `netlify/functions/submit-prassi.js` — Submission endpoint with validation
- `netlify/functions/vote-prassi.js` — Vote counting via Notion API
- `netlify/functions/notion-webhook.js` — Webhook with timing-safe signature verification
- Prassi section in both `documents-primo.liquid` and `documents-rinnovo.liquid` templates
- Anchor link in page header for quick navigation

**Issues resolved during execution:**
1. Liquid `| contains:` filter → `contains` operator (LiquidJS compatibility)
2. Old static document files overwriting 11ty output → dynamic ignore pattern
3. Duplicate slug conflicts → dedup in documents.js
4. Redirect slug conflicts → filter in documents.js
5. **dotenv loading order** → Added `require('dotenv').config()` to documents.js and prassiLocali.js

## Performance Metrics

**Velocity:**
- Total plans completed: 17 (v2.2 + v3.0 + v3.1 milestones)
- Average duration: 5.56 min
- Total execution time: ~95 min

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
| 41 | 4 | 36 min | 9 min |

*Updated after each plan completion*

## v3.0 Summary

**Goal:** Migrate from pure HTML (469 pages) to 11ty SSG for maintainable architecture.

**Key approach decisions:**
- **Liquid templates** (not Nunjucks — unmaintained since June 2022)
- **Incremental migration** (not big-bang)
- **URL preservation** critical (all 469 URLs must work)
- **Structural only** — same content, keep existing Notion scripts

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
- **Always `require('dotenv').config()` at top of data files that use env vars**
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

- **41-01: prassi-data-structure** — Nested object: pageSlug -> [[cityName, practices[]]]
- **41-01: empty-state-static** — Show empty state with button in static HTML (progressive enhancement)
- **41-01: graceful-degradation** — Return empty {} when env vars missing
- **41-02: no-upstash-redis** — localStorage only for vote duplicate prevention, defer server-side rate limiting
- **41-03: modal-injection** — Inject modal HTML/CSS via JS (matches contact-form.html pattern)
- **41-03: vote-localStorage** — 24-hour expiry on duplicate prevention
- **41-03: webhook-timing-safe** — crypto.timingSafeEqual for signature comparison
- **41: Liquid contains operator** — Use `contains` operator in if/assign, NOT `| contains:` filter (LiquidJS doesn't have filter)
- **41: Dynamic document file ignore** — readdirSync to ignore all documenti-*.html files (same pattern as permits)
- **41: Slug dedup in documents.js** — Skip duplicate slugs and redirect display slugs to prevent 11ty DuplicatePermalinkOutputError
- **41: dotenv in data files** — Always call `require('dotenv').config()` at top of data files that use process.env

### Research Completed

**v3.0 research** in `.planning/research/`:
- STACK-11ty-migration.md — 11ty v3.1.2, Liquid templates, minimal dependencies
- FEATURES-11ty-migration.md — Table stakes, differentiators, anti-features
- ARCHITECTURE-11ty-migration.md — Directory structure, integration points
- PITFALLS-11ty-migration.md — Common mistakes, prevention strategies
- SUMMARY-11ty-migration.md — Synthesized findings

### Pending Todos

None

### Blockers/Concerns

None

## Session Continuity

**Last session:** 2026-02-10
**Stopped at:** Phase 41 complete
**Resume file:** None

**Next Action:** Plan and execute Phase 42 (Build Pipeline). Use `/gsd:plan-phase 42` or `/gsd:execute-phase 42`.

---

*This file is the single source of truth for project state. Update after every significant change.*
