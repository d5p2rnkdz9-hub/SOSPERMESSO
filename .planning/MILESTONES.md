# Project Milestones: SOS Permesso

## v3.2 EN Translation Pipeline (Shipped: 2026-02-18)

**Delivered:** Connected English pages to the same 11ty/Notion pipeline as Italian. Added Notion response caching for incremental builds, translation script with Claude API, and EN page generation from Notion.

**Phases completed:** 47-50

**Key accomplishments:**

- Notion API response caching with `last_edited_time` tracking (87% build speedup: ~72s → ~11s)
- Translation script (`npm run translate`) using Claude API with 35+ term glossary
- Section-level hashing prevents re-translating unchanged content
- EN permit pages (39) + document pages (39 primo, 39 rinnovo) generated from Notion via 11ty
- EN static pages re-translated and old frozen files removed
- All EN pages at `/en/` prefix with correct asset paths and hreflang tags

**Stats:**

- 4 phases, ~7 plans
- Shipped: 2026-02-18

**What's next:** v4.0 FR Translation — same pipeline for French

---

## v3.0 11ty Migration (Shipped: 2026-02-05)

**Delivered:** Migrated 411 pages from pure HTML to 11ty SSG with shared layouts, eliminating ~36,000 lines of duplicated header/footer HTML.

**Phases completed:** 35-38 (8 plans total)

**Key accomplishments:**

- 11ty v3.1.2 installed with Liquid templates and passthrough copy
- Shared components extracted: header, footer, nav, language-switcher as reusable includes
- 411 pages migrated (206 IT + 205 EN) to use shared layouts
- ~36,000 lines of duplicate HTML eliminated — headers/footers now single source of truth
- Combined Notion + 11ty build pipeline (`npm run build`)
- Canonical URLs and hreflang tags added to base layout for SEO
- Build time: 13.5s (well under 60s target)

**Stats:**

- 445 files modified
- 8,425 lines added, 44,338 lines deleted (-35,913 net)
- 4 phases, 8 plans
- 1 day from start to ship

**Git range:** `e50ed50` → `bcbdc0f`

**What's next:** v3.1 — Page-specific templates, i18n plugin integration, new language translations

---

## v2.2 Language Infrastructure (Shipped: 2026-02-04)

**Delivered:** Scalable translation workflow with Notion-based change detection, translation memory, and RTL/CJK CSS infrastructure.

**Phases completed:** 32-34.1 (4 phases)

**Key accomplishments:**

- MD5 content hashing for accurate Notion change detection
- Translation memory module for caching translations
- Multilingual sitemap index with hreflang tags
- RTL CSS infrastructure for Arabic/Hebrew support
- CJK CSS infrastructure for Chinese typography

---

## v2.0 Multilingual Foundation (Shipped: 2026-02-02)

**Delivered:** Complete Italian-to-English translation of all 209 pages with working language switcher.

**Phases completed:** 20 (3 plans total)

**Key accomplishments:**

- Translated all 209 pages (208 content + homepage) from Italian to English
- Used Claude Code subagents for batch translation (8 batches, 4 parallel agents)
- Applied translation glossary (35+ terms) consistently across all pages
- Fixed CSS/JS paths in all EN pages via automated script
- Language switcher UI functional for IT ↔ EN toggle
- All EN pages have `lang="en"` attribute

**Stats:**

- 209 files created in `/en/` directory
- 174 files with CSS/JS path fixes
- 1 phase, 3 plans
- Translation + path fix completed in 2 days

**Git range:** `033f7a0` → current

**Deferred:**
- Human review of translations (volunteer workflow) → v3.0
- hreflang tags and EN sitemap → v2.2 Localization Infrastructure
- Proprietary test system (quiz.js replacing Typeform) → v3.0

**What's next:** v2.1 Homepage CSS Redesign, then v2.2 Localization Infrastructure

---

## v1.9 SEO Foundations (Shipped: 2026-01-31)

**Delivered:** Search engine discovery infrastructure with robots.txt allowing all crawlers and sitemap.xml listing 174 indexable pages.

**Phases completed:** 18 (1 plan total)

**Key accomplishments:**

- Created robots.txt allowing all search engines to crawl entire site
- Generated sitemap.xml with 174 pages, automatically excluding 35 redirect pages
- Built automated sitemap generation script with meta refresh detection
- Added `npm run build:sitemap` command for easy regeneration

**Stats:**

- 4 files created/modified
- 870 lines of code
- 1 phase, 1 plan, 3 tasks
- 7 commits from milestone start to ship
- 1 day (2026-01-31)

**Git range:** `950874f` → `354e0c1`

**What's next:** TBD — run `/gsd:new-milestone` to define next goals

---

## v1.7 Database Content Reviewed (Shipped: 2026-01-30)

**Delivered:** Permit page generation system from Notion database with standardized Q&A template, visual consistency, and variant page structure.

**Phases completed:** 16-17 (5 plans total)

**Key accomplishments:**

- Built permit page generation system fetching content from Notion database
- Created Q&A parsing for 3 Notion formats (heading_3, bold paragraph, inline bold)
- Generated 67 permit pages (56 with content, 18 placeholders, 4 variants)
- Added blue triangle bullet styling for visual consistency
- Implemented manifest-based incremental builds for efficiency
- Created variant detection and parent/child page structure for permits with multiple acquisition types

**Stats:**

- 75+ files created/modified
- +8,500 / -300 lines of code
- 2 phases, 5 plans
- 30 commits from milestone start to ship
- 2 days (2026-01-28 → 2026-01-30)

**Git range:** `efd5de7` → `e623e48`

**What's next:** v1.8 Homepage Cleanup + Content Validation

---

## v1.6 Document Deduplication (Shipped: 2026-01-28)

**Delivered:** CTA buttons on all 21 permit pages linking to dedicated document pages, removing inline document duplication.

**Phases completed:** 15 (2 plans total)

**Key accomplishments:**

- Added two CTA buttons to all 21 permit pages (primo rilascio + rinnovo)
- Removed ~150 lines of inline document sections across all permit pages
- Created Python automation for bulk HTML processing (reusable pattern)
- Established single source of truth for document requirements
- Mobile-responsive button layout with primary/secondary visual hierarchy

**Stats:**

- 34 files changed
- +2,486 / -635 lines of code
- 1 phase, 2 plans
- 12 commits from milestone start to ship
- 1 day (2026-01-28)

**Git range:** `6408407` → `f47b6c2`

**What's next:** v1.7 Permit Page Redesign + Homepage Cleanup

---

## v1.5 Footer + Collabora Navigation (Shipped: 2026-01-28)

**Delivered:** Yellow footer redesign with centered layout, and Collabora dropdown replacing "Il progetto" navigation item.

**Phases completed:** 12-14 (4 plans total)

**Key accomplishments:**

- Redesigned footer with yellow background (#FFD700), centered layout
- Footer simplified to copyright + "Il Progetto" link only
- Added "Collabora" dropdown with 4 items: Segnala un errore, Posso convertire, Dai una mano, Il progetto
- Propagated header and footer changes to all 98 pages
- Fixed broken Typeform URL (sospermesso.typeform.com → form.typeform.com)
- Removed unused images and consolidated BACKLOG.md

**Stats:**

- 147 files changed
- +5,724 / -61,081 lines of code (includes image cleanup)
- 3 phases, 4 plans
- 36 commits from milestone start to ship
- 2 days (2026-01-27 → 2026-01-28)

**Git range:** `8a3a3a0` → `e65ab63`

**What's next:** v1.6 Document Deduplication

---

## v1.4 Error Reporting + Dropdown Navigation (Shipped: 2026-01-27)

**Delivered:** User error reporting via Typeform integration and dropdown navigation menus with desktop hover and mobile flat list behavior.

**Phases completed:** 10-11 (3 plans total)

**Key accomplishments:**

- Added "Segnala errore" button to 86 content pages with Typeform redirect
- Page URL passed as parameter for error context tracking
- Implemented dropdown navigation for Database, Guide, Test menus
- Desktop: smooth hover dropdowns with 250ms animation
- Mobile: flat list navigation (40% faster per NN/G research)
- Full ARIA accessibility support (aria-expanded, role="menu", role="menuitem")

**Stats:**

- 155 files modified
- +9,678 / -1,089 lines of code
- 2 phases, 3 plans
- 22 commits from milestone start to ship
- 1 day (2026-01-26 → 2026-01-27)

**Git range:** `98fb97e` → `8a3a3a0`

**What's next:** v1.5 Document Deduplication or v1.6 Desktop Header Alignment

---

## v1.2 Visual Refresh (Shipped: 2026-01-26)

**Delivered:** Modern visual design with warm teal color palette, clean white header, new lighthouse logo, and reorganized homepage structure.

**Phases completed:** 4-9 (7 plans total)

**Key accomplishments:**

- Replaced purple color scheme with warm teal/coral/mint palette across all pages
- Created new lighthouse logo (ChatGPT-generated PNG) propagated to 97+ pages
- Reorganized homepage into distinct sections (Database, Guide, Aiuto legale)
- Redesigned header with white background, larger menu (1.375rem), proper centering
- Synced dual homepages and fixed all navigation paths
- Resolved all tech debt (corrupted pages, missing CSS includes)

**Stats:**

- 131 files created/modified
- +4,635 / -524 lines of code
- 6 phases, 7 plans
- 31 commits from milestone start to ship
- 2 days (2026-01-25 → 2026-01-26)

**Git range:** `51e3f84` → `7581038`

**What's next:** TBD — run `/gsd:new-milestone` to define next goals

---

## v1.1 Documenti Questura (Shipped: 2026-01-25)

**Delivered:** Comprehensive document requirements system for all permit types with Notion-powered content management.

**Phases completed:** 1-3 (4 plans total)

**Key accomplishments:**

- Restructured documenti-questura page with 4 color-coded category sections and 46 clickable badge links
- Built Node.js build pipeline with Notion API integration for content management
- Generated 63 document pages with interactive checklists, localStorage persistence, and print styles
- Created 38 redirect pages achieving 100% URL coverage (no 404s)
- Added dizionario term linking, common renewal document, and disputed permit warnings

**Stats:**

- 134 files created/modified
- +20,264 lines of code
- 3 phases, 4 plans
- 35 commits from roadmap to ship

**Git range:** `fde8d73` → `26ebc6e`

**Technical debt:**
- Dizionario links need revision (partial matching works but coverage incomplete)

**What's next:** TBD — run `/gsd:new-milestone` to define next goals

---
