# Phase 32: Translation Workflow

## Goal
Build system detects Notion changes and only rebuilds/re-translates affected pages.

## Current State

**Existing infrastructure:**
- `scripts/manifest.json` - Tracks `lastEdited` (Notion timestamp) and `lastBuilt` per permit page
- `scripts/translation-manifest.json` - Tracks which files were translated (209 pages)
- `scripts/build-permits.js` - Already uses `last_edited_time` for incremental builds
- `scripts/build-sitemap.js` - Generates IT sitemap only (174 pages)
- EN pages exist in `/en/` folder but aren't in sitemap

**Gaps:**
- No content hashing (timestamp alone triggers rebuild even for no-content-change edits)
- No translation memory (can't reuse translations for unchanged content)
- No EN sitemap (EN pages not indexed by search engines)
- No hreflang tags (Google treats IT/EN as duplicates)

## Implementation

### Step 1: Add Content Hashing to Manifest

**File:** `scripts/build-permits.js`

Add `contentHash` field to manifest entries:

```javascript
const crypto = require('crypto');

function hashContent(blocks) {
  // Serialize Notion blocks to stable string
  const content = JSON.stringify(blocks);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 12);
}
```

Split into two functions for efficiency (don't fetch blocks unless timestamp changed):

```javascript
// Step 1: Cheap timestamp check (before fetching blocks)
function timestampChanged(permit, manifest) {
  const entry = manifest[permit.id];
  if (!entry) return true; // Never built

  const lastEdited = new Date(permit.last_edited_time || 0);
  const lastBuilt = new Date(entry.lastEdited);
  return lastEdited > lastBuilt;
}

// Step 2: Hash check (after fetching blocks, only if timestamp changed)
function contentChanged(blocks, manifest, permitId) {
  const entry = manifest[permitId];
  if (!entry || !entry.contentHash) return true; // No previous hash

  const newHash = hashContent(blocks);
  return newHash !== entry.contentHash;
}
```

**Build flow becomes:**
```
for each permit:
  1. if !timestampChanged(permit, manifest) → skip (no API call)
  2. fetch blocks from Notion API
  3. if !contentChanged(blocks, manifest, permit.id) → skip (hash same)
  4. rebuild page
```

Manifest structure becomes:
```json
{
  "permit-uuid": {
    "tipo": "Permesso type",
    "slug": "permesso-slug",
    "lastEdited": "2026-02-03T10:00:00Z",
    "lastBuilt": "2026-02-03T10:05:00Z",
    "contentHash": "a1b2c3d4e5f6"
  }
}
```

### Step 2: Create Translation Memory Structure

**New file:** `scripts/translation-memory/it-en.json`

Structure:
```json
{
  "a1b2c3d4e5f6": {
    "source_slug": "permesso-studio",
    "translated_at": "2026-02-03T10:00:00Z",
    "reviewed": false
  }
}
```

Key = content hash from IT source. Value = metadata about translation.

**Note:** We don't store the actual translated HTML here. The translated files already exist in `/en/`. The memory just tracks which content hashes have been translated, so we know whether to re-translate.

**New file:** `scripts/translation-memory.js`
```javascript
const fs = require('fs/promises');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, 'translation-memory');

async function loadMemory(langPair) {
  const file = path.join(MEMORY_DIR, `${langPair}.json`);
  try {
    return JSON.parse(await fs.readFile(file, 'utf-8'));
  } catch {
    return {};
  }
}

async function saveMemory(langPair, memory) {
  const file = path.join(MEMORY_DIR, `${langPair}.json`);
  await fs.mkdir(MEMORY_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(memory, null, 2), 'utf-8');
}

async function needsTranslation(contentHash, langPair) {
  const memory = await loadMemory(langPair);
  return !memory[contentHash];
}

async function markTranslated(contentHash, slug, langPair) {
  const memory = await loadMemory(langPair);
  memory[contentHash] = {
    source_slug: slug,
    translated_at: new Date().toISOString(),
    reviewed: false
  };
  await saveMemory(langPair, memory);
}

module.exports = { loadMemory, saveMemory, needsTranslation, markTranslated };
```

### Step 3: Update Build Script with Verbose Output

**File:** `scripts/build-permits.js`

Add `--verbose` flag support:
```javascript
const verbose = process.argv.includes('--verbose');

// In build loop:
if (verbose) {
  if (!needsRebuild) {
    console.log(`   ⏭️  ${permit.tipo}: skipped (hash unchanged: ${entry.contentHash})`);
  } else {
    console.log(`   🔄 ${permit.tipo}: rebuilding (hash: ${oldHash} → ${newHash})`);
  }
}
```

### Step 4: Generate Per-Language Sitemaps

**File:** `scripts/build-sitemap.js` (major refactor)

New approach:
1. Scan IT pages → generate `sitemap-it.xml`
2. Scan EN pages → generate `sitemap-en.xml`
3. Generate `sitemap-index.xml` pointing to both

**sitemap-it.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://sospermesso.it/index.html</loc>
    <lastmod>2026-02-03</lastmod>
    <xhtml:link rel="alternate" hreflang="it" href="https://sospermesso.it/index.html"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://sospermesso.it/en/index.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://sospermesso.it/index.html"/>
  </url>
  ...
</urlset>
```

**sitemap-index.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://sospermesso.it/sitemap-it.xml</loc>
    <lastmod>2026-02-03</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://sospermesso.it/sitemap-en.xml</loc>
    <lastmod>2026-02-03</lastmod>
  </sitemap>
</sitemapindex>
```

### Step 5: Create Page Mapping for hreflang

**New file:** `scripts/page-mapping.json`

Maps IT pages to their EN equivalents:
```json
{
  "index.html": {
    "it": "index.html",
    "en": "en/index.html"
  },
  "src/pages/chi-siamo.html": {
    "it": "src/pages/chi-siamo.html",
    "en": "en/src/pages/chi-siamo.html"
  }
}
```

This is auto-generated by scanning both IT and EN directories.

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `scripts/build-permits.js` | Modify | Add content hashing, hybrid detection |
| `scripts/build-sitemap.js` | Refactor | Per-language sitemaps with hreflang |
| `scripts/translation-memory.js` | Create | Translation memory utilities |
| `scripts/translation-memory/it-en.json` | Create | IT→EN translation tracking |
| `scripts/page-mapping.json` | Create | IT↔EN page relationships |
| `sitemap-it.xml` | Create | Italian sitemap with hreflang |
| `sitemap-en.xml` | Create | English sitemap with hreflang |
| `sitemap-index.xml` | Create | Master sitemap index |
| `sitemap.xml` | Keep | Redirect to sitemap-index.xml for backwards compat |

## Verification

### Test 1: Change Detection
```bash
# Edit a page in Notion (add a space, remove it)
node scripts/build-permits.js --verbose
# Expected: "skipped (hash unchanged)" for that page
```

### Test 2: Actual Change
```bash
# Edit a page in Notion (real content change)
node scripts/build-permits.js --verbose
# Expected: "rebuilding (hash: xxx → yyy)" for that page
```

### Test 3: No Changes = No Rebuilds
```bash
node scripts/build-permits.js --verbose
node scripts/build-permits.js --verbose
# Expected: Second run shows "0 pages changed"
```

### Test 4: Sitemap Structure
```bash
node scripts/build-sitemap.js
cat sitemap-index.xml  # Should list sitemap-it.xml and sitemap-en.xml
grep -c "hreflang" sitemap-it.xml  # Should show entries for each page
grep -c "hreflang" sitemap-en.xml  # Should match IT count
```

### Test 5: hreflang Validation
```bash
# Check that IT and EN sitemaps have matching hreflang pairs
grep "xhtml:link" sitemap-it.xml | head -5
grep "xhtml:link" sitemap-en.xml | head -5
```

## Order of Implementation

1. **translation-memory.js** - Create utility module (no dependencies)
2. **build-permits.js** - Add hashing + hybrid detection
3. **page-mapping.json** - Generate from existing files
4. **build-sitemap.js** - Refactor for multi-language + hreflang
5. **Test all verification steps**

## Out of Scope (Phase 33/34)

- RTL CSS (Phase 33)
- CJK CSS (Phase 34)
- Actual translations to AR/ZH (future milestone)
