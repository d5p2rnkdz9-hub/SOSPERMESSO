# Phase 3: Complete Coverage - Research

**Researched:** 2026-01-25
**Domain:** Slug mapping and content coverage gap resolution
**Confidence:** HIGH

## Summary

Phase 3 addresses a **slug mismatch** between the documenti-questura.html landing page (which references 23 permits with simple slugs like "studio", "lavoro-subordinato") and the Notion-generated document pages (which use descriptive slugs like "studio-art-39", "lavoro-subordinato-a-seguito-di-ingresso-per-flussi").

**Current state:**
- documenti-questura.html: 23 permit types, each with [Primo] and [Rinnovo] badge links → 46 expected URLs
- Generated pages from Notion: 63 pages (31 primo + 32 rinnovo) with descriptive slugs
- **Gap:** 19 out of 23 expected URLs result in 404s when users click badges

**Root cause:** Notion database contains more granular permit variations (32 permits) than the user-facing navigation (23 permits). The site's navigation uses simplified slugs while Notion uses detailed slugs with legal article references.

**Primary recommendation:** Create a slug mapping layer that maps simple "display slugs" (used in navigation) to "canonical slugs" (used in Notion and file generation). This can be achieved through either (1) HTML redirect pages, (2) Notion database field additions, or (3) JavaScript routing.

## Standard Stack

### Core Technologies (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | 18+ | Build script execution | Standard for static site generation |
| Notion API | v5 (@notionhq/client) | CMS content source | Already integrated in Phase 2 |
| Vanilla JavaScript | ES6+ | Client-side routing (if needed) | No framework overhead |

### Slug Resolution Approaches
| Approach | Complexity | SEO Impact | Maintenance |
|----------|-----------|------------|-------------|
| HTML redirect pages | Low | Positive (301 redirects) | Manual updates needed |
| Notion slug field | Medium | Best (canonical URLs) | Centralized in CMS |
| JavaScript router | Medium | Neutral (SPA routing) | Code complexity |
| Symbolic links | Low | Positive | Platform-dependent |

**Installation:**
```bash
# No new dependencies required - all solutions use existing tools
# Option 1: HTML redirects (no install)
# Option 2: Notion field (already have @notionhq/client)
# Option 3: JavaScript routing (vanilla JS)
```

## Architecture Patterns

### Pattern 1: Slug Mapping Configuration File
**What:** Create a slug-map.json that maps display slugs to canonical slugs
**When to use:** When Notion contains more granular data than user-facing navigation
**Example:**
```json
{
  "studio": "studio-art-39",
  "lavoro-subordinato": "lavoro-subordinato-a-seguito-di-ingresso-per-flussi",
  "lavoro-autonomo": "lavoro-autonomo",
  "richiesta-asilo": "richiesta-asilo",
  "asilo-politico": "asilo-status-rifugiato"
}
```
**Source:** Inspired by [URL aliasing patterns](https://hitchhikers.yext.com/docs/pages/url-routing/) and [Lektor CMS slug management](https://www.getlektor.com/docs/content/urls/)

### Pattern 2: HTML Meta Refresh Redirect Pages
**What:** Generate minimal HTML files at display slug locations that redirect to canonical slugs
**When to use:** For static sites without server-side routing
**Example:**
```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=documenti-lavoro-subordinato-a-seguito-di-ingresso-per-flussi-primo.html">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to document page...</p>
  <script>
    window.location.href = "documenti-lavoro-subordinato-a-seguito-di-ingresso-per-flussi-primo.html";
  </script>
</body>
</html>
```
**Source:** Standard HTML redirect pattern, verified by [Hugo URL management](https://gohugo.io/content-management/urls/)

### Pattern 3: Notion Display Slug Field
**What:** Add a "Display Slug" field in Notion database, separate from auto-generated slug
**When to use:** When CMS should control both canonical and display URLs
**Notion structure:**
- Nome permesso (existing): "Permesso di soggiorno per lavoro subordinato a seguito di ingresso per flussi"
- Slug (existing, auto-generated): "lavoro-subordinato-a-seguito-di-ingresso-per-flussi"
- Display Slug (new): "lavoro-subordinato" (what appears in navigation)

**Benefits:**
- Single source of truth in CMS
- Build script reads display slug and generates alias pages
- Easy to update mappings without code changes

### Pattern 4: One-to-Many Mapping (Representative Pages)
**What:** When multiple Notion entries map to one display slug, designate one as "representative"
**When to use:** When user-facing navigation simplifies multiple permit variations
**Example:**
- Display slug: "lavoro-subordinato" (user clicks this in documenti-questura.html)
- Maps to: "lavoro-subordinato-a-seguito-di-ingresso-per-flussi" (most common case)
- Alternative entries in Notion: "lavoro-subordinato-a-seguito-di-conversione-da-altro-permesso"
- Solution: Representative page shows most common case, with note: "Questa è la procedura più comune. Per casi specifici, contatta la Questura."

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL routing for static sites | Custom JavaScript router | HTML meta refresh redirects | Simpler, works without JS, SEO-friendly |
| Slug normalization | Manual string manipulation | Existing slugify() in notion-client.js | Already handles accents, special chars |
| Canonical URL management | Manual duplicate detection | Notion database with Display Slug field | Single source of truth, prevents drift |
| Redirect management | Hardcoded redirect map | Configuration file (slug-map.json) | Maintainable, auditable, version-controlled |

**Key insight:** Static sites benefit from simple redirect mechanisms (HTML meta refresh, 301 headers) rather than complex JavaScript routing, especially for SEO and accessibility.

## Common Pitfalls

### Pitfall 1: URL Inconsistency Leading to 404s
**What goes wrong:** Users click badges in documenti-questura.html and land on 404 pages because expected slugs don't match generated file names
**Why it happens:** Notion database uses descriptive slugs (e.g., "lavoro-subordinato-a-seguito-di-ingresso-per-flussi") while navigation uses simplified slugs (e.g., "lavoro-subordinato")
**How to avoid:**
1. Audit expected URLs from documenti-questura.html
2. Compare with generated file names
3. Create mapping for all mismatches
4. Generate redirect pages for display slugs
**Warning signs:** Browser console shows 404 errors when clicking permit badges

### Pitfall 2: Hardcoding Slug Mappings in Multiple Places
**What goes wrong:** Slug mappings scattered across build scripts, HTML files, and JavaScript files lead to inconsistencies
**Why it happens:** No single source of truth for display-to-canonical slug relationships
**How to avoid:**
1. Create slug-map.json configuration file
2. Build script reads this file
3. All redirect pages generated from this file
4. Never hardcode slug mappings in templates
**Warning signs:** Updating a slug requires changes in multiple files

### Pitfall 3: Losing SEO Value with Wrong Redirect Method
**What goes wrong:** Client-side JavaScript redirects (window.location) don't pass SEO value and fail when JS is disabled
**Why it happens:** Using only JavaScript for redirects without HTML meta refresh fallback
**How to avoid:**
1. Use HTML `<meta http-equiv="refresh">` as primary redirect
2. Add JavaScript redirect as enhancement
3. Include visible link as final fallback
4. For server deployments, use 301 redirects (Netlify _redirects file)
**Warning signs:** Google Search Console shows crawl errors on redirect pages

### Pitfall 4: Notion Slug Drift
**What goes wrong:** Notion's auto-generated slugs change when permit names are edited, breaking existing URLs
**Why it happens:** Slugify function in notion-client.js generates slugs from "Nome permesso" field on every build
**How to avoid:**
1. Add "Slug" field in Notion (text property) to lock canonical slug
2. Only populate on first entry creation
3. Never auto-update slug when name changes
4. Use "Display Slug" field for navigation aliases
**Warning signs:** Page URLs change unexpectedly after editing Notion entries

### Pitfall 5: Partial Coverage Assumptions
**What goes wrong:** Assuming Phase 2's 63 pages provide complete coverage when navigation expects 46 specific URLs
**Why it happens:** Confusing "total pages generated" with "required URL coverage"
**How to avoid:**
1. List all expected URLs from documenti-questura.html (23 permits × 2 types = 46 URLs)
2. Check actual files exist at those exact paths
3. Missing URLs = coverage gap, not optional enhancement
**Warning signs:** User acceptance testing reveals 404s on badge clicks

## Code Examples

### Example 1: Generate Redirect Page
```javascript
// Source: Standard HTML redirect pattern
function generateRedirectPage(displaySlug, canonicalSlug, type) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=documenti-${canonicalSlug}-${type}.html">
  <link rel="canonical" href="documenti-${canonicalSlug}-${type}.html">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to document page...</p>
  <script>
    window.location.replace("documenti-${canonicalSlug}-${type}.html");
  </script>
</body>
</html>`;
}
```

### Example 2: Build Script with Slug Mapping
```javascript
// Source: Pattern established in Phase 2 build-documents.js
const slugMap = require('./slug-map.json');

async function generateAliasPages() {
  for (const [displaySlug, canonicalSlug] of Object.entries(slugMap)) {
    // Generate primo redirect
    const primoHtml = generateRedirectPage(displaySlug, canonicalSlug, 'primo');
    await fs.writeFile(
      path.join(OUTPUT_DIR, `documenti-${displaySlug}-primo.html`),
      primoHtml,
      'utf-8'
    );

    // Generate rinnovo redirect
    const rinnovoHtml = generateRedirectPage(displaySlug, canonicalSlug, 'rinnovo');
    await fs.writeFile(
      path.join(OUTPUT_DIR, `documenti-${displaySlug}-rinnovo.html`),
      rinnovoHtml,
      'utf-8'
    );
  }
}
```

### Example 3: Audit Expected URLs vs Generated Files
```javascript
// Verification script to detect coverage gaps
const fs = require('fs/promises');
const path = require('path');

async function auditCoverage() {
  // Expected URLs from documenti-questura.html
  const expectedSlugs = [
    'studio', 'lavoro-subordinato', 'lavoro-autonomo',
    'ue-lungo-periodo', 'attesa-occupazione',
    'richiesta-asilo', 'asilo-politico', 'protezione-sussidiaria',
    'protezione-speciale', 'minore-eta', 'calamita-naturale',
    'prosieguo-amministrativo', 'gravidanza', 'cure-mediche',
    'gravi-motivi-salute', 'ricongiungimento-familiare',
    'coesione-familiare', 'genitore-minore-italiano',
    'conviventi-familiari-italiani', 'assistenza-minore',
    'minori-stranieri-affidati', 'carta-soggiorno-familiare-ue',
    'carta-soggiorno-familiare-italiano'
  ];

  const missing = [];
  for (const slug of expectedSlugs) {
    const primoPath = path.join(__dirname, `../src/pages/documenti-${slug}-primo.html`);
    const rinnovoPath = path.join(__dirname, `../src/pages/documenti-${slug}-rinnovo.html`);

    try {
      await fs.access(primoPath);
    } catch {
      missing.push(`${slug}-primo`);
    }

    try {
      await fs.access(rinnovoPath);
    } catch {
      missing.push(`${slug}-rinnovo`);
    }
  }

  return missing;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single slug per page | Display slug + canonical slug | 2026 CMS best practices | Better separation of navigation vs. content |
| Manual redirect files | Generated redirect pages | Static site generators 2024+ | Maintainable, auditable |
| Server-side redirects only | HTML meta refresh + JS fallback | 2025+ (static-first) | Works without server config |
| Hardcoded URL maps | JSON configuration files | Modern build systems | Version-controlled, auditable |

**Deprecated/outdated:**
- Manual HTML page duplication: wasteful, error-prone
- Client-side routing for simple redirects: over-engineered for static sites
- Ignoring SEO implications of redirects: meta refresh is SEO-friendly when used correctly

## Open Questions

1. **Should we use Notion field or configuration file for slug mapping?**
   - What we know: Both approaches work; configuration file is simpler but creates dual source of truth
   - What's unclear: Whether Notion database structure can be modified by user
   - Recommendation: Start with slug-map.json configuration file (non-invasive), migrate to Notion field if user prefers centralized control

2. **How to handle multiple Notion entries mapping to one display slug?**
   - What we know: Some Notion entries are permit variations (e.g., "lavoro subordinato after flussi" vs. "after conversion")
   - What's unclear: Which variation should be the "representative" for each display slug
   - Recommendation: Map to most common case, add note on page: "Questa è la procedura più comune. Per casi specifici (conversione, etc.) contatta la Questura."

3. **Should redirect pages be committed to git or generated at build time?**
   - What we know: Phase 2 generated pages are committed to git (63 pages); .planning/ may or may not be gitignored
   - What's unclear: User's preference for committing generated files
   - Recommendation: Generate redirect pages at build time and commit them (consistent with Phase 2 pattern)

## Sources

### Primary (HIGH confidence)
- Current codebase analysis:
  - `/src/pages/documenti-questura.html` - 23 permit types with badge links
  - `/src/pages/database.html` - 23 permit types in navigation
  - `/src/pages/documenti-*.html` - 63 generated pages from Notion
  - `/scripts/notion-client.js` - Slug generation logic
  - `/scripts/build-documents.js` - Page generation script
- Git history:
  - Commit de13731: "Generate 63 document pages from Notion data (primo + rinnovo)"
  - `.planning/phases/02-document-templates/02-02-SUMMARY.md` - Phase 2 completion details

### Secondary (MEDIUM confidence)
- [URL Routing and Redirects - Yext Hitchhikers](https://hitchhikers.yext.com/docs/pages/url-routing/) - URL aliasing patterns for static sites
- [Hugo URL Management](https://gohugo.io/content-management/urls/) - Canonical URL handling in static site generators
- [Lektor CMS URLs and Slugs](https://www.getlektor.com/docs/content/urls/) - Display vs. canonical slug patterns
- [URL Slug Optimisation Guide 2026](https://seoservicecare.com/url-slug-guide/) - SEO best practices for slug consistency
- [Contentful SEO Guide](https://www.contentful.com/seo-guide/urls-redirects/) - Canonical URLs and redirect strategies

### Tertiary (LOW confidence - general best practices)
- [Mastering URL Slugs - DEV Community](https://dev.to/mycko22/mastering-url-slugs-the-developers-guide-to-seo-and-user-experience-gf3) - General slug best practices
- [Notion CMS for Static Sites](https://github.com/agency-kit/notion-cms) - Notion-backed static site generation patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools already in use, no new dependencies
- Architecture: HIGH - Verified patterns from static site generators and current codebase
- Pitfalls: HIGH - Directly observed from codebase analysis (404 gap confirmed)
- Slug mapping approaches: MEDIUM - Multiple valid approaches, best choice depends on user preference

**Research date:** 2026-01-25
**Valid until:** 60 days (stable patterns, slow-moving domain)

**Key finding:** Phase 3 is NOT about generating more pages (63 already exist), but about creating a **routing layer** (19 missing slug mappings) to bridge the gap between user-facing navigation (23 simplified slugs) and Notion's detailed permit variations (32 descriptive slugs).
