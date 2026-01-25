# Roadmap: SOS Permesso v1.2 Visual Refresh

**Created:** 2026-01-25
**Milestone:** v1.2 Visual Refresh
**Phases:** 4-6 (continuing from v1.1)

## Overview

| Phase | Name | Goal | Requirements | Status |
|-------|------|------|--------------|--------|
| 4 | Color Palette | Replace purple with warm teal-based palette | TEXT-01, COLOR-01-04 | Pending |
| 5 | Logo Redesign | Simple lighthouse icon + text replacing complex image | LOGO-01-04 | Pending |
| 6 | Homepage Structure | Reorganize sections for better content hierarchy | STRUCT-01-04, MOBILE-01-02 | Pending |

**Total:** 3 phases | 14 requirements | 0% complete

---

## Phase 4: Color Palette

**Goal:** Replace purple color scheme with warm, welcoming teal-based palette while maintaining visual clarity.

**Requirements:**
- TEXT-01: Hero displays "Facile" instead of "Amichevole"
- COLOR-01: Header uses teal gradient instead of purple
- COLOR-02: Section backgrounds use warm palette (no purple)
- COLOR-03: CSS variables updated for consistent warm palette
- COLOR-04: Accent colors coordinated (coral, teal, warm orange)

**Success Criteria:**
1. Header gradient is teal (#26A69A based)
2. No purple (#6b46c1, #8b5cf6, #AB47BC) appears anywhere on site
3. Section backgrounds use warm gradients (yellow/cream, teal/mint, coral/peach)
4. CSS variables in main.css reflect new palette
5. All pages maintain visual consistency with new colors

**Key Files:**
- `src/styles/main.css` — CSS variables
- `src/styles/components.css` — Header styles
- `index.html` — Hero text, section backgrounds
- `src/pages/index.html` — Hero text

**Dependencies:** None

---

## Phase 5: Logo Redesign

**Goal:** Replace complex AI-generated logo with simple, clean lighthouse icon + text that coordinates with teal header.

**Requirements:**
- LOGO-01: Header displays simple lighthouse icon + "SOS Permesso" text
- LOGO-02: Lighthouse icon retains red/white stripe colors
- LOGO-03: Icon blends visually with teal header gradient
- LOGO-04: Logo scales properly and stays compact on mobile

**Success Criteria:**
1. Logo is SVG-based (not PNG) for crisp rendering
2. Lighthouse has red/white stripes
3. Text "SOS Permesso" visible next to icon
4. Logo looks good against teal header (not clashing)
5. Mobile logo is compact (icon only or smaller text)

**Key Files:**
- `IMAGES/` — New logo assets
- `src/styles/components.css` — Logo styles
- `src/styles/mobile.css` — Mobile logo styles
- `index.html`, `src/pages/*.html` — Logo markup

**Dependencies:** Phase 4 (need final header color)

---

## Phase 6: Homepage Structure

**Goal:** Reorganize homepage sections to separate databases from guides and highlight Aiuto legale.

**Requirements:**
- STRUCT-01: "I nostri database" section contains Database permessi + Documenti Questura
- STRUCT-02: "Le nostre guide" section contains Protezione, Ricongiungimento, Dizionario
- STRUCT-03: "Aiuto legale" section links prominently to existing page
- STRUCT-04: Section order: Tests → Database → Guide → Aiuto legale → Link utili
- MOBILE-01: Database section displays compactly on mobile
- MOBILE-02: All sections maintain good spacing and readability on small screens

**Success Criteria:**
1. "I NOSTRI DATABASE" section exists with 2 cards (Database permessi, Documenti Questura)
2. "LE NOSTRE GUIDE" section has 3 cards (Protezione, Ricongiungimento, Dizionario)
3. "AIUTO LEGALE" section is visually prominent with link to aiuto-legale.html
4. Section order matches requirement STRUCT-04
5. Mobile view is compact, especially database section
6. All links work correctly

**Key Files:**
- `index.html` — Main homepage structure
- `src/pages/index.html` — Source homepage
- `src/styles/components.css` — Section styles
- `src/styles/mobile.css` — Mobile responsiveness

**Dependencies:** Phase 4 (section colors), Phase 5 (consistent header)

---

## Requirement Coverage

| Requirement | Description | Phase |
|-------------|-------------|-------|
| TEXT-01 | Hero "Facile" text | 4 |
| COLOR-01 | Teal header gradient | 4 |
| COLOR-02 | Warm section backgrounds | 4 |
| COLOR-03 | CSS variables updated | 4 |
| COLOR-04 | Coordinated accent colors | 4 |
| LOGO-01 | Simple icon + text logo | 5 |
| LOGO-02 | Red/white lighthouse stripes | 5 |
| LOGO-03 | Icon blends with teal header | 5 |
| LOGO-04 | Mobile-compact logo | 5 |
| STRUCT-01 | Database section content | 6 |
| STRUCT-02 | Guide section content | 6 |
| STRUCT-03 | Aiuto legale section | 6 |
| STRUCT-04 | Section order | 6 |
| MOBILE-01 | Compact mobile database | 6 |
| MOBILE-02 | Mobile spacing/readability | 6 |

**Coverage:** 14/14 requirements mapped (100%)

---

*Roadmap created: 2026-01-25*
