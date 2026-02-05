# Phase 37: Pages - Research

**Researched:** 2026-02-05
**Domain:** 11ty v3.x Bulk Page Migration with Front Matter and Layout Assignment
**Confidence:** HIGH

## Summary

This phase converts all 409+ existing HTML pages to use the shared layouts and components created in Phase 36. The pages are distributed across Italian (204 in src/pages + 3 root-level) and English (205 in en/src/pages + 1 root-level). Each page currently contains duplicated header/footer HTML that must be removed and replaced with layout assignment via front matter.

The migration is a mechanical transformation: add front matter with layout, title, and lang; strip the `<!DOCTYPE>` through `</head>` section; strip the header component; strip the footer component; strip the script tags handled by the layout. The content between header and footer remains unchanged. This preserves PAGE-04 requirement (content unchanged) while achieving PAGE-01/02 requirements (shared layouts).

**Primary recommendation:** Use a Node.js migration script that processes HTML files in batches, extracts content between header and footer, adds front matter, and writes the result. Validate each batch before proceeding.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @11ty/eleventy | 3.1.2 | Static site generator | Already installed, processes migrated files |
| Node.js | 18+ | Migration script runtime | Already available |
| cheerio | 1.0.0 | HTML parsing for content extraction | Standard Node.js HTML parser, already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fs/path | built-in | File operations | Always - reading/writing HTML files |
| glob | npm | File pattern matching | Finding all HTML files to process |

**Note:** No new dependencies required. cheerio is already installed for other build scripts in this project.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Migration script | Manual editing | 409+ files - not feasible manually |
| cheerio | regex | cheerio handles HTML edge cases correctly |
| Batch migration | One-by-one | Batch allows verification checkpoints |

## Architecture Patterns

### Pattern 1: Page Content Extraction

**What:** Extract page-specific content from existing full HTML files
**When to use:** Every page migration
**Example:**

Current page structure:
```html
<!DOCTYPE html>
<html lang="it">
<head>...</head>
<body>
  <!-- HEADER --> ... <!-- end header -->

  <!-- PAGE CONTENT - this is what we keep -->
  <section class="section">...</section>

  <!-- FOOTER --> ... <!-- end footer -->
  <script>...</script>
</body>
</html>
```

Target structure after migration:
```html
---
layout: layouts/base.liquid
title: Page Title
lang: it
---
<!-- PAGE CONTENT - preserved exactly -->
<section class="section">...</section>
```

### Pattern 2: Front Matter Generation

**What:** Generate correct front matter for each page
**When to use:** All migrated pages
**Example:**

```yaml
---
layout: layouts/base.liquid
title: Permesso per Studio          # Extracted from <title> tag
lang: it                            # From HTML lang attribute or directory
description: Optional description   # From meta description if present
---
```

### Pattern 3: Language Detection from Path

**What:** Determine language from file path, not HTML content
**When to use:** Setting lang in front matter
**Example:**

```javascript
// For file: en/src/pages/permesso-studio.html
const lang = filePath.startsWith('en/') ? 'en' : 'it';
```

### Pattern 4: Content Boundary Detection

**What:** Identify where header ends and footer begins
**When to use:** Extracting page content
**Example:**

```javascript
// Header ends at: </header> tag
// Footer begins at: <footer class="footer"> tag
// Content is everything between these

const $ = cheerio.load(html);
$('header').remove();
$('footer').remove();
$('script').remove();  // Scripts handled by layout
$('head').remove();
const content = $('body').html();
```

### Pattern 5: Title Extraction

**What:** Extract page title for front matter
**When to use:** Every page migration
**Example:**

```javascript
// Extract from <title>Permesso per Studio - SOS Permesso</title>
// Remove " - SOS Permesso" suffix
const fullTitle = $('title').text();
const title = fullTitle.replace(/ - SOS Permesso$/, '').trim();
```

### Pattern 6: Batch Processing with Verification

**What:** Process pages in batches with manual verification points
**When to use:** The migration workflow
**Example:**

```
Batch 1: Root pages (index.html, en/index.html)
  - Verify visually before continuing

Batch 2: IT permesso-* pages (22 files)
  - Verify sample pages before continuing

Batch 3: IT documenti-* pages (~85 files)
  - Verify sample pages before continuing

Batch 4: Remaining IT pages
  - Verify all IT before EN

Batch 5-8: EN pages (same pattern)
```

### Anti-Patterns to Avoid

- **Modifying page content during migration:** Only add front matter and strip header/footer - PAGE-04 requires content unchanged
- **Regex-based HTML parsing:** HTML is not regular; use cheerio for correct parsing
- **Processing all files at once:** Process in batches with verification checkpoints
- **Changing internal links:** Links within content stay as-is; they already work
- **Stripping inline styles:** Some pages have page-specific `<style>` blocks that must be preserved in content

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing | Regex patterns | cheerio | HTML edge cases (nested tags, attributes with quotes) |
| File globbing | fs.readdir + filter | glob npm package | Handles patterns like `**/*.html` |
| Front matter insertion | String concatenation | Template literal | Clean YAML formatting |
| Batch verification | Skip it | Manual visual check | Catch issues early, not after 400 files |

**Key insight:** This is a mechanical transformation. The complexity is in correctly identifying content boundaries, not in creative decisions.

## Common Pitfalls

### Pitfall 1: Inline Styles Stripped

**What goes wrong:** Pages lose page-specific styling (database.html, index.html have inline `<style>` blocks)
**Why it happens:** Aggressive stripping of `<head>` content
**How to avoid:** Extract and preserve inline `<style>` blocks, place them in the content or use `extraStyles` front matter variable
**Warning signs:** Database page loses its permit-list styling; homepage loses lighthouse animations

### Pitfall 2: Content Script Removed

**What goes wrong:** Contact form modal doesn't load on some pages
**Why it happens:** Removing ALL `<script>` tags including page-specific ones
**How to avoid:** Only remove the standard `app.js` and `mobile.js` script tags; preserve page-specific scripts like contact form loader
**Warning signs:** Contact modal not appearing on permit pages

### Pitfall 3: Title Extraction Fails

**What goes wrong:** Front matter has wrong or empty title
**Why it happens:** Title format varies (some have "- SOS Permesso", some don't; some are in different positions)
**How to avoid:** Extract title, then normalize by removing site name suffix; fall back to filename if title missing
**Warning signs:** Pages showing wrong titles in browser tab

### Pitfall 4: Language Mismatch

**What goes wrong:** Italian content gets English header/footer or vice versa
**Why it happens:** `lang` in front matter doesn't match actual file language
**How to avoid:** Always derive `lang` from file path (en/ prefix = en, else it)
**Warning signs:** Mixed language on pages

### Pitfall 5: Double Header/Footer

**What goes wrong:** Pages show header twice or footer twice
**Why it happens:** Content extraction doesn't fully remove existing header/footer HTML
**How to avoid:** Use cheerio to completely remove `<header>` and `<footer>` elements before extracting body content
**Warning signs:** Visual check shows duplicate navigation or duplicate footer links

### Pitfall 6: Breadcrumb Links Break

**What goes wrong:** Breadcrumb "Home" link goes to wrong place
**Why it happens:** Breadcrumb is part of page content and has hardcoded relative paths
**How to avoid:** Keep breadcrumbs in content unchanged; they already use correct relative paths or can be updated to use `| url` filter
**Warning signs:** Breadcrumb navigation goes to wrong pages

### Pitfall 7: URL Preservation Fails

**What goes wrong:** Output URLs change from `/src/pages/file.html` to `/file/index.html`
**Why it happens:** Front matter `permalink` overrides directory data file
**How to avoid:** Don't set `permalink` in front matter; let directory data files handle it (already configured in Phase 35)
**Warning signs:** Page URLs change, existing links break

## Code Examples

### Migration Script Structure

```javascript
// scripts/migrate-pages.js
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const glob = require('glob');

function extractTitle($) {
  const fullTitle = $('title').text() || '';
  return fullTitle.replace(/ - SOS Permesso$/, '').trim();
}

function extractDescription($) {
  const meta = $('meta[name="description"]');
  return meta.attr('content') || '';
}

function extractContent($) {
  // Remove elements handled by layout
  $('head').remove();
  $('header').remove();
  $('footer').remove();

  // Remove standard scripts (keep page-specific ones)
  $('script[src*="app.js"]').remove();
  $('script[src*="mobile.js"]').remove();

  // Get remaining body content
  return $('body').html().trim();
}

function generateFrontMatter(title, lang, description) {
  let fm = `---\nlayout: layouts/base.liquid\n`;
  fm += `title: "${title.replace(/"/g, '\\"')}"\n`;
  fm += `lang: ${lang}\n`;
  if (description) {
    fm += `description: "${description.replace(/"/g, '\\"')}"\n`;
  }
  fm += `---\n`;
  return fm;
}

function migrateFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  const lang = filePath.includes('/en/') ? 'en' : 'it';
  const title = extractTitle($);
  const description = extractDescription($);
  const content = extractContent($);

  const frontMatter = generateFrontMatter(title, lang, description);
  const newContent = frontMatter + '\n' + content;

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Migrated: ${filePath}`);
}

// Usage: node scripts/migrate-pages.js "src/pages/permesso-*.html"
const pattern = process.argv[2] || 'src/pages/*.html';
const files = glob.sync(pattern);
files.forEach(migrateFile);
```

### Migrated Page Example (permesso-studio.html)

Before:
```html
<!DOCTYPE html><html lang="it"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Permesso di soggiorno per Studio...">
  <title>Permesso per Studio - SOS Permesso</title>
  <!-- all head content -->
</head>
<body>
  <!-- HEADER -->
  <header class="header">...</header>

  <!-- BREADCRUMB -->
  <div class="breadcrumb-bar">...</div>

  <!-- PAGE HEADER -->
  <section class="section bg-off-white">...</section>

  <!-- CONTENT -->
  <section class="section">...</section>

  <!-- RELATED -->
  <section class="section bg-off-white">...</section>

  <!-- FOOTER -->
  <footer class="footer">...</footer>

  <script src="../scripts/app.js"></script>
  <script src="../scripts/mobile.js"></script>
</body></html>
```

After:
```html
---
layout: layouts/base.liquid
title: "Permesso per Studio"
lang: it
description: "Permesso di soggiorno per Studio..."
---

<!-- BREADCRUMB -->
<div class="breadcrumb-bar">...</div>

<!-- PAGE HEADER -->
<section class="section bg-off-white">...</section>

<!-- CONTENT -->
<section class="section">...</section>

<!-- RELATED -->
<section class="section bg-off-white">...</section>
```

### Root Index Page Special Handling

The root `index.html` has inline styles for lighthouse animation. These must be preserved:

```html
---
layout: layouts/base.liquid
title: "La tua Guida ai Permessi di Soggiorno"
lang: it
description: "Guida completa ai permessi di soggiorno in Italia"
---

<!-- HERO SECTION -->
<section class="hero-split" id="home">
  <!-- hero content -->
</section>

<!-- ... rest of content ... -->

<!-- Lighthouse animations CSS inline - MUST PRESERVE -->
<style>
  .lighthouse-container { /* ... */ }
  /* ... all lighthouse CSS ... */
</style>
```

### Verification Checklist

After each batch, verify:

```bash
# 1. Build succeeds
npm run build

# 2. Output count matches input count
echo "IT pages:" && find _site/src/pages -name "*.html" | wc -l
echo "EN pages:" && find _site/en/src/pages -name "*.html" | wc -l

# 3. Visual spot-check (open in browser)
open _site/src/pages/permesso-studio.html
open _site/en/src/pages/permesso-studio.html

# 4. Header/footer present once
grep -c "<header" _site/src/pages/permesso-studio.html  # Should be 1
grep -c "<footer" _site/src/pages/permesso-studio.html  # Should be 1

# 5. Lang attribute correct
grep -o '<html lang="[^"]*"' _site/src/pages/permesso-studio.html  # Should be lang="it"
grep -o '<html lang="[^"]*"' _site/en/src/pages/permesso-studio.html  # Should be lang="en"
```

### Directory Data Files (Already Exist)

These were created in Phase 35 and don't need modification:

```json
// src/pages/pages.11tydata.json
{
  "permalink": "{{ page.filePathStem }}.html"
}

// en/src/pages/pages.11tydata.json
{
  "permalink": "{{ page.filePathStem }}.html"
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full HTML in every file | Layout + content | 11ty migration | Single source for header/footer |
| Relative paths | `url` filter | 11ty standard | Correct paths at any nesting level |
| Duplicated nav data | Data files | 11ty standard | Single source for navigation |
| Manual updates | Template inheritance | 11ty standard | Change once, apply everywhere |

**Note:** This is not about changing approaches - it's about applying the established 11ty patterns (from Phase 35/36) to all existing pages.

## Open Questions

1. **Pages with contact form loader script**
   - What we know: Some pages have a script that loads contact-form.html via fetch
   - What's unclear: Should this be handled differently now that we have includes?
   - Recommendation: Keep existing client-side loading; contact form is a modal that needs JS anyway

2. **Pages with page-specific inline CSS**
   - What we know: database.html, index.html have inline `<style>` blocks
   - What's unclear: Best place to put these in migrated structure
   - Recommendation: Keep inline in content; works without modification

3. **Breadcrumb consistency**
   - What we know: Some pages have breadcrumbs, some don't; format varies slightly
   - What's unclear: Should breadcrumbs be standardized?
   - Recommendation: Keep as-is per PAGE-04 (preserve content exactly); standardization is separate phase

## Sources

### Primary (HIGH confidence)
- [Eleventy Front Matter](https://www.11ty.dev/docs/data-frontmatter/) - YAML front matter syntax
- [Eleventy Layouts](https://www.11ty.dev/docs/layouts/) - Layout assignment via front matter
- [Eleventy Data Cascade](https://www.11ty.dev/docs/data-cascade/) - How front matter merges with directory data
- Phase 35 Research - URL preservation patterns already established
- Phase 36 Research - Component/layout patterns already established

### Secondary (MEDIUM confidence)
- [cheerio Documentation](https://cheerio.js.org/) - HTML parsing and manipulation
- Existing project codebase - scripts/build-documents.js shows cheerio usage pattern

### Tertiary (LOW confidence)
- N/A - All findings verified with official sources and existing project patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project tools and established patterns
- Architecture: HIGH - Direct application of Phase 35/36 patterns
- Pitfalls: HIGH - Based on actual project file structure analysis

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - applying established patterns)
