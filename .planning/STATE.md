# Project State: SOS Permesso — Documenti Questura

**Last Updated:** 2026-01-25
**Status:** Phase 2 In Progress

## Project Reference

**Core Value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current Focus:** Restructure documenti-questura page and create 46 document detail pages (primo + rinnovo for all 23 permit types).

## Current Position

**Phase:** 2 of 3 — Document Templates
**Plan:** 1 of 2 complete
**Status:** Plan 02-01 complete, ready for 02-02
**Last activity:** 2026-01-25 — Completed 02-01-PLAN.md (build infrastructure)

```
Progress: [███████░░░░░░░░░░░░░] 58% (7/12 requirements)

Phase 1: Page Foundation           [Complete] ██████████ 6/6 requirements
Phase 2: Document Templates        [Current]  ███░░░░░░░ 1/3 requirements
Phase 3: Complete Coverage         [Pending]  ░░░░░░░░░░ 0/3 requirements
```

## Performance Metrics

**Requirements:**
- Total v1: 12
- Complete: 7
- In Progress: 0
- Blocked: 0

**Phases:**
- Total: 3
- Complete: 1
- Current: 2 (Document Templates)
- Remaining: 2

**Success Criteria:**
- Total: 13 observable behaviors
- Met: 5 (Phase 1)
- Pending: 8

## Accumulated Context

### Key Decisions Made

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-25 | 3 phases for quick depth | User chose quick mode; natural grouping: page structure, templates, full generation |
| 2026-01-25 | Phase 1 delivers clickable badges even without target pages | Enables parallel work; page structure validates independently |
| 2026-01-25 | Separate template phase before bulk generation | Quality control: perfect 2 templates before creating 46 pages |
| 2026-01-25 | Badge URL pattern: documenti-{tipo}-primo.html and documenti-{tipo}-rinnovo.html | Maintains consistency with existing site URL patterns (kebab-case slugs) |
| 2026-01-25 | Badge colors: blue gradient for Primo, orange gradient for Rinnovo | Provides clear visual distinction while matching site's bright color palette |
| 2026-01-25 | Mobile: badges wrap below permit name with 44x44px min touch targets | Ensures accessibility per mobile design guidelines |
| 2026-01-25 | Graceful exit (exit 0) when NOTION_API_KEY not configured | Allows CI to pass during setup before Notion integration complete |
| 2026-01-25 | Database ID as constant in notion-client.js | Database is project-specific, unlikely to change |
| 2026-01-25 | Node.js 18 for Netlify build environment | Explicit version for reproducible builds |

### Design Patterns to Follow

- **Layout:** Use database.html's `.category-section` and `.permit-list` structure
- **Categories:** 4 color-coded sections (purple: studio/lavoro, orange: protezione, blue: cure mediche, teal: familiari)
- **Badges:** Inline with permit name, compact styling matching existing button/link patterns
- **File naming:** `documenti-{tipo}-primo.html` and `documenti-{tipo}-rinnovo.html`
- **Template:** Existing site header/footer, breadcrumb navigation, content sections
- **Notion client:** fetch data from database, return normalized objects
- **Build script:** test connection, fetch data, generate (graceful exit if not configured)

### Technical Notes

- Pure HTML/CSS/JS static site with Node.js build process for document generation
- All pages go in `src/pages/`
- CSS design system with variables in `src/styles/main.css`
- Mobile-first responsive design already established
- 39+ HTML pages already exist as reference
- Build infrastructure: package.json, @notionhq/client, dotenv, netlify.toml

### Current TODOs

- [x] ~~Run `/gsd:plan-phase 1` to create execution plan~~ Completed
- [x] ~~Identify exact permit list and categories from database.html~~ 23 permits in 4 categories
- [x] ~~Design badge component styling (CSS)~~ Blue/orange gradients implemented
- [x] ~~Decide document page content structure (what sections to include)~~ Defined in 02-CONTEXT.md
- [x] ~~Run `/gsd:plan-phase 2` to create document template plan~~ Created 02-01 and 02-02
- [x] ~~Run `/gsd:execute-phase 2` plan 01~~ Build infrastructure complete
- [ ] Set up Notion API integration (user action required)
- [ ] Execute plan 02-02 to create primo/rinnovo templates
- [ ] Verify generated pages work correctly

### Known Blockers

**Notion API Configuration Required:** Before 02-02 can fully test template generation, user must:
1. Create Notion integration at https://www.notion.so/my-integrations
2. Share the permit database with the integration
3. Set NOTION_API_KEY environment variable

### Questions / Uncertainties

None currently - all design decisions resolved.

## Session Continuity

**Last session:** 2026-01-25 13:00:XXZ
**Stopped at:** Completed 02-01-PLAN.md (build infrastructure)
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md, 02-01-SUMMARY.md, 02-02-PLAN.md
2. **Where we are:** Build infrastructure complete, ready for template generation
3. **What to do next:**
   - User: Configure Notion API (see "Known Blockers")
   - Then: Run `/gsd:execute-phase 2` plan 02 for template generation
4. **Key files to reference:**
   - `.planning/phases/02-document-templates/02-02-PLAN.md` — Templates with checklist
   - `scripts/notion-client.js` — Notion API client
   - `scripts/build-documents.js` — Build script (stub, to be extended in 02-02)
   - `src/pages/documenti-questura.html` — restructured page with 46 badge links

**Quick Start Command:** `/gsd:execute-phase 2` (plan 02)

---

*This file is the single source of truth for project state. Update after every significant change.*
