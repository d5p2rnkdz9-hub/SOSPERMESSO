# Phase 20: Batch Translation Pipeline - Research

**Researched:** 2026-02-01
**Domain:** AI-powered HTML translation with structure preservation
**Confidence:** HIGH

## Summary

This phase involves translating 208 HTML pages from Italian to English using AI, with glossary enforcement, HTML structure preservation, and automatic path updates. The research covers three key domains: (1) AI translation APIs and batch processing, (2) HTML structure preservation patterns, and (3) glossary/terminology management.

The recommended approach uses the **Anthropic Claude API with Message Batches** for 50% cost savings, combined with a Node.js build script that follows established patterns from the existing `build-permits.js` and `build-documents.js` scripts. The existing POC assets (4 translated pages, glossary, verification script) provide a solid foundation.

**Primary recommendation:** Use Anthropic's Message Batches API with Claude Sonnet 4.5 for cost-effective batch translation, processing pages in chunks of 50-100 with structured output for HTML preservation, followed by glossary post-processing and the existing verification script.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/sdk | ^0.37+ | Claude API client for Node.js | Official SDK, TypeScript support, batch API built-in |
| cheerio | ^1.0.0 | HTML parsing/manipulation | Fast, jQuery-like API, preserves structure |
| Node.js fs/promises | Built-in | Async file operations | Already used in existing build scripts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| p-limit | ^5.0.0 | Concurrency control | Rate limiting API calls |
| cli-progress | ^3.12.0 | Progress display | User feedback during batch processing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Claude Sonnet 4.5 | Claude Haiku 4.5 | Haiku is cheaper ($0.50/$2.50 vs $1.50/$7.50 batch pricing) but may produce lower quality translations |
| Anthropic Batches API | Real-time API | Real-time is faster but 2x cost, no batch discount |
| cheerio | jsdom | jsdom is more complete but slower, heavier |

**Installation:**
```bash
npm install @anthropic-ai/sdk cheerio p-limit cli-progress
```

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── translate-batch.js          # Main translation script (npm run translate:en)
├── translation-glossary.json   # Existing glossary (35+ terms)
├── translation-manifest.json   # Track completed translations
├── verify-translation.js       # Existing verification script
└── templates/
    └── translation-prompt.txt  # System prompt for Claude
en/
├── index.html                  # Translated homepage
└── src/
    └── pages/                  # All 208 translated pages
        ├── database.html
        ├── permesso-*.html
        └── documenti-*.html
```

### Pattern 1: Chunk-Based Batch Processing
**What:** Process pages in batches of 50-100 rather than all 208 at once
**When to use:** Always - prevents timeout issues, enables incremental progress
**Example:**
```javascript
// Source: Anthropic Batch API docs
const BATCH_SIZE = 50;

async function translateInBatches(pages) {
  const manifest = await loadManifest();

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const chunk = pages.slice(i, i + BATCH_SIZE);
    const requests = chunk
      .filter(page => needsTranslation(page, manifest))
      .map(page => ({
        custom_id: page.filename,
        params: {
          model: "claude-sonnet-4-5",
          max_tokens: 8192,
          system: TRANSLATION_SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildTranslationRequest(page) }]
        }
      }));

    if (requests.length === 0) continue;

    const batch = await anthropic.messages.batches.create({ requests });
    await pollForCompletion(batch.id);
    await processResults(batch.id, manifest);
  }
}
```

### Pattern 2: HTML Structure Preservation via Segmentation
**What:** Extract translatable text while preserving HTML structure
**When to use:** All page translations
**Example:**
```javascript
// Source: Project pattern based on cheerio best practices
const cheerio = require('cheerio');

function extractTranslatableContent(html) {
  const $ = cheerio.load(html);
  const segments = [];

  // Elements that contain translatable text
  const textElements = 'p, h1, h2, h3, h4, li, span, a, button, label, title, meta[name="description"]';

  $(textElements).each((i, el) => {
    const $el = $(el);
    // Skip elements with translate="no" attribute
    if ($el.attr('translate') === 'no') return;
    // Skip script/style content
    if ($el.parents('script, style').length) return;

    const text = $el.text().trim();
    if (text && text.length > 0) {
      segments.push({
        selector: getUniqueSelector($el),
        text: text,
        tagName: el.tagName,
        attributes: extractTranslatableAttributes($el)
      });
    }
  });

  return { $, segments };
}
```

### Pattern 3: Glossary Post-Processing
**What:** Apply glossary replacements after AI translation
**When to use:** After receiving translation, before writing file
**Example:**
```javascript
// Source: Existing translation-glossary.json pattern
function applyGlossary(translatedText, glossary) {
  let result = translatedText;

  // Apply term mappings (case-insensitive)
  for (const [italian, english] of Object.entries(glossary.terms)) {
    const regex = new RegExp(escapeRegex(italian), 'gi');
    result = result.replace(regex, english);
  }

  // Preserve "do not translate" terms
  for (const term of glossary.doNotTranslate) {
    // These should remain unchanged (already in correct form)
  }

  // Apply UI string mappings exactly
  for (const [italian, english] of Object.entries(glossary.uiStrings)) {
    result = result.replace(italian, english);
  }

  return result;
}
```

### Pattern 4: Link Path Transformation
**What:** Update internal links from IT paths to EN paths
**When to use:** All pages during translation
**Example:**
```javascript
// Source: Project requirement
function transformLinks($) {
  // Transform href attributes
  $('a[href]').each((i, el) => {
    const $el = $(el);
    const href = $el.attr('href');

    // Skip external links and anchors
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

    // Transform relative paths
    // src/pages/database.html -> database.html (already relative in EN)
    // ../../index.html -> ../../../en/index.html

    const transformed = transformPath(href);
    $el.attr('href', transformed);
  });

  // Transform image paths (adjust relative depth)
  $('img[src], link[href]').each((i, el) => {
    const $el = $(el);
    const attr = el.tagName === 'img' ? 'src' : 'href';
    const value = $el.attr(attr);

    if (value && value.startsWith('../')) {
      // Adjust path depth for /en/src/pages/ structure
      $el.attr(attr, adjustPathDepth(value));
    }
  });
}
```

### Anti-Patterns to Avoid
- **Translating entire HTML as string:** LLMs may corrupt HTML structure. Always segment and reassemble.
- **Ignoring rate limits:** Anthropic has batch limits (100k requests/batch, 256MB max). Chunk appropriately.
- **Missing manifest tracking:** Without tracking, re-runs waste API calls translating already-done pages.
- **Hardcoding paths:** EN pages need different relative paths - use transformation functions.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing | String regex | cheerio | Handles edge cases, preserves structure |
| Rate limiting | setTimeout loops | p-limit | Proper concurrency control, error handling |
| Glossary matching | Simple replace | Case-insensitive regex with word boundaries | Avoids partial matches (e.g., "permesso" in "permessoportuale") |
| Progress tracking | console.log | cli-progress | Better UX for long operations |
| Translation verification | Manual review | Existing verify-translation.js | Already catches common issues |

**Key insight:** HTML translation looks like string manipulation but requires DOM-aware processing. AI can translate text well but tends to corrupt HTML structure when given raw markup.

## Common Pitfalls

### Pitfall 1: HTML Structure Corruption
**What goes wrong:** AI adds/removes HTML tags, breaks nesting, or translates attributes
**Why it happens:** LLMs treat HTML as text, may "improve" or "fix" perceived issues
**How to avoid:**
- Extract text segments, translate segments only, reassemble
- Never send raw HTML to translate - send structured JSON with text content
- Validate tag counts before/after (existing verify script does this)
**Warning signs:** Tag count mismatch in verification, broken layouts

### Pitfall 2: Glossary Inconsistency
**What goes wrong:** Same term translated differently across pages
**Why it happens:** AI doesn't have memory across batch requests
**How to avoid:**
- Include glossary in system prompt for every request
- Apply glossary post-processing after AI translation
- Run verification script to check glossary compliance
**Warning signs:** verify-translation.js GLOSSARY warnings

### Pitfall 3: Broken Internal Links
**What goes wrong:** Links point to IT pages instead of EN pages, or paths are wrong
**Why it happens:** AI translates link text but not href, relative path depth changes
**How to avoid:**
- Programmatically transform all href/src attributes
- Test with actual link checking after translation
- EN pages are in /en/src/pages/ - one level deeper than IT
**Warning signs:** 404s in translated site, links to Italian pages

### Pitfall 4: Batch Timeout/Expiration
**What goes wrong:** Batch expires before completion, losing partial progress
**Why it happens:** Large batches or high system load, 24h limit
**How to avoid:**
- Use smaller batches (50-100 pages)
- Implement manifest to track completed translations
- Store intermediate results immediately on retrieval
**Warning signs:** `expired` results in batch response

### Pitfall 5: Missing lang Attribute
**What goes wrong:** Pages render with `lang="it"` instead of `lang="en"`
**Why it happens:** Forgetting to update the html element attribute
**How to avoid:** Explicitly set `$('html').attr('lang', 'en')` in transformation
**Warning signs:** verify-translation.js LANG error

### Pitfall 6: Untranslated UI Chrome
**What goes wrong:** Navigation, footer, breadcrumbs remain in Italian
**Why it happens:** Template elements not included in translation scope
**How to avoid:**
- Use glossary.uiStrings for all UI elements
- Include header/footer in translation scope
- Verify all sections have English content
**Warning signs:** Mixed language in final pages

## Code Examples

Verified patterns for implementation:

### Anthropic Batch API with TypeScript/Node.js
```javascript
// Source: https://platform.claude.com/docs/en/build-with-claude/batch-processing
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic();

// Create batch
const messageBatch = await anthropic.messages.batches.create({
  requests: [{
    custom_id: "permesso-studio.html",
    params: {
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: TRANSLATION_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: JSON.stringify(segments) }
      ]
    }
  }]
});

// Poll for completion
let batch;
while (true) {
  batch = await anthropic.messages.batches.retrieve(messageBatch.id);
  if (batch.processing_status === 'ended') break;
  await new Promise(r => setTimeout(r, 30000)); // 30s polling
}

// Stream results
for await (const result of await anthropic.messages.batches.results(batch.id)) {
  if (result.result.type === 'succeeded') {
    const translated = JSON.parse(result.result.message.content[0].text);
    await writeTranslatedPage(result.custom_id, translated);
    manifest[result.custom_id] = { completed: new Date().toISOString() };
  }
}
```

### System Prompt for Translation
```javascript
// Source: Best practices from translation workflow research
const TRANSLATION_SYSTEM_PROMPT = `You are a professional translator for a website about Italian residence permits (permessi di soggiorno).

TASK: Translate the provided Italian text segments to English.

RULES:
1. Translate ONLY the text content, preserve all structure keys
2. Use the following MANDATORY terminology:
${Object.entries(glossary.terms).map(([it, en]) => `   - "${it}" -> "${en}"`).join('\n')}

3. DO NOT translate these terms (keep as-is):
${glossary.doNotTranslate.map(t => `   - ${t}`).join('\n')}

4. For legal/bureaucratic terms, prioritize clarity over literal translation
5. Maintain the same tone: friendly, informative, accessible
6. Keep placeholders and variables unchanged (e.g., {name}, {{variable}})

OUTPUT: Return a JSON object with the same structure as input, with translated text values.`;
```

### HTML Segment Extraction with cheerio
```javascript
// Source: cheerio documentation + project patterns
const cheerio = require('cheerio');

function extractAndTranslate(htmlContent, filename) {
  const $ = cheerio.load(htmlContent, { decodeEntities: false });

  // Update lang attribute
  $('html').attr('lang', 'en');

  // Extract meta description
  const metaDesc = $('meta[name="description"]').attr('content');

  // Extract title
  const title = $('title').text();

  // Extract all text content with selectors
  const segments = [];

  // Header navigation
  $('.nav-link, .dropdown-link').each((i, el) => {
    segments.push({
      selector: `.nav-link:eq(${i})`,
      text: $(el).text().trim(),
      type: 'navigation'
    });
  });

  // Page content
  $('h1, h2, h3, p, li, .alert').each((i, el) => {
    const $el = $(el);
    if ($el.parents('nav, header, footer').length) return;

    segments.push({
      selector: generateSelector($el, i),
      html: $el.html(), // Preserve inner HTML for inline formatting
      type: 'content'
    });
  });

  return { $, segments, metaDesc, title };
}
```

### Manifest-Based Incremental Processing
```javascript
// Source: Existing build-permits.js pattern
const MANIFEST_PATH = path.join(__dirname, 'translation-manifest.json');

async function loadManifest() {
  try {
    const data = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function needsTranslation(page, manifest, forceRebuild = false) {
  if (forceRebuild) return true;

  const entry = manifest[page.filename];
  if (!entry) return true;

  // Re-translate if source changed
  const sourceModified = new Date(page.mtime);
  const lastTranslated = new Date(entry.translated);

  return sourceModified > lastTranslated;
}

async function saveManifest(manifest) {
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Translate API | LLM-based translation | 2024 | Better context awareness, terminology handling |
| Real-time API calls | Batch API | Oct 2024 | 50% cost reduction for non-urgent tasks |
| Manual glossary checks | Structured outputs + post-processing | 2025 | Guaranteed format, easier validation |
| Custom rate limiting | SDK built-in handling | 2025 | Less boilerplate, better reliability |

**Deprecated/outdated:**
- OpenAI Batch API: Still works but Anthropic batch API is more cost-effective for this use case
- Beta headers for structured outputs: Now GA, no header needed

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal batch size for this workload**
   - What we know: Max 100k requests/batch, 256MB limit
   - What's unclear: Sweet spot between API efficiency and error recovery
   - Recommendation: Start with 50 pages/batch, adjust based on actual performance

2. **Cache hit rates for batch translation**
   - What we know: 30-98% hit rate depending on patterns
   - What's unclear: Whether shared system prompt across 208 pages will cache
   - Recommendation: Include prompt caching markers, monitor actual rates

3. **Handling pages with complex nested HTML**
   - What we know: Some permit pages have deeply nested lists, tables
   - What's unclear: Best segmentation strategy for complex structures
   - Recommendation: Test with complex pages first, adjust extraction logic

## Sources

### Primary (HIGH confidence)
- [Anthropic Batch Processing Docs](https://platform.claude.com/docs/en/build-with-claude/batch-processing) - Batch API usage, pricing, TypeScript examples
- [Anthropic Structured Outputs Docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) - JSON schema constraints, SDK helpers
- Existing project scripts: `scripts/build-permits.js`, `scripts/verify-translation.js`
- Existing POC: `en/src/pages/permesso-studio.html` (working translated page)

### Secondary (MEDIUM confidence)
- [Pairaphrase: Consistency in Translations](https://www.pairaphrase.com/blog/achieve-consistency-in-translations) - Glossary management best practices
- [MDN: HTML translate attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/translate) - Native HTML translation hints
- [AbstractAPI: Best Translation APIs 2026](https://www.abstractapi.com/guides/other/best-translation-apis-for-developers) - API comparison

### Tertiary (LOW confidence)
- WebSearch results on batch processing patterns - general guidance, needs validation with actual implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Anthropic SDK, cheerio are well-documented and widely used
- Architecture: HIGH - Patterns derived from existing project scripts + official docs
- Pitfalls: HIGH - Based on existing verify-translation.js checks and common issues

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (API pricing/features may change)

## Cost Estimate

For 208 pages, estimated costs with Claude Sonnet 4.5 Batch API:

| Metric | Estimate |
|--------|----------|
| Avg input tokens/page | ~2,000 (HTML + system prompt) |
| Avg output tokens/page | ~1,500 (translated content) |
| Total input tokens | 416,000 |
| Total output tokens | 312,000 |
| Batch input cost | $0.62 (416k * $1.50/MTok) |
| Batch output cost | $2.34 (312k * $7.50/MTok) |
| **Total estimated cost** | **~$3.00** |

Note: Actual costs may vary. Prompt caching could reduce input costs by up to 90% for repeated system prompts.
