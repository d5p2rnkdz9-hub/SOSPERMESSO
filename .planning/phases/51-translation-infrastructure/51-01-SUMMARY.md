---
phase: 51-translation-infrastructure
plan: 01
subsystem: infra
tags: [translation, notion, claude-api, multi-language, fr, glossary]

requires: []
provides:
  - translate-notion.js with --lang parameter (en, fr) for multi-language support
  - getLangConfig() function mapping lang codes to DB env vars, index paths, glossary keys
  - FR glossary (termsFr) with 38 Italian immigration/legal term mappings
  - Language-specific translation index files (translation-index-en.json, translation-index-fr.json)
  - Auto-migration from old translation-index.json to translation-index-en.json
  - npm scripts translate:fr and translate:fr:dry
affects:
  - 52-fr-notion-db (uses translate:fr to populate FR Notion database)
  - any future language translation phases (uses same getLangConfig pattern)

tech-stack:
  added: []
  patterns:
    - "getLangConfig(lang) factory pattern for language-specific config dispatch"
    - "Translation index files are language-specific to prevent cross-language corruption"

key-files:
  created: []
  modified:
    - scripts/translate-notion.js
    - scripts/translation-glossary.json
    - package.json

key-decisions:
  - "Keep existing 'terms' key (not rename to 'termsEn') for backward compat; FR uses separate 'termsFr' key"
  - "Translation index files are language-specific (translation-index-en.json, translation-index-fr.json)"
  - "Migration from old translation-index.json runs only on non-dry-run to avoid unintended side effects"
  - "Rename internal functions (ensureEnDatabase -> ensureTargetDatabase, findEnPage -> findTargetPage, etc.) for clarity"

patterns-established:
  - "getLangConfig(lang): single entry point for all language-specific config — extend here when adding new language"
  - "langConfig flows through entire call chain from main() to batchTranslateSegments()"

duration: 6min
completed: 2026-02-18
---

# Phase 51 Plan 01: Translation Infrastructure Summary

**Single translate-notion.js script parameterized with --lang (en|fr), FR glossary with 38 immigration terms, and language-specific translation index files preventing cross-language data corruption**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-18T16:34:24Z
- **Completed:** 2026-02-18T16:40:32Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Refactored translate-notion.js to accept --lang parameter (en default for backward compat)
- Added getLangConfig() factory function routing lang code to DB env vars, index path, glossary key, language name
- Added migrateTranslationIndex() to rename old translation-index.json to translation-index-en.json on first non-dry-run
- Renamed EN-specific functions to generic names (ensureTargetDatabase, writeTargetPage, findTargetPage, verifyTargetPage)
- Added termsFr to translation-glossary.json with 38 French immigration/legal term mappings
- Added translate:fr and translate:fr:dry npm scripts to package.json
- Both npm run translate:dry (EN) and npm run translate:fr:dry (FR) produce correct output

## Task Commits

Each task was committed atomically:

1. **Task 1: Parameterize translate-notion.js for multi-language support** - `1fa516e` (feat)
2. **Task 2: Create FR glossary and add npm scripts** - `20bc021` (feat)

**Plan metadata:** (committed with docs commit below)

## Files Created/Modified
- `scripts/translate-notion.js` - Refactored to support --lang parameter; all EN-specific logic replaced with langConfig-driven dispatch
- `scripts/translation-glossary.json` - Added termsFr with 38 FR terms; meta updated to v1.1
- `package.json` - Added translate:fr and translate:fr:dry scripts

## Decisions Made
- **Keep 'terms' key as-is** — Renaming to 'termsEn' would break the existing EN pipeline; FR uses separate 'termsFr' key
- **Translation index per language** — translation-index-en.json and translation-index-fr.json kept separate to prevent pages from one language overwriting another
- **Auto-migration on non-dry-run** — The old translation-index.json is renamed to translation-index-en.json only when doing real translation work (not dry-run) to avoid accidental side effects during development

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all verifications passed on first attempt.

## User Setup Required

None - no external service configuration required. FR database will be configured in Phase 52.

## Next Phase Readiness
- Translation infrastructure is complete. Phase 52 can now run `npm run translate:fr` to populate the FR Notion database.
- To add a new language in future (e.g., ES), add an entry to getLangConfig() in translate-notion.js and add a termsEs key to translation-glossary.json.
- The old .notion-cache/translation-index.json will be automatically renamed to translation-index-en.json on first real (non-dry-run) execution.

---
*Phase: 51-translation-infrastructure*
*Completed: 2026-02-18*
