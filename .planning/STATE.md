# Project State: SOS Permesso

**Last Updated:** 2026-02-17
**Status:** v3.1 — Phase 44.1, Plan 03 checkpoint (issues found)

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-07)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v3.1 Prassi Locali + Notion-11ty Completion

## Current Position

**Current Milestone:** v3.1 Prassi Locali + Notion-11ty Completion
**Phase:** 44.1 (URL Coverage & Content Preservation) — ⌛ In Progress (Plan 03 checkpoint)
**Last activity:** 2026-02-17 — Plan 03 Task 1 done, checkpoint issues found

```
Progress: [███████░░░] 75% (8/11 phases, 2.5/3 plans in Phase 44.1)
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
| 44 | Costi Section | COSTI-01 to COSTI-02 | ✓ Complete |
| **44.1** | **URL Coverage & Content Preservation** | URL-01 to URL-03 | ⌛ **In Progress** (Plan 03 checkpoint) |
| 45 | Content Validation | VALID-01 to VALID-02 | ○ Pending |
| 46 | Dizionario Link Revision | DIZIO-01 to DIZIO-02 | ○ Pending |

## Phase 44.1 Summary (In Progress)

**Goal:** Ensure every Notion DB permit has a working HTML page, old URLs redirect to canonical pages, variant permits have parent/hub pages, and content from old static files is preserved.

**Delivered (Plan 01):**
- 44.1-01: Content audit script comparing 64 static permit files against CONTEXT.md mapping
- CONTENT-AUDIT.md documenting 34 mapped files: 8 safe to redirect, 22 need review, 4 need parent pages
- Identified 13 "TARGET NOT FOUND" cases (canonical pages missing)
- Content preservation guarantee: no file deleted/redirected without verified migration
- URL-03 requirement satisfied

**Key decisions:**
- File-based canonical validation (not Notion API) — simpler, matches actual page generation
- Defer migration to manual review — too risky to auto-migrate
- Zero-loss tolerance — 22 files blocked pending content verification

**Delivered (Plan 02):**
- 44.1-02: Permit redirect system (31 old URLs → canonical), 3 parent pages (Studio, Lavoro Autonomo, Cure Mediche art.19), duplicate filtering, slugMap.js typo fix
- Commits: `4ce515b` (variant detection + duplicates), `f57fab3` (redirects + slugMap)

**Delivered (Plan 03 — Task 1 done, checkpoint blocked):**
- 44.1-03 Task 1: Deleted 64 old static permit files, removed permit ignore block from eleventy.config.mjs, cleaned up audit script
- Commit: `1a3d9b0`
- Automated checks passed: 77 permit pages, 0 stale files, 0 broken redirect targets

**Checkpoint issues found (3 issues, must debug in fresh context):**
1. **database.html URL path** — database.html lives at `/src/pages/database.html` in the build, NOT at `/database.html`. Links from it use relative paths like `permesso-xxx.html` which resolve to `/src/pages/permesso-xxx.html` — but permit pages are generated at root level (`/permesso-xxx.html`). All 25 permit links are 404.
2. **Variant parent/child pages NOT wanted** — User does NOT want parent+children hierarchy for Studio, Lavoro autonomo, Lavoro subordinato, Cure mediche art.19. Wants FLAT structure mirroring Notion DB exactly. The entire `manualVariantGroups` system and `detectVariants()` parent page generation needs to be removed or disabled. Each Notion permit page = one HTML page, no synthetic parent pages.
3. **Lavoro subordinato manual override committed (08e34a4)** — Added lavoro subordinato to manualVariantGroups (3→2 children). This commit should be REVERTED since the whole variant system is being removed per issue #2.

## Phase 44 Summary

**Goal:** Add itemized cost breakdown section to document pages.

**Delivered:**
- 44-01: Cost extraction from Notion multi_select values + costi section in templates + CSS
- `extractCost()` helper parses "marca da bollo da 16€" and "bollettino postale da 70.46€" from document lists
- 35 of 65 primo pages show cost section; 30 correctly hidden (no cost data)
- Kit postale 30€ conditional on method containing "kit"
- "Quanto costa" anchor link in page header
- Responsive CSS + print support

**Key decision:** Cost data parsed from existing multi_select fields (no new Notion columns needed).

## Phase 43 Summary

**Goal:** Add Notion content for all placeholder permit pages.

**Result:** 8 permits populated, 3 skipped by user (not recognized in DB)

**Content rules established:**
- No document lists in Q&A — link to doc pages instead
- Bollettino includes 40€ electronic permit cost (never list separately)
- Full URLs for Notion links
- Conversational "tu" tone throughout

## Performance Metrics

**Velocity:**
- Total plans completed: 27 (v2.2 + v3.0 + v3.1 milestones)
- Average duration: 5.6 min
- Total execution time: ~170 min

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
| 44 | 1 | 10 min | 10 min |
| 44.1 | 1 | 6 min | 6 min |

*Updated after each plan completion*

## Technical Debt

**New (Phase 44.1 checkpoint — 3 issues for debug):**
- **database.html path + broken links** — Page is at `/src/pages/database.html` but permit pages are at root (`/permesso-*.html`). Relative links all 404. Need either: (a) move database.html to root, or (b) fix link paths to absolute.
- **Remove variant parent/child system** — User wants FLAT hierarchy mirroring Notion DB. Remove `manualVariantGroups`, `detectVariants()` parent page generation, `isVariantParent`/`isVariantChild` logic. Each Notion page = one HTML page. Revert commit `08e34a4`.
- **Redirect system may need adjustment** — After removing parent pages, some redirects that pointed to parent pages need to point to actual Notion-generated pages instead.

From prior milestones (carry forward):
- Dizionario links need revision (partial matching works but coverage incomplete)
- Desktop header alignment (language switcher baseline)
- Template variable `{{ permit.tipo }}` in meta tags (pre-existing Phase 40 issue)
- 3 unrecognized permits in DB (Tirocinio, Lavoro artistico, Sanatoria) — user to decide

## Design Patterns to Follow

**Data layer patterns:**
- CommonJS format for data files (`module.exports = {}`)
- **Always `require('dotenv').config()` at top of data files that use env vars**
- `extractCost()` for parsing amounts from Notion multi_select labels

**Cost data pattern (Phase 44):**
- Costs embedded in "Doc primo/rinnovo" multi_select values
- Parse with regex: `item.match(/(\d+[\.,]?\d*)\s*€/)`
- Kit postale is fixed 30€ in template (not from Notion)

## Accumulated Context

### Decisions

- **44.1-01-C: zero-loss-tolerance** — Block any file deletion/redirect unless content equivalence confirmed (URL-03 requirement)
- **44.1-01-B: defer-migration-to-review** — Document migration needs but don't auto-migrate (too risky without human verification)
- **44.1-01-A: file-based-canonical-validation** — Check target file existence in src/pages/ (not Notion API)
- **44-01: parse-costs-from-multiselect** — Cost data parsed from existing multi_select values, no new Notion columns
- **43-04: content-rules** — No doc lists in Q&A (link to doc pages), bollettino includes 40€, full URLs, "tu" tone
- **43-03: skip-unrecognized** — User skipped 3 permits not recognized in DB
- **43-01: duplicate-archive** — Rename duplicates with [DUPLICATE] prefix
- **42.1-01: filesystem-guard-removal** — Remove existsSync check from documents.js
- **42-01: single-build-command** — Simplify to `npx @11ty/eleventy`
- **41: dotenv in data files** — Always call `require('dotenv').config()` at top

### Pending Todos

- **Review how pages are built** — User wants to review the overall 11ty page generation architecture: where pages end up in the build output, how paths/URLs work, why database.html is at `/src/pages/` while permits are at root. May overlap with Phase 45 (Content Validation) or warrant its own review pass.

### Roadmap Evolution

- Phase 44.1 inserted after Phase 44: URL Coverage & Content Preservation (URGENT) — 34 static permit files not generating pages, old URLs broken, variant parent pages missing, content at risk of loss

### Blockers/Concerns

**Phase 44.1 findings:**
- 13 mapped files point to canonical slugs that don't exist as static files (need investigation)
- 9 files have partial unique content overlap (need manual review before redirect)
- Recommendation: Check Notion DB directly for the 13 missing canonical slugs

## Session Continuity

**Last session:** 2026-02-17
**Stopped at:** Plan 44.1-03 checkpoint — Task 1 complete (commit `1a3d9b0`), two issues found
**Resume file:** None

**Next Action:** Debug 3 issues in fresh context (`/gsd:debug`):
1. **database.html links 404** — relative paths resolve wrong because page is at `/src/pages/` while permits are at root. Investigate 11ty output path for database.html.
2. **Remove variant parent/child system** — User wants flat hierarchy (1 Notion page = 1 HTML page). Remove `manualVariantGroups`, `detectVariants()` parent generation, `isVariantParent`/`isVariantChild`. Revert commit `08e34a4`. Update permits.liquid template.
3. **Fix redirects** — After removing parent pages, redirects pointing to parent slugs (studio, lavoro-autonomo, lavoro-subordinato, cure-mediche-art-19) need new targets.
4. Then rebuild, re-verify, complete Plan 03

---

*This file is the single source of truth for project state. Update after every significant change.*
