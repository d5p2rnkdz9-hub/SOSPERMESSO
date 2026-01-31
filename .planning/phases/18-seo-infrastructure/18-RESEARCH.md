# Phase 18: SEO Infrastructure - Research

**Researched:** 2026-01-31
**Domain:** SEO (robots.txt, XML sitemaps)
**Confidence:** HIGH

## Summary

This phase establishes basic SEO infrastructure to enable search engine discovery: robots.txt for crawler access and XML sitemap for page listing. Both are well-established web standards with clear specifications.

The project is a static HTML site (262 HTML files) hosted on Netlify at `https://sospermesso.it`. Key challenges are: (1) detecting and excluding ~38 meta refresh redirect pages from sitemap, (2) handling nested page structures (e.g., `permesso-lavoro-subordinato/index.html`), and (3) excluding non-site directories like NOTION_WEBSITE.

Existing build scripts in `scripts/` provide patterns for Node.js file system operations. The sitemap generator should follow similar conventions.

**Primary recommendation:** Create a custom Node.js build script (`scripts/build-sitemap.js`) using the `xml` npm package to generate sitemap.xml from file system, detecting redirects by checking for `meta http-equiv="refresh"` in file content.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| xml | latest | Generate XML from JSON objects | 800k+ weekly downloads, no dependencies, simple API |
| fs/promises | Node built-in | Async file operations | Standard Node.js, matches existing scripts |
| path | Node built-in | Path manipulation | Standard Node.js |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| glob | latest | File pattern matching | Only if fs.readdir recursive proves insufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| xml npm | sitemap npm | sitemap.js is heavier (streams, CLI) - overkill for 260 URLs |
| Custom script | sitemap-generator | sitemap-generator crawls via HTTP - slower, requires running server |
| Hand-rolled XML | Template literals | xml package handles escaping automatically |

**Installation:**
```bash
npm install xml
```

## Architecture Patterns

### Recommended File Structure
```
project-root/
├── robots.txt           # Static file in root
├── sitemap.xml          # Generated file in root
├── scripts/
│   ├── build-sitemap.js # New: sitemap generator
│   ├── build-documents.js
│   └── build-permits.js
├── index.html           # Root page
├── 404.html             # Error page (exclude from sitemap)
└── src/pages/           # Main pages directory
    ├── *.html           # Regular pages
    └── permesso-*/      # Subdirectories for variants
```

### Pattern 1: Static robots.txt
**What:** Plain text file in site root allowing all crawlers, referencing sitemap
**When to use:** Simple site with no crawler restrictions needed
**Example:**
```
# robots.txt for sospermesso.it
# Allow all search engines to crawl all content

User-agent: *
Allow: /

Sitemap: https://sospermesso.it/sitemap.xml
```

**Source:** [Google Developers - Create robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt)

### Pattern 2: Redirect Detection via Content Check
**What:** Read first 500 bytes of HTML file, check for meta refresh pattern
**When to use:** Detecting redirect pages to exclude from sitemap
**Example:**
```javascript
async function isRedirectPage(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  // Check first 500 chars for meta refresh (redirect indicator)
  const head = content.slice(0, 500);
  return head.includes('http-equiv="refresh"') ||
         head.includes('http-equiv=\'refresh\'');
}
```

### Pattern 3: XML Generation from JSON
**What:** Use xml package to convert structured data to XML string
**When to use:** Generating sitemap.xml
**Example:**
```javascript
// Source: https://maxschmitt.me/posts/sitemap-xml-node-js
const xml = require('xml');

const xmlObject = {
  urlset: [
    { _attr: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' } },
    ...pages.map((page) => ({
      url: [
        { loc: page.url },
        { lastmod: page.lastmod }
      ]
    }))
  ]
};
const xmlString = '<?xml version="1.0" encoding="UTF-8"?>' + xml(xmlObject);
```

### Anti-Patterns to Avoid
- **Including redirect pages in sitemap:** Sitemaps should only contain indexable 200 OK pages, not redirects
- **Hardcoding page list:** File system should be source of truth, not a manual list
- **Relative sitemap URL in robots.txt:** Must use fully-qualified absolute URL

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML string construction | Manual string concatenation | xml npm package | Handles entity escaping (&, <, >, quotes) automatically |
| Date formatting | Custom date functions | toISOString().split('T')[0] | Standard ISO 8601 date format (YYYY-MM-DD) |
| File discovery | Manual path construction | fs.readdir with recursive option | Handles subdirectories automatically |

**Key insight:** XML generation requires proper escaping of special characters. The xml package handles this transparently, preventing malformed sitemaps.

## Common Pitfalls

### Pitfall 1: Relative URLs in Sitemap
**What goes wrong:** Search engines reject sitemap with relative URLs
**Why it happens:** Using paths like `/src/pages/page.html` instead of full URLs
**How to avoid:** Always prepend site base URL to all paths
**Warning signs:** Sitemap validation errors in Google Search Console

### Pitfall 2: Including Non-Indexable Pages
**What goes wrong:** Google reports "Submitted URL is a redirect" errors
**Why it happens:** Meta refresh redirect pages included in sitemap
**How to avoid:** Check file content for `http-equiv="refresh"` before including
**Warning signs:** Coverage errors in Search Console after sitemap submission

### Pitfall 3: Missing Sitemap Reference in robots.txt
**What goes wrong:** Crawler finds sitemap slower (has to discover via Search Console or guessing)
**Why it happens:** Only creating sitemap.xml without updating robots.txt
**How to avoid:** Always add `Sitemap:` directive to robots.txt
**Warning signs:** Delayed indexing of new pages

### Pitfall 4: Wrong URL Structure for Subpages
**What goes wrong:** Incorrect URLs for pages in subdirectories like `permesso-lavoro-subordinato/`
**Why it happens:** Not handling nested directory structure properly
**How to avoid:** Build URL paths that match actual site structure:
- `src/pages/page.html` -> `https://sospermesso.it/src/pages/page.html`
- `src/pages/folder/index.html` -> `https://sospermesso.it/src/pages/folder/index.html`
**Warning signs:** 404 errors when Google tries to crawl sitemap URLs

### Pitfall 5: Including NOTION_WEBSITE Directory
**What goes wrong:** Hundreds of Notion export files appear in sitemap
**Why it happens:** Recursive file scan includes all HTML files
**How to avoid:** Exclude NOTION_WEBSITE directory explicitly
**Warning signs:** Sitemap contains URLs with hash-like filenames

## Code Examples

### Complete robots.txt
```
# robots.txt for sospermesso.it
# Source: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt

User-agent: *
Allow: /

Sitemap: https://sospermesso.it/sitemap.xml
```

### Sitemap Build Script Structure
```javascript
/**
 * build-sitemap.js
 * Generates sitemap.xml from file system
 */
const fs = require('fs/promises');
const path = require('path');
const xml = require('xml');

const SITE_URL = 'https://sospermesso.it';
const ROOT_DIR = path.join(__dirname, '..');

// Directories to include
const INCLUDE_DIRS = [
  { dir: ROOT_DIR, pattern: /^(index|404)\.html$/, exclude: ['404.html'] },
  { dir: path.join(ROOT_DIR, 'src/pages'), pattern: /\.html$/ }
];

// Directories to exclude
const EXCLUDE_DIRS = ['NOTION_WEBSITE', 'node_modules', '.git', '.planning'];

async function isRedirectPage(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const head = content.slice(0, 500);
  return head.includes('http-equiv="refresh"');
}

async function getLastModified(filePath) {
  const stats = await fs.stat(filePath);
  return stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ... rest of implementation
```

### Lastmod Date Format
```javascript
// Source: https://www.sitemaps.org/protocol.html
// W3C Datetime format, YYYY-MM-DD is acceptable short form

const stats = await fs.stat(filePath);
const lastmod = stats.mtime.toISOString().split('T')[0];
// Result: "2026-01-31"
```

### URL Path Construction
```javascript
function filePathToUrl(filePath, rootDir) {
  // Convert file path to site URL
  const relativePath = path.relative(rootDir, filePath);
  // Use forward slashes for URLs
  const urlPath = relativePath.split(path.sep).join('/');
  return `${SITE_URL}/${urlPath}`;
}

// Examples:
// /project/index.html -> https://sospermesso.it/index.html
// /project/src/pages/chi-siamo.html -> https://sospermesso.it/src/pages/chi-siamo.html
// /project/src/pages/permesso-lavoro-subordinato/index.html -> https://sospermesso.it/src/pages/permesso-lavoro-subordinato/index.html
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual sitemap creation | Auto-generated from file system | Standard practice | Never miss new pages |
| Google Search Console only | robots.txt + Search Console | Always recommended | Faster discovery by all engines |
| Include all HTML files | Exclude redirects, error pages | SEO best practice | Cleaner crawl, better indexing |

**Deprecated/outdated:**
- `<changefreq>` and `<priority>` tags: Google ignores these (per John Mueller), but including doesn't hurt
- Sitemap index files: Only needed for 50,000+ URLs, not relevant for 260 pages

## Open Questions

1. **Should 404.html be in sitemap?**
   - What we know: 404 pages typically excluded from sitemaps
   - What's unclear: Site has custom 404.html, might want it indexed as help page
   - Recommendation: Exclude - 404 pages shouldn't be indexed

2. **Should subdirectory index.html files have special treatment?**
   - What we know: `permesso-lavoro-subordinato/index.html` exists
   - What's unclear: Whether URL should end with `/` or `/index.html`
   - Recommendation: Include as-is (`/index.html`) - matches actual file structure

3. **Build integration with Netlify?**
   - What we know: netlify.toml has `npm run build:docs` as build command
   - What's unclear: Should sitemap generation be part of build or separate?
   - Recommendation: Add `build:sitemap` script, chain in main build if desired

## Sources

### Primary (HIGH confidence)
- [sitemaps.org/protocol.html](https://www.sitemaps.org/protocol.html) - Official XML sitemap specification
- [Google Developers - Create robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt) - Official robots.txt guide
- Existing codebase: `scripts/build-documents.js` - Project's Node.js patterns

### Secondary (MEDIUM confidence)
- [Max Schmitt - Sitemap XML Node.js](https://maxschmitt.me/posts/sitemap-xml-node-js) - Simple XML generation approach
- [sitemap.js GitHub](https://github.com/ekalinin/sitemap.js/) - Sitemap npm package documentation

### Tertiary (LOW confidence)
- WebSearch results for SEO best practices - Verified against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - XML generation is simple, well-documented
- Architecture: HIGH - File system scanning is straightforward Node.js
- Pitfalls: HIGH - Based on official SEO documentation and existing codebase patterns

**Project-specific findings:**
- Site URL: `https://sospermesso.it` (found in `scripts/templates/*.js`)
- Total HTML files: 262
- Redirect pages: ~38 (detected by `meta http-equiv="refresh"`)
- Exclude: NOTION_WEBSITE/, 404.html
- Subdirectories: `src/pages/permesso-lavoro-subordinato/` contains variant pages

**Research date:** 2026-01-31
**Valid until:** 90 days (SEO standards are stable)
