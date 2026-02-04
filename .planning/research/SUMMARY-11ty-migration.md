# Project Research Summary

**Project:** SOS Permesso - 11ty Migration
**Domain:** Static Site Generator Migration (HTML → Eleventy)
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

This migration transforms a 469-page static HTML site (260+ IT pages, 209 EN pages) into an 11ty-templated site while preserving all existing URLs, content, and functionality. The primary goal is to eliminate duplicated headers/footers across hundreds of files by extracting them into reusable layouts. This is a classic SSG migration pattern with well-established best practices.

The recommended approach is **incremental adoption**: install 11ty alongside existing build scripts, extract shared components first, then gradually convert HTML pages to templates in batches. Use Liquid (not Nunjucks) as the template language for long-term maintenance. The existing Notion integration, CSS design system, and JavaScript functionality remain completely unchanged—11ty wraps the HTML, it doesn't replace it.

The critical risk is **URL structure changes** breaking SEO and user bookmarks. This is prevented by explicitly configuring permalinks to preserve `.html` extensions. Secondary risks include passthrough copy misconfiguration (breaking CSS/images) and multilingual URL conflicts (IT/EN pages overwriting each other). All three are preventable with proper configuration in Phase 1.

## Key Findings

### Recommended Stack

**Add 11ty as a build tool on top of existing foundation.** The current HTML/CSS/JS architecture, Notion API integration, and translation memory system all remain unchanged. 11ty provides template composition (extracting headers/footers into layouts) while preserving existing workflows.

**Core technologies:**
- **@11ty/eleventy 3.1.2**: SSG for template composition — latest stable release (June 2025), zero client-side JS, supports plain HTML
- **Liquid template engine**: Layout/include templating — actively maintained (Shopify backing), simpler than Nunjucks, less overhead than WebC
- **@11ty/eleventy-fetch 5.0+**: Cache Notion API responses — prevents rate limiting during dev, enables offline development with cached data
- **Node.js 18+**: Runtime (already required) — no version upgrade needed

**Critical version note:** Use 11ty v3.1.2 (current stable). Avoid v4.0 (currently in alpha).

**What NOT to add:** Nunjucks (maintenance concerns, no releases since June 2022), WebC (overkill for header/footer extraction), PostCSS/Sass (CSS works as-is), bundlers (vanilla JS sufficient), frameworks (static site needs).

### Expected Features

**Must have (table stakes):**
- **Preserve all existing URLs** — SEO and user bookmarks depend on this; use front matter `permalink` to hardcode existing paths
- **Layout extraction** — Core 11ty feature eliminates 400+ duplicate headers/footers; base layout + nested layouts for permits/documents
- **Passthrough copy for assets** — CSS/JS/images must reach output without processing; configure for `src/styles/`, `src/scripts/`, images
- **Per-language directory structure** — Existing `/en/` subfolder architecture; 11ty natively supports via Data Cascade
- **Notion integration preservation** — Build scripts generate pages; convert to 11ty JavaScript Data Files pattern
- **Development server** — Built-in `eleventy --serve` with hot reload replaces manual refresh

**Should have (competitive):**
- **Incremental builds** — Only rebuild changed pages (11ty 3.0 has built-in support); full build ~10-30s, incremental ~1-2s
- **Data cascade for i18n** — Automatic language metadata per directory; create `en/en.json`, `it/it.json`
- **Collections for permits** — Query/filter permits by category; replace manual page lists
- **Shortcodes for repeated UI** — CTAs, alert boxes, badges become reusable
- **Environment-based config** — Different settings for dev/production

**Defer (v2+):**
- **WebC components** — Modern but experimental; Liquid includes sufficient for MVP
- **Image optimization** — Use existing images as-is; eleventy-img plugin adds 5+ min build time
- **Markdown adoption** — All content already HTML; no conversion needed
- **Search functionality** — Can add later with Pagefind
- **Automated translations** — Translation memory works; don't touch

### Architecture Approach

Eleventy integrates with existing architecture by wrapping HTML in layouts while keeping CSS, JavaScript, and Notion builds unchanged. The migration path: (1) Extract header/footer into `_includes/`, (2) Create base layout with `{{ content }}` placeholder, (3) Convert HTML pages to use layout via front matter, (4) Move Notion fetching from standalone scripts to `_data/` JavaScript files for caching and build integration. This preserves the existing directory structure (`src/pages/`, `en/src/pages/`) and outputs to standard `_site/` directory.

**Major components:**
1. **Layouts system** (`_includes/layouts/`) — Base layout with header/footer, specialized layouts for permits/documents; eliminates duplication across 469 pages
2. **Global data files** (`_data/`) — Fetch Notion permits/documents at build time with caching; replaces `scripts/build-permits.js` and `scripts/build-documents.js`
3. **Passthrough copy** — CSS/JS/images copied without processing; maintains exact file paths for existing pages
4. **Permalink configuration** — Preserves `.html` extensions and existing URL structure; prevents SEO breaks
5. **Multilingual structure** — IT pages output to `/`, EN pages to `/en/`; uses directory data files for language metadata

**Key pattern:** Data cascade replaces manual scripting. Notion content becomes available as global data (`permits`, `documents`) in all templates. Pagination creates one page per permit automatically.

### Critical Pitfalls

1. **Passthrough copy configuration missing** — CSS/images don't appear in `_site/` output, site loads with no styling. Prevention: Explicitly configure `addPassthroughCopy()` for `src/styles/`, `src/scripts/`, images in Phase 1.

2. **URL structure breaks after migration** — Existing URLs like `permesso-lavoro.html` become `/permesso-lavoro/` (directory), breaking all links and SEO. Prevention: Use computed data to preserve exact filenames: `permalink: (data) => data.page.inputPath.split('/').pop()`.

3. **Multilingual URL duplication** — IT and EN pages both generate to same URL path, last one wins, losing one language. Prevention: Separate output directories (`_site/` vs `_site/en/`) or computed permalinks with language prefix.

4. **Template language choice regret** — Choosing Nunjucks (unmaintained since June 2022) requires rewrite to Liquid later. Prevention: Use Liquid from day one; actively maintained by Shopify, simpler syntax.

5. **Relative path catastrophe** — CSS paths work on root pages but break in subdirectories. Prevention: Use `{{ '/src/styles/main.css' | url }}` filter for ALL asset paths in layouts.

## Implications for Roadmap

Based on research, suggested phase structure follows incremental adoption pattern:

### Phase 1: Foundation & URL Preservation
**Rationale:** Must establish build infrastructure and confirm URL preservation before converting any content. URL breaks are unrecoverable SEO damage.
**Delivers:** Working 11ty build, passthrough copy for all assets, permalink configuration tested
**Addresses:** Preserve all existing URLs (table stakes), passthrough copy for assets (table stakes), development server (table stakes)
**Avoids:** Passthrough copy missing (pitfall #1), URL structure breaks (pitfall #2), template choice regret (pitfall #4)
**Key validation:** Build succeeds, CSS/images appear in `_site/`, 5 test pages have identical URLs to current site

### Phase 2: Extract Shared Components
**Rationale:** Header/footer extraction is core 11ty value—creates immediate maintainability wins. Once layouts exist, page conversion is straightforward.
**Delivers:** Base layout with header/footer as includes, 5-10 test pages using layouts
**Addresses:** Layout extraction (table stakes), language switcher component (table stakes), breadcrumb component (table stakes)
**Uses:** Liquid template engine, `url` filter for asset paths
**Implements:** Layouts system component (architecture)
**Avoids:** Relative path catastrophe (pitfall #5)
**Key validation:** Test pages render identically to originals, CSS/JS work at all URL depths

### Phase 3: Notion Integration with Caching
**Rationale:** Moving Notion fetches to `_data/` enables caching (eliminates 50+ API calls per build) and makes data available globally in templates.
**Delivers:** Notion permits/documents fetched via global data files with eleventy-fetch caching
**Addresses:** Notion integration preservation (table stakes), incremental builds (differentiator)
**Uses:** @11ty/eleventy-fetch, existing Notion client wrapper
**Implements:** Global data files component (architecture)
**Avoids:** Notion API rate limits during builds
**Key validation:** Generated pages identical to current build scripts, build time reduced via caching

### Phase 4: Multilingual Structure
**Rationale:** Must configure IT/EN separation before bulk conversion to prevent URL conflicts.
**Delivers:** Directory data files for languages, permalink configuration per language, language switcher updated
**Addresses:** Per-language directory structure (table stakes)
**Implements:** Multilingual structure component (architecture)
**Avoids:** Multilingual URL duplication (pitfall #3)
**Key validation:** IT pages output to `/`, EN pages to `/en/`, language switcher toggles correctly

### Phase 5: Bulk Page Conversion
**Rationale:** With infrastructure validated, batch convert remaining 400+ pages. Safe because patterns proven in Phases 2-4.
**Delivers:** All 260+ IT pages converted, all 209 EN pages converted
**Addresses:** Full site migration complete
**Key validation:** All 469 URLs preserved, full build succeeds, visual regression testing passes

### Phase 6: Production Deployment
**Rationale:** Final validation on Netlify (Linux, case-sensitive) before cutting over.
**Delivers:** Site live on Netlify with new build pipeline
**Addresses:** Netlify deployment configuration
**Avoids:** Case sensitivity breaks (Netlify uses Linux)
**Key validation:** Preview deploy succeeds, all URLs accessible, monitoring shows no 404 spikes

### Phase Ordering Rationale

- **Foundation first (Phase 1):** URL preservation is non-negotiable; must validate before converting any content
- **Components before content (Phase 2):** Layouts must exist before pages can use them; test pattern on small batch
- **Caching before bulk (Phase 3):** Notion integration must work before generating hundreds of pages
- **Language structure before bulk (Phase 4):** IT/EN separation must be configured to prevent overwrites
- **Bulk conversion late (Phase 5):** Only after all infrastructure validated; low risk at this point
- **Deployment last (Phase 6):** Linux case-sensitivity and environment variables must be tested

This ordering avoids big-bang rewrites (pitfall from research), allows validation at each step, and ensures URL preservation throughout.

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Foundation setup is well-documented in official 11ty docs
- **Phase 2:** Layout extraction is core 11ty use case with extensive tutorials
- **Phase 5:** Bulk conversion uses same pattern as Phase 2 test pages
- **Phase 6:** Netlify + 11ty deployment is standard, official guides exist

**Phases likely needing deeper research:**
- **Phase 3:** Notion API integration patterns with eleventy-fetch may need experimentation for optimal caching
- **Phase 4:** Multilingual URL generation has multiple approaches; may need testing to find best fit for `/en/` structure

All other phases follow established 11ty migration patterns verified in official documentation and community examples.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | 11ty v3.1.2 verified via official releases, Liquid maintenance confirmed via Shopify backing, template comparison from community consensus |
| Features | HIGH | Table stakes verified via official 11ty migration docs, URL preservation is documented pattern, passthrough copy is core feature |
| Architecture | HIGH | Layouts, data cascade, passthrough copy all official 11ty features with extensive documentation and migration examples |
| Pitfalls | MEDIUM-HIGH | Pitfalls 1-3 verified in official "Common Pitfalls" docs, pitfall 4 from community consensus, pitfall 5 in url filter docs |

**Overall confidence:** HIGH

Research findings verified against official Eleventy documentation (v3.1.2 release notes, configuration API, migration guides) and cross-referenced with multiple community migration case studies. Template language comparison (Liquid vs Nunjucks) based on release cadence verification (Nunjucks last release June 2022) and community blog posts. Multilingual patterns confirmed in official i18n plugin documentation.

### Gaps to Address

- **Exact permalink configuration for SOS Permesso paths:** Research shows general pattern for preserving URLs, but exact implementation for `src/pages/permesso-*.html` → `_site/src/pages/permesso-*.html` needs Phase 1 testing to confirm computed data approach works
- **Notion API caching TTL:** Research recommends 1-hour cache for development, but optimal production TTL (1 day? 1 week?) depends on Notion update frequency—needs decision during Phase 3
- **Language switcher URL generation:** Current switcher uses JavaScript path detection; may need refactor to use 11ty's `locale_url` filter or keep existing approach—validate during Phase 4
- **Incremental build interaction with Notion data files:** Documentation unclear on whether data file changes trigger full rebuild or only incremental—needs Phase 3 testing

All gaps are tactical implementation details, not strategic unknowns. Can be resolved during phase planning with targeted testing.

## Sources

### Primary (HIGH confidence)
- [Eleventy Official Docs](https://www.11ty.dev/docs/) — Configuration, layouts, data cascade, permalinks
- [Eleventy v3.1.2 Release](https://github.com/11ty/eleventy/releases) — Version verification, feature availability
- [Passthrough File Copy](https://www.11ty.dev/docs/copy/) — Static asset handling patterns
- [Eleventy Permalinks](https://www.11ty.dev/docs/permalinks/) — URL preservation configuration
- [JavaScript Data Files](https://www.11ty.dev/docs/data-js/) — External data integration
- [Eleventy Fetch Plugin](https://www.11ty.dev/docs/plugins/fetch/) — API caching documentation
- [Eleventy i18n](https://www.11ty.dev/docs/i18n/) — Multilingual approaches
- [Common Pitfalls](https://www.11ty.dev/docs/pitfalls/) — Official pitfall documentation
- [Netlify 11ty Deploy](https://docs.netlify.com/build/frameworks/framework-setup-guides/eleventy/) — Netlify configuration

### Secondary (MEDIUM confidence)
- [Notion + 11ty Integration](https://samdking.co.uk/blog/bringing-your-notion-database-to-life-with-eleventy/) — Real-world Notion data pattern
- [Nunjucks Maintenance Concerns](https://www.brycewray.com/posts/2023/03/time-move-on-nunjucks/) — Template language maintenance status
- [Internationalization with Eleventy 2.0](https://www.lenesaile.com/en/blog/internationalization-with-eleventy-20-and-netlify/) — Multilingual architecture patterns
- [Converting HTML to Eleventy](https://cassey.dev/converting-an-html-file-to-eleventy/) — Migration workflow
- [I Finally Understand Eleventy's Data Cascade](https://benmyers.dev/blog/eleventy-data-cascade/) — Data priority explanation
- [11ty Tips I Wish I Knew](https://davidea.st/articles/11ty-tips-i-wish-i-knew-from-the-start/) — Community best practices

### Tertiary (LOW confidence)
- GitHub issues on Netlify case-sensitivity failures — Anecdotal but consistent pattern
- Community discussions on template language choice — Multiple sources converge on Liquid over Nunjucks

---
*Research completed: 2026-02-04*
*Ready for roadmap: yes*
