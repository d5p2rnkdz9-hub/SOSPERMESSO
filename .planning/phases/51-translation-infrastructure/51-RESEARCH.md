# Phase 51: Translation Infrastructure - Research

**Researched:** 2026-02-18
**Domain:** Extending an existing Node.js/Claude API translation pipeline from EN to FR
**Confidence:** HIGH

## Summary

Phase 51 extends the existing `scripts/translate-notion.js` (built in Phase 48) to support French as a target language. The EN pipeline is fully operational and serves as the direct blueprint. The core script already handles section-level hashing, translation memory keyed by language pair, Notion database creation, and Claude API batching. Adding FR requires: (1) a `--lang fr` CLI argument, (2) a FR-specific Notion target database (created like the EN one), (3) a FR glossary embedded in `translation-glossary.json`, and (4) a separate translation index file for FR.

The existing infrastructure is already language-pair aware. `translation-memory.js` stores memory at `scripts/translation-memory/{source}-{target}.json` — so `it-fr.json` will be created automatically when the script runs with `--lang fr`. The `.notion-cache/translation-index.json` currently holds EN mappings; this must become language-specific (e.g., `translation-index-en.json` / `translation-index-fr.json`) or the index schema must be extended to hold separate mappings per target language.

The approach is a targeted refactor of `translate-notion.js`: make the hardcoded EN-specific strings (database IDs, env var names, system prompt language, translation index path) parameterizable by a `lang` argument. No new libraries are needed. No new npm packages are required.

**Primary recommendation:** Add `--lang <code>` to `translate-notion.js`. When `lang=fr`, the script reads the FR database ID from env (`NOTION_DATABASE_FR_ID`), loads the FR glossary from `translation-glossary.json`, uses the FR translation memory (`it-fr.json`), and writes to a FR-specific translation index (`translation-index-fr.json`). Add `npm run translate:fr` as a named shortcut.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | 0.72.1 (installed) | Claude API calls for translation | Already installed, working in EN pipeline |
| `@notionhq/client` | 5.8.0 (installed) | Notion database read/write | Already installed, working in EN pipeline |
| Node.js `crypto` | built-in | MD5 hashing for section/property change detection | Already used in translate-notion.js |
| Node.js `fs/promises` | built-in | Translation index + memory persistence | Already used throughout |
| `dotenv` | 17.2.3 (installed) | Load `.env` for API keys | Already used, must call `require('dotenv').config()` at top of data files |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `scripts/notion-cache.js` | local module | Block-level cache shared across builds | Use for `getPageBlocks()` — already wired in translate-notion.js |
| `scripts/translation-memory.js` | local module | Per-language-pair translation reuse cache | `loadTranslationMemory('it', 'fr')` creates `it-fr.json` automatically |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extending `translate-notion.js` with `--lang` | Creating `translate-notion-fr.js` | Duplicate file = double maintenance burden. Extend existing script. |
| Per-language translation index file | Single index with nested lang keys | Per-file simpler; avoids risk of EN index corruption when FR runs. |
| FR system prompt as separate file | Inline string in script | EN prompt is inline; keep consistent. |

**Installation:** No new packages required. All needed tools already installed.

---

## Architecture Patterns

### Recommended File Changes

```
scripts/
├── translate-notion.js          # MODIFIED — add --lang parameter, make DB IDs/env vars dynamic
├── translation-glossary.json    # MODIFIED — add "fr" section with FR legal/immigration terms
└── translation-memory/
    ├── it-en.json               # Existing (untouched)
    └── it-fr.json               # NEW — auto-created on first FR run

.notion-cache/
├── translation-index.json       # RENAMED → translation-index-en.json (migration step)
├── translation-index-en.json    # EN index (existing data migrated here)
└── translation-index-fr.json    # NEW — auto-created on first FR run

package.json                     # MODIFIED — add "translate:fr" script
.env                             # MODIFIED — add NOTION_DATABASE_FR_ID, NOTION_FR_PARENT_PAGE_ID
```

### Pattern 1: Language-Parameterized Script

**What:** Add `--lang <code>` to `parseArgs()`. Use it to derive all language-specific values at runtime.

**When to use:** Every time a language-specific constant appears in the script.

**Example:**

```js
// Source: scripts/translate-notion.js (codebase) — extended pattern

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    dryRun: false,
    force: false,
    verify: false,
    permit: null,
    help: false,
    lang: 'en',  // NEW — defaults to EN for backward compatibility
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--lang':
        opts.lang = args[++i];
        break;
      // ... existing cases unchanged
    }
  }
  return opts;
}

// Derive language config from --lang value
function getLangConfig(lang) {
  const configs = {
    en: {
      dbEnvVar: 'NOTION_DATABASE_EN_ID',
      parentEnvVar: 'NOTION_EN_PARENT_PAGE_ID',
      translationIndexPath: path.join(cache.CACHE_DIR, 'translation-index-en.json'),
      dbTitle: 'EN - Permits Database',
      langCode: 'en',
    },
    fr: {
      dbEnvVar: 'NOTION_DATABASE_FR_ID',
      parentEnvVar: 'NOTION_FR_PARENT_PAGE_ID',
      translationIndexPath: path.join(cache.CACHE_DIR, 'translation-index-fr.json'),
      dbTitle: 'FR - Permits Database',
      langCode: 'fr',
    },
  };

  const config = configs[lang];
  if (!config) {
    throw new Error(`Unsupported language: "${lang}". Supported: ${Object.keys(configs).join(', ')}`);
  }
  return config;
}
```

### Pattern 2: FR-Specific System Prompt

**What:** The existing `buildTranslationPrompt()` reads from `glossary.terms` (IT→EN). For FR, the glossary needs a separate `termsEn` / `termsFr` structure, or the function must accept a target language.

**Recommended approach:** Add `termsFr` (and rename existing `terms` to `termsEn`) in `translation-glossary.json`. The function receives `lang` and picks the correct terms object.

**Example:**

```js
// Source: scripts/translate-notion.js (codebase) — extended pattern

function buildTranslationPrompt(lang = 'en', glossary) {
  const termsKey = lang === 'fr' ? 'termsFr' : 'termsEn';
  const terms = glossary[termsKey] || glossary.terms; // fallback to existing 'terms' key

  const termLines = Object.entries(terms)
    .map(([it, target]) => `  "${it}" → "${target}"`)
    .join('\n');

  const dntLines = glossary.doNotTranslate
    .map(t => `  - ${t}`)
    .join('\n');

  const targetLangName = lang === 'fr' ? 'French' : 'English';

  return `You are a professional translator specializing in Italian immigration law and bureaucracy. Translate Italian text to ${targetLangName}.

RULES:
1. Use the glossary consistently for all occurrences.
2. Preserve ALL numbers, costs (€ amounts), URLs, and email addresses exactly.
3. Keep the same tone: simple, clear, helpful — like explaining to someone unfamiliar with Italian bureaucracy.
4. Do NOT add explanations or notes — just translate.
5. Preserve any markdown-like formatting markers.
6. Keep Italian legal references (D.Lgs., D.P.R., art., comma) in Italian.

GLOSSARY (always use these translations):
${termLines}

DO NOT TRANSLATE these terms:
${dntLines}

FORMAT:
- You will receive numbered lines.
- Return ONLY the translated lines with the same numbers.
- One translation per line. Keep the "N: " prefix format.`;
}
```

### Pattern 3: Translation Index Migration

**What:** The existing `translation-index.json` holds EN page mappings. When FR is added, a separate index is needed. The existing file must be renamed to `translation-index-en.json` to avoid conflict.

**Migration approach (one-time, in FR first run or as separate migration task):**

```js
// At script startup, auto-migrate if old flat index exists
async function migrateTranslationIndex() {
  const oldPath = path.join(cache.CACHE_DIR, 'translation-index.json');
  const newEnPath = path.join(cache.CACHE_DIR, 'translation-index-en.json');

  try {
    const stat = await fs.stat(oldPath);
    const newStat = await fs.stat(newEnPath).catch(() => null);

    if (stat && !newStat) {
      // Old index exists, new EN index doesn't — migrate
      await fs.rename(oldPath, newEnPath);
      console.log('[translate] Migrated translation-index.json → translation-index-en.json');
    }
  } catch {
    // Old index doesn't exist — nothing to migrate
  }
}
```

### Pattern 4: `npm run translate:fr` npm Script

**What:** Add a named shortcut in package.json for FR (like existing `translate:dry`).

**Example:**

```json
// Source: package.json (codebase) — existing pattern
"translate": "node scripts/translate-notion.js",
"translate:dry": "node scripts/translate-notion.js --dry-run",
"translate:fr": "node scripts/translate-notion.js --lang fr",
"translate:fr:dry": "node scripts/translate-notion.js --lang fr --dry-run"
```

### Pattern 5: FR Glossary in translation-glossary.json

**What:** Add `termsFr` key alongside existing `terms` (EN). The doNotTranslate list is shared.

**Schema extension:**

```json
{
  "meta": { "version": "1.1", ... },
  "terms": { ... },           // RENAME to "termsEn" — backward compat alias
  "termsEn": { ... },         // Same as current "terms"
  "termsFr": {
    "permesso di soggiorno": "titre de séjour",
    "permesso": "titre de séjour",
    "Questura": "Questure (commissariat principal)",
    "Prefettura": "Préfecture",
    "soggiornante di lungo periodo": "résident de longue durée",
    "decreto flussi": "décret annuel sur les quotas d'immigration",
    "kit postale": "kit postal",
    "primo rilascio": "première délivrance",
    "rinnovo": "renouvellement",
    "richiesta asilo": "demande d'asile",
    "protezione internazionale": "protection internationale",
    "protezione sussidiaria": "protection subsidiaire",
    "protezione speciale": "protection spéciale",
    "status di rifugiato": "statut de réfugié",
    "ricongiungimento familiare": "regroupement familial",
    "coesione familiare": "cohésion familiale",
    "motivi familiari": "motifs familiaux",
    "lavoro subordinato": "travail salarié",
    "lavoro autonomo": "travail indépendant",
    "attesa occupazione": "recherche d'emploi",
    "ricerca lavoro": "recherche d'emploi",
    "Commissione Territoriale": "Commission territoriale",
    "Servizio Sanitario Nazionale": "Service national de santé (SSN)",
    "SSN": "SSN (Sécurité sociale italienne)",
    "marca da bollo": "timbre fiscal",
    "bollettino postale": "bordereau de paiement postal",
    "codice fiscale": "code fiscal",
    "carta d'identità": "carte d'identité",
    "dichiarazione ospitalità": "déclaration d'hébergement",
    "contratto di affitto": "contrat de location",
    "cittadino UE": "citoyen UE",
    "cittadino italiano": "citoyen italien",
    "extracomunitario": "ressortissant non-UE",
    "minore": "mineur",
    "maggiorenne": "majeur",
    "visto di ingresso": "visa d'entrée",
    "permesso giallo": "récépissé (permesso giallo)",
    "carta di soggiorno": "carte de séjour"
  },
  "doNotTranslate": [ ... ],   // Unchanged — shared across all languages
  "uiStrings": { ... }         // EN only — FR UI strings handled separately in Phase 53
}
```

### Anti-Patterns to Avoid

- **Hardcoding FR database ID in `translate-notion.js`:** The EN pipeline hardcodes EN DB ID in `_data/permitsEn.js` (for 11ty), but the translate script reads the DB ID from env so it can create it on first run. Keep this env-based approach for FR too.
- **Sharing a single `translation-index.json` across EN and FR:** If FR runs while EN index exists, the script will try to write FR page mappings (frPageId) alongside EN ones with enPageId keys — index corruption risk. Separate files prevent this.
- **Using `terms` key directly in glossary without a rename:** The existing code `const glossary = require('./translation-glossary.json'); Object.entries(glossary.terms)` will break if `terms` is removed. Keep `terms` as a backward-compat alias or update all references.
- **Sending cost amounts to Claude for FR without placeholder protection:** The existing `batchTranslateSegments()` already protects `€` amounts with `__COST0__` placeholders. This must be kept for FR — cost amounts must never be translated.
- **Not validating `--lang` value:** Unsupported language codes should throw a clear error immediately, not fail cryptically mid-run.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Section-level change detection | Custom diffing | Existing `hashSection()` + `detectChanges()` in translate-notion.js | Already handles section-level MD5 comparison — zero new logic needed |
| Translation caching | Custom cache | `scripts/translation-memory.js` with `loadTranslationMemory('it', 'fr')` | Already supports any language pair via filename pattern |
| Notion block caching | Custom fetch | `scripts/notion-cache.js` | Shared with build pipeline — don't duplicate |
| Claude API rate limiting | Custom delays | Existing `delay(CLAUDE_DELAY)` calls | Already handles rate limits with exponential backoff |
| Cost amount protection | Custom logic | Existing `costPattern` + placeholder replacement in `batchTranslateSegments()` | Already battle-tested in EN pipeline |

**Key insight:** The EN pipeline was deliberately built to be reused. Every helper function is already parameterized for the content it operates on. The only hardcoded language assumptions are: (a) the system prompt says "English," (b) glossary.terms is EN-only, and (c) env var names and index file path contain "EN." Fixing those 3 points is the entire scope of Phase 51.

---

## Common Pitfalls

### Pitfall 1: Translation Index Collision

**What goes wrong:** Running `npm run translate --lang fr` with the existing `translation-index.json` (EN data) — the FR run would overwrite it with FR page IDs, destroying the EN mapping. Next EN build would re-translate all 39 permits.

**Why it happens:** The index path is currently hardcoded as `path.join(cache.CACHE_DIR, 'translation-index.json')`.

**How to avoid:** Change the index path to be language-specific: `translation-index-${lang}.json`. Migrate existing file before or during first FR run. See Pattern 3 above.

**Warning signs:** After running FR translate, EN pages show as "new" on next translate run.

### Pitfall 2: Glossary Key Naming Conflict

**What goes wrong:** The script currently reads `glossary.terms` (line 23: `const glossary = require('./translation-glossary.json')`). If `terms` is renamed to `termsEn` without updating the reference, the script throws `Cannot read properties of undefined (reading 'map')`.

**Why it happens:** The glossary refactor touches both the JSON file and the script.

**How to avoid:** Keep `terms` as backward-compat alias (pointing to EN data). Add `termsEn` as explicit key. Update `buildTranslationPrompt()` to read `termsEn` or `termsFr` based on lang. Confirm the existing `tm:stats` npm script still works (it loads translation-memory.js, not the glossary).

**Warning signs:** Script crashes on startup with a TypeError about `glossary.terms`.

### Pitfall 3: FR Notion Database Never Gets Created

**What goes wrong:** `ensureEnDatabase()` currently checks `process.env.NOTION_DATABASE_EN_ID`. If `NOTION_DATABASE_FR_ID` is not set and the function isn't called with the correct env var name, it always tries to create a new DB — even on subsequent runs.

**Why it happens:** The function is hardcoded to read `NOTION_DATABASE_EN_ID`.

**How to avoid:** Pass `langConfig.dbEnvVar` and `langConfig.parentEnvVar` into `ensureEnDatabase()` (rename to `ensureTargetDatabase(notion, langConfig)`). The function then reads `process.env[langConfig.dbEnvVar]` and `process.env[langConfig.parentEnvVar]`. After creating the FR DB, write `NOTION_DATABASE_FR_ID=...` to `.env`.

**Warning signs:** Script creates a new Notion database on every run.

### Pitfall 4: `--lang` Defaults Breaking Existing `npm run translate`

**What goes wrong:** If `--lang` defaults to `fr` instead of `en`, existing `npm run translate` (used by EN pipeline) would route to FR glossary and FR index.

**Why it happens:** Wrong default value.

**How to avoid:** Default `opts.lang = 'en'`. Verify: `npm run translate` (no args) must behave identically to before this change. The `translate:fr` script explicitly passes `--lang fr`.

**Warning signs:** EN translation index grows with FR page IDs.

### Pitfall 5: FR Text Expansion Breaking Length Validation

**What goes wrong:** The `translateText()` function validates response length: `result.length < text.length * 0.2 || result.length > text.length * 4`. French text from Italian is typically 10-20% longer (FR tends to be verbose). This is fine for the upper bound (4x). But if a very short Italian segment becomes longer in FR, the 0.2x lower bound could cause false-positive validation failures.

**Why it happens:** The validation was tuned for IT→EN (similar length). IT→FR expansion ratio differs slightly.

**How to avoid:** The existing bounds (0.2x–4x) are wide enough to handle FR expansion. No change needed — just be aware this validation exists and will not cause false rejections for normal FR output. Monitor on first run.

**Warning signs:** `[translate] Response length suspicious` warnings for valid FR translations.

### Pitfall 6: Notion `Nome permesso` vs `Name` Property Key

**What goes wrong:** In the EN database, the title property is `Name` (not `Nome permesso`). The `translateAllProperties()` function explicitly writes to `'Name'` (line 849). If the FR database uses a different title property name, `pages.update()` will silently fail to set the title.

**Why it happens:** EN DB was created with `title: [{ text: { content: 'EN - Permits Database' } }]` and property `'Name': { title: {} }`. If the FR DB is created identically, `Name` will work. If not, it breaks.

**How to avoid:** Create the FR database identically to the EN one (same `ensureTargetDatabase()` function with `title: 'Name'`). Confirm on first run that FR page titles appear correctly in Notion.

**Warning signs:** FR Notion pages have blank titles.

---

## Code Examples

Verified patterns from the existing codebase:

### Translation Memory — Language-Pair File Naming (HIGH confidence)

```js
// Source: scripts/translation-memory.js (codebase)
// This ALREADY supports any language pair via filename pattern:

async function loadTranslationMemory(sourceLang, targetLang) {
  const filePath = path.join(MEMORY_DIR, `${sourceLang}-${targetLang}.json`);
  // For FR: filePath = scripts/translation-memory/it-fr.json
  // Created automatically on first write — no setup needed
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Usage for FR run:
const memory = await tm.loadTranslationMemory('it', 'fr');
// ...
await tm.saveTranslationMemory('it', 'fr', memory);
```

### Existing CLI Arg Parsing Pattern (HIGH confidence)

```js
// Source: scripts/translate-notion.js:50-73 (codebase)
// Extend this switch with --lang:

case '--lang':
  opts.lang = args[++i];
  break;
```

### Translation Index — Language-Specific Path (HIGH confidence)

```js
// Source: scripts/translate-notion.js:28 (codebase) — current hardcoded path:
const TRANSLATION_INDEX_PATH = path.join(cache.CACHE_DIR, 'translation-index.json');

// Replace with language-aware path derived from lang config:
const TRANSLATION_INDEX_PATH = path.join(cache.CACHE_DIR, `translation-index-${lang}.json`);
// For EN: .notion-cache/translation-index-en.json
// For FR: .notion-cache/translation-index-fr.json
```

### Numbered Line Batching — Already Handles FR (HIGH confidence)

```js
// Source: scripts/translate-notion.js:554-555 (codebase)
// The prompt says "Translate these N lines from Italian to English" — update for FR:
const prompt = `Translate these ${texts.length} lines from Italian to ${targetLangName}:\n\n${numbered}`;
```

### Package.json Script Pattern (HIGH confidence)

```json
// Source: package.json (codebase) — existing pattern to follow
"translate": "node scripts/translate-notion.js",
"translate:dry": "node scripts/translate-notion.js --dry-run",
"translate:fr": "node scripts/translate-notion.js --lang fr",
"translate:fr:dry": "node scripts/translate-notion.js --lang fr --dry-run"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Batch HTML translation (translate-batch.js) | Notion block-level translation (translate-notion.js) | Phase 48 (v3.2) | Much more granular; preserves Notion structure; section hashing possible |
| Single language only | Multi-language via `--lang` param | Phase 51 (this phase) | Enables FR (and future ES) without new script |
| Single `translation-index.json` | Per-language `translation-index-{lang}.json` | Phase 51 (this phase) | Prevents cross-language index corruption |

**The old `translate-batch.js` is NOT the right starting point.** It translates static HTML files and is effectively deprecated for the Notion-based pipeline. The right starting point is `translate-notion.js`.

---

## Open Questions

1. **Should `translation-index.json` migration be automatic or manual?**
   - What we know: Existing `.notion-cache/translation-index.json` contains 39 EN page mappings. If FR runs first and renames the file, it doesn't break EN (EN will use `translation-index-en.json`). If EN runs first after refactor, it should also use `translation-index-en.json`.
   - What's unclear: Whether to auto-migrate the old file (rename on startup if `translation-index.json` exists but `translation-index-en.json` doesn't), or ask the user to rename manually.
   - Recommendation: Auto-migrate in the script. One-time rename at startup. Log clearly: `[translate] Migrated translation-index.json → translation-index-en.json`. No user action required.

2. **Should `glossary.terms` key be kept as an alias or renamed?**
   - What we know: The script reads `glossary.terms` at line 23. Renaming without updating breaks the script.
   - What's unclear: Whether to keep `terms` as a legacy alias for EN, or do a clean rename to `termsEn`.
   - Recommendation: Keep `terms` as-is (pointing to EN data) for backward compatibility. Add `termsEn` as an explicit alias key. Add `termsFr` as a new key. The script's `buildTranslationPrompt(lang, glossary)` reads `glossary[lang === 'fr' ? 'termsFr' : 'terms']`. Clean and minimal change.

3. **FR Notion database — create during Phase 51 or Phase 52?**
   - What we know: `ensureEnDatabase()` creates the EN Notion DB on first run if `NOTION_DATABASE_EN_ID` is missing. The same mechanism can create the FR DB. Phase 52's goal is specifically "FR Notion DB created with translated content."
   - What's unclear: Whether Phase 51 should create the FR DB (as a side effect of the first translate run) or Phase 52 should do it explicitly.
   - Recommendation: Phase 51 implements the script (including `ensureTargetDatabase()` for FR). Phase 52 actually **runs** it, populating the database. The creation of the empty DB is a script behavior, not a separate phase concern.

---

## Sources

### Primary (HIGH confidence)

- `scripts/translate-notion.js` (codebase, 1292 lines) — complete EN translation pipeline: CLI args, section hashing, Claude API batching, Notion read/write, translation index
- `scripts/translation-memory.js` (codebase) — language-pair-aware memory storage (`it-en.json` pattern directly reusable for `it-fr.json`)
- `scripts/notion-cache.js` (codebase) — shared block cache, CACHE_DIR constant used by translate-notion.js
- `scripts/translation-glossary.json` (codebase) — current EN glossary structure (35 terms, doNotTranslate, uiStrings)
- `package.json` (codebase) — npm script patterns and installed dependencies
- `.notion-cache/translation-index.json` (runtime) — confirmed 39 EN page mappings, schema structure
- `scripts/translation-memory/it-en.json` (runtime) — confirms file naming convention for language pairs
- `.env` (codebase, non-secret vars) — confirms `NOTION_DATABASE_EN_ID`, `NOTION_EN_PARENT_PAGE_ID` env var naming pattern

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — TRANS-01, TRANS-03, TRANS-05 definitions
- `.planning/ROADMAP.md` — Phase 51 success criteria and dependency on Phase 47-48
- `.planning/STATE.md` — confirmed decisions: same-pipeline, claude-api, FR-only scope

### Tertiary (LOW confidence)

- French immigration terminology glossary (from Claude knowledge): `titre de séjour`, `regroupement familial`, etc. — these are standard FR legal terms but should be verified by a native French speaker during content review phase. The glossary values provided are correct standard terms, HIGH confidence for the core terms listed.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all tools already installed and working in EN pipeline
- Architecture: HIGH — extending a well-understood existing script; patterns are direct mirrors of working EN code
- Pitfalls: HIGH — all identified from reading actual code; translation index collision is the only non-obvious risk
- FR glossary terms: MEDIUM — standard legal French, but immigration-specific phrasing should be reviewed by a native speaker. Core terms (titre de séjour, regroupement familial) are unambiguous.

**Research date:** 2026-02-18
**Valid until:** Stable — this is internal Node.js infrastructure, not a fast-moving ecosystem. Valid for 60+ days.
