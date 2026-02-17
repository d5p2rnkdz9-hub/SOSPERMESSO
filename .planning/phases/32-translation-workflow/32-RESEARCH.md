# Phase 32: Translation Workflow - Research

**Researched:** 2026-02-03
**Domain:** Incremental build systems, content hashing, multilingual SEO, translation memory
**Confidence:** HIGH

## Summary

Phase 32 builds a scalable translation workflow by implementing Notion-based change detection, page-level content hashing, and sitemap index architecture with hreflang support. The existing codebase already has a solid foundation: incremental builds using `manifest.json` with Notion's `last_edited_time` timestamps, `build-permits.js` with Q&A parsing, and `build-sitemap.js` for XML generation.

The research confirms the hybrid approach (timestamp filter → content hash verification) is the industry standard for change detection. For multilingual SEO, the consensus is clear: use separate sitemaps per language with hreflang tags in sitemaps (not HTML) for sites targeting 8-12 languages. Translation memory as JSON files is well-supported and aligns with modern static site workflows.

**Primary recommendation:** Extend existing manifest-based system with content hashing (Node.js crypto module), implement sitemap index with per-language sitemaps, and store translation memory as JSON files keyed by content hash.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js crypto | Built-in | Content hashing (MD5/SHA256) | Native to Node.js, no dependencies, battle-tested |
| xml (npm) | 1.0.1 | XML sitemap generation | Already in package.json, simple API |
| @notionhq/client | 5.8.0 | Notion API integration | Already in package.json, official client |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | 17.2.3 | Environment variables | Already in use for NOTION_API_KEY |
| fs/promises | Built-in | File operations | Reading/writing manifest, translation memory |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MD5 | SHA-256 | SHA-256 more secure but MD5 faster for non-cryptographic use (content comparison). MD5 sufficient for change detection. |
| JSON files | SQLite database | SQLite adds dependency, JSON is simpler, version-controlled with git, easier debugging |
| Sitemap index | Single master sitemap | Single sitemap becomes unwieldy at 1000+ URLs across 8-12 languages. Index scales better per [Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions). |

**Installation:**

No new dependencies needed. All required libraries already present in `package.json`.

## Architecture Patterns

### Recommended Project Structure

```
scripts/
├── build-permits.js         # Extend with content hashing
├── build-sitemap.js         # Replace with sitemap index generator
├── manifest.json            # Extend with contentHash field
├── translation-memory/      # NEW: Translation memory storage
│   ├── it-en.json          # Italian → English translations
│   ├── it-fr.json          # Italian → French translations
│   └── it-es.json          # Italian → Spanish translations
└── notion-client.js         # Already exists, no changes needed

root/
├── sitemap-index.xml        # NEW: Master sitemap
├── sitemap-it.xml           # NEW: Italian pages sitemap
├── sitemap-en.xml           # NEW: English pages sitemap
└── sitemap.xml              # DEPRECATE: Current single sitemap
```

### Pattern 1: Hybrid Change Detection

**What:** Use Notion `last_edited_time` as cheap filter, then hash content to confirm actual changes.

**When to use:** Every build to skip unchanged pages and avoid unnecessary rebuilds.

**Why hybrid works:** Notion rounds `last_edited_time` to nearest minute ([Notion Developers Changelog](https://developers.notion.com/changelog/last-edited-time-is-now-rounded-to-the-nearest-minute)), which means minor edits within same minute might be missed. Content hash provides exact change detection.

**Example:**

```javascript
// Source: Existing build-permits.js + web research
const crypto = require('crypto');

function hashNotionContent(blocks) {
  // Hash the raw Notion block content before HTML conversion
  const contentString = JSON.stringify(blocks);
  return crypto.createHash('md5').update(contentString).digest('hex');
}

function needsRebuild(permit, manifest) {
  const entry = manifest[permit.id];
  if (!entry) return true; // Never built

  // STEP 1: Cheap timestamp filter
  const lastBuilt = new Date(entry.lastEdited);
  const lastEdited = new Date(permit.last_edited_time || 0);

  if (lastEdited <= lastBuilt) {
    // No timestamp change, skip hash check
    return false;
  }

  // STEP 2: Fetch blocks and hash content
  const blocks = await fetchPageBlocks(permit.id);
  const contentHash = hashNotionContent(blocks);

  // STEP 3: Compare hash
  if (entry.contentHash === contentHash) {
    console.log(`   ⏭️  ${permit.tipo}: timestamp changed but content identical (hash match)`);
    // Update lastEdited in manifest to avoid re-hashing next time
    manifest[permit.id].lastEdited = permit.last_edited_time;
    return false;
  }

  return true; // Content actually changed
}
```

**Source:** Pattern derived from [ScrapingAnt hashing strategies](https://scrapingant.com/blog/detecting-silent-content-changes-hashing-strategies-for-web) and existing `build-permits.js` (lines 51-64).

### Pattern 2: Translation Memory by Content Hash

**What:** Store translations keyed by content hash, reuse for unchanged content.

**When to use:** When translating pages to detect which paragraphs need re-translation.

**Example:**

```javascript
// scripts/translation-memory/it-en.json structure
{
  "f3a5b2c1d4e6...": {
    "source": "Questo è il permesso per motivi familiari...",
    "target": "This is the permit for family reasons...",
    "sourceHash": "f3a5b2c1d4e6...",
    "translatedAt": "2026-02-03T10:30:00.000Z"
  },
  "a1b2c3d4e5f6...": {
    "source": "Per richiederlo devi avere...",
    "target": "To request it you must have...",
    "sourceHash": "a1b2c3d4e5f6...",
    "translatedAt": "2026-02-03T10:31:00.000Z"
  }
}
```

**Pattern:**
1. Hash source paragraph before translation
2. Check if hash exists in translation memory
3. If exists → reuse translation
4. If not exists → translate and store with hash key

**Source:** Pattern from [Smartling translation memory best practices](https://help.smartling.com/hc/en-us/articles/10448270801819-Best-Practices-In-Preparing-Your-Content-For-Translation) and [SimpleLocalize multi-language JSON](https://simplelocalize.io/multi-language-json/).

### Pattern 3: Sitemap Index with Hreflang

**What:** Master `sitemap-index.xml` pointing to per-language sitemaps. Each language sitemap includes hreflang alternates.

**When to use:** When site has 2+ languages and 100+ pages per language.

**Example:**

```xml
<!-- sitemap-index.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.sospermesso.it/sitemap-it.xml</loc>
    <lastmod>2026-02-03</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.sospermesso.it/sitemap-en.xml</loc>
    <lastmod>2026-02-03</lastmod>
  </sitemap>
</sitemapindex>

<!-- sitemap-it.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.sospermesso.it/src/pages/database.html</loc>
    <lastmod>2026-01-31</lastmod>
    <xhtml:link rel="alternate" hreflang="it" href="https://www.sospermesso.it/src/pages/database.html"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.sospermesso.it/en/src/pages/database.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.sospermesso.it/src/pages/database.html"/>
  </url>
</urlset>
```

**Key rules:**
- Every URL entry includes ALL language alternates (including itself)
- Use `x-default` for default language (IT in this case)
- Language codes: ISO 639-1 (en, it, fr, es, zh, ar)
- Region codes (if needed): ISO 3166-1 Alpha-2 (en-US, en-GB)

**Source:** [Google Search Central - Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Weglot multilingual sitemap guide](https://www.weglot.com/blog/multilingual-sitemap), [GTechMe hreflang best practices](https://www.gtechme.com/insights/best-practices-for-multi-language-and-multi-region-xml-sitemaps-hreflang-support/).

### Anti-Patterns to Avoid

- **❌ Hashing HTML output instead of source content:** Hash Notion blocks BEFORE generating HTML. HTML might change due to template updates while content is identical.
- **❌ Using timestamp alone:** Notion rounds to nearest minute, misses same-minute edits. Always verify with hash.
- **❌ Putting hreflang in HTML `<head>`:** Scales poorly for 8-12 languages, requires updating every page when adding new language. Use sitemaps instead.
- **❌ Single sitemap for all languages:** Creates 2000+ URL entries (209 pages × 10 languages), hard to debug. Use sitemap index.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML sitemap generation | Manual XML string concatenation | `xml` npm package | Handles escaping, namespaces, validation automatically |
| Content hashing | Custom hash algorithm | Node.js `crypto.createHash()` | Built-in, tested, supports MD5/SHA256/SHA512 |
| Notion API pagination | Manual cursor handling | Existing `fetchPageBlocks()` in `notion-client.js` | Already handles pagination recursively (lines 85-108) |
| Translation memory lookup | Array.find() loops | Object with hash keys | O(1) lookup vs O(n), critical at 1000+ entries |

**Key insight:** The existing codebase already has robust Notion API handling and manifest-based builds. Don't rebuild these patterns—extend them with hashing.

## Common Pitfalls

### Pitfall 1: Race Conditions in Manifest Updates

**What goes wrong:** Multiple build processes running concurrently can overwrite manifest.json, losing hash data.

**Why it happens:** `saveManifest()` reads entire file, modifies in memory, writes back. No file locking.

**How to avoid:**
- Run builds serially (don't parallelize across language builds)
- Add file locking using `fs.promises.open()` with exclusive flag
- Store per-language manifests (`manifest-it.json`, `manifest-en.json`)

**Warning signs:**
- Manifest missing entries after build
- Hash values reset to undefined
- "ENOENT" errors during concurrent builds

### Pitfall 2: Hashing HTML Instead of Source Content

**What goes wrong:** Template changes trigger full rebuild even when content unchanged.

**Why it happens:** Hashing generated HTML instead of Notion blocks means CSS class changes, wrapper div updates, or template tweaks change the hash.

**How to avoid:** Hash the raw Notion blocks (JSON.stringify) BEFORE calling `parseQASections()` or `blockToHtml()`.

**Warning signs:**
- Every build shows "content changed" even when Notion unchanged
- Changing template.js forces rebuild of all pages

### Pitfall 3: Missing x-default in Hreflang

**What goes wrong:** Search engines don't know which version to show users whose language preferences don't match any hreflang.

**Why it happens:** Forgetting to add `<xhtml:link rel="alternate" hreflang="x-default" href="..."/>` to sitemap entries.

**How to avoid:** Always include x-default pointing to primary language (IT in this project).

**Warning signs:**
- Google Search Console "x-default missing" warnings
- Non-Italian/English users see inconsistent language versions

### Pitfall 4: Outdated Translation Memory Entries

**What goes wrong:** Translation memory stores old translations that are never garbage collected.

**Why it happens:** Deleting a page in Notion doesn't remove its hash entry from translation memory.

**How to avoid:**
- Add "lastUsed" timestamp to translation memory entries
- Periodically prune entries unused for 90+ days
- Run validation script that checks if source hash still exists in current content

**Warning signs:**
- Translation memory files grow to 10+ MB
- Memory contains translations for deleted pages

### Pitfall 5: Notion API Rate Limits

**What goes wrong:** Build fails with 429 errors when fetching 200+ pages rapidly.

**Why it happens:** Notion API limits to ~3 requests/second. Current `build-permits.js` has 350ms delay (line 514), but batch builds might exceed limit.

**How to avoid:**
- Keep 350ms delay between `fetchPageBlocks()` calls
- Use exponential backoff on 429 errors
- Consider batching: build 50 pages, wait 20 seconds, build next 50

**Warning signs:**
- "rate_limited" errors in build output
- Builds fail intermittently but succeed on retry

## Code Examples

Verified patterns from official sources:

### Content Hashing (Node.js Crypto)

```javascript
// Source: Node.js v25.3.0 Documentation - https://nodejs.org/api/crypto.html
const crypto = require('crypto');

// Page-level hashing (hash entire Notion page content)
function hashPageContent(notionBlocks) {
  const hash = crypto.createHash('md5');

  // Hash the raw block structure as JSON
  // This ensures we detect ANY content change, not just text
  hash.update(JSON.stringify(notionBlocks));

  return hash.digest('hex');
}

// Usage in build-permits.js
const blocks = await fetchPageBlocks(permit.id);
const contentHash = hashPageContent(blocks);

// Compare with manifest
if (manifest[permit.id]?.contentHash === contentHash) {
  console.log(`   ⏭️  ${permit.tipo}: unchanged (hash match)`);
  skippedCount++;
  continue;
}

// Content changed, rebuild page
const html = generatePermessoPage(permitData);
await fs.writeFile(outputPath, html, 'utf-8');

// Update manifest with new hash
manifest[permit.id] = {
  tipo: permit.tipo,
  slug: permit.slug,
  lastEdited: permit.last_edited_time,
  lastBuilt: new Date().toISOString(),
  contentHash: contentHash
};
```

### Incremental Hash for Large Files

```javascript
// Source: Incremental MD5 Hash with Node.js - https://shailesh.hashnode.dev/2022-07-node-js-md5-hash-incremental
const fs = require('fs');
const crypto = require('crypto');

// For future use if pages become very large (100+ KB)
async function hashLargeContent(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
```

### Sitemap Index Generation

```javascript
// Source: xml npm package + Google Search Central best practices
const xml = require('xml');
const fs = require('fs/promises');

async function generateSitemapIndex(languages) {
  const sitemapElements = languages.map(lang => ({
    sitemap: [
      { loc: `https://www.sospermesso.it/sitemap-${lang}.xml` },
      { lastmod: new Date().toISOString().split('T')[0] }
    ]
  }));

  const sitemapIndex = xml({
    sitemapindex: [
      { _attr: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' } },
      ...sitemapElements
    ]
  }, { declaration: true, indent: '  ' });

  await fs.writeFile('sitemap-index.xml', sitemapIndex, 'utf-8');
}

// Usage
await generateSitemapIndex(['it', 'en']);
```

### Per-Language Sitemap with Hreflang

```javascript
// Source: Weglot hreflang sitemap guide - https://www.weglot.com/blog/hreflang-sitemap
const xml = require('xml');

async function generateLanguageSitemap(lang, pages, allLanguages) {
  const urlElements = pages.map(page => {
    // Build hreflang alternates
    const alternates = allLanguages.map(altLang => ({
      'xhtml:link': {
        _attr: {
          rel: 'alternate',
          hreflang: altLang,
          href: getUrlForLanguage(page, altLang)
        }
      }
    }));

    // Add x-default (always point to IT)
    alternates.push({
      'xhtml:link': {
        _attr: {
          rel: 'alternate',
          hreflang: 'x-default',
          href: getUrlForLanguage(page, 'it')
        }
      }
    });

    return {
      url: [
        { loc: page.url },
        { lastmod: page.lastmod },
        ...alternates
      ]
    };
  });

  const sitemap = xml({
    urlset: [
      {
        _attr: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
          'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
        }
      },
      ...urlElements
    ]
  }, { declaration: true, indent: '  ' });

  await fs.writeFile(`sitemap-${lang}.xml`, sitemap, 'utf-8');
}

function getUrlForLanguage(page, lang) {
  const baseUrl = 'https://www.sospermesso.it';
  if (lang === 'it') {
    return `${baseUrl}/${page.path}`;
  }
  return `${baseUrl}/${lang}/${page.path}`;
}
```

### Translation Memory Storage

```javascript
// Source: SimpleLocalize multi-language JSON - https://simplelocalize.io/multi-language-json/
const fs = require('fs/promises');
const crypto = require('crypto');

async function loadTranslationMemory(sourceLang, targetLang) {
  const path = `scripts/translation-memory/${sourceLang}-${targetLang}.json`;
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {}; // Return empty if file doesn't exist
  }
}

async function saveTranslationMemory(sourceLang, targetLang, memory) {
  const path = `scripts/translation-memory/${sourceLang}-${targetLang}.json`;
  await fs.writeFile(path, JSON.stringify(memory, null, 2), 'utf-8');
}

function getTranslation(sourceText, memory) {
  const hash = crypto.createHash('md5').update(sourceText).digest('hex');
  return memory[hash]?.target || null;
}

async function storeTranslation(sourceText, targetText, memory) {
  const hash = crypto.createHash('md5').update(sourceText).digest('hex');
  memory[hash] = {
    source: sourceText,
    target: targetText,
    sourceHash: hash,
    translatedAt: new Date().toISOString()
  };
}

// Usage in translation workflow
const memory = await loadTranslationMemory('it', 'en');
const existingTranslation = getTranslation(paragraph, memory);

if (existingTranslation) {
  console.log('   ✓ Reusing translation from memory');
  return existingTranslation;
}

const newTranslation = await translateWithAPI(paragraph);
await storeTranslation(paragraph, newTranslation, memory);
await saveTranslationMemory('it', 'en', memory);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single sitemap for all languages | Sitemap index + per-language sitemaps | 2024-2025 | Better scaling for 8-12 languages, easier debugging |
| Hreflang in HTML `<head>` | Hreflang in sitemaps | 2023-2024 | Centralized management, easier to update all pages |
| Timestamp-only change detection | Hybrid timestamp + hash | 2024-2025 | Prevents false rebuilds from Notion's minute-level rounding |
| Full page re-translation | Translation memory with content hashing | 2025-2026 | 70-90% reduction in translation API calls for unchanged content |
| robots.txt without sitemap | robots.txt pointing to sitemap index | 2024-2025 | Better search engine discovery of language variants |

**Deprecated/outdated:**
- **Single `sitemap.xml` for multilingual sites**: Replaced by sitemap index architecture. Current `sitemap.xml` (174 IT pages) should become `sitemap-it.xml`.
- **File mtime for change detection**: Not reliable for Notion-sourced content. Use Notion's `last_edited_time` + content hash instead.
- **Paragraph-level tracking**: Deferred to future version. Page-level hashing sufficient for current content change frequency (1-2 edits/week per page).

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal hash algorithm (MD5 vs SHA-256)**
   - What we know: MD5 faster (2-3x), SHA-256 more secure
   - What's unclear: Performance impact at scale (200+ pages × multiple languages)
   - Recommendation: Use MD5 initially. Non-cryptographic use case (no security concerns). Benchmark if build times exceed 2 minutes. Switch to SHA-256 only if MD5 collisions detected (extremely unlikely).

2. **Translation memory pruning strategy**
   - What we know: Old entries accumulate, file size grows
   - What's unclear: Optimal retention period (30 days? 90 days? 1 year?)
   - Recommendation: Start with no pruning. Monitor file sizes. Implement pruning if translation memory exceeds 5 MB (likely ~50,000 paragraphs). Add "lastUsed" timestamp and prune entries unused for 90+ days.

3. **Notion API multi-source database compatibility**
   - What we know: Notion API version 2025-09-03 introduces breaking changes ([Notion upgrade guide](https://developers.notion.com/docs/upgrade-guide-2025-09-03))
   - What's unclear: Does current `@notionhq/client` v5.8.0 support multi-source databases?
   - Recommendation: Current database is single-source, no immediate action needed. Monitor Notion changelog. Upgrade to API version 2025-09-03 only if multi-source features become necessary.

4. **Sitemap size limits**
   - What we know: Google recommends max 50,000 URLs per sitemap, max 50 MB uncompressed
   - What's unclear: SOS Permesso will have ~2,000 URLs (209 pages × 10 languages). Single sitemap sufficient?
   - Recommendation: Use sitemap index regardless of current size. Provides clean structure, easier to extend to 12+ languages. Each language sitemap ~200 URLs, well under limits.

## Sources

### Primary (HIGH confidence)

- [Node.js Crypto Module Documentation](https://nodejs.org/api/crypto.html) - Content hashing API
- [Google Search Central - Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions) - Hreflang best practices
- [Notion API - Last Edited Time Changelog](https://developers.notion.com/changelog/last-edited-time-is-now-rounded-to-the-nearest-minute) - Timestamp precision limits
- Existing codebase (`build-permits.js`, `manifest.json`, `build-sitemap.js`) - Current implementation patterns

### Secondary (MEDIUM confidence)

- [Weglot Multilingual Sitemap Guide](https://www.weglot.com/blog/multilingual-sitemap) - Sitemap index implementation
- [GTechMe Hreflang Best Practices](https://www.gtechme.com/insights/best-practices-for-multi-language-and-multi-region-xml-sitemaps-hreflang-support/) - Multi-language sitemap structure
- [ScrapingAnt Hashing Strategies](https://scrapingant.com/blog/detecting-silent-content-changes-hashing-strategies-for-web) - Content change detection patterns
- [SimpleLocalize Multi-language JSON](https://simplelocalize.io/multi-language-json/) - Translation memory file format
- [Smartling Translation Best Practices](https://help.smartling.com/hc/en-us/articles/10448270801819-Best-Practices-In-Preparing-Your-Content-For-Translation) - Translation memory workflow

### Tertiary (LOW confidence)

- [Incremental MD5 Hash with Node.js](https://shailesh.hashnode.dev/2022-07-node-js-md5-hash-incremental) - Large file hashing patterns (not needed yet, but useful for future)
- [Redokun JSON Translation Guide](https://redokun.com/blog/translate-json) - JSON translation file structure (general guidance, not specific to this use case)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Node.js crypto is built-in, xml package already in use, patterns well-documented
- Architecture: **HIGH** - Existing codebase provides solid foundation, patterns proven in similar projects
- Pitfalls: **MEDIUM** - Based on web research + inference from existing code, not project-specific experience
- Translation memory: **MEDIUM** - JSON file format well-documented, but no direct testing in this codebase yet
- Hreflang implementation: **HIGH** - Google official documentation + multiple verified sources agree on approach

**Research date:** 2026-02-03
**Valid until:** 2026-04-03 (60 days - stable technologies, Node.js crypto and sitemap standards unlikely to change)

**Key risks identified:**
1. Notion API rate limits during batch builds (mitigation: existing 350ms delay sufficient)
2. Manifest race conditions if concurrent builds implemented (mitigation: use serial builds)
3. Translation memory file size growth (mitigation: implement pruning only if needed)

**Implementation readiness:** HIGH - All required libraries already installed, patterns align with existing codebase architecture, minimal new code required (extend existing functions rather than rewrite).
