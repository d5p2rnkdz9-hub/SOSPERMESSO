# Phase 52: Notion Database - Research

**Researched:** 2026-02-18
**Domain:** Notion API, translate-notion.js execution, FR database creation
**Confidence:** HIGH — all findings drawn directly from reading project source code

## Summary

Phase 52 creates a French Notion database by running the existing `translate-notion.js` script with `--lang fr`. The script already supports FR end-to-end (built in Phase 51). The main task is running `npm run translate:fr`, then hardcoding the resulting FR database ID into two new 11ty data files (`_data/permitsFr.js`, `_data/documentsFr.js`). These data files are copies of the EN equivalents with the FR DB ID substituted.

The FR parent page in Notion already exists (`NOTION_FR_PARENT_PAGE_ID=30b7355e-7f7f-8184-975d-fb18ca69875c`). The `NOTION_DATABASE_FR_ID` env var does NOT yet exist — the script will auto-create the DB and append the ID to `.env` on first run.

**Primary recommendation:** Run `npm run translate:fr`, capture the FR DB ID printed to stdout, hardcode it in two new data files, verify `npm run build` fetches FR content without errors.

## Standard Stack

All stack components already exist in the project. Nothing new to install.

### Core
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| `scripts/translate-notion.js` | existing | Translates IT Notion DB to FR via Claude API | Phase 51 built this; `--lang fr` already supported |
| `@notionhq/client` | ^5.8.0 | Notion API SDK | Already installed, used by all data files |
| `@anthropic-ai/sdk` | ^0.72.1 | Claude API for translation | Already installed, used by translate-notion.js |
| `scripts/notion-cache.js` | existing | Caches Notion block responses | Already integrated into all data files |
| `scripts/translation-memory.js` | existing | Caches translations to avoid re-translating | Saves cost; `it-fr.json` created on first FR run |

### Supporting
| Component | Version | Purpose | When to Use |
|-----------|---------|---------|-------------|
| `scripts/translation-glossary.json` | existing | FR glossary in `termsFr` key (32 terms) | Used automatically by `getLangConfig('fr')` |
| `.notion-cache/translation-index-fr.json` | auto-created | Tracks which IT pages have been translated to FR | Created by script on first run |
| `scripts/translation-memory/it-fr.json` | auto-created | Stores IT→FR segment translations for reuse | Created by script on first run |

**Installation:** None required. All dependencies already present.

## Architecture Patterns

### How the EN pipeline works (exact same pattern for FR)

The EN pipeline is the proven template. FR reuses every component with `fr` substituted for `en`.

```
IT Notion DB (3097355e)
  ↓ translate-notion.js --lang fr
FR Notion DB (auto-created by script)
  ↓ _data/permitsFr.js  +  _data/documentsFr.js  (new files)
  ↓ 11ty pagination templates (new files in fr/src/pages/)
  ↓ _site/fr/permesso-{slug}.html, _site/fr/documenti-{slug}-primo.html, etc.
```

### EN Data File Pattern (exact copy, swap ID + "En" → "Fr")

`_data/permitsEn.js` is the template for `_data/permitsFr.js`:

```javascript
// Source: _data/permitsEn.js (existing)
const FR_DATABASE_ID = "PASTE_FR_DB_ID_HERE";  // hardcoded, not from env
const IT_DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";

// Page title property differs: EN/FR DB uses 'Name' (not 'Nome permesso')
const tipo = page.properties["Name"]?.title?.[0]?.plain_text || null;

// Slug resolved via IT Page ID property
const itPageId = (page.properties["IT Page ID"]?.rich_text || [])
  .map(s => s.plain_text).join('');
const slug = itPageId ? itSlugMap[itPageId] : null;
```

The FR DB uses the same property names as EN DB:
- Title property: `"Name"` (not `"Nome permesso"`)
- Slug resolution: via `"IT Page ID"` rich_text property (same as EN)
- All other properties identical: `"Doc primo rilascio"`, `"Doc rinnovo"`, `"Mod primo rilascio"`, `"Mod rinnovo"`, `"Info extra su doc rilascio"`

### Recommended Project Structure for FR Files

```
_data/
├── permitsFr.js          # new — copy of permitsEn.js, FR_DATABASE_ID substituted
├── documentsFr.js        # new — copy of documentsEn.js, FR_DATABASE_ID substituted
fr/
└── src/pages/
    ├── permits-fr.liquid             # new — copy of permits-en.liquid
    ├── documents-primo-fr.liquid     # new — copy of documents-primo-en.liquid
    ├── documents-rinnovo-fr.liquid   # new — copy of documents-rinnovo-en.liquid
    └── pages.11tydata.js             # new — same pattern as en/src/pages/pages.11tydata.js
```

Note: The Liquid template files and static pages (database.html, etc.) are Phase 53's concern. Phase 52 only needs to run the translation script and create the two data files.

### translate-notion.js FR Execution Flow

1. Reads `NOTION_FR_PARENT_PAGE_ID` from `.env` — already set to `30b7355e-7f7f-8184-975d-fb18ca69875c`
2. Checks `NOTION_DATABASE_FR_ID` — not set, so creates a new Notion database
3. Logs: `[translate] Created FR database: {UUID} (data source: {UUID})`
4. Appends `NOTION_DATABASE_FR_ID={UUID}` to `.env` automatically
5. For each of 41 IT permits:
   - Fetches blocks (from cache — 80 pages already cached, warm build)
   - Translates properties + Q&A sections via Claude API with FR glossary
   - Writes translated page to FR Notion DB
   - Updates `.notion-cache/translation-index-fr.json`
6. Saves `scripts/translation-memory/it-fr.json`

### Cost Estimate for Translation Run

41 permits, each with ~7 Q&A sections. EN translation memory has 1,333 entries. FR is a fresh start (no `it-fr.json` yet), so all 41 permits need full translation. Estimate: 41 permits × 8 API calls each = ~328 Claude API calls. At typical batch sizes of 10-20 segments per call, actual calls will be less due to deduplication.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Notion DB creation | Manual Notion UI creation | `npm run translate:fr` | Script auto-creates DB with correct schema (Name, Doc primo rilascio, Doc rinnovo, Mod primo/rinnovo, IT Page ID, Info extra) |
| FR slug resolution | Custom slug logic | Same `IT Page ID` → IT slug map pattern as EN | EN pattern already proven; FR DB has same `IT Page ID` property |
| FR data file | Write from scratch | Copy `_data/permitsEn.js`, replace `EN_DATABASE_ID` with FR ID and rename | Identical logic, only the DB ID differs |
| Translation | Manual translation | `npm run translate:fr` | Claude API + glossary + translation memory infrastructure already built |
| Cost parsing for FR | Write new cost keywords | Copy `documentsEn.js` pattern with FR keyword fallbacks | `extractCost()` already handles both IT and EN keywords |

**Key insight:** Phase 52 is almost entirely mechanical wiring — running an existing script and copying two existing files. The intellectual work was done in Phase 51.

## Common Pitfalls

### Pitfall 1: FR DB ID Not Hardcoded

**What goes wrong:** After running `npm run translate:fr`, the FR DB ID is saved to `.env` as `NOTION_DATABASE_FR_ID`. But `_data/permitsFr.js` reads the DB ID from a hardcoded constant, not from env vars (see MEMORY.md pattern: "Notion DB IDs are HARDCODED in data files").

**Why it happens:** The translate script uses env vars internally to check if the DB already exists; data files use hardcoded IDs so Netlify only needs `NOTION_API_KEY`.

**How to avoid:** After running `npm run translate:fr`, read `NOTION_DATABASE_FR_ID` from `.env` and paste the UUID directly into the constant in `_data/permitsFr.js` and `_data/documentsFr.js`.

**Warning signs:** Data file logs "No FR permit data found" or returns empty array.

### Pitfall 2: Migration of `translation-index.json`

**What goes wrong:** `.notion-cache/translation-index.json` exists with 39 EN pages. When `npm run translate:fr` runs for the first time, `migrateTranslationIndex()` renames it to `translation-index-en.json`. This is expected and safe, but plan for it.

**Why it happens:** Phase 51 added language-specific index files. The migration runs once on the first real execution (not dry-run).

**How to avoid:** No action needed — migration is automatic. But after running `npm run translate:fr`, verify `.notion-cache/translation-index-en.json` exists (renamed from the original) and `translation-index-fr.json` is created.

**Warning signs:** If `translation-index.json` still exists after the run, migration may have failed. Check if `translation-index-en.json` also exists — if both exist, the script left both (old file becomes stale but harmless).

### Pitfall 3: NOTION_FR_PARENT_PAGE_ID Points to EN Parent

**What goes wrong:** `.env` shows `NOTION_FR_PARENT_PAGE_ID=30b7355e-7f7f-8184-975d-fb18ca69875c`. This is the same value as `NOTION_EN_PARENT_PAGE_ID`. The FR database will be created inside the EN parent page's workspace, not in a dedicated FR section.

**Why it happens:** The value was pre-set in `.env` before Phase 52. It may be intentional (same workspace) or a copy-paste error.

**How to avoid:** Before running the script, verify in Notion that `30b7355e-7f7f-8184-975d-fb18ca69875c` is an appropriate parent page for the FR database. If not, create a dedicated FR parent page and update `.env`.

**Warning signs:** FR database appears nested inside EN pages in Notion workspace.

### Pitfall 4: documentsEn.js Cost Extraction Uses English Keywords

**What goes wrong:** `documentsEn.js` has English fallback keywords for cost parsing: `extractCost(primoDocuments, 'postal payment')` and `extractCost(primoDocuments, 'revenue stamp')`. When the FR translation produces French document names like "bordereau de paiement postal" and "timbre fiscal", neither the IT nor EN keywords match.

**Why it happens:** The FR translated document names in Notion will be in French, not Italian or English.

**How to avoid:** In `_data/documentsFr.js`, add FR fallbacks to `extractCost()` calls:
```javascript
const costBollettinoPrimo =
  extractCost(primoDocuments, 'bollettino') ||
  extractCost(primoDocuments, 'bordereau') ||  // FR
  extractCost(primoDocuments, 'postal payment');
const costMarcaBolloPrimo =
  extractCost(primoDocuments, 'marca da bollo') ||
  extractCost(primoDocuments, 'timbre') ||  // FR
  extractCost(primoDocuments, 'revenue stamp');
```

**Warning signs:** Cost section missing on FR document pages even though costs appear in document list.

### Pitfall 5: Stale EN Static Pages in `en/src/pages/` Block Future EN Pagination

**What goes wrong:** There are 60+ static HTML files in `en/src/pages/` (e.g., `permesso-studio.html`). These are from before the EN pipeline was fully 11ty-driven. They may be gitignored or handled by `eleventy.config.mjs`. Not a blocker for Phase 52, but adding FR pages to `fr/src/pages/` should follow the same pattern — only pagination templates go there, not static permit pages.

**Why it happens:** History of gradual migration to 11ty.

**How to avoid:** Phase 52 only creates data files (`_data/permitsFr.js`, `_data/documentsFr.js`). The `fr/` directory structure and Liquid templates are Phase 53's work.

## Code Examples

### Running the Translation

```bash
# Source: scripts/translate-notion.js CLI (verified by reading source)
# Dry run first — no API calls, see what will be translated
npm run translate:fr:dry

# Full run — creates FR DB, translates 41 permits
npm run translate:fr

# Single permit test (verify first permit works before running all)
node scripts/translate-notion.js --lang fr --permit studio
```

### FR Permits Data File (`_data/permitsFr.js`)

```javascript
// Source: _data/permitsEn.js pattern (verified)
require('dotenv').config();
const { Client } = require("@notionhq/client");
const cache = require('../scripts/notion-cache');
const { escapeHtml } = require('../scripts/templates/helpers.js');

// FR Notion database ID (hardcoded — get from .env after running translate:fr)
const FR_DATABASE_ID = "PASTE_FR_DB_ID_HERE";
const IT_DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";

// ... (all helper functions identical to permitsEn.js) ...

module.exports = async function() {
  if (!process.env.NOTION_API_KEY) {
    console.warn('[permitsFr.js] NOTION_API_KEY not set - returning empty array');
    return [];
  }
  // Fetch from FR_DATABASE_ID, resolve slugs via IT_DATABASE_ID
  // Page title property: "Name" (same as EN DB)
  // Slug: via "IT Page ID" rich_text property (same as EN)
};
```

### FR Documents Data File (`_data/documentsFr.js`)

```javascript
// Source: _data/documentsEn.js pattern (verified)
const FR_DATABASE_ID = "PASTE_FR_DB_ID_HERE";
const IT_DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";

// Add FR keyword fallbacks to extractCost calls
const costBollettinoPrimo =
  extractCost(primoDocuments, 'bollettino') ||
  extractCost(primoDocuments, 'bordereau') ||
  extractCost(primoDocuments, 'postal payment');
const costMarcaBolloPrimo =
  extractCost(primoDocuments, 'marca da bollo') ||
  extractCost(primoDocuments, 'timbre') ||
  extractCost(primoDocuments, 'revenue stamp');
```

### Verifying the FR DB After Translation

```bash
# After npm run translate:fr completes:
# 1. Check .env has FR DB ID
grep NOTION_DATABASE_FR_ID .env

# 2. Check translation index created
ls .notion-cache/translation-index-fr.json

# 3. Check translation memory created
ls scripts/translation-memory/it-fr.json

# 4. Verify 11ty can fetch FR data (dry build)
npm run build 2>&1 | grep -E '(permitsFr|documentsFr|FR|Error)'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual static EN translations | Claude API + Notion DB pipeline | Phase 48/51 | FR uses same automated pipeline — no manual work needed |
| Single `translation-index.json` | Language-specific `translation-index-{lang}.json` | Phase 51 | FR gets its own index; no collision with EN state |
| Global glossary.terms | Per-language glossary keys (`termsFr`) | Phase 51 | FR uses 32 dedicated French immigration terms |

## Open Questions

1. **Parent page for FR database**
   - What we know: `NOTION_FR_PARENT_PAGE_ID=30b7355e-7f7f-8184-975d-fb18ca69875c` — same value as EN parent
   - What's unclear: Is this intentional (both languages share a workspace page) or a copy-paste error from Phase 51 setup?
   - Recommendation: Verify in Notion UI that this page is appropriate before running translate:fr. If wrong, create a new Notion page and update `.env`.

2. **41 vs 43 permits**
   - What we know: Dry run shows 41 IT permits found by the script. MEMORY.md says "43 permits generated flat from Notion."
   - What's unclear: Whether 2 permits are placeholders/skipped by the search filter, or if the count changed since MEMORY.md was written.
   - Recommendation: Not a blocker. The script correctly filters `[DUPLICATE]` entries. The resulting FR DB will have however many permits the IT DB currently contains.

3. **FR database schema compatibility with documentsEn.js pattern**
   - What we know: The translate script creates FR DB with the same properties as EN DB (`Doc primo rilascio`, `Doc rinnovo`, etc. — all using Italian names)
   - What's unclear: Whether the translated FR multi_select values for document names and methods will match the expected format in `documentsFr.js` cost extraction
   - Recommendation: Add FR keyword fallbacks to extractCost() as shown in Code Examples above, then verify visually on a sample FR document page after build.

## Sources

### Primary (HIGH confidence)
- `scripts/translate-notion.js` — full source read, FR support verified in `getLangConfig()`, `ensureTargetDatabase()`, and `translateAllProperties()`
- `_data/permitsEn.js` — full source read, exact pattern for `_data/permitsFr.js`
- `_data/documentsEn.js` — full source read, exact pattern for `_data/documentsFr.js` (including cost extraction keywords)
- `scripts/translation-glossary.json` — verified `termsFr` key exists with 32 FR terms
- `.env` — verified `NOTION_FR_PARENT_PAGE_ID` set, `NOTION_DATABASE_FR_ID` not set
- `.notion-cache/` — verified `translation-index.json` exists (39 EN pages), `translation-index-fr.json` does not exist yet
- `scripts/translation-memory/` — verified `it-en.json` exists (1333 entries), `it-fr.json` does not exist yet
- `npm run translate:fr:dry` — executed, confirmed 41 IT permits found and listed
- `package.json` — verified `translate:fr` and `translate:fr:dry` scripts exist

### Secondary (MEDIUM confidence)
- MEMORY.md — "43 permits generated flat from Notion" (dry run shows 41; minor discrepancy, not a blocker)

## Metadata

**Confidence breakdown:**
- Translation script execution: HIGH — source read, dry run executed, FR support verified
- Data file pattern: HIGH — `permitsEn.js` and `documentsEn.js` read in full; FR is a direct copy
- FR cost keyword issue: HIGH — `documentsEn.js` code read, issue identified directly from source
- Parent page question: MEDIUM — env var exists but cannot verify Notion workspace structure without UI access

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable; only invalidated if translate-notion.js API changes)
