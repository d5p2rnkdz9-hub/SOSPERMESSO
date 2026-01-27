# SOS Permesso

## What This Is

A multilingual information website helping immigrants in Italy understand residence permits (permessi di soggiorno). The site presents complex bureaucratic information in a friendly, accessible format with a bright design, cartoon mascot, and Typeform-integrated tests. Now includes a comprehensive document requirements system powered by Notion for content management.

## Current Milestone: v1.5 Footer + Collabora Navigation

**Goal:** Redesign footer with yellow background and add Collabora dropdown replacing Il progetto in header.

**Target features:**
- Yellow footer with centered "Chi Siamo" and "Il Progetto" links
- Replace "Il progetto" header item with "Collabora" dropdown (trigger only, not clickable)
- Collabora dropdown: "Segnala un errore" + "Dai una mano" (Typeform links)
- Remove broken contact URL, standardize to new Typeform URLs
- Propagate changes to all pages

**Typeform URLs:**
- Contacts/Dai una mano: https://form.typeform.com/to/USx16QN3
- Error reporting: https://form.typeform.com/to/FsqvzdXI

---

## Backlog: v1.6 Document Deduplication

**Goal:** Remove duplicate document information between permit detail pages and documenti-questura database pages.

**Target features:**
- Remove/replace "Che documenti porto in Questura" sections from permit pages
- Link permit pages directly to corresponding documenti-questura pages
- Single source of truth for document requirements (Notion-powered pages)

---

## Backlog: v1.7 Desktop Header Alignment

**Goal:** Fix desktop header alignment - language switcher appears slightly below menu items.

**Issue:** Menu items and language switcher (IT 🇮🇹) are not on the same horizontal baseline. Needs CSS investigation.

---

## Shipped: v1.4 Error Reporting + Dropdown Navigation (2026-01-27)

**Delivered:** User error reporting and dropdown navigation.

- "Segnala errore" button on 86 content pages with Typeform integration
- Dropdown menus for Database, Guide, Test navigation items
- Desktop hover dropdowns with smooth animations
- Mobile flat list navigation (no nested dropdowns)
- Full ARIA accessibility support

## Shipped: v1.3 Header & Navigation Fix (2026-01-26)

**Delivered:** Mobile header/navigation fixes.

- Hamburger menu working (CSS responds to navWrapper.active)
- White block removed (fixed transform override)
- Header sticks to top when scrolling
- Desktop alignment deferred to v1.6

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
- ✓ Error reporting button on all content pages — v1.4
- ✓ Typeform integration for error submissions — v1.4
- ✓ Dropdown navigation menus (Database, Guide, Test) — v1.4
- ✓ Desktop hover dropdowns, mobile flat list — v1.4

### Active

<!-- Current scope. Building toward these. -->

- [ ] Yellow footer background with centered layout
- [ ] Footer contains "Chi Siamo" and "Il Progetto" links only (+ copyright)
- [ ] Replace "Il progetto" header nav item with "Collabora" dropdown
- [ ] Collabora dropdown: "Segnala un errore" → Typeform error form
- [ ] Collabora dropdown: "Dai una mano" → Typeform contact form
- [ ] Remove broken sospermesso.typeform.com/contatti URL from codebase
- [ ] Propagate new header/footer to all pages

### Out of Scope

- Backend API integration — static site approach, Typeform handles form submissions
- Real-time permit status tracking — external service, just link to portale immigrazione
- User accounts/authentication — information site, no personalization needed
- Additional languages (EN, FR, ES, ZH) — infrastructure exists but content not priority

## Context

**Current state (after v1.4):**
- Pure HTML/CSS/JavaScript static site with Node.js build process for document generation
- CSS design system with variables in `src/styles/main.css`
- 192+ HTML pages in `src/pages/` (39 original + 63 generated + 38 redirects + others)
- Build infrastructure: package.json, @notionhq/client, dotenv, netlify.toml
- Notion database powers document page content
- Warm teal/coral color palette (replaced purple scheme in v1.2)
- Clean white header with 60px height, centered navigation with dropdown menus
- Lighthouse PNG logo (ChatGPT-generated)
- Error reporting button on all content pages (Typeform integration)
- Dropdown navigation: Database, Guide, Test menus with hover (desktop) / flat list (mobile)

**Design patterns established:**
- Database list style (`.permit-list`, `.category-section`)
- Color-coded categories: teal (familiari), orange (protezione), warm colors throughout
- Badge component with gradient styling
- Document page template with checklist, callout, print styles
- Homepage sections: Tests → Database → Guide → Aiuto legale → Link utili
- Prominent CTA cards: centered, max-width 500px, larger icon/title
- Header: white background (#FFFFFF), dark teal menu text (#1A6B5F), yellow hover
- Dropdown navigation: CSS :hover + :focus-within triggers, mobile flat list override
- Error button: teal outline style, absolute (desktop) / static (mobile) positioning

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
| Teal outline button for error reporting | Subtle, non-intrusive design matching header nav | ✓ Good — v1.4 |
| Absolute/static positioning for error button | Desktop top-right, mobile centered below breadcrumb | ✓ Good — v1.4 |
| Pure CSS for dropdown visibility | Progressive enhancement, works without JS | ✓ Good — v1.4 |
| Mobile flat list navigation | 40% faster task completion per NN/G research | ✓ Good — v1.4 |

---
*Last updated: 2026-01-27 after v1.4 milestone shipped*
