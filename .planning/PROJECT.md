# SOS Permesso

## What This Is

A multilingual information website helping immigrants in Italy understand residence permits (permessi di soggiorno). The site presents complex bureaucratic information in a friendly, accessible format with a bright design, cartoon mascot, and Typeform-integrated tests. Features a comprehensive document requirements system and permit page generation powered by Notion for content management.

## Current State

**Last Shipped:** v1.9 SEO Foundations (2026-01-31)

**What was delivered (v1.9):**
- robots.txt allowing all search engines to crawl
- sitemap.xml with 174 indexable pages (35 redirects auto-excluded)
- Automated sitemap generation script with redirect detection
- `npm run build:sitemap` command for regeneration

**What was delivered (v1.7):**
- Permit page generation system from Notion database (67 pages)
- Standard Q&A template with 7+ sections
- Blue triangle bullet styling for visual consistency
- Variant detection with parent/child page structure
- Manifest-based incremental builds
- Simplified mobile hamburger menu (categories only)

## Core Value

Users can quickly find accurate, understandable information about their specific permit type and what documents they need for the Questura.

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ Home page with hero section, tests, and guides — existing
- ✓ Database page listing 23 permit types in 4 color-coded categories — existing
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
- ✓ Yellow footer with centered layout — v1.5
- ✓ Collabora dropdown with error/contact forms — v1.5
- ✓ CTA buttons linking permit pages to document pages — v1.6
- ✓ Permit page generation from Notion Q&A content — v1.7
- ✓ Standard Q&A template (7 sections + extras) — v1.7
- ✓ 67 permit pages (56 content + 18 placeholder + 4 variant) — v1.7
- ✓ Blue triangle bullet styling for list consistency — v1.7
- ✓ Variant parent/child structure for multi-type permits — v1.7
- ✓ Manifest-based incremental builds — v1.7
- ✓ robots.txt file allowing search engine crawling — v1.9
- ✓ XML sitemap listing all pages with lastmod dates — v1.9
- ✓ Build script to auto-generate sitemap from file system — v1.9

### Active

<!-- Current scope. Building toward these. -->

**Current Milestone: v2.0 Multilingual + Tests**

**Goal:** English-speaking users can access the full site with quality translations, and all users get a proprietary test system replacing Typeform.

**Target features:**
- [ ] Translator review interface for volunteer corrections
- [ ] Batch translation pipeline (208 pages IT → EN)
- [ ] Human review workflow with volunteer translators
- [ ] Language switching integration (IT ↔ EN)
- [ ] Proprietary test system replacing 3 Typeform tests (IT + EN)

**Task Tracking:** [Notion "CHI FA COSA"](https://www.notion.so/2cd7355e7f7f80538130e9c246190699) — source of truth for all tasks

### Out of Scope

- Backend API integration — static site approach
- Real-time permit status tracking — external service, just link to portale immigrazione
- User accounts/authentication — information site, no personalization needed
- Additional languages (FR, ES, ZH) — pipeline built for EN, reuse later
- Legal review for translations — volunteer review sufficient

## Context

**Current state (after v1.9):**
- Pure HTML/CSS/JavaScript static site with Node.js build process for document and permit generation
- CSS design system with variables in `src/styles/main.css`
- 260+ HTML pages in `src/pages/` (original + 63 document + 67 permit + redirects)
- Build infrastructure: package.json, @notionhq/client, dotenv, netlify.toml
- Notion database powers both document and permit page content
- Build scripts: `scripts/build-documents.js`, `scripts/build-permits.js`, `scripts/build-sitemap.js`
- SEO infrastructure: robots.txt + sitemap.xml (174 pages, auto-regeneration)
- Warm teal/coral color palette with blue triangle bullets
- Clean white header with 60px height, centered navigation with dropdown menus
- Yellow footer with centered layout
- Mobile-optimized: simplified hamburger menu (categories only, no dropdowns)

**Design patterns established:**
- Database list style (`.permit-list`, `.category-section`)
- Color-coded categories: teal (familiari), orange (protezione), warm colors throughout
- Badge component with gradient styling
- Document page template with checklist, callout, print styles
- Permit page template with Q&A cards, semantic border colors
- Variant structure with parent/child pages in subfolders
- Homepage sections: Tests → Database → Guide → Aiuto legale → Link utili
- Mobile flat list navigation for faster task completion

**Technical debt:**
- Dizionario links need revision (partial matching works but coverage incomplete)
- Desktop header alignment (language switcher baseline)
- No npm script for build-permits.js (manual execution)
- 18 permits still need Notion content (placeholder pages)

## Constraints

- **Tech stack**: Pure HTML/CSS/JS frontend + Node.js build for document/permit generation
- **Design**: Must match existing design system (colors, typography, spacing from CSS variables)
- **Structure**: Pages go in `src/pages/`, follow existing header/footer template
- **Mobile**: All pages must work on mobile (existing responsive CSS applies)
- **Content**: Document and permit pages generated from Notion — edit content there, run build

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
| Pure CSS for dropdown visibility | Progressive enhancement, works without JS | ✓ Good — v1.4 |
| Mobile flat list navigation | 40% faster task completion per NN/G research | ✓ Good — v1.4 |
| Q&A parsing for 3 Notion formats | Notion content uses heading_3, bold paragraph, inline bold | ✓ Good — v1.7 |
| Blue triangle bullets | Yellow not visible on white backgrounds | ✓ Good — v1.7 |
| Manifest-based incremental builds | Skip unchanged pages, 3-5x faster | ✓ Good — v1.7 |
| Variant parent/child structure | Users need common info + specific differences | ✓ Good — v1.7 |
| Mobile hamburger shows categories only | Simpler navigation, faster task completion | ✓ Good — v1.7 |
| Exclude redirect pages from sitemap | Prevents duplicate content issues | ✓ Good — v1.9 |
| File modification time for lastmod | Simple, accurate, automatic updates | ✓ Good — v1.9 |
| /en/ subfolder for English | Simpler than subdomain, same domain | — Pending |
| Volunteer translators | Community-driven review process | — Pending |
| No legal review for translations | AI + human review sufficient | — Pending |
| Replace Typeform with proprietary tests | Full control, multilingual, no external dependency | — Pending |

---
*Last updated: 2026-01-31 after v2.0 milestone started*
