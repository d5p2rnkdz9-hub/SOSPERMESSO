# Project State: SOS Permesso

**Last Updated:** 2026-02-02
**Status:** Milestone v2.0 active

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v2.0 Multilingual + Tests

## Current Position

**Current Milestone:** v2.0 Multilingual + Tests
**Phase:** 20 - Batch Translation Pipeline
**Status:** Complete (with tech debt)
**Last activity:** 2026-02-02 — All 209 pages translated to English

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
v2.0 Multilingual + Tests  [Active]             ███○○○○○○○
```

## Phase 20 Summary

**Completed:** All 209 pages translated (208 + homepage)
- Used Claude Code subagents (not Anthropic Batch API)
- 8 batches, 4 parallel agents per wave
- Glossary terms applied consistently
- All pages have `lang="en"` attribute

**Tech debt:** CSS/JS paths broken (see below)

## v2.0 Scope

**Track 1: English Translations**
- ~~Batch translation pipeline (208 pages)~~ ✓ Done
- [ ] Fix CSS/JS paths in EN pages (tech debt)
- [ ] Human review workflow
- [ ] Language switching (IT ↔ EN)

**Track 2: Proprietary Tests**
- Replace 3 Typeform tests with in-house solution
- Build for both IT + EN

**Decisions:**
- Hosting: `/en/` subfolder
- Reviewers: Volunteers
- Legal review: Not needed
- Sequence: Translations first, then tests

## Technical Debt

### Critical: EN Pages CSS/JS Paths (Phase 20)

**Problem:** All EN pages have incorrect asset paths - CSS/JS not loading.

**Current paths (wrong):**
```html
href="../../styles/main.css"
src="../../scripts/app.js"
```

**Correct paths:**
```html
href="../../../src/styles/main.css"
src="../../../src/scripts/app.js"
```

**Why:** EN pages at `en/src/pages/` are 3 levels deep, but paths set as if 2 levels.

**Fix scope:** 208 pages in `en/src/pages/` + `en/index.html`

**Fix approach:**
```bash
# For en/src/pages/*.html:
# ../../styles/ → ../../../src/styles/
# ../../scripts/ → ../../../src/scripts/
# ../../images/ → ../../../images/

# For en/index.html (different structure):
# Verify paths point to ../src/styles/, ../src/scripts/
```

### Other Tech Debt

From TODO-permits.md:
- 18 permits need Notion content (placeholder pages exist)

From prior milestones:
- Desktop header alignment (language switcher baseline)
- No npm script for build-permits.js (manual execution)

## Design Patterns to Follow

- **Footer:** Yellow background (#FFD700), centered, copyright + "Il Progetto" link
- **Navigation dropdowns:** CSS :hover + :focus-within, categories only on mobile
- **Collabora dropdown:** Segnala un errore, Dai una mano, Il progetto
- **Typeform URLs:** form.typeform.com/to/[form_id]
- **Layout:** Use `.category-section` and `.permit-list` structure
- **Color palette:** White header (#FFFFFF), teal menu text (#1A6B5F), warm gradients
- **Build scripts:** npm run build:* pattern (build:docs, build:sitemap)

## Accumulated Context

### Decisions

| Phase | Decision | Rationale |
|-------|----------|-----------|
| 20 | Claude Code subagents for translation | User preferred existing subscription over API setup |
| 20 | 8 batches of ~26 pages | Balanced parallelization |
| 20-02 | Use cheerio with decodeEntities: false | Preserve HTML entities |
| 20-02 | Mark elements with data-translate-id | Enable precise reassembly |
| v2.0 | /en/ subfolder for English pages | Not subdomain |
| v2.0 | Volunteer translators | Not paid |
| v2.0 | No legal review needed | For translations |

### Pending Todos

- [ ] Fix EN pages CSS/JS paths (critical - before human review)

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-02-02 17:30 UTC
**Stopped at:** Phase 20 complete, tech debt identified
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md, 20-03-SUMMARY.md
2. **Where we are:** Phase 20 complete but EN pages have broken CSS paths
3. **What to do next:**
   - Fix CSS/JS paths in all EN pages (tech debt)
   - Then proceed to Phase 21 (Human Review)

---

*This file is the single source of truth for project state. Update after every significant change.*
