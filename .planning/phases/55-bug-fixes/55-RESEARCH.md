# Phase 55: Bug Fixes - Research

**Researched:** 2026-02-19
**Domain:** 11ty data files, Notion property name mapping, project conventions
**Confidence:** HIGH

## Summary

Phase 55 contains exactly two bug fixes, both small and surgical. No new libraries, no new architecture — only string literal corrections and a pattern alignment.

**BUG-01** is a Notion field name mismatch. Both `_data/documents.js` and `_data/permits.js` read a Notion property called `"Info extra su doc rilascio"` but the actual field name in the Notion database is `"Info extra su doc rilascio/rinnovo"` (with `/rinnovo` appended). Because the property name does not match, the Notion API returns an empty or undefined value, the code falls back to an empty string, and `docNotes` is always `null`. The Liquid templates already correctly consume `doc.docNotes` via the `parseDocNotes` filter — the entire display path works, it just never receives data. Fixing the two string literals is sufficient.

**BUG-02** is a project convention inconsistency. `_data/prassiLocali.js` reads its database ID from `process.env.PRASSI_DB_ID` at line 10, while every other data file (`documents.js`, `permits.js`, etc.) hardcodes its database ID as a `const` at module top-level. The fix is to replace the `process.env` read with the literal UUID. The hardcoded value is `3027355e7f7f80f6957ec3107a5f7aa4` (confirmed from local `.env`). The `PRASSI_DB_ID` env var must continue to exist in Netlify Functions (`submit-prassi.mjs` still reads it from env at runtime — that is correct and must not change).

**Primary recommendation:** Change two string literals in two data files (BUG-01) and replace one `process.env` read with a hardcoded UUID (BUG-02). Total code change: approximately 4 lines across 3 files.

---

## Standard Stack

No new dependencies. All fixes operate on existing project code.

### Existing files touched

| File | Change type | Line(s) |
|------|------------|---------|
| `_data/documents.js` | String literal rename | Line 120 |
| `_data/permits.js` | String literal rename | Line 71 |
| `_data/prassiLocali.js` | Replace env var read with hardcoded const | Line 10 |

---

## Architecture Patterns

### Pattern in use: hardcoded DB IDs in data files

All 11ty data files follow this pattern:

```javascript
// _data/documents.js — established pattern (HIGH confidence, read from source)
const DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";
```

```javascript
// _data/permits.js — same pattern (HIGH confidence, read from source)
const DATABASE_ID = "3097355e-7f7f-819c-af33-d0fd0739cc5b";
```

`_data/prassiLocali.js` deviates from this — it does:

```javascript
// CURRENT (wrong pattern for a data file):
const PRASSI_DB_ID = process.env.PRASSI_DB_ID;
```

The fix aligns it to the established convention:

```javascript
// AFTER FIX:
const PRASSI_DB_ID = "3027355e7f7f80f6957ec3107a5f7aa4";
```

Note: `netlify/functions/submit-prassi.mjs` reads `process.env.PRASSI_DB_ID` at function runtime — this is correct and must remain unchanged. The fix is only to `_data/prassiLocali.js`.

### Pattern in use: Notion property name lookup

Notion properties are accessed by exact string name match. A wrong name returns `undefined`, and the code's optional-chaining fallback silently produces an empty array/string:

```javascript
// _data/documents.js line 120 — CURRENT (broken):
const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];

// AFTER FIX:
const docNotesRichText = page.properties["Info extra su doc rilascio/rinnovo"]?.rich_text || [];
```

```javascript
// _data/permits.js line 71 — CURRENT (broken):
const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];

// AFTER FIX:
const docNotesRichText = page.properties["Info extra su doc rilascio/rinnovo"]?.rich_text || [];
```

### Data flow for docNotes (BUG-01)

The full chain once fixed:

1. **Notion DB** has property `"Info extra su doc rilascio/rinnovo"` (rich_text type)
2. **`_data/documents.js`** reads it → joins `plain_text` segments → stores as `docNotes` string on each primo/rinnovo entry
3. **`_data/permits.js`** reads it → same join → stores as `docNotes` on each permit entry (used by `permits.liquid`)
4. **`documents-primo.liquid` / `documents-rinnovo.liquid`** at lines 131 and 174 respectively:
   ```liquid
   {%- assign notesSections = doc.docNotes | parseDocNotes -%}
   {%- if notesSections.size > 0 -%}
   <!-- renders notes section -->
   {%- endif -%}
   ```
5. **`permits.liquid`** does NOT render `docNotes` — the permit template only renders `permit.sections` (Q&A blocks). `docNotes` is fetched into permit data but not consumed by the permit template. No template change needed.

The templates are correct. Only the data files need fixing.

---

## Don't Hand-Roll

No custom solutions needed. These are one-line string corrections.

| Problem | Don't Build | Use Instead |
|---------|------------|-------------|
| Verifying correct Notion field name | Custom Notion API explorer | Read field name from Notion UI or `.env` value reference |
| Finding PRASSI_DB_ID value | New env var lookup | Use value already in `.env`: `3027355e7f7f80f6957ec3107a5f7aa4` |

---

## Common Pitfalls

### Pitfall 1: Changing PRASSI_DB_ID in the Netlify Function
**What goes wrong:** Developer changes `process.env.PRASSI_DB_ID` to a hardcoded value in `netlify/functions/submit-prassi.mjs` as well as in `_data/prassiLocali.js`.
**Why it happens:** Looks consistent with the fix.
**How to avoid:** The function runs at request time on Netlify's servers — env vars are correct there. Only the build-time data file needs hardcoding. Leave `submit-prassi.mjs` unchanged.
**Warning signs:** Any edit to files under `netlify/functions/` during this phase is wrong.

### Pitfall 2: Using dashes in the PRASSI_DB_ID constant
**What goes wrong:** Hardcoded UUID written with dashes (`3027355e-7f7f-80f6-957e-c3107a5f7aa4`) instead of the raw form from `.env` (`3027355e7f7f80f6957ec3107a5f7aa4`).
**Why it happens:** UUIDs are normally written with dashes; the `.env` value has none.
**How to avoid:** Copy the value from `.env` line 4 exactly: `3027355e7f7f80f6957ec3107a5f7aa4`. The Notion SDK handles both formats, but use the form from `.env` for consistency.

### Pitfall 3: Editing the graceful degradation check for PRASSI_DB_ID
**What goes wrong:** After hardcoding the value, the `if (!PRASSI_DB_ID)` guard at line 23 is removed as "no longer needed."
**Why it happens:** It looks dead code after hardcoding.
**How to avoid:** Leave the guard in place. It still provides value: if the constant is ever accidentally cleared or set to undefined, the file degrades gracefully instead of crashing the build.

### Pitfall 4: Missing the second occurrence in permits.js
**What goes wrong:** Only `documents.js` is fixed; `permits.js` at line 71 is overlooked.
**Why it happens:** The comment in `permits.js` says the same thing (`"Info extra su doc rilascio"`) and is easy to miss since `permits.liquid` doesn't visibly render `docNotes`.
**How to avoid:** Fix both files. Even though the permit template doesn't currently render `docNotes`, the data file should be correct. Phase 60 may use this field.

---

## Code Examples

### BUG-01: Exact change in `_data/documents.js`

```javascript
// Source: _data/documents.js lines 119-121
// BEFORE:
// Get document notes from "Info extra su doc rilascio" field
const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];
const docNotes = docNotesRichText.map(segment => segment.plain_text || '').join('');

// AFTER:
// Get document notes from "Info extra su doc rilascio/rinnovo" field
const docNotesRichText = page.properties["Info extra su doc rilascio/rinnovo"]?.rich_text || [];
const docNotes = docNotesRichText.map(segment => segment.plain_text || '').join('');
```

### BUG-01: Exact change in `_data/permits.js`

```javascript
// Source: _data/permits.js lines 70-72 (inside fetchPermitData function)
// BEFORE:
// Get document notes from "Info extra su doc rilascio" field
const docNotesRichText = page.properties["Info extra su doc rilascio"]?.rich_text || [];
const docNotes = docNotesRichText.map(segment => segment.plain_text || '').join('');

// AFTER:
// Get document notes from "Info extra su doc rilascio/rinnovo" field
const docNotesRichText = page.properties["Info extra su doc rilascio/rinnovo"]?.rich_text || [];
const docNotes = docNotesRichText.map(segment => segment.plain_text || '').join('');
```

### BUG-02: Exact change in `_data/prassiLocali.js`

```javascript
// Source: _data/prassiLocali.js lines 7-10
// BEFORE:
require('dotenv').config();
const { Client } = require("@notionhq/client");

const PRASSI_DB_ID = process.env.PRASSI_DB_ID;

// AFTER:
require('dotenv').config();
const { Client } = require("@notionhq/client");

const PRASSI_DB_ID = "3027355e7f7f80f6957ec3107a5f7aa4";
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-----------------|--------------|--------|
| `process.env.PRASSI_DB_ID` in data file | Hardcoded constant | Phase 55 | Removes env var dependency from build time; aligns with `documents.js` and `permits.js` pattern |
| `"Info extra su doc rilascio"` field name | `"Info extra su doc rilascio/rinnovo"` | Phase 55 | Notes become visible on all document pages that have editorial notes in Notion |

---

## Open Questions

1. **Does any Notion DB row actually have content in `"Info extra su doc rilascio/rinnovo"`?**
   - What we know: the field exists (it is named in the bug report). The field was previously read under the wrong name, so we cannot confirm from the built site whether data exists.
   - What's unclear: whether there is test data in Notion to validate the fix visually.
   - Recommendation: After fixing, run a build and check one permit page that is known to have notes. If no notes are visible, the Notion DB may not yet have content in that field — but the fix is still correct.

2. **Dasherized vs non-dasherized PRASSI_DB_ID format**
   - What we know: `.env` contains `3027355e7f7f80f6957ec3107a5f7aa4` (no dashes).
   - What's unclear: whether Notion's filter comparison (`page.parent?.database_id === PRASSI_DB_ID`) requires dashes.
   - Recommendation: Use the exact format from `.env`. The search+filter approach already works (Phase 41 shipped with this code). The format was working when `PRASSI_DB_ID` came from env; keep the same value.

---

## Sources

### Primary (HIGH confidence)
- `_data/documents.js` — lines 119-121: field name `"Info extra su doc rilascio"`, docNotes flow
- `_data/permits.js` — lines 70-72: same field name in `fetchPermitData()`
- `_data/prassiLocali.js` — line 10: `process.env.PRASSI_DB_ID` pattern
- `src/pages/documents-primo.liquid` — lines 131-145: `parseDocNotes` filter consumption
- `src/pages/documents-rinnovo.liquid` — lines 174-188: same filter, same pattern
- `src/pages/permits.liquid` — full file: confirms `docNotes` is NOT rendered in permit template
- `.env` — line 4: `PRASSI_DB_ID=3027355e7f7f80f6957ec3107a5f7aa4`
- `.planning/STATE.md` — confirms BUG-02 intent: "hardcoded in `_data/prassiLocali.js` (da fixare in Phase 55)"
- `.planning/ROADMAP.md` — Phase 55 success criteria

### Secondary (MEDIUM confidence)
- `netlify/functions/submit-prassi.mjs` — grep confirms it uses `process.env.PRASSI_DB_ID` independently; must remain unchanged

---

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH — field names and line numbers read directly from source files
- Fix values: HIGH — PRASSI_DB_ID from `.env`, field name from bug specification
- Template impact: HIGH — templates read directly, no rendering of `docNotes` in `permits.liquid` confirmed
- Scope of change: HIGH — 3 files, 2-3 lines each, no new dependencies

**Research date:** 2026-02-19
**Valid until:** Stable — these are static string constants, not API-dependent
