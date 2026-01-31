# Project State: SOS Permesso

**Last Updated:** 2026-01-31
**Status:** Ready to plan

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v1.9 SEO Foundations - Phase 18

## Current Position

**Milestone:** v1.9 SEO Foundations
**Phase:** 18 of 18 (SEO Infrastructure)
**Plan:** 1 of 1 in current phase
**Status:** Phase complete
**Last activity:** 2026-01-31 - Completed 18-01-PLAN.md (SEO Infrastructure)

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
```

## Technical Debt

From TODO-permits.md:
- 18 permits need Notion content (placeholder pages exist)

From prior milestones:
- Desktop header alignment (language switcher baseline)
- Dizionario links revision (partial matching, coverage incomplete)
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

## Accumulated Context

### Decisions

| Phase | Decision | Rationale | Impact |
|-------|----------|-----------|--------|
| 18-01 | Exclude all redirect pages from sitemap via meta refresh detection | Redirect pages shouldn't be indexed to prevent duplicate content issues | 35 redirect pages automatically excluded from 174-page sitemap |
| 18-01 | Use file modification time for sitemap lastmod dates | Simple, accurate, no manual maintenance needed | Sitemap dates auto-update when files change |
| 18-01 | Include full URL paths in sitemap (src/pages/ structure) | Matches actual site structure without URL rewriting | URLs reflect true file locations |

### Pending Todos

None - cleared for new milestone.

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-01-31
**Stopped at:** Completed 18-01-PLAN.md (SEO Infrastructure)
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md, PROJECT.md
2. **Where we are:** v1.9 milestone complete, SEO infrastructure ready for deployment
3. **What to do next:** Deploy to production or start next milestone planning

---

*This file is the single source of truth for project state. Update after every significant change.*
