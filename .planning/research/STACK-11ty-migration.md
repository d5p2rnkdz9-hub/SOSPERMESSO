# Technology Stack for 11ty Migration

**Project:** SOS Permesso - 11ty Migration
**Researched:** 2026-02-04
**Confidence:** HIGH (verified with official docs and Context7)

## Executive Summary

This migration adds 11ty as a static site generator on top of the existing HTML/CSS/JS foundation. The existing Notion integration, CSS design system, and build scripts remain unchanged. 11ty provides template composition (extract headers/footers into includes) while preserving all 469 existing URLs.

**Core principle:** Minimal changes. 11ty wraps existing HTML, does not replace it.

---

## Recommended Stack

### Static Site Generator (NEW)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@11ty/eleventy** | 3.1.2 | SSG for template composition | Latest stable (June 2025), well-maintained, zero client-side JS, supports plain HTML |
| **Node.js** | 18+ (already have) | Runtime for 11ty | Required by 11ty v3.1.2, already in use for Notion builds |

**Rationale:**
- 11ty v3.1.2 is the current stable release (v4.0 in alpha, avoid for production)
- Allows incremental migration (convert a few templates at a time)
- Works with plain HTML templates - no need to learn Nunjucks/Liquid if avoiding
- Zero JavaScript framework required - maintains current static approach
- Built-in dev server with hot reload
- Node 18+ already required per current package.json

### Template Engine (NEW)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Liquid** | (bundled with 11ty) | Layout/include templating | Simpler syntax than Nunjucks, well-maintained, default for HTML in 11ty |

**Rationale:**
- **Liquid over Nunjucks**: Liquid is actively maintained, simpler syntax, better performance, easier caching
- Nunjucks maintenance concerns (last release June 2022, community flagging this)
- **Liquid over WebC**: WebC is modern but experimental for this use case. Liquid proven for header/footer extraction
- Liquid is 11ty's default for `.html` files (less configuration)
- Syntax: `{% include "header.html" %}` and `{{ content }}` - minimal learning curve

**NOT WebC because:**
- Overhead for simple includes (WebC designed for component-heavy sites)
- Less mature than Liquid (WebC newer, still evolving)
- This project needs shared headers, not interactive components

### Caching & External Data (KEEP EXISTING, ADD ENHANCEMENT)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@notionhq/client** | 5.8.0 (keep) | Notion API integration | Already working, no changes needed |
| **@11ty/eleventy-fetch** | 5.0+ (add) | Cache Notion API responses | Prevents rate limiting during dev, offline resilience |

**Rationale:**
- Current Notion build scripts work - keep them as-is initially
- Add eleventy-fetch to wrap Notion API calls (enhancement, not replacement)
- Caching prevents 50+ API calls every dev server restart
- Offline development with cached data
- Configurable TTL (e.g., 1 day for production, 1 hour for dev)

### Build Infrastructure (KEEP + MODIFY)

| Component | Current | After Migration | Why |
|-----------|---------|-----------------|-----|
| **Build scripts** | `scripts/build-documents.js`, `scripts/build-permits.js` | Move to 11ty data files (`_data/`) | Better integration with 11ty build pipeline |
| **Template generators** | JS functions in `scripts/templates/` | Convert to 11ty layouts in `_includes/` | Leverage 11ty's layout system |
| **Manifest** | `scripts/manifest.json` | Keep for incremental builds | Unchanged, still needed for content hash tracking |
| **Translation memory** | `scripts/translation-memory.js` | Keep as-is | Unchanged, works independently of 11ty |

### Deployment (MINIMAL CHANGES)

| Component | Current | After Migration | Change |
|-----------|---------|-----------------|--------|
| **Netlify build** | `npm run build:docs` | `npx @11ty/eleventy` | Update netlify.toml command |
| **Output directory** | `.` (root) | `_site/` | Standard 11ty convention |
| **Node version** | 18 | 18+ | No change |
| **Environment vars** | NOTION_TOKEN (keep) | NOTION_TOKEN (keep) | No change |

**netlify.toml update:**
```toml
[build]
  command = "npx @11ty/eleventy"
  publish = "_site"

[build.environment]
  NODE_VERSION = "18"
```

---

## Stack Integration Points

### 1. Existing HTML Pages → 11ty Templates

**Current state:**
- 260+ pages in `src/pages/` (IT)
- 209 pages in `/en/src/pages/` (EN)
- Each page has full `<html>`, `<head>`, `<body>`, header, footer

**After migration:**
- Content pages in `src/pages/*.html` use Liquid layout
- Layouts in `_includes/layouts/` (e.g., `base.liquid`)
- Shared components in `_includes/` (e.g., `header.liquid`, `footer.liquid`)

**Integration method:**
```liquid
---
layout: layouts/base.liquid
title: Page title
---

<!-- Page-specific content only -->
<div class="content">
  <!-- Existing page HTML minus header/footer -->
</div>
```

### 2. CSS/JS Assets → Passthrough Copy

**Current state:**
- `src/styles/*.css` (5 files: main, components, animations, mobile, mobile-fix)
- `src/scripts/*.js` (2 files: app, mobile)
- `src/data/*.json` (2 files: content-it, content-en)

**After migration:**
```javascript
// .eleventy.js config
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy("assets"); // if exists
};
```

**Rationale:**
- Passthrough = copy without processing
- Maintains exact file paths for existing pages
- CSS design system unchanged

### 3. Notion Build → 11ty Data Files

**Current approach:**
- `scripts/build-documents.js` runs pre-build
- Generates 101 HTML files from Notion
- Uses `@notionhq/client` directly

**Migration approach (Phase 2):**
```javascript
// _data/notion.js
const { Client } = require("@notionhq/client");
const EleventyFetch = require("@11ty/eleventy-fetch");

module.exports = async function() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  // Use eleventy-fetch for caching
  return EleventyFetch("notion-permits", {
    duration: "1d",
    type: "json",
    fetchFunction: async () => {
      // Existing fetchPermitData logic here
      return await fetchPermitData(notion);
    }
  });
};
```

**Rationale:**
- Data files run during 11ty build (not pre-build)
- Caching reduces API calls during development
- Existing logic mostly reusable

### 4. URL Preservation → Permalink Configuration

**Requirement:** All 469 existing URLs must not change

**Current URLs:**
- `src/pages/permesso-studio.html` → `/src/pages/permesso-studio.html`
- `index.html` → `/index.html`

**11ty default:**
- `src/pages/permesso-studio.html` → `/src/pages/permesso-studio/` (directory with index.html)

**Solution - Preserve .html extensions:**
```javascript
// .eleventy.js config
module.exports = function(eleventyConfig) {
  // Preserve .html in URLs
  eleventyConfig.addGlobalData("permalink", function() {
    return (data) => {
      // Keep existing .html extension
      return data.page.filePathStem + ".html";
    };
  });
};
```

**Alternative (simpler):**
Set `permalink` in front matter of each template:
```liquid
---
permalink: /src/pages/permesso-studio.html
---
```

**Rationale:**
- Maintains existing URL structure
- No redirects needed
- SEO continuity

### 5. Multilingual Support → Directory Data Files

**Current structure:**
- `/src/pages/*.html` (IT, 260+ pages)
- `/en/src/pages/*.html` (EN, 209 pages)
- Language switcher in header

**11ty approach:**
```javascript
// src/pages/it.json (directory data file)
{
  "lang": "it",
  "locale": "it-IT"
}

// en/src/pages/en.json
{
  "lang": "en",
  "locale": "en-GB"
}
```

Layout uses:
```liquid
<html lang="{{ lang }}">
```

**Rationale:**
- Directory data files set variables for all nested pages
- Language switcher logic unchanged (still in app.js)
- No need for 11ty's i18n plugin (overkill for current structure)

---

## Installation Steps

### 1. Install 11ty Core

```bash
npm install --save-dev @11ty/eleventy@3.1.2
```

**Why --save-dev:** 11ty is a build tool, not a runtime dependency.

### 2. Install Caching Plugin

```bash
npm install --save-dev @11ty/eleventy-fetch@5.0.0
```

### 3. Verify Node Version

```bash
node --version  # Should be 18.x or higher
```

Already satisfied by current environment.

### 4. Add npm Scripts

```json
{
  "scripts": {
    "build": "npx @11ty/eleventy",
    "start": "npx @11ty/eleventy --serve",
    "build:docs": "node scripts/build-documents.js",
    "build:permits": "node scripts/build-permits.js",
    "build:sitemap": "node scripts/build-sitemap.js"
  }
}
```

**Rationale:**
- `build` = production build for Netlify
- `start` = local dev server with hot reload
- Keep existing build scripts initially

---

## What NOT to Add

| Technology | Why NOT |
|------------|---------|
| **Nunjucks** | Maintenance concerns (no releases since June 2022), more complex than Liquid |
| **WebC** | Overkill for header/footer extraction, experimental, component-heavy approach not needed |
| **11ty i18n plugin** | Current `/en/` subfolder approach sufficient, plugin adds complexity for minimal gain |
| **PostCSS/Sass** | CSS works, no preprocessing needed, adds build complexity |
| **Bundlers (Webpack/Rollup)** | No module bundling needed, vanilla JS sufficient |
| **React/Vue/Svelte** | Static site, no framework needed, maintains current zero-JS-framework approach |
| **Tailwind CSS** | Custom CSS variables system works, migration effort not justified |
| **TypeScript** | Vanilla JS works, no type safety needs for build scripts |
| **Markdown** | All content already HTML, no need for markdown support |
| **Eleventy Image plugin** | No images being processed/optimized currently |
| **Content Management UI** | Notion already serves this purpose |

---

## Migration Phases

### Phase 1: 11ty Setup (no content changes)
- Install 11ty + eleventy-fetch
- Configure `.eleventy.js` with passthrough copy
- Test build with empty `_includes/`
- Verify all assets copy correctly

### Phase 2: Extract Layouts
- Create `_includes/layouts/base.liquid` with full HTML structure
- Move header to `_includes/header.liquid`
- Move footer to `_includes/footer.liquid`
- Convert 5-10 pages as test
- Verify URLs unchanged

### Phase 3: Convert All Pages
- Batch convert remaining pages to use layouts
- IT pages first (260+)
- EN pages second (209)
- Verify all 469 URLs still work

### Phase 4: Integrate Notion Build
- Move Notion data fetching to `_data/` directory
- Add eleventy-fetch caching
- Test incremental builds
- Deprecate standalone build scripts

### Phase 5: Netlify Deployment
- Update netlify.toml with new build command
- Test preview deploy
- Verify environment variables work
- Deploy to production

---

## Configuration File Template

Basic `.eleventy.js` to start:

```javascript
module.exports = function(eleventyConfig) {
  // Copy static assets without processing
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy("assets");

  // Preserve .html file extensions in URLs
  eleventyConfig.setHTMLOutputPermalink(true);

  return {
    dir: {
      input: ".",           // Root directory
      includes: "_includes", // Layouts and partials
      data: "_data",        // Global data files
      output: "_site"       // Build output
    },
    templateFormats: ["html", "liquid"],
    htmlTemplateEngine: "liquid"
  };
};
```

---

## Dependency Summary

### Add to package.json

```json
{
  "devDependencies": {
    "@11ty/eleventy": "^3.1.2",
    "@11ty/eleventy-fetch": "^5.0.0"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.72.1",
    "@notionhq/client": "^5.8.0",
    "cheerio": "^1.0.0-rc.12",
    "cli-progress": "^3.12.0",
    "dotenv": "^17.2.3",
    "p-limit": "^7.2.0",
    "xml": "^1.0.1"
  }
}
```

**Only 2 new packages** for the entire migration.

---

## Risk Mitigation

### Risk: URL Structure Changes
**Mitigation:** Configure permalinks to preserve `.html` extensions, test all 469 URLs before deploy

### Risk: Build Time Increase
**Mitigation:** 11ty is fast (faster than manual builds), incremental builds, eleventy-fetch caching

### Risk: Breaking Existing Pages
**Mitigation:** Incremental conversion, test batch of 5-10 pages first, keep old pages until verified

### Risk: Notion API Rate Limits
**Mitigation:** eleventy-fetch caches responses, reduces API calls from 50+/build to 1/day

### Risk: Learning Curve
**Mitigation:** Liquid has minimal syntax, header/footer extraction is simple, extensive docs

---

## Sources

### High Confidence (Official Documentation)

- [Eleventy Official Docs](https://www.11ty.dev/docs/) - Current version and installation
- [Eleventy v3.1.2 Release](https://github.com/11ty/eleventy/releases) - Latest stable release (June 2025)
- [Eleventy Layouts](https://www.11ty.dev/docs/layouts/) - How layouts work
- [Passthrough File Copy](https://www.11ty.dev/docs/copy/) - Asset handling
- [JavaScript Data Files](https://www.11ty.dev/docs/data-js/) - External data integration
- [Eleventy Fetch Plugin](https://www.11ty.dev/docs/plugins/fetch/) - Caching documentation
- [Eleventy i18n](https://www.11ty.dev/docs/i18n/) - Multilingual approaches
- [Netlify 11ty Deploy](https://docs.netlify.com/build/frameworks/framework-setup-guides/eleventy/) - Netlify configuration

### Medium Confidence (Community Resources + Official Verification)

- [Nunjucks vs Liquid Comparison](https://github.com/11ty/eleventy/discussions/2330) - Community discussion
- [Nunjucks Maintenance Concerns](https://www.brycewray.com/posts/2023/03/time-move-on-nunjucks/) - Maintenance status
- [Liquid Template Language](https://www.11ty.dev/docs/languages/liquid/) - Official Liquid support
- [HTML Template Engine](https://www.11ty.dev/docs/languages/html/) - Plain HTML usage
- [WebC Documentation](https://www.11ty.dev/docs/languages/webc/) - Component framework
- [Notion + 11ty Integration](https://samdking.co.uk/blog/bringing-your-notion-database-to-life-with-eleventy/) - Real-world example
- [URL Preservation](https://www.11ty.dev/docs/permalinks/) - Permalink configuration

---

**Confidence Assessment:** HIGH
- All core technologies verified with official documentation (11ty, Netlify)
- Version numbers from official releases (June 2025)
- Notion integration pattern verified with community examples
- Template engine comparison based on official docs + community consensus
- No speculative/unverified claims

**Last Updated:** 2026-02-04
