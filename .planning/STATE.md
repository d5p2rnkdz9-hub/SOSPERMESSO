# Project State: SOS Permesso

**Last Updated:** 2026-01-26
**Status:** v1.3 Header & Navigation Fix — NEEDS INVESTIGATION

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v1.3 Header & Navigation Fix

## Current Position

**Phase:** Active
**Plan:** Fix header/language switcher layout
**Status:** Identified issue - language dropdown is huge block causing misalignment
**Last activity:** 2026-01-26 — Mobile fixes applied, language issue identified

```
Milestones:

v1.1 Documenti Questura    [Shipped 2026-01-25] ##########
v1.2 Visual Refresh        [Shipped 2026-01-26] ##########
v1.3 Header/Nav Fix        [In Progress]        ◆◆--------
v1.4 Document Dedup        [Backlog]            ----------
```

## Current Milestone: v1.3

**Goal:** Fix header layout - language switcher causes misalignment on desktop and interferes with mobile menu.

**Issues (documented 2026-01-26):**

**Desktop:**
- Menu items and language dropdown NOT on same line
- Language switcher appears on row below menu items
- Should be: Logo | Menu items | Language — all in one row

**Mobile:**
- White block still appearing below header (unknown source)
- Hamburger menu button visible but NOT WORKING
- Tapping hamburger does nothing — menu doesn't open

**Attempted fixes (unsuccessful):**
- Hidden language switcher on mobile (display: none) — white block persists
- Constrained dropdown width on desktop (max-width: 180px) — didn't fix alignment

**Root cause:** Unknown — needs deep CSS/JS investigation

## Shipped Milestones

**v1.2 Visual Refresh (2026-01-26):**
- 6 phases, 7 plans
- 131 files modified
- Key: Warm teal palette, new logo, reorganized homepage, white header

**v1.1 Documenti Questura (2026-01-25):**
- 3 phases, 4 plans
- 134 files created/modified
- Key: 63 document pages, Notion integration, interactive checklists

## Technical Debt

- Dizionario links need revision (partial matching works but coverage incomplete)
- Language switcher dropdown layout broken

## Design Patterns to Follow

- **Layout:** Use `.category-section` and `.permit-list` structure
- **Color palette:** White header (#FFFFFF), teal menu text (#1A6B5F), warm gradients
- **Logo:** 180px desktop, 100px mobile
- **Homepage sections:** Database → Guide → Test → Aiuto legale → Link utili
- **Content links:** Teal (#1A6B5F) with subtle underline

## Session Continuity

**Last session:** 2026-01-26
**Stopped at:** Language switcher issue identified
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md, PROJECT.md
2. **Where we are:** v1.3 in progress - fixing header/language layout
3. **What to do next:** Fix language-switcher CSS to be compact dropdown
4. **Key files:**
   - `src/styles/components.css` — Language switcher styles (lines 431-492)
   - `src/styles/mobile-fix.css` — Mobile overrides
   - `index.html` — Header HTML structure

---

*This file is the single source of truth for project state. Update after every significant change.*
