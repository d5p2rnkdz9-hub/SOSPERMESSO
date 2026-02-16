# Project State: SOS Permesso

**Last Updated:** 2026-02-16
**Status:** v3.1 — Phase 43 complete, Phase 44 next

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v3.1 Prassi Locali + Notion-11ty Completion

## Current Position

**Current Milestone:** v3.1 Prassi Locali + Notion-11ty Completion
**Phase:** 43 (Populate Blank Permits) — ✓ Complete
**Last activity:** 2026-02-16 — Phase 43 verified and completed

```
Progress: [███████░░░] 70% (7/10 phases complete)
```

## v3.1 Phases

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 39 | Document Pages | DOC-01 to DOC-04 | ✓ Complete |
| 40 | Permit Pages | PERM-01 to PERM-04 | ✓ Complete |
| 41 | Prassi Locali MVP | PRASSI-01 to PRASSI-04 | ✓ Complete |
| 42 | Build Pipeline | BUILD-01 to BUILD-04 | ✓ Complete |
| 42.1 | Fix Prassi Integration | PRASSI-01 to PRASSI-04 | ✓ Complete |
| 42.2 | Requirements & Docs Cleanup | — | ✓ Complete |
| 43 | Populate Blank Permits | CONTENT-01 to CONTENT-02 | ✓ Complete |
| **44** | **Costi Section** | COSTI-01 to COSTI-02 | ○ **Pending** |
| 45 | Content Validation | VALID-01 to VALID-02 | ○ Pending |
| 46 | Dizionario Link Revision | DIZIO-01 to DIZIO-02 | ○ Pending |

## Phase 43 Summary

**Goal:** Add Notion content for all placeholder permit pages.

**Delivered:**
- 43-01: Audit — 10 unique blank permits identified, 3 duplicates archived, reference model documented
- 43-02: Protezione — Apolidia populated (1 permit)
- 43-03: Lavoro — Attività sportiva art.27 + Ricerca scientifica populated (2 permits). 3 skipped by user
- 43-04: Remaining — Figlio minore, Residenza elettiva, Motivi religiosi, Acquisto cittadinanza (4 permits)
- Post-checkpoint: Familiari di titolari rewritten from Trento-specific to Q&A (1 permit)
- Post-checkpoint: 2 old static files deleted (attivita-sportiva, familiari-di-titolari)

**Result:** 8 permits populated, 3 skipped by user (not recognized in DB), 6 placeholder pages remain (3 duplicates + 3 skipped)

**Content rules established:**
- No document lists in Q&A — link to doc pages instead
- Bollettino includes 40€ electronic permit cost (never list separately)
- Full URLs for Notion links
- Conversational "tu" tone throughout

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

## Phase 42.1 Summary

**Goal:** Fix prassi locali integration broken by static file conflict.

**Root cause:** documents.js had `fs.existsSync()` checks that skipped slugs with existing static files. Old 145 static HTML files prevented Liquid templates from generating pages with prassi section.

**Delivered:**
- Deleted 145 old static `documenti-*.html` files from src/pages/
- Removed filesystem guard from `_data/documents.js` (fs.existsSync checks)
- Updated `eleventy.config.mjs` with safety-net ignore for stray document files
- Added PRASSI_DB_ID to `.env.example`
- Verified all 81 document pages now include prassi.css, prassi section, and prassi.js

**Result:** Prassi locali feature now fully functional on all document pages.

## Performance Metrics

**Velocity:**
- Total plans completed: 25 (v2.2 + v3.0 + v3.1 milestones)
- Average duration: 5.5 min
- Total execution time: ~154 min

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
| 42 | 3 | 21 min | 7 min |
| 42.1 | 1 | 3 min | 3 min |
| 43 | 4 | 20 min | 5 min |

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
- Template variable `{{ permit.tipo }}` in meta tags (pre-existing Phase 40 issue)
- 3 unrecognized permits in DB (Tirocinio, Lavoro artistico, Sanatoria) — user to decide

Resolved in Phase 42:
- ✓ Single-step build (was: two-step build:docs + build:11ty)
- ✓ Clean scripts/ directory (was: 20+ obsolete scripts)
- ✓ Webhook debounce (30-min window prevents excessive rebuilds)
- ✓ Content audit infrastructure (reusable via `npm run audit`)

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

- **43-04: content-rules** — No doc lists in Q&A (link to doc pages), bollettino includes 40€, full URLs, "tu" tone
- **43-03: skip-unrecognized** — User skipped 3 permits not recognized in DB (Tirocinio, Lavoro artistico, Sanatoria)
- **43-01: duplicate-archive** — Rename duplicates with [DUPLICATE] prefix (build dedup ignores them)
- **42.1-01: filesystem-guard-removal** — Remove existsSync check from documents.js
- **42.1-01: safety-net-ignores** — Add dynamic ignore block for stray static document files
- **42-01: inline-notion-client** — Inline Notion API calls into permits.js
- **42-01: single-build-command** — Simplify to `npx @11ty/eleventy`
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

**Last session:** 2026-02-16
**Stopped at:** Phase 43 complete and verified
**Resume file:** None

**Next Action:** `/gsd:discuss-phase 44` or `/gsd:plan-phase 44` — Costi Section

---

*This file is the single source of truth for project state. Update after every significant change.*
