# Project Milestones: SOS Permesso

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
