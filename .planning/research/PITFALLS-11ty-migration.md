# Domain Pitfalls: 11ty Migration

**Domain:** Migrating existing 400+ page HTML site to 11ty SSG
**Project:** SOS Permesso (multilingual immigration info site)
**Researched:** 2026-02-04
**Overall Confidence:** MEDIUM-HIGH (verified with official docs + community patterns)

## Executive Summary

Migrating an existing HTML site to 11ty is lower risk than greenfield SSG projects, but has unique pitfalls around preserving URLs, managing path changes, and avoiding template language traps. The biggest risks are: (1) breaking existing URLs/paths during incremental migration, (2) choosing wrong template language for maintenance, (3) passthrough copy configuration mistakes that break CSS/images, (4) data cascade conflicts causing silent overwrites, and (5) build performance degradation with large sites.

**Critical insight:** 11ty defaults are optimized for new projects, not migrations. You must explicitly configure passthrough copy, permalinks, and path handling to preserve existing site structure.

---

## Critical Pitfalls

Mistakes that cause rewrites, broken production deploys, or major user-facing issues.

### Pitfall 1: Passthrough Copy Configuration Missing

**What goes wrong:**
After first 11ty build, CSS/images/fonts don't appear in `_site/` output. Site loads with no styling. This is the #1 issue for migrations because 11ty only processes template files by default.

**Why it happens:**
- 11ty templates: HTML → processed → output
- Static assets: NOT copied unless explicitly configured
- Existing HTML sites assume all files copy automatically

**Consequences:**
- Blank/unstyled pages in production
- Broken images, missing fonts
- JavaScript files not loading
- Requires emergency rollback

**Prevention:**
```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  // Copy all static assets
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/assets");

  // For SOS Permesso: also copy any remaining static folders
  eleventyConfig.addPassthroughCopy("src/data"); // if JSON served directly
};
```

**Detection:**
- Build succeeds but CSS/images missing in `_site/`
- Browser 404s for `/src/styles/main.css`
- Pages load with no styles in dev server

**Phase to address:** Phase 1 (Initial Configuration)

**Source confidence:** HIGH ([Eleventy Passthrough Documentation](https://www.11ty.dev/docs/copy/))

---

### Pitfall 2: URL Structure Breaks After Migration

**What goes wrong:**
Existing URLs like `src/pages/permesso-lavoro.html` become `/permesso-lavoro/` (directory) instead of `/permesso-lavoro.html` (file), breaking all existing links and SEO rankings.

**Why it happens:**
- 11ty defaults to "pretty URLs" (directories with index.html)
- Existing site uses `.html` extensions in URLs
- Search engines have indexed `.html` URLs
- Users have bookmarked `.html` URLs

**Consequences:**
- All existing links return 404
- SEO traffic drops to zero
- Users cannot access bookmarked pages
- Google Search Console shows massive errors

**Prevention:**
```javascript
// .eleventy.js - Keep .html extensions
module.exports = function(eleventyConfig) {
  return {
    htmlOutputSuffix: ".html", // This is actually the DEFAULT
    // The real fix is in templates:
  };
};
```

```yaml
---
# In EACH template, explicitly set permalink
permalink: "permesso-lavoro.html"  # NOT "/permesso-lavoro/"
---
```

**Better approach for 400 pages:**
Use computed data to preserve existing structure:

```javascript
// _data/eleventyComputed.js
module.exports = {
  permalink: (data) => {
    // If page is in src/pages/, preserve exact filename
    if (data.page.inputPath.includes('/pages/')) {
      const filename = data.page.inputPath.split('/').pop();
      return filename; // preserves permesso-lavoro.html
    }
    return data.permalink; // use existing permalink if set
  }
};
```

**Detection:**
- Build shows paths like `Writing _site/permesso-lavoro/index.html`
- Should be: `Writing _site/permesso-lavoro.html`
- Test URLs before deploying

**Phase to address:** Phase 1 (URL Preservation)

**Source confidence:** HIGH ([Eleventy Permalinks](https://www.11ty.dev/docs/permalinks/))

---

### Pitfall 3: Duplicate Permalink Conflicts

**What goes wrong:**
Multiple templates try to write to same output path. Build fails with "Output conflict: multiple input files are writing to `_site/index.html`" error. This is especially common when mixing old HTML with new templates.

**Why it happens:**
- Old: `index.html` in root
- New: `pages/home.njk` with `permalink: "index.html"`
- Both try to write to same location

**Consequences:**
- Build fails completely
- Cannot deploy to production
- Must manually debug which files conflict

**Prevention:**
```javascript
// .eleventy.js - Exclude old HTML during migration
module.exports = function(eleventyConfig) {
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    },
    // IMPORTANT: Don't process old HTML files
    templateFormats: ["njk", "md"], // NOT "html" during migration
  };
};
```

**Incremental migration strategy:**
1. Phase 1: Process only `.njk` templates
2. Phase 2: Move one HTML file to `.njk`, test
3. Phase 3: Gradually convert remaining HTML
4. Phase 4: Add "html" to templateFormats when all converted

**Detection:**
- Build error: "Output conflict: multiple input files..."
- Error shows conflicting file paths
- Run with `DEBUG=Eleventy* npx @11ty/eleventy` to see all processed files

**Phase to address:** Phase 1 (Template Configuration)

**Source confidence:** HIGH ([11ty Data Cascade](https://www.11ty.dev/docs/data-cascade/))

---

### Pitfall 4: Template Language Choice Regret

**What goes wrong:**
Choosing Nunjucks for convenience, then discovering it's unmaintained and has bugs. Having to rewrite all templates to Liquid or WebC later.

**Why it happens:**
- Nunjucks has more features (JavaScript in templates, macros)
- Many 11ty tutorials use Nunjucks
- Last Nunjucks release: June 2022 (unmaintained)
- Liquid is actively maintained (Shopify backing)

**Consequences:**
- Security vulnerabilities in unmaintained template engine
- Bugs with no upstream fixes
- Difficult migration to different template language later
- Technical debt from day one

**Prevention:**
**Choose Liquid for SOS Permesso** because:
- Actively maintained
- Shopify backing = long-term support
- Simple syntax (less complex than Nunjucks)
- Sufficient for SOS Permesso needs (no complex macros needed)
- Better long-term bet

**Configuration:**
```javascript
// .eleventy.js
module.exports = function(eleventyConfig) {
  return {
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
};
```

**Detection:**
- If using Nunjucks: Check [Mozilla/nunjucks GitHub](https://github.com/mozilla/nunjucks/releases)
- Last release over 18 months ago = red flag

**Phase to address:** Phase 1 (Initial Configuration - NOT reversible later)

**Source confidence:** MEDIUM ([Community discussion](https://www.brycewray.com/posts/2023/03/time-move-on-nunjucks/), [Template comparison](https://rphunt.github.io/eleventy-walkthrough/template-languages.html))

---

### Pitfall 5: Relative Path Catastrophe

**What goes wrong:**
CSS/JS paths work on some pages but break on others. `src/styles/main.css` loads on `/index.html` but 404s on `/pages/permesso-lavoro.html` because relative paths resolve differently at different URL depths.

**Why it happens:**
- Old HTML: `<link href="src/styles/main.css">` (relative)
- Works on root index.html
- Breaks on pages in subdirectories (looking for `pages/src/styles/main.css`)

**Consequences:**
- Inconsistent styling across site
- Debugging nightmare (works locally, breaks in subdirectories)
- User reports: "Some pages look broken"

**Prevention:**
**Use `url` filter for ALL asset paths:**

```liquid
<!-- WRONG (breaks in subdirectories) -->
<link href="src/styles/main.css">

<!-- RIGHT (works everywhere) -->
<link href="{{ '/src/styles/main.css' | url }}">
```

```javascript
// .eleventy.js - Configure pathPrefix if deploying to subdirectory
module.exports = function(eleventyConfig) {
  return {
    pathPrefix: "/", // or "/my-site/" if deploying to subdomain
  };
};
```

**For SOS Permesso with /en/ language subfolder:**
```javascript
// Use computed data to adjust paths per language
module.exports = {
  pathPrefix: (data) => {
    if (data.lang === 'en') return '/en/';
    return '/';
  }
};
```

**Detection:**
- CSS works on homepage, breaks on subpages
- Browser console: 404 for CSS/JS on some pages
- Test URLs at different depths

**Phase to address:** Phase 2 (Layouts & Partials)

**Source confidence:** HIGH ([11ty url filter](https://www.11ty.dev/docs/filters/url/), [HTML Base plugin](https://www.11ty.dev/docs/plugins/html-base/))

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or performance issues.

### Pitfall 6: Ignoring Incremental Builds

**What goes wrong:**
Full site rebuilds take 30-60 seconds for 400 pages. Development becomes painful. Developers wait for rebuilds instead of iterating quickly.

**Why it happens:**
- 11ty rebuilds all pages by default
- With 400 pages, even fast templates take time
- Watch mode rebuilds everything on any change

**Consequences:**
- Slow development workflow
- Developer frustration
- Reduced productivity

**Prevention:**
```bash
# Use incremental builds during development
npx @11ty/eleventy --incremental --serve

# Or in package.json
"scripts": {
  "dev": "eleventy --incremental --serve",
  "build": "eleventy" // full build for production
}
```

**Gotchas:**
- Incremental builds don't detect changes to:
  - Layout files (triggers full rebuild)
  - Data files (triggers full rebuild)
  - Config file (triggers full rebuild)
- Use full builds before deploying

**Detection:**
- Build times > 10 seconds during development
- Waiting for rebuilds slows iteration

**Phase to address:** Phase 1 (Developer Experience)

**Source confidence:** HIGH ([11ty Incremental Builds](https://www.11ty.dev/docs/usage/incremental/))

---

### Pitfall 7: Data Cascade Overwrites

**What goes wrong:**
Front matter in templates silently overwritten by directory data files. Developers set `title` in template, but `_data/pages.json` overwrites it. Confusing debugging.

**Why it happens:**
11ty data cascade priority (highest to lowest):
1. Computed Data
2. Front Matter Data (in template)
3. Template Data Files
4. Directory Data Files ← **Often forgotten**
5. Global Data Files

**Example conflict:**
```yaml
---
# src/pages/permesso-lavoro.njk
title: "Permesso di Soggiorno per Lavoro Subordinato"
---
```

```json
// src/pages/pages.json (overrides template!)
{
  "title": "Default Page Title"
}
```

**Consequences:**
- Template title ignored
- Mysterious "wrong data" bugs
- Developers don't understand why changes don't apply

**Prevention:**
```javascript
// Use computed data for overrides, make it EXPLICIT
// src/_data/eleventyComputed.js
module.exports = {
  // Only override if NOT set in front matter
  title: (data) => data.title || "Default Title"
};
```

**Best practice for SOS Permesso:**
- Front matter = source of truth for page-specific data
- Directory data files = shared config (layout, language)
- Global data = truly global (site name, nav structure)

**Detection:**
- Data doesn't match front matter
- Changes to front matter have no effect
- Check for `_data/` folders in page directories

**Phase to address:** Phase 2 (Data Architecture)

**Source confidence:** HIGH ([Data Cascade](https://benmyers.dev/blog/eleventy-data-cascade/))

---

### Pitfall 8: Multilingual URL Duplication

**What goes wrong:**
Italian and English pages generate to same URL paths. `/permesso-lavoro.html` exists for both IT and EN, last one wins. Losing one language version.

**Why it happens:**
- SOS Permesso has IT pages in `src/pages/`
- EN pages in `en/src/pages/`
- Without configuration, both output to `_site/permesso-lavoro.html`

**Consequences:**
- One language overwrites the other
- Users get wrong language
- SEO disaster (duplicate content)

**Prevention:**
```javascript
// .eleventy.js - Separate input directories
module.exports = function(eleventyConfig) {
  // Process IT and EN separately
  return [
    {
      dir: {
        input: "src",
        output: "_site"
      }
    },
    {
      dir: {
        input: "en/src",
        output: "_site/en"
      }
    }
  ];
};
```

**Alternative: Single config with computed permalinks:**
```javascript
// src/_data/eleventyComputed.js
module.exports = {
  permalink: (data) => {
    const base = data.page.filePathStem.replace('/pages/', '/');
    if (data.lang === 'en') {
      return `/en${base}.html`;
    }
    return `${base}.html`;
  }
};
```

**Detection:**
- Missing language versions after build
- `_site/` only has one language
- Check `_site/` vs `_site/en/` structure

**Phase to address:** Phase 3 (Multilingual Structure)

**Source confidence:** MEDIUM ([11ty i18n](https://www.11ty.dev/docs/i18n/), [Community patterns](https://www.lenesaile.com/en/blog/internationalization-with-eleventy-20-and-netlify/))

---

### Pitfall 9: Watch Mode Ignores Changes

**What goes wrong:**
Edit a layout file, save, but site doesn't rebuild. Or rebuilds some pages but not others. Confusing developer experience.

**Why it happens:**
- 11ty ignores files in `.gitignore` by default
- Some directories not watched (node_modules, _site)
- Incremental mode has limitations with includes

**Special case for SOS Permesso:**
- Changes to `_includes/header.njk` trigger FULL rebuild (correct)
- Changes to data files trigger FULL rebuild (correct)
- Changes to ignored directories don't trigger rebuild (correct)

**Consequences:**
- Must manually restart server
- Confusion about what triggers rebuilds

**Prevention:**
```javascript
// .eleventy.js - Configure watch targets
module.exports = function(eleventyConfig) {
  // Watch additional files
  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.addWatchTarget("src/scripts/");

  // Optionally disable .gitignore
  eleventyConfig.setUseGitIgnore(false); // NOT recommended

  return {
    dir: { /* ... */ }
  };
};
```

**Detection:**
- Save file, no rebuild happens
- Check if file is in `.gitignore`
- Check 11ty terminal output

**Phase to address:** Phase 1 (Developer Experience)

**Source confidence:** HIGH ([Watch & Serve](https://www.11ty.dev/docs/watch-serve/))

---

### Pitfall 10: Netlify Build Failures (Case Sensitivity)

**What goes wrong:**
Build works locally (macOS/Windows) but fails on Netlify with "template not found" errors. Netlify uses case-sensitive Linux filesystem.

**Why it happens:**
- Local dev: macOS/Windows = case-insensitive
- Netlify: Linux = case-sensitive
- `{% include "Header.njk" %}` finds `header.njk` locally
- Fails on Netlify: "Header.njk" ≠ "header.njk"

**Consequences:**
- Production deploy fails
- Emergency debugging
- Rollback to previous version

**Prevention:**
**Enforce lowercase filenames:**
```bash
# All includes/layouts lowercase
_includes/header.njk  # NOT Header.njk
_includes/footer.njk  # NOT Footer.njk
```

**Check before deploying:**
```bash
# Find files with uppercase in critical directories
find src/_includes -name "*[A-Z]*"
find src/_layouts -name "*[A-Z]*"
```

**Netlify configuration:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "_site"

[build.environment]
  NODE_VERSION = "20"  # Specify exact Node version
```

**Detection:**
- Build succeeds locally, fails on Netlify
- Error: "template not found" or "ENOENT"
- Check Netlify build logs for case mismatches

**Phase to address:** Phase 4 (Deployment)

**Source confidence:** HIGH ([Netlify troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/), [Community reports](https://answers.netlify.com/t/building-an-eleventy-project-works-locally-but-fails-on-netlify/56676))

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 11: Missing Trailing Slashes in Permalinks

**What goes wrong:**
Browser tries to download file instead of displaying page. Permalink set to `/about` instead of `/about/` or `/about.html`.

**Why it happens:**
- Permalink without extension treated ambiguously
- Server may serve file download

**Prevention:**
```yaml
---
# WRONG
permalink: "/about"

# RIGHT (directory)
permalink: "/about/"

# OR (file)
permalink: "/about.html"
---
```

**Detection:**
- Browser prompts to download file
- Page doesn't render

**Phase to address:** Phase 1 (Permalink Configuration)

**Source confidence:** HIGH ([11ty Common Pitfalls](https://www.11ty.dev/docs/pitfalls/))

---

### Pitfall 12: Liquid Include Syntax Differences

**What goes wrong:**
Jekyll developers use Liquid without quotes: `{% include header %}`. 11ty Liquid requires quotes: `{% include "header.liquid" %}`.

**Why it happens:**
- Jekyll's Liquid fork has different defaults
- 11ty uses LiquidJS (different implementation)

**Prevention:**
```liquid
<!-- WRONG (Jekyll style) -->
{% include header %}

<!-- RIGHT (11ty style) -->
{% include "header.liquid" %}
```

**Detection:**
- Template errors on include statements
- Check 11ty error messages

**Phase to address:** Phase 2 (Template Migration)

**Source confidence:** HIGH ([11ty Liquid docs](https://www.11ty.dev/docs/languages/liquid/))

---

### Pitfall 13: Array.reverse() Mutates Collections

**What goes wrong:**
Using `Array.reverse()` on collections causes unexpected sorting in production. Collection order differs between builds.

**Why it happens:**
- `.reverse()` mutates original array
- Collections are shared objects
- Side effects persist across renders

**Prevention:**
```liquid
<!-- WRONG -->
{% assign reversed = collections.posts | reverse %}

<!-- RIGHT -->
{% assign reversed = collections.posts | reverse %}
<!-- Liquid's reverse filter doesn't mutate, but in JS: -->
```

```javascript
// In JavaScript data files
const reversed = [...collections.posts].reverse(); // Create copy first
```

**Detection:**
- Collection order changes unpredictably
- Different order in dev vs production

**Phase to address:** Phase 3 (Collections)

**Source confidence:** HIGH ([11ty Common Pitfalls](https://www.11ty.dev/docs/pitfalls/))

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: Initial Setup** | Passthrough copy missing | Configure all static assets upfront, test build output |
| **Phase 1: URL Preservation** | URLs change from .html to directories | Set permalinks explicitly, test all URLs before deploy |
| **Phase 1: Template Choice** | Choose unmaintained Nunjucks | Use Liquid for long-term maintenance |
| **Phase 2: Layouts** | Relative paths break | Use `url` filter for ALL asset paths |
| **Phase 2: Includes** | Header/footer duplication during migration | Keep old HTML until templates ready, then swap |
| **Phase 3: Multilingual** | IT/EN pages overwrite each other | Separate output directories or computed permalinks |
| **Phase 3: Data** | Data cascade overwrites unexpected | Document cascade priority, use computed data intentionally |
| **Phase 4: Build Performance** | Slow builds with 400 pages | Enable incremental builds, cache expensive operations |
| **Phase 4: Deployment** | Case sensitivity breaks Netlify | Enforce lowercase filenames, test on Linux |

---

## Performance Pitfalls (400+ Page Site)

### Pitfall 14: Image Processing Bottleneck

**What goes wrong:**
Adding `@11ty/eleventy-img` plugin to optimize images. Build time goes from 20s to 5+ minutes.

**Why it happens:**
- Image optimization is CPU-intensive
- 400 pages × multiple images per page = thousands of image operations
- No caching by default during development

**Prevention:**
```javascript
// Use Image Transform for on-demand processing
eleventyConfig.addPlugin(EleventyRenderPlugin);

// Or: Only optimize images on production builds
if (process.env.ELEVENTY_ENV === 'production') {
  eleventyConfig.addPlugin(Image);
}
```

**Detection:**
- Build times suddenly increase
- `npm run dev` becomes unusably slow

**Phase to address:** Phase 5+ (Optimization, NOT initial migration)

**Source confidence:** MEDIUM ([11ty Performance docs](https://www.11ty.dev/docs/performance/))

---

### Pitfall 15: Notion API Rate Limits

**What goes wrong:**
Build script fetches Notion data for 67 permit pages. Hits rate limits (3 requests/second). Build fails intermittently.

**Why it happens:**
- Notion API: 3 requests per second limit
- Build script loops through all permits
- No rate limiting in script

**Prevention:**
```javascript
// scripts/build-permits.js
async function fetchWithRateLimit(apiCall) {
  await apiCall();
  await new Promise(resolve => setTimeout(resolve, 350)); // 3/sec = 333ms, use 350ms to be safe
}

// Use existing Notion cache approach (already implemented)
// Fetch once, cache locally, rebuild from cache
```

**Detection:**
- Notion API errors during build
- Intermittent build failures
- "rate limit exceeded" errors

**Phase to address:** Phase 3 (Notion Integration)

**Source confidence:** MEDIUM (Notion API docs + existing SOS Permesso implementation)

---

## Migration-Specific Strategy

### Safe Incremental Migration Path

**Phase 1: Setup (Week 1)**
- [ ] Configure passthrough copy for ALL static assets
- [ ] Set permalinks to preserve .html extensions
- [ ] Choose Liquid as template language
- [ ] Configure incremental builds
- [ ] Set up Netlify build with Node 20

**Phase 2: Extract Shared Components (Week 2)**
- [ ] Convert header to `_includes/header.liquid`
- [ ] Convert footer to `_includes/footer.liquid`
- [ ] Convert navigation to `_includes/nav.liquid`
- [ ] Create base layout with `url` filter for all paths
- [ ] Test on 5 sample pages

**Phase 3: Migrate Page Types (Weeks 3-4)**
- [ ] Migrate database.html (landing page)
- [ ] Migrate 5 permit pages (test multilingual)
- [ ] Migrate 5 document pages
- [ ] Verify URLs match exactly
- [ ] Deploy to staging, test

**Phase 4: Bulk Migration (Week 5)**
- [ ] Batch convert remaining permit pages (62)
- [ ] Batch convert remaining document pages (58)
- [ ] Batch convert guide pages
- [ ] Verify no URL changes

**Phase 5: Multilingual (Week 6)**
- [ ] Configure EN output to `/en/` subdirectory
- [ ] Test IT/EN don't overwrite each other
- [ ] Verify language switcher works
- [ ] Update sitemaps

**Phase 6: Production Deploy**
- [ ] Full build test
- [ ] Performance benchmarks (build time)
- [ ] URL audit (all 400+ pages)
- [ ] Deploy to production
- [ ] Monitor for 404s

---

## Sources

**Official Documentation (HIGH confidence):**
- [Eleventy Common Pitfalls](https://www.11ty.dev/docs/pitfalls/) — Official pitfalls documentation
- [Passthrough File Copy](https://www.11ty.dev/docs/copy/) — Static asset handling
- [Permalinks](https://www.11ty.dev/docs/permalinks/) — URL structure configuration
- [Data Cascade](https://www.11ty.dev/docs/data-cascade/) — Data priority rules
- [Incremental Builds](https://www.11ty.dev/docs/usage/incremental/) — Performance optimization
- [Watch & Serve](https://www.11ty.dev/docs/watch-serve/) — Development workflow
- [url Filter](https://www.11ty.dev/docs/filters/url/) — Path handling
- [Internationalization](https://www.11ty.dev/docs/i18n/) — Multilingual support

**Community Resources (MEDIUM confidence):**
- [Converting HTML to Eleventy](https://cassey.dev/converting-an-html-file-to-eleventy/) — Migration patterns
- [Eleventy Walkthrough - Template Languages](https://rphunt.github.io/eleventy-walkthrough/template-languages.html) — Template comparison
- [Time to Move On from Nunjucks](https://www.brycewray.com/posts/2023/03/time-move-on-nunjucks/) — Template maintenance concerns
- [I Finally Understand Eleventy's Data Cascade](https://benmyers.dev/blog/eleventy-data-cascade/) — Data cascade explained
- [Internationalization with Eleventy 2.0 and Netlify](https://www.lenesaile.com/en/blog/internationalization-with-eleventy-20-and-netlify/) — Multilingual patterns
- [Eleventy Performance](https://www.11ty.dev/docs/performance/) — Build optimization strategies
- [Netlify Build Troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/) — Deployment issues

**GitHub Issues (LOW-MEDIUM confidence):**
- [Netlify Deploy Failures with 11ty](https://answers.netlify.com/t/netlify-deploy-fails-with-11ty-build-step-local-build-works-fine/70349) — Case sensitivity issues
- [Large Dataset Performance](https://github.com/11ty/eleventy/issues/2226) — Performance with large collections
- [Watch Mode Skip Builds](https://github.com/11ty/eleventy/issues/3143) — Watch mode gotchas

---

*Research complete. All findings verified against official documentation and community consensus. Confidence levels assigned per source hierarchy protocol.*
