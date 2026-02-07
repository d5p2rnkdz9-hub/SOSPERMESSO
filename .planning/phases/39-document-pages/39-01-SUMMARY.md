---
phase: 39-document-pages
plan: 01
subsystem: build-infrastructure
tags: [11ty, notion-api, data-layer, liquid-filters]
requires:
  - Phase 35 (11ty setup)
  - Phase 36 (data layer patterns)
  - scripts/notion-client.js (Notion API logic)
  - scripts/templates/helpers.js (template helpers)
provides:
  - _data/documents.js (async data file)
  - _data/slugMap.js (redirect mappings)
  - 6 Liquid filters for templates
affects:
  - Phase 39-02 (document page templates will use this data)
  - Phase 39-03 (redirect generation will use slugMap)
tech-stack:
  added:
    - "@notionhq/client integration in 11ty data files"
  patterns:
    - "ESM to CommonJS import via createRequire"
    - "Async data files in 11ty"
    - "Graceful degradation for missing API keys"
key-files:
  created:
    - _data/documents.js
    - _data/slugMap.js
  modified:
    - eleventy.config.mjs
decisions:
  - id: separate-primo-rinnovo-arrays
    choice: "Return {primo: [], rinnovo: []} structure from documents.js"
    rationale: "Enables 11ty pagination to use documents.primo and documents.rinnovo directly"
    alternatives: "Single flat array with type field (would require filtering in templates)"
  - id: graceful-degradation
    choice: "Return empty arrays when NOTION_API_KEY missing, don't fail build"
    rationale: "Allows local development without API key, prevents build failures"
  - id: createRequire-pattern
    choice: "Use createRequire to import CommonJS helpers.js from ESM config"
    rationale: "Config is ESM, helpers is CommonJS - this is the standard interop pattern"
metrics:
  duration: "2m 49s"
  completed: "2026-02-07"
---

# Phase 39 Plan 01: Data Layer for Document Pages Summary

**One-liner:** Created 11ty data files for Notion document fetching and registered 6 Liquid filters for template helpers

## What Was Built

### Core Deliverables

1. **_data/documents.js** - Async data file that fetches permit document data from Notion
   - Returns object with separate `primo` and `rinnovo` arrays
   - Graceful degradation when NOTION_API_KEY not set
   - Extracts tipo, slug, documents, method, docNotes per permit
   - Uses notion.search() API (workaround for permission issues)

2. **_data/slugMap.js** - Static data file for redirect mappings
   - Exports 19 redirect mappings from short to canonical slugs
   - Makes slug map available to templates as `slugMap.mappings`

3. **eleventy.config.mjs** - Registered 6 Liquid filters
   - `linkToDizionario` - Convert document names to HTML with dizionario links
   - `normalizeDocumentName` - Normalize document names (capitalize, fix spacing)
   - `getDocumentClass` - Return CSS class for document items
   - `isDisputed` - Check if document is disputed (varies by Questura)
   - `escapeHtml` - Escape HTML special characters to prevent XSS
   - `parseDocNotes` - Parse document notes into Q&A sections

### Technical Implementation

**Data file pattern:**
```javascript
// _data/documents.js
module.exports = async function() {
  // Fetch from Notion, return {primo: [], rinnovo: []}
};
```

**ESM to CommonJS import:**
```javascript
// eleventy.config.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const helpers = require('./scripts/templates/helpers.js');
```

**Graceful degradation:**
```javascript
if (!process.env.NOTION_API_KEY) {
  console.warn('[documents.js] NOTION_API_KEY not set - returning empty arrays');
  return { primo: [], rinnovo: [] };
}
```

## Key Decisions Made

### 1. Separate primo and rinnovo arrays
**Decision:** Return `{primo: [], rinnovo: []}` structure from documents.js

**Rationale:** Enables 11ty pagination to use `documents.primo` and `documents.rinnovo` directly without filtering logic in templates.

**Alternative considered:** Single flat array with type field (would require template-side filtering)

### 2. Graceful degradation for missing API key
**Decision:** Return empty arrays when NOTION_API_KEY not set, don't fail build

**Rationale:**
- Allows local development without API key
- Prevents build failures in CI/CD before environment variables are set
- Follows fail-safe pattern

**Alternative considered:** Throw error and fail build (would block development)

### 3. Use createRequire for ESM/CommonJS interop
**Decision:** Import CommonJS helpers.js from ESM config via createRequire

**Rationale:**
- Config file is ESM (eleventy.config.mjs)
- helpers.js is CommonJS (module.exports)
- createRequire is the standard Node.js interop pattern

**Alternative considered:** Convert helpers.js to ESM (would require updating all scripts)

## Tasks Completed

| Task | Description | Commit | Key Files |
|------|-------------|--------|-----------|
| 1 | Create documents.js data file | 75c65c4 | _data/documents.js |
| 2 | Register Liquid filters | 3dadb39 | eleventy.config.mjs |
| 3 | Add slug-map data | fca86dd | _data/slugMap.js |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification steps passed:

1. ✅ `node -e "require('./_data/documents.js')().then(d => console.log(d.primo.length, d.rinnovo.length))"` - Returns "0 0" (graceful degradation working)
2. ✅ `node -e "console.log(require('./_data/slugMap.js').mappings)"` - Shows 19 redirect mappings
3. ✅ `npx @11ty/eleventy --dryrun` - Completes without filter errors (0.50s build time)

## Integration Points

### Data Flow

```
Notion API (Database 1ad7355e...)
  ↓
_data/documents.js (async fetch)
  ↓
11ty build pipeline
  ↓
documents.primo, documents.rinnovo (available to templates)
```

### Filter Usage in Templates

Templates can now use:
```liquid
{{ documentName | linkToDizionario | safe }}
{{ documentName | normalizeDocumentName }}
<div class="{{ documentName | getDocumentClass }}">
{% if documentName | isDisputed %}...{% endif %}
{{ text | escapeHtml }}
{% assign sections = docNotes | parseDocNotes %}
```

## Next Phase Readiness

**Phase 39-02 (Document Templates)** is ready to proceed:
- ✅ Data layer established
- ✅ Filters registered
- ✅ Graceful degradation in place
- ✅ Build pipeline verified

**Blockers:** None

**Dependencies satisfied:**
- 11ty config supports async data files
- Template helpers exported and available
- Notion API client logic proven (from scripts/notion-client.js)

## Technical Debt / Future Improvements

None identified. Implementation follows established patterns:
- CommonJS for data files (established in Phase 36)
- ESM for config (established in Phase 35)
- Graceful degradation (best practice)

## Lessons Learned

1. **ESM/CommonJS interop:** createRequire is clean and explicit for importing CommonJS from ESM
2. **Async data files:** 11ty handles async data files seamlessly - just export async function
3. **Graceful degradation:** Returning empty arrays instead of throwing errors improves developer experience
4. **Notion API workaround:** notion.search() with parent filtering works when dataSources.query has permission issues

## Documentation Updates Needed

- [ ] Update .planning/PROJECT.md to note data layer is complete
- [ ] Document filter usage in template development guide (future)

---

**Status:** ✅ Complete
**Duration:** 2m 49s
**Commits:** 3 (75c65c4, 3dadb39, fca86dd)
