# SOS Permesso

## What This Is

A multilingual information website helping immigrants in Italy understand residence permits (permessi di soggiorno). The site presents complex bureaucratic information in a friendly, accessible format with a bright design, cartoon mascot, and Typeform-integrated tests.

## Core Value

Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## Requirements

### Validated

<!-- Shipped and confirmed valuable — existing site capabilities. -->

- ✓ Home page with hero section, tests, and guides — existing
- ✓ Database page listing 23 permit types in 4 color-coded categories — existing
- ✓ 7 permit detail pages with standardized template (Cos'è, Durata, Requisiti, Documenti, Aspetti pratici) — existing
- ✓ Responsive mobile-first design with CSS variable system — existing
- ✓ Contact form modal integrated with Typeform — existing
- ✓ Navigation with mobile hamburger menu — existing
- ✓ Language switcher infrastructure (IT functional) — existing
- ✓ Kit postale page — existing
- ✓ Chi siamo page — existing
- ✓ Documenti questura page (basic card layout) — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Documenti-questura page restructured to match database.html layout (category sections, compact list)
- [ ] Permit rows display inline badges: `[icon] Permit Name [Primo] [Rinnovo]`
- [ ] 46 document detail pages created (23 permits × primo rilascio + rinnovo)
- [ ] All 23 permits from database.html represented in documenti-questura

### Out of Scope

- Backend API integration — static site approach, Typeform handles form submissions
- Real-time permit status tracking — external service, just link to portale immigrazione
- User accounts/authentication — information site, no personalization needed
- Additional languages (EN, FR, ES, ZH) — infrastructure exists but content not priority for this milestone

## Context

**Existing architecture:**
- Pure HTML/CSS/JavaScript static site (no build process, no npm)
- CSS design system with variables in `src/styles/main.css`
- Established page templates: database list style (`.permit-list`, `.category-section`) and permit detail style
- 39+ HTML pages already exist in `src/pages/`
- Typeform integration for tests and contact form

**Design patterns to follow:**
- Database.html uses compact Notion-like list with `.permit-link` items
- Color-coded categories: purple (studio/lavoro), orange (protezione), blue (cure mediche), teal (familiari)
- Badge styling should match existing button/link patterns

**File naming convention:**
- Permit pages: `permesso-{tipo}.html`
- Document pages should follow: `documenti-{tipo}-primo.html`, `documenti-{tipo}-rinnovo.html`

## Constraints

- **Tech stack**: Pure HTML/CSS/JS — no build tools, no frameworks, no npm
- **Design**: Must match existing design system (colors, typography, spacing from CSS variables)
- **Structure**: Pages go in `src/pages/`, follow existing header/footer template
- **Mobile**: All pages must work on mobile (existing responsive CSS applies)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Badges layout for primo/rinnovo | User preference for compact, scannable design | — Pending |
| Separate pages per document type | User requirement — each permit gets dedicated first release and renewal pages | — Pending |
| Match database.html structure | Consistency across site, users familiar with layout | — Pending |

---
*Last updated: 2026-01-25 after initialization*
