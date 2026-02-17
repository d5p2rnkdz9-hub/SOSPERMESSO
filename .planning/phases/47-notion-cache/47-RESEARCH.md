# Phase 47: Notion Cache - Research

**Researched:** 2026-02-18
**Domain:** Local filesystem caching for Notion API responses (Node.js, CommonJS)
**Confidence:** HIGH

## Summary

Phase 47 adds a local file-based cache layer to `_data/permits.js` and `_data/documents.js` so that 11ty builds skip unchanged Notion pages. The core mechanism is straightforward: compare `last_edited_time` from Notion's search response against a previously-saved timestamp stored per-page-ID in a JSON cache file. If the timestamp matches, load the cached response from disk and skip the Notion block fetch.

The permits.js file is the primary bottleneck: it makes 1 search call + 43 individual `notion.blocks.children.list()` calls (one per permit, with 350ms delay), totalling ~15s of API wait time in the current 72s build. The documents.js file makes only a single paginated search call (no block fetches), so caching it reduces network time but not dramatically.

The correct caching architecture has two layers: (1) a **page-list cache** that stores the last-seen `last_edited_time` per page ID (from the search response), and (2) a **block cache** that stores the full block JSON per page ID (expensive to re-fetch). On each build, the search still runs to get current `last_edited_time` values; only the block fetch is skipped for unchanged pages.

Phase 48's translation script will consume the same cached block data. The cache format must therefore be stable and shared — both `permits.js` (during build) and the future `translate` script must read/write the same cache directory.

**Primary recommendation:** Implement a standalone `scripts/notion-cache.js` CommonJS module that `permits.js` and `documents.js` require. Cache lives at `.notion-cache/` (gitignored). Use `last_edited_time` from the search response as the cache key. The `cache:clear` npm script deletes the cache directory.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js `fs/promises` | built-in | Read/write cache files | Already used in `translation-memory.js`; no extra dependency |
| Node.js `crypto` | built-in | MD5 content hashing (optional) | Already used in translation-memory.js |
| `@notionhq/client` | 5.8.0 (installed) | Notion API access | Already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js `path` | built-in | Construct cache file paths | Always |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Simple JSON files | SQLite (better-sqlite3) | SQL overkill; JSON is sufficient for ~50 pages |
| Simple JSON files | Redis or node-cache | Remote/in-memory overkill; filesystem persists across builds |
| Per-page JSON files | Single monolithic cache.json | Single file avoids partial write corruption; 50 pages is tiny |
| `.notion-cache/` dir | `node_modules/.cache/` | `.notion-cache/` is more transparent and gitignore-friendly |

**Installation:** No new packages required. All needed modules are built-in or already installed.

---

## Architecture Patterns

### Recommended Project Structure

```
scripts/
└── notion-cache.js          # Shared cache module (new)
.notion-cache/               # Runtime cache directory (gitignored, not committed)
    pages.json               # { [pageId]: { last_edited_time, fetchedAt } }
    blocks/
        {pageId}.json        # Raw block array from notion.blocks.children.list()
```

### Pattern 1: Two-Layer Cache (Page List + Block Content)

**What:** The search response gives `last_edited_time` cheaply (1 API call for all pages). Block content is expensive (1 call per page). Cache blocks separately, keyed by page ID.

**When to use:** Always — this is the only pattern that correctly separates "did this page change?" from "what is this page's content?".

**Flow:**

```
Build start
│
├── Run notion.search() → get all pages with last_edited_time
│
├── Load pages.json cache
│
├── For each page:
│   ├── If page not in cache OR last_edited_time changed:
│   │   ├── MISS: fetch blocks from Notion API
│   │   ├── Write blocks/{pageId}.json
│   │   └── Update pages.json entry
│   └── Else:
│       └── HIT: read blocks/{pageId}.json from disk
│
└── Return processed data to 11ty
```

**Example (notion-cache.js module):**

```js
// Source: codebase patterns from translation-memory.js + Node.js built-ins
const fs = require('fs/promises');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), '.notion-cache');
const PAGES_INDEX_PATH = path.join(CACHE_DIR, 'pages.json');
const BLOCKS_DIR = path.join(CACHE_DIR, 'blocks');

async function loadPagesIndex() {
  try {
    const data = await fs.readFile(PAGES_INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function savePagesIndex(index) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(PAGES_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
}

async function getBlocks(pageId) {
  const blockPath = path.join(BLOCKS_DIR, `${pageId}.json`);
  try {
    const data = await fs.readFile(blockPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null; // cache miss
  }
}

async function setBlocks(pageId, blocks) {
  await fs.mkdir(BLOCKS_DIR, { recursive: true });
  const blockPath = path.join(BLOCKS_DIR, `${pageId}.json`);
  await fs.writeFile(blockPath, JSON.stringify(blocks), 'utf-8');
}

async function clearCache() {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
    console.log('[notion-cache] Cache cleared');
  } catch {
    // Already gone
  }
}

module.exports = { loadPagesIndex, savePagesIndex, getBlocks, setBlocks, clearCache };
```

### Pattern 2: Integration in permits.js

**What:** Replace the existing `fetchPageBlocks(notion, permit.id)` call with a cache-aware wrapper.

**Before (current):**

```js
// Always fetches from Notion — no cache
const blocks = await fetchPageBlocks(notion, permit.id);
```

**After (cached):**

```js
const cache = require('../scripts/notion-cache');

// Load cache index once before the loop
const pagesIndex = await cache.loadPagesIndex();
let hits = 0, misses = 0;

for (const permit of filteredPermits) {
  const cached = pagesIndex[permit.id];
  const changed = !cached || cached.last_edited_time !== permit.last_edited_time;

  let blocks;
  if (!changed) {
    blocks = await cache.getBlocks(permit.id);
    if (blocks) {
      hits++;
    } else {
      // Block file missing despite index entry — treat as miss
      changed = true;
    }
  }

  if (changed) {
    misses++;
    await delay(350); // rate limiting
    blocks = await fetchPageBlocks(notion, permit.id);
    await cache.setBlocks(permit.id, blocks);
    pagesIndex[permit.id] = { last_edited_time: permit.last_edited_time, fetchedAt: new Date().toISOString() };
  }

  // ... rest of processing unchanged
}

// Save updated index
await cache.savePagesIndex(pagesIndex);
console.log(`[permits.js] Cache: ${hits} hits, ${misses} misses`);
```

### Pattern 3: Cache-Clear npm Script

**What:** A simple Node.js one-liner added to `package.json` scripts.

```json
"cache:clear": "node -e \"require('./scripts/notion-cache').clearCache()\""
```

This satisfies CACHE-03 without a separate script file.

### Anti-Patterns to Avoid

- **Caching the entire search response as a blob:** The search response contains all pages; if one page changes, a whole-response cache forces a full re-fetch of everything. Cache per-page instead.
- **Using `last_edited_time` for the block cache key only:** You still need to run the search every build to discover which pages changed. The search result itself is cheap; block fetches are expensive.
- **Writing blocks synchronously during the main loop:** Use `fs/promises` (async) consistently, matching the rest of the codebase pattern.
- **Committing `.notion-cache/` to git:** The cache contains raw Notion API responses (potentially large). It must be gitignored. Phase 48's translate script runs separately and will re-populate the cache on first run.
- **Storing blocks in pages.json:** Keep the index (timestamps) and content (blocks) separate. The index is tiny and safe to serialize atomically; blocks can be large per-page JSON.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cache file locking | Custom file lock | Accept last-write-wins | 11ty builds are single-process; concurrent writes don't happen |
| Cache expiry/TTL | Time-based eviction | `last_edited_time` comparison | Notion's own timestamp is the authoritative freshness signal |
| Compression | gzip for block files | Plain JSON | ~50 pages, each block file likely < 50KB; compression not worth complexity |
| Cache-aside library | `keyv`, `node-cache` | Plain `fs/promises` + JSON | Codebase already uses plain fs for translation-memory.js; consistency matters |

**Key insight:** The `last_edited_time` field from Notion's search response is already read by `permits.js` (line 83: `last_edited_time: page.last_edited_time || null`). The entire cache mechanism hangs on comparing this field — no custom change detection needed.

---

## Common Pitfalls

### Pitfall 1: Forgetting to Run Search Every Build

**What goes wrong:** Caching the search response too aggressively means new Notion pages are never discovered, and deleted pages persist in the cache forever.

**Why it happens:** Seems logical to cache the list of pages since it costs an API call.

**How to avoid:** Always run `notion.search()` on every build. Only skip the **block fetch** for pages whose `last_edited_time` hasn't changed. The search is paginated but fast (typically 1-2 calls for 43 permits).

**Warning signs:** Build shows 0 misses even after editing a Notion page.

### Pitfall 2: `last_edited_time` Granularity

**What goes wrong:** Notion's `last_edited_time` is an ISO-8601 string (e.g. `"2026-02-17T14:30:00.000Z"`). If you compare as Date objects instead of strings, floating-point rounding or timezone differences could cause false misses.

**Why it happens:** Developers coerce to `new Date()` before comparing.

**How to avoid:** Compare `last_edited_time` strings directly with `===`. They are consistently formatted by Notion's API and safe for string equality.

### Pitfall 3: Block Cache Miss After Index Hit

**What goes wrong:** The pages index says a page is cached, but the block file is missing (e.g. deleted manually, `.notion-cache/blocks/` deleted but `pages.json` not). The code tries to use a null block array.

**Why it happens:** Cache directory partially cleared, or first-run race condition.

**How to avoid:** After reading from cache, check for null explicitly. If `getBlocks()` returns null, treat as cache miss and re-fetch. The example code above already shows this pattern.

### Pitfall 4: documents.js Doesn't Need Block Caching

**What goes wrong:** Over-engineering documents.js to cache blocks when it doesn't fetch blocks at all.

**Why it happens:** Reading the plan too quickly.

**How to avoid:** `documents.js` only calls `notion.search()` once — no per-page block fetches. Its caching benefit is minimal (saves ~1 API call). The main value of updating `documents.js` is: (a) consistency, and (b) letting Phase 48's translate script reuse the search results without another API hit. Consider whether to update `documents.js` at all in Phase 47 vs. Phase 48.

### Pitfall 5: Cache Not gitignored

**What goes wrong:** `.notion-cache/` gets committed to git, bloating the repo with Notion API responses.

**Why it happens:** Developer forgets to add the directory to `.gitignore`.

**How to avoid:** Add `.notion-cache/` to `.gitignore` immediately when creating the cache module. The current `.gitignore` already has `_site/` and `node_modules/` as models.

### Pitfall 6: 11ty Data File Caching Side Effect

**What goes wrong:** 11ty calls data files on every build; if the data file writes to disk as a side effect, it runs during `--serve` watch mode too — potentially overwriting cache on every file change.

**Why it happens:** 11ty watch mode calls `_data/` files on each re-build.

**How to avoid:** The side effect (writing cache) is acceptable — it just updates timestamps. The cache is still valid; it just gets re-verified. No correctness issue, minor performance hit during dev. Not worth special handling.

---

## Code Examples

Verified patterns from the existing codebase:

### Existing pattern from translation-memory.js (HIGH confidence — in repo)

```js
// Source: scripts/translation-memory.js (codebase)
async function loadTranslationMemory(sourceLang, targetLang) {
  const filePath = path.join(MEMORY_DIR, `${sourceLang}-${targetLang}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {}; // graceful miss
  }
}

async function saveTranslationMemory(sourceLang, targetLang, memory) {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
  const filePath = path.join(MEMORY_DIR, `${sourceLang}-${targetLang}.json`);
  await fs.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf-8');
}
```

The notion-cache module follows exactly this pattern. The project already knows it works.

### Existing last_edited_time in permits.js (HIGH confidence — in repo)

```js
// Source: _data/permits.js line 83
last_edited_time: page.last_edited_time || null,
```

`last_edited_time` is already extracted from the Notion search response. No new API fields needed.

### npm cache:clear script pattern (HIGH confidence — from existing npm scripts)

```json
// Source: package.json scripts — existing pattern
"tm:stats": "node -e \"const tm = require('./scripts/translation-memory'); ...\""
```

Use same inline node -e pattern for `cache:clear`:

```json
"cache:clear": "node -e \"require('./scripts/notion-cache').clearCache()\""
```

### Notion search response structure (HIGH confidence — running code)

The search already returns `last_edited_time` for each page:

```js
// From notion.search() response (current permits.js uses this)
page.last_edited_time  // e.g. "2026-02-17T14:30:00.000Z"
page.id                // e.g. "3097355e-7f7f-819c-af33-d0fd0739cc5b"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MD5 hash of rendered HTML | `last_edited_time` string from Notion API | Phase 47 | More reliable; Notion manages its own timestamps |
| Manifest JSON tracking translated pages | Per-page JSON block cache | Phase 47 | More granular; blocks cached separately from page list |

**Prior art in this codebase:**

- `scripts/translation-manifest.json` — tracks which pages have been translated (simple JSON manifest, same pattern)
- `scripts/translation-memory/` — directory of JSON files keyed by content hash, same filesystem cache pattern
- `_data/` manifest-based incremental builds mentioned in PROJECT.md as "Manifest-based incremental builds" (v1.7)

---

## Implementation Scope

### What Phase 47 touches

1. **New file:** `scripts/notion-cache.js` — shared cache module
2. **Modified:** `_data/permits.js` — add cache-aware block fetching
3. **Modified:** `_data/documents.js` — optionally add cache for the search result (lower priority)
4. **Modified:** `package.json` — add `cache:clear` script
5. **Modified:** `.gitignore` — add `.notion-cache/`
6. **New directory:** `.notion-cache/` (runtime, gitignored)

### What Phase 47 does NOT touch

- Liquid templates
- The `npm run translate` script (Phase 48's concern)
- EN data files (Phase 49's concern)
- Any `_site/` output

### Size estimate for cache

- 43 permit pages × ~5-20KB per block JSON = ~430KB total for block cache
- `pages.json` index: ~43 entries × ~100 bytes = ~4KB
- Total cache: well under 1MB — no storage concern

---

## Open Questions

1. **Should documents.js be cached in Phase 47?**
   - What we know: documents.js makes 1 search call only (no block fetches). Caching it in Phase 47 has minimal build-time benefit but would let Phase 48's translate script avoid a redundant search call.
   - What's unclear: Whether Phase 48 will need the search result or can just use what permits.js already caches.
   - Recommendation: Cache documents.js search result too, for consistency and Phase 48 prep. The cost is ~10 lines of code.

2. **Should Phase 47 include a `cache:warm` command?**
   - What we know: First run after implementing cache will be as slow as current (all misses). Subsequent runs will be fast.
   - What's unclear: Whether the user wants a standalone warmup script vs. just "run build once."
   - Recommendation: No separate warm command. `npm run build` already warms the cache. Document this in the plan.

3. **Phase 48 cache sharing: read-only or read-write?**
   - What we know: STATE.md says "Phase 48's translation script will read the same cached data."
   - What's unclear: Whether `npm run translate` should also UPDATE the cache (write new `last_edited_time` after reading) or treat it as read-only.
   - Recommendation: `npm run translate` should be read-only from the block cache perspective. The build's `permits.js` is the sole writer. Phase 48 can read block JSON from `.notion-cache/blocks/` directly without modifying the cache.

---

## Sources

### Primary (HIGH confidence)

- `_data/permits.js` (codebase) — exact current API call patterns, rate limiting, `last_edited_time` field usage
- `_data/documents.js` (codebase) — exact current search-only pattern
- `scripts/translation-memory.js` (codebase) — filesystem cache pattern to replicate
- `package.json` (codebase) — existing npm script patterns
- `.gitignore` (codebase) — what's already gitignored

### Secondary (MEDIUM confidence)

- `.planning/ROADMAP.md` — Phase 47 requirements and success criteria
- `.planning/PROJECT.md` — technical debt description confirming build time issue

### Tertiary (LOW confidence)

- None — all findings verified against codebase directly.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools already in codebase, no new dependencies
- Architecture: HIGH — cache pattern directly mirrors `translation-memory.js` which works
- Pitfalls: HIGH — most identified from reading actual code; one (gitignore) from project conventions

**Research date:** 2026-02-18
**Valid until:** Stable — this is internal infrastructure, not a fast-moving ecosystem
