# SOS Permesso

## What This Is

A multilingual information website helping immigrants in Italy understand residence permits (permessi di soggiorno). The site presents complex bureaucratic information in a friendly, accessible format with a bright design, cartoon mascot, and Typeform-integrated tests. Features a comprehensive document requirements system and permit page generation powered by Notion for content management.

## Current State

**Last Shipped:** v2.2 Phase 32 Translation Workflow (2026-02-04)

**What was delivered (v2.2 Phase 32):**
- MD5 content hashing for accurate change detection in build-permits.js
- Translation memory module (scripts/translation-memory.js) for caching translations
- Multilingual sitemap index (sitemap-index.xml) pointing to per-language sitemaps
- Per-language sitemaps with hreflang tags (sitemap-it.xml, sitemap-en.xml, 171 URLs each)
- robots.txt updated to point to sitemap-index.xml
- npm run tm:stats script for translation memory statistics

**What was delivered (v2.0):**
- Translated all 209 pages (208 content + homepage) from Italian to English
- Claude Code subagents for batch translation (8 batches, 4 parallel agents)
- Translation glossary (35+ terms) applied consistently
- CSS/JS paths fixed in all EN pages via automated script
- Language switcher UI functional for IT ↔ EN toggle
- All EN pages have `lang="en"` attribute

**What was delivered (v1.10):**
- Sticky breadcrumb bar that stays visible below header on scroll
- Fixed 150+ pages with correct breadcrumb HTML structure
- Document notes from Notion displayed as Q&A cards on PSLP pages
- parseDocNotes function for extracting Q&A content from Notion
- Test card titles updated ("Posso CONVERTIRE/RINNOVARE il mio permesso?")
- Card titles prevent word-breaking (whole words only wrap)
- Footer pages (chi-siamo, policy, etc.) left-aligned on mobile

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
- ✓ Sticky breadcrumb bar visible on scroll — v1.10
- ✓ Document notes from Notion as Q&A cards — v1.10
- ✓ Mobile footer pages left-aligned text — v1.10
- ✓ All 209 pages translated IT → EN with glossary — v2.0
- ✓ Language switcher UI (IT ↔ EN toggle) — v2.0
- ✓ EN pages in /en/ subfolder with correct CSS/JS paths — v2.0
- ✓ Content hashing for incremental builds (hash Notion blocks before HTML) — v2.2
- ✓ Translation memory infrastructure (JSON-based, git-versioned) — v2.2
- ✓ Sitemap index architecture with per-language sitemaps — v2.2
- ✓ hreflang tags in sitemaps linking IT ↔ EN equivalents — v2.2

### Active

<!-- Current scope. Building toward these. -->

**Current Milestone: v3.0 11ty Migration**

**Goal:** Migrate from pure HTML to 11ty SSG for maintainable architecture. Extract shared components, keep same content and URLs.

**Target features:**
- [ ] 11ty v3.x with Liquid templates
- [ ] Passthrough copy for CSS/JS/images
- [ ] Base layout with header/footer/nav as includes
- [ ] Language switcher as include
- [ ] All 469 pages converted to use layouts
- [ ] URL preservation (no broken links)
- [ ] Netlify deployment configured

**Scope:** Structural migration only. Same content, same URLs, maintainable architecture.

**Not included (v3.1):**
- Page-specific templates (permit, document, guide)
- Notion integration rewrite (keep existing scripts)
- Navigation as data files
- i18n plugin integration

**Task Tracking:** [Notion "CHI FA COSA"](https://www.notion.so/2cd7355e7f7f80538130e9c246190699) — source of truth for all tasks

### Out of Scope

- Backend API integration — static site approach
- Real-time permit status tracking — external service, just link to portale immigrazione
- User accounts/authentication — information site, no personalization needed
- Legal review for translations — volunteer review sufficient
- Professional translation services — AI + volunteer review sufficient

## Context

**Current state (after v2.0):**
- Pure HTML/CSS/JavaScript static site with Node.js build process for document and permit generation
- CSS design system with variables in `src/styles/main.css`
- 260+ HTML pages in `src/pages/` (IT) + 209 pages in `/en/src/pages/` (EN)
- Build infrastructure: package.json, @notionhq/client, dotenv, netlify.toml
- Notion database powers both document and permit page content
- Build scripts: `scripts/build-documents.js`, `scripts/build-permits.js`, `scripts/build-sitemap.js`
- SEO infrastructure: robots.txt + sitemap-index.xml + sitemap-it.xml + sitemap-en.xml (171 URLs each with hreflang)
- Translation glossary: `scripts/translation-glossary.json` (35+ terms)
- Language switcher in header: IT ↔ EN functional, FR/ES/ZH show "coming soon"
- Warm teal/coral color palette with blue triangle bullets
- Clean white header with 60px height, centered navigation with dropdown menus
- Yellow footer with centered layout
- Mobile-optimized: simplified hamburger menu (categories only, no dropdowns)

**Translation infrastructure (v2.2 Phase 32):**
- Content hashing for change detection (MD5 of Notion blocks)
- Translation memory module (scripts/translation-memory.js)
- Manifest tracks contentHash per page for incremental builds
- Multilingual sitemaps with hreflang tags (sitemap-it.xml, sitemap-en.xml)
- robots.txt points to sitemap-index.xml
- Batch translation via Claude Code subagents (manual process)
- Hardcoded `/en/` path detection in app.js

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
| /en/ subfolder for English | Simpler than subdomain, same domain | ✓ Good — v2.0 |
| Volunteer translators | Community-driven review process | — Pending |
| No legal review for translations | AI + human review sufficient | — Pending |
| Replace Typeform with proprietary tests | Full control, multilingual, no external dependency | — Pending |
| Modern SaaS homepage aesthetic | Visual refresh, more professional feel | — Pending |
| Playfair Display + Inter fonts | Serif display for hero, sans for body | — Pending |
| Homepage-first, propagate later | Test design on homepage before full rollout | — Pending |
| Page-level content hashing | Hash Notion blocks before HTML for change detection | ✓ Good — v2.2 |
| hreflang in sitemaps, not HTML | Scales better for 8-12 languages | ✓ Good — v2.2 |
| Sitemap index architecture | One master sitemap pointing to per-language sitemaps | ✓ Good — v2.2 |
| Translation memory by content hash | Reuse translations for unchanged paragraphs | ✓ Good — v2.2 |
| RTL CSS with logical properties | Preparation for Arabic, Hebrew support | — Pending (v2.2) |
| 11ty migration (structural) | Eliminate duplicated headers/footers in 469 files | — Pending (v3.0) |
| Liquid over Nunjucks | Nunjucks unmaintained since June 2022 | — Pending (v3.0) |
| Incremental migration | Convert pages gradually, not big-bang | — Pending (v3.0) |

---
*Last updated: 2026-02-04 — v3.0 11ty Migration milestone started*
