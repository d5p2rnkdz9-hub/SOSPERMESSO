# Roadmap: SOS Permesso

**Current Milestone:** v2.1 Homepage CSS Redesign
**Started:** 2026-02-02

---

## v2.1 Homepage CSS Redesign

> **Goal:** Transform the homepage into a modern "startup SaaS" aesthetic with split hero layout, display typography, and cleaner white/black/yellow palette. Scope limited to homepage; header/footer changes propagate via shared CSS.

### Active Phase

**Phase 28: Foundation** — Establish visual regression baseline and prepare CSS infrastructure

**Plans:** Not yet created

### Phases

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 28 | Foundation | Visual regression baseline, font loading, CSS variables | Pending |
| 29 | Hero Section | Split hero layout, wave divider, display heading, dark CTA | Pending |
| 30 | Header/Footer | Minimal header redesign, updated footer styling | Pending |
| 31 | Polish | Hover effects, scroll fade-ins, mobile testing | Pending |

---

## Phase Details

### Phase 28: Foundation

**Goal:** Establish visual regression baseline and prepare CSS infrastructure for redesign.

**Dependencies:** None (first phase)

**Requirements:**
- QUAL-01: Visual regression baseline established before changes
- TYPO-02: Typography uses fluid sizing with `clamp()`
- TYPO-03: Playfair Display font loaded for hero headings
- VISL-01: Homepage uses white/black/yellow color palette

**Success Criteria:**
1. User can run a command that captures baseline screenshots of current homepage (IT and EN)
2. Playfair Display font loads without visible layout shift on page load
3. CSS variables for the new color palette exist in main.css (yellow primary, white background, black text)
4. Fluid typography scales smoothly when browser window is resized (no jumps at breakpoints)

---

### Phase 29: Hero Section

**Goal:** Users see a modern split-layout hero with bold display heading and organic wave divider.

**Dependencies:** Phase 28 (font and color variables must exist)

**Requirements:**
- LAYT-01: Homepage has split hero layout (text left, illustration right)
- LAYT-02: Homepage has organic wave divider below hero section
- TYPO-01: Hero section has bold display heading
- VISL-02: Primary CTA is dark rounded button

**Success Criteria:**
1. User sees hero text on left and lighthouse illustration on right on desktop widths
2. User sees hero content stacked (text above, illustration below) on mobile widths
3. User sees an organic wave shape separating hero from content below
4. User sees a dark rounded button as the primary CTA that stands out clearly

---

### Phase 30: Header/Footer

**Goal:** Header and footer match the cleaner, more minimal aesthetic of the redesigned homepage.

**Dependencies:** Phase 29 (hero establishes visual baseline for new aesthetic)

**Requirements:**
- HEAD-01: Header has minimal, clean design
- HEAD-02: Footer style updated to match new aesthetic

**Success Criteria:**
1. User sees a cleaner header with reduced visual weight (simpler background, less clutter)
2. User sees footer styling that complements the white/black/yellow palette
3. Navigation remains fully functional (dropdowns work, mobile hamburger works)

---

### Phase 31: Polish

**Goal:** Interactive elements feel responsive and content appears smoothly as user scrolls.

**Dependencies:** Phase 30 (all visual elements in place before polish)

**Requirements:**
- VISL-03: Interactive elements have CSS hover effects
- VISL-04: Content sections fade in on scroll
- QUAL-02: Design tested on mobile devices

**Success Criteria:**
1. User sees visual feedback (scale, shadow, or color change) when hovering over buttons and cards
2. User sees content sections fade in as they scroll down the page
3. User can navigate the full homepage on a mobile device without horizontal scrolling or touch target issues

---

## Coverage Validation

| Requirement | Phase | Description |
|-------------|-------|-------------|
| LAYT-01 | 29 | Split hero layout |
| LAYT-02 | 29 | Wave divider |
| TYPO-01 | 29 | Bold display heading |
| TYPO-02 | 28 | Fluid typography |
| TYPO-03 | 28 | Playfair Display font |
| VISL-01 | 28 | Color palette |
| VISL-02 | 29 | Dark rounded CTA |
| VISL-03 | 31 | Hover effects |
| VISL-04 | 31 | Scroll fade-ins |
| HEAD-01 | 30 | Minimal header |
| HEAD-02 | 30 | Updated footer |
| QUAL-01 | 28 | Visual regression baseline |
| QUAL-02 | 31 | Mobile testing |

**Mapped:** 13/13 requirements
**Orphaned:** 0

---

## v2.0 Multilingual + Tests (Paused)

> **Status:** Phase 20 complete (all 209 pages translated). Remaining phases (21-27) moved to v3.0.
>
> See: `.planning/milestones/v2.0-ROADMAP.md` for full history.

| Phase | Name | Status |
|-------|------|--------|
| 20 | Batch Translation Pipeline | Complete |
| 21-27 | Human Review, Tests, Integration | Deferred to v3.0 |

---

## Previous Milestones

### v1.10 UI Polish (Shipped 2026-02-01)
> Sticky breadcrumb, document notes from Notion, test card titles

### v1.9 SEO Foundations (Shipped 2026-01-31)
> robots.txt, sitemap.xml, automated generation

### v1.7 Database Content (Shipped 2026-01-30)
> 67 permit pages from Notion, Q&A template, variant structure

### v1.6 Document Deduplication (Shipped 2026-01-28)
> CTA buttons linking permits to documents

### v1.5 Footer + Collabora (Shipped 2026-01-28)
> Yellow footer, Collabora dropdown

### v1.4 Error + Dropdowns (Shipped 2026-01-27)
> Error reporting button, dropdown navigation

### v1.2 Visual Refresh (Shipped 2026-01-26)
> Warm color palette, PNG lighthouse logo, white header

### v1.1 Documenti Questura (Shipped 2026-01-25)
> 63 document pages, interactive checklists, Notion integration

---

## Progress

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1-3 | v1.1 | Complete | 2026-01-25 |
| 4-9 | v1.2 | Complete | 2026-01-26 |
| 10-11 | v1.4 | Complete | 2026-01-27 |
| 12-14 | v1.5 | Complete | 2026-01-28 |
| 15 | v1.6 | Complete | 2026-01-28 |
| 16-17 | v1.7 | Complete | 2026-01-30 |
| 18 | v1.9 | Complete | 2026-01-31 |
| 20 | v2.0 | Complete | 2026-02-02 |
| 28 | v2.1 | Pending | — |
| 29 | v2.1 | Pending | — |
| 30 | v2.1 | Pending | — |
| 31 | v2.1 | Pending | — |

---

*Last updated: 2026-02-02 — v2.1 roadmap created*
