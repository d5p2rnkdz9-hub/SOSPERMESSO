# Project State: SOS Permesso

**Last Updated:** 2026-02-02
**Status:** Milestone v2.1 active

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

**Current focus:** v2.1 Homepage CSS Redesign

## Current Position

**Current Milestone:** v2.1 Homepage CSS Redesign
**Phase:** Not started (defining roadmap)
**Status:** Requirements defined, creating roadmap
**Last activity:** 2026-02-02 — Milestone v2.1 initialized

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
v2.0 Translations          [Phase 20 done]      ███░░░░░░░
v2.1 Homepage Redesign     [Active]             ○○○○○○○○○○
v3.0 Human Review + Tests  [Queued]             ..........
```

## v2.1 Scope

**Goal:** Modern "startup SaaS" aesthetic for homepage with updated header/footer.

**Requirements (13 total):**
- LAYT-01, LAYT-02: Split hero layout, organic wave divider
- TYPO-01, TYPO-02, TYPO-03: Bold display heading, fluid typography, Playfair Display
- VISL-01, VISL-02, VISL-03, VISL-04: Color palette, dark CTA, hover effects, scroll fade-ins
- HEAD-01, HEAD-02: Header redesign, footer update
- QUAL-01, QUAL-02: Visual regression baseline, mobile testing

**Out of scope:** Propagate to all 416 pages (do later if working well)

## v2.0 Status (Paused)

Phase 20 complete — all 209 pages translated to English.
CSS/JS paths fixed.
Remaining phases (21-27) moved to v3.0.

## Technical Debt

From prior milestones:
- Dizionario links need revision (partial matching works but coverage incomplete)
- Desktop header alignment (language switcher baseline)
- No npm script for build-permits.js (manual execution)
- 18 permits still need Notion content (placeholder pages)

## Design Patterns to Follow

**v2.1 Target Aesthetic (from research):**
- Clean white background with generous whitespace
- Bold display typography (Playfair Display for hero)
- Split hero layout (text left, illustration right)
- Organic wave divider (SVG, yellow/orange)
- Dark rounded CTA button
- CSS-only hover interactions
- Scroll-triggered fade-ins (IntersectionObserver)

**Existing patterns to preserve:**
- CSS variables system in main.css
- Mobile-first responsive design
- Dropdown navigation structure

## Accumulated Context

### Decisions

| Phase | Decision | Rationale |
|-------|----------|-----------|
| v2.1 | Modern SaaS aesthetic | Visual refresh inspired by WeDu/Wix template |
| v2.1 | Playfair Display + Inter | Serif display for contrast, keep Inter for body |
| v2.1 | Homepage-first | Test design before 416-page rollout |
| v2.1 | Skip feature badge row | Not essential for initial redesign |
| 20 | Claude Code subagents for translation | User preferred existing subscription over API setup |
| v2.0 | /en/ subfolder for English pages | Not subdomain |

### Research Completed

v2.1 research in `.planning/research/`:
- STACK-homepage-css.md — CSS techniques (clamp, Grid, SVG waves)
- FEATURES.md — Table stakes, differentiators, anti-features
- ARCHITECTURE-CSS-REDESIGN.md — File structure, propagation strategy
- PITFALLS-homepage-css.md — Visual regression, contrast, mobile issues
- SUMMARY.md — Synthesized findings

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

**Last session:** 2026-02-02
**Stopped at:** Requirements defined, creating roadmap
**Resume file:** None

**For next session:**

1. **Context to load:** This STATE.md
2. **Where we are:** v2.1 requirements defined, roadmap being created
3. **What to do next:**
   - Complete roadmap creation
   - Run `/gsd:plan-phase [N]` to start execution

---

*This file is the single source of truth for project state. Update after every significant change.*
