# SOS Permesso

## What This Is

A multilingual information website helping immigrants in Italy understand residence permits (permessi di soggiorno). The site presents complex bureaucratic information in a friendly, accessible format with a bright design, cartoon mascot, and Typeform-integrated tests. Now includes a comprehensive document requirements system powered by Notion for content management.

## Current Milestone: v1.2 Visual Refresh

**Goal:** Modernize the visual appearance with a warm, welcoming color palette and improved homepage structure.

**Target features:**
- Teal-based header replacing purple
- Simple lighthouse icon + text logo
- Homepage sections: Database, Guide, Aiuto legale
- Mobile-optimized compact layouts

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

### Active

<!-- Current scope. Building toward these. -->

**v1.2 Visual Refresh:**
- [ ] Warm color palette (teal header, no purple)
- [ ] Simple lighthouse icon + text logo in header
- [ ] Homepage restructured: Database section, Guide section, Aiuto legale section
- [ ] Mobile-optimized compact layouts

### Out of Scope

- Backend API integration — static site approach, Typeform handles form submissions
- Real-time permit status tracking — external service, just link to portale immigrazione
- User accounts/authentication — information site, no personalization needed
- Additional languages (EN, FR, ES, ZH) — infrastructure exists but content not priority

## Context

**Current state (after v1.1):**
- Pure HTML/CSS/JavaScript static site with Node.js build process for document generation
- CSS design system with variables in `src/styles/main.css`
- 192 HTML pages in `src/pages/` (39 original + 63 generated + 38 redirects + others)
- Build infrastructure: package.json, @notionhq/client, dotenv, netlify.toml
- Notion database powers document page content

**Design patterns established:**
- Database list style (`.permit-list`, `.category-section`)
- Color-coded categories: purple (studio/lavoro), orange (protezione), blue (cure mediche), teal (familiari)
- Badge component with gradient styling
- Document page template with checklist, callout, print styles

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

---
*Last updated: 2026-01-25 after v1.2 milestone start*
