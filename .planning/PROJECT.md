# SOS Permesso

## What This Is

A multilingual information website helping immigrants in Italy understand residence permits (permessi di soggiorno). The site presents complex bureaucratic information in a friendly, accessible format with a bright design, cartoon mascot, and Typeform-integrated tests. Now includes a comprehensive document requirements system powered by Notion for content management.

## Current State

**Latest milestone:** v1.2 Visual Refresh (shipped 2026-01-26)
**Current milestone:** v1.3 Header & Navigation Fix

## Current Milestone: v1.3 Header & Navigation Fix

**Goal:** Fix header layout issues - language switcher causes misalignment on desktop and interferes with mobile menu.

**Target features:**
- Fix language dropdown (currently opens as huge block, should be compact)
- Proper header alignment on desktop (logo, menu, language in line)
- Mobile: language switcher integrated properly, not overlapping content
- Hamburger menu works correctly on mobile

## Backlog: v1.4 Document Deduplication

**Goal:** Remove duplicate document information between permit detail pages and documenti-questura database pages.

**Target features:**
- Remove/replace "Che documenti porto in Questura" sections from permit pages
- Link permit pages directly to corresponding documenti-questura pages
- Single source of truth for document requirements (Notion-powered pages)

## Core Value

Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ Home page with hero section, tests, and guides — existing
- ✓ Database page listing 23 permit types in 4 color-coded categories — existing
- ✓ 7 permit detail pages with standardized template — existing
- ✓ Responsive mobile-first design with CSS variable system — existing
- ✓ Contact form modal integrated with Typeform — existing
- ✓ Navigation with mobile hamburger menu — existing
- ✓ Language switcher infrastructure (IT functional) — existing
- ✓ Kit postale page — existing
- ✓ Chi siamo page — existing
- ✓ Documenti-questura page restructured with category sections — v1.1
- ✓ Permit rows display inline badges [Primo] [Rinnovo] — v1.1
- ✓ 63 document detail pages from Notion + 38 redirect pages — v1.1
- ✓ All 23 permits from database.html represented — v1.1
- ✓ Interactive checklists with localStorage persistence — v1.1
- ✓ Print-friendly document pages — v1.1
- ✓ Notion API integration for content management — v1.1
- ✓ Warm color palette (teal accents, no purple in main UI) — v1.2
- ✓ Simple lighthouse logo (PNG) in header — v1.2
- ✓ Homepage sections: Database, Guide, Aiuto legale — v1.2
- ✓ Clean white header with centered navigation — v1.2
- ✓ Mobile-optimized compact layouts — v1.2

### Active

<!-- Current scope. Building toward these. -->

- [ ] Fix language dropdown to be compact, not full-width block
- [ ] Desktop: header alignment (logo | menu | language) in single row
- [ ] Mobile: language switcher in header, not overlapping hero
- [ ] Mobile: hamburger menu opens/closes correctly

### Out of Scope

- Backend API integration — static site approach, Typeform handles form submissions
- Real-time permit status tracking — external service, just link to portale immigrazione
- User accounts/authentication — information site, no personalization needed
- Additional languages (EN, FR, ES, ZH) — infrastructure exists but content not priority

## Context

**Current state (after v1.2):**
- Pure HTML/CSS/JavaScript static site with Node.js build process for document generation
- CSS design system with variables in `src/styles/main.css`
- 192+ HTML pages in `src/pages/` (39 original + 63 generated + 38 redirects + others)
- Build infrastructure: package.json, @notionhq/client, dotenv, netlify.toml
- Notion database powers document page content
- Warm teal/coral color palette (replaced purple scheme in v1.2)
- Clean white header with 60px height, centered navigation
- Lighthouse PNG logo (ChatGPT-generated)

**Design patterns established:**
- Database list style (`.permit-list`, `.category-section`)
- Color-coded categories: teal (familiari), orange (protezione), warm colors throughout
- Badge component with gradient styling
- Document page template with checklist, callout, print styles
- Homepage sections: Tests → Database → Guide → Aiuto legale → Link utili
- Prominent CTA cards: centered, max-width 500px, larger icon/title
- Header: white background (#FFFFFF), dark teal menu text (#1A6B5F), yellow hover

**Technical debt:**
- Dizionario links need revision (partial matching works but coverage incomplete)

## Constraints

- **Tech stack**: Pure HTML/CSS/JS frontend + Node.js build for document generation
- **Design**: Must match existing design system (colors, typography, spacing from CSS variables)
- **Structure**: Pages go in `src/pages/`, follow existing header/footer template
- **Mobile**: All pages must work on mobile (existing responsive CSS applies)
- **Content**: Document pages generated from Notion — edit content there, run build

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Badges layout for primo/rinnovo | User preference for compact, scannable design | ✓ Good — blue/orange gradients work well |
| Separate pages per document type | User requirement — dedicated first release and renewal pages | ✓ Good — 63 canonical pages |
| Match database.html structure | Consistency across site | ✓ Good — familiar UX |
| Node.js build with Notion API | Dynamic content management | ✓ Good — easy updates |
| Slug mapping via JSON | Centralized URL aliasing | ✓ Good — 38 redirects work |
| Meta refresh redirects | SEO-friendly, no JS required | ✓ Good — instant redirects |
| Partial dizionario matching | Better term linking coverage | ⚠️ Revisit — coverage incomplete |
| PNG logo over SVG | ChatGPT-generated PNG looked better than hand-drawn SVG | ✓ Good — friendly, recognizable |
| White header background | Cleaner, more professional than teal gradient | ✓ Good — reduces visual clutter |
| Separate databases from guides | Clearer content hierarchy on homepage | ✓ Good — improved navigation |
| Standalone Aiuto legale section | High visibility for critical legal help service | ✓ Good — prominent CTA |
| Display flex on header | Fixes CSS height inheritance for reliable centering | ✓ Good — solved alignment issues |

---
*Last updated: 2026-01-26 after v1.3 milestone started*
