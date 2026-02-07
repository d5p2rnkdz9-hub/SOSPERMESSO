# Phase 39: Document Pages - Research

**Researched:** 2026-02-07
**Domain:** 11ty Data Files + Liquid Templates for Notion-Powered Document Page Generation
**Confidence:** HIGH

## Summary

This phase migrates document page generation from standalone Node.js scripts to 11ty's native data file + template system. Currently, `scripts/build-documents.js` fetches Notion data and generates 62+ HTML pages using JavaScript template functions (`primo.js`, `rinnovo.js`). The goal is to move this logic into 11ty's build pipeline so document pages are generated automatically during `npm run build:11ty` instead of requiring a separate `npm run build:docs` step.

The migration follows the established pattern from v3.0: convert imperative JavaScript generation to declarative 11ty configuration. The existing Notion client (`notion-client.js`) remains unchanged, but data fetching moves to `_data/documents.js` which exports an async function. Template logic from `primo.js` and `rinnovo.js` converts to Liquid templates using pagination to generate one page per document type. Helper functions (linking to dizionario, HTML escaping, document notes parsing) will need to be adapted as Liquid filters or included in the data object.

**Primary recommendation:** Create `_data/documents.js` exporting async function that returns array of document objects, create `documents-primo.liquid` and `documents-rinnovo.liquid` templates using pagination with `size: 1`, convert template helpers to Liquid filters via 11ty config.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @11ty/eleventy | 3.1.2 | Static site generator | Already installed, project standard |
| @notionhq/client | 5.8.0 | Notion API integration | Already used for documents and permits |
| liquidjs | (via 11ty) | Template language | Project standard (v3.0 decision) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | 17.2.3 | Environment variables | Notion API key access |
| Node.js built-ins | - | fs, path for slug-map | Always |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 11ty data files | Keep standalone scripts | 11ty integration eliminates build step duplication |
| Liquid templates | Nunjucks | Project uses Liquid (Nunjucks unmaintained since 2022) |
| Liquid filters | Shortcodes | Filters are standard for data transformation |

**Installation:**
No new dependencies required. All libraries already installed.

## Architecture Patterns

### Recommended Project Structure

```
_data/
├── documents.js              # Notion data fetcher (new)
├── site.js                   # Existing site config
├── nav.js                    # Existing nav data
└── footer.js                 # Existing footer data

_includes/
├── layouts/
│   ├── base.liquid           # Existing base layout
│   └── document.liquid       # New document-specific layout (optional)
└── filters/
    ├── dizionario-link.js    # New filter for dizionario linking
    ├── parse-doc-notes.js    # New filter for parsing Notion notes
    └── normalize-doc.js      # New filter for document name cleanup

src/pages/
├── documents-primo.liquid    # Template for primo pages
└── documents-rinnovo.liquid  # Template for rinnovo pages

scripts/
├── notion-client.js          # KEEP - reused by _data/documents.js
├── templates/
│   ├── helpers.js            # ADAPT - extract to 11ty filters
│   ├── primo.js              # REPLACE - becomes Liquid template
│   └── rinnovo.js            # REPLACE - becomes Liquid template
└── slug-map.json             # KEEP - used for redirect generation
```

### Pattern 1: Async Data File with Notion Integration

**What:** 11ty data file that fetches from Notion API at build time
**When to use:** All Notion-powered content generation
**Example:**

```javascript
// _data/documents.js
const { fetchPermitData } = require('../scripts/notion-client.js');

module.exports = async function() {
  const permits = await fetchPermitData();

  // Transform Notion data into format suitable for pagination
  const documents = [];

  for (const permit of permits) {
    if (permit.primoDocuments && permit.primoDocuments.length > 0) {
      documents.push({
        slug: permit.slug,
        tipo: permit.tipo,
        type: 'primo',
        documents: permit.primoDocuments,
        method: permit.primoMethod,
        docNotes: permit.docNotes
      });
    }

    if (permit.rinnovoDocuments && permit.rinnovoDocuments.length > 0) {
      documents.push({
        slug: permit.slug,
        tipo: permit.tipo,
        type: 'rinnovo',
        documents: permit.rinnovoDocuments,
        method: permit.rinnovoMethod,
        docNotes: permit.docNotes
      });
    }
  }

  return documents;
};
```

**Source:** [11ty JavaScript Data Files](https://www.11ty.dev/docs/data-js/)

### Pattern 2: Pagination for One Page Per Item

**What:** Use 11ty pagination with `size: 1` to generate individual pages
**When to use:** Creating separate pages for each data item
**Example:**

```liquid
---
pagination:
  data: documents
  size: 1
  alias: doc
permalink: "src/pages/documenti-{{ doc.slug }}-{{ doc.type }}.html"
layout: layouts/base.liquid
---

<!-- Template content uses {{ doc.slug }}, {{ doc.tipo }}, etc. -->
```

**Source:** [11ty Create Pages From Data](https://www.11ty.dev/docs/pages-from-data/)

### Pattern 3: Liquid Filters for Template Logic

**What:** Register custom filters in 11ty config for data transformation
**When to use:** Converting JavaScript template helpers to Liquid-compatible functions
**Example:**

```javascript
// eleventy.config.mjs
export default function(eleventyConfig) {
  // Add Liquid filter for dizionario linking
  eleventyConfig.addLiquidFilter("dizionarioLink", function(documentName) {
    // Reuse existing linkToDizionario logic
    const { linkToDizionario } = require('./scripts/templates/helpers.js');
    return linkToDizionario(documentName);
  });

  // Add filter for parsing document notes
  eleventyConfig.addLiquidFilter("parseDocNotes", function(notesText) {
    const { parseDocNotes } = require('./scripts/templates/helpers.js');
    return parseDocNotes(notesText);
  });

  // Universal filters work in all template languages
  eleventyConfig.addFilter("escapeHtml", function(str) {
    // HTML escape implementation
  });
}
```

**Source:** [11ty Filters Documentation](https://www.11ty.dev/docs/filters/)

### Pattern 4: Redirect Page Generation via Pagination

**What:** Generate redirect pages for URL aliases using pagination
**When to use:** Creating meta refresh redirects for display slugs
**Example:**

```javascript
// _data/documentRedirects.js
const slugMap = require('../scripts/slug-map.json');

module.exports = function() {
  const redirects = [];

  for (const [displaySlug, canonicalSlug] of Object.entries(slugMap.mappings)) {
    redirects.push({
      displaySlug,
      canonicalSlug,
      type: 'primo'
    });
    redirects.push({
      displaySlug,
      canonicalSlug,
      type: 'rinnovo'
    });
  }

  return redirects;
};
```

```liquid
---
pagination:
  data: documentRedirects
  size: 1
  alias: redirect
permalink: "src/pages/documenti-{{ redirect.displaySlug }}-{{ redirect.type }}.html"
---
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=documenti-{{ redirect.canonicalSlug }}-{{ redirect.type }}.html">
  <title>Redirecting...</title>
</head>
<body>
  <p>Reindirizzamento in corso...</p>
</body>
</html>
```

### Anti-Patterns to Avoid

- **Don't fetch Notion data in templates:** Data fetching must happen in `_data/*.js` files, not during template rendering (performance and caching)
- **Don't use synchronous file operations in data files:** 11ty expects async functions; use promises/async-await
- **Don't duplicate helper logic:** Extract once to filters, don't copy-paste between templates
- **Don't generate full HTML in data files:** Data files should return data objects, not HTML strings (separation of concerns)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| One page per data item | Loop + fs.writeFile | 11ty pagination with size: 1 | 11ty handles permalinks, collections, watch mode automatically |
| HTML escaping | Manual .replace() chains | Use existing escapeHtml helper | Edge cases like quotes in attributes |
| Dizionario term matching | Simple string search | Existing linkToDizionario logic | Handles overlapping terms, word boundaries |
| Document name normalization | Basic string manipulation | Existing normalizeDocumentName | Handles edge cases like "4fototessere" |
| Parsing Notion note formats | Split by newline | Existing parseDocNotes function | Handles 3 different Notion formatting patterns |

**Key insight:** The existing `scripts/templates/helpers.js` contains battle-tested logic for edge cases. Don't rewrite from scratch; adapt the existing functions to work as Liquid filters.

## Common Pitfalls

### Pitfall 1: Filter Return Value Escaping

**What goes wrong:** Liquid auto-escapes HTML by default, breaking links generated by filters
**Why it happens:** Liquid's default behavior is to escape for safety
**How to avoid:** Mark filter output as safe HTML or use `| safe` filter in template
**Warning signs:** Links appear as literal `&lt;a href=...&gt;` text instead of clickable links

**Solution:**
```liquid
<!-- Wrong: auto-escaped -->
{{ documentName | dizionarioLink }}

<!-- Correct: marked as safe HTML -->
{{ documentName | dizionarioLink | safe }}
```

### Pitfall 2: Data File Caching During Development

**What goes wrong:** Changes to Notion data don't appear during `eleventy --serve`
**Why it happens:** 11ty caches data files for performance; external API calls aren't watched
**How to avoid:** Restart dev server when Notion content changes, or implement cache invalidation
**Warning signs:** Old document lists persist despite Notion updates

**Solution:** Document clearly that Notion changes require dev server restart, or implement time-based cache invalidation in `_data/documents.js`.

### Pitfall 3: CommonJS vs ES Modules Mismatch

**What goes wrong:** `require()` fails in data files or filters fail to import helpers
**Why it happens:** Project uses CommonJS (`package.json` has `"type": "commonjs"`) but 11ty config is ESM (`.mjs`)
**How to avoid:** Data files use `module.exports` and `require()`, 11ty config uses `import` with `.js` extension
**Warning signs:** `ERR_REQUIRE_ESM` or `require is not defined` errors

**Solution:** Keep data files as CommonJS (matches existing pattern from Phase 36), use dynamic `import()` in 11ty config if needed.

### Pitfall 4: Permalink Conflicts with Existing Pages

**What goes wrong:** Generated pages overwrite manually created pages with same filename
**Why it happens:** Pagination generates `documenti-{slug}-primo.html` at same path as existing static pages
**How to avoid:** Audit existing pages, remove static versions before enabling 11ty generation
**Warning signs:** Git shows generated pages as modified instead of new

**Solution:** Before Phase 39, verify that all `documenti-*-primo.html` and `documenti-*-rinnovo.html` in `src/pages/` are generated (not handwritten). Run audit script to compare.

### Pitfall 5: Checklist JavaScript Scope Issues

**What goes wrong:** LocalStorage persistence script fails because `slug` variable is undefined
**Why it happens:** Inline `<script>` blocks in templates don't have access to Liquid variables directly
**How to avoid:** Use data attributes or render variables into JavaScript strings carefully
**Warning signs:** Console error "slug is not defined" or checklist state doesn't persist

**Solution:**
```liquid
<!-- Wrong: Liquid variable not accessible in JS -->
<script>
  const permitKey = '{{ doc.slug }}-primo';  // Works only if properly escaped
</script>

<!-- Better: Use data attribute -->
<div class="doc-checklist" data-permit="{{ doc.slug }}-primo">
  <!-- JS reads from data-permit attribute -->
</div>
```

## Code Examples

Verified patterns from official sources:

### Notion Data Fetcher (Async)

```javascript
// _data/documents.js
// Source: 11ty docs + existing notion-client.js pattern
const { fetchPermitData } = require('../scripts/notion-client.js');

module.exports = async function() {
  console.log('Fetching document data from Notion...');

  const permits = await fetchPermitData();
  const documents = [];

  for (const permit of permits) {
    // Skip permits without slug
    if (!permit.slug) continue;

    // Generate primo document object
    if (permit.primoDocuments && permit.primoDocuments.length > 0) {
      documents.push({
        slug: permit.slug,
        tipo: permit.tipo,
        type: 'primo',
        documents: permit.primoDocuments,
        method: permit.primoMethod,
        docNotes: permit.docNotes,
        // Include last_edited_time for change detection
        lastEdited: permit.last_edited_time
      });
    }

    // Generate rinnovo document object
    if (permit.rinnovoDocuments && permit.rinnovoDocuments.length > 0) {
      documents.push({
        slug: permit.slug,
        tipo: permit.tipo,
        type: 'rinnovo',
        documents: permit.rinnovoDocuments,
        method: permit.rinnovoMethod,
        docNotes: permit.docNotes,
        lastEdited: permit.last_edited_time
      });
    }
  }

  console.log(`Generated ${documents.length} document page objects`);
  return documents;
};
```

### Liquid Template with Pagination

```liquid
---
# documents-primo.liquid
pagination:
  data: documents
  size: 1
  alias: doc
  filter:
    - type: primo
permalink: "src/pages/documenti-{{ doc.slug }}-primo.html"
layout: layouts/base.liquid
title: "Documenti {{ doc.tipo }} - Primo Rilascio"
lang: it
---

<!-- BREADCRUMB -->
<section class="section" style="padding: 1rem 0;">
  <div class="container" style="position: relative;">
    <div style="font-size: 0.875rem; color: var(--gray-medium);">
      <a href="../../index.html">Home</a> →
      <a href="documenti-questura.html">Documenti Questura</a> →
      <span>{{ doc.tipo }} - Primo Rilascio</span>
    </div>
  </div>
</section>

<!-- PAGE HEADER -->
<section class="section bg-off-white" style="padding: 1.5rem 0;">
  <div class="container">
    <div class="page-header text-center">
      <h1 class="page-title">{{ doc.tipo }}</h1>
      <p class="section-subtitle">Documenti per il <strong>Primo Rilascio</strong></p>
      <a href="documenti-{{ doc.slug }}-rinnovo.html" class="quick-switch-link">
        Vedi anche: Rinnovo →
      </a>
    </div>
  </div>
</section>

<!-- SUBMISSION METHOD CALLOUT -->
{%- assign isKit = false -%}
{%- if doc.method contains "kit" or doc.method contains "KIT" -%}
  {%- assign isKit = true -%}
{%- endif -%}

<section class="section" style="padding: 1rem 0;">
  <div class="container" style="max-width: 700px;">
    <div class="submission-callout {% if isKit %}callout-kit{% else %}callout-questura{% endif %}">
      <span class="callout-icon">{% if isKit %}📮{% else %}🏛️{% endif %}</span>
      <div class="callout-text">
        {% if isKit %}
          Invia tramite KIT alle Poste (non devi andare in Questura)
        {% else %}
          Porta i documenti in Questura (non puoi usare il KIT postale)
        {% endif %}
      </div>
    </div>
  </div>
</section>

<!-- DOCUMENT CHECKLIST -->
<section class="section">
  <div class="container" style="max-width: 700px;">
    <div class="card">
      <h2>📋 Documenti necessari</h2>
      <p class="checklist-intro">Spunta i documenti che hai già preparato.</p>

      <div class="doc-checklist" data-permit="{{ doc.slug }}-primo">
        {%- for document in doc.documents -%}
          <div class="doc-item">
            <input type="checkbox"
                   class="doc-checkbox"
                   id="doc-{{ doc.slug }}-primo-{{ forloop.index0 }}"
                   data-doc="{{ document | normalize_doc | escape }}">
            <span class="doc-label">{{ document | normalize_doc | dizionario_link | safe }}</span>
          </div>
        {%- endfor -%}
      </div>

      <div class="checklist-progress">
        <span class="progress-text">Completati: <span id="progress-count">0</span>/{{ doc.documents.size }}</span>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- INLINE SCRIPT FOR CHECKLIST PERSISTENCE -->
<script>
  // Read permit key from data attribute to avoid Liquid/JS scope issues
  (function() {
    const checklistEl = document.querySelector('.doc-checklist');
    const permitKey = checklistEl.getAttribute('data-permit');
    const checkboxes = document.querySelectorAll('.doc-checkbox');
    const progressCount = document.getElementById('progress-count');
    const progressFill = document.getElementById('progress-fill');

    function loadState() {
      const saved = localStorage.getItem('checklist-' + permitKey);
      if (saved) {
        const state = JSON.parse(saved);
        state.forEach(item => {
          const cb = document.getElementById(item.id);
          if (cb) cb.checked = item.checked;
        });
      }
      updateProgress();
    }

    function saveState() {
      const state = Array.from(checkboxes).map(cb => ({
        id: cb.id,
        checked: cb.checked
      }));
      localStorage.setItem('checklist-' + permitKey, JSON.stringify(state));
      updateProgress();
    }

    function updateProgress() {
      const total = checkboxes.length;
      const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
      progressCount.textContent = checked;
      progressFill.style.width = (total > 0 ? (checked / total) * 100 : 0) + '%';
    }

    checkboxes.forEach(cb => cb.addEventListener('change', saveState));
    document.addEventListener('DOMContentLoaded', loadState);
  })();
</script>
```

### Liquid Filter Registration

```javascript
// eleventy.config.mjs (add to existing config)
import { linkToDizionario, parseDocNotes, normalizeDocumentName, escapeHtml } from './scripts/templates/helpers.js';

export default function(eleventyConfig) {
  // Existing config...

  // Add Liquid filters for document page generation
  eleventyConfig.addLiquidFilter("dizionario_link", linkToDizionario);
  eleventyConfig.addLiquidFilter("parse_doc_notes", parseDocNotes);
  eleventyConfig.addLiquidFilter("normalize_doc", normalizeDocumentName);

  // Universal filters (work in all template languages)
  eleventyConfig.addFilter("escape", escapeHtml);

  // Existing config...
}
```

**Note:** Helper functions in `helpers.js` will need to be converted from CommonJS (`module.exports`) to ES modules (`export`) to work with the `.mjs` config file, OR use dynamic `import()` in the config.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Standalone build scripts | 11ty data files + templates | v3.0 (Phase 36-37) | Single build command, watch mode support |
| Imperative HTML generation | Declarative templates | v3.0 | Easier to maintain, better dev experience |
| Manual file writes | 11ty pagination | Phase 39 (this) | Automatic URL generation, collections support |
| Template functions in JS | Liquid templates + filters | Phase 39 (this) | Separation of data and presentation |

**Deprecated/outdated:**
- Standalone `npm run build:docs` — After Phase 39, this becomes part of `npm run build:11ty`
- Direct HTML string concatenation in template functions — Replaced by Liquid template rendering
- Separate script execution for documents and permits — Unified in 11ty build pipeline

## Open Questions

Things that couldn't be fully resolved:

1. **Filter performance with large datasets**
   - What we know: `linkToDizionario` does regex matching against all terms for every document name
   - What's unclear: Performance impact when generating 100+ pages with 10+ documents each
   - Recommendation: Profile during implementation; consider pre-processing links in data file if slow

2. **Handling Notion API rate limits**
   - What we know: Notion API has rate limits, data file fetches once per build
   - What's unclear: Whether pagination or watch mode triggers multiple fetches
   - Recommendation: Add request caching in `notion-client.js` with timestamp check (5 min cache)

3. **Redirect page template approach**
   - What we know: Two options - separate data file + template, or extend documents data with redirect flag
   - What's unclear: Which approach is cleaner for maintainability
   - Recommendation: Separate data file (`documentRedirects.js`) keeps concerns separate, easier to understand

4. **Development workflow for Notion changes**
   - What we know: Data files don't auto-reload when external content changes
   - What's unclear: Best UX for content editors updating Notion
   - Recommendation: Document requirement to restart dev server; consider future enhancement with watch file trigger

## Sources

### Primary (HIGH confidence)

- [11ty JavaScript Data Files](https://www.11ty.dev/docs/data-js/) - Data file async function pattern
- [11ty Create Pages From Data](https://www.11ty.dev/docs/pages-from-data/) - Pagination with size: 1
- [11ty Liquid Template Language](https://www.11ty.dev/docs/languages/liquid/) - Liquid syntax and filters
- [11ty Filters](https://www.11ty.dev/docs/filters/) - Filter registration API
- Existing codebase: `scripts/notion-client.js`, `scripts/templates/helpers.js`, `_data/nav.js` - Established patterns

### Secondary (MEDIUM confidence)

- [Using Eleventy's JavaScript Data Files](https://bryanlrobinson.com/blog/using-eleventys-javascript-data-files/) - Community best practices (2020, still relevant)
- Project Phase 37 research - Precedent for bulk page migration patterns

### Tertiary (LOW confidence)

- None - all findings verified with official documentation or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture: HIGH - Official 11ty patterns + existing project precedent
- Pitfalls: HIGH - Based on official docs and common 11ty gotchas documented in community

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable ecosystem, 11ty v3.x is current stable)

---

**Key Takeaway for Planner:**

This is a straightforward migration of working logic to 11ty-native patterns. The hard work (Notion fetching, template logic, helper functions) already exists and works. The task is primarily about:

1. Moving data fetching from script to `_data/documents.js`
2. Converting JavaScript template strings to Liquid templates
3. Registering helper functions as Liquid filters
4. Letting 11ty's pagination generate the pages

Low risk because:
- No new external dependencies
- Existing logic is battle-tested (62 pages generated successfully)
- Can be developed incrementally (keep old script until new approach validated)
- URL structure unchanged (same filenames and paths)
