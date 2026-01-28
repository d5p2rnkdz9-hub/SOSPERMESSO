# Phase 17: Content Migration & Visual Polish - Research

**Researched:** 2026-01-28
**Domain:** Node.js build script extension + CSS list styling
**Confidence:** HIGH

## Summary

This phase extends the existing Phase 16 build infrastructure to achieve complete permit coverage and visual consistency. The build system (`build-permits.js`) is already functional, generating 24 permit pages. Phase 17 adds: (1) variant handling with parent/child page structure, (2) placeholder pages for empty content, (3) change detection for incremental builds, and (4) CSS fixes for consistent list styling.

The technical approach is straightforward: extend existing Node.js scripts and add CSS rules for triangle bullet styling. No new libraries are needed. The main complexity is in the variant detection/validation workflow and ensuring CSS overrides work correctly across generated and manually-created pages.

**Primary recommendation:** Focus on CSS fixes first (immediate visual improvement), then extend build script for placeholders, then add variant detection. Variant generation should be user-validated before execution.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @notionhq/client | ^5.8.0 | Notion API access | Already installed (Phase 16) |
| Node.js | >=18 | Build runtime | Already used |
| fs/promises | (built-in) | File I/O, timestamps | Already used |
| path | (built-in) | Path manipulation | Already used |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | ^17.2.3 | Environment config | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom timestamp tracking | fs.stat() mtime | Built-in, no dependencies |
| JSON manifest file | SQLite | Overkill for ~50 pages |
| Subfolder structure | Flat naming (lavoro-subordinato-stagionale) | Subfolder cleaner for related variants |

**Installation:**
No additional packages needed. All dependencies already installed from Phase 16.

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── build-permits.js      # EXTEND: Add variant detection, placeholders
├── notion-client.js      # EXTEND: Add last_edited_time retrieval
├── templates/
│   ├── permesso.js       # EXTEND: Add placeholder template
│   └── helpers.js        # EXISTING: Reuse escapeHtml, slugify
└── manifest.json         # NEW: Timestamp tracking for incremental builds

src/pages/
├── permesso-studio.html                    # Flat structure (no variants)
├── permesso-lavoro-subordinato/           # Subfolder for variants
│   ├── index.html                          # Parent page (intro + links)
│   ├── flussi.html                         # Variant: ingresso per flussi
│   ├── conversione.html                    # Variant: conversione
│   └── sanatoria.html                      # Variant: sanatoria
└── permesso-protezione-speciale.html      # Flat (no variants)

src/styles/
├── main.css              # UPDATE: Add triangle bullet CSS
└── permit-page.css       # OPTIONAL: Permit-specific overrides
```

### Pattern 1: Variant Detection from Notion
**What:** Detect permits that have multiple related pages (variants) in Notion database.
**When to use:** Before generating pages, to determine parent/child structure.
**Example:**
```javascript
// Source: Local pattern based on Notion data structure
function detectVariants(permits) {
  // Group by base permit name (before specific type)
  const groups = {};

  for (const permit of permits) {
    // Match patterns like:
    // "Lavoro subordinato a seguito di flussi"
    // "Lavoro subordinato a seguito di conversione"
    const baseMatch = permit.tipo.match(/^(.+?)\s+a\s+seguito\s+di/i);
    const basePermit = baseMatch ? baseMatch[1] : permit.tipo;

    if (!groups[basePermit]) {
      groups[basePermit] = [];
    }
    groups[basePermit].push(permit);
  }

  // Return groups with more than 1 permit as variants
  return Object.entries(groups)
    .filter(([_, permits]) => permits.length > 1)
    .map(([baseName, permits]) => ({
      baseName,
      variants: permits.map(p => ({
        tipo: p.tipo,
        slug: p.slug,
        variantSlug: extractVariantSlug(p.tipo, baseName)
      }))
    }));
}
```

### Pattern 2: Change Detection with Timestamps
**What:** Compare Notion `last_edited_time` with local file mtime or manifest.
**When to use:** To skip rebuilding unchanged pages.
**Example:**
```javascript
// Source: Local pattern, fs.stat for file timestamps
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

async function loadManifest() {
  try {
    const data = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveManifest(manifest) {
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function needsRebuild(permit, manifest) {
  const lastBuilt = manifest[permit.id]?.lastEdited;
  if (!lastBuilt) return true; // Never built

  // Notion returns ISO 8601 timestamps
  return new Date(permit.last_edited_time) > new Date(lastBuilt);
}
```

### Pattern 3: Triangle Bullet CSS Override
**What:** Replace default disc bullets with triangle characters.
**When to use:** Apply globally to all lists within card content.
**Example:**
```css
/* Source: CSS best practice for custom list markers */
/* Override default bullets with triangles */
.card ul {
  list-style: none;
  padding-left: 1.5rem;
}

.card ul li {
  position: relative;
  padding-left: 0;
}

.card ul li::before {
  content: '\25B8'; /* Unicode right-pointing small triangle */
  position: absolute;
  left: -1.25rem;
  color: var(--taxi-yellow-dark);
  font-size: 0.75rem;
  line-height: 1.6;
}

/* Nested lists */
.card ul ul li::before {
  content: '\25B9'; /* White right-pointing triangle for nested */
}

/* Remove checkmarks - normalize all bullet styles */
.card li[data-bullet="check"]::before,
.card li.check::before {
  content: '\25B8' !important; /* Force triangle */
}
```

### Pattern 4: Placeholder Page Generation
**What:** Generate a minimal page for permits without Notion content.
**When to use:** When permit has no blocks or no Q&A sections detected.
**Example:**
```javascript
// Source: Local pattern based on CONTEXT.md decisions
function generatePlaceholderPage(permit) {
  const { tipo, slug, emoji } = permit;
  const escapedTipo = escapeHtml(tipo);

  return `<!DOCTYPE html>
<html lang="it">
<!-- ... standard head ... -->
<body>
  <!-- ... standard header ... -->

  <section class="section">
    <div class="container" style="max-width: 900px;">
      <div class="card text-center" style="padding: 3rem;">
        <span style="font-size: 4rem;">${emoji || '📄'}</span>
        <h2 style="margin: 1rem 0;">Contenuto in arrivo</h2>
        <p style="color: var(--gray-medium); max-width: 500px; margin: 0 auto 1.5rem;">
          Stiamo ancora lavorando per completare le informazioni
          su questo permesso di soggiorno.
        </p>
        <a href="https://form.typeform.com/to/USx16QN3"
           class="btn btn-primary"
           target="_blank">
          Dai una mano
        </a>
      </div>
    </div>
  </section>

  <!-- ... standard footer ... -->
</body>
</html>`;
}
```

### Anti-Patterns to Avoid
- **Generating variants without validation:** Always output proposed structure and get user approval before creating files
- **CSS specificity wars:** Use specific selectors (.card ul li::before) not !important
- **Overwriting good manual pages:** Check for existing content quality before replacing
- **Flat file naming for variants:** Use subfolders, not permesso-lavoro-subordinato-flussi.html

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML escaping | Manual regex | helpers.js escapeHtml | Already handles all special chars |
| Slug generation | Manual slugify | notion-client.js slugify | Handles accents, special chars |
| File timestamp | Custom tracking | fs.stat().mtime | Built-in, reliable |
| Rate limiting | Manual counters | Existing delay() helper | Already tested at 350ms |

**Key insight:** Phase 16 already solved the hard problems (API pagination, block parsing, Q&A detection). Phase 17 extends, not rewrites.

## Common Pitfalls

### Pitfall 1: CSS Specificity Conflicts
**What goes wrong:** New triangle bullet CSS doesn't override existing disc bullets.
**Why it happens:** Existing main.css has `ul { list-style-type: disc; }` rule.
**How to avoid:** Use more specific selector `.card ul` and ensure CSS load order.
**Warning signs:** Pages show discs instead of triangles, or mixed bullet styles.

### Pitfall 2: Mixed Bullet Styles in Source Content
**What goes wrong:** Some Notion content has literal checkmark characters (e.g., "checkmark Item") in text.
**Why it happens:** Manual entry in Notion used emoji checkmarks.
**How to avoid:** Strip/normalize checkmark characters during block parsing, or CSS-only fix.
**Warning signs:** Seeing both triangles (CSS) and checkmarks (text) on same list.

### Pitfall 3: Variant Detection False Positives
**What goes wrong:** Unrelated permits grouped as variants.
**Why it happens:** Naive string matching (e.g., "Protezione speciale" and "Protezione sussidiaria" wrongly grouped).
**How to avoid:** Require "a seguito di" or similar phrase for variant detection; validate with user.
**Warning signs:** Parent page created for permits that shouldn't have variants.

### Pitfall 4: Subfolder Path Resolution Issues
**What goes wrong:** Links within subfolder pages (lavoro-subordinato/flussi.html) break.
**Why it happens:** Template uses relative paths assuming flat structure.
**How to avoid:** Generate variant pages with adjusted relative paths (../ prefix) or use root-relative paths.
**Warning signs:** 404 errors for CSS, images, or navigation links on variant pages.

### Pitfall 5: Manifest Corruption
**What goes wrong:** Manifest file gets corrupted, causing unnecessary rebuilds or skipped updates.
**Why it happens:** Process killed during write, or manual editing mistakes.
**How to avoid:** Write to temp file first, then atomic rename; validate JSON on load.
**Warning signs:** All pages rebuilding every run, or changes not detected.

## Code Examples

Verified patterns from official sources:

### Unicode Triangle Characters
```css
/* Source: Unicode Standard / CSS content property */
/* Right-pointing triangles for list bullets */

/* Solid filled triangle */
.triangle-solid::before { content: '\25B6'; }  /* BLACK RIGHT-POINTING TRIANGLE */

/* Small solid triangle (recommended for lists) */
.triangle-small::before { content: '\25B8'; }  /* BLACK RIGHT-POINTING SMALL TRIANGLE */

/* Outline/white triangle */
.triangle-outline::before { content: '\25B7'; } /* WHITE RIGHT-POINTING TRIANGLE */

/* Arrow alternative */
.arrow-right::before { content: '\25B9'; }     /* WHITE RIGHT-POINTING SMALL TRIANGLE */
```

### fs.stat for File Timestamps
```javascript
// Source: Node.js fs documentation
const fs = require('fs/promises');

async function getFileModTime(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.mtime; // Returns Date object
  } catch (err) {
    if (err.code === 'ENOENT') return null; // File doesn't exist
    throw err;
  }
}
```

### Notion last_edited_time Access
```javascript
// Source: Notion API documentation
// last_edited_time is a page property, not a block property
// Already returned by search API in fetchPermitData

async function fetchPermitDataWithTimestamps() {
  const pages = await notion.search({ /* ... */ });

  return pages.map(page => ({
    id: page.id,
    tipo: page.properties["Nome permesso"]?.title?.[0]?.plain_text,
    last_edited_time: page.last_edited_time, // ISO 8601 string
    // ... other fields
  }));
}
```

### Creating Directories Recursively
```javascript
// Source: Node.js fs documentation
const fs = require('fs/promises');
const path = require('path');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

// For variant subfolder
const variantDir = path.join(OUTPUT_DIR, 'lavoro-subordinato');
await ensureDir(variantDir);
await fs.writeFile(path.join(variantDir, 'flussi.html'), html);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat page structure | Subfolder-based variants | Phase 17 | Cleaner URLs, easier navigation |
| All pages or nothing | Incremental builds | Phase 17 | Faster iteration, less API usage |
| Mixed bullet styles | Uniform triangles | Phase 17 | Visual consistency |
| Skip empty permits | Placeholder pages | Phase 17 | Complete coverage, clear user CTA |

**Deprecated/outdated:**
- Checkmark bullets (Phase 17 removes them for consistency)
- Manual page creation (build script is now authoritative)

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Variant List**
   - What we know: "Lavoro subordinato" has variants (flussi, conversione, sanatoria)
   - What's unclear: Full list of permits with variants in Notion database
   - Recommendation: Build script should output proposed variant structure for user approval before generating

2. **Manual Page Preservation**
   - What we know: permesso-studio.html was manually created and is high quality
   - What's unclear: Whether to preserve manual pages or overwrite with generated ones
   - Recommendation: CONTEXT.md says "Notion is source of truth" - overwrite, but ensure generated quality matches

3. **Nested List Styling**
   - What we know: Some Notion content has nested lists
   - What's unclear: Whether nested lists should have different bullet style
   - Recommendation: Use same triangle for consistency, or slightly smaller/lighter for nested

## Sources

### Primary (HIGH confidence)
- Existing codebase: `scripts/build-permits.js`, `scripts/templates/permesso.js`
- Node.js fs documentation: https://nodejs.org/api/fs.html
- CSS list-style-type MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type
- Unicode Character Database: Triangle characters

### Secondary (MEDIUM confidence)
- Phase 16 RESEARCH.md: Notion API patterns verified
- CONTEXT.md decisions: User-approved implementation approach

### Tertiary (LOW confidence)
- None - all findings based on existing codebase and established patterns

## Metadata

**Confidence breakdown:**
- CSS styling: HIGH - Standard CSS, verified with Unicode references
- Build extension: HIGH - Follows existing Phase 16 patterns
- Variant detection: MEDIUM - Logic is sound but depends on Notion data structure
- Change detection: HIGH - Standard fs.stat approach

**Research date:** 2026-01-28
**Valid until:** 60 days (stable patterns, existing codebase)
