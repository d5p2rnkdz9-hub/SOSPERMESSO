# Phase 2: Document Templates - Research

**Researched:** 2026-01-25
**Domain:** Build-time static site generation with Notion API, HTML templating, localStorage persistence
**Confidence:** MEDIUM-HIGH

## Summary

Phase 2 requires creating two document page templates (primo rilascio and rinnovo) that pull content from Notion API at build time to generate 46 static HTML pages. The research focused on: (1) Node.js build script architecture for fetching from Notion and generating HTML, (2) localStorage patterns for checklist persistence, and (3) print-friendly CSS best practices.

**Key findings:**
- Project currently has no build process (no package.json, no npm scripts) — needs to be initialized
- Notion Official JavaScript SDK (`@notionhq/client`) is the standard for API integration
- Simple Node.js script with template literals is sufficient for generating static HTML (no need for heavy frameworks)
- localStorage with JSON.stringify/parse is standard for persisting checkbox state
- Print CSS via `@media print` should hide interactive elements and optimize for paper

**Primary recommendation:** Create lightweight Node.js build script using official Notion SDK to fetch database content and generate static HTML pages using template literals. Store Notion API key as Netlify environment variable. Implement localStorage checklist with print-friendly CSS.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @notionhq/client | Latest (3.x) | Official Notion API SDK | Maintained by Notion team, handles authentication, provides type-safe database queries |
| Node.js | 18+ LTS | Build script runtime | Already available on Netlify, no additional dependencies needed |
| dotenv | ^16.0.0 | Environment variable management | Industry standard for .env file handling during local development |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fs/promises | Built-in | File system operations | Writing generated HTML files to disk |
| path | Built-in | Path manipulation | Ensuring correct file paths across platforms |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @notionhq/client | Custom fetch calls | Official SDK handles auth, pagination, error codes; custom approach requires reimplementing |
| Template literals | EJS/Handlebars | Template engine adds dependency; template literals sufficient for 2-page template |
| Node.js script | Next.js/Gatsby | Heavy frameworks overkill for simple static generation; project is vanilla HTML/CSS/JS |

**Installation:**
```bash
npm init -y
npm install @notionhq/client dotenv
```

## Architecture Patterns

### Recommended Project Structure
```
Sito_Nuovo/
├── package.json              # Node.js dependencies
├── .env                      # Local development (gitignored)
├── netlify.toml              # Netlify build configuration
├── scripts/
│   ├── build-documents.js    # Main build script
│   ├── notion-client.js      # Notion API wrapper
│   └── templates/
│       ├── primo.js          # Primo rilascio template
│       └── rinnovo.js        # Rinnovo template
└── src/pages/
    └── documenti-*.html      # Generated files (46 total)
```

### Pattern 1: Notion Database Query
**What:** Fetch all records from Notion database with property filtering
**When to use:** At build time to retrieve document lists and submission methods
**Example:**
```javascript
// Source: https://www.npmjs.com/package/@notionhq/client
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const response = await notion.databases.query({
  database_id: "1ad7355e-7f7f-80bc-b445-000b881c6c80",
  filter: {
    property: "Tipo",
    select: {
      equals: "Studio"
    }
  }
});

// Access properties
const primoDocuments = response.results[0].properties["Doc primo rilascio"].multi_select;
const rinnovoDocuments = response.results[0].properties["Doc rinnovo"].multi_select;
const submissionMethod = response.results[0].properties["Mod primo rilascio"].select.name;
```

### Pattern 2: HTML Generation with Template Literals
**What:** Use JavaScript tagged template literals to generate complete HTML pages
**When to use:** For simple static page generation without complex component hierarchy
**Example:**
```javascript
// Source: https://wesbos.com/template-strings-html
function generateDocumentPage(permitType, releaseType, data) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documenti ${permitType} - ${releaseType} - SOS Permesso</title>
  <!-- CSS links same as existing pages -->
  <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
  ${generateHeader()}
  ${generateBreadcrumb(permitType, releaseType)}
  ${generateContent(data)}
  ${generateFooter()}
</body>
</html>`;
}

// Write to file
const fs = require('fs/promises');
const path = require('path');

await fs.writeFile(
  path.join(__dirname, '../src/pages', `documenti-${slug}-${type}.html`),
  html,
  'utf-8'
);
```

### Pattern 3: localStorage Checklist Persistence
**What:** Save checkbox state to localStorage, restore on page load
**When to use:** For user-facing checklist pages where progress should persist across sessions
**Example:**
```javascript
// Source: https://blog.logrocket.com/localstorage-javascript-complete-guide/
// Save state on checkbox change
function handleCheckboxChange(event) {
  const permitType = 'studio-primo';
  const checkboxes = Array.from(document.querySelectorAll('.doc-checkbox'))
    .map(cb => ({ id: cb.id, checked: cb.checked }));

  localStorage.setItem(`checklist-${permitType}`, JSON.stringify(checkboxes));
}

// Restore state on page load
function restoreChecklistState() {
  const permitType = 'studio-primo';
  const saved = localStorage.getItem(`checklist-${permitType}`);

  if (saved) {
    const state = JSON.parse(saved);
    state.forEach(item => {
      const checkbox = document.getElementById(item.id);
      if (checkbox) checkbox.checked = item.checked;
    });
  }
}

document.addEventListener('DOMContentLoaded', restoreChecklistState);
```

### Pattern 4: Print-Friendly CSS
**What:** Hide interactive elements, optimize typography for print
**When to use:** Any page intended to be printed (checklists, document lists)
**Example:**
```css
/* Source: https://www.jotform.com/blog/css-perfect-print-stylesheet-98272/ */
@media print {
  /* Hide non-essential elements */
  header, footer, .breadcrumb, .btn, .checkbox {
    display: none !important;
  }

  /* Optimize layout for paper */
  body {
    width: 100%;
    margin: 0;
    padding: 0;
    font-size: 12pt;
    line-height: 1.4;
    color: #000;
    background: #fff;
  }

  /* Ensure content fits on page */
  .container {
    max-width: 100%;
    margin: 0;
    padding: 1cm;
  }

  /* Keep list items together */
  .doc-item {
    page-break-inside: avoid;
  }

  /* Show URLs for links */
  a[href^="http"]:after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
  }
}
```

### Anti-Patterns to Avoid
- **Client-side API calls:** Don't fetch from Notion API in browser — Notion image URLs expire after 1 hour, causing 404s in static sites
- **Hardcoding content in templates:** Don't manually update 46 HTML files — use build script to regenerate from single source of truth
- **Mixing build output with source:** Don't commit generated HTML to git — add to .gitignore, regenerate on deploy
- **Complex state management:** Don't use React/Vue for simple checkboxes — vanilla JavaScript localStorage is sufficient

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Notion API authentication | Custom auth headers | @notionhq/client | Handles token management, error codes (APIErrorCode), pagination, retries |
| Database pagination | Manual cursor logic | SDK's iteratePaginatedAPI | Notion limits to 100 results per query; SDK handles automatic pagination |
| HTML escaping | String replacement regex | Native escapeHtml or template literal safety | Prevents XSS; regex misses edge cases (nested quotes, unicode) |
| Environment variables | Reading .env manually | dotenv package | Handles parsing, type coercion, comments, multiline values |
| Path joining | String concatenation | path.join() | Cross-platform compatibility (Windows vs Unix slashes) |

**Key insight:** Notion API has subtle complexity (pagination, property type handling, error codes). Official SDK has solved these problems; reimplementing risks bugs and maintenance burden.

## Common Pitfalls

### Pitfall 1: Notion Image URL Expiration
**What goes wrong:** Notion-hosted images (like cover images or file uploads) return short-lived URLs that expire after ~1 hour. Static pages show 404s for images.
**Why it happens:** Notion's API returns signed S3 URLs for security; they're not meant for long-term storage.
**How to avoid:** Either (1) don't use Notion-hosted images in templates, or (2) download images during build and host them yourself.
**Warning signs:** Images work immediately after build but break after an hour.

### Pitfall 2: Multi-select Property Access
**What goes wrong:** Notion multi-select properties return an array of objects, not a simple string array. Accessing `.name` incorrectly causes undefined errors.
**Why it happens:** Notion API structure: `properties["Field Name"].multi_select` is `[{id, name, color}, ...]`
**How to avoid:** Map over array: `properties["Doc primo rilascio"].multi_select.map(item => item.name)`
**Warning signs:** TypeError: Cannot read property 'name' of undefined in build script.

### Pitfall 3: localStorage Size Limits
**What goes wrong:** localStorage has 5-10MB limit per domain. Storing large amounts of data silently fails or throws QuotaExceededError.
**Why it happens:** Browsers enforce storage quotas; checklist state with 52 items × 23 permits could approach limits if naively stored.
**How to avoid:** Store only necessary data (checkbox IDs and state, not full document text). Use compression or IndexedDB for larger needs.
**Warning signs:** Checkbox state not persisting on some browsers; QuotaExceededError in console.

### Pitfall 4: Print CSS Checkbox Rendering
**What goes wrong:** Browser print CSS can't render checkbox state (`checked` attribute doesn't show visually in print).
**Why it happens:** Print media removes interactivity; checkboxes render as empty boxes regardless of state.
**How to avoid:** Use CSS `::before` pseudo-element with `content` to show checkmark: `input:checked::before { content: "✓"; }`
**Warning signs:** User checks items, prints page, all boxes appear unchecked.

### Pitfall 5: Breadcrumb and Link Path Issues
**What goes wrong:** Generated pages link to `database.html` and `dizionario.html` with wrong relative paths, causing 404s.
**Why it happens:** All generated pages are in `src/pages/` at same level, but copying templates might have inconsistent paths.
**How to avoid:** Use consistent relative paths in templates: `database.html` not `../database.html` since all pages are siblings.
**Warning signs:** Generated pages can't navigate back to database or link to dictionary terms.

## Code Examples

Verified patterns from official sources:

### Complete Build Script Structure
```javascript
// scripts/build-documents.js
// Source: Composite of Notion SDK examples and Node.js best practices
const { Client } = require("@notionhq/client");
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = "1ad7355e-7f7f-80bc-b445-000b881c6c80";

async function fetchPermitData() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID
  });

  return response.results.map(page => ({
    id: page.id,
    tipo: page.properties.Tipo?.select?.name,
    slug: page.properties.Slug?.rich_text?.[0]?.plain_text,
    primoDocuments: page.properties["Doc primo rilascio"]?.multi_select?.map(d => d.name) || [],
    rinnovoDocuments: page.properties["Doc rinnovo"]?.multi_select?.map(d => d.name) || [],
    primoMethod: page.properties["Mod primo rilascio"]?.select?.name,
    rinnovoMethod: page.properties["Mod rinnovo"]?.select?.name,
  }));
}

async function generatePages() {
  const permits = await fetchPermitData();

  for (const permit of permits) {
    if (permit.slug && permit.primoDocuments.length > 0) {
      const primoHtml = generatePrimoTemplate(permit);
      await writeFile(`documenti-${permit.slug}-primo.html`, primoHtml);
    }

    if (permit.slug && permit.rinnovoDocuments.length > 0) {
      const rinnovoHtml = generateRinnovoTemplate(permit);
      await writeFile(`documenti-${permit.slug}-rinnovo.html`, rinnovoHtml);
    }
  }

  console.log(`Generated ${permits.length * 2} document pages`);
}

async function writeFile(filename, content) {
  const filepath = path.join(__dirname, '../src/pages', filename);
  await fs.writeFile(filepath, content, 'utf-8');
}

generatePages().catch(console.error);
```

### Netlify Build Configuration
```toml
# netlify.toml
# Source: https://docs.netlify.com/build/configure-builds/file-based-configuration/
[build]
  command = "node scripts/build-documents.js"
  publish = "."

[build.environment]
  NODE_VERSION = "18"
```

### Dizionario Link Matching
```javascript
// scripts/notion-client.js - Helper function
// Matches document names against dizionario terms and generates anchor links
function linkToDizionario(documentName) {
  // Mapping of document names to dizionario anchor IDs
  const dizionarioMap = {
    "Certificato idoneità alloggiativa": "idoneita-alloggiativa",
    "Marca da bollo": "marca-bollo",
    "Kit postale": "kit-postale",
    "Passaporto": "passaporto",
    // ... more mappings from dizionario.html
  };

  const anchorId = dizionarioMap[documentName];
  return anchorId
    ? `<a href="dizionario.html#${anchorId}" class="doc-link">${documentName}</a>`
    : documentName;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual HTML editing | Build-time generation from Notion | 2020+ (Jamstack era) | Single source of truth; content updates don't require code changes |
| Client-side Notion API | Build-time static generation | 2021+ | Faster page loads; no CORS issues; no expired image URLs |
| Heavy frameworks (Gatsby, Next.js) | Lightweight Node scripts | 2023+ | Simpler toolchain; faster builds for small sites (<100 pages) |
| Session storage | localStorage | Always preferred | Persists across sessions; better UX for long-form tasks |

**Deprecated/outdated:**
- **Notion API v1:** Deprecated in favor of official public API (2021). Don't use unofficial notion-api-worker or scraping libraries.
- **document.write() for dynamic content:** XSS risk, blocks parsing. Use template literals and textContent/innerHTML selectively.

## Open Questions

Things that couldn't be fully resolved:

1. **Dizionario anchor ID standardization**
   - What we know: dizionario.html exists with terms but may lack `id` attributes on term headers
   - What's unclear: Whether all document names from Notion exactly match dizionario term names
   - Recommendation: During Phase 2 planning, audit dizionario.html for `id` attributes; create mapping table for Notion document names → dizionario IDs

2. **Notion field certainty/highlighting**
   - What we know: CONTEXT.md specifies yellow highlighting for disputed documents ("potrebbe dipendere dalla Questura")
   - What's unclear: Whether Notion database has a field to mark documents as "disputed" or if this is hardcoded knowledge
   - Recommendation: Check Notion database schema; if no field exists, defer to Phase 3 or maintain a hardcoded list in build script

3. **Build trigger on Notion changes**
   - What we know: Netlify can rebuild site on webhook or manual trigger
   - What's unclear: How to automatically detect Notion database changes and trigger rebuild
   - Recommendation: Start with manual rebuild workflow; add Notion webhook integration in future iteration if needed

## Sources

### Primary (HIGH confidence)
- [@notionhq/client npm package](https://www.npmjs.com/package/@notionhq/client) - Official SDK documentation
- [Notion API Developer Docs](https://developers.notion.com/docs/getting-started) - Authentication and database query patterns
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - localStorage API reference
- [MDN: CSS Printing](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing) - Print media query guide
- [Netlify: Build Environment Variables](https://docs.netlify.com/build/configure-builds/environment-variables/) - Environment variable configuration

### Secondary (MEDIUM confidence)
- [LogRocket: localStorage in JavaScript complete guide](https://blog.logrocket.com/localstorage-javascript-complete-guide/) - Best practices for localStorage with checkboxes
- [Jotform: CSS Perfect Print Stylesheet](https://www.jotform.com/blog/css-perfect-print-stylesheet-98272/) - Print CSS patterns
- [Wes Bos: Template Strings HTML](https://wesbos.com/template-strings-html) - Template literal patterns for HTML generation
- [Twilio Blog: Notion Database with Node.js](https://www.twilio.com/blog/manipulate-notion-database-using-node-js) - Multi-select property access examples

### Tertiary (LOW confidence)
- Web search results for "Notion static site generation" - General ecosystem patterns, needs verification with official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official SDK is well-documented, Node.js is project standard
- Architecture: MEDIUM-HIGH - Template literal approach verified in examples, but Phase 2-specific template structure needs user input
- Pitfalls: MEDIUM - Common issues documented in blogs/forums, but project-specific gotchas unknown until implementation
- localStorage patterns: HIGH - Standard browser API, well-documented patterns
- Print CSS: HIGH - Established best practices with browser support

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - Notion API and browser APIs are stable)
