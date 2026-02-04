# Architecture Research: 11ty Integration with SOS Permesso

**Project:** SOS Permesso - Migrate to 11ty SSG
**Research Focus:** How 11ty integrates with existing HTML/CSS/JS architecture
**Researched:** 2026-02-04
**Overall Confidence:** HIGH

## Executive Summary

Eleventy (11ty) is designed specifically for incremental adoption of existing HTML sites. It preserves directory structures, doesn't require app or pages folders, and can gradually transform static HTML into templated pages. For SOS Permesso's 260+ HTML pages, Notion API integration, and multilingual architecture (IT + EN + future languages), 11ty provides a clean migration path.

**Key finding:** 11ty doesn't replace your architecture—it enhances it. CSS, JS, and existing HTML can remain unchanged during migration. The build system integrates cleanly with existing Node.js scripts.

## Recommended Architecture

### Directory Structure (Migrated State)

```
Sito_Nuovo/
├── .eleventy.js                    # 11ty configuration
├── package.json                    # Add 11ty dependency
├── netlify.toml                    # Update build command
│
├── src/                            # Input directory (11ty config: input: "src")
│   ├── _data/                      # Global data (11ty convention)
│   │   ├── permits.js              # Fetch Notion permits at build time
│   │   ├── documents.js            # Fetch Notion documents at build time
│   │   ├── site.js                 # Site metadata (title, URL, etc.)
│   │   └── navigation.js           # Nav menu structure
│   │
│   ├── _includes/                  # Layouts & partials (11ty convention)
│   │   ├── layouts/
│   │   │   ├── base.njk            # Base layout (header, footer)
│   │   │   ├── page.njk            # Standard page layout
│   │   │   └── permit.njk          # Permit detail layout
│   │   │
│   │   └── components/             # Reusable components
│   │       ├── header.njk          # Header with nav
│   │       ├── footer.njk          # Footer
│   │       ├── breadcrumb.njk      # Breadcrumb bar
│   │       ├── language-switcher.njk
│   │       └── contact-form.njk
│   │
│   ├── pages/                      # Content pages (renamed from src/pages)
│   │   ├── index.njk               # Homepage (moved from root)
│   │   ├── database.njk            # Database landing
│   │   ├── chi-siamo.njk           # About page
│   │   ├── documenti-questura.njk
│   │   └── ...                     # Convert .html → .njk gradually
│   │
│   ├── permits/                    # NEW: Generated permit pages
│   │   └── permits.11tydata.js     # Template data for all permits
│   │                               # Pagination generates one page per permit
│   │
│   ├── documents/                  # NEW: Generated document pages
│   │   └── documents.11tydata.js   # Template data for all documents
│   │
│   ├── styles/                     # CSS (passthrough copy - UNCHANGED)
│   │   ├── main.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── mobile.css
│   │   ├── mobile-fix.css
│   │   └── rtl.css
│   │
│   └── scripts/                    # JS (passthrough copy - UNCHANGED)
│       ├── app.js
│       └── mobile.js
│
├── en/                             # English language directory
│   └── (mirrors src/ structure with lang="en" in front matter)
│
├── _site/                          # Output directory (11ty default)
│   └── (compiled HTML, CSS, JS)
│
└── scripts/                        # Build scripts (KEEP for now, migrate later)
    ├── notion-client.js            # Notion API wrapper
    ├── translation-memory.js       # Translation caching
    └── ...
```

### Key Architectural Decisions

| Decision | Rationale | Integration Impact |
|----------|-----------|-------------------|
| **Keep CSS/JS unchanged** | Passthrough copy preserves existing assets | Zero CSS/JS refactoring needed |
| **Gradual HTML → Nunjucks** | 11ty processes .html as Liquid by default | Can convert incrementally, file by file |
| **Notion API → Global data** | Fetch at build time via `_data/*.js` | Replace build-documents.js, build-permits.js |
| **Pagination for generated pages** | 11ty pagination creates one page per item | Replaces manual page generation loops |
| **i18n plugin for languages** | Directory-based locales (/, /en/) | Preserves existing URL structure |
| **Nunjucks over Liquid** | More powerful (macros, extends, better errors) | Convert .html → .njk for new pages |
| **Layout chaining** | base.njk → page.njk → content | DRY principle, shared header/footer |

## Integration Points with Existing System

### 1. CSS/JS Assets (NO CHANGES)

**Current:**
- CSS in `src/styles/` referenced as `../styles/main.css`
- JS in `src/scripts/` referenced as `../scripts/app.js`

**11ty Integration:**
```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  // Copy CSS unchanged
  eleventyConfig.addPassthroughCopy("src/styles");

  // Copy JS unchanged
  eleventyConfig.addPassthroughCopy("src/scripts");

  // Copy images unchanged
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("IMAGES");
};
```

**Result:** CSS and JS files copied to `_site/src/styles/` and `_site/src/scripts/` preserving all existing paths. No CSS/JS refactoring needed.

**Confidence:** HIGH (Official documentation confirms this pattern)

### 2. Header/Footer Extraction (MODERATE CHANGES)

**Current:**
- Header HTML duplicated in 260+ files
- Footer HTML duplicated in 260+ files

**11ty Integration:**

Create `src/_includes/layouts/base.njk`:
```nunjucks
<!DOCTYPE html>
<html lang="{{ lang or 'it' }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} - SOS Permesso</title>
  <link rel="stylesheet" href="/src/styles/main.css">
  <!-- ... other shared head content -->
</head>
<body>
  {% include "components/header.njk" %}

  <main>
    {{ content | safe }}
  </main>

  {% include "components/footer.njk" %}

  <script src="/src/scripts/app.js"></script>
</body>
</html>
```

Pages become:
```nunjucks
---
layout: layouts/base.njk
title: Database Permessi
---
<div class="container">
  <!-- Page-specific content only -->
</div>
```

**Result:**
- Header/footer maintained in one place
- ~200 lines per page → ~30 lines per page
- Changes to header/footer update all pages automatically

**Confidence:** HIGH (Standard 11ty pattern, widely documented)

### 3. Notion API Integration (MAJOR CHANGES)

**Current:**
```javascript
// scripts/build-permits.js
// Manually calls Notion API
// Loops through results
// Calls generatePermessoPage() for each
// Writes HTML files to disk
```

**11ty Integration:**

Create `src/_data/permits.js`:
```javascript
const { Client } = require('@notionhq/client');
const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  // Fetch from Notion with caching (1 hour default)
  const response = await EleventyFetch(
    "https://api.notion.com/v1/databases/YOUR_DATABASE_ID/query",
    {
      duration: "1h",
      type: "json",
      fetchOptions: {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      }
    }
  );

  // Transform Notion results to template-friendly format
  return response.results.map(page => ({
    id: page.id,
    slug: page.properties.Slug.rich_text[0]?.plain_text,
    title: page.properties.Nome.title[0]?.plain_text,
    // ... extract other properties
  }));
};
```

Create `src/permits/permit-detail.njk`:
```nunjucks
---
layout: layouts/permit.njk
pagination:
  data: permits
  size: 1
  alias: permit
permalink: "/src/pages/permesso-{{ permit.slug }}.html"
---
<div class="permit-detail">
  <h1>{{ permit.title }}</h1>
  <!-- Render permit content -->
</div>
```

**Result:**
- Notion data fetched once at build time
- Cached for 1 hour (configurable)
- Pagination creates one HTML per permit automatically
- No manual file writing
- Replace `scripts/build-permits.js` entirely

**Migration Strategy:**
1. Phase 1: Keep existing scripts, run before 11ty build
2. Phase 2: Move Notion fetch to `_data/`, run alongside scripts
3. Phase 3: Replace scripts entirely with 11ty data + pagination

**Confidence:** HIGH (Multiple tutorials confirm Notion + 11ty integration works well)

### 4. URL Preservation (CRITICAL)

**Current URLs:**
- `/index.html`
- `/src/pages/database.html`
- `/src/pages/permesso-lavoro-subordinato.html`
- `/en/src/pages/database.html`

**11ty Integration:**

Default 11ty behavior changes URLs:
- `src/pages/database.njk` → `_site/pages/database/index.html` (URL: `/pages/database/`)

To preserve exact URLs, use `permalink` in front matter:

```nunjucks
---
# src/pages/database.njk
permalink: "/src/pages/database.html"
---
```

Or configure directory data file `src/pages/pages.11tydata.js`:
```javascript
module.exports = {
  permalink: function(data) {
    // Preserve exact input path structure
    return data.page.inputPath.replace(/^\.\/src/, '/src').replace(/\.njk$/, '.html');
  }
};
```

**Result:** All existing URLs preserved exactly. No 301 redirects needed.

**Confidence:** HIGH (Official permalink documentation confirms this approach)

### 5. Multilingual Support (MAJOR ARCHITECTURAL SHIFT)

**Current:**
- IT pages in `src/pages/`
- EN pages in `en/src/pages/` (duplicated structure)
- Language detection via URL path inspection in `app.js`

**11ty i18n Integration:**

Directory structure:
```
src/
├── pages/              # Italian (default)
│   └── pages.11tydata.js:  { lang: "it", locale: "it-IT" }
│
en/
├── pages/              # English
    └── pages.11tydata.js:  { lang: "en", locale: "en-US" }
```

Enable i18n plugin in `.eleventy.js`:
```javascript
const { EleventyI18nPlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "it",
  });
};
```

Use `locale_url` filter in templates:
```nunjucks
<link rel="alternate" hreflang="en" href="{{ page.url | locale_url('en') }}">
```

**Result:**
- Each language is a separate 11ty "site"
- Shared layouts, components (with i18n data)
- i18n plugin maps IT ↔ EN URLs automatically
- Language switcher uses `locale_url` filter

**Confidence:** HIGH (Official i18n plugin, used in production sites)

### 6. Build Pipeline (REPLACES EXISTING)

**Current:**
```bash
# Manual workflow
node scripts/build-documents.js
node scripts/build-permits.js
node scripts/build-sitemap.js
# Deploy to Netlify (serves static files)
```

**11ty Pipeline:**
```bash
# Single command
npx @11ty/eleventy
```

**package.json:**
```json
{
  "scripts": {
    "build": "eleventy",
    "dev": "eleventy --serve",
    "debug": "DEBUG=Eleventy* eleventy"
  }
}
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "_site"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Result:**
- One build command replaces three scripts
- `--serve` provides dev server with live reload
- Incremental builds with `--incremental` flag
- Existing `scripts/` folder can be deleted after migration

**Confidence:** HIGH (Standard 11ty + Netlify deployment pattern)

## Component Boundaries (Before vs After)

### Before (Current Static HTML)

```
┌─────────────────────────────┐
│   index.html                │
│   ├── <header> (duplicated) │
│   ├── <main> (unique)       │
│   └── <footer> (duplicated) │
└─────────────────────────────┘

┌─────────────────────────────┐
│   database.html             │
│   ├── <header> (duplicated) │
│   ├── <main> (unique)       │
│   └── <footer> (duplicated) │
└─────────────────────────────┘

... 260+ times
```

**Problems:**
- Header change requires 260+ file edits
- Notion content manually generated via scripts
- Translation = duplicate entire file structure

### After (11ty Templated)

```
┌────────────────────────────────────────┐
│  _includes/layouts/base.njk            │
│  ├── <head> (shared meta, CSS links)   │
│  ├── components/header.njk (once)      │
│  ├── {{ content | safe }} (unique)     │
│  └── components/footer.njk (once)      │
└────────────────────────────────────────┘
         ▲
         │ extends
         │
┌────────────────────────────────────────┐
│  pages/database.njk                    │
│  └── <div class="database">            │
│      {% for permit in permits %}       │
│        <!-- Loop Notion data -->       │
│      {% endfor %}                      │
│  </div>                                │
└────────────────────────────────────────┘
```

**Benefits:**
- Header change updates 260+ pages automatically
- Notion data available as `permits` variable in templates
- Translation = separate `en/` directory with `lang="en"` data

## Data Flow Changes

### Current Flow

```
┌──────────────┐
│ Notion API   │
└──────┬───────┘
       │ Manual script execution
       ▼
┌──────────────────────────┐
│ scripts/build-permits.js │
│ - Fetch Notion           │
│ - Loop results           │
│ - Generate HTML strings  │
│ - Write files to disk    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────┐
│ src/pages/*.html │ (static files)
└──────────────────┘
       │
       ▼
┌──────────────┐
│ Netlify      │
│ (serves as-is)
└──────────────┘
```

### 11ty Flow

```
┌──────────────┐
│ Notion API   │
└──────┬───────┘
       │ Automatic (build time)
       ▼
┌─────────────────────┐
│ _data/permits.js    │
│ - Fetch with cache  │
│ - Transform to JSON │
│ - Return array      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 11ty Data Cascade           │
│ permits → available globally│
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ permits/permit-detail.njk│
│ - Pagination over data   │
│ - Template per item      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────┐
│ _site/*.html     │ (compiled)
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ Netlify      │
│ (serves _site/)
└──────────────┘
```

**Key Differences:**
1. **Notion fetch**: Manual script → Automatic at build time
2. **Caching**: None → 1-hour cache (configurable)
3. **Template generation**: String concatenation → Template engine
4. **Data availability**: N/A → Global data object in all templates
5. **Rebuild trigger**: Manual script run → File change or `npm run build`

## Migration Phases: Suggested Build Order

### Phase 1: Foundation (Week 1)
**Goal:** 11ty working alongside existing system

1. Install 11ty: `npm install @11ty/eleventy --save-dev`
2. Create `.eleventy.js` with basic config
3. Configure passthrough copy for CSS/JS/images
4. Set input: "src", output: "_site"
5. Create `src/_includes/` folder
6. Test: `npx @11ty/eleventy --dryrun`

**Validation:** 11ty runs without errors, recognizes input directory

### Phase 2: Extract Shared Components (Week 1-2)
**Goal:** Header and footer in one place

1. Create `src/_includes/components/header.njk` (copy from existing HTML)
2. Create `src/_includes/components/footer.njk` (copy from existing HTML)
3. Create `src/_includes/layouts/base.njk` (includes header, content, footer)
4. Convert 1 test page: `src/pages/chi-siamo.html` → `chi-siamo.njk`
5. Add front matter: `layout: layouts/base.njk`
6. Test: Build and compare output

**Validation:** Test page output matches original HTML exactly

### Phase 3: URL Preservation (Week 2)
**Goal:** Generated URLs match existing structure

1. Create `src/pages/pages.11tydata.js` with permalink function
2. Convert 5 test pages to .njk
3. Build and verify URLs: `/src/pages/database.html` etc.
4. Test all internal links work
5. Deploy test to Netlify preview

**Validation:** All test page URLs identical to current site

### Phase 4: Notion Integration - Documents (Week 2-3)
**Goal:** Replace build-documents.js

1. Install `@11ty/eleventy-fetch`
2. Create `src/_data/documents.js` (fetch Notion documents)
3. Create `src/documents/document-detail.njk` (pagination template)
4. Build and compare: Generated HTML vs current
5. Run both systems in parallel (verify identical output)

**Validation:** Document pages identical to current build-documents.js output

### Phase 5: Notion Integration - Permits (Week 3)
**Goal:** Replace build-permits.js

1. Create `src/_data/permits.js` (fetch Notion permits)
2. Create `src/permits/permit-detail.njk` (pagination template)
3. Handle variant pages (parent/child structure)
4. Build and compare outputs
5. Run both systems in parallel

**Validation:** Permit pages identical to current build-permits.js output

### Phase 6: Multilingual (Week 4)
**Goal:** i18n plugin working

1. Install i18n plugin
2. Create `en/pages/` directory structure
3. Configure locale data files
4. Convert EN test pages
5. Test language switcher with `locale_url` filter

**Validation:** EN pages accessible, language switcher works

### Phase 7: Bulk Conversion (Week 5)
**Goal:** Convert remaining static pages

1. Script to convert .html → .njk (add front matter)
2. Batch convert all pages in `src/pages/`
3. Build and test
4. Check for broken links

**Validation:** All pages build successfully

### Phase 8: Cleanup (Week 5)
**Goal:** Remove old build scripts

1. Delete `scripts/build-documents.js`
2. Delete `scripts/build-permits.js`
3. Update package.json scripts
4. Update README with new build commands

**Validation:** Build works without old scripts

### Phase 9: Production Deploy (Week 6)
**Goal:** Live on Netlify

1. Update netlify.toml build command
2. Test build on Netlify preview
3. Run full QA (all pages, all links)
4. Deploy to production
5. Monitor for issues

**Validation:** Production site working, URLs unchanged, all features functional

## Patterns to Follow

### Pattern 1: Global Data Files for External APIs

**Use Case:** Fetching Notion content, external JSON feeds

**Implementation:**
```javascript
// _data/permits.js
const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  const url = "https://api.notion.com/...";
  const json = await EleventyFetch(url, {
    duration: "1h",
    type: "json",
    fetchOptions: { /* ... */ }
  });
  return transformData(json);
};
```

**Benefits:**
- Automatic caching (no manual cache logic)
- Data available in all templates as `permits`
- Build fails if fetch fails (catches errors early)

### Pattern 2: Pagination for One-to-Many Pages

**Use Case:** Creating one page per Notion entry

**Implementation:**
```nunjucks
---
pagination:
  data: permits
  size: 1
  alias: permit
permalink: "/src/pages/permesso-{{ permit.slug }}.html"
---
<h1>{{ permit.title }}</h1>
```

**Benefits:**
- No manual looping
- Automatic page generation
- Each page has full data context

### Pattern 3: Directory Data for Shared Front Matter

**Use Case:** All pages in a folder share lang, layout, etc.

**Implementation:**
```javascript
// src/pages/pages.11tydata.js
module.exports = {
  layout: "layouts/page.njk",
  lang: "it",
  permalink: function(data) {
    return `/src/pages/${data.page.fileSlug}.html`;
  }
};
```

**Benefits:**
- DRY (don't repeat front matter)
- Changes apply to all files in directory
- Overridable per file if needed

### Pattern 4: Computed Data for Dynamic Values

**Use Case:** Generate breadcrumbs, compute reading time, etc.

**Implementation:**
```javascript
// _data/eleventyComputed.js
module.exports = {
  breadcrumb: (data) => {
    const parts = data.page.url.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      label: part,
      url: '/' + parts.slice(0, i + 1).join('/') + '/'
    }));
  }
};
```

**Benefits:**
- Dynamic values computed at build time
- Available in all templates
- Centralized logic

## Anti-Patterns to Avoid

### Anti-Pattern 1: Rebuilding HTML Structure in Templates

**Problem:** Duplicating header/footer in multiple templates

**Instead:** Use layouts and includes
```nunjucks
{# BAD #}
<header>...</header>
{{ content }}
<footer>...</footer>

{# GOOD #}
---
layout: layouts/base.njk
---
{{ content }}
```

### Anti-Pattern 2: Fetching APIs in Individual Templates

**Problem:** Multiple API calls, no caching, slow builds

**Instead:** Use global data files
```javascript
// BAD: In template
const notion = await fetch(...);

// GOOD: In _data/
module.exports = async function() {
  return await EleventyFetch(...);
};
```

### Anti-Pattern 3: Hardcoding URLs in Navigation

**Problem:** Language switcher breaks, URLs out of sync

**Instead:** Use `locale_url` filter and data files
```nunjucks
{# BAD #}
<a href="/en/database.html">English</a>

{# GOOD #}
<a href="{{ page.url | locale_url('en') }}">English</a>
```

### Anti-Pattern 4: Using .html Extension for New Templates

**Problem:** Defaults to Liquid (less powerful), confusing

**Instead:** Use .njk for Nunjucks (better errors, macros, extends)
```
BAD: about.html (Liquid)
GOOD: about.njk (Nunjucks)
```

### Anti-Pattern 5: Not Using Incremental Builds

**Problem:** Slow local development (rebuilds 260+ pages)

**Instead:** Use `--incremental` flag
```bash
# BAD
npx @11ty/eleventy --serve

# GOOD
npx @11ty/eleventy --serve --incremental
```

## Scalability Considerations

### At 260+ Pages (Current)

**Build Performance:**
- Full build: ~10-30 seconds (depending on Notion API)
- With `--incremental`: ~1-2 seconds for single page change
- With `EleventyFetch` cache: 0 API calls after initial build

**Recommended Settings:**
```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  // Don't copy on every change (faster)
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  // Incremental by default in dev
  if (process.env.NODE_ENV !== "production") {
    eleventyConfig.setIncrementalBuild(true);
  }
};
```

### At 500+ Pages

**Optimization Strategies:**
1. **Split Notion fetches**: Separate `_data/permits.js` and `_data/documents.js` (parallel fetch)
2. **Increase cache duration**: `duration: "1d"` for stable content
3. **Use `.eleventyignore`**: Exclude test pages from builds
4. **Pagination chunking**: Generate 10 pages per pagination cycle instead of 1

### At 1000+ Pages (Multiple Languages)

**Architecture Changes:**
1. **Separate builds per language**: Build IT and EN independently, merge in CI
2. **Content CDN**: Serve `_site/` from CDN with aggressive caching
3. **Build caching**: Cache Notion data between Netlify builds
4. **Pre-render critical pages**: Build homepage/database on-demand, lazy build others

## Sources

### Official Eleventy Documentation (HIGH Confidence)
- [Eleventy - Passthrough File Copy](https://www.11ty.dev/docs/copy/)
- [Eleventy - Internationalization (i18n)](https://www.11ty.dev/docs/i18n/)
- [Eleventy - Data Cascade](https://www.11ty.dev/docs/data-cascade/)
- [Eleventy - Global Data Files](https://www.11ty.dev/docs/data-global/)
- [Eleventy - Configuration](https://www.11ty.dev/docs/config/)
- [Eleventy - Permalinks](https://www.11ty.dev/docs/permalinks/)
- [Eleventy - Layouts](https://www.11ty.dev/docs/layouts/)
- [Eleventy - Incremental Builds](https://www.11ty.dev/docs/usage/incremental/)
- [Eleventy - Performance](https://www.11ty.dev/docs/performance/)

### Migration Guides (MEDIUM Confidence)
- [Converting a simple HTML site to use Eleventy](https://cassey.dev/converting-an-html-file-to-eleventy/)
- [Site Migration to Eleventy - TrebledJ's Pages](https://trebledj.me/posts/site-migration-to-eleventy/)
- [Eleventy Walk Through - Partials and Include](https://rphunt.github.io/eleventy-walkthrough/partials-and-include.html)

### Notion Integration (MEDIUM-HIGH Confidence)
- [Notion API with 11ty - Constant Vallee](https://www.constantvallee.dev/posts/notion-api-with-11ty/)
- [Outputting Notion API Data in Eleventy](https://www.dandenney.com/blips/outputting-notion-api-data-in-eleventy/)
- [11ty - Cache Data Requests](https://www.11ty.dev/docs/quicktips/cache-api-requests/)
- [Eleventy Fetch Plugin](https://www.11ty.dev/docs/plugins/fetch/)

### Multilingual Architecture (HIGH Confidence)
- [Internationalization with Eleventy 2.0 and Netlify](https://www.lenesaile.com/en/blog/internationalization-with-eleventy-20-and-netlify/)
- [Master Eleventy - Part 2: i18n and assets](https://www.fabienlasserre.dev/en/blog/master-eleventy-part-2-i18n-and-assets/)

### Community Best Practices (MEDIUM Confidence)
- [11ty tips I wish I knew from the start - David East](https://davidea.st/articles/11ty-tips-i-wish-i-knew-from-the-start/)
- [Understanding Filters, Shortcodes and Data in 11ty - MadeByMike](https://www.madebymike.com.au/writing/11ty-filters-data-shortcodes/)

### Deployment (HIGH Confidence)
- [Eleventy on Netlify - Netlify Docs](https://docs.netlify.com/integrations/frameworks/eleventy/)
- [Eleventy - Deployment](https://www.11ty.dev/docs/deployment/)

---

**Overall Assessment:** 11ty is an excellent fit for SOS Permesso's migration. The architecture preserves existing URLs, requires no CSS/JS changes, and provides clean integration with Notion API. Multilingual support via i18n plugin matches the existing `/en/` directory structure. Incremental adoption allows gradual migration without big-bang rewrites.

**Primary Risk:** URL preservation requires careful permalink configuration. Recommend Phase 3 focus entirely on URL testing before bulk conversion.

**Recommendation:** Proceed with migration using phased approach outlined above. Start with Phases 1-3 (foundation + URL preservation) before committing to full migration.
