# SOS Permesso

## What This Is

A multilingual information website helping immigrants in Italy understand residence permits (permessi di soggiorno). The site presents complex bureaucratic information in a friendly, accessible format with a bright design, cartoon mascot, and Typeform-integrated tests. Features a comprehensive document requirements system and permit page generation powered by Notion for content management. Built on 11ty SSG with shared layouts for maintainable architecture.

## Current State

**Last Shipped:** v3.0 11ty Migration (2026-02-05)

**What was delivered (v3.0):**
- 11ty v3.1.2 with Liquid templates for static site generation
- Shared component architecture: header, footer, nav, language-switcher as reusable includes
- Base layout template with canonical URLs and hreflang tags for SEO
- 411 pages migrated (206 IT + 205 EN) to use shared layouts
- ~36,000 lines of duplicated HTML eliminated
- Combined Notion + 11ty build pipeline (`npm run build`)
- Netlify deployment configured with Node 22 LTS
- Build time: 13.5s (down from manual header/footer management)

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
- ✓ 11ty v3.x with Liquid templates — v3.0
- ✓ Passthrough copy for CSS/JS/images — v3.0
- ✓ Base layout with header/footer/nav as includes — v3.0
- ✓ Language switcher as include — v3.0
- ✓ All 469 pages converted to use layouts — v3.0
- ✓ URL preservation (no broken links) — v3.0
- ✓ Netlify deployment configured — v3.0
- ✓ Canonical and hreflang tags in base layout for SEO — v3.0

### Active

<!-- Current scope. Building toward these. -->

## Current Milestone: v3.1 Prassi Locali + Notion-11ty Completion

**Goal:** Build collaborative "prassi locali" infrastructure for crowdsourced questura notes on document pages, then complete Notion-11ty integration and content cleanup.

**Task Tracking:** [Notion "CHI FA COSA"](https://www.notion.so/2cd7355e7f7f80538130e9c246190699) — source of truth for all tasks

### Phases (in order)

| Phase | Name | Type | Status |
|-------|------|------|--------|
| 39 | Document pages → 11ty | Technical | DONE |
| 40 | **Prassi locali MVP** | New feature | Next up |
| 41 | Permit pages → 11ty | Technical | Pending |
| 42 | Old build script cleanup | Cleanup | Pending |
| 43 | Populate blank permit pages | Content (17 permits in Notion) | Pending |
| 44 | Costi section on document pages | Content/template | Pending |
| 45 | Content validation pass | Review | Pending |
| 46 | Dizionario link revision | Technical debt | Pending |

### Phase 40: Prassi Locali MVP

Crowdsourced local questura practices on document pages.

**Architecture:**
- Static core: approved notes baked into pages at build time
- Thin dynamic layer: Netlify Functions for form submission + upvoting
- Notion DB as content store (submissions table, moderation queue)
- "Prassi locali" section on document pages, filterable by city

**MVP scope:**
- Inline submission form on document pages → Netlify Function → Notion DB
- Manual moderation (approve in Notion, rebuild to publish)
- "Prassi locali" section with city filter (client-side JS)
- Upvote/downvote (anonymous, localStorage + IP rate limiting)

**Phase 2 (future):**
- Pre-approved user auth for submitting (Netlify Identity or access codes)
- User management in Notion/Supabase

### Next Milestone: v3.2 Translation Batch

**Prerequisite:** All permit content populated and validated (Phases 43-45 complete)

**Scope:**
- Batch translation of all new/changed content (IT → EN + other languages)
- Uses existing translation memory infrastructure (v2.2)
- Leverages 11ty build pipeline for consistent output

### Out of Scope

- Real-time permit status tracking — external service, just link to portale immigrazione
- Professional translation services — AI + volunteer review sufficient
- Full user accounts system — prassi locali uses lightweight auth for approved contributors only

## Context

**Current state (after v3.0):**
- 11ty v3.1.2 SSG with Liquid templates
- Shared layouts in `_includes/layouts/base.liquid`
- Component includes: header, footer, nav, language-switcher
- Data files: `_data/site.js`, `_data/nav.js`, `_data/footer.js`
- 411 HTML pages with front matter (206 IT + 205 EN)
- Build output to `_site/` directory
- CSS design system with variables in `src/styles/main.css`
- Notion database powers document and permit page content
- Build scripts: `scripts/build-documents.js`, `scripts/build-permits.js`, `scripts/build-sitemap.js`
- Combined build: `npm run build` chains Notion + 11ty
- SEO: canonical URLs, hreflang tags, sitemap index architecture
- Netlify deployment with Node 22 LTS, security headers

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
- No npm script for build-permits.js (manual execution)
- 17 permits still need Notion content (see `.planning/TODO-permits.md`)
- Old build scripts (build-documents.js, templates/primo.js, templates/rinnovo.js) can be removed after Phase 41

## Constraints

- **Tech stack**: 11ty v3.x SSG + Node.js build for Notion content generation
- **Design**: Must match existing design system (colors, typography, spacing from CSS variables)
- **Structure**: Pages use shared layouts via front matter, content in `src/pages/`
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
| Page-level content hashing | Hash Notion blocks before HTML for change detection | ✓ Good — v2.2 |
| hreflang in sitemaps, not HTML | Scales better for 8-12 languages | ✓ Good — v2.2 |
| Sitemap index architecture | One master sitemap pointing to per-language sitemaps | ✓ Good — v2.2 |
| Translation memory by content hash | Reuse translations for unchanged paragraphs | ✓ Good — v2.2 |
| 11ty migration (structural) | Eliminate duplicated headers/footers in 469 files | ✓ Good — v3.0 |
| Liquid over Nunjucks | Nunjucks unmaintained since June 2022 | ✓ Good — v3.0 |
| Front matter for page metadata | Standard 11ty pattern, clean separation | ✓ Good — v3.0 |
| Keep existing Notion scripts | Don't rewrite working integration | ✓ Good — v3.0 |
| Canonical + hreflang in base layout | SEO best practice, single source | ✓ Good — v3.0 |
| Volunteer translators | Community-driven review process | — Pending |
| No legal review for translations | AI + human review sufficient | — Pending |
| Replace Typeform with proprietary tests | Full control, multilingual, no external dependency | — Pending |

---
*Last updated: 2026-02-07 — v3.1 milestone replanned with prassi locali*
