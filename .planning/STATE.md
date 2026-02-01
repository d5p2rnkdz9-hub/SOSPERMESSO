# Project State: SOS Permesso

**Last Updated:** 2026-01-31
**Status:** Milestone v2.0 active

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v2.0 Multilingual + Tests

## Current Position

**Current Milestone:** v2.0 Multilingual + Tests
**Phase:** 20 - Batch Translation Pipeline
**Status:** Ready for planning
**Last activity:** 2026-01-31 — Roadmap created, starting Phase 20

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
v2.0 Multilingual + Tests  [Active]             ○○○○○○○○○○
```

## v2.0 Scope

**Track 1: English Translations**
- Translator review interface (web UI for volunteers)
- Batch translation pipeline (208 pages)
- Human review workflow
- Language switching (IT ↔ EN)

**Track 2: Proprietary Tests**
- Replace 3 Typeform tests with in-house solution
- Build for both IT + EN

**Decisions:**
- Hosting: `/en/` subfolder
- Reviewers: Volunteers
- Legal review: Not needed
- Sequence: Translations first, then tests

## Patch Releases

### v1.9.1 (In Progress)

**Mobile header fix:**
- ✓ Fixed hamburger menu missing on mobile (language-switcher width: 100% removed)
- ✓ Fixed language dropdown positioning (full-width bottom sheet)
- ✓ Added JS toggle for language dropdown on mobile

**Dictionary expansion:**
- ✓ Added 8 new terms: Questura, Prefettura, Sportello Unico, Visto, Ricevuta, Marca da bollo, Copia conforme, Tessera sanitaria
- ✓ Updated dizionario-map.json with terms + aliases
- ✓ Integrated linkToDizionario into permit page builder

**To complete v1.9.1:**
```bash
node scripts/build-permits.js   # Regenerate 67 permit pages with dictionary links
```

### v1.9.2 (Future)

- [ ] Dictionary self-linking (terms in dizionario.html link to each other)
- [ ] Permit cross-linking (permit names in content → link to permit pages)
- [ ] Post-process script for static pages (dizionario.html, guides)

## Technical Debt

From TODO-permits.md:
- 18 permits need Notion content (placeholder pages exist)

From prior milestones:
- Desktop header alignment (language switcher baseline)
- ~~Dizionario links revision~~ → Addressed in v1.9.1 (8 new terms, permit page linking)
- No npm script for build-permits.js (manual execution)

## Design Patterns to Follow

- **Footer:** Yellow background (#FFD700), centered, copyright + "Il Progetto" link
- **Navigation dropdowns:** CSS :hover + :focus-within, categories only on mobile
- **Collabora dropdown:** Segnala un errore, Dai una mano, Il progetto
- **Typeform URLs:** form.typeform.com/to/[form_id]
- **Layout:** Use `.category-section` and `.permit-list` structure
- **Color palette:** White header (#FFFFFF), teal menu text (#1A6B5F), warm gradients
- **CTA buttons:** Section with primary + secondary buttons linking to document pages
- **Permit template:** Use scripts/templates/permesso.js for generating permit pages
- **Bullet styling:** Blue triangle bullets via CSS ::before pseudo-element
- **Variant structure:** Parent/child pages in subfolders for multi-type permits
- **Build scripts:** npm run build:* pattern (build:docs, build:sitemap)

## Accumulated Context

### Decisions

- /en/ subfolder for English pages (not subdomain)
- Volunteer translators (not paid)
- No legal review needed for translations
- Proprietary tests replace Typeform for both IT + EN
- Translations first, then tests

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-01-31
**Stopped at:** Defining v2.0 roadmap
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md, PROJECT.md, ROADMAP.md
2. **Where we are:** v2.0 milestone started, roadmap being created
3. **What to do next:** Complete roadmap, then `/gsd:plan-phase 19`

---

*This file is the single source of truth for project state. Update after every significant change.*
