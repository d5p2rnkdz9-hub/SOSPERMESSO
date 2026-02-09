# Phase 40: Permit Pages - Research

**Researched:** 2026-02-09
**Domain:** 11ty Data Files + Liquid Templates for Notion-Powered Permit Page Generation with Q&A Parsing
**Confidence:** HIGH

## Summary

Phase 40 migrates permit page generation from standalone Node.js scripts to 11ty's native data file + template system. Currently, `scripts/build-permits.js` (936 lines) fetches permit data from Notion, parses complex Q&A content from page blocks, and generates 66+ `permesso-*.html` pages using JavaScript template functions in `scripts/templates/permesso.js`. The migration must preserve ALL existing functionality including:

1. Complex Q&A parsing logic (3 different Notion formatting styles)
2. Variant page detection and generation (parent/child pages for "a seguito di" patterns)
3. Content hashing for incremental builds
4. Emoji selection per permit type
5. Section border color assignment based on question keywords
6. Dictionary linking in content
7. HTML conversion from Notion rich_text with formatting preservation

Unlike Phase 39 (document pages) which had simple property data, permit pages require **fetching and parsing page block content from Notion** - significantly more API-intensive. The Q&A parsing logic is too complex for Liquid templates, so it must be moved to the data file where it can pre-parse content into HTML during build time.

**Primary recommendation:** Create `_data/permits.js` that fetches permit data, fetches page blocks for each permit, parses Q&A sections into structured HTML, and returns array of fully-parsed permit objects. Create `src/pages/permits.liquid` using pagination with `size: 1` and conditional logic for variant vs standard pages. The data file does the heavy lifting (parsing), the template does simple rendering.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @11ty/eleventy | 3.1.2 | Static site generator | Project standard, established in Phase 35 |
| @notionhq/client | 5.8.0 | Notion API integration | Already used, proven in Phase 39 |
| liquidjs | (via 11ty) | Template language | Project standard since v3.0 migration |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js crypto | built-in | MD5 hashing for incremental builds | Content change detection |
| dotenv | 17.2.3 | Environment variables | NOTION_API_KEY access |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Parsing in data file | Parse in template | Templates can't handle this complexity - Liquid isn't Turing-complete for nested Q&A parsing |
| 11ty data file | Keep standalone script | Breaks pattern established in Phase 39, requires separate build step |
| Single template | Separate templates for variants | Single template with conditionals is simpler, follows DRY |

**Installation:**
No new dependencies required. All libraries already installed.

## Architecture Patterns

### Recommended Project Structure

```
_data/
├── permits.js                    # NEW: Fetches permits + blocks, parses Q&A
├── documents.js                  # Existing from Phase 39
└── slugMap.js                    # Existing from Phase 39

src/pages/
├── permits.liquid                # NEW: Single template for all permit pages
├── documents-primo.liquid        # Existing from Phase 39
└── documents-rinnovo.liquid      # Existing from Phase 39

scripts/
├── notion-client.js              # KEEP: Reused by _data/permits.js
├── templates/
│   ├── helpers.js                # KEEP: Import into permits.js for parsing
│   ├── permesso.js               # DEPRECATE: Logic moves to permits.liquid
│   └── dizionario-map.json       # KEEP: Used by linkToDizionario
└── build-permits.js              # DEPRECATE: Replaced by 11ty pipeline

eleventy.config.mjs               # MODIFY: Add getSectionBorderColor filter
```

### Pattern 1: Heavy Data File with Pre-Parsing

**What:** Data file that does complex transformations, returns ready-to-render HTML
**When to use:** When parsing logic is too complex for template language
**Why:** Liquid templates are declarative - complex algorithmic logic belongs in JavaScript

**Example:**

```javascript
// _data/permits.js
const { fetchPermitData, fetchPageBlocks } = require('../scripts/notion-client.js');
const {
  parseQASections,
  linkToDizionario,
  escapeHtml
} = require('../scripts/templates/helpers.js');

module.exports = async function() {
  if (!process.env.NOTION_API_KEY) {
    console.warn('[permits.js] NOTION_API_KEY not set - returning empty array');
    return [];
  }

  const permits = await fetchPermitData();
  const parsed = [];

  for (const permit of permits) {
    if (!permit.tipo) continue;

    // Fetch page blocks (content) from Notion
    const blocks = await fetchPageBlocks(permit.id);

    // Parse Q&A sections (complex logic - 3 different formats)
    const sections = parseQASections(blocks);

    // Transform to HTML with dictionary linking
    const sectionsHtml = sections.map((section, index) => ({
      question: section.question,
      content: section.content, // Already HTML from parseQASections
      index: index
    }));

    parsed.push({
      id: permit.id,
      slug: permit.slug,
      tipo: permit.tipo,
      emoji: getEmojiForPermit(permit.tipo),
      subtitle: extractSubtitle(sections), // First answer
      sections: sectionsHtml,
      isVariant: detectIfVariant(permit.tipo),
      variantInfo: extractVariantInfo(permit.tipo)
    });

    // Rate limiting
    await delay(350);
  }

  return parsed;
};
```

**Source:** Phase 39 implementation pattern + [11ty JavaScript Data Files](https://www.11ty.dev/docs/data-js/)

**Key insight:** The data file becomes the "build script" - it orchestrates all the complex logic that used to live in `build-permits.js`. Templates just render the pre-parsed data.

### Pattern 2: Pagination with Conditional Template Logic

**What:** Single template handles both standard and variant pages with Liquid conditionals
**When to use:** Pages that share 80%+ structure but have small variations
**Why:** DRY principle - one source of truth, easier maintenance

**Example:**

```liquid
---
pagination:
  data: permits
  size: 1
  alias: permit
permalink: "src/pages/permesso-{{ permit.slug }}.html"
layout: layouts/base.liquid
eleventyExcludeFromCollections: true
---

<!-- BREADCRUMB -->
<div class="breadcrumb-bar">
  <div class="container">
    <div class="breadcrumb-content">
      <div class="breadcrumb-nav">
        <a href="../../index.html">Home</a> →
        <a href="database.html">Database</a> →
        <span>Permesso per {{ permit.tipo | escapeHtml }}</span>
      </div>
      <a href="https://form.typeform.com/to/FsqvzdXI#page_url={{ permit.slug }}"
         class="error-report-btn" target="_blank">
        🚨 Segnala errore
      </a>
    </div>
  </div>
</div>

<!-- PAGE HEADER -->
<section class="section bg-off-white">
  <div class="container">
    <div class="page-header text-center">
      <span class="page-icon" style="font-size: 4rem;">{{ permit.emoji }}</span>
      <h1 class="page-title">Permesso per {{ permit.tipo | escapeHtml }}</h1>
    </div>
  </div>
</section>

{% if permit.isVariantParent %}
  <!-- VARIANT PARENT: Show links to child variants -->
  <section class="section">
    <div class="container">
      <h2>Quale situazione ti interessa?</h2>
      <div class="grid grid-2">
        {% for variant in permit.variants %}
          <a href="permesso-{{ variant.slug }}.html" class="card card-link">
            <h3>{{ variant.variantName }}</h3>
          </a>
        {% endfor %}
      </div>
    </div>
  </section>
{% else %}
  <!-- STANDARD/VARIANT CHILD: Show Q&A sections -->
  <section class="section">
    <div class="container" style="max-width: 900px;">

      <!-- Document CTA -->
      <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
        <a href="documenti-{{ permit.slug }}-primo.html" class="btn btn-primary">
          Documenti per il primo rilascio
        </a>
        <a href="documenti-{{ permit.slug }}-rinnovo.html" class="btn btn-rinnovo">
          Documenti per il rinnovo
        </a>
      </div>

      <!-- Q&A Sections -->
      {% for section in permit.sections %}
        <div class="card" style="margin-bottom: 2rem; border-left: 4px solid {{ section.index | getSectionBorderColor: section.question }};">
          <h2>{{ section.question | escapeHtml }}</h2>
          {{ section.content }}
        </div>
      {% endfor %}

    </div>
  </section>
{% endif %}

<!-- FOOTER, RELATED LINKS, etc. -->
```

**Source:** [11ty Pagination](https://www.11ty.dev/docs/pagination/)

### Pattern 3: Rate Limiting in Async Data Files

**What:** Add delays between Notion API calls to respect rate limits
**When to use:** Any data file making multiple API calls
**Why:** Notion API has rate limits (3 requests/second), need to avoid 429 errors

**Example:**

```javascript
// _data/permits.js
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function() {
  const permits = await fetchPermitData();
  const results = [];

  for (const permit of permits) {
    const blocks = await fetchPageBlocks(permit.id);
    // ... process blocks
    results.push(processed);

    // Rate limit: 350ms delay = ~2.85 requests/second
    await delay(350);
  }

  return results;
};
```

**Source:** Phase 39 pattern + current build-permits.js implementation

**Key insight:** Don't parallelize Notion API calls with Promise.all() - sequential with delays is safer and avoids rate limit errors.

### Pattern 4: Variant Detection in Data File

**What:** Detect "X a seguito di Y" patterns and group variants in data file
**When to use:** Content has parent/child relationships that affect rendering
**Why:** Template logic stays simple - data file handles the complex detection

**Example:**

```javascript
// _data/permits.js

function detectVariants(permits) {
  const groups = {};
  const standalone = [];

  for (const permit of permits) {
    const match = permit.tipo.match(/^(.+?)\s+a\s+seguito\s+di\s+(.+)$/i);

    if (match) {
      const baseName = match[1].trim();
      if (!groups[baseName]) groups[baseName] = [];
      groups[baseName].push({
        ...permit,
        baseName,
        variantName: match[2].trim()
      });
    } else {
      standalone.push(permit);
    }
  }

  // Convert groups to variant objects
  const variantParents = Object.entries(groups)
    .filter(([_, variants]) => variants.length >= 2)
    .map(([baseName, variants]) => ({
      slug: slugify(baseName),
      tipo: baseName,
      isVariantParent: true,
      variants: variants
    }));

  // Variant children + standalones
  const variantChildren = Object.values(groups)
    .flat()
    .map(v => ({ ...v, isVariantChild: true }));

  return [...standalone, ...variantParents, ...variantChildren];
}
```

**Source:** Current build-permits.js lines 386-435

**Key insight:** Variant "parent" pages are synthetic - they don't have Notion content, just links to children. Data file creates these synthetic objects.

### Anti-Patterns to Avoid

- **Don't parse Q&A in templates:** Liquid can't handle the complexity (3 different formats, nested logic)
- **Don't make templates fetch from Notion:** Data files are for data fetching, templates are for rendering
- **Don't parallelize Notion API calls:** Rate limits will bite you
- **Don't split into multiple templates:** Variant vs standard pages share 95% structure - one template with conditionals is cleaner

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Q&A parsing from Notion | New parser | Existing parseQASections() | Handles 3 different Q&A formats, edge cases tested |
| Notion rich_text to HTML | Simple loop | Existing richTextToHtml() | Handles bold, italic, links, checkmarks, dictionary linking |
| List grouping | Render one at a time | Existing groupAndRenderBlocks() | Groups consecutive bullets/numbers under single ul/ol |
| Dictionary linking | String replace | Existing linkToDizionario() | Uses dizionario-map.json, handles overlapping terms |
| Emoji selection | Manual mapping | Existing getEmojiForPermit() | 9 keyword patterns, fallback logic |
| Section colors | Random colors | Existing getSectionBorderColor() | Matches by keywords first, fallback by index |

**Key insight:** The current build-permits.js (936 lines) and permesso.js template (300+ lines) represent **2+ years of edge case handling**. Don't rebuild from scratch - migrate the logic.

**Example of complexity:**

```javascript
// Q&A parsing handles 3 formats:
// 1. heading_3 = question
// 2. Paragraph with bold first segment ending in ?
// 3. Inline bold question in paragraph (answer in same paragraph)

// Format 3 requires special handling:
if (block.type === 'paragraph') {
  const richText = block.paragraph?.rich_text || [];
  if (richText.length > 1 || (richText.length === 1 && !richText[0].annotations?.bold)) {
    // There's content after the question in this block
    currentContent.push({ ...block, _skipQuestion: true });
  }
}
```

This level of edge case handling took iteration to get right. Reuse it.

## Common Pitfalls

### Pitfall 1: Trying to Parse Q&A in Templates

**What goes wrong:** Template becomes 500+ lines of nested conditionals and loops, unreadable and buggy

**Why it happens:** Notion Q&A has 3 different formats (heading_3, bold paragraph, inline bold), list grouping, nested children, formatting preservation - this is algorithmic logic

**How to avoid:**
- Parse Q&A in data file using existing `parseQASections()` function
- Return pre-rendered HTML in data object
- Template just renders the HTML with `{{ section.content }}` (no parsing)

**Warning signs:**
- Template file over 200 lines
- More than 3 levels of nested {% for %} loops
- Duplicated logic between sections

### Pitfall 2: Not Handling Variant Parent Pages Specially

**What goes wrong:** Variant parent pages try to fetch Notion content that doesn't exist, build fails or shows empty pages

**Why it happens:** Variant parents are synthetic - "Lavoro subordinato" page is hand-crafted, not generated from Notion

**How to avoid:**
- Detect variants in data file with `detectVariants()` logic
- Mark parent pages with `isVariantParent: true`
- Template uses `{% if permit.isVariantParent %}` to show links instead of Q&A
- Don't fetch page blocks for variant parents

**Warning signs:**
- Variant parent pages missing or showing errors
- Variant detection returns 0 groups but you know variants exist
- Build tries to fetch blocks for parent pages that have no Notion content

### Pitfall 3: Forgetting Rate Limiting

**What goes wrong:** First 20 permits build fine, then Notion API returns 429 errors and build fails halfway through

**Why it happens:** Notion API rate limit is 3 requests/second. With 66 permits × 2 API calls (permit data + page blocks) = 132 calls, you'll hit rate limits without delays

**How to avoid:**
- Add 350ms delay between permit processing (2.85 req/s, safe margin)
- Use sequential processing (for loop), not parallel (Promise.all)
- Log progress every 10 permits so you know if build stalls

**Warning signs:**
- Build fails after processing ~20 permits
- Error messages contain "rate limit" or "429"
- Some permits build, some don't (non-deterministic failures)

### Pitfall 4: URL Mismatch with Current Pages

**What goes wrong:** New generated pages have different URLs than current pages, breaking all inbound links

**Why it happens:** Current pages use exact slugified permit names including full variant text: `permesso-lavoro-subordinato-a-seguito-di-conversione-da-altro-permesso.html`

**How to avoid:**
- Use full slugified permit name in permalink: `permesso-{{ permit.slug }}.html`
- Don't create subfolder structure like `permesso-lavoro-subordinato/conversione.html`
- Test: Compare generated URLs against existing files in src/pages/permesso-*.html
- Verify: `ls src/pages/permesso-*.html | wc -l` should match permit count

**Warning signs:**
- Generated pages land in different directory
- URLs contain extra path segments
- Search engines show 404s for old URLs

### Pitfall 5: Not Preserving Existing Page Content

**What goes wrong:** Pages that had hand-crafted content (like variant parents) lose their custom sections when migration completes

**Why it happens:** Assuming all pages come from Notion - but variant parent "Lavoro subordinato" page has custom explanatory text not in database

**How to avoid:**
- Identify hand-crafted pages before migration (check git history)
- For variant parents, preserve the hand-crafted introduction text
- Consider hybrid approach: variant parent template has static content, variant children pull from Notion
- Document which pages have special handling

**Warning signs:**
- Variant parent page looks too plain after migration
- User complaints about missing information
- Page has less content than before

## Code Examples

Verified patterns from existing implementation:

### Example 1: Data File Structure

```javascript
// _data/permits.js
const { Client } = require("@notionhq/client");
const {
  parseQASections,
  linkToDizionario,
  escapeHtml,
  richTextToHtml
} = require('../scripts/templates/helpers.js');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = "1ad7355e-7f7f-8088-a065-e814c92e2cfd";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getEmojiForPermit(tipo) {
  if (!tipo) return '📄';
  const t = tipo.toLowerCase();

  if (t.includes('studio')) return '📖';
  if (t.includes('lavoro subordinato') || t.includes('lavoro autonomo')) return '💼';
  if (t.includes('protezione') || t.includes('asilo')) return '🛡️';
  if (t.includes('famiglia') || t.includes('ricongiungimento')) return '👨‍👩‍👧‍👦';
  if (t.includes('medic') || t.includes('cure')) return '🏥';

  return '📄';
}

module.exports = async function() {
  if (!process.env.NOTION_API_KEY) {
    console.warn('[permits.js] NOTION_API_KEY not set - returning empty array');
    return [];
  }

  try {
    // Fetch all permit pages from Notion
    const allPages = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await notion.search({
        filter: { property: 'object', value: 'page' },
        start_cursor: startCursor,
        page_size: 100
      });

      const dbPages = response.results.filter(page =>
        page.parent?.database_id === DATABASE_ID
      );
      allPages.push(...dbPages);

      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    console.log(`[permits.js] Fetched ${allPages.length} permit pages from Notion`);

    // Process each permit
    const permits = [];
    let processedCount = 0;

    for (const page of allPages) {
      const tipo = page.properties["Nome permesso"]?.title?.[0]?.plain_text || null;
      if (!tipo) continue;

      const slug = slugify(tipo);

      // Fetch page blocks (content)
      const blocks = await fetchPageBlocks(page.id);

      // Parse Q&A sections
      const sections = parseQASections(blocks);

      permits.push({
        id: page.id,
        slug: slug,
        tipo: tipo,
        emoji: getEmojiForPermit(tipo),
        subtitle: sections.length > 0 ? extractPlainText(sections[0].content) : '',
        sections: sections.map((s, index) => ({
          question: s.question,
          content: s.content, // Already HTML
          index: index
        })),
        last_edited_time: page.last_edited_time
      });

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`[permits.js] Processed ${processedCount}/${allPages.length} permits`);
      }

      // Rate limiting: 350ms = ~2.85 requests/second
      await delay(350);
    }

    // Detect variants
    const withVariants = detectVariants(permits);

    console.log(`[permits.js] Prepared ${withVariants.length} permit pages (including ${withVariants.filter(p => p.isVariantParent).length} variant parents)`);

    return withVariants;

  } catch (error) {
    console.error(`[permits.js] Notion fetch failed: ${error.message}`);
    console.warn('[permits.js] Returning empty array (graceful degradation)');
    return [];
  }
};
```

**Source:** Adapted from scripts/build-permits.js and _data/documents.js

### Example 2: Template with Variant Conditional

```liquid
---
pagination:
  data: permits
  size: 1
  alias: permit
permalink: "src/pages/permesso-{{ permit.slug }}.html"
layout: layouts/base.liquid
title: "Permesso per {{ permit.tipo }}"
lang: it
eleventyExcludeFromCollections: true
---

<!-- BREADCRUMB -->
<div class="breadcrumb-bar">
  <div class="container">
    <div class="breadcrumb-content">
      <div class="breadcrumb-nav">
        <a href="../../index.html">Home</a> →
        <a href="database.html">Database</a> →
        <span>Permesso per {{ permit.tipo | escapeHtml }}</span>
      </div>
      <a href="https://form.typeform.com/to/FsqvzdXI#page_url=https%3A%2F%2Fsospermesso.it%2Fsrc%2Fpages%2Fpermesso-{{ permit.slug }}.html"
         class="error-report-btn" target="_blank" rel="noopener noreferrer">
        🚨 Segnala errore
      </a>
    </div>
  </div>
</div>

<!-- PAGE HEADER -->
<section class="section bg-off-white">
  <div class="container">
    <div class="page-header text-center">
      <span class="page-icon" style="font-size: 4rem;">{{ permit.emoji }}</span>
      <h1 class="page-title">Permesso per {{ permit.tipo | escapeHtml }}</h1>
    </div>
  </div>
</section>

{% if permit.isVariantParent %}
  <!-- VARIANT PARENT PAGE: Show variant selection -->
  <section class="section">
    <div class="container" style="max-width: 900px;">
      <div class="card" style="margin-bottom: 2rem;">
        <h2>Quando posso avere un permesso per {{ permit.baseName | downcase }}?</h2>
        <p>Puoi ottenere questo permesso in diverse situazioni. Scegli quella che ti riguarda:</p>
      </div>
    </div>
  </section>

  <section class="section bg-off-white">
    <div class="container">
      <h2 class="text-center mb-lg">Quale situazione ti interessa?</h2>
      <div class="grid grid-2" style="max-width: 800px; margin: 0 auto;">
        {% for variant in permit.variants %}
          <a href="permesso-{{ variant.slug }}.html" class="card card-link">
            <span class="card-icon">{{ variant.emoji }}</span>
            <h3 class="card-title">{{ variant.variantName | escapeHtml }}</h3>
          </a>
        {% endfor %}
      </div>
    </div>
  </section>

{% else %}
  <!-- STANDARD/VARIANT CHILD PAGE: Show document CTAs and Q&A -->

  <!-- DOCUMENT CTA -->
  <section class="section" style="padding: 1.5rem 0;">
    <div class="container" style="max-width: 900px;">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
        <a href="documenti-{{ permit.slug }}-primo.html" class="btn btn-primary">
          Documenti per il primo rilascio
        </a>
        <a href="documenti-{{ permit.slug }}-rinnovo.html" class="btn btn-rinnovo">
          Documenti per il rinnovo
        </a>
      </div>
    </div>
  </section>

  <!-- CONTENT -->
  <section class="section">
    <div class="container" style="max-width: 900px;">

      {% for section in permit.sections %}
        <!-- Section {{ forloop.index }}: {{ section.question }} -->
        <div class="card" style="margin-bottom: 2rem; border-left: 4px solid {{ section.index | getSectionBorderColor: section.question }};">
          <h2>{{ section.question | escapeHtml }}</h2>
          {{ section.content }}
        </div>
      {% endfor %}

      <!-- CTA -->
      <div class="alert alert-info">
        <span class="alert-icon">❓</span>
        <div>
          Hai altre domande sul permesso per {{ permit.tipo | escapeHtml }}?
          <button onclick="openContactModal()" class="btn btn-primary btn-sm" style="margin-left: 0; margin-top: 0.5rem;">
            Scrivici
          </button>
        </div>
      </div>

    </div>
  </section>
{% endif %}

<!-- RELATED -->
<section class="section bg-off-white">
  <div class="container">
    <h2 class="text-center mb-lg">Potrebbero interessarti anche</h2>
    <div class="grid grid-3">
      <a href="database.html" class="card card-link card-compact">
        <span class="card-icon">📚</span>
        <h3 class="card-title">Tutti i permessi</h3>
      </a>
      <a href="documenti-questura.html" class="card card-link card-compact">
        <span class="card-icon">📋</span>
        <h3 class="card-title">Documenti Questura</h3>
      </a>
      <a href="dizionario.html" class="card card-link card-compact">
        <span class="card-icon">📖</span>
        <h3 class="card-title">Dizionario</h3>
      </a>
    </div>
  </div>
</section>

<!-- Contact Form Container -->
<div id="contact-form-container"></div>

<script>
  // Load contact form
  fetch('../components/contact-form.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contact-form-container').innerHTML = html;
    });
</script>
```

**Source:** Adapted from current permesso-studio.html and permesso-lavoro-subordinato.html

### Example 3: Register getSectionBorderColor Filter

```javascript
// eleventy.config.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const helpers = require('./scripts/templates/helpers.js');

export default function(eleventyConfig) {
  // ... existing filters ...

  /**
   * getSectionBorderColor - Return border color based on section index and question
   * Usage: {{ index | getSectionBorderColor: question }}
   */
  eleventyConfig.addFilter("getSectionBorderColor", function(index, question) {
    const q = (question || '').toLowerCase();

    // Match by keywords first
    if (q.includes("cos'è") || q.includes("che cos'è")) return 'var(--accent-blue)';
    if (q.includes('requisiti') || q.includes('chi può')) return 'var(--taxi-yellow)';
    if (q.includes('lavorare') || q.includes('diritti')) return 'var(--lighthouse-red)';
    if (q.includes('conversione') || q.includes('convertire')) return 'var(--accent-teal)';
    if (q.includes('durata') || q.includes('quanto dura')) return 'var(--accent-blue)';
    if (q.includes('costi') || q.includes('quanto costa')) return 'var(--accent-orange)';

    // Fallback by index for variety
    const colors = [
      'var(--accent-blue)',
      'var(--taxi-yellow)',
      'var(--lighthouse-red)',
      'var(--accent-teal)',
      'var(--accent-purple)',
      'var(--accent-orange)'
    ];
    return colors[index % colors.length];
  });

  // ... rest of config ...
}
```

**Source:** Adapted from scripts/templates/permesso.js lines 14-46

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Standalone script (build-permits.js) | 11ty data file + template | Phase 40 | Unified build pipeline, one less build step |
| JavaScript template functions | Liquid templates | v3.0 (Phase 35) | Declarative templates, easier for non-devs |
| Separate build:docs step | Single build command | Phase 39-40 | Simpler deployment, faster iteration |
| Manual page generation | Pagination-based generation | Phase 39-40 | Automatic URL generation, consistent structure |

**Deprecated/outdated:**
- **scripts/build-permits.js**: Logic migrates to _data/permits.js + src/pages/permits.liquid
- **scripts/templates/permesso.js**: Template functions become Liquid template
- **Separate npm run build:docs**: Replaced by npm run build (11ty handles both documents and permits)

**Not deprecated (still needed):**
- **scripts/notion-client.js**: Reused by _data/permits.js
- **scripts/templates/helpers.js**: Imported by _data/permits.js for Q&A parsing
- **scripts/templates/dizionario-map.json**: Used by linkToDizionario function

## Open Questions

Things that couldn't be fully resolved:

1. **Should variant parent pages be in data file or static?**
   - What we know: Current variant parent pages (e.g., permesso-lavoro-subordinato.html) have hand-crafted intro text not in Notion
   - What's unclear: Should we preserve this static content, or generate minimal parents from data file?
   - Recommendation: Generate minimal parents from data file (just variant links). If users complain about missing context, we can add static intro text to template with {% if permit.slug == 'lavoro-subordinato' %} conditions

2. **How to handle incremental builds with content hashing?**
   - What we know: Current build-permits.js uses manifest.json to track content hashes, only rebuilds changed permits
   - What's unclear: 11ty data files run on every build - can't easily skip fetching unchanged permits
   - Recommendation: Accept that permits rebuild every time (like documents in Phase 39). With rate limiting (350ms delay), 66 permits = ~23 seconds of API calls, acceptable for build time. If this becomes a problem, investigate 11ty's fetch caching or custom manifest logic

3. **Should we generate English permit pages in this phase?**
   - What we know: Phase 39 only generated Italian pages, English translation is separate phase
   - What's unclear: Should permits.js return both IT and EN data, or just IT for now?
   - Recommendation: Start with IT only (matching Phase 39 pattern). English generation will be separate phase after translation infrastructure is established

## Sources

### Primary (HIGH confidence)

- [11ty Pagination Documentation](https://www.11ty.dev/docs/pagination/) - Pagination with size:1 and alias
- [11ty JavaScript Data Files](https://www.11ty.dev/docs/data-js/) - Async data files, module.exports pattern
- [11ty Create Pages From Data](https://www.11ty.dev/docs/pages-from-data/) - Generating individual pages from arrays
- Current codebase files:
  - `scripts/build-permits.js` (936 lines) - Current implementation logic
  - `scripts/notion-client.js` - Notion API patterns (fetchPermitData, fetchPageBlocks)
  - `scripts/templates/permesso.js` - Current template logic
  - `scripts/templates/helpers.js` - Q&A parsing, HTML conversion, dictionary linking
  - `_data/documents.js` - Phase 39 established pattern for async Notion data files
  - `src/pages/documents-primo.liquid` - Phase 39 pagination template pattern
  - `.planning/phases/39-document-pages/39-01-SUMMARY.md` - Phase 39 decisions and patterns

### Secondary (MEDIUM confidence)

- [11ty Performance Documentation](https://www.11ty.dev/docs/performance/) - Build optimization strategies
- [11ty CommonJS, ESM, TypeScript](https://www.11ty.dev/docs/cjs-esm/) - Module format compatibility
- [Eleventy v3 Update Guide](https://mxb.dev/blog/eleventy-v3-update/) - v3 migration patterns (verified against current setup)

### Tertiary (LOW confidence)

- GitHub issues about pagination with global data files - Community discussions, not official docs
- Blog posts about 11ty data transformation - Helpful but not authoritative for this specific use case

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, proven in Phase 39
- Architecture: HIGH - Patterns established in Phase 39 (async data files, pagination, filters)
- Q&A parsing logic: HIGH - Existing implementation is well-tested, just needs migration
- Variant detection: HIGH - Logic exists in build-permits.js, well-understood
- Template structure: MEDIUM - Combining standard + variant pages in one template is new, but conditionals are straightforward
- Build performance: MEDIUM - Rate limiting strategy proven, but total build time with 66 permits untested

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days - 11ty v3 is stable, Notion API stable, no major changes expected)

**Key uncertainties:**
- Exact build time with 66 permits + block fetching (estimate: 23-30 seconds of API calls + parsing)
- Whether Notion rate limits will require adjustment from 350ms delay
- Whether single template with conditionals handles all variant edge cases cleanly

**Validation needed during implementation:**
- Test with NOTION_API_KEY to verify actual API call patterns
- Compare generated URLs against existing src/pages/permesso-*.html files
- Verify Q&A parsing produces identical HTML to current pages
- Test variant parent/child page rendering
