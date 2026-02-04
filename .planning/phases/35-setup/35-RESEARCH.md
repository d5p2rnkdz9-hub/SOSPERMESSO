# Phase 35: Setup - Research

**Researched:** 2026-02-04
**Domain:** 11ty v3.x Installation and URL-Preserving Configuration
**Confidence:** HIGH

## Summary

This phase establishes 11ty v3.x as the static site generator for SOS Permesso, configured to preserve all 469 existing URLs exactly. The core challenge is configuring 11ty to output files to their existing paths rather than converting them to the default "cool URIs" pattern (e.g., `permesso-lavoro/index.html` instead of `permesso-lavoro.html`).

The standard approach uses directory data files with computed permalinks to preserve the exact file structure. Passthrough copy must be explicitly configured for CSS, JS, and image assets since 11ty only processes template files by default. The configuration uses ESM syntax (11ty v3.x standard) with Liquid as the template engine (already the 11ty default).

**Primary recommendation:** Use `page.filePathStem` in directory data files to generate permalinks that preserve the exact input path structure, including the `.html` extension.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @11ty/eleventy | 3.1.2 | Static site generator | Current stable release, ESM support, Liquid default |
| Node.js | 18+ | Runtime | Required by 11ty v3.x |
| liquidjs | 10.x | Template engine | Bundled with 11ty, actively maintained by Shopify |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none required for Phase 35) | - | - | - |

**Note:** No additional dependencies needed for this phase. 11ty v3.x includes everything required for basic setup and URL preservation.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Liquid | Nunjucks | Nunjucks unmaintained since June 2022 - don't use |
| ESM config | CommonJS config | Both work, ESM is modern standard for v3.x |

**Installation:**

```bash
npm install --save-dev @11ty/eleventy@3.1.2
```

## Architecture Patterns

### Recommended Project Structure (Phase 35)

```
Sito_Nuovo/
├── eleventy.config.js         # NEW: 11ty configuration (ESM)
├── index.html                  # Existing: root homepage
├── en/
│   ├── en.11tydata.json       # NEW: directory data for English
│   ├── index.html
│   └── src/
│       └── pages/
│           └── pages.11tydata.json  # NEW: permalink preservation
├── src/
│   ├── pages/
│   │   ├── pages.11tydata.json     # NEW: permalink preservation
│   │   └── *.html                   # Existing: all page files
│   ├── styles/                      # Existing: passthrough copy
│   ├── scripts/                     # Existing: passthrough copy
│   ├── components/                  # Existing: passthrough copy
│   └── data/                        # Existing: passthrough copy
├── IMAGES/                          # Existing: passthrough copy
├── public/                          # Existing: passthrough copy
└── _site/                           # OUTPUT: generated site
```

### Pattern 1: ESM Configuration File

**What:** Modern JavaScript module configuration for 11ty v3.x
**When to use:** All 11ty v3.x projects
**Example:**

```javascript
// eleventy.config.js
// Source: https://www.11ty.dev/docs/config/
export default function(eleventyConfig) {
  // Configuration goes here

  return {
    dir: {
      input: ".",      // Root directory as input
      output: "_site"  // Standard output directory
    }
  };
};
```

### Pattern 2: Passthrough Copy for Assets

**What:** Copy static assets without processing
**When to use:** CSS, JS, images, fonts - any non-template files
**Example:**

```javascript
// eleventy.config.js
// Source: https://www.11ty.dev/docs/copy/
export default function(eleventyConfig) {
  // CSS files
  eleventyConfig.addPassthroughCopy("src/styles");

  // JavaScript files
  eleventyConfig.addPassthroughCopy("src/scripts");

  // Components (HTML includes)
  eleventyConfig.addPassthroughCopy("src/components");

  // Data files
  eleventyConfig.addPassthroughCopy("src/data");

  // Images
  eleventyConfig.addPassthroughCopy("IMAGES");
  eleventyConfig.addPassthroughCopy("public");

  // English translation assets
  eleventyConfig.addPassthroughCopy("en/src/styles");
  eleventyConfig.addPassthroughCopy("en/src/scripts");

  // Misc root files
  eleventyConfig.addPassthroughCopy("google9d3fb813b4bab969.html");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
```

### Pattern 3: URL Preservation via Directory Data Files

**What:** Preserve .html extensions and exact file paths
**When to use:** Migration from static HTML site
**Example:**

```json
// src/pages/pages.11tydata.json
// Source: https://github.com/pdehaan/11ty-dynamic-permalink-test
{
  "permalink": "src/pages/{{ page.fileSlug }}.html"
}
```

For preserving full path structure including subdirectories:

```json
// src/pages/pages.11tydata.json
{
  "permalink": "{{ page.filePathStem }}.html"
}
```

**Note:** `page.filePathStem` includes the full directory structure (e.g., `src/pages/permesso-lavoro`), while `page.fileSlug` is just the filename (e.g., `permesso-lavoro`).

### Pattern 4: Root Index.html Handling

**What:** Ensure root index.html outputs correctly
**When to use:** Homepage at site root
**Example:**

The root `index.html` file naturally outputs to `_site/index.html` without special configuration when using `input: "."`.

### Anti-Patterns to Avoid

- **Not configuring passthrough copy:** 11ty won't copy CSS/JS/images unless explicitly configured - site will load with no styling
- **Using default "cool URI" permalinks:** Will break all existing URLs and SEO
- **Hardcoding permalinks in each file:** Use directory data files instead for maintainability
- **Using Nunjucks template syntax in JSON data files:** Liquid is the 11ty default and what JSON data files use

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL generation | Custom path manipulation | `page.filePathStem` in permalink | Built-in, tested, handles edge cases |
| Asset copying | Manual copy scripts | `addPassthroughCopy()` | Integrated with watch mode, incremental builds |
| Development server | http-server or similar | `eleventy --serve` | Hot reload, integrated with build |
| HTML processing | Custom template system | Liquid (11ty default) | Battle-tested, Shopify backing |

**Key insight:** 11ty's built-in features handle all Phase 35 requirements. No external tools or custom code needed.

## Common Pitfalls

### Pitfall 1: Passthrough Copy Not Configured

**What goes wrong:** CSS, JS, and images don't appear in `_site/` output. Site loads with no styling.
**Why it happens:** 11ty only processes template files by default. Static assets are not copied unless explicitly configured.
**How to avoid:** Add `addPassthroughCopy()` for every asset directory in `eleventy.config.js` BEFORE first build.
**Warning signs:** `_site/` directory exists but contains only HTML files. Browser console shows 404 errors for CSS/JS.

### Pitfall 2: URL Structure Changes Break Links

**What goes wrong:** Existing URLs like `/src/pages/permesso-lavoro.html` become `/src/pages/permesso-lavoro/index.html`, breaking all bookmarks and internal links.
**Why it happens:** 11ty's default behavior creates "cool URIs" without extensions.
**How to avoid:** Create directory data files with explicit permalink configuration using `page.filePathStem` BEFORE processing any HTML files.
**Warning signs:** Output files are in directories instead of flat files. URLs work without `.html` extension.

### Pitfall 3: English Pages Overwrite Italian Pages

**What goes wrong:** `/en/src/pages/chi-siamo.html` outputs to same location as `/src/pages/chi-siamo.html`.
**Why it happens:** Permalink configuration doesn't account for language prefix.
**How to avoid:** Use `page.filePathStem` which includes the full path including `en/` prefix.
**Warning signs:** Only one language version exists in output. Page count in `_site/` is half expected.

### Pitfall 4: Template Syntax in Wrong Context

**What goes wrong:** Permalink templates like `{{ page.fileSlug }}` are not processed, output literally.
**Why it happens:** Using Nunjucks syntax `{% %}` instead of Liquid syntax, or using JavaScript syntax in JSON files.
**How to avoid:** Use Liquid syntax `{{ }}` in JSON data files. Liquid is 11ty's default.
**Warning signs:** Output filenames contain literal `{{` characters.

### Pitfall 5: Input Directory Stripping

**What goes wrong:** Files in `src/` output to `_site/` without the `src/` prefix, breaking relative paths.
**Why it happens:** When input directory is set, 11ty strips it from output paths by default.
**How to avoid:** Use `input: "."` (root directory) rather than `input: "src"` to preserve full path structure.
**Warning signs:** Output structure doesn't match input structure.

## Code Examples

### Complete eleventy.config.js for Phase 35

```javascript
// eleventy.config.js
// Source: https://www.11ty.dev/docs/config/
// Purpose: Minimal config for URL preservation and asset passthrough

export default function(eleventyConfig) {

  // ============================================
  // PASSTHROUGH COPY: Static Assets
  // ============================================

  // CSS files (both IT and EN)
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("en/src/styles");

  // JavaScript files (both IT and EN)
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy("en/src/scripts");

  // HTML components (for dynamic loading)
  eleventyConfig.addPassthroughCopy("src/components");
  eleventyConfig.addPassthroughCopy("en/src/components");

  // Data files
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy("en/src/data");

  // Images
  eleventyConfig.addPassthroughCopy("IMAGES");
  eleventyConfig.addPassthroughCopy("public");

  // Root-level files that must be copied as-is
  eleventyConfig.addPassthroughCopy("google9d3fb813b4bab969.html");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  // ============================================
  // TEMPLATE CONFIGURATION
  // ============================================

  // Use Liquid for HTML files (this is the default, but explicit is better)
  // No configuration needed - Liquid is default in 11ty v3.x

  return {
    // Use root as input to preserve full path structure
    dir: {
      input: ".",
      output: "_site",
      // Layouts will be added in Phase 36
      // includes: "_includes",
      // layouts: "_includes/layouts"
    },

    // Template formats to process
    templateFormats: ["html", "liquid", "md"],

    // Use Liquid for HTML files
    htmlTemplateEngine: "liquid"
  };
};
```

### Directory Data File for Italian Pages

```json
// src/pages/pages.11tydata.json
// Source: https://www.11ty.dev/docs/data-template-dir/
// Purpose: Preserve URL structure for all pages in src/pages/
{
  "permalink": "{{ page.filePathStem }}.html"
}
```

### Directory Data File for English Pages

```json
// en/src/pages/pages.11tydata.json
// Source: https://www.11ty.dev/docs/data-template-dir/
// Purpose: Preserve URL structure for English pages
{
  "permalink": "{{ page.filePathStem }}.html"
}
```

### Root-Level Index Pages

For root-level index.html files, no special configuration needed - they output correctly with default behavior when using `input: "."`.

### package.json Scripts

```json
{
  "scripts": {
    "dev": "npx @11ty/eleventy --serve",
    "build": "npx @11ty/eleventy",
    "build:docs": "node scripts/build-documents.js",
    "build:sitemap": "node scripts/build-sitemap.js"
  }
}
```

### URL Verification Script (for testing)

```bash
#!/bin/bash
# scripts/verify-urls.sh
# Compare input and output URL structure

echo "Checking URL preservation..."

# Count input HTML files
INPUT_COUNT=$(find . -name "*.html" -not -path "./_site/*" -not -path "./node_modules/*" | wc -l)
echo "Input HTML files: $INPUT_COUNT"

# Count output HTML files
OUTPUT_COUNT=$(find ./_site -name "*.html" | wc -l)
echo "Output HTML files: $OUTPUT_COUNT"

# Check for directory-style URLs (should be 0)
DIR_URLS=$(find ./_site -name "index.html" -not -path "./_site/index.html" -not -path "./_site/en/index.html" | wc -l)
echo "Unwanted directory-style URLs: $DIR_URLS"

# Sample URL comparison
echo ""
echo "Sample URL comparisons:"
echo "Input: src/pages/chi-siamo.html"
echo "Expected output: _site/src/pages/chi-siamo.html"
ls -la _site/src/pages/chi-siamo.html 2>/dev/null || echo "NOT FOUND - URL BROKEN"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CommonJS config | ESM config | 11ty v3.0 (2024) | Use `export default` not `module.exports` |
| `.eleventy.js` filename | `eleventy.config.js` | 11ty v3.0 | Either works, new name preferred |
| Nunjucks default | Liquid default | 11ty v1.0+ | Liquid is default, actively maintained |
| Sync callbacks | Async callbacks | 11ty v3.0 | Config can use `async function` |

**Deprecated/outdated:**
- **Nunjucks**: Technically supported but no releases since June 2022. Use Liquid instead.
- **CommonJS config**: Works but ESM is the modern standard for v3.x.

## Open Questions

1. **Exact path for en/ pages**
   - What we know: `page.filePathStem` should include `en/` prefix
   - What's unclear: Need to verify output path is `_site/en/src/pages/...`
   - Recommendation: Test with single English page before bulk processing

2. **Case sensitivity on Netlify**
   - What we know: Netlify uses Linux (case-sensitive), local macOS is case-insensitive
   - What's unclear: Whether any filenames have case issues
   - Recommendation: Test on Netlify preview deploy before production cutover

3. **Incremental build behavior with passthrough copy**
   - What we know: 11ty v3.x has incremental builds
   - What's unclear: Whether passthrough copy changes trigger only asset copy or full rebuild
   - Recommendation: Test during development, not blocking for Phase 35

## Sources

### Primary (HIGH confidence)
- [Eleventy Configuration Docs](https://www.11ty.dev/docs/config/) - ESM syntax, dir options
- [Eleventy Passthrough Copy](https://www.11ty.dev/docs/copy/) - addPassthroughCopy() API
- [Eleventy Permalinks](https://www.11ty.dev/docs/permalinks/) - URL preservation patterns
- [Eleventy Supplied Data](https://www.11ty.dev/docs/data-eleventy-supplied/) - page.filePathStem, page.fileSlug
- [Eleventy Directory Data Files](https://www.11ty.dev/docs/data-template-dir/) - Naming conventions
- [npm @11ty/eleventy](https://www.npmjs.com/package/@11ty/eleventy) - Version 3.1.2 confirmed

### Secondary (MEDIUM confidence)
- [GitHub Issue #913](https://github.com/11ty/eleventy/issues/913) - .html extension preservation solution
- [pdehaan/11ty-dynamic-permalink-test](https://github.com/pdehaan/11ty-dynamic-permalink-test) - Working example
- [Eleventy Assets Guide](https://www.11ty.dev/docs/assets/) - Asset management patterns

### Tertiary (LOW confidence)
- N/A - All findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official npm package, version verified
- Architecture: HIGH - All patterns from official documentation
- Pitfalls: HIGH - Documented in official docs and GitHub issues

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable technology)
