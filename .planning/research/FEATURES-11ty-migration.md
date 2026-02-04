# Feature Landscape: HTML to 11ty Migration

**Domain:** Static site generator migration (HTML → Eleventy)
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

HTML-to-11ty migrations are fundamentally about **component extraction** and **template architecture** while preserving existing URLs and content. The migration transforms duplicated HTML (260+ IT pages, 209 EN pages with copied headers/footers) into a template system with layouts, includes, and data-driven generation.

Expected behavior for this type of migration:
- **Incremental adoption** - migrate templates gradually, not all at once
- **Zero URL changes** - use permalink configuration to maintain existing paths
- **Component extraction** - header/footer/nav become reusable layouts
- **Existing file preservation** - HTML files continue to work during migration
- **Data cascade leverage** - Notion content generation integrates naturally via JavaScript data files

## Table Stakes

Features users (and the migration) expect. Missing = migration is incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Preserve all existing URLs** | SEO and user bookmarks | Low | Use front matter `permalink` to hardcode existing paths |
| **Layout extraction** | Core 11ty feature, eliminates 400+ duplicate headers/footers | Medium | Base layout + nested layouts (permit, document templates) |
| **Passthrough copy for assets** | CSS/JS/images must reach output without processing | Low | `addPassthroughCopy()` for `src/styles/`, `images/`, `scripts/` |
| **Per-language directory structure** | Existing `/en/` subfolder architecture | Low | 11ty natively supports `/en/`, `/it/` directories with Data Cascade |
| **HTML as template language** | Existing .html files must continue working | Low | 11ty processes HTML files as Liquid templates by default |
| **Notion integration preservation** | Build scripts (`build-permits.js`, `build-documents.js`) generate pages | Medium | Convert to 11ty JavaScript Data Files pattern |
| **Language switcher component** | Current header includes language dropdown | Medium | Extract to include/layout, preserve JavaScript functionality |
| **Mobile hamburger menu** | Current navigation pattern | Low | Extract to component, keep existing JS behavior |
| **Breadcrumb component** | Sticky breadcrumbs on content pages | Low | Extract to include with data-driven path generation |
| **Development server** | Hot reload during development | Low | Built-in `eleventy --serve` replaces manual refresh |

## Differentiators

Features that would improve the migration but aren't strictly required.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **WebC components** | Modern component architecture with slots, scoped CSS/JS | Medium | Alternative to Liquid includes, better DX for components |
| **CSS/JS bundling** | Consolidate assets, reduce HTTP requests | Medium | Use 11ty plugins or WebC bundler mode |
| **Incremental builds** | Only rebuild changed pages (like current manifest system) | Low | 11ty 3.0 has built-in incremental builds |
| **Data cascade for i18n** | Automatic language metadata per directory | Low | Create `en/en.json`, `it/it.json` for directory-level data |
| **Collections for permits** | Query/filter permits by category, type | Medium | Replace manual page lists with 11ty collections |
| **Shortcodes for repeated UI** | CTAs, alert boxes, badges | Medium | Convert repeated HTML patterns to reusable shortcodes |
| **Image optimization** | Responsive images, modern formats | High | 11ty Image plugin (defer to post-migration) |
| **Sitemap generation in 11ty** | Replace standalone build script | Low | Use 11ty plugin or template-based generation |
| **Environment-based config** | Different settings for dev/production | Low | Standard 11ty pattern with environment variables |
| **Custom Markdown-it config** | For future Markdown content authoring | Low | 11ty allows full Markdown-it customization |

## Anti-Features

Features to explicitly NOT build during migration. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Rewrite all HTML to different template language** | Massive scope creep, high risk | Keep HTML files as-is, only extract shared components. Gradual adoption. |
| **Consolidate all layouts into one** | Loses template variety, harder to maintain | Create base layout + specific layouts (permit, document, footer-page) |
| **Process HTML files as-is without Liquid preprocessing** | Breaks existing `{{ }}` syntax if any | Use default (HTML processed as Liquid) unless conflicts arise |
| **Same input/output directory** | Causes duplicate permalink errors on second build | Keep default `_site/` output separate from source |
| **Include `html` in `--formats` with same input/output** | 11ty tries to process output files as source | Use passthrough copy or keep directories separate |
| **Custom build script replacing 11ty CLI** | Loses 11ty optimizations, incremental builds | Use 11ty CLI with config, call Notion scripts via beforeBuild hook |
| **Hardcoded asset paths in templates** | Breaks when directory structure changes | Use 11ty filters for URL generation (`url` filter) |
| **Language detection via JavaScript** | SSG should generate per-language HTML | Keep existing `/en/` directory structure, generate static HTML |
| **Over-engineer component system** | WebC, Svelte, Vue add complexity for marginal gain | Start with Liquid includes, upgrade later if needed |
| **Migrate everything at once** | High-risk big-bang deployment | Incremental: layouts first, then pages in batches |

## Feature Dependencies

```
Migration phases (dependency order):

1. Foundation Setup
   - 11ty installation + config
   - Passthrough copy (CSS, JS, images)
   - Development server

2. Layout Extraction (blocks everything else)
   - Base layout (header, footer)
   - Language switcher component
   - Navigation component
   ↓
3a. Permit Page Template
   - Q&A section layout
   - Badge components
   - Breadcrumb component
   ↓
3b. Document Page Template
   - Checklist component
   - Callout component
   - Print styles

4. Content Generation Integration
   - JavaScript Data Files for Notion
   - Collection configuration
   - Build hooks for pre-generation
   ↓
5. Multilingual Structure
   - Directory data files (en.json, it.json)
   - Permalink configuration per language
   - Language switcher logic
   ↓
6. Production Optimization
   - Sitemap generation
   - robots.txt
   - Meta tags
   - Environment config
```

## MVP Recommendation

For migration MVP, prioritize in this order:

### Phase 1: Foundation (Week 1)
1. **11ty setup** - Install, configure input/output directories
2. **Passthrough copy** - CSS, JS, images
3. **Base layout** - Extract header/footer to `_includes/layouts/base.njk`
4. **Single page migration** - Convert `chi-siamo.html` as proof-of-concept
5. **Development server** - Verify hot reload works

**Success criteria:** One page renders identically via 11ty

### Phase 2: Core Templates (Week 2)
1. **Component extraction** - Language switcher, navigation, breadcrumb
2. **Permit page template** - `_includes/layouts/permit.njk`
3. **Document page template** - `_includes/layouts/document.njk`
4. **Migrate 5 pages** - 2 permits, 2 documents, 1 footer page as validation

**Success criteria:** Multiple page types render correctly with shared layouts

### Phase 3: Content Generation (Week 3)
1. **JavaScript Data Files** - Convert Notion scripts to 11ty pattern
2. **Collections** - Configure permit/document collections
3. **beforeBuild hook** - Run Notion fetch before 11ty build
4. **Full page migration** - Convert remaining 400+ pages

**Success criteria:** All pages generated and rendering via 11ty

### Phase 4: Multilingual (Week 4)
1. **Directory data** - `en/en.json`, `it/it.json` for language metadata
2. **Permalink preservation** - Verify all existing URLs maintained
3. **Language switcher URLs** - Update switcher to use 11ty-generated paths
4. **Sitemap generation** - Integrate sitemap into 11ty build

**Success criteria:** IT and EN sites fully functional, all URLs preserved

## Defer to Post-Migration

Features to explicitly defer until after successful migration:

### Content Authoring Improvements
- **Markdown adoption** - Keep existing HTML workflow initially
- **Inline content editing** - Notion is source of truth for now
- **Git-based content** - Notion integration works, don't change it

### Performance Optimizations
- **Image optimization** - Use existing images as-is
- **Asset bundling** - CSS/JS work fine unbundled
- **Critical CSS inlining** - Not needed for initial migration

### Advanced Features
- **WebC components** - Liquid includes sufficient for MVP
- **Client-side hydration** - Static site, no SPA needed
- **Search functionality** - Can add later with Pagefind or similar
- **Analytics integration** - Can add to layout post-migration

### Build Pipeline Enhancements
- **Automated translations** - Translation memory works, don't touch
- **Content staging** - Production deployment sufficient for now
- **Preview deployments** - Netlify handles this automatically

## Migration Validation Checklist

Before declaring migration complete:

### Functionality
- [ ] All 260+ IT pages render identically to current HTML
- [ ] All 209 EN pages render identically to current HTML
- [ ] Language switcher toggles between IT/EN correctly
- [ ] Mobile hamburger menu works
- [ ] Sticky breadcrumbs appear on scroll
- [ ] Interactive checklists persist in localStorage
- [ ] Print-friendly document pages work
- [ ] All Typeform integrations work

### Content Integrity
- [ ] All Notion-generated content appears correctly
- [ ] Permit Q&A sections render properly
- [ ] Document requirement lists complete
- [ ] Badges display correctly ([Primo], [Rinnovo])
- [ ] Alert boxes styled correctly
- [ ] Images load from correct paths

### URLs & SEO
- [ ] All existing URLs redirect to same content
- [ ] Sitemap.xml includes all pages
- [ ] robots.txt configured correctly
- [ ] hreflang tags present for IT/EN
- [ ] Meta tags preserved from original

### Performance
- [ ] Build time acceptable (<5 minutes for full build)
- [ ] Development server hot reload works
- [ ] Page load speed equivalent to current site
- [ ] Mobile performance maintained

### Developer Experience
- [ ] Notion content generation integrated smoothly
- [ ] CSS changes apply site-wide
- [ ] Adding new pages straightforward
- [ ] Documentation updated for new workflow

## Common Migration Pitfalls (Eleventy-Specific)

Based on official documentation and community experience:

### Input/Output Directory Conflicts
**Problem:** Using same directory causes "Duplicate Permalink" errors on second build
**Solution:** Keep default `_site/` output, ignore it in git

### Permalink Format Errors
**Problem:** Files download instead of display in browser
**Solution:** Ensure permalinks end with `/` or `.html` extension

### Collection Sort Order
**Problem:** Using `Array.reverse()` on collections breaks ordering
**Solution:** Use 11ty's collection sort options, don't mutate arrays

### Liquid Include Path Syntax
**Problem:** Jekyll-style quoted includes don't work in 11ty Liquid
**Solution:** Use 11ty Liquid syntax (check docs for differences)

### Notion Script Integration Timing
**Problem:** Notion fetch runs after 11ty build starts
**Solution:** Use `beforeBuild` event in config to run Notion scripts first

### Language-Specific Data
**Problem:** Hardcoding language metadata in every file
**Solution:** Use directory data files (`en/en.json`) for automatic cascade

### Asset Path Breakage
**Problem:** Relative paths break when template nesting changes
**Solution:** Use 11ty's `url` filter for root-relative paths

## Sources

**Official Eleventy Documentation (HIGH confidence):**
- [Getting Started — Eleventy](https://www.11ty.dev/docs/)
- [HTML — Eleventy](https://www.11ty.dev/docs/languages/html/)
- [Layouts — Eleventy](https://www.11ty.dev/docs/layouts/)
- [Internationalization (i18n) — Eleventy](https://www.11ty.dev/docs/i18n/)
- [Passthrough File Copy — Eleventy](https://www.11ty.dev/docs/copy/)
- [Common Pitfalls — Eleventy](https://www.11ty.dev/docs/pitfalls/)
- [Permalinks — Eleventy](https://www.11ty.dev/docs/permalinks/)

**Community Resources (MEDIUM confidence):**
- [Migrating to Eleventy](https://ryanmulligan.dev/blog/migrating-to-11ty/)
- [Migrating my site from NextJS to Eleventy](https://sandroroth.com/blog/migrationl-to-eleventy/)
- [From Notion to Eleventy](https://iamschulz.com/from-notion-to-eleventy/)
- [Bringing your Notion database to life with Eleventy](https://samdking.co.uk/blog/bringing-your-notion-database-to-life-with-eleventy/)
- [WebC — Eleventy](https://www.11ty.dev/docs/languages/webc/)
- [Using a CMS — Eleventy](https://www.11ty.dev/docs/cms/)

**Project Context (HIGH confidence):**
- Current site structure: 260+ IT pages, 209 EN pages
- Notion-powered content generation via build scripts
- Translation memory system with MD5 hashing
- Existing language switcher infrastructure
- Mobile-optimized design with CSS variable system
